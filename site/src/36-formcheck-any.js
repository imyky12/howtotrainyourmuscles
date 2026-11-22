// ---------------------------------------------------------------- Check my form, every other exercise: checks worked out from the gym's own animations
// The squat (35-formcheck.js) has hand-tuned checks. For every other exercise, the lifter's right way and each of its mistakes are
// played through exactly as the gym animates them, and measured the way the camera will see them: joint angles (knee, hip, elbow,
// shoulder, ankle) and the torso's tilt, flattened onto the plane the camera looks at (side-on for most moves; facing the camera
// when the limb swings out to the side). From that, per exercise:
//  - the joint that moves most counts the reps and maps your rep onto the lifter (the lifter copies you);
//  - a mistake is checked when one of those angles differs from the right way by 20° or more (the camera's error is ~10°), or
//    when its lowering takes about half the time; the others are listed as not visible to a camera.
// Your angles come from the picture (2D), as the lifter's were measured: with the limb swinging across the picture they are the
// real angles, and no depth guess is involved.
const LVJ={elbow:['Arm','ForeArm','Hand',[11,13,15],[12,14,16]],shoulder:['UpLeg','Arm','ForeArm',[23,11,13],[24,12,14]],
  hip:['Arm','UpLeg','Leg',[11,23,25],[12,24,26]],knee:['UpLeg','Leg','Foot',[23,25,27],[24,26,28]],ankle:['Leg','Foot','ToeBase',[25,27,31],[26,28,32]]};
const LVJ_PART={elbow:'arm',shoulder:'arm',hip:'leg',knee:'leg',ankle:'leg'};
// at: where between the right way and the mistake a check draws its line (the camera reads a full push-up's bottom 10–17° shallower
// than it is: halfway, clean reps brushed the half-rep line)
const LVA={sep:20,minRange:25,tempo:.55,at:.65};
// measures the joint angles can't show, per exercise; the profile checks them like the angles, and first. Push-up: how far the hips
// sit below (+) or above (−) the straight line from the shoulders to the ankles, in cm (a bent hip alone can't tell sagging from
// piking: both bend it)
const lvLine=(S,H,A)=>{const d=A.clone().sub(S),n=V(-d.y,d.x,0).normalize();if(n.y<0)n.negate();return -H.clone().sub(S).dot(n);};
const LV_EXTRA={pushup:{line:{sep:8,unit:'cm',name:'hips_below_line',info:'how far the hips sagged below (+) or rose above (−) the straight line from shoulders to ankles',
  lifter:(c,flat)=>{const B=c.bones,m=(a,b)=>flat(wpos(B[a]).add(wpos(B[b])).multiplyScalar(.5));return lvLine(m('LeftArm','RightArm'),m('LeftUpLeg','RightUpLeg'),m('LeftFoot','RightFoot'))*100;},
  user:(Q,X)=>{const m=(a,b)=>Q[a].clone().add(Q[b]).multiplyScalar(.5),S=m(11,12),A=m(27,28);return lvLine(S,m(23,24),A)/S.distanceTo(A)*X.len*100;}}}};
