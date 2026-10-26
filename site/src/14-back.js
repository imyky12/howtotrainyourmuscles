
// ---------------------------------------------------------------- back: poses, getting on and off, the 8 exercises
// a mistake: button text, quiz option, what's wrong, right now, later, fix (+ pose parameters and the measurement)
function MS(btn,short,wrong,now,later,fix,o={}){return {btn,tag:o.tag||btn,short,wrong,now,later,fix,warn:o.warn||btn,...o};}
function steps4(a){return a.map(s=>Array.isArray(s)?s:[s,'']);}
// hold a straight bar (along canonical x) at centre ct with half-grip gx
function barHands(c,ct,gx,o){for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().add(V(s*gx,0,0)),{hd:o.hd,pn:o.pn,pole:typeof o.pole==='function'?o.pole(s):o.pole.clone().multiply(V(s,1,1)),curl:o.curl,follow:o.follow});}
const ARM_HANG=()=>(D.arm+D.fore)*.997+.075*D.s;

// ---- pull-up
function posePullup(c,F,b,u,P){const lo=F.noHang?.3:0,hi=F.half?.72:1;const uu=lerp(lo,hi,clamp(u,0,1));const gx=.29*D.s;
  const yHang=PU_Y-.1-.05-Math.sqrt(Math.pow((D.arm+D.fore)*.995,2)-Math.pow(gx-D.shx,2)),yTop=PU_Y-.02;
  const kip=F.kip&&b.phase===2?Math.sin(Math.PI*b.k):F.kip&&b.phase===1?-.5*Math.sin(Math.PI*b.k):0;
  const lean=(8*smooth(uu)-kip*12)*DEG;const S=V(0,lerp(yHang,yTop,smooth(uu)),PU_Z+lerp(-.01,-.075,smooth(uu))+kip*.05);
  const q=rootFromAxes(V(0,Math.cos(lean),-Math.sin(lean)),V(0,Math.sin(lean),Math.cos(lean)));
  setRoot(c,q,S.clone().sub(D.sh.clone().sub(D.hips).applyQuaternion(q)));resetRest(c);spineBend(c,0,{neck:-.1*uu,head:-.1*uu});
  clav(c,{shrug:lerp(.3,-.04,smooth(Math.min(1,uu*2.5)))});c.root.updateMatrixWorld(true);
  const T=pelvisAxes(c);const kick=kip*.9;
  for(const s of[1,-1]){const side=sideOf(s);const ta=T.U.clone().negate().addScaledVector(T.F,.2+kick).addScaledVector(T.L,s*.02);const sa=T.U.clone().negate().addScaledVector(T.F,-.75+kick*.6).addScaledVector(T.L,-s*.06);legDir(c,side,ta,sa,T.F.clone().addScaledVector(T.U,-.4));}
  barHands(c,V(0,PU_Y,PU_Z),gx,{hd:V(0,1,.15),pn:V(0,0,1),pole:V(.6,-.7,.45)});c._S=S;return u;}
// ---- lat pulldown
function poseLatPulldown(c,F,b,u,P){const lo=F.half?.18:0;const uu=lerp(lo,1,clamp(u,0,1));const lean=(15+(F.row?30*smooth(uu):0))*DEG;
  setRoot(c,qX(-lean),V(0,LPD.seatY+.1*D.s,LPD.seatZ));resetRest(c);spineBend(c,F.neck?.22*uu:0,{neck:F.neck?.35*uu:-.05,head:F.neck?.1:0});
  clav(c,{shrug:lerp(.28,-.03,smooth(Math.min(1,uu*2)))});c.root.updateMatrixWorld(true);
  for(const s of[1,-1])legTo(c,sideOf(s),V(s*.17,D.ankY,LPD.seatZ+.42),V(s*.15,.4,1));
  const [sl,sr]=shoulders(c),S=sl.clone().add(sr).multiplyScalar(.5);const T=torsoAxes(c);const gx=.3*D.s;
  const top=V(0,S.y+Math.sqrt(Math.pow((D.arm+D.fore)*.97,2)-Math.pow(gx-D.shx,2))+.07,S.z+.12);
  const bot=F.neck?S.clone().addScaledVector(T.U,.1).addScaledVector(T.F,-.09):S.clone().addScaledVector(T.U,.05).addScaledVector(T.F,.15);
  if(F.row)bot.copy(wpos(c.bones.Spine1)).addScaledVector(T.F,.17);
  const k=smooth(uu),ct=V(0,lerp(top.y,bot.y,k),lerp(top.z,bot.z,Math.pow(k,1.6)));
  barHands(c,ct,gx,{hd:V(0,1,0),pn:V(0,0,1),pole:V(.7,-.9,-.15)});
  P.bar.position.copy(ct);P.bar.quaternion.identity();setRod(P.cable,P.pul,ct);P.stackTop.position.y=.35*(top.y-ct.y)/Math.max(.1,top.y-bot.y);c._S=S;return u;}
// ---- seated cable row
function poseSeatedRow(c,F,b,u,P){const hi=F.shortR?.55:1;const uu=clamp(u,0,1)*hi;
  const lean=(F.rock?lerp(30,-18,smooth(uu)):lerp(6,0,smooth(uu)))*DEG;const hip=V(0,SROW.seatY+.1*D.s,-12.42);
  setRoot(c,qX(lean),hip);resetRest(c);clav(c,{shrug:F.shrug?.03+.48*smooth(uu):.03,protract:.12*(1-smooth(uu))});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const side=sideOf(s);const A=V(s*.13,.33,SROW.footZ-.09);legTo(c,side,A,V(s*.1,1,.3));footTo(c,side,A.clone().add(V(0,.14,.05)));}
  const [sl,sr]=shoulders(c),S=sl.clone().add(sr).multiplyScalar(.5);const T=torsoAxes(c);
  const far=V(0,S.y-.16,S.z+Math.sqrt(Math.pow((D.arm+D.fore)*.96,2)-.16*.16)+.06);const near=wpos(c.bones.Spine).addScaledVector(T.F,.2).addScaledVector(T.U,.04);near.y=Math.max(near.y,hip.y+.12);
  const ct=far.clone().lerp(near,smooth(uu));
  for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().add(V(s*.07,0,0)),{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.25,-.6,-1)});
  P.h.position.copy(ct);P.h.quaternion.identity();setRod(P.cable,P.pul,ct.clone().add(V(0,0,.13)));P.stackTop.position.y=.3*smooth(uu);c._S=S;c._near=near;return u;}
