
// ---------------------------------------------------------------- muscle groups and today's plans
const GROUPS={};
function defGroup(k,g){g.key=k;GROUPS[k]=g;}
defGroup('chest',{name:'Chest',sub:'upper, middle, lower',line:'Chest day. The most popular day of the week, for a reason.',
  parts:['Upper chest','Middle chest','Lower chest'],
  plans:[
    {name:'Classic barbell',who:'Intermediate · about 60 min',why:'Heavy presses first while you’re fresh: incline for the upper chest, flat for the middle. Dips and high-to-low cables finish the lower chest.',
      items:[['bbIncline','3 × 6–10','2–3 min'],['bbFlat','3 × 6–10','2–3 min'],['dip','2 × 8–12','2 min'],['cableHL','2 × 12–15','1–1.5 min']]},
    {name:'Dumbbells',who:'Beginner to intermediate · about 50 min',why:'Dumbbells let your hands go deeper, so every press stretches the chest more. The fly trains the stretch; dips cover the lower chest.',
      items:[['dbIncline','3 × 8–12','2 min'],['dbFlat','3 × 8–12','2 min'],['dbFly','2 × 12–15','1–1.5 min'],['dip','2 × 6–10','2 min']]},
    {name:'Machines',who:'Beginner, first months · about 45 min',why:'Machines guide the path, so you can learn the movement and safely train hard. Low-to-high cables hit the upper chest, high-to-low the lower chest.',
      items:[['machinePress','3 × 10–12','2 min'],['cableLH','2 × 12–15','1–1.5 min'],['pecDeck','3 × 12–15','1–1.5 min'],['cableHL','2 × 12–15','1–1.5 min']]},
    {name:'No equipment',who:'Any level · about 25 min',why:'Push-ups train the whole chest; dips add the lower chest. Make push-ups harder by slowing the lowering to 3 seconds.',
      items:[['pushup','3 × as many clean reps as you can, minus 2','1.5 min'],['dip','3 × 6–10','2 min']]},
  ],
  areaOf:{bbIncline:'Upper chest',dbIncline:'Upper chest',cableLH:'Upper chest',bbFlat:'Middle chest',dbFlat:'Middle chest',machinePress:'Middle chest',pushup:'Middle chest',dbFly:'Middle chest',pecDeck:'Middle chest',bbDecline:'Lower chest',dip:'Lower chest',cableHL:'Lower chest'}});

// ---------------------------------------------------------------- UI: coach question, plan sheet, HUD
function renderChips(){chipsEl.innerHTML=Object.values(GROUPS).map(g=>`<button data-g="${g.key}">${g.name}<small>${g.sub}</small></button>`).join('');}
chipsEl.addEventListener('click',e=>{const b=e.target.closest('[data-g]');if(b)chooseGroup(b.dataset.g);});
function chooseGroup(k){const g=GROUPS[k];SES.group=g;SES.plan=g.plans[0];SES.i=0;SES.done=new Set();chipsEl.hidden=true;bubble.classList.remove('ask');sayFor(g.line,3.5);$('#skip').hidden=true;
  setFlow('plan');showPlan(true);}
function showPlan(on,asPopup){const el=$('#plan');el.hidden=!on;if(!on)return;const g=SES.group;
  $('#planEyebrow').textContent='Today · '+g.name+' day';
  $('#planTabs').innerHTML=g.plans.map((p,i)=>`<button data-p="${i}" aria-pressed="${p===SES.plan}">${p.name}</button>`).join('');
  renderPlanList();$('#planClose').hidden=!asPopup;$('#planSwap').hidden=!!asPopup&&flow==='exercise';}
function renderPlanList(){const g=SES.group,p=SES.plan;if(!g||!p)return;$('#planTitle').textContent=p.name.toLowerCase().includes(g.name.toLowerCase())?p.name+' day':p.name+' '+g.name.toLowerCase()+' day';
  $('#planWhy').textContent=p.who+'. '+p.why;
  const covered=new Set(p.items.flatMap(it=>[].concat(g.areaOf[it[0]]||[])));
  $('#planParts').innerHTML=g.parts.map(a=>`<span class="part" style="${covered.has(a)?'':'opacity:.4'}">${covered.has(a)?'✓':'·'} ${a}</span>`).join('');
  $('#planList').innerHTML=p.items.map(([k,sets,rest],i)=>{const e=EXS[k];const cls=EXK===k&&flow==='exercise'?'now':SES.done.has(k)?'done':'';
    return `<li class="${cls}"><button data-x="${k}"><span class="n">${i+1}</span><b>${e.name}</b><span class="sets">${sets}</span><span class="meta">${[].concat(g.areaOf[k]||e.part).join(' & ')} · rest ${rest}</span></button></li>`;}).join('');
  const nextK=p.items.find(it=>!SES.done.has(it[0]))?.[0]||p.items[0][0];$('#planGo').textContent=(SES.done.size?'Go to ':'Start with ')+EXS[nextK].name.toLowerCase()+' →';$('#planGo').dataset.x=nextK;}
