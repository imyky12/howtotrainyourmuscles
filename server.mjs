// Muscle House server: serves site/ and the AI coach endpoints.
//   Cerebras (fast inference) writes everything the coach says: plans, answers, greetings.
//   OpenAI Decisions (optional) makes the bounded calls: which mistake matches, is it a medical red flag, which body area.
// Keys come from .env (CEREBRAS_API_KEY, OPENAI_API_KEY) and never reach the browser.
// Run: node server.mjs   (then open http://localhost:8767)
import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {join, normalize, extname, dirname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url)), SITE = join(ROOT, 'site');
try { process.loadEnvFile(join(ROOT, '.env')); } catch {}
const PORT = +process.env.PORT || 8767;
const CB = {key: process.env.CEREBRAS_API_KEY, model: process.env.CEREBRAS_MODEL || 'gpt-oss-120b',
  url: process.env.CEREBRAS_URL || 'https://api.cerebras.ai/v1/chat/completions', effort: process.env.CEREBRAS_REASONING ?? 'low'};
const OD = {key: process.env.OPENAI_API_KEY, model: process.env.OPENAI_DECISIONS_MODEL || 'gpt-6-luna',
  url: process.env.OPENAI_DECISIONS_URL || 'https://api.openai.com/v1/decisions', off: process.env.OPENAI_DECISIONS === 'off', dead: false};
const AREAS = ['none', 'knee', 'lower_back', 'shoulder', 'elbow', 'wrist', 'neck', 'hip', 'ankle'];

// ---------------------------------------------------------------- upstream calls
const post1 = (url, key, body, ms) => fetch(url, {method: 'POST', signal: AbortSignal.timeout(ms),
  headers: {'content-type': 'application/json', authorization: 'Bearer ' + key}, body: JSON.stringify(body)});
// a network failure (dropped connection, DNS hiccup, connect timeout; not our own request timeout) is retried up to twice,
// as long as the whole thing stays inside about 15 s
async function post(url, key, body, ms) {
  const t0 = Date.now();
  for (let i = 0; ; i++) {
    try { return await post1(url, key, body, ms); }
    catch (e) {
      if (e.name === 'TimeoutError' || e.name === 'AbortError' || i >= 2 || Date.now() - t0 > 15000) throw e;
      console.warn(`[net] ${new URL(url).host}: ${e.cause?.code || e.message}, retry ${i + 1}`);
      await new Promise(r => setTimeout(r, 400 * (i + 1)));
    }
  }
}
// upstream error text can echo a (partly masked) key: never let it reach the log or the browser
const redact = s => String(s).replace(/\b(c?sk|sess|key)[-_][A-Za-z0-9_\-*.]{6,}/gi, '[key]');
const fail = (status, msg) => Object.assign(new Error(redact(msg)), {status});

