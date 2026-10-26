
// ---------------------------------------------------------------- core: poses, entries and the 7 exercises
// a body held in a straight line between two support points (planks), with the hips raised (+) or sagging (−)
function lineBody(c,S,A,up,sag,o={}){const hs=D.sh.clone().sub(D.hips).length();const H=S.clone().add(V().subVectors(A,S).setLength(hs)).addScaledVector(up,sag);
  setRoot(c,rootFromAxes(V().subVectors(S,H),o.front),H);resetRest(c);if(o.neck!==undefined)spineBend(c,0,{neck:o.neck,head:o.head||0});c.root.updateMatrixWorld(true);return H;}
// front plank on the forearms, head toward −z
function posePlank(c,F,b,u,P){const br=breatheOf(b)*.004;const S=V(0,.42+br,-12.36);const toe=V(0,.02,-10.98);const sag=F.sag?-.11:F.pike?.13:0;
  const H=lineBody(c,S,toe.clone().add(V(0,.11,0)),V(0,1,0),sag,{front:V(0,-1,0),neck:F.head?.55:-.2,head:F.head?.3:-.15});
  if(F.head){clav(c,{shrug:.25});c.root.updateMatrixWorld(true);}
  for(const s of[1,-1]){const side=sideOf(s),w=-s;const A=V(w*.09,.12,toe.z-.05);legTo(c,side,A,V(0,-1,0));aim(c.bones[side+'Foot'],c.bones[side+'ToeBase'],V(A.x,.02,A.z+.14));
    const sh=wpos(c.bones[side+'Arm']);const E=V(sh.x*.9,.06,sh.z+.01);const hand=V(w*.07,.04,E.z-D.fore*.95);aim(c.bones[side+'Arm'],c.bones[side+'ForeArm'],E);aim(c.bones[side+'ForeArm'],c.bones[side+'Hand'],hand);
    setHandWorld(c.bones[side+'Hand'],side==='Left',V(-w*.25,0,-1).normalize(),V(0,-1,0));curlHand(c,side,.8);}
  c._S=S;c._T=toe;c._H=H;return u;}
// side plank on the right forearm, chest facing +x, head toward −z
function poseSidePlank(c,F,b,u,P){const br=breatheOf(b)*.004;const sag=F.down?-.12:F.sag?-.12:0;const roll=(F.roll?27:0)*DEG;
  const S=V(.0,(F.down?.33:.44)+br,-12.36),toe=V(0,.05,-10.95);const front=V(Math.cos(roll),-Math.sin(roll),0);
  const H=lineBody(c,S,toe.clone().add(V(0,.06,0)),V(0,1,0),sag,{front,neck:.05});
  if(F.shrug){clav(c,{shrug:.35});c.root.updateMatrixWorld(true);}
  const T=torsoAxes(c);
  legTo(c,'Right',V(-.0,.07,toe.z),T.F.clone());footTo(c,'Right',V(.12,.03,toe.z+.02));legTo(c,'Left',V(.05,.17,toe.z-.02),T.F.clone());footTo(c,'Left',V(.17,.15,toe.z));
  const sh=wpos(c.bones.RightArm);const E=V(sh.x+(F.shrug?.0:.0),.05,sh.z+(F.shrug?-.1:0));aim(c.bones.RightArm,c.bones.RightForeArm,E);aim(c.bones.RightForeArm,c.bones.RightHand,E.clone().add(V(D.fore*.95,0,0)));
  setHandWorld(c.bones.RightHand,false,V(1,0,0),V(0,-1,0));curlHand(c,'Right',.7);
  // top hand on the hip
  armTo(c,'Left',wpos(c.bones.Hips).addScaledVector(T.L,.16).add(V(0,.05,0)),{hd:T.U.clone().negate(),pn:T.L.clone().negate(),pole:T.F.clone().negate().addScaledVector(T.L,.3),curl:.3});
  c._S=S;c._T=toe;c._H=H;c._E=E;return u;}
// dead bug: on the back, head toward −z; opposite arm and leg reach (sides alternate every rep)
function poseDeadBug(c,F,b,u,P){const k=smooth(1-clamp(u,0,1));const side=rep%2?1:-1;const arch=F.arch?.6*k:0,lift=F.head?.3:0;
  const H=V(0,.12,-11.85);setRoot(c,rootFromAxes(V(0,arch*.55,-1).normalize(),V(0,1,arch*.55).normalize()),H);resetRest(c);
  spineBend(c,-arch*.9+lift*.45,{neck:lift*1.4,head:lift*.3});clav(c,{shrug:.05});c.root.updateMatrixWorld(true);
  const T=torsoAxes(c);
  for(const s of[1,-1]){const sd=sideOf(s);const reachLeg=s===-side;const reachArm=s===side;
    // legs: table top (hip 90, knee 90) → hip opens toward the floor
    const hipOpen=reachLeg?lerp(0,F.fast?60:52,k)*DEG:0;const thigh=V(0,Math.cos(hipOpen),Math.sin(hipOpen));const shin=V(0,-Math.sin(hipOpen)*.1,1).normalize();
    legDir(c,sd,thigh.clone().add(V(-s*.04,0,0)),thigh.clone().applyAxisAngle(V(1,0,0),Math.PI/2),V(0,1,.3));
    const ar=reachArm?lerp(0,(F.fast?80:75),k)*DEG:0;const ua=V(0,Math.cos(ar),-Math.sin(ar)).add(V(-s*.06,0,0)).normalize();armDir(c,sd,ua,ua,V(s,0,0),{curl:.4});}
  c._H=H;return u;}