const LV_SETUP={pushup:['Put the phone on the floor, upright, 1.5–2 m to your side','Side-on to it, head to heels in view','Start at the top, arms straight. Hold a second, then go: I call out every rep']};
const lvAng2=(a,b,c)=>{const u=a.clone().sub(b),v=c.clone().sub(b);u.z=0;v.z=0;return u.angleTo(v)/DEG;};
// the time u takes from .85 to .15 while lowering (u = 1 - smooth(k) over the lowering)
function lvEcc(F){const inv=y=>{let lo=0,hi=1;for(let i=0;i<30;i++){const m=(lo+hi)/2;if(smooth(m)<y)lo=m;else hi=m;}return (lo+hi)/2;};return F.lower*(inv(.85)-inv(.15));}
function anyProfile(e){if(e._lv)return e._lv;const c=hero,P=ST.P,G=e.forms.good,keep=snapshot(c),props=propState(P),fat=fatigue,EXT=LV_EXTRA[e.key]||{};fatigue=0;
  let view='side';
  // angles as a camera looking along x (side-on) or along z (from the front) sees them: the canonical frame faces +z, left = +x
  const flat=p=>view==='side'?V(p.z,p.y,0):V(p.x,p.y,0);
  // (rat: how much of each angle's two limb segments the camera sees; a segment pointing at the camera can't show its angle)
  const rat={},meas=()=>{c.root.updateMatrixWorld(true);const B=c.bones,o={};
    for(const j in LVJ)for(const s of['L','R']){const sd=s==='L'?'Left':'Right',a=wpos(B[sd+LVJ[j][0]]),b=wpos(B[sd+LVJ[j][1]]),cc=wpos(B[sd+LVJ[j][2]]);
      o[j+s]=lvAng2(flat(a),flat(b),flat(cc));rat[j+s]=Math.min(flat(a).distanceTo(flat(b))/a.distanceTo(b),flat(cc).distanceTo(flat(b))/cc.distanceTo(b));}
    const sh=flat(wpos(B.LeftArm).add(wpos(B.RightArm)).multiplyScalar(.5)),hp=flat(wpos(B.LeftUpLeg).add(wpos(B.RightUpLeg)).multiplyScalar(.5));
    o.lean=sh.sub(hp).angleTo(V(0,1,0))/DEG;for(const k in EXT)o[k]=EXT[k].lifter(c,flat);return o;};
  const at=(F,u,b)=>{e.pose(c,F,b||{u,phase:2,k:u},u,P);return meas();};
  try{
    // which way the moving limb swings decides where the camera goes: sideways swings are seen from the front
    const endOf=u=>{e.pose(c,G,{u,phase:2,k:u},u,P);c.root.updateMatrixWorld(true);return wpos(c.bones.RightHand).add(wpos(c.bones.LeftHand)).add(wpos(c.bones.RightFoot)).add(wpos(c.bones.LeftFoot));};
    const mv=endOf(1).sub(endOf(0));view=Math.abs(mv.x)>Math.abs(mv.z)*1.2?'front':'side';
    // the right way from stretched (u 0) to contracted (u 1): the joint that moves most drives the rep
    const U=[];for(let i=0;i<=20;i++)U.push(at(G,i/20));
    let dj=null,dr=0;for(const k in U[0]){if(k==='lean'||EXT[k])continue;const r=Math.abs(U[20][k]-U[0][k]);if(r>dr){dr=r;dj=k;}}
    const other=dj?dj.slice(0,-1)+(dj.endsWith('L')?'R':'L'):null,uni=dj&&Math.abs(Math.abs(U[20][other]-U[0][other])-dr)>20;
    // each form's rep as the gym animates it: every angle's extremes, and how long the lowering takes
    const rep=F=>{const T=repLength(F),o={min:{},max:{},rat:{}};for(let i=0;i<=60;i++){const b=barAt(i/60*T,F),m=at(F,b.u,b);
      for(const k in m){o.min[k]=Math.min(o.min[k]??1e9,m[k]);o.max[k]=Math.max(o.max[k]??-1e9,m[k]);if(rat[k]!==undefined)o.rat[k]=Math.min(o.rat[k]??1,rat[k]);}}o.ecc=lvEcc(F);return o;};
    const g=rep(G),checks=[],blind=[];
    for(const k in e.forms){if(k==='good')continue;const F=e.forms[k],f=rep(F);let best=null;
      for(const key in EXT)for(const w of['min','max']){const sep=f[w][key]-g[w][key];
        if(Math.abs(sep)>=EXT[key].sep&&(!best||Math.abs(sep)>Math.abs(best.sep)))best={key,w,sep,g:g[w][key],f:f[w][key],thr:g[w][key]+sep*LVA.at};}
      if(!best)for(const key in g.min)for(const w of['min','max']){if(EXT[key]||(key!=='lean'&&Math.min(f.rat[key],g.rat[key])<.5))continue;const sep=f[w][key]-g[w][key];
        if(Math.abs(sep)>=LVA.sep&&(!best||Math.abs(sep)>Math.abs(best.sep)))best={key,w,sep,g:g[w][key],f:f[w][key],thr:g[w][key]+sep*LVA.at};}
      if(!best&&f.ecc<=g.ecc*LVA.tempo)best={key:'ecc',tempo:1,g:g.ecc,f:f.ecc,thr:(f.ecc+g.ecc)/2};
      if(best)checks.push({k,...best});else blind.push(k);}
    at(G,1);const len=(()=>{const B=c.bones,m=(a,b)=>flat(wpos(B[a]).add(wpos(B[b])).multiplyScalar(.5));return m('LeftArm','RightArm').distanceTo(m('LeftFoot','RightFoot'));})();
    e._lv={ok:!!dj&&dr>=LVA.minRange,view,len,ext:EXT,dj,dType:dj&&dj.slice(0,-1),dSide:dj&&dj.slice(-1),uni,T:U.map((m,i)=>[i/20,m[dj]]),lo:Math.min(U[0][dj],U[20][dj]),hi:Math.max(U[0][dj],U[20][dj]),
      g,checks,blind,ecc:g.ecc};}
  finally{applySnap(c,keep);setPropState(props);fatigue=fat;}
  return e._lv;}