// one Cerebras chat completion whose answer must match `schema` (strict structured output)
async function cerebras(tag, system, user, schema, max = 900) {
  if (!CB.key) throw fail(503, 'CEREBRAS_API_KEY is not set');
  const body = {model: CB.model, max_completion_tokens: max, temperature: 0.4,
    messages: [{role: 'system', content: system}, {role: 'user', content: user}],
    response_format: {type: 'json_schema', json_schema: {name: tag, strict: true, schema}}};
  if (CB.effort && /gpt-oss/.test(CB.model)) body.reasoning_effort = CB.effort;
  const t0 = performance.now();
  let r = await post(CB.url, CB.key, body, 25000);
  if (r.status === 400 && body.reasoning_effort) { delete body.reasoning_effort; r = await post(CB.url, CB.key, body, 25000); }
  // over the requests-per-minute limit: wait as long as Cerebras asks (or 1.5 s, then 3 s) and try again
  for (let i = 0; r.status === 429 && i < 2; i++) {
    const rl = ['x-ratelimit-limit-requests-minute', 'x-ratelimit-remaining-requests-minute', 'x-ratelimit-reset-requests-minute', 'retry-after']
      .map(h => r.headers.get(h) && `${h.replace('x-ratelimit-', '')}=${r.headers.get(h)}`).filter(Boolean).join(' ');
    const wait = Math.min(8, +r.headers.get('retry-after') || 1.5 * (i + 1));
    console.warn(`[cerebras] ${tag} rate-limited (${rl || 'no limit headers'}), retrying in ${wait} s`);
    await r.text(); await new Promise(res => setTimeout(res, wait * 1000));
    r = await post(CB.url, CB.key, body, 25000);
  }
  if (!r.ok) throw fail(502, `Cerebras ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json(), ms = performance.now() - t0;
  let out; try { out = JSON.parse(j.choices?.[0]?.message?.content || ''); } catch { throw fail(502, 'Cerebras returned no JSON'); }
  const tokens = j.usage?.completion_tokens || 0, gen = j.time_info?.completion_time || ms / 1000;
  // ms: the round trip from this server; modelMs: Cerebras's own time for the request (queue + prompt + generation)
  const meta = {model: j.model || CB.model, ms: Math.round(ms), tokens, tps: tokens && gen ? Math.round(tokens / gen) : null,
    modelMs: j.time_info?.total_time ? Math.round(j.time_info.total_time * 1000) : null};
  console.log(`[cerebras] ${tag} ${meta.ms} ms round trip${meta.modelMs ? ', ' + meta.modelMs + ' ms at Cerebras' : ''}, ${tokens} tokens${meta.tps ? ', ' + meta.tps + ' tok/s' : ''}`);
  return {out, meta};
}

// OpenAI Decisions: bounded questions (choice / predicate) answered with probabilities. Returns null if not available.
async function decide(input, questions) {
  if (!OD.key || OD.off || OD.dead) return null;
  const t0 = performance.now();
  try {
    const r = await post(OD.url, OD.key, {model: OD.model, input, questions}, +process.env.OPENAI_DECISIONS_TIMEOUT_MS || 4000);
    if (!r.ok) {
      console.warn('[decisions]', r.status, redact((await r.text()).slice(0, 300)));
      if ([401, 403, 404].includes(r.status)) { OD.dead = true; console.warn('[decisions] turned off for this run; Cerebras makes the calls instead'); }
      return null;
    }
    const j = await r.json(), by = {};
    for (const a of j.answers || []) if (a && a.name && a.type !== 'refusal') by[a.name] = a;
    const ms = Math.round(performance.now() - t0);
    console.log(`[decisions] ${ms} ms`);
    return {by, ms, model: OD.model};
  } catch (e) { console.warn('[decisions]', redact(e.message)); return null; }
}
// a choice answer's distribution as [{v, p}], highest first (accepts an array of {value, probability} or a {value: p} map)
function probsOf(a) {
  const p = a && a.probabilities; if (!p) return [];
  const list = Array.isArray(p) ? p.map(x => ({v: x.value ?? x.choice ?? x.label, p: +(x.probability ?? x.p ?? 0)}))
    : Object.entries(p).map(([v, q]) => ({v, p: +q}));
  return list.filter(x => x.v !== undefined).sort((a, b) => b.p - a.p);
}

// ---------------------------------------------------------------- request helpers
const str = (x, n) => String(x ?? '').slice(0, n);
const KEY = /^[A-Za-z0-9_]{1,40}$/;
function catalogOf(b) {
  const exercises = (Array.isArray(b.exercises) ? b.exercises : []).slice(0, 120).filter(e => e && KEY.test(e.k))
    .map(e => ({k: e.k, name: str(e.name, 60), group: str(e.group, 30), part: str(e.part, 60), eq: str(e.eq, 30)}));
  const groups = (Array.isArray(b.groups) ? b.groups : []).slice(0, 20).filter(g => g && KEY.test(g.k))
    .map(g => ({k: g.k, name: str(g.name, 30), parts: (g.parts || []).slice(0, 8).map(p => str(p, 40))}));
  if (!exercises.length || !groups.length) throw fail(400, 'catalog missing');
  return {exercises, groups};
}
const catalogText = C => C.groups.map(g => `${g.k} (${g.name}: ${g.parts.join(', ')}):\n` +
  C.exercises.filter(e => e.group === g.k).map(e => `  ${e.k}: ${e.name}, ${e.eq}, ${e.part}`).join('\n')).join('\n');
const COACH = 'You are Coach Rana, the strength coach in Muscle House, a 3D gym app. You are warm, direct and brief, and you speak like a real coach on the gym floor.';

// ---------------------------------------------------------------- endpoints
async function apiPlan(b) {
  const C = catalogOf(b), text = str(b.text, 600), memory = str(b.memory, 3000);
  const exKeys = C.exercises.map(e => e.k), gKeys = C.groups.map(g => g.k);
  const schema = {type: 'object', additionalProperties: false, required: ['say', 'name', 'why', 'minutes', 'group', 'items', 'remember', 'pain_area'],
    properties: {say: {type: 'string'}, name: {type: 'string'}, why: {type: 'string'}, minutes: {type: 'integer'},
      group: {type: 'string', enum: gKeys},
      items: {type: 'array', items: {type: 'object', additionalProperties: false, required: ['ex', 'sets', 'rest'],
        properties: {ex: {type: 'string', enum: exKeys}, sets: {type: 'string'}, rest: {type: 'string'}}}},
      remember: {type: 'string'}, pain_area: {type: 'string', enum: AREAS}}};
  const system = `${COACH}
Build today's workout from the catalog only (use the exercise keys exactly).
- group: the muscle group the day focuses on. items: 3 to 7 exercises, heaviest compound lifts first, isolation last.
- Respect what the lifter says and what you remember about them. Around a sore or injured area, leave out the exercises that load it hard (sore knee: no back squat or Bulgarian split squat, prefer hip hinges, hip thrusts and machines; sore lower back: no deadlift or barbell row, prefer supported machines and cables; sore shoulder: no overhead pressing or dips).
- Fit the time (about 8 to 10 minutes per exercise including rest), their equipment and their level.
- sets like "3 × 8–12", rest like "90 s" or "2 min".
- say: what you tell them out loud, 1 or 2 sentences, at most 35 words, no markdown. Mention any change you made because of what they said or what you remember.
- why: one sentence on how the plan covers the muscle. name: 2 to 4 words. minutes: the plan's length.
- remember: one short new fact about the lifter worth keeping for next time (pain or injury, goal, level, equipment, time), in third person, e.g. "Left knee gets sore on deep squats"; "" if nothing new.
- pain_area: the body area they say hurts, or "none".`;
  const user = `Catalog:\n${catalogText(C)}\n\nWhat you remember about the lifter:\n${memory || 'Nothing yet: first visit.'}\n\nThe lifter says: "${text}"`;
  const {out, meta} = await cerebras('plan', system, user, schema, 1400);
  const seen = new Set(), items = (out.items || []).filter(i => exKeys.includes(i.ex) && !seen.has(i.ex) && seen.add(i.ex)).slice(0, 7);
  if (!items.length || !gKeys.includes(out.group)) throw fail(502, 'the plan came back empty');
  return {...out, items, t: {cerebras: meta}};
}

async function apiAsk(b) {
  const C = catalogOf(b), text = str(b.text, 600), memory = str(b.memory, 3000), ex = b.ex || {};
  if (!KEY.test(ex.k || '')) throw fail(400, 'exercise missing');
  const mistakes = (ex.mistakes || []).slice(0, 8).filter(m => m && KEY.test(m.k))
    .map(m => ({k: m.k, btn: str(m.btn, 60), short: str(m.short, 120), wrong: str(m.wrong, 300), now: str(m.now, 200), later: str(m.later, 200), fix: str(m.fix, 160)}));
  const mk = mistakes.map(m => m.k), exKeys = C.exercises.filter(e => e.k !== ex.k).map(e => e.k);
  const exName = str(ex.name, 60);
  const mistakeText = m => `${m.btn}: ${m.wrong} Right away: ${m.now} Over time: ${m.later}`;

  // 1. the bounded calls (OpenAI Decisions), if available. The mistake question has no "none": a separate predicate says
  // whether the message is a complaint at all, and only then does the most likely cause go on screen.
  const dec = await decide(`Exercise: ${exName}\nThe lifter says: "${text}"`, [
    {type: 'predicate', name: 'complaint', instructions: 'The lifter describes pain, an ache, soreness, strain, discomfort, or something that feels or goes wrong while doing this exercise (rather than only asking a general question).'},
    {type: 'choice', name: 'mistake', instructions: `Suppose what the lifter describes comes from one of these common form mistakes on the ${exName}. Which one is the most likely cause?`,
      choices: mistakes.map(m => ({value: m.k, description: mistakeText(m)}))},
    {type: 'predicate', name: 'see_doctor', instructions: 'The lifter describes sharp or sudden pain, a pop, numbness, tingling, swelling, pain that lasts after training or keeps getting worse, or an injury: something a doctor or physiotherapist should check rather than a form tweak.'},
    {type: 'choice', name: 'pain_area', instructions: 'Which body area does the lifter say hurts or feels strained? Choose "none" if they mention no discomfort.', choices: AREAS.map(a => ({value: a}))}]);
  let dMistake = null, dMistakeP = 0, probs = [], dDoctor = null, dArea = null, dComplaint = null;
  if (dec) {
    const c = dec.by.complaint; if (c && typeof c.probability === 'number') dComplaint = c.probability;
    const sd = dec.by.see_doctor; if (sd && typeof sd.probability === 'number') dDoctor = sd.probability;
    const pa = dec.by.pain_area; if (pa && AREAS.includes(pa.choice)) dArea = pa.choice;
    const a = dec.by.mistake, all = probsOf(a).filter(p => mk.includes(p.v));
    if ((dComplaint ?? 0) >= 0.5 && !((dDoctor ?? 0) >= 0.5) && a && mk.includes(a.choice)) {
      dMistake = a.choice; dMistakeP = all.find(p => p.v === a.choice)?.p ?? a.confidence ?? 0; probs = all;
    }
  }

  // 2. the coach's words (Cerebras); without Decisions, Cerebras makes the bounded calls too
  const props = {say: {type: 'string'}, swap_to: {type: 'string', enum: [...exKeys, 'none']}, remember: {type: 'string'}};
  if (!dec) Object.assign(props, {mistake: {type: 'string', enum: [...mk, 'none']}, see_doctor: {type: 'boolean'}, pain_area: {type: 'string', enum: AREAS}});
  const schema = {type: 'object', additionalProperties: false, required: Object.keys(props), properties: props};
  const system = `${COACH}
The lifter is at the ${exName} and tells you something between reps.
- say: your spoken answer, 1 or 2 short sentences, at most 40 words, plain words, no markdown or lists. Be specific to this exercise: use its cues and fixes.
- When there is a likely form cause, name it in plain words, say how it can cause what they feel, and give its fix; the app plays that mistake next to the right way, so tell them to watch the split screen. Lighter weight is often part of the fix.
- Ordinary aches and soreness are training problems, not emergencies: do not send them to a doctor for those; at most, if it keeps hurting over the next days, get it looked at.
- Red flags (sharp or sudden pain, a pop, numbness, tingling, swelling, pain that lingers or gets worse): tell them to stop this exercise today and have it checked by a doctor or physio, and skip the form talk. Never diagnose, never tell them to push through pain.
- Only mention the split screen when a form cause is shown.
- Use what you remember about them when it matters.
- swap_to: if they ask for an alternative, or should skip this exercise today, the best replacement from the catalog that spares the sore area; otherwise "none".
- remember: one short new fact about the lifter worth keeping for future sessions (sore area, injury, goal, level, preference), third person, e.g. "Lower back gets sore on deadlifts"; "" if nothing new or already remembered.` +
    (dec ? '' : `
- mistake: if they describe pain, discomfort or a problem during the lift (and no red flag), the key of the most likely form cause; "none" for general questions. If you choose one, it is shown on the split screen. see_doctor: true only for the red flags above. pain_area: the area they say hurts, or "none".`);
  const decided = !dec ? '' : '\nA judgment model already read the message: ' + (
    (dDoctor ?? 0) >= 0.5 ? `medical red flag (${Math.round(dDoctor * 100)}%): tell them to stop and get it checked; nothing is shown on screen.`
    : dMistake ? `most likely form cause = ${dMistake} "${mistakes.find(m => m.k === dMistake).btn}" (${Math.round(dMistakeP * 100)}%); the app is now playing it next to the right way. No red flag.`
    : 'not a pain or form complaint; nothing new is shown on screen, so do not mention the split screen.') + (dArea && dArea !== 'none' ? ` Area: ${dArea.replace('_', ' ')}.` : '');
  const user = `Exercise: ${exName} (${str(ex.part, 60)}, ${str(ex.eq, 30)})
How it's done: ${(ex.steps || []).slice(0, 4).map((s, i) => `${i + 1}. ${str(s, 240)}`).join(' ')}
Its common mistakes:
${mistakes.map(m => `- ${m.k} = ${mistakeText(m)} Fix: ${m.fix}`).join('\n')}
What you remember about the lifter:
${memory || 'Nothing yet: first visit.'}
Catalog for swaps:
${catalogText(C)}${decided}

The lifter says: "${text}"`;
  const {out, meta} = await cerebras('ask', system, user, schema, 1000);
  const pick = (v, list) => (v && v !== 'none' && list.includes(v) ? v : null);
  const seeDoctor = dec && dDoctor !== null ? dDoctor >= 0.5 : !!out.see_doctor;
  return {say: str(out.say, 600),
    mistake: seeDoctor ? null : dec ? dMistake : pick(out.mistake, mk),
    seeDoctor, pain_area: (dec ? dArea : out.pain_area) || 'none',
    swap: seeDoctor ? null : pick(out.swap_to, exKeys), remember: str(out.remember, 200), // a red flag means stop and get checked, not another exercise
    probs: probs.slice(0, 4), complaint: dComplaint, t: {cerebras: meta, decisions: dec ? {ms: dec.ms, model: dec.model} : null}};
}

async function apiGreet(b) {
  const memory = str(b.memory, 3000);
  const schema = {type: 'object', additionalProperties: false, required: ['say'], properties: {say: {type: 'string'}}};
  const system = `${COACH}
A lifter you have trained before walks into the gym at night. say: 1 or 2 spoken sentences, at most 30 words, no markdown: welcome them back, mention one specific thing you remember (their last session or a sore area, and when), and ask what they are training today.`;
  const {out, meta} = await cerebras('greet', system, `What you remember about the lifter:\n${memory}`, schema, 500);
  return {say: str(out.say, 300), t: {cerebras: meta}};
}

// Check my form: the camera measured a set in the browser (the video stays there); write the coach's verdict on the numbers
async function apiForm(b) {
  const ex = b.ex || {}, name = str(ex.name, 60) || 'the exercise', memory = str(b.memory, 3000);
  const num = (x, lo, hi) => (typeof x === 'number' && isFinite(x) ? Math.max(lo, Math.min(hi, x)) : null);
  const mistakes = (Array.isArray(b.mistakes) ? b.mistakes : []).slice(0, 8).map(m => ({k: str(m.k, 40), name: str(m.name, 60), fix: str(m.fix, 160)}));
  const keys = new Set(mistakes.map(m => m.k));
  // per rep: up to 10 named measurements (numbers or null) and the mistakes the camera flagged; the legend says what they mean
  const reps = (Array.isArray(b.reps) ? b.reps : []).slice(0, 40).map((r, i) => {
    const m = {}, src = r && typeof r.m === 'object' && r.m ? r.m : {};
    for (const [k, v] of Object.entries(src).slice(0, 10)) if (/^[a-z_]{1,32}$/.test(k)) m[k] = v === null ? null : num(v, -999, 999);
    return {n: i + 1, ...m, flags: (Array.isArray(r && r.flags) ? r.flags : []).filter(k => keys.has(k))};
  });
  const legend = str(b.legend, 900);
  if (!reps.length) throw fail(400, 'no reps');
  const schema = {type: 'object', additionalProperties: false, required: ['say', 'focus', 'remember'],
    properties: {say: {type: 'string'}, focus: {type: 'string'}, remember: {type: 'string'}}};
  const system = `${COACH}
The lifter just did a set of ${name} in front of their camera, and a pose tracker measured every rep. What the measurements mean: ${legend || 'see the names'}. flags = the mistakes the tracker found (keys from the mistake list).
say: 2 spoken sentences, at most 40 words, plain words for speech (no markdown, no lists, no negative numbers: say "6 cm below parallel", not "-6 cm"). First what went well, with one real number from the set. Then the single most important fix for the next set, built on that mistake's fix from the list; do not invent other cues (and in a squat the weight stays over the middle of the foot, never the toes). If what you remember mentions pain that this mistake can cause, link them in a few words. If every rep was clean, say so and how to progress.
focus: the one cue for the next set, at most 6 words.
remember: a note for your memory of this lifter, at most 18 words, with the numbers in plain words, no negative numbers (for example "Back squat camera check: 4 of 6 reps clean; knees caved on 2; depth 6 cm below parallel").`;
  const user = JSON.stringify({exercise: name, mistakes, reps, memory: memory || 'nothing yet'});
  const {out, meta} = await cerebras('form', system, user, schema, 700);
  return {say: str(out.say, 400), focus: str(out.focus, 80), remember: str(out.remember, 200), t: {cerebras: meta}};
}

// ---------------------------------------------------------------- http
const TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.glb': 'model/gltf-binary', '.md': 'text/markdown; charset=utf-8'};
const API = {'/api/plan': apiPlan, '/api/ask': apiAsk, '/api/greet': apiGreet, '/api/form': apiForm};
// static files: gzipped once and kept (the three people are ~5 MB each, and a phone through a tunnel felt it), with an ETag so a
// reload asks "changed?" and gets a 304 instead of the whole file again
const FILES = new Map();
async function sendFile(req, res, file) {
  const st = await stat(file); if (!st.isFile()) throw Object.assign(new Error('not a file'), {code: 'EISDIR'});
  let f = FILES.get(file);
  if (!f || f.mtime !== st.mtimeMs) {
    const raw = await readFile(file);
    f = {mtime: st.mtimeMs, raw, gz: null, etag: '"' + createHash('sha1').update(raw).digest('base64url').slice(0, 20) + '"'};
    FILES.set(file, f);
  }
  const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
  const head = {'content-type': type, 'cache-control': 'no-cache', etag: f.etag, vary: 'accept-encoding'};
  if (req.headers['if-none-match'] === f.etag) { res.writeHead(304, head); return res.end(); }
  const zip = /text|javascript|json|svg/.test(type) && f.raw.length > 1024 && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  if (zip && !f.gz) f.gz = gzipSync(f.raw, {level: 6});
  res.writeHead(200, zip ? {...head, 'content-encoding': 'gzip'} : head);
  res.end(zip ? f.gz : f.raw);
}
function send(res, status, body, type = 'application/json') {
  res.writeHead(status, {'content-type': type, 'cache-control': 'no-cache'});
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}
async function readJson(req) {
  let n = 0; const parts = [];
  for await (const c of req) { n += c.length; if (n > 256e3) throw fail(413, 'request too large'); parts.push(c); }
  try { return JSON.parse(Buffer.concat(parts).toString('utf8') || '{}'); } catch { throw fail(400, 'bad JSON'); }
}
createServer(async (req, res) => {
  // a malformed path (e.g. "//") makes new URL() throw: answer 400 instead of taking the whole server down
  let url; try { url = new URL(req.url, 'http://localhost'); } catch { return send(res, 400, 'bad request', 'text/plain'); }
  try {
    if (url.pathname === '/api/status')
      return send(res, 200, {cerebras: !!CB.key, model: CB.model, decisions: !!(OD.key && !OD.off && !OD.dead), decisionsModel: OD.model});
    if (API[url.pathname]) {
      if (req.method !== 'POST') return send(res, 405, {error: 'POST only'});
      return send(res, 200, await API[url.pathname](await readJson(req)));
    }
    let p = normalize(decodeURIComponent(url.pathname)).replace(/^[/\\]+/, '');
    if (!p || p.endsWith(sep) || p.endsWith('/')) p = join(p, 'index.html');
    const file = join(SITE, p);
    if (!file.startsWith(SITE + sep)) return send(res, 403, 'forbidden', 'text/plain');
    return sendFile(req, res, file);
  } catch (e) {
    if (e.code === 'ENOENT' || e.code === 'EISDIR') return send(res, 404, 'not found', 'text/plain');
    if (!url.pathname.startsWith('/api/')) return send(res, 500, 'server error', 'text/plain');
    console.warn('[api]', url.pathname, e.message);
    send(res, e.status || 500, {error: e.message});
  }
}).listen(PORT, () => {
  console.log(`Muscle House on http://localhost:${PORT}`);
  console.log(CB.key ? `  coach: Cerebras ${CB.model}` : '  coach: off (set CEREBRAS_API_KEY in .env)');
  console.log(OD.key && !OD.off ? `  decisions: OpenAI ${OD.model}` : '  decisions: Cerebras makes the calls (set OPENAI_API_KEY to use OpenAI Decisions)');
  // the first Decisions call of a run is slow (connection and model warm-up): make it now, not on the first question
  decide('Warm-up.', [{type: 'predicate', name: 'warm', instructions: 'The text says warm-up.'}]);
});