// hanging knee raise in the captain's chair (forearms on the pads, back on the pad)
function poseKneeRaise(c,F,b,u,P){const k=smooth(clamp(u,0,1));const sway=F.swing?.09*Math.sin(Math.PI*2*((repT/repLength())%1)):0;const tilt=F.hips?0:24*k;
  const S=V(0,DIP_Y+.04+.31+(F.shrug?-.05*0:0),-12.27+sway*.3);const H=V(0,S.y-.48,-12.31+sway);
  const up=V().subVectors(S,H).normalize().applyAxisAngle(V(1,0,0),-tilt*DEG);setRoot(c,rootFromAxes(up,V(0,0,1).applyAxisAngle(V(1,0,0),-tilt*DEG)),H);resetRest(c);spineBend(c,tilt*DEG);clav(c,{shrug:F.shrug?.35:-.02});c.root.updateMatrixWorld(true);
  const T=pelvisAxes(c);const hip=lerp(5,F.hips?100:105,k)*DEG,knee=lerp(8,90,k)*DEG;
  for(const s of[1,-1]){const sd=sideOf(s);const ta=T.U.clone().negate().applyAxisAngle(T.L,-hip).addScaledVector(T.L,s*.03).normalize();const sa=ta.clone().applyAxisAngle(T.L,knee).normalize();legDir(c,sd,ta,sa,ta.clone().cross(T.L).negate());
    const hx=D.shx+.06*D.s;const E=V(s*hx,DIP_Y+.1,-12.28);aim(c.bones[sd+'Arm'],c.bones[sd+'ForeArm'],E);const Hd=V(s*hx,DIP_Y+.1,-11.95);aim(c.bones[sd+'ForeArm'],c.bones[sd+'Hand'],Hd);
    setHandWorld(c.bones[sd+'Hand'],s>0,V(0,0,1),V(0,-1,0));curlHand(c,sd,1);}
  c._H=H;return u;}
// kneeling cable crunch at the column (rope at the top), facing the tower
function poseCableCrunch(c,F,b,u,P){const k=smooth(clamp(u,0,1));P.use('rope');P.setPulley(2.0);
  const hipFlex=F.hinge?lerp(25,85,k):F.sit?lerp(30,95,k):lerp(28,32,k);const spine=F.hinge?0:lerp(-6,48,k);
  const z=-11.55;const H=V(0,(F.sit?lerp(D.thigh+.07,.3,k):D.thigh+.07)*1,z-.04);const q=qX(hipFlex*DEG);
  setRoot(c,q,H);resetRest(c);spineBend(c,spine*DEG,{neck:.25,head:.05});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);const K=V(s*.12,.07,z);const A=V(s*.1,.09,z-D.shin*.98);legTo(c,sd,F.sit?A.clone().add(V(0,0,.1)):A,V(0,0,1).add(V(0,.3,0)));footTo(c,sd,A.clone().add(V(0,-.06,-.19)));}
  const head=wpos(c.bones.Head);const T=torsoAxes(c);const pull=F.arms?.18*k:0;const hands=[];
  for(const s of[1,-1]){const sd=sideOf(s);const ct=head.clone().addScaledVector(T.L,s*.1).addScaledVector(T.F,.06+pull).addScaledVector(T.U,-.04-pull*.6);hands.push(ct);
    armTo(c,sd,ct,{hd:T.U.clone(),pn:T.L.clone().multiplyScalar(-s),pole:T.U.clone().negate().addScaledVector(T.F,.4)});}
  const mid=hands[0].clone().add(hands[1]).multiplyScalar(.5).add(V(0,.1,.06));P.ropeAt(mid,hands[0],hands[1]);P.cableTo(mid);P.stackTop.position.y=.05+.22*k;c._hf=hipFlex;return u;}
// Pallof press: side-on to the column (tower on the lifter's left), press the handle straight out from the chest
function posePallof(c,F,b,u,P){const k=smooth(clamp(u,0,1));P.use('dh');P.setPulley(1.32);
  standPose(c,{z:-12.15,h:-Math.PI/2,drop:.04,stance:.17,arms:'none',look:0,twist:F.twist?24*k:0,side:F.lean?-26:0});const T=torsoAxes(c);
  const st=wpos(c.bones.Spine2).addScaledVector(T.F,.17).addScaledVector(T.U,-.04);const reach=(D.arm+D.fore)*.88;
  const out=F.drift?T.F.clone().applyAxisAngle(V(0,1,0),-.3):T.F.clone();const ct=st.clone().addScaledVector(out,reach*k+.06);
  for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().addScaledVector(T.L,s*.025),{hd:out.clone(),pn:T.L.clone().multiplyScalar(-s),pole:T.U.clone().negate().addScaledVector(T.L,s*.4)});
  P.dh.position.copy(ct);P.dh.quaternion.setFromUnitVectors(V(1,0,0),V(0,1,0));P.cableTo(ct);P.stackTop.position.y=.12;c._st=st;return u;}
// ab wheel rollout from the knees, rolling toward −z
const WHEEL_HD=V(0,-.3,-1),WHEEL_PN=V(0,-1,.3); // hands on the wheel: fingers forward and down, palms down
function poseAbWheel(c,F,b,u,P){const k=smooth(1-clamp(u,0,1));const out=F.shortR?.32:1;const kk=k*out;
  const K=V(0,.07,-11.1);const wz=lerp(-11.75,-12.6,kk);const W=V(0,.08,wz);if(P.wheel)P.wheel.position.copy(W);
  const hipAng=lerp(95,F.shortR?118:158,kk);const L=D.sh.clone().sub(D.hips).length();
  // hips sit over the knees at the start and move forward as the wheel rolls
  const H=V(0,lerp(D.thigh+.07,.42,kk)-(F.arch?.09*kk:0),lerp(-11.12,-11.45,kk));
  const sink=F.bend&&b.phase===2?.14*Math.sin(Math.PI*b.k):0;const shY=lerp(.575,.38,kk)-sink,shZ=lerp(-11.75,-12.0-kk*.15,kk)+sink*.4;const S=V(0,shY,shZ);const dir=V().subVectors(S,H).normalize();
  setRoot(c,rootFromAxes(dir,V(0,-1,0).applyAxisAngle(V(1,0,0),0)),H);resetRest(c);spineBend(c,F.arch?-.5*kk:.08,{neck:-.4,head:-.1});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const side=sideOf(s),w=-s;const Kp=K.clone().add(V(w*.12,0,0));const A=Kp.clone().add(V(0,.02,D.shin*.98));legTo(c,side,A,V(0,-1,-.3));footTo(c,side,A.clone().add(V(0,-.055,.19)));}
  // the wheel is where the hands can hold it: an arm's length (elbows soft, or bent for the mistake) out in front of the shoulders
  // (solved for the wrist, which sits palm-and-grip back from the handle along the hand: armTo's own offset)
  {const Sl=wpos(c.bones.LeftArm);const el=(F.bend?lerp(176,110,clamp(1-u,0,1)):176)*DEG;const a=D.arm,b=D.fore,dW=Math.sqrt(a*a+b*b-2*a*b*Math.cos(el));
    const hd=WHEEL_HD.clone().normalize(),pn=WHEEL_PN.clone().addScaledVector(hd,-WHEEL_PN.dot(hd)).normalize();const o=hd.multiplyScalar(.075*D.s).addScaledVector(pn,.022*D.s);
    const wr=V(-.09-o.x,W.y-o.y,0);const dx=wr.x-Sl.x,dy=wr.y-Sl.y;W.z=Sl.z+o.z-Math.sqrt(Math.max(.0025,dW*dW-dx*dx-dy*dy));}
  if(P.wheel)P.wheel.position.copy(W);
  for(const s of[1,-1]){const side=sideOf(s),w=-s;armTo(c,side,W.clone().add(V(w*.09,.0,0)),{hd:WHEEL_HD,pn:WHEEL_PN,pole:V(w*.4,.3,1)});}
  c._hipAng=hipAng;c._W=W;return u;}
