// ---------------------------------------------------------------- Check my form: the camera grades your own squat
// MediaPipe Pose Landmarker (Google, Apache 2.0) runs in this browser on the webcam, or on a video you pick: 33 body points a
// frame, in metres. Each frame gives the thigh angle (how deep), the torso lean and how far the knees drift in; a rep counter
// turns those into reps and grades each one with the exercise's own mistakes (FORMS). Meanwhile the lifter in the gym copies you
// live (right half of the split) next to the right way, which keeps your rhythm (left half). The video never leaves the browser;
// at the end of the set only the rep numbers go to the coach (Cerebras) for a short verdict, and a note goes to the coach's memory.
// Made for phones first: the phone propped up across the room is the camera, voice and a big flash carry the feedback, and the
// screen stays awake. Phones get the full model too: the lite one (5.8 MB vs 9.4) read a clean squat's chest at 79° instead of
// 40° with the camera above head height and called the hips shooting up (?lite tries it).
const LV_PHONE=matchMedia('(pointer:coarse)').matches,LV_LITE=/[?&]lite/.test(location.search);
const MP_URL='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14',
  MP_MODEL=`https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_${LV_LITE?'lite':'full'}/float16/1/pose_landmarker_${LV_LITE?'lite':'full'}.task`;
// what the camera can check, per exercise (the squat so far): how to stand, and the word said after a rep with each mistake
const LIVE_EX={squat:{setup:LV_PHONE?['Prop the phone upright at hip height, 2–3 m away (against a bottle or a wall)','Turn about 45° to it, head to feet in view','Squat. I call out every rep, and the lifter copies you']
    :['Camera at hip height, 2–3 m away','Turn about 45° to it, head to feet in view','Squat. I grade every rep and the lifter copies you'],
  cue:{good:'Good.',half:'Sit lower.',kneeIn:'Knees out.',goodMorning:'Chest up.'}}};
const liveSupported=k=>!!LIVE_EX[k]||!!(EXS[k]&&EXS[k].kind!=='hold'); // the squat's checks are hand-made; the rest are worked out (36-formcheck-any.js)
const liveRead=(...a)=>LIVE_EX[EXK]?liveFrame(...a):anyFrame(...a);
// ?form (the link to try it on a phone): the landing button walks you straight to the squat rack and opens the camera panel
const LV_DEEP=(()=>{const m=location.search.match(/[?&]form(?:=([A-Za-z]+))?(?:&|$)/);return !m?null:m[1]&&EXS[m[1]]&&liveSupported(m[1])?m[1]:'squat';})(); // ?form, ?form=pushup
// the thresholds a rep is graded with (cm and degrees, from the camera's metric body points)
// leanRise: the app's own lifter, filmed by the real model, showed a 17° chest drop on clean reps (camera at head height; 1° at hip
// height) and 41–49° when the hips shoot up
const LV={halfCm:10,caveCm:4,leanRise:25,leanMax:66,start:.22,valid:.3};
const LIVE={on:false,phase:'off',reps:[],s:{k:0,hinge:4,knee:0},goal:{k:0,hinge:4,knee:0},twinK:0,st:'find',warn:null,m:null,mute:false};
const lvEl=$('#live'),lvVid=$('#lvVid'),lvCan=$('#lvCan');
const lvSay=t=>{if(!LIVE.mute)speak(t);};

// ---- the pose model: loaded once, the first time the panel opens (about 10 MB of model and 9 MB of runtime, then cached)
let lvModel=null;
function loadPoseModel(){if(lvModel)return lvModel;
  lvModel=(async()=>{const vision=await import(MP_URL+'/vision_bundle.mjs');const fs=await vision.FilesetResolver.forVisionTasks(MP_URL+'/wasm');
    const opts=delegate=>({baseOptions:{modelAssetPath:MP_MODEL,delegate},runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5});
    try{return {vision,lm:await vision.PoseLandmarker.createFromOptions(fs,opts('GPU'))};}
    catch(e){console.warn('[form] GPU pose model failed, using the CPU',e);return {vision,lm:await vision.PoseLandmarker.createFromOptions(fs,opts('CPU'))};}})();
  lvModel.catch(()=>{lvModel=null;});return lvModel;}