// ---- barbell bent-over row (bar lives on the platform)
function poseBarRow(c,F,b,u,P){const uu=clamp(u,0,1);const hinge=F.heave?45-25*smooth(uu):45;
  standPose(c,{z:-12.02,hinge,drop:.07,back:.1,round:F.round?46:0,arms:'none',stance:.13,look:12});
  const T=torsoAxes(c);const [sl,sr]=shoulders(c),S=sl.clone().add(sr).multiplyScalar(.5);
  const hang=V(0,S.y-ARM_HANG(),S.z+.02);const ribs=F.flare?wpos(c.bones.Spine2).addScaledVector(T.F,.17).addScaledVector(T.U,.05):wpos(c.bones.Spine1).addScaledVector(T.F,.16).addScaledVector(T.U,-.04);
  const k=smooth(uu),ct=hang.clone().lerp(ribs,k);ct.z+=.05*Math.sin(Math.PI*k);
  const f=(F.flare?82:35)*DEG;barHands(c,ct,.27*D.s,{hd:V(0,-1,-.15),pn:V(0,0,-1),pole:V(Math.sin(f),.35,-Math.cos(f))});
  P.bar.position.copy(ct);P.bar.quaternion.identity();c._S=S;return u;}
// ---- deadlift: the bar path is vertical; hips are placed so straight arms reach the bar
function deadliftPose(c,P,p,o={}){const barZ=PLAT.barZ;const top=D.sh.y-ARM_HANG()+.03;let yb,th;
  if(o.hipsFirst&&p<.3){const k=smooth(p/.3);th=68+17*k;yb=PLAT.barY+.02*k;}
  else{const pp=o.hipsFirst?(p-.3)/.7:p;yb=lerp(PLAT.barY,top,smooth(pp));const kp=clamp((yb-PLAT.barY)/(.52-PLAT.barY),0,1);th=yb<.52?lerp(o.hipsFirst?85:68,50,kp):lerp(50,0,smooth(clamp((yb-.52)/(top-.52),0,1)));}
  const front=(o.drift?.12*Math.sin(Math.PI*clamp(p*1.1,0,1)):0)+.035*(1-p);const bz=barZ+(o.drift?.12*Math.sin(Math.PI*clamp(p*1.1,0,1)):0);
  const S=V(0,yb+ARM_HANG()-.01,barZ+front);const Lt=D.sh.clone().sub(D.hips);const hip=S.clone().sub(Lt.clone().applyQuaternion(qX(th*DEG)));
  standPose(c,{z:barZ-.06,hinge:th,drop:D.hips.y-hip.y,back:(barZ-.06)-hip.z,round:o.round?46:0,arms:'none',stance:.16*D.s,toe:14,look:Math.min(th,40)});
  barHands(c,V(0,yb,bz),.28*D.s,{hd:V(0,-1,-.1),pn:V(0,0,-1),pole:V(.25,.2,-1)});
  if(P&&P.bar){P.bar.position.set(0,yb,bz);P.bar.quaternion.identity();}return {yb,th};}
function poseDeadlift(c,F,b,u,P){const r=deadliftPose(c,P,clamp(u,0,1),{hipsFirst:F.hipsFirst,round:F.round,drift:F.drift});c._dl=r;return u;}
// ---- one-arm dumbbell row: left knee and hand on the bench, right foot on the floor, right arm rows
function poseDBRow(c,F,b,u,P){const uu=clamp(u,0,1);const lo=F.shortR?.13:0;const k=smooth(lerp(lo,1,uu));
  const hip=V(.17,.92,-11.68),sh=V(.19,.95,-12.2);/* hips over the knee on the pad (thigh upright), back flat */const twist=(F.twist?28*k:0)*DEG;
  const fwd=V().subVectors(sh,hip).normalize();const q=rootFromAxes(fwd,V(0,-1,0));const q2=new THREE.Quaternion().setFromAxisAngle(fwd,-twist).multiply(q);
  setRoot(c,q2,hip);resetRest(c);spineBend(c,0,{neck:-.5,head:-.2});clav(c,{shrug:.02});c.root.updateMatrixWorld(true);
  // left leg kneels on the bench, right foot on the floor beside it (face down, head toward −z: lifter's left is world −x)
  legTo(c,'Left',V(.02,BENCH_TOP+.075,-11.28),V(0,-1,-.6));footTo(c,'Left',V(.02,BENCH_TOP+.02,-11.12));/* shin along the pad, foot off its end */
  legTo(c,'Right',V(.43,D.ankY,-11.52),V(.3,.2,-1));footTo(c,'Right',V(.45,.02,-11.68));
  armTo(c,'Left',V(.03,BENCH_TOP+.01,-12.43),{hd:V(0,0,-1),pn:V(0,-1,0),pole:V(-.4,.2,1),curl:.2});
  const S=wpos(c.bones.RightArm);const hang=V(S.x+.02,S.y-ARM_HANG(),S.z+.02);const top=wpos(c.bones.Hips).add(V(.12,.16,-.12));
  const flare=F.flare?V(S.x+.24,S.y-.08,S.z+.05):top;const end=F.flare?flare:top;
  const ct=hang.clone().lerp(end,k);const pole=F.flare?V(1,.6,0):V(.25,.4,1);
  armTo(c,'Right',ct,{hd:V(0,-1,0),pn:V(-1,0,0),pole});
  if(P.db&&P.db[1]){P.db[1].position.copy(ct);P.db[1].quaternion.setFromAxisAngle(V(0,1,0),Math.PI/2);}c._S=S;return u;}
// ---- straight-arm pulldown at the cable column (straight bar on the top pulley)
function poseStraightArm(c,F,b,u,P){const uu=clamp(u,0,1);const k=uu; // the rep clock already eases u (smoothing it twice made the sweep snap through the middle)P.use('sbar');P.setPulley(1.95);
  const hinge=F.upright?3:(F.bob?25+15*Math.sin(Math.PI*k):25);
  standPose(c,{z:-11.8,hinge,drop:.05,back:.06,arms:'none',stance:.13,look:10});clav(c,{shrug:lerp(.1,-.04,k)});c.root.updateMatrixWorld(true);
  const T=torsoAxes(c);const [sl,sr]=shoulders(c),S=sl.clone().add(sr).multiplyScalar(.5);const el=F.bend?lerp(165,85,k):165;
  const flex=lerp(165,F.upright?32:4,k);const dir=tdir(T,1,flex,0);const L=elbowD(el)+.07*D.s;
  const ct=S.clone().addScaledVector(dir,L);
  barHands(c,ct,.2*D.s,{hd:dir.clone(),pn:T.F.clone().negate(),pole:s=>T.F.clone().multiplyScalar(-1).addScaledVector(T.L,s*.3).addScaledVector(T.U,-.3)});
  P.sbar.position.copy(ct);P.sbar.quaternion.identity();P.cableTo(ct);P.stackTop.position.y=.3*k;c._S=S;return u;}