function buildAbWheel(g){const w=new THREE.Group();g.add(w);const r=cyl(.08,.07,M.black,0,0,0,'x',w,20);cyl(.012,.3,M.steel,0,0,0,'x',w,8);for(const s of[1,-1])cyl(.018,.09,M.red,s*.12,0,0,'x',w,8);w.position.copy(WHEEL_HOME);w.userData.prop=true;return w;}
const WHEEL_HOME=V(-.42,.08,-11.7); // parked beside the mat, where no plank or push-up lies

Object.assign(MEAS,{
  plankSag:{pick:'abs',get:c=>{const S=c._S,T=c._T.clone().add(V(0,.11,0)),H=wpos(c.bones.Hips);const t=clamp((H.z-S.z)/(T.z-S.z),0,1);return (lerp(S.y,T.y,t)-H.y)*100;},fmt:v=>Math.abs(v)<3?'body in one straight line':v>0?'hips '+Math.round(v)+' cm too low':'hips '+Math.round(-v)+' cm too high'},
  headDrop:{pick:'max',get:c=>{const T=torsoAxes(c);const h=V().subVectors(wpos(c.bones.Head),wpos(c.bones.Neck)).normalize();return Math.acos(clamp(h.dot(T.U),-1,1))/DEG;},fmt:v=>v<18?'head in line with the body':'head drops '+Math.round(v)+'°'},
  sideSag:{pick:'abs',get:c=>{const S=c._S,T=c._T.clone().add(V(0,.06,0)),H=wpos(c.bones.Hips);const t=clamp((H.z-S.z)/(T.z-S.z),0,1);return (lerp(S.y,T.y,t)-H.y)*100;},fmt:v=>Math.abs(v)<3?'hips up, body straight':'hips sag '+Math.round(v)+' cm'},
  pelvisRoll:{pick:'max',get:c=>{const L=pelvisAxes(c).L;return Math.abs(Math.asin(clamp(L.x,-1,1))/DEG);},fmt:v=>v<10?'hips stacked':'hips roll '+Math.round(v)+'° toward the floor'},
  elbowUnder:{pick:'max',get:c=>c._E?Math.abs(c._E.z-wpos(c.bones.RightArm).z)*100:0,fmt:v=>v<4?'elbow under the shoulder':'elbow '+Math.round(v)+' cm out of line'},
  backGap:{pick:'max',get:c=>Math.max(0,(wpos(c.bones.Spine1).y-wpos(c.bones.Hips).y-.0)*100+0),fmt:v=>v<3?'lower back stays down':'lower back lifts '+Math.round(v)+' cm'},
  moveTime:{get:(c,x)=>x.F.lower,fmt:v=>v>=1.8?'each reach takes '+v.toFixed(1)+' s':'limbs swing in '+v.toFixed(1)+' s'},
  headLift:{pick:'max',get:c=>{const h=wpos(c.bones.Head),n=wpos(c.bones.Neck);const skull=h.clone().addScaledVector(h.clone().sub(n).normalize(),.09*D.s);return Math.max(0,(skull.y-.1*D.s)*100);},fmt:v=>v<4?'head rests on the mat':'head lifts '+Math.round(v)+' cm'},
  hipSway:{pick:'range',get:c=>wpos(c.bones.Hips).z*100,fmt:v=>v<5?'no swinging':'hips swing '+Math.round(v)+' cm'},
  pelvisCurl:{pick:'range',get:c=>{const U=pelvisAxes(c).U;return Math.atan2(U.z,U.y)/DEG;},fmt:v=>v>=12?'pelvis curls up '+Math.round(v)+'°':'pelvis stays still (only the hip flexors lift)'},
  crunchHip:{pick:'range',get:c=>c._hf||0,fmt:v=>v<12?'hips stay still':'hips fold '+Math.round(v)+'°'},
  handHead:{pick:'max',get:c=>gripPoint(c,'Left').distanceTo(wpos(c.bones.Head))*100-14,fmt:v=>v<6?'rope stays by the head':'hands drift '+Math.round(v)+' cm from the head'},
  shoulderYaw:{at:'top',get:c=>{const L=torsoAxes(c).L,P2=pelvisAxes(c).L;return Math.acos(clamp(L.dot(P2),-1,1))/DEG;},fmt:v=>v<8?'shoulders stay square':'shoulders twist '+Math.round(v)+'°'},
  sideLean2:{pick:'max',get:c=>{const u=V().subVectors(wpos(c.bones.Neck),wpos(c.bones.Hips)).normalize();return Math.abs(Math.asin(clamp(u.dot(pelvisAxes(c).L),-1,1))/DEG);},fmt:v=>v<6?'standing tall':'leaning '+Math.round(v)+'° away'},
  handMid:{at:'top',get:c=>{const T=torsoAxes(c);return Math.abs(V().subVectors(gripPoint(c,'Left').add(gripPoint(c,'Right')).multiplyScalar(.5),c._st).dot(T.L))*100;},fmt:v=>v<6?'hands straight out from the chest':'hands drift '+Math.round(v)+' cm toward the tower'},
  wheelHip:{at:'bottom',get:c=>c._hipAng||0,fmt:v=>v>=145?'hips open to '+Math.round(v)+'°':'hips stay back ('+Math.round(v)+'°)'},
  wheelArch:{at:'bottom',get:c=>{const a=V().subVectors(wpos(c.bones.Spine1),wpos(c.bones.Hips)).normalize(),b2=V().subVectors(wpos(c.bones.Neck),wpos(c.bones.Spine2)).normalize();return Math.acos(clamp(a.dot(b2),-1,1))/DEG;},fmt:v=>v<12?'back stays flat at full reach':'lower back arches '+Math.round(v)+'°'},
  wheelElbow:{pick:'min',get:c=>avg2(s=>elbowAng(c,s)),fmt:v=>v>=165?'arms stay straight':'elbows bend to '+Math.round(v)+'°'},
});
MEAS.backGap.get=c=>{const sp=wpos(c.bones.Spine1).y,h=wpos(c.bones.Hips).y;return Math.max(0,(sp-h-.01)*100);};