// ---- reading a frame: body points → depth, lean, knees; then the rep counter
const LV_NEED=[11,12,23,24,25,26,27,28]; // shoulders, hips, knees, ankles
function liveFrame(world,norm,t,ar=1){const L=LIVE;
  if(!world||!world.length||!norm)return liveLost(t,'I can’t see you. Step into the picture, head to feet.');
  // seen = a shoulder and at least one whole leg (hip, knee, ankle): side-on, the far leg hides behind the near one
  const vis=i=>norm[i]?(norm[i].visibility??1):1,legOK=[[23,25,27],[24,26,28]].map(j=>j.every(i=>vis(i)>=.5));
  if(!legOK[0]&&!legOK[1]||Math.max(vis(11),vis(12))<.5)return liveLost(t,'Step back: I need to see you from head to feet.');
  L.seenT=t;const first=!L.P;if(first){L.P=[];L.Q=[];}
  // P: the model's 3D body points (metres; MediaPipe has y down and z toward the camera); Q: the same points in the picture
  // (x scaled by the picture's shape so both axes share a unit, y up)
  for(const i of LV_NEED){const p=V(world[i].x,-world[i].y,-world[i].z),q=V(norm[i].x*ar,-norm[i].y,0);
    L.P[i]=first?p:L.P[i].lerp(p,.5);L.Q[i]=first?q:L.Q[i].lerp(q,.5);}
  const P=L.P,Q=L.Q,mid=(A,i,j)=>A[i].clone().add(A[j]).multiplyScalar(.5),up=L.up||V(0,1,0),LEGS=[[23,25,27],[24,26,28]];
  // which way you face: side 0 = facing the camera, 1 = side-on (from the line through the hips)
  const lat=P[23].clone().sub(P[24]);lat.addScaledVector(up,-lat.dot(up)).normalize();const side=Math.abs(lat.z);
  // knees: how far each knee sits inside the line from its hip to its ankle, sideways (3D); only readable with both legs in view
  // and the hips seen more from the front than from the side
  const frontal=side<.8&&legOK[0]&&legOK[1];
  const inw=(h,k,a,s)=>P[k].clone().sub(mid(P,h,a)).dot(lat)*s*100;const caveRaw=frontal?(inw(23,25,27,-1)+inw(24,26,28,1))/2:null;
  const knee=(o=>o.reduce((a,j)=>a+P[j[0]].clone().sub(P[j[1]]).angleTo(P[j[2]].clone().sub(P[j[1]]))/DEG,0)/o.length)(LEGS.filter((j,i)=>legOK[i]));
  // stand tall for half a second first. That sets, in 3D and in the picture, which way is up (the camera may be tilted) and how
  // long your thighs look when upright; the knees' standing line is kept while you stand between reps.
  // Standing = thighs upright; the knee test is loose (seen from above and in front, a straight knee can read as low as ~145°).
  if(!L.u2){const th3=(h,k)=>{const v=P[h].clone().sub(P[k]);return v.dot(up)/v.length();},rel3=LEGS.filter((j,i)=>legOK[i]).reduce((a,j,_,o)=>a+th3(j[0],j[1])/o.length,0);
    if(knee>135&&rel3>.8){if(L.st!=='calib'){L.st='calib';L.cal=[];}
      L.cal.push({u3:mid(P,11,12).sub(mid(P,27,28)).normalize(),u2:mid(Q,11,12).sub(mid(Q,27,28)).normalize(),l0:LEGS.map(j=>Q[j[0]].distanceTo(Q[j[1]])),th:LEGS.reduce((a,j)=>a+P[j[0]].distanceTo(P[j[1]])/2,0)});
      if(L.cal.length>=15){const C=L.cal,n=C.length,sum=f=>C.reduce((a,c)=>a+f(c),0)/n;
        L.up=C.reduce((a,c)=>a.add(c.u3),V()).normalize();L.u2=C.reduce((a,c)=>a.add(c.u2),V()).normalize();
        L.L0=[sum(c=>c.l0[0]),sum(c=>c.l0[1])];L.th=sum(c=>c.th);L.cave0=null;L.st='top';L.msg='Ready. Squat when you are.';if(!L.reps.length)lvSay('Ready. Squat when you are.');}
      else L.msg='Stand tall for a second…';}
    else{L.st='find';L.cal=null;L.msg='Stand tall, turned about 45° to the camera.';}
    L.goal={k:0,hinge:4,knee:0};L.m={depth:null,lean:null,knee,cave:null,frontal,side};return;}
  // depth from the picture: the hip's height above the knee over the thigh's standing length is cos(thigh angle), whichever way
  // you face; the 3D points' depth guesses along the camera's line of sight are what single cameras get wrong (the near thigh,
  // pointing at the camera at 45°, read 55° instead of 105° at the bottom). Both legs, the more visible one counting more.
  const u2=L.u2,w=[.2+vis(25),.2+vis(26)],relS=s=>Q[LEGS[s][0]].clone().sub(Q[LEGS[s][1]]).dot(u2)/L.L0[s];
  const rel=(relS(0)*w[0]+relS(1)*w[1])/(w[0]+w[1]),d=1-rel,depth=rel*L.th*100; // the hip joints above (+) or below (−) the knees, cm
  // torso lean from the 3D points (the picture's version is skewed by perspective: low, far-back hips look higher than they are,
  // so a 40° chest read 54° with the camera at hip height and 66° from head height; the 3D read 35°)
  const lean=Math.acos(clamp(mid(P,11,12).sub(mid(P,23,24)).normalize().dot(up),-1,1))/DEG;
  L.d=d;
  const cave=caveRaw===null||L.cave0==null?null:caveRaw-L.cave0;
  L.m={depth,lean,knee,cave,frontal,d,side};
  // the lifter copies you: the same thigh angle, the same torso lean, the knees in as far as yours
  L.goal={k:kFromRel(rel),hinge:clamp(lean,0,75),knee:cave!==null&&d>.25?clamp(cave/6*.45,-.12,.45):0};
  let R=L.rep;
  if(L.st==='top'){
    if(caveRaw!==null&&d<.12)L.cave0=L.cave0==null?caveRaw:lerp(L.cave0,caveRaw,.1); // the knees' line while standing
    if(d<.08)LEGS.forEach((j,i)=>{if(legOK[i])L.L0[i]=lerp(L.L0[i],Q[j[0]].distanceTo(Q[j[1]]),.05);}); // you may step closer or further
    if(d>LV.start){L.st='down';R=L.rep={t0:t,dMax:d,depth,leanB:lean,leanMax:lean,leanRise:0,knee,cave:null,tB:t,down:[],ex:null};L.warn=null;}}
  if(R&&(L.st==='down'||L.st==='up')){
    if(d>R.dMax){R.dMax=d;R.depth=depth;R.knee=knee;R.tB=t;if(L.st==='up')L.st='down';}
    // the chest at the bottom (its steepest reading near full depth: one frame wobbles by ~10°), and on the way down at each depth
    if(L.st==='down'){if(d>=R.dMax*.85)R.leanB=Math.max(R.leanB,lean);const b=R.down[Math.round(d/.05)]||(R.down[Math.round(d/.05)]=[0,0]);b[0]+=lean;b[1]++;}
    R.leanMax=Math.max(R.leanMax,lean);if(cave!==null&&d>.35)R.cave=Math.max(R.cave??-99,cave);R.sideSum=(R.sideSum||0)+side;R.sideN=(R.sideN||0)+1;
    if(L.st==='down'&&d<R.dMax-.12)L.st='up';
    // hips shooting up: rising, the chest is further down than it was at the same depth on the way down (a clean rep retraces
    // its path; comparing like with like also cancels the camera's own bias at this angle)
    if(L.st==='up'&&d<R.dMax*.9&&d>R.dMax*.3){const base=leanDownAt(R,d);if(base!==null){const ex=lean-base;R.ex=R.ex===null?ex:R.ex*.6+ex*.4;R.leanRise=Math.max(R.leanRise,R.ex);}}
    // said while it happens: knees caving at the bottom, chest dropping on the way up
    const wn=cave!==null&&d>.35&&cave>=LV.caveCm?'kneeIn':L.st==='up'&&R.leanRise>=LV.leanRise?'goodMorning':null;
    if(wn&&wn!==L.warn)L.msg=FORMS[wn].warn+'! '+LIVE_EX[EXK].cue[wn];L.warn=wn;
    if(L.st==='up'&&d<.12){R.t1=t;L.st='top';L.rep=null;if(R.dMax>=LV.valid)liveRep(R);else L.warn=null;}}}