// your angle on the driving joint → how far through the rep you are (the right way's own angle at each point)
function anyU(X,a){const T=X.T,inc=T[20][1]>T[0][1];let best=0,bd=1e9;
  for(let i=0;i<20;i++){const [u0,a0]=T[i],[u1,a1]=T[i+1],t=clamp((a-a0)/((a1-a0)||1e-6),0,1),d=Math.abs(a0+(a1-a0)*t-a);if(d<bd){bd=d;best=u0+(u1-u0)*t;}}
  return a<=Math.min(T[0][1],T[20][1])?(inc?0:1):a>=Math.max(T[0][1],T[20][1])?(inc?1:0):best;}
function anySetup(e){if(LV_SETUP[e.key])return LV_SETUP[e.key];const X=anyProfile(e),phone=LV_PHONE,part=X.dType?LVJ_PART[X.dType]:'arm';
  return [phone?'Prop the phone upright 2–3 m away, your whole body in view':'Camera 2–3 m away, your whole body in view',
    X.view==='front'?'Face the camera':'Turn side-on to the camera'+(X.uni?`, your working ${part} nearest to it`:''),
    'Hold the start position a second, then go. I call out every rep'];}
function anyChecksHtml(e){const X=anyProfile(e);if(!X.ok)return `<p class="warn">This one moves too little at any joint for a camera to count it.</p>`;
  const nm=k=>esc(FORMS[k].btn);
  return `<p class="lchk"><b>I check:</b> the range on your ${X.dType}${X.checks.length?', '+X.checks.map(c=>nm(c.k)).join(', '):''}.`+
    (X.blind.length?`<br><span>Not visible to a camera: ${X.blind.map(nm).join(', ')}.</span>`:'')+`</p>`;}
function anyReset(){const L=LIVE;Object.assign(L,{X:LIVE_EX[EXK]?null:anyProfile(EX),Q:null,st:'find',hold:0,start:null,rep:null,rng:{L:[1e9,-1e9],R:[1e9,-1e9]},u:null,uPrev:null,dir:0,act:null,twinU:null,eccA:null});}

