// Reads the exercise and muscle-group data straight out of site/src/*.js, so the SEO pages never drift from the 3D app.
// The sources are browser code (three.js, DOM): they run here in a sandbox where every unknown name is a harmless stub,
// and only the plain data (names, steps, mistakes, plans) is kept.
import vm from 'node:vm';
import {readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';

export function extract(srcDir) {
  const files = readdirSync(srcDir).filter(f => f.endsWith('.js') && !/^(9|40)/.test(f)).sort(); // skip boot, probes, debug
  const srcs = files.map(f => readFileSync(join(srcDir, f), 'utf8'));
  const stub = () => new Proxy(function () {}, {
    get: (t, k) => k === Symbol.toPrimitive ? () => 0 : k === Symbol.iterator ? function* () {} : k === 'then' ? undefined : k === 'length' ? 0 : stub(),
    set: () => true, apply: () => stub(), construct: () => stub(), has: () => true});
  const builtin = new Set(['console', 'Math', 'Object', 'Array', 'JSON', 'Number', 'String', 'Boolean', 'Symbol', 'Map', 'Set', 'WeakMap', 'Promise',
    'Date', 'RegExp', 'Error', 'Infinity', 'NaN', 'parseFloat', 'parseInt', 'isNaN', 'Float32Array', 'Uint8Array', 'Uint16Array', 'Int32Array',
    'Uint32Array', 'Float64Array', 'Int16Array', 'Int8Array', 'Uint8ClampedArray', 'ArrayBuffer', 'Proxy', 'Reflect', 'undefined', '__out']);
  const declared = new Set();
  for (const s of srcs) for (const m of s.matchAll(/(?:^|[;{}\s,(])(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) declared.add(m[1]);
  const globals = new Proxy(Object.create(null), {
    has: (t, k) => typeof k === 'string' && !declared.has(k) && !builtin.has(k),
    get: (t, k) => k in t ? t[k] : k === Symbol.unscopables ? undefined : (t[k] = stub()),
    set: (t, k, v) => (t[k] = v, true)});
  const ctx = vm.createContext({__G: globals, __out: {}});
  const src = files.map((f, i) => `// FILE ${f}\n` + srcs[i].replace(/^import .*$/mg, '')).join('\n');
  vm.runInContext(`with(__G){ ${src}\n;__out.EXS=EXS;__out.GROUPS=GROUPS; }`, ctx, {filename: 'site-src'});
  const {EXS, GROUPS} = ctx.__out;
  const str = v => typeof v === 'string' ? v : '';
  const strs = a => Array.isArray(a) ? a.filter(x => typeof x === 'string') : [];
  const exercises = Object.values(EXS).map(e => ({
    key: e.key, name: str(e.name), group: str(e.group), part: str(e.part), eq: str(e.eq), focus: str(e.focus) || str(e.part), quip: str(e.quip), kind: str(e.kind),
    beginner: str(e.beginner),
    steps: (Array.isArray(e.steps) ? e.steps : []).map((s, i) => ({title: str(Array.isArray(s) ? s[0] : s), note: str(Array.isArray(s) ? s[1] : ''), text: str((e.stepText || [])[i])})),
    how: strs(e.how),
    muscles: (Array.isArray(e.labels) ? e.labels : []).map(l => ({name: str(l[0]), main: l[2] === 'm'})).filter(l => l.name),
    mistakes: Object.entries(e.forms || {}).filter(([k]) => k !== 'good').map(([k, F]) => ({key: k,
      title: str(F.tag || F.btn), short: str(F.short), wrong: str(F.wrong), now: str(F.now), later: str(F.later), fix: str(F.fix)})).filter(m => m.title),
  })).filter(e => e.name && e.group);
  const groups = Object.values(GROUPS).map(g => ({key: g.key, name: str(g.name), sub: str(g.sub), line: str(g.line), parts: strs(g.parts),
    areaOf: g.areaOf || {},
    plans: (g.plans || []).map(p => ({name: str(p.name), who: str(p.who), why: str(p.why), items: (p.items || []).map(([k, sets, rest]) => ({key: k, sets: str(sets), rest: str(rest)}))}))}));
  return {exercises, groups};
}