function leanDownAt(R,d){const b=Math.round(d/.05);for(const o of [0,-1,1,-2,2]){const x=R.down[b+o];if(x&&x[1])return x[0]/x[1];}return null;}
function liveLost(t,msg){const L=LIVE;L.msg=msg;L.goal={k:0,hinge:4,knee:0};L.m=null;
  if(L.seenT!==undefined&&t-L.seenT>1.5&&L.st!=='find'){L.st='find';L.rep=null;L.P=null;L.Q=null;L.up=null;L.u2=null;L.warn=null;}} // gone a while: stand tall again
function liveGrade(R){const is=[],caved=R.cave!==null&&R.cave>=LV.caveCm;
  // seen straight from the front, caved knees throw off the model's depth guess (the app's own knees-cave squat, at full depth,
  // read 10 cm above parallel with a 15° chest drop from the front, and clean from 20° to the side): then the knees are the call
  const blur=caved&&R.side<.3;
  if(caved)is.push('kneeIn');
  if(!blur&&(R.leanRise>=LV.leanRise||R.leanMax>=LV.leanMax))is.push('goodMorning');
  if(R.depth>LV.halfCm+(blur?8:0))is.push('half');
  return is;}
function liveRep(R){const L=LIVE;R.n=L.reps.length+1;R.side=R.sideSum/R.sideN;R.is=liveGrade(R);L.reps.push(R);L.warn=R.is[0]||null;L.lastRepT=R.t1;
  const cue=LIVE_EX[EXK].cue;L.msg=R.is.length?FORMS[R.is[0]].btn+': '+FORMS[R.is[0]].fix.toLowerCase().replace(/\.$/,''):'Good rep. '+depthTxt(R.depth)+'.';
  lvSay(R.n+'. '+(R.is.length?cue[R.is[0]]:cue.good));liveFlash(R.n+(R.is.length?' · '+cue[R.is[0]].replace(/\.$/,''):' ✓'),!R.is.length);renderLiveStats(true);}