// ---- getting on and off (every change of pose is a settle: the feet stay on the floor while the body moves)
// sitting on the mat facing −z, legs out, hands by the hips (between kneeling and lying on the side)
function sitMat(c){const H=V(0,.11,-11.6);setRoot(c,qY(Math.PI).multiply(qX(-8*DEG)),H);resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s),w=-s;legTo(c,sd,V(w*.14,.09,-12.05),V(0,1,-.4));}armsHang(c);}
// sitting on the mat facing +z, knees up, hands propped on the floor behind (between standing and lying on the back)
function sitMatBack(c){setRoot(c,qX(-24*DEG),V(0,.12,-11.78));resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1])legTo(c,sideOf(s),V(s*.14,.09,-11.4),V(0,1,.4));
  for(const s of[1,-1])armTo(c,sideOf(s),V(s*.3,.03,-12.0),{hd:V(s*.3,0,-1),pn:V(0,-1,0),pole:V(s*.5,.3,-.6),curl:.2});}
// lying on the back, knees bent, feet on the mat
function lieBack(c){setRoot(c,qX(0),V(0,.11,-11.83));resetRest(c);c.root.updateMatrixWorld(true);for(const s of[1,-1])legTo(c,sideOf(s),V(s*.14,.09,-11.4),V(0,1,.4));armsHang(c);}
// kneeling bent forward, right hand on the right knee, the left hand round the near handle of the wheel parked beside the mat
function wheelReach(c){kneelPose(c,{z:-11.1,lean:100,arms:'none'});
  armTo(c,'Right',wpos(c.bones.RightLeg).add(V(.02,.07,-.03)),{hd:V(0,-.4,-1),pn:V(0,-1,0),pole:V(.5,-.3,.6),curl:.4});
  armTo(c,'Left',WHEEL_HOME.clone().add(V(-.09,0,0)),{hd:V(0,-.3,-1),pn:V(0,-1,.3),pole:V(-.4,.3,1)});}
// the wheel rides in the left hand between its parking spot and the start of the rollout
function wheelFollow(c){ST.P.wheel.position.copy(toC(ST,gripPoint(c,'Left')).add(V(.09,0,0)));}
// standing in the captain's chair with the elbows raised in front, forearms up, so they clear the handles
function chairArmsUp(c){standPose(c,{z:-12.2,arms:'none'});for(const s of[1,-1])armDir(c,sideOf(s),V(s*.15,-.35,1),V(0,1,.12),V(-s,0,0),{curl:.3});}
// forearms on the pads while still standing: the shoulders are lower than when hanging, so the elbows sit a little outside the pads
function chairArmsOn(c){standPose(c,{z:-12.2,arms:'none'});const hx=D.shx+.06*D.s;c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);aim(c.bones[sd+'Arm'],c.bones[sd+'ForeArm'],V(s*(hx+.14),DIP_Y+.08,-12.2));aim(c.bones[sd+'ForeArm'],c.bones[sd+'Hand'],V(s*hx,DIP_Y+.11,-11.95));
    setHandWorld(c.bones[sd+'Hand'],s>0,V(-s*.3,0,1).normalize(),V(0,-1,0));curlHand(c,sd,1);}}
const MAT={land:1,pre:[0,-10.45],face:Math.PI};
ENTRY.matPlank={...MAT,enter:(st,e)=>[{walk:[0,-10.85],land:1,d:.6},{d:1.0,anim:settle(c=>kneelPose(c,{z:-11.6}))},{d:1.0,anim:settle(allFours)},{d:1.2,anim:settle(exP(1,3))}],
  leave:(st,e)=>[{d:1.0,anim:settle(allFours)},{d:1.0,anim:settle(c=>kneelPose(c,{z:-11.6}))},{d:1.1,anim:settle(c=>standPose(c,{z:-11.1,h:Math.PI}))},{walk:[0,-10.45],land:1,d:.9}]};
ENTRY.matSide={...MAT,enter:(st,e)=>[{walk:[0,-10.85],land:1,d:.6},{d:1.0,anim:settle(c=>kneelPose(c,{z:-11.6}))},{d:1.2,anim:settle(sitMat,{arc:V(.3,.1,0)})},{d:1.3,anim:settle(c=>poseSidePlank(c,{down:1},{phase:3,k:0},1,st.P),{arc:V(.25,.08,0)})},{d:1.1,anim:settle(exP(1,3))}],
  leave:(st,e)=>[{d:1.0,anim:settle(c=>poseSidePlank(c,{down:1},{phase:3,k:0},1,st.P))},{d:1.1,anim:settle(sitMat,{arc:V(.25,.08,0)})},{d:1.2,anim:settle(c=>kneelPose(c,{z:-11.6}),{arc:V(.3,.1,0)})},{d:1.1,anim:settle(c=>standPose(c,{z:-11.1,h:Math.PI}))},{walk:[0,-10.45],land:1,d:.9}]};
