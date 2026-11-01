
// ---------------------------------------------------------------- AI coach and the coach's memory
// Cerebras writes what the coach says (a plan from one sentence, answers at the station, the welcome back); OpenAI Decisions,
// when the server has a key, makes the bounded calls (which mistake matches, medical red flag, which body area).
// Memory lives in this browser (localStorage): the sessions you trained and what you told the coach.
// Needs server.mjs (node server.mjs). With a plain static server /api/status fails and none of this shows.
const AI={on:false,decisions:false,model:'',hello:null,busy:false};
const AREA_TXT={knee:'knee',lower_back:'lower back',shoulder:'shoulder',elbow:'elbow',wrist:'wrist',neck:'neck',hip:'hip',ankle:'ankle'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

// ---- memory
const MEM_KEY='muscleHouse.memory.v1';
function memLoad(){try{const m=JSON.parse(localStorage.getItem(MEM_KEY)||'null');if(m&&m.v===1&&Array.isArray(m.sessions)&&Array.isArray(m.notes))return m;}catch(e){}return {v:1,sessions:[],notes:[]};}
function memSave(m){try{localStorage.setItem(MEM_KEY,JSON.stringify(m));}catch(e){}renderMem();}
function memNote(text,o={}){text=String(text||'').trim().replace(/\.$/,'');if(!text)return;const m=memLoad();
  if(m.notes.some(n=>n.text.toLowerCase()===text.toLowerCase()))return;m.notes.push({t:Date.now(),text,area:o.area&&o.area!=='none'?o.area:null,ex:o.ex||null});m.notes=m.notes.slice(-12);memSave(m);}
// an exercise started: add it to today's session (a new session after 3 hours, or for another muscle group)
function memExercise(k){if(TEST||!SES.group)return;const m=memLoad(),now=Date.now();let s=m.sessions[m.sessions.length-1];
  if(!s||now-(s.last||s.t)>3*3600e3||s.group!==SES.group.key){s={t:now,group:SES.group.key,plan:SES.plan?SES.plan.name:'',done:[]};m.sessions.push(s);}
  s.last=now;if(SES.plan)s.plan=SES.plan.name;if(!s.done.includes(k))s.done.push(k);m.sessions=m.sessions.slice(-12);memSave(m);}
function daysAgo(t){const a=new Date(t),b=new Date();a.setHours(0,0,0,0);b.setHours(0,0,0,0);return Math.round((b-a)/864e5);}
const weekday=t=>new Date(t).toLocaleDateString('en-GB',{weekday:'long'});
function whenTxt(t){const d=daysAgo(t);return d<=0?'today':d===1?'yesterday':d<7?'on '+weekday(t):d+' days ago';}
// what the coach knows, as plain text for the prompts (days are worked out here: the model has no clock)
function memSummary(){const m=memLoad();const L=[`Today is ${weekday(Date.now())}.`];
  for(const s of m.sessions.slice(-5)){const g=GROUPS[s.group];L.push(`- Trained ${g?g.name.toLowerCase():s.group} ${whenTxt(s.t)} (plan "${s.plan}"): ${s.done.map(k=>EXS[k]?EXS[k].name:k).join(', ')||'nothing finished'}.`);}
  for(const n of m.notes.slice(-8))L.push(`- Told you ${whenTxt(n.t)}${n.ex&&EXS[n.ex]?' at the '+EXS[n.ex].name.toLowerCase():''}: ${n.text}.`);
  return L.length>1?L.join('\n'):'';}
// the line Coach Rana opens with (AI.hello is the Cerebras version, fetched while the lifter walks in)
function coachHello(){const def='Evening! Gym’s all ours. What are we training today?';if(AI.hello)return AI.hello;const m=memLoad();const s=m.sessions[m.sessions.length-1];if(!s)return def;
  const g=GROUPS[s.group],n=m.notes[m.notes.length-1];
  return `Welcome back! Last time was ${g?g.name.toLowerCase():s.group} day, ${whenTxt(s.t)}.`+(n?` You told me: ${n.text.charAt(0).toLowerCase()+n.text.slice(1)}.`:'')+' What are we training today?';}

// ---- talking to the server
async function aiPost(path,body){const r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||('HTTP '+r.status));return j;}
function aiCatalog(){return {groups:Object.values(GROUPS).map(g=>({k:g.key,name:g.name,parts:g.parts})),
  exercises:Object.values(EXS).map(e=>({k:e.key,name:e.name,group:e.group,part:e.part,eq:e.eq}))};}