// big enough to read from across the room
function liveFlash(t,ok){const el=$('#lvFlash');el.textContent=t;el.className='flash '+(ok?'ok':'bad');el.hidden=false;clearTimeout(liveFlash.t);liveFlash.t=setTimeout(()=>{el.hidden=true;},1800);}
const SQ_LEGEND='depth_cm = how far the hip joints stayed above the knees at the bottom (negative = below parallel, which is good); lean_bottom and lean_max = torso angle from vertical in degrees; lean_rise_up = how much further the chest dropped on the way up than at the same depth on the way down (hips shooting up); knees_in_cm = how far the knees caved in at the bottom (null when the camera could not see it); down_s and up_s = seconds lowering and rising.';
const depthTxt=v=>v<=0?'Hips '+Math.round(-v)+' cm below the knees':'Hips '+Math.round(v)+' cm above the knees';

// ---- the lifter's depth: the squat's k (0 standing, 1 full depth) for a thigh angle, read off the lifter's own legs once
function liveTable(){const keep=snapshot(hero),props=propState(ST.P),T=[];
  for(let i=0;i<=24;i++){const k=i/24;squatPose(hero,null,k);const B=hero.bones;
    const c=(h,kn)=>{const a=wpos(B[h]),b=wpos(B[kn]);return (a.y-b.y)/a.distanceTo(b);};T.push([k,(c('LeftUpLeg','LeftLeg')+c('RightUpLeg','RightLeg'))/2]);}
  applySnap(hero,keep);setPropState(props);return T;}
function kFromRel(rel){const T=LIVE.T;if(!T||rel>=T[0][1])return 0;
  for(let i=1;i<T.length;i++)if(rel>=T[i][1]){const [k0,r0]=T[i-1],[k1,r1]=T[i];return k0+(k1-k0)*(r0-rel)/(r0-r1||1);}return 1;}

// ---- every frame while the camera runs (in place of the animated rep): you on the right, the right way on the left
function liveTick(){const L=LIVE;if(!LIVE_EX[EXK])return anyTick();if(!L.T)L.T=liveTable();const now=performance.now()/1000,dt=TEST?1/30:clamp(now-(L.tt||now),0,.1);L.tt=now; // its own clock: Pause doesn't stop you
  const a=1-Math.exp(-dt*12);for(const k in L.goal)L.s[k]+=(L.goal[k]-L.s[k])*a;
  splitOn=true;twin.root.visible=true;
  // the right way keeps your rhythm: it heads for full depth while you go down, and comes up as you do
  const R=L.rep,tg=L.st==='down'?1:L.st==='up'&&R?clamp(L.d/R.dMax,0,1):0;L.twinK+=clamp(tg-L.twinK,-dt/.9,dt/1.5);
  const b=L.st==='down'?{phase:0,k:clamp(L.d,0,1)}:L.st==='up'&&R?{phase:2,k:clamp(1-L.d/R.dMax,0,1)}:{phase:3,k:.5};
  squatPose(twin,ST.P,smooth(clamp(L.twinK,0,1)));frame(twin,ST);twinProps=propState(ST.P);setGlows(MU2,EX,FORMS.good,b,false);
  squatPose(hero,ST.P,clamp(L.s.k,0,1),{hinge:L.s.hinge,kneeAbs:L.s.knee});frame(hero,ST);heroProps=propState(ST.P);setGlows(MU,EX,FORMS[L.warn]||FORMS.good,b,false);
  warnAt=L.warn;
  if(b.phase!==lastPhase){lastPhase=b.phase;document.querySelectorAll('#steps button').forEach((s,i)=>s.classList.toggle('on',i===b.phase));}
  const n=L.reps.length,g=L.reps.filter(r=>!r.is.length).length;$('#rep').textContent=n?`Rep ${n} · ${g} good`:'Camera on';
  $('#sub').innerHTML=L.msg?'<b>Coach:</b> '+esc(L.msg):'';
  // a set ends by itself once you stand still for 8 seconds after a rep
  if(L.src==='cam'&&n&&L.st==='top'&&L.lastRepT&&L.seenT-L.lastRepT>8&&!L.ending){L.ending=true;liveEnd();}
  L.uiT=(L.uiT||0)+dt;if(L.uiT>.12){L.uiT=0;renderLiveStats();}}

// ---- the camera (or a video file)
async function liveStart(file){const L=LIVE;if(L.phase==='load'||L.phase==='run')return;
  if(!file)lvSay('Step back so I can see you from head to feet.'); // said in the tap: phones only let a page talk after a tap
  Object.assign(L,{phase:'load',src:file?'file':'cam',reps:[],rep:null,st:'find',P:null,Q:null,up:null,u2:null,cave0:null,warn:null,m:null,seenT:undefined,lastRepT:0,ending:false,msg:'',twinK:0});anyReset();
  renderLive();liveMsg(file?'Loading the pose model…':'Allow the camera, then step back…');
  try{const modelP=loadPoseModel();
    if(file){lvVid.srcObject=null;lvVid.src=URL.createObjectURL(file);lvVid.loop=false;lvVid.muted=true;}
    else{if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error('This page can’t use the camera here (it needs https or localhost). Use a video instead.');
      const st=await navigator.mediaDevices.getUserMedia({video:{facingMode:L.facing||'user',width:{ideal:640},height:{ideal:480}},audio:false});
      if(L.phase!=='load'){st.getTracks().forEach(t=>t.stop());return;} // closed while the browser asked
      L.stream=st;lvVid.srcObject=st;}
    await new Promise((res,rej)=>{if(lvVid.readyState>=1)return res();lvVid.onloadedmetadata=()=>res();lvVid.onerror=()=>rej(new Error('That video won’t play here.'));});
    liveFit();liveMsg('Loading the pose model…');L.model=await modelP;if(L.phase!=='load')return; // closed meanwhile
    await lvVid.play();L.phase='run';L.on=true;setPreset(LIVE_EX[EXK]?'three':EX.cam||'side');liveAwake(true);liveRes(true);renderLive();liveLoop();
    lvVid.onended=()=>{if(L.phase==='run')liveEnd();};}
  catch(e){console.warn('[form]',e);liveCamOff();L.phase='intro';
    const m=e&&e.name==='NotAllowedError'?'The camera is blocked. Allow it from the icon in the address bar, or use a video instead.':e&&e.name==='NotFoundError'?'I can’t find a camera on this device. Try a video instead.':(e&&e.message)||'The camera didn’t start.';
    renderLive(m);}}