// ---- dumbbell shrug (standing by the rack)
function poseShrug(c,F,b,u,P){const uu=clamp(u,0,1);const k=smooth(uu);
  standPose(c,{z:-12,arms:'none',look:0});const roll=F.roll?Math.sin(Math.PI*2*uu)*.25:0;
  clav(c,{shrug:.0+.42*k,protract:roll});c.root.updateMatrixWorld(true);
  if(F.head){c.bones.Spine2.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),.12*k));c.bones.Neck.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),1.6*k));c.bones.Head.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),-1.5*k));c.root.updateMatrixWorld(true);}
  const T=torsoAxes(c);
  for(const s of[1,-1]){const sd=sideOf(s);const ua=V(0,-1,0).addScaledVector(T.L,s*.17);const el=F.curl?40*k:0;const fa=ua.clone().applyAxisAngle(T.L,-s*0).applyAxisAngle(T.L,el*DEG*s*0).add(T.F.clone().multiplyScalar(Math.sin(el*DEG)*1.4)).normalize();
    const r=armDir(c,sd,ua,fa,T.L.clone().multiplyScalar(-s),{hd:fa});if(P.db){const i=s>0?0:1;const d=P.db[i];if(d){d.position.copy(r.contact);d.quaternion.setFromUnitVectors(V(1,0,0),T.F);}}}
  c._acr=wpos(c.bones.LeftArm);return u;}

// ---- measurements for the back
Object.assign(MEAS,{
  hipSwing:{pick:'range',get:c=>{const p=V().subVectors(wpos(c.bones.Neck),wpos(c.bones.Hips)).normalize(),t=V().subVectors(wpos(c.bones.LeftLeg),wpos(c.bones.LeftUpLeg)).normalize();return 180-Math.acos(clamp(p.dot(t),-1,1))/DEG;},fmt:v=>v<12?'body stays still ('+Math.round(v)+'° hip swing)':'hips swing '+Math.round(v)+'° each rep'},
  chinBar:{at:'top',get:c=>(wpos(c.bones.Head).y-.03-PU_Y)*100,fmt:v=>v>=0?'chin clears the bar':'chin stops '+Math.round(-v)+' cm below the bar'},
  elbowBottom:{at:'bottom',get:c=>avg2(s=>elbowAng(c,s)),fmt:v=>v>=160?'arms straight at the bottom ('+Math.round(v)+'°)':'elbows stay bent at '+Math.round(v)+'°'},
  elbowTop:{at:'top',get:c=>avg2(s=>elbowAng(c,s)),fmt:v=>v>=160?'arms straight at the top ('+Math.round(v)+'°)':'elbows stay bent at '+Math.round(v)+'°'},
  leanRange:{pick:'range',get:c=>torsoLean(c),fmt:v=>v<10?'torso still (moves '+Math.round(v)+'°)':'torso swings '+Math.round(v)+'° each rep'},
  barNeck:{at:'top',get:(c,x)=>{const z=x.P.bar.position.z,hz=wpos(c.bones.Head).z;return (z-hz)*100;},fmt:v=>v>4?'bar comes down in front of the face':'bar goes behind the head'},
  lumbar:{pick:'max',get:c=>{const a=V().subVectors(wpos(c.bones.Spine1),wpos(c.bones.Hips)).normalize(),b2=V().subVectors(wpos(c.bones.Neck),wpos(c.bones.Spine2)).normalize();return Math.acos(clamp(a.dot(b2),-1,1))/DEG;},fmt:v=>v<12?'back stays flat':'lower back rounds '+Math.round(v)+'°'},
  rowFlare:{at:'top',get:c=>flareDeg(c,'Left'),fmt:v=>v<55?'elbows '+Math.round(v)+'° from the body':'elbows flared to '+Math.round(v)+'°'},
  shoulderRot:{pick:'max',get:c=>{const d=V().subVectors(wpos(c.bones.LeftArm),wpos(c.bones.RightArm));return Math.abs(Math.asin(clamp(d.y/d.length(),-1,1))/DEG);},fmt:v=>v<12?'shoulders square to the floor':'shoulders twist '+Math.round(v)+'°'},
  dbRowFlare:{at:'top',get:c=>flareDeg(c,'Right'),fmt:v=>v<50?'elbow tight to the body ('+Math.round(v)+'°)':'elbow flared to '+Math.round(v)+'°'},
  dbElbowBottom:{at:'bottom',get:c=>elbowAng(c,'Right'),fmt:v=>v>=168?'arm hangs straight ('+Math.round(v)+'°)':'arm stays bent at '+Math.round(v)+'°'},
  shrugRise:{pick:'range',get:c=>{const up=upOf(c);return (V().subVectors(wpos(c.bones.LeftArm),wpos(c.bones.Neck)).dot(up))*100;},fmt:v=>v<2?'shoulders stay down':'shoulders rise '+Math.round(v)+' cm'},
  handleBelly:{at:'top',get:(c,x)=>Math.max(0,(x.P.h.position.distanceTo(c._near))*100),fmt:v=>v<6?'handle reaches the belly':'handle stops '+Math.round(v)+' cm short'},
  elbowRange:{pick:'range',get:c=>avg2(s=>elbowAng(c,s)),fmt:v=>v<12?'elbows stay fixed (change '+Math.round(v)+'°)':'elbows bend '+Math.round(v)+'°'},
  hinge:{at:'top',get:c=>torsoLean(c),fmt:v=>v>15?'leaning forward '+Math.round(v)+'°':'standing upright ('+Math.round(v)+'°)'},
  dlLift:{at:'knee',pick:'max',get:c=>c._dl&&c._dl.yb<.55?c._dl.th:0,fmt:v=>v<72?'chest and hips rise together':'hips rise first: torso tips to '+Math.round(v)+'°'},
  barDrift:{pick:'max',get:(c,x)=>(x.P.bar.position.z-PLAT.barZ)*100,fmt:v=>v<4?'bar stays over the middle of the foot':'bar drifts '+Math.round(v)+' cm in front of the feet'},
  acrRoll:{pick:'range',get:c=>{const f=venOf(c);return wpos(c.bones.LeftArm).dot(f)*100;},fmt:v=>v<2?'shoulders move straight up and down':'shoulders roll '+Math.round(v)+' cm forward and back'},
  earFwd:{pick:'max',get:c=>{const f=venOf(c);return (wpos(c.bones.Head).dot(f)-wpos(c.bones.LeftArm).dot(f))*100;},fmt:v=>v<4?'chin level, head over the shoulders':'head pokes '+Math.round(v)+' cm forward'},
});

// ---- getting on and off
// arms raised overhead (stepping in under the pull-up bar between the dip handles)
function armsUp(c){const T=torsoAxes(c);for(const s of[1,-1]){const ua=T.U.clone().addScaledVector(T.L,s*.22).addScaledVector(T.F,.1),fa=T.U.clone().addScaledVector(T.L,s*.1).addScaledVector(T.F,.08);
  armDir(c,sideOf(s),ua,fa,T.F.clone().negate(),{hd:fa,curl:.3});}}