ENTRY.matBack={...MAT,enter:(st,e)=>[{walk:[0,-11.35],land:1,d:.9},...turnSteps(0,-11.35,Math.PI,0),{d:1.1,anim:settle(sitMatBack)},{d:1.0,anim:settle(lieBack)},{d:1.2,anim:settle(exP(1,3),{kneeUp:1})}],
  leave:(st,e)=>[{d:1.6,anim:settle(lieBack,{kneeUp:1})},{d:1.0,anim:settle(sitMatBack)},{d:1.1,anim:settle(c=>standPose(c,{z:-11.35}))},...turnSteps(0,-11.35,0,Math.PI),{walk:[0,-10.45],land:1,d:.9}]};
ENTRY.matWheel={...MAT,enter:(st,e)=>[{walk:[0,-10.85],land:1,d:.6},{d:1.0,anim:settle(c=>kneelPose(c,{z:-11.1}))},{d:1.0,anim:settle(wheelReach)},{d:1.0,anim:settle(exP(1,3)),props:wheelFollow}],
  leave:(st,e)=>[{d:.9,pose:exP(1,3),props:wheelFollow},{d:1.0,anim:settle(wheelReach),props:wheelFollow},{d:.9,anim:settle(c=>kneelPose(c,{z:-11.1}))},{call:()=>st.P.wheel.position.copy(WHEEL_HOME)},{d:1.0,anim:settle(c=>standPose(c,{z:-10.85,h:Math.PI}))},{walk:[0,-10.45],land:1,d:.6}]};
ENTRY.chair={land:1,pre:[0,-10.8],face:Math.PI,
  enter:(st,e)=>[...turnSteps(0,-10.8,Math.PI,0),{walk:[0,-11.3],back:true,land:1,d:1.4},{d:.6,anim:settle(c=>standPose(c,{z:-11.3,armOut:.6}))},...shuffle(-11.3,-12.2),{d:1.0,anim:settle(chairArmsUp)},{d:.7,anim:settle(chairArmsOn)},{d:.7,anim:settle(exP(0,1))},{d:1.3,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:1.4,pose:exP(0,1)},{d:.8,anim:settle(chairArmsOn)},{d:1.0,anim:settle(chairArmsUp)},{d:1.0,anim:settle(c=>standPose(c,{z:-12.2,armOut:.6}))},...shuffle(-12.2,-11.3),{walk:[0,-10.8],land:1,d:1.4}]};
// cable crunch: take the rope standing, kneel down with it, then crunch; the rope, cable and stack follow the hands
function ropeHandsStanding(c){standPose(c,{z:COL_Z,arms:'none'});const P=ST.P;const p=P.pulW().add(P.hang);
  for(const s of[1,-1])armTo(c,sideOf(s),p.clone().add(V(s*.045,-.22,0)),{hd:V(0,1,0),pn:V(-s,0,0),pole:V(s*.3,-1,-.3)});}
// hands brought up in front of the chest first, so the arms do not swing out through the tower on their way up to the rope
function handsAtChest(c){standPose(c,{z:COL_Z,arms:'none'});const T=torsoAxes(c);const ct=wpos(c.bones.Spine2).addScaledVector(T.F,.16).addScaledVector(T.U,.06);
  for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().addScaledVector(T.L,s*.1),{hd:V(0,1,0),pn:V(-s,0,0),pole:V(s*.3,-1,-.3),curl:.4});}
function ropeKneel(c){kneelPose(c,{h:0,z:-11.55,arms:'none'});const head=wpos(c.bones.Head);
  for(const s of[1,-1])armTo(c,sideOf(s),head.clone().add(V(s*.1,.17,.1)),{hd:V(0,1,0),pn:V(-s,0,0),pole:V(s*.3,-1,-.3)});}
ENTRY.cableKneel={land:1,pre:[0,-12.35],face:0,
  enter:(st,e)=>[...colSet(e.pulley,e.att),{d:.5,anim:settle(handsAtChest)},{d:.7,anim:settle(ropeHandsStanding)},
    {d:1.3,anim:settle(ropeKneel),props:c=>ropeFollow(c)},{d:1.0,anim:settle(exP(0,1)),props:c=>ropeFollow(c)},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.9,pose:exP(0,1)},{d:1.0,anim:settle(ropeKneel),props:c=>ropeFollow(c)},{d:1.3,anim:settle(ropeHandsStanding),props:c=>ropeFollow(c)},{call:()=>st.P.rest()},{d:.6,anim:settle(handsAtChest)},
    {d:.6,anim:settle(c=>standPose(c,{z:COL_Z}))},{walk:[0,-12.35],back:true,land:1,d:.9}]};
// Pallof press: take the handle at the column, two side-steps out and round to side-on, press
function pallofHold(c,o){standPose(c,{...o,arms:'none'});const T=torsoAxes(c);const ct=wpos(c.bones.Spine2).addScaledVector(T.F,.17+(o.reach||0)).addScaledVector(T.U,-.04);
  for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().addScaledVector(T.L,s*.025),{hd:T.F.clone(),pn:T.L.clone().multiplyScalar(-s),pole:T.U.clone().negate().addScaledVector(T.L,s*.4)});}
function dhHandsStanding(c){standPose(c,{z:COL_Z,arms:'none'});const p=ST.P.pulW().add(ST.P.hang);
  for(const s of[1,-1])armTo(c,sideOf(s),p.clone().add(V(s*.025,0,0)),{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.4,-1,0)});}