// ---- a frame: your angles from the picture, then the rep counter (start end → the other end → back)
function anyFrame(world,norm,t,ar=1){const L=LIVE,X=L.X;if(!X||!X.ok)return;
  if(!norm)return liveLost(t,'I can’t see you. Step into the picture, your whole body in view.');
  const vis=i=>norm[i]?(norm[i].visibility??1):1,J=LVJ[X.dType],okS={L:J[3].every(i=>vis(i)>=.5),R:J[4].every(i=>vis(i)>=.5)};
  if(!okS.L&&!okS.R)return liveLost(t,`Step back: I need to see your ${LVJ_PART[X.dType]} the whole time.`);
  L.seenT=t;const first=!L.Q;if(first)L.Q=[];
  for(let i=11;i<=32;i++){if(!norm[i])continue;const q=V(norm[i].x*ar,-norm[i].y,0);L.Q[i]=first||!L.Q[i]?q:L.Q[i].lerp(q,.5);}
  const Q=L.Q,ang=ix=>lvAng2(Q[ix[0]],Q[ix[1]],Q[ix[2]]),A={};
  for(const j in LVJ)for(const s of['L','R']){const ix=LVJ[j][s==='L'?3:4];A[j+s]=ix.every(i=>vis(i)>=.5)?ang(ix):null;}
  const sh=Q[11].clone().add(Q[12]).multiplyScalar(.5),hp=Q[23].clone().add(Q[24]).multiplyScalar(.5);A.lean=sh.sub(hp).angleTo(V(0,1,0))/DEG;
  const seen=ix=>ix.some(i=>vis(i)>=.5);for(const k in X.ext)A[k]=seen([11,12])&&seen([23,24])&&seen([27,28])?X.ext[k].user(Q,X):null;
  // the working side: the one whose driving joint has moved more this set (side-on, it's the near one)
  for(const s of['L','R']){const a=A[X.dType+s];if(a!==null){L.rng[s][0]=Math.min(L.rng[s][0],a);L.rng[s][1]=Math.max(L.rng[s][1],a);}}
  const span=s=>okS[s]?L.rng[s][1]-L.rng[s][0]:-1,act=span('L')>=span('R')?'L':'R';L.act=act;
  // how far through the rep: on the lifter's scale (what the lifter shows: a half rep looks like one), and for counting, on your
  // own scale once you've moved 40° (the camera reads a straight arm as ~150°, so the lifter's 178° end may never come)
  const a=A[X.dType+act],uT=anyU(X,a),lo=L.rng[act][0],hi=L.rng[act][1],inc=X.T[20][1]>X.T[0][1];
  const u=hi-lo>=40?clamp(inc?(a-lo)/(hi-lo):(hi-a)/(hi-lo),0,1):uT;L.dir=L.u===null?0:u-L.u;L.uPrev=L.u;L.u=u;L.uT=uT;L.a=a;L.A=A;
  // the lifter's side for a check → yours: its working side is your working side
  const val=key=>key==='lean'||X.ext[key]?A[key]:A[key.slice(0,-1)+(key.slice(-1)===X.dSide?act:act==='L'?'R':'L')];
  L.val=val;
  // ready: hold still at either end of the rep
  if(L.st==='find'||L.st==='calib'){const zone=uT>=.6?'hi':uT<=.4?'lo':null;
    if(zone&&Math.abs(L.dir)<.025){L.hold=(L.st==='calib'&&L.start===zone?L.hold:0)+1;L.st='calib';L.start=zone;L.msg='Hold still…';
      if(L.hold>=12){L.st='top';L.msg='Ready. Go when you are.';if(!L.reps.length)lvSay('Ready. Go when you are.');}}
    else{L.st='find';L.hold=0;L.msg='Get into the start position and hold still.';}
    return;}
  const p=L.start==='hi'?1-u:u; // how far from the start end
  if(L.uPrev!==null&&L.uPrev>.85&&u<=.85)L.eccA=t;
  let R=L.rep;
  if(L.st==='top'&&p>.3){L.st='go';R=L.rep={t0:t,pMax:p,ext:{},ecc:null,eccA:null};L.warn=null;}
  if(R){// the extremes of every angle this rep (as the lifter's side maps to yours)
    for(const ck of X.checks){if(ck.tempo)continue;const v=val(ck.key);if(v===null||v===undefined)continue;const e=R.ext[ck.key]||(R.ext[ck.key]={min:1e9,max:-1e9});e.min=Math.min(e.min,v);e.max=Math.max(e.max,v);}
    const dv=val(X.dj);if(dv!==null&&dv!==undefined){const e=R.ext.drive||(R.ext.drive={min:1e9,max:-1e9});e.min=Math.min(e.min,dv);e.max=Math.max(e.max,dv);}
    // lowering time: u from .85 down to .15 (the clock starts before the rep counts as started, at the top)
    if(L.uPrev!==null&&L.uPrev>.15&&u<=.15&&L.eccA!=null&&R.ecc===null)R.ecc=t-L.eccA;
    R.pMax=Math.max(R.pMax,p);
    if(L.st==='go'&&p<R.pMax-.15&&R.pMax>=.45)L.st='back';
    if(L.st==='back'&&p>R.pMax){L.st='go';}
    // said while it happens: an angle past the mistake's line (falling short shows only at the end of the rep)
    let w=null;for(const ck of X.checks){if(ck.tempo)continue;const e=R.ext[ck.key];if(!e)continue;const v=ck.w==='min'?e.min:e.max;
      if(ck.sep<0&&ck.w==='min'&&v<ck.thr||ck.sep>0&&ck.w==='max'&&v>ck.thr){w=ck.k;break;}}
    if(w&&w!==L.warn)L.msg=FORMS[w].warn+'!';L.warn=w;
    if(p<.15&&(L.st==='back'||L.st==='go')){L.st='top';L.rep=null;R.t1=t;if(R.pMax>=.45)anyRep(R);else L.warn=null;}}}