const HANG_GRIP={hd:V(0,1,.15),pn:V(0,0,1),pole:V(.6,-.7,.45)};
// back in under the bar between the dip handles with the arms raised (clear of the handles), grip, a small jump to hang
ENTRY.hang={pre:[0,-10.9],face:0,
  enter:(st,e)=>[{walk:[0,-11.2],back:true,d:1.0,soft:1},
    {d:1.3,pose:c=>{standPose(c,{z:-11.2,arms:'none'});armsUp(c);}},
    ...stepPoses(-11.2,-12.08,0,c=>armsUp(c),{d:1.6}),
    {d:.6,pose:c=>{standPose(c,{z:-12.08,arms:'none'});barHands(c,V(0,PU_Y,PU_Z),.29*D.s,HANG_GRIP);}},
    {call:()=>sayFor('Small jump, then hang still.',2.2)},{d:.55,pose:exP(0,1)},{d:1.1,anim:exFrom(0,1)}],
  leave:(st,e)=>[...exTo(0,1.2),{d:.45,pose:c=>{standPose(c,{z:-12.08,drop:.12,arms:'none'});barHands(c,V(0,PU_Y,PU_Z),.29*D.s,HANG_GRIP);}},
    {d:.6,pose:c=>{standPose(c,{z:-12.08,arms:'none'});armsUp(c);}},
    ...stepPoses(-12.08,-11.2,0,c=>armsUp(c),{d:1.6}),
    {d:1.2,pose:c=>standPose(c,{z:-11.2})},{walk:[0,-10.9],d:.8}]};
// lat pulldown: sit sideways on the seat, swing the legs in under the thigh pads, reach up for the bar where it rests, pull
const LPD_GRIP={hd:V(0,1,0),pn:V(0,0,1),pole:V(.7,-.9,-.15)};
const LPD_FEET=[[.17,LPD.seatZ+.42],[-.17,LPD.seatZ+.42]];
const LPD_SIDE=[[.42,LPD.sitZ-.15],[.42,LPD.sitZ+.15]];
const lpdSit=(h,feet,arms)=>c=>sitAt(c,{h,z:LPD.sitZ,y:LPD.seatY+.1*D.s,feet,out:.15,lean:2,arms});
// halfway round: knees low under the pads, feet on the floor
const LPD_MID=()=>{const h=Math.PI/4,f=V(Math.sin(h),0,Math.cos(h)),l=V(Math.cos(h),0,-Math.sin(h));return [1,-1].map(s=>{const p=f.clone().multiplyScalar(.46).addScaledVector(l,s*.15);return [p.x,LPD.sitZ+p.z];});};
function lpdReach(c){lpdSit(0,LPD_FEET,'none')(c);const R=lpdRest();barHands(c,R,.3*D.s,LPD_GRIP);ST.P.bar.position.copy(R);}
function lpdCable(c){const P=ST.P;setRod(P.cable,P.pul,P.bar.position);P.stackTop.position.y=clamp((lpdRest().y-P.bar.position.y)*.45,0,.35);}
ENTRY.pulldown={pre:[.9,LPD.sitZ],face:Math.PI/2,
  enter:(st,e)=>[{d:.8,anim:settle(c=>standPose(c,{x:.66,z:LPD.sitZ,h:Math.PI/2}),{step:1,bend:1})},{d:.8,anim:settle(c=>standPose(c,{x:.42,z:LPD.sitZ,h:Math.PI/2}),{step:1,bend:1})},
    {d:1.1,pose:lpdSit(Math.PI/2,LPD_SIDE),props:pinFeet(st,LPD_SIDE,{h:Math.PI/2,out:.15})},
    {d:.9,...liftFeet(st,lpdSit(Math.PI/4,LPD_MID()),{lift:.05})},
    {d:.9,...liftFeet(st,lpdSit(0,LPD_FEET),{lift:.05})},
    {d:1.0,pose:lpdReach},
    carryWith(1.0,exP(0,1),()=>st.P.bar,lpdCable),
    {d:1.1,anim:exFrom(0,1)}],
  leave:(st,e)=>[carryWith(.8,exP(0,1),()=>st.P.bar,lpdCable),
    carryWith(1.0,lpdReach,()=>st.P.bar,lpdCable),{call:()=>st.P.rest()},
    {d:1.2,pose:lpdSit(0,LPD_FEET)},
    {d:.9,...liftFeet(st,lpdSit(Math.PI/4,LPD_MID()),{lift:.05})},
    {d:.9,...liftFeet(st,lpdSit(Math.PI/2,LPD_SIDE),{lift:.05})},
    {d:1.0,pose:c=>standPose(c,{x:.42,z:LPD.sitZ,h:Math.PI/2}),props:pinFeet(st,LPD_SIDE,{h:Math.PI/2,out:.15})},
    {walk:[.95,LPD.sitZ],d:.9}]};
// seated row: sit sideways on the low seat, swing the legs up onto the foot plate, take the handle, straighten the arms
const ROW_SIDE_FEET=[[.38,-12.56],[.38,-12.28]]; // facing +x the left foot is on the −z side
const ROW_SIT={h:Math.PI/2,z:-12.42,y:SROW.seatY+.1*D.s,feet:ROW_SIDE_FEET,out:.2};
function rowTuck(c){setRoot(c,qX(8*DEG),V(0,SROW.seatY+.1*D.s,-12.42));resetRest(c);clav(c,{shrug:.03});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);const A=V(s*.13,SROW.seatY+.1,-12.0);legTo(c,sd,A,V(s*.1,1,.2));footTo(c,sd,A.clone().add(V(0,-.06,.1)));
    const K=wpos(c.bones[sd+'Leg']);armTo(c,sd,K.add(V(s*.04,.04,-.02)),{hd:V(0,-.4,1),pn:V(0,-1,0),pole:V(s*.6,-.3,-.6),curl:.6});}}
// legs on the plate, hands on the handle where it rests (k=0) ... arms straight out at the start of a rep (k=1)
function rowReach(c,P,k){poseSeatedRow(c,FORMS.good,{phase:1,k:0},0,P);const S=c._S;const far=V(0,S.y-.16,S.z+Math.sqrt(Math.pow((D.arm+D.fore)*.96,2)-.16*.16)+.06);
  const rest=V(0,.36,SROW.footZ+.06);const ct=rest.lerp(far,smooth(k));
  for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().add(V(s*.07,0,0)),{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.25,-.6,-1)});
  P.h.position.copy(ct);P.h.quaternion.identity();setRod(P.cable,P.pul,ct.clone().add(V(0,0,.13)));P.stackTop.position.y=0;}
ENTRY.seatRow={pre:[.85,-12.42],face:Math.PI/2,
  enter:(st,e)=>[{d:1.0,anim:settle(c=>standPose(c,{x:.63,z:-12.42,h:Math.PI/2}),{step:1,bend:1})},{d:.8,anim:settle(c=>standPose(c,{x:.42,z:-12.42,h:Math.PI/2}),{step:1,bend:1})},
    {d:1.0,pose:c=>sitAt(c,ROW_SIT),props:pinFeet(st,ROW_SIDE_FEET,{h:Math.PI/2,out:.2})},
    {d:1.3,...liftFeet(st,c=>rowTuck(c),{lift:.3})},
    {d:.9,pose:c=>rowReach(c,st.P,0)},
    {d:1.0,anim:(c,k)=>rowReach(c,st.P,k)},
    {d:1.1,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.8,pose:exP(0,1)},
    {d:1.0,anim:(c,k)=>rowReach(c,st.P,1-k)},{call:()=>st.P.rest()},
    {d:1.0,pose:c=>rowTuck(c)},
    {d:1.3,...liftFeet(st,c=>sitAt(c,ROW_SIT),{lift:.3})},
    {d:.8,pose:c=>standPose(c,{x:.42,z:-12.42,h:Math.PI/2}),props:pinFeet(st,ROW_SIDE_FEET,{h:Math.PI/2,out:.2})},{walk:[.85,-12.42],d:.8}]};