function liveLoop(){const L=LIVE,v=lvVid,id=L.loopId=(L.loopId||0)+1; // one loop per start: a frame callback left from the last stream stops
  const go=()=>{if(L.phase!=='run'||L.loopId!==id)return;
    if(v.readyState>=2&&v.currentTime!==L.vt){L.vt=v.currentTime;const ts=Math.max(performance.now(),(L.ts||0)+1);L.ts=ts;let r=null;
      try{r=L.model.lm.detectForVideo(v,ts);}catch(e){console.warn('[form]',e);}
      if(r){const n=r.landmarks&&r.landmarks[0];liveRead(r.worldLandmarks&&r.worldLandmarks[0],n,ts/1000,(v.videoWidth||4)/(v.videoHeight||3));liveDraw(n);}}
    if(v.requestVideoFrameCallback)v.requestVideoFrameCallback(go);else requestAnimationFrame(go);};
  go();}
// the screen stays on through the set (nobody touches the phone mid-squat); the 3D view draws at a lower resolution on phones
async function liveAwake(on){const L=LIVE;try{if(on&&!L.lock&&navigator.wakeLock){L.lock=await navigator.wakeLock.request('screen');L.lock.addEventListener('release',()=>{L.lock=null;});}
  else if(!on&&L.lock){const l=L.lock;L.lock=null;await l.release();}}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&LIVE.phase==='run')liveAwake(true);}); // a wake lock ends when the page hides
function liveRes(on){if(!LV_PHONE)return;const r=on?1:Math.min(devicePixelRatio,1.75);if(renderer.getPixelRatio()===r)return;renderer.setPixelRatio(r);if(composer.setPixelRatio)composer.setPixelRatio(r);resize();}
// front camera (see yourself) or the back one (sharper): only offered when the phone has both
function liveFlip(){const L=LIVE;L.facing=(L.facing||'user')==='user'?'environment':'user';if(L.phase!=='run'||L.src!=='cam')return;
  liveCamOff();L.phase='intro';liveStart();}
function liveCamOff(){const L=LIVE;liveAwake(false);liveRes(false);if(L.stream){L.stream.getTracks().forEach(t=>t.stop());L.stream=null;}
  lvVid.pause();if(lvVid.src&&lvVid.src.startsWith('blob:'))URL.revokeObjectURL(lvVid.src);lvVid.removeAttribute('src');lvVid.srcObject=null;lvVid.onended=null;lvVid.load();}
// the picture box takes the video's shape (phone clips are tall)
function liveFit(){const w=lvVid.videoWidth||640,h=lvVid.videoHeight||480,ar=w/h,box=$('#lvCam');box.style.aspectRatio=w+' / '+h;box.style.setProperty('--ar',ar.toFixed(3));box.style.width=`min(100%, ${Math.round(300*ar)}px)`;
  const mir=LIVE.src==='cam'&&(LIVE.facing||'user')==='user';lvVid.classList.toggle('mirror',mir);lvCan.classList.toggle('mirror',mir);}
function liveMsg(t){$('#lvMsg').textContent=t||'';$('#lvMsg').hidden=!t;}