// generation speed and Cerebras's own time first; the round trip (mostly network) last
function speedTag(t){if(!t||!t.cerebras)return '';const c=t.cerebras,s=ms=>(ms/1000).toFixed(2)+' s';
  return `⚡ Cerebras ${c.model}`+(c.tps?` · ${c.tps.toLocaleString('en-US')} tokens/s`:'')+(c.modelMs?` · model ${s(c.modelMs)}`:'')+` · round trip ${s(c.ms)}`+(t.decisions?` · OpenAI Decisions ${s(t.decisions.ms)}`:'');}

// ---- voice: speak to the coach (Chrome's speech recognition), hear the answers (speech synthesis)
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let voiceOut=(()=>{try{return localStorage.getItem('muscleHouse.voice')!=='off';}catch(e){return true;}})();
function speak(t){if(!voiceOut||!t||!window.speechSynthesis)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=1.04;
  const vs=speechSynthesis.getVoices();const v=vs.find(v=>/en[-_]IN/i.test(v.lang))||vs.find(v=>/en[-_]GB/i.test(v.lang));if(v)u.voice=v;speechSynthesis.speak(u);}catch(e){}}
function listen(input,btn,done){if(!SR)return;if(btn._rec){btn._rec.stop();return;}const r=new SR();r.lang=navigator.language||'en-US';r.interimResults=true;
  btn._rec=r;btn.classList.add('on');input.value='';input.dispatchEvent(new Event('input'));input.placeholder='Listening…';
  r.onresult=e=>{let t='';for(const x of e.results)t+=x[0].transcript;input.value=t;input.dispatchEvent(new Event('input'));};
  r.onend=()=>{btn._rec=null;btn.classList.remove('on');input.placeholder=input.dataset.ph||'';if(input.value.trim())done(input.value.trim());};
  r.onerror=()=>{btn._rec=null;btn.classList.remove('on');input.placeholder=input.dataset.ph||'';};try{r.start();}catch(e){btn._rec=null;btn.classList.remove('on');}}

// ---- 1. a plan from one sentence (the "what are we training?" question)
// "Plan it" only works once there is something to plan from (typed or said), and not while a plan is on its way
function syncPlanBtn(){$('#aiGo').disabled=AI.busy||!$('#aiIn').value.trim();}
$('#aiIn').addEventListener('input',syncPlanBtn);
async function planFromText(text){if(AI.busy||!text)return;AI.busy=true;syncPlanBtn();say('Give me a second…');
  try{const res=await aiPost('/api/plan',{text,memory:memSummary(),...aiCatalog()});
    if(res.remember)memNote(res.remember,{area:res.pain_area});
    useAIPlan(res);speak(res.say);}
  catch(e){console.warn('[coach]',e);say('I couldn’t reach my notes just now. Pick a muscle below and we’ll go.');}
  finally{AI.busy=false;syncPlanBtn();}}
// the plan goes in as the group's first tab ("For you"), next to the standard plans
function useAIPlan(res){const base=GROUPS[res.group];if(!base)return;
  const plan={name:res.name||'For you',who:'Made for you · about '+(res.minutes||45)+' min',why:[res.say,res.why].filter(Boolean).join(' '),items:res.items.map(i=>[i.ex,i.sets,i.rest]),ai:speedTag(res.t)};
  SES.group={...base,plans:[plan,...base.plans]};SES.plan=plan;SES.i=0;SES.done=new Set();
  chipsEl.hidden=true;bubble.classList.remove('ask');say('',false);$('#skip').hidden=true;$('#aiIn').value='';setFlow('plan');showPlan(true);}
$('#aiAsk').addEventListener('submit',e=>{e.preventDefault();planFromText($('#aiIn').value.trim());});
$('#aiMic').addEventListener('click',()=>listen($('#aiIn'),$('#aiMic'),planFromText));

// ---- 2. ask the coach at the station
function exBrief(e){const F=e.forms,ms=Object.keys(F).filter(k=>k!=='good');
  return {k:e.key,name:e.name,part:e.part,eq:e.eq,group:e.group,steps:e.stepText||[],mistakes:ms.map(k=>({k,btn:F[k].btn,short:F[k].short,wrong:F[k].wrong,now:F[k].now,later:F[k].later,fix:F[k].fix}))};}
const WARN_Q={lowback:'I feel it in my lower back',knee:'My knees hurt on this',elbow:'My elbows ache on this',shoulder:'My shoulder hurts',neck:'My neck gets sore',wrist:'My wrists hurt',hips:'My hips come up',back:'My back takes over',chest:'I don’t feel it working'};
function renderSugg(){if(!FORMS)return;const qs=[...new Set(Object.keys(FORMS).filter(k=>k!=='good').map(k=>WARN_Q[FORMS[k].warnAt]).filter(Boolean))].slice(0,3);qs.push('What can I do instead?');
  $('#caSugg').innerHTML=qs.map(q=>`<button class="tg" data-q="${esc(q)}">${esc(q)}</button>`).join('');$('#caSugg').hidden=false;} // starters only: hidden once a question is asked