// a loaded bar on the floor: walk up, hinge down, grip, lift it (rows and RDLs start standing with the bar)
const DL_FEET=()=>[[.16*D.s,-11.9],[-.16*D.s,-11.9]];
ENTRY.floorBar={pre:[0,-12.75],face:0,
  enter:(st,e)=>{const first=e.startFromFloor?[]:[{d:1.6,anim:(c,k)=>deadliftPose(c,st.P,smooth(k))}];return [{walk:[0,-11.92],d:1.2,soft:1},
    {d:1.2,pose:c=>deadliftPose(c,st.P,0),props:pinFeet(st,DL_FEET())},{call:()=>e.coachIn&&sayFor(e.coachIn,2.6)},...first,...(e.startFromFloor?[{d:1.4,anim:exFrom(0,1)}]:[{d:1.0,pose:exP(1,3)}])];},
  leave:(st,e)=>{const pin=pinFeet(st,[[.11*D.s,-11.9],[-.11*D.s,-11.9]]);return [...(e.startFromFloor?exTo(0,1.6):[carryWith(.8,c=>deadliftPose(c,st.P,1),()=>st.P.bar),{d:1.6,anim:(c,k)=>deadliftPose(c,st.P,1-smooth(k))}]),
    {d:1.0,pose:c=>standPose(c,{z:-11.92}),props:(c,k)=>{if(k>.1)st.P.bar.position.copy(st.P.home);pin(c,k);}},{walk:[0,-12.75],back:true,d:1.4}];}};
// one-arm row on the flat dumbbell bench (one dumbbell in the right hand)
// bent over beside the bench, left hand on the pad, right arm hanging with the dumbbell, both feet still on the floor
function dbRowLean(c,P){standPose(c,{x:.4,z:-11.5,h:Math.PI,hinge:70,drop:.2,back:.08,feet:[[.2,-.1],[-.15,.05]],arms:'none',look:20}); // beside the bench, left leg clear of its end
  armTo(c,'Left',V(.03,BENCH_TOP+.01,-12.25),{hd:V(0,0,-1),pn:V(0,-1,0),pole:V(-.4,.2,1),curl:.2});
  const S=wpos(c.bones.RightArm);armTo(c,'Right',V(S.x+.02,S.y-ARM_HANG(),S.z+.02),{hd:V(0,-1,0),pn:V(-1,0,0),pole:V(.25,.4,1)});}
