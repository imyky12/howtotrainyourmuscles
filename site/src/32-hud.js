
// ---------------------------------------------------------------- the exercise loop, split view, labels, learn mode
let holdT=0,splitOn=false,lastPhase=-1,cueIdx=0,warnAt=null,heroProps=null,twinProps=null;
function exerciseTick(dt){const F=FORMS[form];const sdt=dt*speed;
  repT+=sdt;const L=repLength();if(repT>=L){repT-=L;rep++;fatigue=Math.min(6,fatigue+1);if(rep>10){rep=1;fatigue=0;}}
  if(learn&&learn.seg&&repT>=learn.seg[1]-.01){repT=learn.seg[1]-.012;learn.seg=null;speed=learn.speed;setPaused(true);}
  if(EX.hold){holdT=(holdT||0)+sdt;$('#rep').textContent='Hold '+EX.hold+' · '+Math.floor(holdT)+' s';}else $('#rep').textContent='Rep '+rep+' of 10';
  const hideHints=learn&&learn.mode==='quiz'&&!learn.answered;
  const was=splitOn;splitOn=form!=='good'&&!(learn&&learn.mode!=='quiz');
  if(splitOn){const G=FORMS.good,tt=repT/L*repLength(G);const r2=drive(twin,G,tt,sdt*repLength(G)/L,F.meas);twinProps=propState(ST.P);setGlows(MU2,EX,G,r2.b,false);twin.root.visible=true;}
  else twin.root.visible=false;
  const {b}=drive(hero,F,repT,sdt);heroProps=propState(ST.P);
  setGlows(MU,EX,F,b,hideHints);
  // steps strip + coach line
  if(b.phase!==lastPhase){lastPhase=b.phase;document.querySelectorAll('#steps button').forEach((s,i)=>s.classList.toggle('on',i===b.phase));
    const sub=$('#sub');
    if(form==='good'){const list=EX.cues[b.phase]||[''];cueIdx=(cueIdx+1)%list.length;sub.innerHTML=list[cueIdx%list.length]?'<b>Coach:</b> '+list[cueIdx%list.length]:'';}
    else sub.innerHTML=hideHints?'Watch closely. What’s off?':'';}
  warnAt=form==='good'||hideHints?null:form;}
// ---- split view: same station, two takes (the right way and the mistake)
const camL=new THREE.PerspectiveCamera(45,1,.05,200),camR=new THREE.PerspectiveCamera(45,1,.05,200);
const sideOpen=()=>!$('#mist').hidden||!$('#learn').hidden;
function splitHalves(){const W=innerWidth,H=innerHeight;
  if(W>760){const w=sideOpen()?W-380:W;return [{x:0,y:0,w:Math.round(w/2),h:H},{x:Math.round(w/2),y:0,w:w-Math.round(w/2),h:H}];}
  // phone: stacked between the exercise card and whatever sits at the bottom
  const top=Math.round($('#exCard').getBoundingClientRect().bottom+4);const side=sideOpen()?(sideOpen()&&!$('#mist').hidden?$('#mist'):$('#learn')):null;
  const bot=Math.round(Math.min(side?side.getBoundingClientRect().top:H,$('#dock').getBoundingClientRect().top)-4);const h=Math.max(60,Math.round((bot-top)/2));return [{x:0,y:top,w:W,h},{x:0,y:top+h,w:W,h}];}
// swing the view around the body until a wall no longer cuts the distance short
function clearView(ctr,dir,d){let best=null,bf=-1;for(const a of[0,25,-25,45,-45,65,-65,90,-90,120,-120]){const v=dir.clone().applyAxisAngle(V(0,1,0),a*DEG);const p=roomRay(ctr,ctr.clone().addScaledVector(v,d));const f=p.distanceTo(ctr);
    const ok=viewClear(ctr,p,ST);if(f>=d*.97&&ok)return p;const sc=f*(ok?1:.5);if(sc>bf){bf=sc;best=p;}}return best;}