ENTRY.pallof={land:1,pre:[0,-12.75],face:0,
  enter:(st,e)=>[...colSet(e.pulley,e.att),{d:.8,anim:settle(dhHandsStanding)},{d:.9,anim:settle(c=>pallofHold(c,{z:-11.75,h:-Math.PI/4}),{step:1}),props:c=>ropeFollow(c)},
    {d:1.0,anim:settle(exP(0,1),{step:1}),props:c=>ropeFollow(c)},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.8,pose:exP(0,1)},{d:.9,anim:settle(c=>pallofHold(c,{z:-11.75,h:-Math.PI/4}),{step:1}),props:c=>ropeFollow(c)},{d:1.2,anim:settle(dhHandsStanding,{step:1}),props:c=>ropeFollow(c)},
    {d:.7,anim:settle(c=>standPose(c,{z:COL_Z})),props:(c,k)=>{const P=st.P;const p=P.pulW().add(P.hang);P.attPos().lerp(p,smooth(k));P.cableTo(P.attPos());if(k>=1)P.rest();}},{walk:[0,-12.75],back:true,land:1,d:1.2}]};

// ---- the exercises
const CORE_HOLD=(l)=>({lower:l,touch:l,press:l,lock:l,prof:'smooth'});
defEx('plank',{group:'core',name:'Front plank',eq:'Bodyweight',part:'Abs (anti-arch)',station:'mat',entry:'matPlank',kind:'hold',hold:'20–45 s',pose:posePlank,
  quip:'Lie down. Don’t relax. Welcome to the plank.',mus:{abs:[1,'m'],oblq:[.7,'m'],erect:[.35,'h'],glute:[.45,'h'],deltF:[.3,'h']},
  labels:[['Abs','abs','m'],['Obliques','oblq','m'],['Glutes','glute','h']],center:V(0,.35,-11.7),cam:'pushSide',coachSpot:{p:[-1.4,-11.6],h:Math.PI/2},
  steps:steps4([['Elbows under the shoulders','forearms down'],['Feet back','body straight'],['Squeeze glutes','tuck the tailbone'],['Breathe and hold','20–45 s']]),
  stepText:['Elbows directly under the shoulders, forearms flat.','Feet back one at a time, toes tucked: one straight line from head to heels.','Squeeze the glutes and tuck the tailbone a little, ribs down.','Breathe normally and hold 20–45 seconds. Brace the whole belly, don’t just suck it in.'],
  cues:[['Elbows under shoulders.'],['Long straight body.'],['Squeeze, tuck.'],['Breathe, hold.']],
  beginner:'3 holds of 20–30 s (or from the knees). Add 5 s a week; past 45–60 s, try the elbows 10–15 cm further forward instead.',
  forms:mk(CORE_HOLD(1.6),{
    sag:MS('Hips sag','Hips drop, back arches','The hips drop about 10 cm below the line and the lower back arches.','The abs let go and the lower back hangs.','A sore lower back instead of ab work.','Squeeze glutes, tuck the tailbone.',{sag:1,meas:'plankSag',warn:'Hips sag',warnAt:'hips',cam:'pushSide',strain:['erect']}),
    pike:MS('Hips piked','Hips high like a tent','The hips sit 10–15 cm above the line, like a tent.','The abs are off the hook; the shoulders hold you.','No progress.','Lower the hips, long body.',{pike:1,meas:'plankSag',warn:'Hips too high',warnAt:'hips',cam:'pushSide',mul:{abs:.6,deltF:2}}),
    head:MS('Head drops','Chin to chest, shoulders collapse','The head drops toward the floor and the shoulders sink toward the ears.','Neck strain; the shoulder-blade muscles switch off.','Neck ache.','Eyes on the hands, push the floor away.',{head:1,meas:'headDrop',warn:'Head drops',warnAt:'neck',cam:'pushSide'})})});
defEx('sidePlank',{group:'core',name:'Side plank',eq:'Bodyweight',part:'Obliques',station:'mat',entry:'matSide',kind:'hold',hold:'15–40 s a side',pose:poseSidePlank,
  quip:'Half a plank, twice the wobble.',mus:{oblq:[1,'m'],gluteMed:[.75,'m'],abs:[.5,'h'],deltS:[.3,'h']},
  labels:[['Obliques','oblq','m'],['Side glute','gluteMed','m']],center:V(0,.4,-11.7),cam:'front',coachSpot:{p:[1.4,-11.6],h:-Math.PI/2},
  steps:steps4([['Elbow under the shoulder','forearm forward'],['Lift the hips','body straight'],['Hips stacked','don’t roll'],['Hold and breathe','then switch sides']]),
  stepText:['Elbow under the shoulder, forearm pointing forward, feet stacked.','Lift the hips until the body is one straight line.','Keep the hips stacked and the chest facing sideways.','Breathe and hold, then switch sides. Keep both sides within about 5 seconds of each other.'],
  cues:[['Elbow under.'],['Hips up.'],['Don’t roll.'],['Breathe.']],
  beginner:'3 holds of 15–20 s per side, from the knees if needed.',
  forms:mk(CORE_HOLD(1.6),{
    sag:MS('Hips sag','Hips drop toward the floor','The hips drop about 12 cm toward the floor, like a banana.','The obliques and side glute stop working.','The drill does nothing.','Hips up, long straight line.',{sag:1,meas:'sideSag',warn:'Hips sag',warnAt:'hips',cam:'front'}),
    roll:MS('Rolling forward','Chest turns to the floor','The chest turns toward the floor and the pelvis rolls 25–30°.','The load leaves the obliques for the shoulder.','A sore shoulder.','Chest faces the wall, not the floor.',{roll:1,meas:'pelvisRoll',warn:'Rolling forward',warnAt:'hips',cam:'front',strain:['deltF']}),
    shrug:MS('Shoulder shrugged','Elbow out of line, shoulder by the ear','The elbow sits 10 cm in front of the shoulder and the shoulder rides up toward the ear.','The shoulder joint is stressed.','A sore front shoulder.','Push the floor away, elbow under.',{shrug:1,meas:'elbowUnder',warn:'Shoulder strained',warnAt:'shoulder',cam:'front',strain:['deltS']})})});
