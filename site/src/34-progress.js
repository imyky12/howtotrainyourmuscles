
// ---------------------------------------------------------------- today's progress: a ring in the bottom-right corner
// How much of today's plan is done. Click it for the list (done, now, left) to jump to any exercise or change muscle;
// hover an exercise for what it is, what it works and what to watch for. ringTick() (from the main loop) re-renders on change.
const ringEl=$('#ring'),ringPanel=$('#ringPanel'),ringInfo=$('#ringInfo');let ringKey='';
const RING_C=2*Math.PI*26; // circumference of the ring's circle (r = 26 in a 64 box)
const canHover=matchMedia('(hover: hover)').matches;
function ringShown(){return !!SES.plan&&!['landing','street','greet','ask'].includes(flow);}
// each plan item: done (did it and moved on), now (at it, or on the way there), left
function ringItems(){const p=SES.plan;if(!p)return [];const here=flow==='exercise'||flow==='entering';
  return p.items.map(([k,sets,rest])=>({k,sets,rest,st:(k===EXK&&here)||(flow==='walking'&&pending===k)?'now':SES.done.has(k)?'done':'left'}));}
function ringTick(){const p=SES.plan;const key=[ringShown(),flow,p&&p.name,p&&p.items.map(i=>i[0]).join(),[...SES.done].join(),EXK,pending].join('|');
  if(key===ringKey)return;ringKey=key;renderRing();}
function renderRing(){const on=ringShown();ringEl.hidden=!on;if(!on){closeRing();return;}
  const it=ringItems(),n=it.length,d=it.filter(x=>x.st==='done').length,pc=n?Math.round(100*d/n):0;
  ringEl.querySelector('.fg').style.strokeDashoffset=RING_C*(1-pc/100);
  ringEl.querySelector('.pc').textContent=pc+'%';ringEl.querySelector('.of').textContent=d+'/'+n;
  const next=it.find(x=>x.st!=='done');
  ringEl.title=`${d} of ${n} done`+(next&&EXS[next.k]?` · ${next.st==='now'?'now':'next'}: ${EXS[next.k].name}`:'');
  ringEl.setAttribute('aria-label',`Today’s plan, ${d} of ${n} exercises done. Open to switch exercise or muscle.`);
  if(!ringPanel.hidden)renderRingPanel();}
function renderRingPanel(){const g=SES.group,p=SES.plan;if(!g||!p)return;const it=ringItems(),d=it.filter(x=>x.st==='done').length;
  ringPanel.innerHTML=`<div class="rpHead"><div><span class="eyebrow">Today · ${esc(g.name)} day</span><h3>${esc(p.name)}</h3></div><span class="rpCount">${d} of ${it.length} done</span></div>
    <ol class="rpList">${it.map((x,i)=>{const e=EXS[x.k];if(!e)return '';
      const tag=x.st==='now'?(flow==='walking'?'on the way':'now'):x.st==='done'?'done':esc(x.sets);
      return `<li class="${x.st}"><button data-x="${esc(x.k)}" data-i="${i}"><span class="mk">${x.st==='done'?'✓':x.st==='now'?'●':i+1}</span><b>${esc(e.name)}</b><span class="tag">${tag}</span></button></li>`;}).join('')}</ol>
    <div class="row"><button class="tg on" data-r="muscle">Change muscle</button><button class="tg" data-r="plan">Full plan</button></div>`;}
// the hover card: what the exercise is, what it works, what to watch for
function ringInfoHTML(x){const e=EXS[x.k],g=SES.group;const area=[].concat((g&&g.areaOf&&g.areaOf[x.k])||e.part).join(' & ');
  const works=(e.labels||[]).map(([t,,r])=>r==='m'?t:t+' (helps)').join(' · ');
  const watch=Object.keys(e.forms).filter(f=>f!=='good').map(f=>e.forms[f].btn).join(' · ');
  return `<span class="eyebrow">${esc(e.eq)} · ${esc(area)}</span><h4>${esc(e.name)}</h4>${e.quip?`<p class="quip">${esc(e.quip)}</p>`:''}
    <dl><dt>Sets</dt><dd>${esc(x.sets)} · rest ${esc(x.rest)}</dd>${works?`<dt>Works</dt><dd>${esc(works)}</dd>`:''}${watch?`<dt>Watch for</dt><dd>${esc(watch)}</dd>`:''}</dl>
    <span class="st ${x.st}">${x.st==='done'?'✓ Done today':x.st==='now'?'● You’re on this one':'Click to go there'}</span>`;}
function showRingInfo(btn){if(!canHover||!btn)return;const x=ringItems()[+btn.dataset.i];if(!x||!EXS[x.k])return;
  ringInfo.innerHTML=ringInfoHTML(x);ringInfo.hidden=false;const pr=ringPanel.getBoundingClientRect(),br=btn.getBoundingClientRect();
  if(pr.left<ringInfo.offsetWidth+26){ringInfo.hidden=true;return;} // no room beside the list (narrow window)
  ringInfo.style.left=(pr.left-ringInfo.offsetWidth-10)+'px';ringInfo.style.top=clamp(br.top-12,70,innerHeight-ringInfo.offsetHeight-16)+'px';}
function openRing(){closePanels();$('#memPanel').hidden=true;ringPanel.hidden=false;ringEl.classList.add('open');ringEl.setAttribute('aria-expanded','true');renderRingPanel();}
function closeRing(){ringPanel.hidden=true;ringInfo.hidden=true;ringEl.classList.remove('open');ringEl.setAttribute('aria-expanded','false');}
ringEl.addEventListener('click',()=>{if(!ringPanel.hidden){closeRing();return;}openRing();});
ringPanel.addEventListener('click',e=>{const b=e.target.closest('[data-x]');
  if(b){const k=b.dataset.x;closeRing();if(k===EXK&&(flow==='exercise'||flow==='entering'))return;$('#done').hidden=true;goExercise(k);return;}
  const r=e.target.closest('[data-r]');if(!r)return;closeRing();$('#done').hidden=true;
  if(r.dataset.r==='muscle'){showPlan(false);whenFree(askAgain);}else{closePanels();showPlan(true,true);}});
ringPanel.addEventListener('mouseover',e=>showRingInfo(e.target.closest('[data-x]')));
ringPanel.addEventListener('focusin',e=>showRingInfo(e.target.closest('[data-x]')));
ringPanel.addEventListener('mouseleave',()=>{ringInfo.hidden=true;});
document.addEventListener('pointerdown',e=>{if(!ringPanel.hidden&&!e.target.closest('#ringPanel,#ring'))closeRing();});
addEventListener('keydown',e=>{if(e.code==='Escape'&&!ringPanel.hidden)closeRing();});