function anyGrade(R){const X=LIVE.X,is=[],hit=[];
  for(const ck of X.checks){if(ck.tempo){if(R.ecc!==null&&R.ecc<ck.thr)is.push(ck.k);continue;}
    const e=R.ext[ck.key];if(!e)continue;const v=ck.w==='min'?e.min:e.max;if(ck.sep>0?v>ck.thr:v<ck.thr)hit.push(ck);}
  // of the mistakes read off the same angle the same way, only the furthest one passed (a flared rep is not also a half rep)
  for(const ck of hit)if(!hit.some(o=>o!==ck&&o.key===ck.key&&o.w===ck.w&&Math.sign(o.sep)===Math.sign(ck.sep)&&Math.abs(o.thr-ck.thr)>0&&(ck.sep>0?o.thr>ck.thr:o.thr<ck.thr)))is.unshift(ck.k);
  return is;}
function anyRep(R){const L=LIVE;R.n=L.reps.length+1;R.is=anyGrade(R);L.reps.push(R);L.warn=R.is[0]||null;L.lastRepT=R.t1;
  const F=R.is.length?FORMS[R.is[0]]:null;L.msg=F?F.btn+': '+F.fix.toLowerCase().replace(/\.$/,''):'Good rep.';
  lvSay(R.n+'. '+(F?F.warn+'.':'Good.'));liveFlash(R.n+(F?' · '+F.warn:' ✓'),!F);anyStats(true);}

// ---- every frame while the camera runs: you (right), the right way keeping your rhythm (left)
function anyTick(){const L=LIVE,X=L.X,now=performance.now()/1000,dt=TEST?1/30:clamp(now-(L.tt||now),0,.1);L.tt=now;if(!X||!X.ok)return;
  const G=FORMS.good,u=L.uT==null?(L.start==='lo'?0:1):L.uT;splitOn=true;twin.root.visible=true;
  L.us=L.us===undefined||L.us===null?u:L.us+(u-L.us)*(1-Math.exp(-dt*14));
  // the right way: heads for the far end while you go, comes back as you do, at its own pace
  const far=L.start==='lo'?1:0,home=L.start==='lo'?0:1,tg=L.st==='go'?far:home;if(L.twinU===null)L.twinU=home;
  L.twinU+=clamp(tg-L.twinU,-dt/G.lower,dt/G.press);
  const bOf=(uu,d)=>d<-.002?{u:uu,phase:0,k:1-uu}:d>.002?{u:uu,phase:2,k:uu}:{u:uu,phase:uu>.5?3:1,k:.5};
  const tb=bOf(L.twinU,tg-L.twinU);EX.pose(twin,G,tb,L.twinU,ST.P);frame(twin,ST);twinProps=propState(ST.P);setGlows(MU2,EX,G,tb,false);
  // you: the right way at your point in the rep, or the mistake you're making (when it's not just the range, which your rep already shows)
  const ck=L.warn&&X.checks.find(c=>c.k===L.warn),F=ck&&ck.key!==X.dj?FORMS[L.warn]:G,hb=bOf(L.us,L.dir);
  EX.pose(hero,F,hb,L.us,ST.P);frame(hero,ST);heroProps=propState(ST.P);setGlows(MU,EX,FORMS[L.warn]||G,hb,false);
  warnAt=L.warn;
  if(hb.phase!==lastPhase){lastPhase=hb.phase;document.querySelectorAll('#steps button').forEach((s,i)=>s.classList.toggle('on',i===hb.phase));}
  const n=L.reps.length,g=L.reps.filter(r=>!r.is.length).length;$('#rep').textContent=n?`Rep ${n} · ${g} good`:'Camera on';
  $('#sub').innerHTML=L.msg?'<b>Coach:</b> '+esc(L.msg):'';
  if(L.src==='cam'&&n&&L.st==='top'&&L.lastRepT&&L.seenT-L.lastRepT>8&&!L.ending){L.ending=true;liveEnd();}
  L.uiT=(L.uiT||0)+dt;if(L.uiT>.12){L.uiT=0;anyStats();}}