function openCoach(){if(flow!=='exercise'||!AI.on)return;closePanels();$('#coachAsk').hidden=false;setTool('tCoach',true);
  if(!$('#caLog').innerHTML){renderSugg();$('#caLog').innerHTML=`<p class="a">Tell me what you feel on the ${esc(EX.name.toLowerCase())}, or ask me anything about it.</p>`;}}
function closeCoach(){const el=$('#coachAsk');if(!el||el.hidden)return;el.hidden=true;setTool('tCoach',false);if(SR&&$('#caMic')._rec)$('#caMic')._rec.stop();}
async function askCoach(text){if(AI.busy||!text||!EX)return;AI.busy=true;const e=EX;$('#caIn').value='';
  $('#caLog').innerHTML=`<p class="q">“${esc(text)}”</p><p class="a muted">Thinking…</p>`;$('#caSugg').hidden=true;
  try{const res=await aiPost('/api/ask',{text,memory:memSummary(),ex:exBrief(e),...aiCatalog()});
    if(EX!==e||flow!=='exercise')return; // walked off meanwhile
    if(res.remember)memNote(res.remember,{area:res.pain_area,ex:e.key});
    else if(res.pain_area&&AREA_TXT[res.pain_area])memNote(`Felt it in the ${AREA_TXT[res.pain_area]} on the ${e.name.toLowerCase()}`,{area:res.pain_area,ex:e.key});
    renderAnswer(text,res,e);speak(res.say);
    if(res.mistake&&FORMS[res.mistake])setForm(res.mistake); // the split screen: the right way next to the mistake they described
  }catch(err){console.warn('[coach]',err);AI.lastQ=text; // usually the network: one tap sends the same question again
    $('#caLog').innerHTML=`<p class="q">“${esc(text)}”</p><p class="a">My connection dropped for a second there.</p><div class="row"><button class="tg on" data-ca="retry">↻ Ask again</button></div>`;}
  finally{AI.busy=false;}}
// the answer, then (only when a mistake matched) one compact "coach's read", then small text actions and a one-line speed tag
function renderAnswer(q,res,e){const F=e.forms,pc=p=>Math.round(p.p*100),nm=v=>v==='none'?'No form mistake':F[v]?F[v].btn:v;
  let h=`<p class="q">“${esc(q)}”</p><p class="a">${esc(res.say)}</p>`;
  if(res.seeDoctor)h+=`<p class="warn">⚠ Stop this exercise today and get it checked by a doctor or physio.</p>`;
  if(res.probs&&res.probs.length){const [top,...rest]=res.probs,d=res.t&&res.t.decisions;const others=rest.filter(p=>pc(p)>0);
    h+=`<div class="read"><span class="eyebrow">Coach’s read · OpenAI Decisions${d?' · '+(d.ms/1000).toFixed(2)+' s':''}</span>
      <div class="bar${top.v===res.mistake?' hit':''}"><i style="width:${pc(top)}%"></i><span>${esc(nm(top.v))}</span><b>${pc(top)}%</b></div>`+
      (others.length?`<span class="also">also ${others.map(p=>esc(nm(p.v))+' '+pc(p)+'%').join(' · ')}</span>`:'')+`</div>`;}
  const act=[];
  if(res.mistake&&F[res.mistake])act.push(`<button class="lnk" data-ca="good">Right way only</button>`,`<button class="lnk" data-ca="explain">Why it matters</button>`);
  if(res.swap&&EXS[res.swap])act.push(`<button class="lnk go" data-ca="swap" data-x="${esc(res.swap)}">Switch to ${esc(EXS[res.swap].name.toLowerCase())} →</button>`);
  if(act.length)h+=`<div class="acts">${act.join('')}</div>`;
  const c=res.t&&res.t.cerebras;if(c)h+=`<p class="speed" title="${esc(speedTag(res.t))}">⚡ Cerebras · ${c.tps?c.tps.toLocaleString('en-US')+' tokens/s · ':''}${((c.modelMs||c.ms)/1000).toFixed(2)} s</p>`;
  $('#caLog').innerHTML=h;$('#caSugg').hidden=true;}
// swap the current exercise for another in today's plan (a copy: the standard plans stay as they are)
function swapTo(k){if(!EXS[k])return;const p=SES.plan;
  if(p&&EXK&&p.items.some(it=>it[0]===EXK)&&!p.items.some(it=>it[0]===k)){const np={...p,items:p.items.map(it=>it[0]===EXK?[k,it[1],it[2]]:it)};
    SES.group={...SES.group,plans:SES.group.plans.map(x=>x===p?np:x)};SES.plan=np;}
  closeCoach();goExercise(k);}