// ---- the skeleton over the video: green when it's right, red where the mistake is; the dashed line is knee height
const LV_BONES=[[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28],[27,29],[29,31],[27,31],[28,30],[30,32],[28,32]];
function liveDraw(n){const L=LIVE,w=lvVid.videoWidth||640,h=lvVid.videoHeight||480;if(lvCan.width!==w||lvCan.height!==h){lvCan.width=w;lvCan.height=h;}
  const g=lvCan.getContext('2d');g.clearRect(0,0,w,h);if(!n){liveMsg(L.msg);return;}liveMsg(L.st==='find'||L.st==='calib'?L.msg:'');
  const X=i=>n[i].x*w,Y=i=>n[i].y*h,lw=Math.max(2.5,w/180),ready=L.st!=='find'&&L.st!=='calib';
  if(ready){const ky=(Y(25)+Y(26))/2,x0=Math.min(X(25),X(26),X(23),X(24))-w*.1,x1=Math.max(X(25),X(26),X(23),X(24))+w*.1;
    g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=lw*.7;g.setLineDash([lw*3,lw*2.5]);g.beginPath();g.moveTo(x0,ky);g.lineTo(x1,ky);g.stroke();g.setLineDash([]);}
  const bad=L.warn,is=(a,b,...pairs)=>pairs.some(([x,y])=>x===a&&y===b);
  for(const [a,b] of LV_BONES){if((n[a].visibility??1)<.4||(n[b].visibility??1)<.4)continue;
    const legs=is(a,b,[23,25],[25,27],[24,26],[26,28]),torso=is(a,b,[11,23],[12,24]),girdle=is(a,b,[23,24],[11,12]);
    g.strokeStyle=bad==='kneeIn'&&legs||bad==='goodMorning'&&torso?'#ff5a47':legs||torso||girdle?'#2fd18a':'rgba(255,255,255,.85)';
    g.lineWidth=lw;g.lineCap='round';g.beginPath();g.moveTo(X(a),Y(a));g.lineTo(X(b),Y(b));g.stroke();}
  for(const i of [11,12,23,24,25,26,27,28]){g.fillStyle='#fff';g.beginPath();g.arc(X(i),Y(i),lw*1.1,0,Math.PI*2);g.fill();}
  // the hip joints turn green once they reach knee height
  if(ready){const below=(Y(23)+Y(24))/2>=(Y(25)+Y(26))/2-h*.005;for(const i of [23,24]){g.fillStyle=below?'#2fd18a':'#ffb020';g.beginPath();g.arc(X(i),Y(i),lw*2,0,Math.PI*2);g.fill();}}}

// the split's two tags: the right way (what it aims for) and you (your numbers, live; red while a mistake shows)
function liveTags(tL,tR){if(!LIVE_EX[EXK])return anyTags(tL,tR);const L=LIVE,m=L.m,last=L.reps[L.reps.length-1];
  tL.innerHTML='✓ Right way<small>parallel or deeper · chest ~40°</small>';
  tR.className='stag '+(L.warn?'bad':last&&!last.is.length&&L.st==='top'?'ok':'you');
  tR.innerHTML=(L.warn?'✕ '+FORMS[L.warn].tag:'◉ You, live')+'<small>'+(!m?'step into the picture':L.st==='find'||L.st==='calib'?'stand tall a second':
    `${Math.abs(Math.round(m.depth))} cm ${m.depth<=0?'below':'above'} parallel · chest ${Math.round(m.lean)}°`)+'</small>';}
// ---- the panel: how to stand → live (picture, three numbers, the reps so far) → the set's verdict
function liveOpen(){if(flow!=='exercise'||!liveSupported(EXK))return;closePanels();$('#camNudge').hidden=true;lvEl.hidden=false;setTool('tCam',true);LIVE.phase='intro';renderLive();loadPoseModel();
  if(LIVE.cams===undefined&&navigator.mediaDevices&&navigator.mediaDevices.enumerateDevices)navigator.mediaDevices.enumerateDevices().then(ds=>{LIVE.cams=ds.filter(d=>d.kind==='videoinput').length;}).catch(()=>{});}