defEx('deadBug',{group:'core',name:'Dead bug',eq:'Bodyweight',part:'Deep abs (brace)',station:'mat',entry:'matBack',kind:'raise',pose:poseDeadBug,
  quip:'Lie on your back, wave limbs, feel smug.',mus:{abs:[1,'m'],oblq:[.7,'m'],quadRF:[.4,'h']},
  labels:[['Abs','abs','m'],['Obliques','oblq','m'],['Hip flexors','quadRF','h']],center:V(0,.35,-11.8),cam:'sideFlat',coachSpot:{p:[-1.4,-11.6],h:Math.PI/2},
  steps:steps4([['Opposite arm and leg reach','slowly'],['Stop before the back lifts','heel off the floor'],['Return slowly','2 sec'],['Switch sides','back pressed down']]),
  stepText:['Lower one arm overhead and the opposite leg toward the floor at the same time, slowly.','Stop with the heel a few centimetres off the mat, before the lower back lifts.','Bring them back slowly to the table-top start.','Switch sides. The lower back stays pressed into the mat the whole time.'],
  cues:[['Slow reach.'],['Back stays down.'],['Return slowly.'],['Switch.']],
  beginner:'3 sets of 6–8 per side, legs only at first. The best start for anyone with a sore back.',
  forms:mk({lower:2.0,touch:.8,press:2.0,lock:.4,prof:'smooth'},{
    arch:MS('Lower back arches','A gap opens under the back','A gap opens under the lower back as the leg goes down.','The hip flexors win and the abs lose.','It becomes a hip-flexor drill and the back gets cranky.','Only as low as the back stays down.',{arch:1,meas:'backGap',warn:'Back lifts',warnAt:'lowback',cam:'sideFlat',mul:{quadRF:1.8}}),
    fast:MS('Too fast','Arms and legs swing quickly','The arm and leg swing out and back in under a second.','Momentum, no bracing.','You never learn the brace.','Slow, like moving through honey.',{fast:1,lower:.55,touch:.1,press:.55,lock:.15,meas:'moveTime',warn:'Too fast',warnAt:'hips',cam:'sideFlat'}),
    head:MS('Head lifts','Head and shoulders curl up','The chin tucks hard and the head and shoulders lift off the mat.','The neck works instead of the abs.','Neck ache.','Head heavy on the mat.',{head:1,meas:'headLift',warn:'Head lifts',warnAt:'neck',cam:'sideFlat'})})});
defEx('kneeRaise',{group:'core',name:'Hanging knee raise',eq:'Bodyweight',part:'Abs (lower bias)',station:'tower',entry:'chair',kind:'raise',pose:poseKneeRaise,
  quip:'Hang around and bring your knees to the party.',mus:{abs:[1,'m'],oblq:[.8,'m'],quadRF:[.6,'h'],forearm:[.3,'h']},
  labels:[['Abs','abs','m'],['Obliques','oblq','m'],['Hip flexors','quadRF','h']],center:V(0,1.1,-12.1),cam:'sideL',coachSpot:{p:[1.35,-11.2],h:-Math.PI/2-.4},
  steps:steps4([['Lower slowly','2 sec, no swing'],['Hang tall','shoulders down'],['Knees up to the chest','curl the pelvis'],['Squeeze','one second']]),
  stepText:['Lower the legs slowly, about 2 seconds, without swinging.','Hang tall with the shoulders pushed down.','Draw the knees up and curl the pelvis so the lower back rounds off the pad.','Squeeze for a second. You can bias the lower part of the abs a little this way; it is still one muscle.'],
  cues:[['Lower slowly.'],['Shoulders down.'],['Curl the hips up.'],['Squeeze.']],
  beginner:'3 sets of 8–12 in the captain’s chair. If your lower back hurts, go back to the dead bug.',
  forms:mk({lower:2.0,touch:.4,press:1.3,lock:1.0,prof:'smooth'},{
    swing:MS('Swinging','Body swings like a pendulum','The body swings 15–20 cm on every rep and the reps use momentum.','Momentum, not the abs.','No progress; your grip tires first.','Pause at the bottom, no swing.',{swing:1,meas:'hipSway',warn:'Swinging',warnAt:'hips',cam:'sideL'}),
    hips:MS('Knees only, no curl','Knees rise but the pelvis stays still','The knees come up but the pelvis never curls.','The hip flexors do all the work.','Tight hip flexors, undertrained abs.','Curl the hips up, not just the knees.',{hips:1,meas:'pelvisCurl',warn:'No pelvis curl',warnAt:'hips',cam:'sideL',mul:{quadRF:2,abs:.6}}),
    shrug:MS('Shrugged shoulders','Shoulders ride up to the ears','The shoulders ride up toward the ears.','The neck and traps hold you up.','Neck strain.','Push the shoulders down.',{shrug:1,meas:'shrug',warn:'Shoulders shrug',warnAt:'neck',cam:'front',strain:['trapU']})})});
defEx('cableCrunch',{group:'core',name:'Kneeling cable crunch',eq:'Cable',part:'Abs',station:'cableCol',entry:'cableKneel',pulley:2.0,att:'rope',kind:'curl',pose:poseCableCrunch,
  quip:'Kneel, bow to the cable, repeat fifteen times.',mus:{abs:[1,'m'],oblq:[.6,'h']},
  labels:[['Abs','abs','m'],['Obliques','oblq','h']],center:V(0,.9,-11.65),cam:'sideFlat',coachSpot:{p:[1.4,-12.1],h:-Math.PI/2},
  steps:steps4([['Return slowly','abs stretched'],['Rope by the head','hips still'],['Crunch ribs to knees','curl the spine'],['Squeeze','elbows to thighs']]),
  stepText:['Come back up slowly until the abs are stretched; the stack stays off the pile.','Rope against the head, hips fixed about 30° short of straight.','Curl the ribs toward the pelvis. The spine bends; the hips don’t move.','Elbows reach the middle of the thighs. Squeeze for a second.'],
  cues:[['Slowly up.'],['Hips still.'],['Curl the spine.'],['Squeeze.']],
  beginner:'3 sets of 10–15 with a light stack. Kneel on a mat. No study has measured this one yet; it is coaching practice.',
  forms:mk({lower:2.0,touch:.3,press:1.0,lock:1.0,prof:'smooth'},{
    hinge:MS('Hinging at the hips','Bows at the hips with a straight back','The torso folds at the hips with a straight back instead of curling.','The hip flexors and lats move the weight.','The abs grow nothing and the hip flexors tighten.','Curl the spine; the hips don’t move.',{hinge:1,meas:'crunchHip',warn:'Hips fold',warnAt:'hips',cam:'sideFlat',mul:{lats:1.4,quadRF:1.6,abs:.6}}),
    arms:MS('Pulling with the arms','Hands pull away from the head','The hands drift about 15 cm away from the head and the arms pull the rope.','It becomes a lat pulldown.','Nothing for the abs.','Rope glued to your head.',{arms:1,meas:'handHead',warn:'Arms pulling',warnAt:'elbow',cam:'sideFlat',mul:{lats:1.6}}),
    sit:MS('Sitting back','Bottom drops to the heels','The bottom drops back toward the heels at the bottom of each rep.','Momentum comes from the hips.','No ab stimulus.','Stay tall on the knees.',{sit:1,meas:'crunchHip',warn:'Sitting back',warnAt:'hips',cam:'sideFlat'})})});