// each half frames the whole body (head, hands, feet) from the main camera's viewing angle
function placeSplitCams(){const hv=splitHalves(),dir=V().subVectors(cam.pos,cam.center).normalize();
  const pts=['Head','LeftHand','RightHand','LeftFoot','RightFoot','Hips','LeftToeBase','RightToeBase'].map(n=>wpos(hero.bones[n]));pts[0].y+=.12;
  const box=new THREE.Box3().setFromPoints(pts);const ctr=box.getCenter(V());let rad=0;for(const p of pts)rad=Math.max(rad,p.distanceTo(ctr));rad+=.18;
  const tv=Math.tan(22.5*DEG);
  [[camL,hv[0]],[camR,hv[1]]].forEach(([c,r])=>{const a=r.w/r.h;const half=Math.atan(tv*Math.min(1,a));const d=Math.max(1.6,rad/Math.sin(half));
    c.position.copy(clearView(ctr,dir,d));c.lookAt(ctr);c.aspect=a;c.updateProjectionMatrix();});return hv;}
function showCeil(c){const on=c.position.y<4.3;for(const o of CEIL)o.visible=on;}
function renderSplit(){const W=innerWidth,H=innerHeight,hv=placeSplitCams();
  renderer.setScissorTest(false);renderer.setViewport(0,0,W,H);
  // the gym stays visible behind the cards; the two takes are drawn on top
  if(hv[1].x+hv[1].w<W-1||hv[1].y+hv[1].h<H-1||hv[0].y>0){hero.root.visible=false;twin.root.visible=false;showCeil(camera);composer.render();hero.root.visible=true;twin.root.visible=true;}else renderer.clear();
  renderer.setScissorTest(true);
  [[camL,twinProps,false],[camR,heroProps,true]].forEach(([c,props,isHero],i)=>{const r=hv[i],y=H-r.y-r.h;showCeil(c);
    hero.root.visible=isHero;twin.root.visible=!isHero;if(props)setPropState(props);
    renderer.setViewport(r.x,y,r.w,r.h);renderer.setScissor(r.x,y,r.w,r.h);renderer.render(scene,c);});
  hero.root.visible=true;twin.root.visible=true;if(heroProps)setPropState(heroProps);
  renderer.setScissorTest(false);renderer.setViewport(0,0,W,H);}
function updateSplitUI(){const el=$('#split');const on=splitOn&&flow==='exercise';el.hidden=!on;if(!on)return;const [a,b]=splitHalves(),side=a.y===b.y;
  const dv=$('#splitDiv');if(side)Object.assign(dv.style,{left:(b.x-1)+'px',top:'0px',width:'2px',height:a.h+'px'});else Object.assign(dv.style,{left:'0px',top:(b.y-1)+'px',width:a.w+'px',height:'2px'});
  const tL=$('#tagL'),tR=$('#tagR');const F=FORMS[form];const hide=learn&&learn.mode==='quiz'&&!learn.answered;
  const ty=side?Math.round($('#exCard').getBoundingClientRect().bottom+10):0;Object.assign(tL.style,{left:(a.x+12)+'px',top:(side?ty:a.y+8)+'px'});Object.assign(tR.style,{left:(b.x+12)+'px',top:(side?ty:b.y+8)+'px'});
  tL.innerHTML='✓ Right way<small>'+measText(twin,F.meas)+'</small>';tR.innerHTML=hide?'? Spot it':'✕ '+F.tag+'<small>'+measText(hero,F.meas)+'</small>';}
// ---- labels on the body
function warnPoint(c,at){const B=c.bones,ven=venOf(c);
  return at==='hips'?wpos(B.Hips).addScaledVector(ven,-.05):at==='chest'?wpos(B.Spine2).addScaledVector(ven,.14*D.s):at==='elbow'?wpos(B.RightForeArm):at==='back'?wpos(B.Spine1).addScaledVector(ven,-.12*D.s)
    :at==='knee'?wpos(B.RightLeg):at==='lowback'?wpos(B.Spine).addScaledVector(ven,-.1*D.s):at==='neck'?wpos(B.Neck):at==='wrist'?wpos(B.RightHand):wpos(B.RightArm).addScaledVector(ven,.05*D.s);}