function renderLive(err){const L=LIVE,X=LIVE_EX[EXK],setup=X?X.setup:anySetup(EX),ok=X||anyProfile(EX).ok;$('#lvEye').textContent='Check my form · '+EX.name;
  const cam=$('#lvCam'),st=$('#lvStats'),body=$('#lvBody'),row=$('#lvRow');
  cam.hidden=!(L.phase==='load'||L.phase==='run');st.hidden=L.phase!=='run';
  if(L.phase==='intro'){body.innerHTML=`<h3>Check your ${esc(EX.name.toLowerCase())}</h3>${ok?`<ol class="lsetup">${setup.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`:''}${X?'':anyChecksHtml(EX)}${err?`<p class="warn">${esc(err)}</p>`:''}`;
    row.innerHTML=ok?`<button class="tg on" data-l="cam">Start the camera</button><button class="tg" data-l="file">Use a video</button><button class="tg" data-l="close">Close</button>`:`<button class="tg" data-l="close">Close</button>`;}
  else if(L.phase==='load'||L.phase==='run'){body.innerHTML='';row.innerHTML=`<button class="tg on" data-l="end">End set</button>${L.src==='cam'&&L.cams>1?'<button class="tg" data-l="flip">Flip camera</button>':''}<button class="tg" data-l="close">Stop</button>`;renderLiveStats(true);}
  $('#lvPriv').hidden=L.phase==='done';}
function renderLiveStats(force){if(!LIVE_EX[EXK])return anyStats(force);const L=LIVE;if(L.phase!=='run')return;const m=L.m,R=L.rep,last=L.reps[L.reps.length-1];
  // while in a rep: the deepest point so far; standing: the last rep's
  const dep=R?R.depth:last?last.depth:null,cave=R&&R.cave!==null?R.cave:m&&m.cave!==null&&L.st!=='top'?m.cave:last&&last.cave!==null?last.cave:null;
  const pill=(lab,val,cls)=>`<div class="${cls}"><span>${lab}</span><b>${val}</b></div>`;
  const h=`<div class="lmet">${pill('Depth',dep===null?'—':dep<=0?Math.round(-dep)+' cm below':Math.round(dep)+' cm above',dep===null?'':dep>LV.halfCm?'bad':'ok')}`+
    `${pill('Knees',m&&!m.frontal&&cave===null?'turn to me':cave===null?'—':cave>=LV.caveCm?'in '+Math.round(cave)+' cm':'track out',cave===null?'':cave>=LV.caveCm?'bad':'ok')}`+
    `${pill('Chest',m&&m.lean!=null?Math.round(m.lean)+'°':'—',m&&m.lean!=null?(m.lean>=LV.leanMax||L.warn==='goodMorning'?'bad':'ok'):'')}</div>`+
    `<ol class="lreps">${L.reps.length?L.reps.map(r=>`<li class="${r.is.length?'bad':'ok'}" title="${esc(r.is.map(k=>FORMS[k].btn).join(', ')||'Good rep')}">${r.n} ${r.is.length?esc(FORMS[r.is[0]].btn):'✓'}</li>`).join(''):'<li class="none">Reps show up here</li>'}</ol>`;
  if(force||h!==L.lastStats){L.lastStats=h;$('#lvStats').innerHTML=h;}}
// end of the set: what went right and wrong, then the coach's two lines (Cerebras) and a note for next time
async function liveEnd(){const L=LIVE;if(L.phase!=='run'&&L.phase!=='load')return;liveCamOff();L.phase='done';liveReset3D();
  const reps=L.reps,n=reps.length,good=reps.filter(r=>!r.is.length).length,cnt={};for(const r of reps)for(const k of r.is)cnt[k]=(cnt[k]||0)+1;
  const sq=!!LIVE_EX[EXK],top=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0]||null,best=n&&sq?Math.min(...reps.map(r=>r.depth)):0;
  const local=!n?(sq?'No reps counted. Turn about 45° to the camera, keep head to feet in view, and squat a little deeper than feels normal.':'No reps counted. Keep your whole body in view, hold the start position a second, then move through the full range.'):
    top?`${good} of ${n} reps clean. Most common: ${FORMS[top].btn.toLowerCase()} (${cnt[top]} of ${n}). ${FORMS[top].fix}`:`All ${n} reps clean.`+(sq?` Deepest: ${depthTxt(best).toLowerCase()}.`:'')+' Add a little weight or a few reps next set.';
  const lines=Object.keys(cnt).map(k=>`<li class="bad">${esc(FORMS[k].btn)} × ${cnt[k]}</li>`).join('')+(good?`<li class="ok">Clean × ${good}</li>`:'');
  $('#lvBody').innerHTML=`<h3>${n?`${n} rep${n>1?'s':''} · ${good} good`:'No reps yet'}</h3>${n?`<ol class="lreps">${lines}</ol>`:''}<p class="a" id="lvSum">${esc(local)}</p><p class="speed" id="lvSpeed" hidden></p>`;
  $('#lvRow').innerHTML=(top?`<button class="tg on" data-l="fix" data-f="${top}">Show me the fix</button>`:'')+`<button class="tg${top?'':' on'}" data-l="again">Another set</button><button class="tg" data-l="close">Done</button>`;
  renderLive();if(!n)return;
  const note=`${EX.name}: ${good} of ${n} reps clean`+(top?`; ${FORMS[top].btn.toLowerCase()} on ${cnt[top]}`:'')+` (camera check)`;
  if(!AI.on){memNote(note,{ex:EXK});lvSay(local);return;}
  $('#lvSum').classList.add('muted');const e=EX;
  try{const res=await aiPost('/api/form',{ex:{k:e.key,name:e.name},memory:memSummary(),
      mistakes:Object.keys(FORMS).filter(k=>k!=='good').map(k=>({k,name:FORMS[k].btn,fix:FORMS[k].fix})),
      legend:sq?SQ_LEGEND:anyLegend(),
      reps:reps.map(r=>sq?{n:r.n,flags:r.is,m:{depth_cm:Math.round(r.depth),lean_bottom:Math.round(r.leanB),lean_max:Math.round(r.leanMax),lean_rise_up:Math.round(r.leanRise),
        knees_in_cm:r.cave===null?null:Math.round(r.cave),down_s:+(r.tB-r.t0).toFixed(1),up_s:+(r.t1-r.tB).toFixed(1)}}:anyRepData(r))});
    if(L.phase!=='done'||EX!==e)return;
    $('#lvSum').textContent=res.say||local;$('#lvSum').classList.remove('muted');
    const c=res.t&&res.t.cerebras;if(c){$('#lvSpeed').hidden=false;$('#lvSpeed').textContent=`⚡ Cerebras · ${c.tps?c.tps.toLocaleString('en-US')+' tokens/s · ':''}${((c.modelMs||c.ms)/1000).toFixed(2)} s`;}
    if(res.focus)$('#lvSum').insertAdjacentHTML('afterend',`<p class="focus">Next set: <b>${esc(res.focus)}</b></p>`);
    memNote(res.remember||note,{ex:e.key});lvSay(res.say||local);}
  catch(err){console.warn('[form]',err);if(L.phase==='done'){$('#lvSum').classList.remove('muted');memNote(note,{ex:e.key});lvSay(local);}}}