ENTRY.dbRowBench={pre:[.8,-11.35],face:Math.PI,
  enter:(st,e)=>[{call:c=>{c.carry=null;}},{d:1.2,anim:settle(c=>standDB(c,{x:.4,z:-11.55,h:Math.PI}),{step:1,bend:1})},
    {d:1.1,pose:c=>dbRowLean(c,st.P)},
    {d:1.4,...liftFeet(st,c=>{poseDBRow(c,FORMS.good,{phase:1,k:0},0,st.P);},{lift:.3,sides:['Left']})},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[...exTo(0,1.1),{d:1.4,...liftFeet(st,c=>dbRowLean(c,st.P),{lift:.3,sides:['Left']})},
    {d:1.0,pose:c=>standDB(c,{x:.4,z:-11.55,h:Math.PI})},{call:c=>{c.carry='db1';}},{walk:[.95,-11.3],d:.8}]};
// cable column: set the pulley, clip the attachment, step back into place
// the hand goes to the carriage: on tiptoe for a high carriage, in a deep crouch further back for a low one
function colReachB(c,P,y,zFix){const t=clamp((1.2-y)/.95,0,1),tip=.07*clamp((y-1.55)/.3,0,1);const z=zFix??lerp(-11.35,-11.58,t);
  standPose(c,{z,drop:.55*t,hinge:45*t+8*(1-t)*clamp((y-1.4)/.4,0,1),back:.08*t,arms:'none',heel:[tip,tip],look:y>1.4?-25:20});armsHang(c,0,-1);
  const p=P.car.position.clone().add(V(.06,0,-.02));armTo(c,'Left',p,{hd:V(0,0,1),pn:V(-1,0,0),pole:V(.5,-1,0)});}
function colAdjust(y,att,face=0){const t=clamp((1.2-y)/.95,0,1),z=lerp(-11.35,-11.58,t);return [
  {walk:[0,-11.6],d:.9,soft:1},
  {d:1.5,...liftFeet(ST,c=>colReachB(c,ST.P,ST.P.car.position.y,z))},
  {d:1.1,anim:(c,k)=>{const P=ST.P;P._y0=P._y0??P.car.position.y;P.setPulley(lerp(P._y0,y,smooth(k)));P.use(att);P.rest();colReachB(c,P,P.car.position.y,z);if(k>=1)P._y0=undefined;}},
  {d:1.2,pose:c=>standPose(c,{z})}];}
ENTRY.cableCol={pre:[0,-12.35],face:0,
  enter:(st,e)=>[...colAdjust(e.pulley,e.att),{walk:[0,e.standZ??-11.62],back:true,d:.8,soft:1},{d:1.4,pose:exP(0,1)},{d:1.4,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.9,pose:exP(0,1)},{d:1.2,pose:c=>standPose(c,{z:e.standZ??-11.62}),props:(c,k)=>{const P=st.P;const p=P.restPos();P.attPos().lerp(p,smooth(k));P.cableTo(P.attPos());if(k>=1)P.rest();}},{walk:[0,-12.35],back:true,d:1.0}]};
// standing with dumbbells (the spot by the rack)
ENTRY.dbStand={pre:[0,-12.4],face:0,
  enter:(st,e)=>[{walk:[0,-12],d:.8,soft:1},{call:c=>{c.carry=null;}},{d:.7,pose:c=>standDB(c,{z:-12})},{d:.8,pose:exP(e.startU??0,1)},{d:.9,anim:exFrom(e.startU??0,1)}],
  leave:(st,e)=>[{d:.8,pose:c=>standDB(c,{z:-12})},{call:c=>{c.carry='db';}},{walk:[0,-12.4],back:true,d:.7}]};

// ---- the exercises
const BACK_SPOT={side:{p:[-1.5,-11.6],h:Math.PI/2},sideR:{p:[1.5,-11.6],h:-Math.PI/2},front:{p:[0,-10.0],h:Math.PI}};
defEx('pullup',{group:'back',name:'Pull-up',eq:'Bodyweight',part:'Lats',station:'tower',entry:'hang',kind:'pull',pose:posePullup,
  quip:'Chin over the bar. Gravity has opinions; ignore them.',
  mus:{lats:[1,'m'],midBack:[.55,'h'],biLong:[.75,'h'],biShort:[.75,'h'],deltR:[.55,'h'],trapU:[.2,'h'],forearm:[.6,'h']},
  labels:[['Lats','lats','m'],['Biceps','biLong','h'],['Lower traps','midBack','h']],center:V(0,1.55,-12.05),cam:'sideL',coachSpot:{p:[-1.35,-11.2],h:Math.PI/2+.4},
  steps:steps4([['Lower slowly','2 sec'],['Full stretch','arms straight'],['Pull chin over bar','elbows down'],['Squeeze','chin above the bar']]),
  stepText:['Lower yourself slowly, about 2 seconds, keeping the legs still.','Hang with straight arms. Let the shoulder blades rise: this is the lats’ stretch.','Pull the shoulders down first, then drive the elbows down until your chin passes the bar.','Chin over the bar, chest close to it. Pause for a moment.'],
  cues:[['Slow on the way down.'],['Straight arms. Stretch.'],['Shoulders down, then pull.','Elbows to your back pockets.'],['Chin over the bar.']],
  beginner:'3 sets of as many clean reps as you can, minus two. Can’t do one yet? Jump up and lower yourself in 3–5 seconds.',
  forms:mk({lower:2.0,touch:.35,press:1.1,lock:.6,prof:'smooth'},{
    kip:MS('Kipping','Hips swing to throw the body up','The hips swing forward and back, so the legs throw you up to the bar.','Momentum does the work, so the lats get less of it.','You plateau, because the muscle never gets the full load.','Legs still. Pull with your back.',{kip:1,meas:'hipSwing',warn:'Swinging hips',warnAt:'hips',cam:'sideL'}),
    half:MS('Half reps','Chin never reaches the bar','The chin stops 5–10 cm below the bar at the top.','The top half of the pull, where the lats and lower traps squeeze, is skipped.','Slower strength gains at the top of the movement.','Chin over the bar, every rep.',{half:1,meas:'chinBar',warn:'Stops short',warnAt:'neck',cam:'sideL'}),
    noHang:MS('No full hang','Arms never straighten at the bottom','The elbows stay bent at about 130° at the bottom.','You cut out the stretched range, the part that grows muscle most.','Less growth from the same number of reps.','Straight arms at the bottom.',{noHang:1,meas:'elbowBottom',warn:'Elbows stay bent',warnAt:'elbow',cam:'sideL'})})});
defEx('latPulldown',{group:'back',name:'Lat pulldown',eq:'Machine',part:'Lats',station:'latPulldown',entry:'pulldown',kind:'pull',pose:poseLatPulldown,
  quip:'Bar to the collarbones, not a trip behind the neck.',
  mus:{lats:[1,'m'],midBack:[.45,'h'],biLong:[.6,'h'],biShort:[.6,'h'],deltR:[.45,'h'],forearm:[.5,'h']},
  labels:[['Lats','lats','m'],['Biceps','biLong','h'],['Rear shoulder','deltR','h']],center:V(0,1.3,-12.0),cam:'three',coachSpot:{p:[-1.4,-11.4],h:Math.PI/2+.3},
  steps:steps4([['Let the bar rise','2 sec'],['Arms straight','stretch'],['Pull to collarbones','elbows down'],['Squeeze','elbows by the ribs']]),
  stepText:['Let the bar rise slowly, about 2 seconds, until the arms are straight.','Arms straight, shoulder blades lifted. The lats are stretched here.','Pull the bar down to your collarbones, elbows driving down and slightly back. Keep the small backward lean the same.','Bar at the collarbones, elbows by your ribs. Squeeze for a moment.'],
  cues:[['Control it up.'],['Arms straight.'],['Elbows down to the ribs.','Lean once, then stay still.'],['Squeeze.']],
  beginner:'3 sets of 8–12. Don’t let the stack slam; guide the bar all the way up before you let go.',
  forms:mk({lower:2.0,touch:.3,press:1.0,lock:.6,prof:'smooth'},{
    row:MS('Leaning back','Body leans far back into a row','The torso leans back from about 15° to 45° as you pull, and the bar ends at the belly.','It becomes a half row with momentum; the lats get less of the vertical pull.','You load more than the lats can handle, and the lower back helps out.','Lean back a little once, then stay still.',{row:1,meas:'leanRange',warn:'Leaning back',warnAt:'back',cam:'sideFlat'}),
    neck:MS('Behind the neck','Bar pulled down behind the head','The head pushes forward and the bar comes down behind the neck.','You lift about 15% less (59 vs 70 kg in one study) and the lats don’t work any harder.','Repeated loaded end-range rotation can irritate the front of the shoulder.','Bar to the collarbones, chin up.',{neck:1,meas:'barNeck',warn:'Bar behind the head',warnAt:'neck',cam:'sideFlat',strain:['deltF']}),
    half:MS('Half reps','Arms never straighten at the top','The elbows stay bent at the top, so the lats never stretch.','You skip the stretched range.','Less growth from the same sets.','Let the arms go straight.',{half:1,meas:'elbowBottom',warn:'Elbows stay bent',warnAt:'elbow',cam:'three'})})});
defEx('cableRow',{group:'back',name:'Seated cable row',eq:'Cable',part:'Middle back',station:'seatedRow',entry:'seatRow',kind:'pull',pose:poseSeatedRow,
  quip:'Handle to the belly button; the chair does not rock.',
  mus:{midBack:[1,'m'],lats:[.85,'m'],deltR:[.6,'h'],biLong:[.5,'h'],biShort:[.5,'h'],erect:[.3,'h']},
  labels:[['Middle back','midBack','m'],['Lats','lats','m'],['Rear shoulder','deltR','h']],center:V(0,.9,-12.0),cam:'sideFlat',coachSpot:{p:[-1.3,-11.7],h:Math.PI/2},
  steps:steps4([['Reach forward','2 sec, slowly'],['Arms straight','shoulder blades forward'],['Pull to the belly','elbows back'],['Hold one second','shoulder blades back']]),
  stepText:['Let the handle travel forward slowly until the arms are straight. The torso stays still.','Arms straight, shoulder blades pulled forward by the cable. The middle back is stretched.','Pull the handle to your belly button, elbows sliding back along the ribs.','Handle at the belly, shoulder blades back. Hold a second, then reach forward again.'],
  cues:[['Reach slowly.'],['Stretch.'],['Elbows back along the ribs.','Torso still, arms move.'],['Hold one second.']],
  beginner:'3 sets of 10–12. Lean forward and let the stack rest before you let go of the handle.',
  forms:mk({lower:2.0,touch:.3,press:1.0,lock:1.0,prof:'smooth'},{
    rock:MS('Rocking','Torso rocks forward and back','The torso rocks about 25° forward and back on every pull.','The lower back and momentum move the weight.','You lift heavier stacks without a bigger back.','Torso still. Only the arms move.',{rock:1,meas:'leanRange',warn:'Rocking torso',warnAt:'lowback',cam:'sideFlat'}),
    shrug:MS('Shrugging','Shoulders rise toward the ears','The shoulders rise 5–7 cm toward the ears at the end of the pull.','The upper traps take over from the middle back.','Tight upper traps, little middle-back growth.','Shoulders down, elbows back.',{shrug:1,meas:'shrugRise',warn:'Shoulders shrug',warnAt:'neck',cam:'front',strain:['trapU'],mul:{trapU:2.5}}),
    short:MS('Short pull','Handle stops short of the belly','The handle stops 10–15 cm in front of the belly.','The shoulder blades never squeeze together.','A weaker middle back.','Handle to the belly button.',{shortR:1,meas:'handleBelly',warn:'Stops short',warnAt:'chest',cam:'sideFlat'})})});
defEx('barRow',{group:'back',name:'Barbell bent-over row',eq:'Barbell',part:'Middle back',station:'platform',entry:'floorBar',kind:'pull',pose:poseBarRow,
  quip:'Freeze the torso. Only the elbows get to move.',coachIn:'Stand up with it first, then hinge to 45°.',
  mus:{midBack:[1,'m'],lats:[.9,'m'],deltR:[.7,'m'],erect:[.7,'h'],biLong:[.5,'h'],biShort:[.5,'h'],hams:[.35,'h'],glute:[.3,'h']},
  labels:[['Middle back','midBack','m'],['Lats','lats','m'],['Lower back','erect','h']],center:V(0,.95,-12.0),cam:'sideFlat',coachSpot:{p:[-1.5,-11.4],h:Math.PI/2},
  steps:steps4([['Lower with control','2 sec'],['Arms straight','under the chest'],['Row to the ribs','elbows back'],['Squeeze','shoulder blades together']]),
  stepText:['Lower the bar slowly until the arms hang straight. The hinge angle does not change.','Arms straight, the bar hangs below your chest. Back flat, knees soft.','Pull the bar to your lower ribs, elbows travelling back past your body.','Bar at the ribs, shoulder blades squeezed together. Then lower.'],
  cues:[['Lower slowly.'],['Flat back.'],['Elbows to the hips.','Freeze the torso.'],['Squeeze the shoulder blades.']],
  beginner:'3 sets of 8–10, starting with the empty 20 kg bar. Stop the set when the hinge starts to drift.',
  forms:mk({lower:2.0,touch:.3,press:1.0,lock:.9,prof:'smooth'},{
    heave:MS('Torso heaving','Torso swings up to lift the bar','The torso swings up from about 45° to 20° lean on every pull.','The lower back and hips lift the bar, not the lats.','You keep adding weight your back muscles never actually move.','Freeze the torso, move only the arms.',{heave:1,meas:'leanRange',warn:'Torso swings',warnAt:'lowback',cam:'sideFlat',strain:['erect']}),
    round:MS('Rounded back','Lower back rounds over the bar','The lower back rounds by 20–30°, hips tucked under.','The spine bends under load and the discs take more shear.','A stiff, sore lower back after rowing days.','Chest up, hips back, back flat.',{round:1,meas:'lumbar',warn:'Back rounds',warnAt:'lowback',cam:'sideFlat',strain:['erect']}),
    flare:MS('Elbows flared','Elbows out wide, bar to the chest','The elbows flare out to about 90° and the bar comes up to the chest.','It turns into a rear-shoulder row; the lats do less.','The front of the shoulder gets irritated under heavy loads.','Elbows to the hips.',{flare:1,meas:'rowFlare',warn:'Elbows flared',warnAt:'elbow',cam:'front',mul:{deltR:1.4,lats:.7}})})});
defEx('dbRow',{group:'back',name:'One-arm dumbbell row',eq:'Dumbbell',part:'Lats',station:'dbFlat',entry:'dbRowBench',kind:'pull',pose:poseDBRow,needs:'db1',dbSize:'medium',
  quip:'Elbow to the back pocket, shoulders flat as a table.',
  mus:{lats:[1,'m'],midBack:[.8,'m'],deltR:[.6,'h'],biLong:[.5,'h'],biShort:[.5,'h'],oblq:[.35,'h']},
  labels:[['Lats','lats','m'],['Middle back','midBack','m'],['Biceps','biLong','h']],center:V(.25,.75,-11.9),cam:'sideR',coachSpot:{p:[1.6,-12.6],h:-Math.PI/2-.4},
  steps:steps4([['Lower and stretch','2 sec'],['Arm hangs straight','shoulder blade forward'],['Row to the hip','elbow back'],['Squeeze','one second']]),
  stepText:['Lower the dumbbell slowly until the arm hangs straight.','Let the shoulder blade reach toward the floor. The lat is stretched.','Pull the elbow up and back along your ribs, dumbbell toward the hip. Shoulders stay square.','Dumbbell at the hip, shoulder blade squeezed. Hold a second. We show the right arm; then switch sides.'],
  cues:[['Lower slowly.'],['Let it hang.'],['Elbow to the back pocket.'],['Squeeze.']],
  beginner:'3 sets of 10–12 each side. The bench holds your torso, so keep the back flat.',
  forms:mk({lower:2.0,touch:.35,press:1.0,lock:.8,prof:'smooth'},{
    twist:MS('Torso twist','Shoulders twist to lift the weight','The working shoulder rotates up 25–40° to swing the dumbbell up.','The twist, not the lat, moves the weight.','One side gets stronger than the other.','Shoulders flat to the floor.',{twist:1,meas:'shoulderRot',warn:'Torso twists',warnAt:'back',cam:'front'}),
    flare:MS('Elbow flared','Elbow out wide, pulling to the armpit','The elbow travels out to the side and the dumbbell ends under the chest.','The rear shoulder takes over from the lat.','Slower lat growth.','Elbow to the back pocket.',{flare:1,meas:'dbRowFlare',warn:'Elbow flared',warnAt:'elbow',cam:'front',mul:{deltR:1.5,lats:.7}}),
    short:MS('No stretch','Arm never hangs straight','The elbow stays bent at about 140° at the bottom.','No stretched-position work for the lat.','Less growth per set.','Let it hang, then row.',{shortR:1,meas:'dbElbowBottom',warn:'Arm stays bent',warnAt:'elbow',cam:'sideR'})})});
defEx('straightArm',{group:'back',name:'Straight-arm pulldown',eq:'Cable',part:'Lats',station:'cableCol',entry:'cableCol',standZ:-11.8,pulley:1.95,att:'sbar',kind:'pull',pose:poseStraightArm,
  quip:'Straight arms, soft elbows, lats do the sweeping.',
  mus:{lats:[1,'m'],triLong:[.45,'h'],deltR:[.4,'h'],abs:[.3,'h']},
  labels:[['Lats','lats','m'],['Triceps (long head)','triLong','h']],center:V(0,1.2,-11.55),cam:'sideFlat',coachSpot:{p:[1.5,-11.9],h:-Math.PI/2},
  steps:steps4([['Rise slowly','3 sec'],['Stretch','hands at head height'],['Sweep to the thighs','arms straight'],['Squeeze','bar at the thighs']]),
  stepText:['Let the bar rise slowly in an arc, about 3 seconds. The elbows keep the same soft bend.','Hands at head height, lats stretched, torso leaning forward about 20°.','Sweep the bar down in an arc to the front of your thighs. The arms stay straight.','Bar on the thighs. Squeeze the lats for a moment.'],
  cues:[['Slow arc up.'],['Stretch.'],['Sweep down, arms straight.'],['Squeeze.']],
  beginner:'2–3 sets of 12–15, light: you should feel the lats, not the arms.',
  forms:mk({lower:2.6,touch:.4,press:1.0,lock:.7,prof:'smooth'},{
    bend:MS('Bending the elbows','Turns into a triceps pushdown','The elbows bend from 165° to about 90° during the pull.','The triceps push the bar and the lats stop isolating.','No lat benefit from the exercise.','Soft elbows, keep them still.',{bend:1,meas:'elbowRange',warn:'Elbows bend',warnAt:'elbow',cam:'sideFlat',mul:{triLong:2,triLat:1.2}}),
    upright:MS('Standing upright','No forward lean; bar stops in front','Standing bolt upright, so the bar meets the thighs with the arms still in front.','The last part of the lat squeeze is cut off.','A weaker finish and no extra growth.','Lean forward; bar to the thighs.',{upright:1,meas:'hinge',warn:'Too upright',warnAt:'back',cam:'sideFlat'}),
    bob:MS('Body bobbing','Torso dips on every pull','The torso dips 15–20° on every pull to help the weight down.','The stretch at the top gets yanked.','Irritation at the front of the shoulder from bouncing out of the stretch.','Half the weight, double the control.',{bob:1,meas:'leanRange',warn:'Torso bobs',warnAt:'back',cam:'sideFlat'})})});
defEx('deadlift',{group:'back',name:'Deadlift',eq:'Barbell',part:'Lower back',station:'platform',entry:'floorBar',startFromFloor:true,kind:'hinge',pose:poseDeadlift,
  quip:'Chest and hips rise together, like good neighbours.',coachIn:'Bar over the middle of your feet. Big breath.',
  mus:{erect:[1,'m'],glute:[1,'m'],hams:[.9,'m'],quadV:[.6,'h'],quadRF:[.5,'h'],trapU:[.5,'h'],midBack:[.45,'h'],lats:[.4,'h'],forearm:[.6,'h']},
  labels:[['Lower back','erect','m'],['Glutes','glute','m'],['Hamstrings','hams','m']],center:V(0,.8,-11.95),cam:'sideFlat',coachSpot:{p:[-1.6,-11.5],h:Math.PI/2},
  steps:steps4([['Hinge back, lower','2 sec'],['Plates touch','reset the brace'],['Push the floor away','chest and hips together'],['Stand tall','hips through']]),
  stepText:['Push the hips back first and slide the bar down the thighs; bend the knees once it passes them.','Plates touch the floor. Bar over the middle of your feet, back flat, take a breath.','Push the floor away. Chest and hips rise together, the bar slides up the legs.','Hips forward, stand tall. No leaning back.'],
  cues:[['Hips back first.'],['Breathe, brace.'],['Push the floor away.','Drag the bar up the legs.'],['Stand tall.']],
  beginner:'3 sets of 5 with the bar and light plates. Learn the hinge with 10–20 kg first.',
  forms:mk({lower:2.0,touch:.6,press:1.4,lock:.7,prof:'smooth'},{
    hipsFirst:MS('Hips shoot up','Hips rise before the bar moves','The hips rise first and the torso tips forward before the bar leaves the floor.','It becomes a stiff-leg lift with a longer lever on the back.','The lower back limits every set before the legs do.','Chest and hips rise together.',{hipsFirst:1,meas:'dlLift',warn:'Hips first',warnAt:'lowback',cam:'sideFlat',strain:['erect']}),
    round:MS('Rounded back','Lower back rounds at liftoff','The lower back rounds by 20–30° as the bar leaves the floor.','More shear load on the lumbar discs.','Repeated heavy rounding is where most lifters’ back trouble starts.','Big breath, chest up, flat back.',{round:1,meas:'lumbar',warn:'Back rounds',warnAt:'lowback',cam:'sideFlat',strain:['erect']}),
    drift:MS('Bar drifts forward','Bar swings away from the legs','The bar drifts 10–15 cm in front of the feet as it passes the knees.','A longer lever for the hips and back.','Slower progress and a sore back.','Drag the bar up the legs.',{drift:1,meas:'barDrift',warn:'Bar drifts away',warnAt:'lowback',cam:'sideFlat'})})});
defEx('shrug',{group:'back',name:'Dumbbell shrug',eq:'Dumbbell',part:'Upper traps',station:'dbStand',entry:'dbStand',kind:'raise',pose:poseShrug,needs:'db',dbSize:'heavy',
  quip:'Straight up, straight down. No rolling, this is not dough.',
  mus:{trapU:[1,'m'],forearm:[.5,'h'],midBack:[.25,'h']},
  labels:[['Upper traps','trapU','m'],['Forearms (grip)','forearm','h']],center:V(0,1.3,-12),cam:'front',coachSpot:{p:[-1.3,-11.3],h:Math.PI/2+.5},
  steps:steps4([['Lower all the way','2 sec'],['Shoulders down','arms long'],['Shrug straight up','toward the ears'],['Hold one second','at the top']]),
  stepText:['Lower the shoulders slowly, about 2 seconds.','Let the shoulders drop all the way. Arms straight, like hooks.','Shrug straight up toward your ears. No rolling.','Hold at the top for a second, then lower.'],
  cues:[['Lower slowly.'],['All the way down.'],['Straight up.'],['Hold.']],
  beginner:'2–3 sets of 12–15. Slow tempo; the range is small.',
  forms:mk({lower:2.0,touch:.3,press:1.0,lock:1.0,prof:'smooth'},{
    roll:MS('Rolling shoulders','Shoulders circle forward and back','The shoulders roll in a circle instead of going straight up.','The rolling part works against nothing, because gravity pulls straight down.','Nothing dangerous, just wasted reps; some people get a sore shoulder joint.','Straight up, straight down.',{roll:1,meas:'acrRoll',warn:'Rolling',warnAt:'shoulder',cam:'sideFlat'}),
    curl:MS('Bending the elbows','Arms bend like a curl','The elbows bend as you shrug, so the biceps help lift.','The biceps lift part of the weight.','Elbow strain with heavy dumbbells.','Arms are hooks, not levers.',{curl:1,meas:'elbowTop',warn:'Elbows bend',warnAt:'elbow',cam:'front',mul:{biLong:1.2,biShort:1.2}}),
    head:MS('Head pokes forward','Chin juts forward on each rep','The head moves 5–8 cm forward of the shoulders as you shrug.','The neck muscles take the strain.','Neck ache after shrug days.','Chin level, eyes forward.',{head:1,meas:'earFwd',warn:'Head forward',warnAt:'neck',cam:'sideFlat'})})});