const lines=$('#lines');
function anchorScreen(p,c=camera,r){const v=p.clone().project(c);if(!r)r={x:0,y:0,w:innerWidth,h:innerHeight};return {x:r.x+(v.x*.5+.5)*r.w,y:r.y+(-v.y*.5+.5)*r.h,ok:v.z<1&&Math.abs(v.x)<1.1&&Math.abs(v.y)<1.1};}
function hideLabels(){['lb0','lb1','lb2','lbWarn'].forEach(id=>$('#'+id).style.display='none');lines.innerHTML='';}
function updateLabels(){updateSplitUI();if(flow!=='exercise'||(learn&&learn.mode==='quiz'&&!learn.answered&&!splitOn&&false)){hideLabels();return;}
  let svg='';const F=FORMS[form];const sm=innerWidth<760?.55:1;
  if(splitOn){['lb0','lb1','lb2'].forEach(id=>$('#'+id).style.display='none');const el=$('#lbWarn');if(!warnAt){el.style.display='none';lines.innerHTML='';return;}
    const h=placeSplitCams()[1];const a=anchorScreen(warnPoint(hero,F.warnAt),camR,h);el.textContent=F.warn;el.style.display='flex';
    const hw=el.offsetWidth/2+8;const x=clamp(a.x-Math.min(110,h.w*.3),h.x+hw,h.x+h.w-hw),y=clamp(a.y+(h.y===0?70:36),h.y+16,h.y+h.h-16);el.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;
    lines.innerHTML=`<line x1="${a.x}" y1="${a.y}" x2="${x}" y2="${y}"/><circle cx="${a.x}" cy="${a.y}" r="3.5"/>`;return;}
  $('#lbWarn').style.display='none';
  const offs=[[-150,-80],[70,-90],[80,40]];
  EX.labels.forEach(([txt,reg,role],i)=>{const el=$('#lb'+i);const p=regionWorld(hero,RID[reg]);if(!p){el.style.display='none';return;}const a=anchorScreen(p);if(!a.ok){el.style.display='none';return;}
    el.innerHTML=`<i style="background:${role==='m'?'var(--main)':'var(--help)'}"></i>${txt}<small>${role==='m'?'main muscle':'helping'}</small>`;
    el.style.display='flex';const wd=el.offsetWidth;let x=a.x+offs[i][0]*sm;const left=offs[i][0]<0;x=left?clamp(x,wd+8,innerWidth-8):clamp(x,8,innerWidth-wd-8);const y=clamp(a.y+offs[i][1]*sm,70,innerHeight-60);el.style.transform=`translate(${x}px,${y}px) translate(${left?'-100%':'0'},-50%)`;
    svg+=`<line x1="${a.x}" y1="${a.y}" x2="${x}" y2="${y}"/><circle cx="${a.x}" cy="${a.y}" r="3.5"/>`;});
  for(let i=EX.labels.length;i<3;i++)$('#lb'+i).style.display='none';
  lines.innerHTML=svg;}
// ---- learn mode: guided steps, then a spot-the-mistake quiz
let learn=null;const learnEl=$('#learn');
function stepsNow(){const G=FORMS.good,T=[G.lower,G.touch,G.press,G.lock];let t0=0;return T.map((d,i)=>{const s={n:EX.steps[i][0],t:EX.stepText[i],seg:[t0,t0+d],at:t0+d*(i===0?.6:i===2?.45:.5)};t0+=d;return s;});}
function dots(n,i){return '<div class="dots">'+Array.from({length:n},(_,k)=>`<i class="${k<=i?'on':''}"></i>`).join('')+'</div>';}
function enterLearn(i=0){if(flow!=='exercise')return;learn={mode:'steps',i,speed};setForm('good');learnEl.hidden=false;setTool('tLearn',true);goStep(i);}
function exitLearn(){if(!learn)return;speed=learn.speed;learn=null;learnEl.hidden=true;setTool('tLearn',false);setForm('good');setPaused(false);}
function goStep(i){learn.mode='steps';learn.i=i;learn.seg=null;const S=stepsNow()[i];repT=S.at;rep=1;fatigue=0;lastPhase=-1;setPaused(true);
  learnEl.innerHTML=`<span class="eyebrow">${EX.name} · step ${i+1} of 4</span>${dots(4,i)}<h3>${i+1} · ${S.n}</h3><p>${S.t}</p>
   <div class="row"><button class="tg" data-a="play">▶ Play this step</button><button class="tg" data-a="all">▶ Whole rep</button></div>
   <div class="row"><button class="tg" data-a="back" ${i===0?'disabled':''}>‹ Back</button><button class="tg on" data-a="next">${i<3?'Next ›':'Quiz: spot the mistake ›'}</button><button class="tg" data-a="exit">Done</button></div>`;}