// back to the animated rep, from wherever the camera left the lifter
function liveReset3D(){const L=LIVE;if(!L.on)return;L.on=false;L.T=null;splitOn=false;twin.root.visible=false;warnAt=null;
  if(flow==='exercise'&&EX){setForm('good');repT=matchRepStart();setPreset(EX.cam||'side');}}
function liveStop(){const L=LIVE;$('#camNudge').hidden=true;if(L.phase==='off')return;liveCamOff();L.phase='off';liveReset3D();lvEl.hidden=true;setTool('tCam',false);}
lvEl.addEventListener('click',e=>{const b=e.target.closest('[data-l]');if(!b)return;const a=b.dataset.l;
  if(a==='cam')liveStart();else if(a==='file')$('#lvFile').click();else if(a==='end')liveEnd();else if(a==='close')liveStop();else if(a==='flip')liveFlip();
  else if(a==='again'){const cam=LIVE.src==='cam';LIVE.phase='intro';if(cam)liveStart();else renderLive();} // after a video: choose again
  else if(a==='fix'){const f=b.dataset.f;liveStop();setForm(f);openMistakes();}});
$('#lvFile').addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(f)liveStart(f);});
$('#tCam').addEventListener('click',()=>{if(!lvEl.hidden){liveStop();return;}liveOpen();});
// arriving at an exercise the camera can check: say so (a button over the scene; phones hide the coach's hint line), or, from the
// ?form link, open the panel straight away
function liveArrived(k){const nd=$('#camNudge');nd.hidden=true;if(!liveSupported(k))return;
  if(LIVE.auto===k){LIVE.auto=null;setTimeout(()=>{if(EXK===k&&flow==='exercise')liveOpen();},700);return;}
  nd.innerHTML=`<i>◉</i>Check your ${esc(EXS[k].name.toLowerCase())} with the camera`;nd.hidden=false;}
$('#camNudge').addEventListener('click',()=>{$('#camNudge').hidden=true;liveOpen();});
if(LV_DEEP)$('#go').addEventListener('click',()=>setTimeout(()=>{LIVE.auto=LV_DEEP;skipIntro();chooseGroup(EXS[LV_DEEP].group);goExercise(LV_DEEP);},0)); // after the story starts
// test hooks: feed body points without a camera, read the state, run the model on a still picture
window.__live={feed:(w,n,t,ar)=>liveRead(w,n,t??performance.now()/1000,ar),
  begin:()=>{liveOpen();Object.assign(LIVE,{phase:'run',src:'test',on:true,reps:[],rep:null,st:'find',P:null,Q:null,up:null,u2:null,cave0:null,warn:null,m:null,msg:'',twinK:0,lastStats:''});anyReset();renderLive();},
  profile:k=>{const X=anyProfile(EXS[k||EXK]);return {ok:X.ok,view:X.view,dj:X.dj,uni:X.uni,lo:X.lo,hi:X.hi,ecc:X.ecc,checks:X.checks.map(c=>({k:c.k,key:c.key,w:c.w,g:+c.g.toFixed(1),f:+c.f.toFixed(1),thr:+c.thr.toFixed(1)})),blind:X.blind};},
  end:liveEnd,stop:liveStop,model:loadPoseModel,set mute(v){LIVE.mute=v;},set on(v){LIVE.on=v;},get state(){const L=LIVE;return {phase:L.phase,on:L.on,st:L.st,d:L.d,m:L.m,warn:L.warn,s:{...L.s},twinK:L.twinK,msg:L.msg,
    reps:L.reps.map(r=>r.depth===undefined?{n:r.n,is:r.is,pMax:+r.pMax.toFixed(2),ecc:r.ecc==null?null:+r.ecc.toFixed(2),ext:Object.fromEntries(Object.entries(r.ext).map(([k,e])=>[k,[Math.round(e.min),Math.round(e.max)]]))}:({n:r.n,is:r.is,depth:+r.depth.toFixed(1),leanB:+r.leanB.toFixed(1),leanMax:+r.leanMax.toFixed(1),leanRise:+r.leanRise.toFixed(1),cave:r.cave===null?null:+r.cave.toFixed(1),dMax:+r.dMax.toFixed(2),side:+r.side.toFixed(2)}))};},
  image:async url=>{const {vision}=await loadPoseModel();const fs=await vision.FilesetResolver.forVisionTasks(MP_URL+'/wasm');
    const lm=await vision.PoseLandmarker.createFromOptions(fs,{baseOptions:{modelAssetPath:MP_MODEL,delegate:'CPU'},runningMode:'IMAGE',numPoses:1});
    const img=new Image();img.crossOrigin='anonymous';img.src=url;await img.decode();const r=lm.detect(img);lm.close();return r;}};