$('#tCoach').addEventListener('click',()=>{if(!$('#coachAsk').hidden){closePanels();return;}openCoach();});
$('#caForm').addEventListener('submit',e=>{e.preventDefault();askCoach($('#caIn').value.trim());});
$('#caMic').addEventListener('click',()=>listen($('#caIn'),$('#caMic'),askCoach));
$('#caSugg').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(b)askCoach(b.dataset.q);});
$('#caLog').addEventListener('click',e=>{const b=e.target.closest('[data-ca]');if(!b)return;const a=b.dataset.ca;
  if(a==='retry'){if(AI.lastQ)askCoach(AI.lastQ);}else if(a==='good')setForm('good');else if(a==='explain'){const f=form;closePanels();setForm(f);openMistakes();}else if(a==='swap')swapTo(b.dataset.x);});
$('#caVoice').addEventListener('click',()=>{voiceOut=!voiceOut;try{localStorage.setItem('muscleHouse.voice',voiceOut?'on':'off');}catch(e){}renderVoice();if(!voiceOut&&window.speechSynthesis)speechSynthesis.cancel();});
// drawn icons (emoji render as small grey blobs on Windows)
const SPEAKER='<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>';
function renderVoice(){const b=$('#caVoice');
  b.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${SPEAKER}${voiceOut?'<path d="M15.5 9a4 4 0 0 1 0 6M18.2 6.5a7.5 7.5 0 0 1 0 11"/>':'<path d="M16 9.5l5 5M21 9.5l-5 5"/>'}</svg>${voiceOut?'Voice on':'Voice off'}`;b.setAttribute('aria-pressed',voiceOut);}
// called by startExercise: log it, and start the panel fresh at each station
function coachExerciseStarted(k){memExercise(k);closeCoach();$('#caLog').innerHTML='';}

// ---- 3. what the coach remembers (open, read, forget)
function renderMem(){const el=$('#memPanel');if(!el)return;const m=memLoad();
  $('#memBtn').textContent='Coach’s memory'+(m.notes.length+m.sessions.length?' · '+(m.notes.length+m.sessions.length):'');
  if(el.hidden)return;
  const ses=m.sessions.slice(-5).reverse().map(s=>{const g=GROUPS[s.group];return `<li><b>${esc(g?g.name:s.group)}</b>, ${esc(whenTxt(s.t))}: ${esc(s.done.map(k=>EXS[k]?EXS[k].name:k).join(', '))}</li>`;}).join('');
  const notes=m.notes.slice().reverse().map(n=>`<li>${esc(n.text)} <small>(${esc(whenTxt(n.t))})</small></li>`).join('');
  el.innerHTML=`<span class="eyebrow">Stays in this browser</span><h3>What I remember</h3>
    ${notes?`<div><span class="eyebrow">You told me</span><ul>${notes}</ul></div>`:''}${ses?`<div><span class="eyebrow">Your sessions</span><ul>${ses}</ul></div>`:''}
    ${!notes&&!ses?'<p class="small">Nothing yet. Train with me, tell me how it feels, and I’ll remember it next time.</p>':''}
    <div class="row"><button class="tg" data-m="close">Close</button>${notes||ses?'<button class="tg" data-m="forget">Forget everything</button>':''}</div>`;}
$('#memBtn').addEventListener('click',()=>{const el=$('#memPanel');el.hidden=!el.hidden;renderMem();});
$('#memPanel').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;if(b.dataset.m==='forget'){try{localStorage.removeItem(MEM_KEY);}catch(e){}AI.hello=null;}else $('#memPanel').hidden=true;renderMem();});

// ---- start: only with server.mjs and a Cerebras key
(async()=>{if(TEST)return;let s=null;try{const r=await fetch('/api/status',{cache:'no-store'});if(r.ok)s=await r.json();}catch(e){}
  if(!s||!s.cerebras)return;AI.on=true;AI.decisions=!!s.decisions;AI.model=s.model;
  $('#aiAsk').hidden=false;$('#tCoach').hidden=false;$('#memBtn').hidden=false;if(!SR){$('#aiMic').hidden=true;$('#caMic').hidden=true;}
  $('#aiIn').dataset.ph=$('#aiIn').placeholder;$('#caIn').dataset.ph=$('#caIn').placeholder;renderVoice();renderMem();
  if(memSummary())aiPost('/api/greet',{memory:memSummary()}).then(r=>{if(r&&r.say)AI.hello=r.say;}).catch(()=>{});})();