$('#planTabs').addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;SES.plan=SES.group.plans[+b.dataset.p];showPlan(true,!$('#planClose').hidden);});
$('#planList').addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(b){showPlan(false);goExercise(b.dataset.x);}});
$('#planGo').addEventListener('click',()=>{showPlan(false);goExercise($('#planGo').dataset.x);});
$('#planSwap').addEventListener('click',()=>{showPlan(false);if(flow==='exercise')leaveStation(()=>askAgain());else askAgain();});
$('#planClose').addEventListener('click',()=>showPlan(false));
$('#planBtn').addEventListener('click',()=>{if(!SES.group)return;const el=$('#plan');if(!el.hidden){showPlan(false);return;}closePanels();showPlan(true,true);});

function showHUD(on){$('#hud').hidden=!on;$('#planBtn').hidden=!SES.group;if(!on){$('#mist').hidden=true;$('#learn').hidden=true;learn=null;}}
function nextInPlan(){if(!SES.plan)return null;const items=SES.plan.items.map(i=>i[0]);const i=items.indexOf(EXK);return i>=0&&i<items.length-1?items[i+1]:null;}
function renderExerciseUI(){const e=EX;const items=SES.plan?SES.plan.items.map(i=>i[0]):[];const i=items.indexOf(e.key);
  $('#exEyebrow').textContent=(i>=0?`${i+1} of ${items.length} · `:'')+e.eq;$('#exTitle').textContent=e.name;$('#exQuip').textContent=e.quip||'';$('#exPart').textContent=e.part;
  $('#steps').innerHTML=e.steps.map((s,j)=>`<button data-i="${j}"><b>${j+1} · ${s[0]}</b><span>${s[1]}</span></button>`).join('');
  const nx=nextInPlan();$('#nextBtn').textContent=nx?'Next: '+EXS[nx].name.toLowerCase()+' →':i>=0?'Finish the workout ✓':'Back to the plan';
  setTool('tPause',paused);setTool('tSlow',speed<1);setTool('tMistake',false);setTool('tLearn',false);}
function setTool(id,on){$('#'+id).setAttribute('aria-pressed',!!on);}
$('#nextBtn').addEventListener('click',()=>{if(flow!=='exercise')return;const nx=nextInPlan();
  if(nx)goExercise(nx);else{const inPlan=SES.plan&&SES.plan.items.some(it=>it[0]===EXK);leaveStation(()=>{if(inPlan)finishWorkout();else{setFlow('plan');showPlan(true);}});}});
$('#tPause').addEventListener('click',()=>setPaused(!paused));
$('#tSlow').addEventListener('click',()=>{speed=speed<1?1:.4;setTool('tSlow',speed<1);});
$('#tMistake').addEventListener('click',()=>{const el=$('#mist');if(!el.hidden){closePanels();return;}closePanels();openMistakes();});
$('#tLearn').addEventListener('click',()=>{if(learn){exitLearn();return;}closePanels();enterLearn(0);});
$('#steps').addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(!b||flow!=='exercise')return;if(!learn){closePanels();enterLearn(+b.dataset.i);}else goStep(+b.dataset.i);});
function setPaused(p){paused=p;setTool('tPause',p);const b=$('#tPause');b.innerHTML=p?'<i>▶</i>Play':'<i>❚❚</i>Pause';}
function closePanels(){$('#mist').hidden=true;setTool('tMistake',false);if(learn)exitLearn();if(form!=='good'&&flow==='exercise')setForm('good');}
// ---- right vs wrong
function openMistakes(){const el=$('#mist');el.hidden=false;setTool('tMistake',true);renderMistakes();}
function renderMistakes(){const el=$('#mist');const ms=Object.keys(FORMS).filter(k=>k!=='good');const F=FORMS[form];
  el.innerHTML=`<span class="eyebrow">${EX.name} · ${ms.length} common mistakes</span><h3>Spot the mistake</h3>
   <div class="mlist">${ms.map(k=>`<button data-f="${k}" aria-pressed="${form===k}"><b>${FORMS[k].btn}</b><span>${FORMS[k].short}</span></button>`).join('')}
    <button class="good" data-f="good" aria-pressed="${form==='good'}"><b>Only the right way</b><span>Back to one view</span></button></div>
   ${form==='good'?'<p class="small" style="color:var(--muted);font-size:.85rem">Pick one. The screen splits: the right way on one side, the mistake on the other, doing the same rep.</p>':
   `<div class="mi bad"><span>What’s wrong</span><p>${F.wrong}</p></div><div class="mi"><span>Right now</span><p>${F.now}</p></div><div class="mi"><span>If you keep doing it</span><p>${F.later}</p></div><div class="mi fix"><span>Fix it</span><p>${F.fix}</p></div>`}`;}
$('#mist').addEventListener('click',e=>{const b=e.target.closest('[data-f]');if(b){setForm(b.dataset.f);renderMistakes();}});
function setForm(f){form=f;holdT=0;for(const c of [hero,twin])if(c){c._m={cur:{},last:{}};c._vmax=0;}lastPhase=-1;repT=0;fatigue=0;rep=1;
  if(!EX)return;const F=FORMS[f];setPreset(f==='good'?(EX.cam||'side'):(F.cam||'side'));}