defEx('pallof',{group:'core',name:'Pallof press',eq:'Cable',part:'Obliques (anti-twist)',station:'cableCol',entry:'pallof',pulley:1.32,att:'dh',kind:'press',pose:posePallof,
  quip:'The cable wants you to twist. Politely refuse.',mus:{oblq:[1,'m'],abs:[.7,'m'],glute:[.3,'h'],deltF:[.3,'h']},
  labels:[['Obliques','oblq','m'],['Abs','abs','m']],center:V(0,1.1,-12.1),cam:'front',coachSpot:{p:[-1.3,-12.7],h:Math.PI/2},
  steps:steps4([['Bring it back','to the chest'],['Handle at the chest','cable taut'],['Press straight out','don’t twist'],['Hold','two seconds']]),
  stepText:['Bring the handle back to the middle of your chest.','Handle at the breastbone, side-on to the tower, cable taut.','Press straight out to arm’s length. The cable tries to twist you; don’t let it.','Hold for two seconds, belly button facing forward. Then the other side.'],
  cues:[['Back to the chest.'],['Stand tall.'],['Press straight out.'],['Hold, no twist.']],
  beginner:'3 sets of 8–10 per side with the lightest plate. Only a small pilot study exists; this is mostly coaching practice.',
  forms:mk({lower:1.0,touch:.3,press:1.0,lock:2.0,prof:'smooth'},{
    twist:MS('Trunk twists','Shoulders turn toward the tower','The shoulders rotate 20–30° toward the tower at full reach.','The cable wins and the obliques give up.','The drill trains nothing.','Belly button faces the front.',{twist:1,meas:'shoulderYaw',warn:'Twisting',warnAt:'back',cam:'above'}),
    lean:MS('Leaning away','Body leans away to counterweight','The torso bends about 15° away from the tower to counterweight the cable.','Body weight does the anti-twist work.','No oblique work.','Stand tall, stay centred.',{lean:1,meas:'sideLean2',warn:'Leaning away',warnAt:'hips',cam:'front'}),
    drift:MS('Hands drift','Handle drifts toward the tower','The handle ends about 10 cm off the middle of the chest, toward the tower.','A shorter lever, so it gets easier.','Less and less load over time.','Press straight from your breastbone.',{drift:1,meas:'handMid',warn:'Hands drift',warnAt:'wrist',cam:'above'})})});
defEx('abWheel',{group:'core',name:'Ab wheel rollout',eq:'Ab wheel',part:'Abs (anti-arch)',station:'mat',entry:'matWheel',kind:'squat',pose:poseAbWheel,
  quip:'Roll out. Roll back. Question your choices.',mus:{abs:[1,'m'],oblq:[.8,'m'],lats:[.4,'h'],triLong:[.3,'h']},
  labels:[['Abs','abs','m'],['Obliques','oblq','m'],['Lats','lats','h']],center:V(0,.4,-11.8),cam:'pushSide',coachSpot:{p:[-1.4,-11.6],h:Math.PI/2},
  steps:steps4([['Roll out','2 sec, hips forward'],['Hold','before the back arches'],['Pull back with the abs','arms straight'],['Kneel tall','tuck the tailbone']]),
  stepText:['Roll the wheel forward, hips moving forward with it.','Stop with the body nearly straight from knees to hands, before the lower back arches. Hold a second.','Pull the wheel back to the knees with the abs. Arms stay straight.','Back to kneeling, tailbone tucked, wheel under the shoulders.'],
  cues:[['Roll out slowly.'],['Ribs down.'],['Pull with the belly.'],['Tuck.']],
  beginner:'3 sets of 5–8 to a half rollout; roll further over the weeks. Skip it with a sore lower back.',
  forms:mk({lower:2.0,touch:1.0,press:2.0,lock:.5,prof:'smooth'},{
    arch:MS('Lower back arches','Belly drops at full reach','At full reach the belly drops and the lower back arches.','The spine takes the load the abs should.','The classic ab-wheel back strain.','Ribs down, tuck, stop earlier.',{arch:1,meas:'wheelArch',warn:'Back arches',warnAt:'lowback',cam:'pushSide',strain:['erect']}),
    short:MS('Hips stay back','Only the arms move','The hips never open past about 100°, so the wheel barely rolls out.','It becomes a shoulder exercise; the abs barely work.','No progress.','Hips go forward with the wheel.',{shortR:1,meas:'wheelHip',warn:'Hips stay back',warnAt:'hips',cam:'pushSide',mul:{abs:.5,lats:1.5}}),
    bend:MS('Bending the elbows','Arms bend to drag the wheel back','The elbows bend to about 110° to drag the wheel back.','The triceps and lats do the return.','Elbow and shoulder strain; undertrained abs.','Arms straight, pull with the belly.',{bend:1,meas:'wheelElbow',warn:'Elbows bend',warnAt:'elbow',cam:'pushSide'})})});