function anyTags(tL,tR){const L=LIVE,X=L.X,last=L.reps[L.reps.length-1];if(!X)return;const nm=X.dType;
  tL.innerHTML=`✓ Right way<small>${nm} ${Math.round(X.lo)}°–${Math.round(X.hi)}°</small>`;
  tR.className='stag '+(L.warn?'bad':last&&!last.is.length&&L.st==='top'?'ok':'you');
  const R=L.rep||last,e=R&&R.ext.drive;
  tR.innerHTML=(L.warn?'✕ '+FORMS[L.warn].tag:'◉ You, live')+'<small>'+(L.st==='find'||L.st==='calib'?'hold the start position':
    L.a==null?'step into the picture':`${nm} ${Math.round(L.a)}°`+(e?` · this rep ${Math.round(e.min)}°–${Math.round(e.max)}°`:''))+'</small>';}
function anyStats(force){const L=LIVE,X=L.X;if(L.phase!=='run'||!X)return;const R=L.rep,last=L.reps[L.reps.length-1],e=(R||last)&&(R||last).ext.drive;
  const pill=(lab,val,cls)=>`<div class="${cls}"><span>${lab}</span><b>${val}</b></div>`,full=X.T[0][1]<X.T[20][1]?X.hi:X.lo;
  // range: how far your rep got toward the right way's end of the movement
  const reach=e?(X.T[0][1]<X.T[20][1]?e.max:e.min):null,ok=reach===null?'':Math.abs(reach-full)<LVA.sep?'ok':'bad';
  const ecc=last&&last.ecc!=null?last.ecc:null,tempo=X.checks.find(c=>c.tempo);
  const h=`<div class="lmet">${pill(X.dType[0].toUpperCase()+X.dType.slice(1),L.a==null?'—':Math.round(L.a)+'°','')}${pill('Range',reach===null?'—':Math.round(reach)+'° / '+Math.round(full)+'°',ok)}`+
    `${pill('Lowering',ecc===null?'—':ecc.toFixed(1)+' s',ecc===null?'':tempo&&ecc<tempo.thr?'bad':'ok')}</div>`+
    `<ol class="lreps">${L.reps.length?L.reps.map(r=>`<li class="${r.is.length?'bad':'ok'}" title="${esc(r.is.map(k=>FORMS[k].btn).join(', ')||'Good rep')}">${r.n} ${r.is.length?esc(FORMS[r.is[0]].btn):'✓'}</li>`).join(''):'<li class="none">Reps show up here</li>'}</ol>`;
  if(force||h!==L.lastStats){L.lastStats=h;$('#lvStats').innerHTML=h;}}
// the set's numbers for the coach (Cerebras): the measurements per rep, and what they mean
function anyRepData(r){const X=LIVE.X,e=r.ext.drive||{};const m={[X.dType+'_min_deg']:e.min,[X.dType+'_max_deg']:e.max,lowering_s:r.ecc};
  for(const ck of X.checks){if(ck.tempo||!r.ext[ck.key])continue;m[lvName(ck)]=ck.w==='min'?r.ext[ck.key].min:r.ext[ck.key].max;}
  return {n:r.n,flags:r.is,m};}
function anyLegend(){const X=LIVE.X;return `Angles in degrees from the camera picture. ${X.dType}_min_deg / ${X.dType}_max_deg: the ${X.dType} angle's range in the rep (the right way goes ${Math.round(X.lo)}° to ${Math.round(X.hi)}°). lowering_s: seconds to lower (the right way: ${X.ecc.toFixed(1)} s). `+
  Object.values(X.ext).map(x=>`${x.name}_*_${x.unit}: ${x.info}.`).join(' ')+' '+
  X.checks.filter(c=>!c.tempo).map(c=>`${lvName(c)}: right way ${Math.round(c.g)}, "${FORMS[c.k].btn}" ${Math.round(c.f)}.`).join(' ');}
const lvName=c=>c.key==='lean'?'torso_tilt_'+c.w+'_deg':LIVE.X.ext[c.key]?LIVE.X.ext[c.key].name+'_'+c.w+'_'+LIVE.X.ext[c.key].unit:c.key.slice(0,-1)+'_'+c.w+'_deg';