function playStep(){const S=stepsNow()[learn.i];repT=S.seg[0];learn.seg=S.seg;speed=.5;setPaused(false);}
function playWhole(){repT=0;learn.seg=[0,repLength(FORMS.good)-.02];speed=1;setPaused(false);}
function startQuiz(){const ms=Object.keys(FORMS).filter(k=>k!=='good').sort(()=>Math.random()-.5);learn={...learn,mode:'quiz',qs:ms.slice(0,Math.min(3,ms.length)),qi:0,score:0};askQ();}
function askQ(){const q=learn.qs[learn.qi];learn.answered=false;setForm(q);setPreset('quiz');setPaused(false);speed=1;
  const others=Object.keys(FORMS).filter(k=>k!=='good'&&k!==q).sort(()=>Math.random()-.5).slice(0,2);
  const opts=[q,...others];if(opts.length<3)opts.push('none');opts.sort(()=>Math.random()-.5);
  learnEl.innerHTML=`<span class="eyebrow">Quiz · question ${learn.qi+1} of ${learn.qs.length}</span>${dots(learn.qs.length,learn.qi)}<h3>What’s wrong with the rep on the right?</h3>
   <div class="opts">${opts.map(o=>`<button data-o="${o}">${o==='none'?'Nothing, it looks right':FORMS[o].short}</button>`).join('')}</div><div id="verdict"></div>
   <div class="row"><button class="tg" data-a="exit">Done</button></div>`;}
function answer(o){if(learn.answered)return;learn.answered=true;const q=learn.qs[learn.qi],ok=o===q;if(ok)learn.score++;setPreset(FORMS[q].cam||'side');
  learnEl.querySelectorAll('.opts button').forEach(b=>{if(b.dataset.o===q)b.classList.add('right');else if(b.dataset.o===o)b.classList.add('wrong');});
  const F=FORMS[q],last=learn.qi>=learn.qs.length-1;$('#verdict').innerHTML=`<div class="verdict"><b style="color:${ok?'var(--ok)':'#ff7a6d'}">${ok?'Right!':'Not quite. It was: '+F.short.toLowerCase()+'.'}</b><span>${F.now}</span><span style="color:#9df0c8">Fix: ${F.fix}</span></div>
   <div class="row" style="margin-top:8px"><button class="tg on" data-a="nextq">${last?'See my score ›':'Next question ›'}</button></div>`;}
function nextQ(){learn.qi++;if(learn.qi<learn.qs.length){askQ();return;}setForm('good');const n=learn.qs.length;
  learnEl.innerHTML=`<span class="eyebrow">Quiz done</span><h3>You spotted ${learn.score} of ${n}</h3><p>${learn.score===n?'Sharp eyes. You know what a good '+EX.name.toLowerCase()+' looks like.':'Open “Spot the mistake” to watch the ones you missed side by side, then try again.'}</p>
   <div class="row"><button class="tg on" data-a="again">Try again</button><button class="tg" data-a="steps">Steps again</button><button class="tg" data-a="exit">Done</button></div>`;}
learnEl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!learn)return;
  if(b.dataset.o){answer(b.dataset.o);return;}
  ({play:playStep,all:playWhole,back:()=>goStep(Math.max(0,learn.i-1)),next:()=>learn.i<3?goStep(learn.i+1):startQuiz(),exit:exitLearn,nextq:nextQ,again:startQuiz,steps:()=>goStep(0)})[b.dataset.a]?.();});
