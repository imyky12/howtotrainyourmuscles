
// ---------------------------------------------------------------- legs: poses, entries and the 9 exercises
// bar resting on the upper back (high bar: just below the base of the neck)
function barOnBack(c){const T=torsoAxes(c);return wpos(c.bones.Neck).addScaledVector(T.F,-.075*D.s).addScaledVector(T.U,-.035*D.s);}
function backBarHands(c,ct){const T=torsoAxes(c);for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().addScaledVector(T.L,s*.4*D.s),{hd:T.U.clone().addScaledVector(T.F,.3),pn:T.F.clone().negate(),pole:T.U.clone().negate().addScaledVector(T.F,-.5).addScaledVector(T.L,s*.2)});}
// a standing pose placed so that a point on the body (bar) sits over the middle of the foot
function overMidfoot(c,o,pt,mid){let back=o.back||0;for(let i=0;i<3;i++){standPose(c,{...o,back});const p=pt(c);back+=p.z-mid;}return back;}
const SQ_FOOT=-11.95;
function squatPose(c,P,k,o={}){const half=o.half?.6:1;const kk=k*half;
  const hinge=o.goodMorning&&o.rising?lerp(10,68,Math.sin(Math.PI*clamp(o.rising,0,1))*.0+kk):lerp(4,o.goodMorning?66:40,kk);
  const drop=lerp(.02,.56,kk)*(o.goodMorning&&o.rising?.92:1);
  const opt={z:SQ_FOOT,hinge,drop,stance:.17*D.s,toe:22,arms:'none',kneeIn:o.kneeIn?o.kneeIn*.6*kk:0,look:hinge*.7};
  overMidfoot(c,opt,c2=>barOnBack(c2),SQ_FOOT+.04);const bar=barOnBack(c);backBarHands(c,bar);if(P&&P.bar){P.bar.position.copy(bar);P.bar.quaternion.identity();}return bar;}
function poseSquat(c,F,b,u,P){const k=1-clamp(u,0,1);const rising=F.goodMorning&&b.phase===2?b.k:0;
  squatPose(c,P,smooth(k),{half:F.half,kneeIn:F.kneeIn,goodMorning:F.goodMorning,rising});c._kneeIn=F.kneeIn;return u;}
// Romanian deadlift: knees soft and fixed, hips go back, bar slides down the thighs
function rdlPose(c,P,k,o={}){const th=lerp(0,o.squat?55:74,k);const drop=lerp(.03,o.squat?.32:.145,k);
  standPose(c,{z:PLAT.barZ-.06,hinge:th,drop,back:lerp(.02,o.squat?.2:.3,k),round:o.round?50*k:0,stance:.13*D.s,toe:4,arms:'none',look:th*.6});
  // the bar rides down the front of the thighs and shins: find the point on the legs a straight arm's length from the shoulders
  const [a,b2]=shoulders(c);const S=a.add(b2).multiplyScalar(.5);const B=c.bones;const H=wpos(B.LeftUpLeg),K=wpos(B.LeftLeg),A=wpos(B.LeftFoot);const L=ARM_HANG();let bar=null;
  for(let i=0;i<=40&&!bar;i++){const t=i/40;const p=t<.5?H.clone().lerp(K,t*2):K.clone().lerp(A,(t-.5)*2);p.x=0;p.z+=(t<.5?.085:.06);if(p.distanceTo(S)>=L)bar=p;}
  if(!bar)bar=V(0,S.y-L,S.z);if(o.drift)bar.z+=.09*k;
  barHands(c,bar,.25*D.s,{hd:V(0,-1,-.1),pn:V(0,0,-1),pole:V(.25,.2,-1)});if(P&&P.bar){P.bar.position.copy(bar);P.bar.quaternion.identity();}return bar;}
function poseRDL(c,F,b,u,P){rdlPose(c,P,smooth(1-clamp(u,0,1)),{round:F.round,squat:F.squat,drift:F.drift});return u;}
// Bulgarian split squat: rear foot laces-down on the bench, front foot about a leg length ahead
function poseBulgarian(c,F,b,u,P){const k=smooth(1-clamp(u,0,1));const fz=F.close?-10.92:-10.58;
  const hz=lerp(fz-.42,fz-.46,k)+(F.close?.0:0),hy=lerp(.9*D.s,.5*D.s,k)+(F.close?.06*k:0);const yaw=(F.twist?22*k:0)*DEG;
  setRoot(c,qY(-yaw).multiply(qX(13*DEG)),V(.02,hy,hz));resetRest(c);spineBend(c,0,{neck:-.08,head:-.06});c.root.updateMatrixWorld(true);
  const heel=F.close?.035*k:0;const A=V(.11,D.ankY+heel,fz);legTo(c,'Left',A,V(F.kneeIn?-.22*k:0,.2,1));footTo(c,'Left',A.clone().add(V(0,-heel*1.2-.04,.15)));
  const R=V(-.11,BENCH_TOP+.07,-11.6);legTo(c,'Right',R,V(0,-1,.3));footTo(c,'Right',R.clone().add(V(0,-.03,-.16)));
  const T=torsoAxes(c);for(const s of[1,-1]){const ua=V(0,-1,0).addScaledVector(T.L,s*.14);const r=armDir(c,sideOf(s),ua,ua,T.L.clone().multiplyScalar(-s),{hd:V(0,-1,0)});if(P.db&&P.db[s>0?0:1]){const d=P.db[s>0?0:1];d.position.copy(r.contact);d.quaternion.setFromUnitVectors(V(1,0,0),T.F);}}
  c._front='Left';return u;}
// 45° leg press
function poseLegPress(c,F,b,u,P){const uu=clamp(u,0,1);const kTop=F.lockKnee?180:166,kBot=F.deep?62:90;const knee=lerp(kBot,kTop,smooth(uu))*DEG;const th=D.thigh,sh=D.shin;const dist=Math.sqrt(th*th+sh*sh-2*th*sh*Math.cos(knee))*(F.lockKnee?1.01:1);
  const tuck=F.deep?(1-smooth(uu))*1:0;const H=LP.hip.clone().add(V(0,.05*tuck,.04*tuck));const up=V(0,Math.SQRT1_2,-Math.SQRT1_2).applyAxisAngle(V(1,0,0),.3*tuck);
  setRoot(c,rootFromAxes(up,V(0,Math.SQRT1_2,Math.SQRT1_2).applyAxisAngle(V(1,0,0),.3*tuck)),H);resetRest(c);spineBend(c,.35*tuck,{neck:.35,head:.1});c.root.updateMatrixWorld(true);
  // the sole is flat on the plate: the heel touches it at C, the ankle sits .1 in front of the plate (toward the lifter) and a little up the plate
  const perp=V(0,Math.SQRT1_2,-Math.SQRT1_2);const heel=F.heels?.03*(1-uu):0;const U0=wpos(c.bones.LeftUpLeg);const rel=V().subVectors(LP.hip,U0).add(V(.16,0,0)).addScaledVector(perp,.04).addScaledVector(LP.dir,-.1);
  // distance along the rails that puts the ankle the right distance from the hip joint
  const bq=rel.dot(LP.dir),cq=rel.lengthSq()-dist*dist;const t=-bq+Math.sqrt(Math.max(0,bq*bq-cq));P.sledAt(t-.032);
  for(const s of[1,-1]){const sd=sideOf(s);const C=LP.hip.clone().addScaledVector(LP.dir,t).add(V(s*.16,0,0));const A=C.clone().addScaledVector(LP.dir,-.1+heel).addScaledVector(perp,.04);
    legTo(c,sd,A,V(s*(F.heels?-.4:.35),.6,.2));footTo(c,sd,C.clone().addScaledVector(perp,.2).addScaledVector(LP.dir,-.07));
}lpHandles(c); // fingers wrap across the handle, not along it
  c._lp={t,H,plateT:t};return u;}
// leg extension (seat reclined so the hip is ~130°)
function poseLegExt(c,F,b,u,P){const uu=clamp(u,0,1);const hi=F.half?.55:1;const phi=lerp(0,85,smooth(uu)*hi)*DEG;P.setKnee(phi);
  const lift=F.hips?.06*Math.sin(Math.PI*clamp(b.phase===2?b.k:0,0,1)):0;
  setRoot(c,qX(-(LX.recline+(F.hips?15*lift/.06:0))*DEG),LX.hip.clone().add(V(0,lift,0)));resetRest(c);spineBend(c,0,{neck:.45,head:.1});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);const K=LX.knee.clone().add(V(s*.12,0,0));const A=K.clone().add(V(0,-Math.cos(phi),Math.sin(phi)).multiplyScalar(D.shin));
    legTo(c,sd,A,V(0,1,.2));footTo(c,sd,A.clone().add(V(0,Math.sin(phi),Math.cos(phi)).multiplyScalar(.15)));
    armTo(c,sd,V(s*.27,LX.hip.y-.16,-12.15),{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.4,-.3,-1)});}
  c._phi=phi;return u;}
// lying leg curl (face down, head toward −z)
function poseLegCurl(c,F,b,u,P){const uu=clamp(u,0,1);const hi=F.half?.5:1;const psi=lerp(5,115,smooth(uu)*hi)*DEG;P.setKnee(psi);
  const lift=F.hips?.07*smooth(uu):0;const H=V(0,LC.padY+.13+lift,LC.kneeZ-D.thigh*.98-.05);/* hip joints a thigh's length from the knees at the pad's end */const dir=V(0,.22-(F.hips?.42*smooth(uu):0),-1).normalize();
  setRoot(c,rootFromAxes(dir,V(0,-1,-.2)),H);resetRest(c);spineBend(c,F.hips?-.25*smooth(uu):0,{neck:-.6,head:-.2});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const side=sideOf(s),w=-s;const K=V(w*.11,LC.padY+.06,LC.kneeZ);const A=K.clone().add(V(0,Math.sin(psi),Math.cos(psi)).multiplyScalar(D.shin));
    legTo(c,side,A,V(0,-1,0));footTo(c,side,A.clone().add(V(0,-.05,.15).applyAxisAngle(V(1,0,0),psi*.6)));
    armTo(c,side,V(w*.24,LC.padY+.07,-12.72),{hd:V(0,0,-1),pn:V(-w,0,0),pole:V(w*.6,.2,.6),curl:1});}
  c._psi=psi;return u;}
// barbell hip thrust: upper back on the bench edge, feet flat, hips rise until the torso is level
function poseHipThrust(c,F,b,u,P){const uu=clamp(u,0,1);const hi=F.half?.6:1;const k=smooth(uu)*hi;
  const S=V(0,HT.benchY+.17,HT.benchZ+.16);const L=D.sh.clone().sub(D.hips).length();const hipUp=D.hips.y-D.upLeg.y;const yTop=D.ankY+D.shin*.995+hipUp*.2;
  const zTop=S.z+Math.sqrt(Math.max(.01,L*L-Math.pow(S.y-yTop,2)));const az=zTop+hipUp+D.thigh+(F.far?.2:0);const hy=lerp(.16,yTop+(F.arch?.07:0),k);const hz=S.z+Math.sqrt(Math.max(.01,L*L-Math.pow(S.y-hy,2)));
  const H=V(0,hy,hz);const dir=V().subVectors(S,H).normalize();const front=V().crossVectors(dir,V(1,0,0)).negate();
  setRoot(c,rootFromAxes(dir,front.y<0?front.negate():front),H);resetRest(c);spineBend(c,F.arch?-.45*k:0,{neck:F.arch?-.4*k:.55,head:.15});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);const A=V(s*.17,D.ankY,az);legTo(c,sd,A,V(s*.2,1,.4));footTo(c,sd,A.clone().add(V(s*.03,-.07,.13)));}
  const T=torsoAxes(c);const bar=wpos(c.bones.Hips).addScaledVector(T.F,.17*D.s).addScaledVector(T.U,-.06);
  barHands(c,bar,.33*D.s,{hd:T.F.clone(),pn:T.U.clone().negate(),pole:V(.4,1,-.2)});if(P.bar){P.bar.position.copy(bar);P.bar.quaternion.identity();}c._hip=H;return u;}
// calf raises: the balls of the feet stay on the step edge; the heel moves; the body rides up and down
function calfFeet(c,stepY,edgeZ,ang,kneeBend=0){// ang: foot angle from horizontal (+ heel up)
  const out=[];for(const s of[1,-1]){const toe=V(s*.11,stepY+.025,edgeZ+.03);const A=toe.clone().add(V(0,Math.sin(ang),-Math.cos(ang)).multiplyScalar(D.footL)).add(V(0,D.ankY*.55,0));out.push({toe,A});}return out;}
function poseStandCalf(c,F,b,u,P){const uu=clamp(u,0,1);const bot=F.half?2:-25,top=25;let a=lerp(bot,top,smooth(uu));if(F.bounce&&b.phase===1)a=bot+6*Math.sin(Math.PI*b.k);
  const knee=F.knees?.13*Math.sin(Math.PI*(b.phase===2?b.k:0)):0;const ft=calfFeet(c,SC.stepY,SC.edgeZ,a*DEG);
  const A=ft[0].A;const hy=A.y+(D.hips.y-D.upLeg.y)+(D.thigh+D.shin)*.997-knee*.6;standPose(c,{z:A.z,drop:D.hips.y-hy,arms:'none',feet:[[.11,0],[-.11,0]],stance:.11});
  for(const [i,s] of [1,-1].entries()){const sd=sideOf(s);legTo(c,sd,ft[i].A,V(0,.2,1));footTo(c,sd,ft[i].toe.clone().add(V(0,0,.05)));}
  const T=torsoAxes(c);const pads=wpos(c.bones.LeftArm).y+.11;P.padsAt(pads);
  for(const s of[1,-1])armTo(c,sideOf(s),V(s*.3,pads-.1,-11.83),{hd:V(0,1,0),pn:V(0,0,-1),pole:V(s*.4,-1,-.3)});c._ank=a;return u;}
function poseSeatCalf(c,F,b,u,P){const uu=clamp(u,0,1);const bot=F.half?2:-22,top=25;let a=lerp(bot,top,smooth(uu));if(F.bounce&&b.phase===1)a=bot+6*Math.sin(Math.PI*b.k);
  setRoot(c,qX(4*DEG),V(0,SCS.seatY+.1*D.s,-12.08));resetRest(c);c.root.updateMatrixWorld(true);const ft=calfFeet(c,SCS.stepY,SCS.edgeZ,a*DEG);
  for(const [i,s] of [1,-1].entries()){const sd=sideOf(s);legTo(c,sd,ft[i].A,V(0,.4,1));footTo(c,sd,ft[i].toe.clone().add(V(0,0,.05)));}
  const kn=wpos(c.bones.LeftLeg);const padY=kn.y+.08;P.padAt(padY);const pz=F.knee?kn.z+.02:kn.z-.11;P.pad.position.z=pz-P.lever.position.z;
  for(const s of[1,-1])armTo(c,sideOf(s),V(s*.235,padY,pz),{hd:V(0,-.3,1),pn:V(-s,0,0),pole:V(s*.5,-.3,-1),curl:.8});/* hands hold the ends of the pad */c._ank=a;c._padK=pz-kn.z;return u;}

// ---- measurements
function fppa(c,side){const B=c.bones,h=wpos(B[side+'UpLeg']),k=wpos(B[side+'Leg']),a=wpos(B[side+'Foot']);const up=upOf(c),f=V(Math.sin(0),0,1);
  const t=V().subVectors(k,h),s=V().subVectors(a,k);t.z=0;s.z=0;return Math.acos(clamp(t.normalize().dot(s.normalize()),-1,1))/DEG;}
Object.assign(MEAS,{
  fppa:{at:'bottom',get:c=>avg2(s=>{const B=c.bones,h=wpos(B[s+'UpLeg']),k=wpos(B[s+'Leg']),a=wpos(B[s+'Foot']);const inward=(s==='Left'?-1:1);return Math.max(0,(k.x-(h.x+a.x)/2)*inward*100);}),fmt:v=>v<3?'knees track over the toes':'knees cave '+Math.round(v)+' cm inward'},
  torsoBottom:{at:'bottom',get:c=>torsoLean(c),fmt:v=>v<50?'torso '+Math.round(v)+'° at the bottom':'torso tips to '+Math.round(v)+'°'},
  depth:{at:'bottom',get:c=>(wpos(c.bones.Hips).y-.05-wpos(c.bones.LeftLeg).y)*100,fmt:v=>v<=0?'hip crease below the knee':'stops '+Math.round(v)+' cm above parallel'},
  rdlKnee:{at:'bottom',get:c=>avg2(s=>kneeAng(c,s)),fmt:v=>v>=148?'knees stay soft ('+Math.round(v)+'°)':'knees bend to '+Math.round(v)+'°: it became a squat'},
  barThigh:{pick:'max',get:(c,x)=>{const B=c.bones,H=wpos(B.LeftUpLeg),K=wpos(B.LeftLeg),A=wpos(B.LeftFoot);const y=x.P.bar.position.y;const p=y>K.y?H.clone().lerp(K,clamp((H.y-y)/(H.y-K.y),0,1)):K.clone().lerp(A,clamp((K.y-y)/(K.y-A.y),0,1));return (x.P.bar.position.z-p.z-(y>K.y?.085:.06))*100;},fmt:v=>v<3?'bar slides down the legs':'bar drifts '+Math.round(v)+' cm off the legs'},
  frontKnee:{at:'bottom',get:c=>{const B=c.bones,h=wpos(B.LeftUpLeg),k=wpos(B.LeftLeg),a=wpos(B.LeftFoot);return Math.max(0,((h.x+a.x)/2-k.x)*100);},fmt:v=>v<3?'front knee over the toes':'front knee caves '+Math.round(v)+' cm in'},
  heel:{at:'bottom',get:c=>Math.max(0,(wpos(c.bones.LeftFoot).y-D.ankY)*100),fmt:v=>v<1.5?'front heel stays down':'front heel lifts '+Math.round(v)+' cm'},
  pelvisYaw:{at:'bottom',get:c=>{const L=pelvisAxes(c).L;return Math.abs(Math.atan2(L.z,L.x)/DEG);},fmt:v=>v<10?'hips square to the front':'hips twist '+Math.round(v)+'°'},
  padGap:{at:'bottom',get:c=>(c._lp?Math.max(0,(c._lp.H.y-LP.hip.y)*100):0),fmt:v=>v<1.5?'lower back stays on the pad':'tailbone lifts '+Math.round(v)+' cm off the pad'},
  kneeTop:{at:'top',get:c=>avg2(s=>kneeAng(c,s)),fmt:v=>v<174?'knees stop just short of straight ('+Math.round(v)+'°)':'knees lock out ('+Math.round(v)+'°)'},
  heelLift:{at:'bottom',get:c=>{if(!c._lp)return 0;const a=wpos(c.bones.LeftFoot);const ank=V().subVectors(a,LP.hip).dot(LP.dir);return Math.max(0,(ank-(c._lp.plateT-.1))*100);},fmt:v=>v<1.5?'whole foot on the plate':'heels lift '+Math.round(v)+' cm'},
  hipLift:{pick:'max',get:c=>Math.max(0,(wpos(c.bones.Hips).y-LX.hip.y)*100),fmt:v=>v<1.5?'hips stay on the seat':'hips lift '+Math.round(v)+' cm off the seat'},
  extTop:{at:'top',get:c=>avg2(s=>kneeAng(c,s)),fmt:v=>v>=168?'legs straight at the top ('+Math.round(v)+'°)':'stops at '+Math.round(v)+'°'},
  lowerTime:{pick:'lower',get:()=>0,fmt:v=>v>=1.4?'lowers in '+v.toFixed(1)+' s':'drops in '+v.toFixed(1)+' s'},
  curlHip:{pick:'range',get:c=>{const B=c.bones;const t=V().subVectors(wpos(B.LeftLeg),wpos(B.LeftUpLeg)).normalize(),p=V().subVectors(wpos(B.Neck),wpos(B.Hips)).normalize();return Math.acos(clamp(t.dot(p),-1,1))/DEG;},fmt:v=>v<14?'hips glued to the pad':'hips lift; hip angle changes '+Math.round(v)+'°'},
  curlTop:{at:'top',get:c=>avg2(s=>kneeAng(c,s)),fmt:v=>v<=80?'heels come up to '+Math.round(v)+'° at the knee':'curl stops at '+Math.round(v)+'°'},
  hipTop:{at:'top',get:c=>{const B=c.bones;const H=wpos(B.LeftUpLeg).setX(0),K=wpos(B.LeftLeg).setX(0),S=wpos(B.LeftArm).setX(0);const a=Math.acos(clamp(V().subVectors(K,H).normalize().dot(V().subVectors(S,H).normalize()),-1,1))/DEG;
    const t=clamp((H.z-K.z)/(S.z-K.z),0,1),ly=lerp(K.y,S.y,t);return H.y>ly?360-a:a;},
    fmt:v=>v>=186?'back arches past straight ('+Math.round(v)+'°)':v>=172?'hips fully extended ('+Math.round(v)+'°)':'hips stop at '+Math.round(v)+'°'},
  shinTop:{at:'top',get:c=>{const k=wpos(c.bones.LeftLeg),a=wpos(c.bones.LeftFoot);return Math.abs(Math.atan2(k.z-a.z,k.y-a.y)/DEG);},fmt:v=>v<12?'shins vertical at the top':'shins lean '+Math.round(v)+'°'},
  ankleBottom:{at:'bottom',get:c=>-(c._ank||0),fmt:v=>v>=15?'heels drop '+Math.round(v)+'° below the step':'heels barely drop ('+Math.round(Math.max(0,v))+'°)'},
  bottomPause:{pick:'pause',get:()=>0,fmt:v=>v>=.4?'pauses '+v.toFixed(1)+' s at the bottom':'bounces off the bottom'},
  calfKnee:{pick:'min',get:c=>avg2(s=>kneeAng(c,s)),fmt:v=>v>=170?'legs stay straight':'knees bend to '+Math.round(v)+'°'},
  padKnee:{pick:'max',get:c=>(c._padK||0)*-100,fmt:v=>v>4?'pad on the thighs':'pad sits on the kneecaps'},
});
// timing measures read the form's own tempo (they describe the rep, not a pose)
MEAS.lowerTime.get=(c,x)=>x.F.lower;MEAS.lowerTime.pick=null;
MEAS.bottomPause.get=(c,x)=>x.F.bounce?.1:x.F.touch;MEAS.bottomPause.pick=null;

// ---- getting on and off
// feet that stay on the floor while a pose blends: a `props` hook that re-solves the legs after the blend, sliding each ankle
// from where it was at the start of the step to its target (canonical frame) instead of letting the leg bones slerp through the floor
function plantFeet(st,feet){let from=null;return (c,k)=>{const kk=ease(clamp(k,0,1));
  if(!from)from=feet.map((f,i)=>{const sd=i?'Right':'Left';const H=wpos(c.bones[sd+'UpLeg']),A=wpos(c.bones[sd+'Foot']);return {A,T:wpos(c.bones[sd+'ToeBase']),P:wpos(c.bones[sd+'Leg']).sub(H.lerp(A,.5)).normalize()};});
  feet.forEach((f,i)=>{const sd=i?'Right':'Left';const tA=toW(st,f.a),tT=toW(st,f.t||f.a.clone().add(V(0,-.06,.15)));let A,T;
    if(f.via){const vA=toW(st,f.via),q=1-kk;A=from[i].A.clone().multiplyScalar(q*q).addScaledVector(vA,2*q*kk).addScaledVector(tA,kk*kk);T=A.clone().add(from[i].T.clone().sub(from[i].A).lerp(tT.clone().sub(tA),kk));}
    else{A=from[i].A.clone().lerp(tA,kk);T=from[i].T.clone().lerp(tT,kk);}
    A.y=Math.max(A.y,D.ankY*.98);T.y=Math.max(T.y,.03);const pole=from[i].P.clone().lerp((f.pole||V(0,.3,1)).clone().applyQuaternion(st.q).normalize(),kk);legTo(c,sd,A,pole);footTo(c,sd,T);});};}
// the feet of a standing pose, for plantFeet: [{a,t,pole}] left then right
function standFeet(o={}){const h=o.h||0,qh=qY(h),x=o.x||0,z=o.z??-12,st=o.stance??.11*D.s;const out=[];
  for(const s of[1,-1]){const f=o.feet?V(o.feet[s>0?0:1][0],0,o.feet[s>0?0:1][1]):V(s*st,0,.02);const A=f.applyQuaternion(qh).add(V(x,D.ankY,z));const fwd=V(0,0,1).applyQuaternion(qh);
    out.push({a:A,t:A.clone().addScaledVector(fwd,.15).setY(D.ankY*.35),pole:fwd.clone().add(V(0,.25,0))});}return out;}
// walk into the rack, dip under the bar (or step under it for the front rack), stand it out of the J-hooks, step back
function rackHook(){return V(0,RACK.hookY,RACK.barZ);}
function rackStand(c,P,o){standPose(c,{z:o.z,drop:o.drop||0,arms:'none'});if(o.front)frontRackHands(c,P,o.lift||0);else{const bar=barOnBack(c);backBarHands(c,bar);P.bar.position.copy(bar);}}
function frontRackPoint(c){const T=torsoAxes(c);const [a,b]=shoulders(c);return a.add(b).multiplyScalar(.5).addScaledVector(T.F,.19*D.s).addScaledVector(T.U,.0);}
function frontRackHands(c,P,lift){const ct=frontRackPoint(c);frontRackGrip(c,ct);if(P){P.bar.position.copy(ct);P.bar.quaternion.identity();}}
// built on the body's own left/forward axes (not the room's), so it also holds while walking with the bar at any heading
function frontRackGrip(c,ct){const T=torsoAxes(c);const L=T.L.clone().setY(0).normalize(),F=T.F.clone().setY(0).normalize(),U=V(0,1,0);
  for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().addScaledVector(L,s*.27*D.s),{hd:U.clone().addScaledVector(F,-.4),pn:U.clone().multiplyScalar(.4).add(F),pole:L.clone().multiplyScalar(s*.25).addScaledVector(U,-1).addScaledVector(F,.9)});}
// hands on the racked bar from the front (facing it): fingers over the top, palms forward
function frontGrip(c,ct){for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().add(V(s*.4*D.s,0,0)),{hd:V(0,1,.35),pn:V(0,.25,1),pole:V(s*.3,-1,.3)});}
// where to stand so that the bar on the traps (or the front rack) is exactly in the J-hooks: solves z and the knee bend
function rackSet(c,front){let z=RACK.barZ,drop=.05;const pt=()=>front?frontRackPoint(c):barOnBack(c);
  for(let i=0;i<5;i++){standPose(c,{z,drop,arms:'none'});const p=pt();z-=p.z-RACK.barZ;drop+=p.y-RACK.hookY;}return {z,drop:Math.max(.03,drop)};}
const lazyPlant=(st,zf)=>{let pf=null;return (c,k)=>{(pf||(pf=plantFeet(st,standFeet({z:zf(c)}))))(c,k);};};
ENTRY.rack={pre:[0,-12.85],face:0,
  enter:(st,e)=>{const P=st.P,front=e.front;let S=null;const hook=rackHook();const set=c=>S||(S=rackSet(c,front));
    const duck={hinge:26,drop:.33,look:-45};
    return [
    {walk:[0,-11.72],d:1.2},
    // hands on the bar in the hooks, then grip it
    {d:.8,pose:c=>{const s=set(c);standPose(c,{z:s.z-(front?.27:.33),arms:'none'});if(front)frontRackGrip(c,hook);else frontGrip(c,hook);},props:lazyPlant(st,c=>set(c).z-(front?.27:.33))},
    {call:c=>{grab(c,P.bar,'Left',{other:'Right',align:'bar',palm:.075});}},
    ...(front?[
      // step under: the bar comes to rest on the front of the shoulders
      {d:.9,pose:c=>{const s=set(c);standPose(c,{z:s.z,drop:s.drop,arms:'none'});frontRackGrip(c,hook);},props:lazyPlant(st,c=>set(c).z)}]:[
      // dip, head under the bar; step forward under it; come up so the bar sits on the traps
      {d:.8,pose:c=>{const s=set(c);standPose(c,{z:s.z-.33,...duck,arms:'none'});backBarHands(c,hook);},props:lazyPlant(st,c=>set(c).z-.33)},
      {d:.7,pose:c=>{const s=set(c);standPose(c,{z:s.z,...duck,arms:'none'});backBarHands(c,hook);},props:lazyPlant(st,c=>set(c).z)},
      {d:.7,pose:c=>{const s=set(c);standPose(c,{z:s.z,drop:s.drop,arms:'none'});backBarHands(c,hook);},props:lazyPlant(st,c=>set(c).z)}]),
    // stand up: the bar lifts straight out of the hooks
    {d:.6,anim:(c,k)=>{const s=set(c);standPose(c,{z:s.z,drop:s.drop*(1-smooth(k)),arms:'none'});if(front)frontRackHands(c,null);else backBarHands(c,barOnBack(c));}},
    {call:c=>{c.carry=front?'frontBar':'backBar';}},
    {walk:[0,SQ_FOOT],back:true,d:1.4},{call:c=>{c.carry=null;}},
    {d:.6,pose:exP(front?0:1,front?1:3)},...(front?[{d:1.0,anim:exFrom(0,1)}]:[]),{call:c=>{c.hold=[];}}];},
  leave:(st,e)=>{const P=st.P,front=e.front;let S=null;const hook=rackHook();const set=c=>S||(S=rackSet(c,front));const duck={hinge:26,drop:.33,look:-45};
    return [
    {call:c=>{grab(c,P.bar,'Left',{other:'Right',align:'bar',palm:.075});}},
    {d:1.1,pose:exP(front?0:1,front?1:3)}, // lower the bar under control before walking it in
    {d:.5,pose:c=>{standPose(c,{z:SQ_FOOT,arms:'none'});if(front)frontRackHands(c,null);else backBarHands(c,barOnBack(c));}},
    {call:c=>{c.carry=front?'frontBar':'backBar';}},{walk:[0,-11.6],d:1.2},{call:c=>{c.carry=null;}},
    // settle it into the hooks
    {d:.8,pose:c=>{const s=set(c);standPose(c,{z:s.z,drop:s.drop,arms:'none'});if(front)frontRackGrip(c,hook);else backBarHands(c,hook);},props:lazyPlant(st,c=>set(c).z)},
    {call:c=>{c.hold=[];P.bar.position.copy(P.home);P.bar.quaternion.identity();}},
    ...(front?[
      {d:.8,pose:c=>{const s=set(c);standPose(c,{z:s.z-.27,drop:.06,arms:'none'});frontRackGrip(c,hook);},props:lazyPlant(st,c=>set(c).z-.27)}]:[
      {d:.7,pose:c=>{const s=set(c);standPose(c,{z:s.z,...duck,arms:'none'});backBarHands(c,hook);},props:lazyPlant(st,c=>set(c).z)},
      {d:.7,pose:c=>{const s=set(c);standPose(c,{z:s.z-.33,...duck,arms:'none'});backBarHands(c,hook);},props:lazyPlant(st,c=>set(c).z-.33)},
      {d:.7,pose:c=>{const s=set(c);standPose(c,{z:s.z-.33,arms:'none'});frontGrip(c,hook);},props:lazyPlant(st,c=>set(c).z-.33)}]),
    {d:.6,pose:c=>{const s=set(c);standPose(c,{z:s.z-(front?.27:.33)});}},
    {walk:[0,-12.85],back:true,d:1.7}];}};
// leg press: sit on the seat edge with the feet on the floor, lie back and put the feet on the plate
function legPressSit(c){setRoot(c,qX(-10*DEG),LP.hip.clone().add(V(0,.0,.05)));resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const A=V(s*.16,D.ankY+.06,-11.78);legTo(c,sideOf(s),A,V(s*.05,.5,1));footTo(c,sideOf(s),A.clone().add(V(0,-.06,.15)));}lpHandles(c);}
// hands on the side handles (they take hold as soon as they sit, so the arms never sweep through them later)
function lpHandles(c,st){const w=v=>st?v.applyQuaternion(st.q):v; // st: in the room (a props hook runs after the pose is framed)
  for(const s of[1,-1])armTo(c,sideOf(s),st?toW(st,V(s*.34,.72,-12.42)):V(s*.34,.72,-12.42),{hd:w(V(0,-Math.SQRT1_2,Math.SQRT1_2)),pn:w(V(-s,0,0)),pole:w(V(s*.7,.1,-.7))});}
const LP_FEET=[1,-1].map(s=>({a:V(s*.16,D.ankY+.06,-11.78),t:V(s*.16,.09,-11.63),pole:V(s*.05,.5,1)})); // feet well inside the sled rails
// coming from the side (or leaving to it) each foot steps up over the near sled rail
const LP_STEP=LP_FEET.map((f,i)=>({...f,via:V(i?.32:.42,.8,-11.9)}));
ENTRY.legPress={pre:[.92,-12.2],face:-Math.PI/2,
  enter:(st,e)=>[{walk:[.58,-12.25],d:.7},{turn:0},
    {d:1.3,pose:legPressSit,props:plantFeet(st,LP_STEP)},
    {d:1.1,pose:c=>{st.P.sledAt(.86);poseLegPress(c,{...FORMS.good},{phase:3,k:0},1,st.P);},props:c=>lpHandles(c,st)}, // hands stay locked on the handles
    {call:()=>sayFor('Push the sled up, flip the safeties out, then go.',2.8)},{d:.6,anim:(c,k)=>{st.P.safety.forEach((h,i)=>h.rotation.z=(i?1:-1)*.9*k);poseLegPress(c,FORMS.good,{phase:3,k:0},1,st.P);}}],
  leave:(st,e)=>[{d:.7,pose:exP(1,3)},{d:.6,anim:(c,k)=>{st.P.safety.forEach((h,i)=>h.rotation.z=(i?1:-1)*.9*(1-k));poseLegPress(c,FORMS.good,{phase:3,k:0},1,st.P);}},
    {d:1.6,pose:legPressSit,props:(pf=>(c,k)=>{pf(c,k);lpHandles(c,st);})(plantFeet(st,LP_FEET))},
    {d:1.3,pose:c=>standPose(c,{x:.58,z:-12.25,h:Math.PI/2}),props:plantFeet(st,standFeet({x:.58,z:-12.25,h:Math.PI/2}).map((f,i)=>({...f,via:LP_STEP[i].via})))},{walk:[.92,-12.2],d:.7}]};
// leg extension: sit holding the handles with the knees tucked up over the shin pad, then drop the shins behind it
function legExtTuck(c){setRoot(c,qX(-12*DEG),LX.hip.clone().add(V(0,0,.04)));resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);const A=V(s*.15,.58,-11.76);legTo(c,sd,A,V(0,1,.3));footTo(c,sd,A.clone().add(V(0,-.14,.04)));
    armTo(c,sd,V(s*.27,LX.hip.y-.16,-12.15),{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.4,-.3,-1)});}}
const LX_TUCK=[1,-1].map(s=>({a:V(s*.15,.58,-11.76),t:V(s*.15,.44,-11.72),via:V(s*.3,.78,-11.45),pole:V(0,1,.3)}));
// feet along keyframed paths (canonical ankle A and toe T per key, smoothed between keys), legs re-solved after the blend.
// keys(s) -> [[k,A,T],...] with k from 0 to 1; rev plays the path backwards (k 1 -> 0)
function feetPath(st,keys,pole,rev){const K=[1,-1].map(s=>keys(s));return (c,k)=>{const kk=rev?1-k:k;
  [1,-1].forEach((s,i)=>{const ks=K[i];let j=0;while(j<ks.length-2&&kk>ks[j+1][0])j++;const a=ks[j],b=ks[j+1];const t=smooth(clamp((kk-a[0])/(b[0]-a[0]),0,1));
    const A=toW(st,a[1].clone().lerp(b[1],t)),T=toW(st,a[2].clone().lerp(b[2],t));legTo(c,sideOf(s),A,(typeof pole==='function'?pole(kk):pole).clone().normalize().applyQuaternion(st.q));footTo(c,sideOf(s),T);});c.root.updateMatrixWorld(true);};}
// heels resting on top of the pad -> lifted back over it, toes pointed down -> straight down behind it -> toes come forward under it
const LX_KEYS=s=>{const x=s*.13,y0=.66-D.shin;return [[0,V(s*.15,.58,-11.76),V(s*.15,.44,-11.72)],[.3,V(x,.6,-11.885),V(x,.46,-11.87)],
  [.75,V(x,y0+.03,-11.885),V(x,y0-.11,-11.86)],[1,V(s*.12,y0,-11.86),V(s*.12,y0,-11.71)]];};
// sit down sideways on the seat (feet still on the floor beside the machine), then swing the legs round in front of the seat into the tuck
const LX_SIDE={h:Math.PI/2,x:.04,y:LX.hip.y,z:-12.14,feet:[[.53,-12.27],[.53,-12.01]],lean:4}; // hands rest on the thighs
function legExtSide(c){sitAt(c,LX_SIDE);}
const LX_SWING=s=>{const f=LX_SIDE.feet[s>0?0:1];return [[0,V(f[0],D.ankY,f[1]),V(f[0]+.15,.03,f[1])],[.45,V(s>0?.44:.32,.53,-11.6),V(s>0?.5:.38,.45,-11.5)],[1,V(s*.15,.58,-11.76),V(s*.15,.44,-11.72)]];};
const LX_STAND=standFeet({x:.72,z:-12.14,h:Math.PI/2});
const LX_SEAT=LX_SIDE.feet.map(f=>({a:V(f[0],D.ankY,f[1]),t:V(f[0]+.15,D.ankY*.35,f[1]),pole:V(1,.25,0)}));
const LX_SWPOLE=k=>V(1,.25,0).lerp(V(0,1,.3),smooth(clamp(k/.5,0,1)));
ENTRY.legExt={pre:[1.0,-12.14],face:Math.PI/2, // turn round before reaching the machine, then back up to the seat
  enter:(st,e)=>[{walk:[.72,-12.14],back:true,d:.9},{d:1.2,pose:legExtSide,props:plantFeet(st,LX_SEAT)},{d:1.4,pose:legExtTuck,props:feetPath(st,LX_SWING,LX_SWPOLE)},
    {d:1.4,pose:exP(0,1),props:feetPath(st,LX_KEYS,V(0,1,.2))},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.8,pose:exP(0,1),props:extFollow(st.P)},{d:1.4,pose:legExtTuck,props:feetPath(st,LX_KEYS,V(0,1,.2),true)},{d:1.4,pose:legExtSide,props:feetPath(st,LX_SWING,LX_SWPOLE,true)},
    {d:1.2,pose:c=>standPose(c,{x:.72,z:-12.14,h:Math.PI/2}),props:plantFeet(st,LX_STAND)},{walk:[1.0,-12.14],d:.6}]};
// the lever pads follow the real shins while a pose blends (the pose only sets them for its end state)
function extFollow(P){return (c,k)=>{const A=toC(ST,wpos(c.bones.LeftFoot)),K=LX.knee;P.setKnee(Math.atan2(A.z-K.z,-(A.y-K.y)));};}
function curlFollow(P){return (c,k)=>{const A=toC(ST,wpos(c.bones.LeftFoot));const K=V(0,LC.padY+.06,LC.kneeZ);P.setKnee(Math.atan2(A.y-K.y,A.z-K.z));};}
// lying leg curl: from the side, hands on the pad, near knee up onto the pad, then the other, then lie down
// the lifter faces -z here, so the left leg is the one toward -x (the far side from where they stand)
// one knee up: the inner (left) knee onto the end of the pad, shin along it, the outer (right) foot still on the floor
const LC_TOP=LC.padY+.11; // knee and ankle joints resting on the pad (pad top + the leg's half thickness)
function legCurlKneeUp(c){setRoot(c,rootFromAxes(V(0,.6,-.8),V(0,-.8,-.6)),V(.24,.94,-11.1));resetRest(c);c.root.updateMatrixWorld(true);
  curlLeg(c,'Left',V(-.03,LC_TOP,-11.52),V(-.03,LC_TOP,-11.1));
  legTo(c,'Right',V(.5,D.ankY,-11.28),V(.25,.3,-1));footTo(c,'Right',V(.5,.03,-11.43));
  for(const s of[1,-1]){const side=sideOf(s),w=-s;armTo(c,side,V(w*.15,LC.padY+.06,-11.85),{hd:V(0,0,-1),pn:V(0,-1,0),pole:V(w*.5,.3,.6),curl:0});}}
// a kneeling leg: knee at K, shin lying back along the pad to the ankle at A, laces down
function curlLeg(c,sd,K,A){const H=wpos(c.bones[sd+'UpLeg']);legTo(c,sd,A,K.clone().sub(H.clone().lerp(A,.5)));footTo(c,sd,A.clone().add(V(0,-.05,.13)));}
// both knees on the pad, hands on the pad ahead
function legCurlKneel(c){setRoot(c,rootFromAxes(V(0,.75,-.66),V(0,-.66,-.75)),V(0,1.12,-11.42));resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const side=sideOf(s),w=-s;curlLeg(c,side,V(w*.11,LC_TOP,-11.6),V(w*.11,LC_TOP,-11.18));armTo(c,side,V(w*.18,LC.padY+.06,-12.05),{hd:V(0,0,-1),pn:V(0,-1,0),pole:V(w*.5,.3,.6),curl:0});}}
// legs while a curl entry blends: the knees slide along the pad top between the two poses' knees (never into it), the shins and feet
// turn smoothly from one pose's direction to the other's
function curlKnees(st){let ends=null;const grab_=c=>['Left','Right'].map(sd=>{const K=toC(st,wpos(c.bones[sd+'Leg'])),A=toC(st,wpos(c.bones[sd+'Foot'])),T=toC(st,wpos(c.bones[sd+'ToeBase']));return {K,s:A.clone().sub(K).normalize(),t:T.clone().sub(A).normalize()};});
  return (c,k)=>{const kk=ease(clamp(k,0,1));
  if(!ends){const a0=grab_(c);const snap=snapshot(c);const a=c.act_,S=a.steps[a.i];S.pose(c,1);frame(c,st);const a1=grab_(c);applySnap(c,snap);ends=[a0,a1];}
  // the knees slide along the pad; where the blended hips are too low for a thigh to reach the knee's spot, the body rides up (rocks back) instead
  const K=ends[0].map((e,i)=>e.K.clone().lerp(ends[1][i].K,kk));let lift=0;
  ['Left','Right'].forEach((sd,i)=>{const H=toC(st,wpos(c.bones[sd+'UpLeg']));const h2=D.thigh*D.thigh-Math.pow(K[i].z-H.z,2)-Math.pow(K[i].x-H.x,2);if(h2>0)lift=Math.max(lift,K[i].y+Math.sqrt(h2)-H.y);});
  if(lift>0){c.root.position.y+=lift;c.root.updateMatrixWorld(true);holdUpdate(c);}
  ['Left','Right'].forEach((sd,i)=>{const e0=ends[0][i],e1=ends[1][i];const H=toC(st,wpos(c.bones[sd+'UpLeg']));const d=K[i].clone().sub(H).normalize();
    const sh=e0.s.clone().lerp(e1.s,kk).normalize(),to=e0.t.clone().lerp(e1.t,kk).normalize();const q=st.q;
    legDir(c,sd,d.applyQuaternion(q),sh.applyQuaternion(q),to.applyQuaternion(q));});
  c.root.updateMatrixWorld(true);};}
// the inner foot lifts up and over the side of the pad onto it; the outer foot stays put
const LC_UP=[{a:V(-.03,LC_TOP,-11.1),t:V(-.03,LC_TOP-.05,-10.97),via:V(.46,1.05,-11.4),pole:V(0,-.2,-1)},{a:V(.5,D.ankY,-11.28),t:V(.5,.03,-11.43),pole:V(.25,.3,-1)}];
// then the outer foot comes up the same way (and goes down that way when getting off)
const LC_KN=[1,-1].map(s=>{const w=-s;return {a:V(w*.11,LC_TOP,-11.18),t:V(w*.11,LC_TOP-.05,-11.05),pole:V(0,-.4,-1),via:s<0?V(.6,1.05,-11.4):undefined};});
const LC_DOWN=[{...LC_UP[0],via:undefined},{...LC_UP[1],via:LC_KN[1].via}];
ENTRY.legCurl={pre:[.9,-11.3],face:-Math.PI/2,
  enter:(st,e)=>[{walk:[.56,-11.3],d:.7},{turn:Math.PI},
    {d:1.2,pose:legCurlKneeUp,props:plantFeet(st,LC_UP)},{d:1.2,pose:legCurlKneel,props:plantFeet(st,LC_KN)},{d:1.2,pose:exP(0,1),props:curlKnees(st)},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.7,pose:exP(0,1),props:curlFollow(st.P)},{d:1.2,pose:legCurlKneel,props:curlKnees(st)},{d:1.2,pose:legCurlKneeUp,props:plantFeet(st,LC_DOWN)},
    {d:1.2,pose:c=>standPose(c,{x:.56,z:-11.3,h:Math.PI/2}),props:plantFeet(st,standFeet({x:.56,z:-11.3,h:Math.PI/2}).map((f,i)=>i?f:{...f,via:LC_UP[0].via}))},{walk:[.9,-11.3],d:.6}]};
// standing calf raise: step up onto the block (balls of the feet on the edge), dip under the shoulder pads, stand up with them
function calfStand(c,P,drop){const ft=calfFeet(c,SC.stepY,SC.edgeZ,0);const A=ft[0].A;const hy=A.y+(D.hips.y-D.upLeg.y)+(D.thigh+D.shin)*.997-drop;
  standPose(c,{z:A.z,drop:D.hips.y-hy,arms:'none',feet:[[.11,0],[-.11,0]],stance:.11});
  for(const [i,s] of [1,-1].entries()){const sd=sideOf(s);legTo(c,sd,ft[i].A,V(0,.2,1));footTo(c,sd,ft[i].toe.clone().add(V(0,0,.05)));}
  const pads=Math.max(SC_REST,wpos(c.bones.LeftArm).y+.11);P.padsAt(pads);for(const s of[1,-1])armTo(c,sideOf(s),V(s*.3,pads-.1,-11.83),{hd:V(0,1,0),pn:V(0,0,-1),pole:V(s*.4,-1,-.3)});}
const SC_REST=1.56;const padsFollow=P=>(c,k)=>P.padsAt(Math.max(SC_REST,wpos(c.bones.LeftArm).y+.11));
const SC_FEET=()=>calfFeet(null,SC.stepY,SC.edgeZ,0).map(f=>({a:f.A,t:f.toe.clone().add(V(0,0,.05)),pole:V(0,.2,1)}));
ENTRY.standCalf={pre:[0,-12.75],face:0,
  enter:(st,e)=>[{walk:[0,-12.2],d:1.0},{d:1.0,pose:c=>calfStand(c,st.P,.14),props:(c,k)=>{plantFeet(st,SC_FEET())(c,k);padsFollow(st.P)(c,k);}},{d:.9,pose:exP(.5,3)},{d:.6,anim:exFrom(.5,1)}],
  leave:(st,e)=>[{d:.7,pose:exP(.5,3)},{d:.8,pose:c=>calfStand(c,st.P,.14),props:padsFollow(st.P)},{d:.9,pose:c=>standPose(c,{z:-12.2}),props:plantFeet(st,standFeet({z:-12.2}))},{walk:[0,-12.75],back:true,d:1.1}]};
// seated calf raise: sit with the balls of the feet on the step under the raised knee pad, pull the pad down onto the thighs
function seatCalfSit(c,P,padY,free){setRoot(c,qX(4*DEG),V(0,SCS.seatY+.1*D.s,-12.08));resetRest(c);c.root.updateMatrixWorld(true);const ft=calfFeet(c,SCS.stepY,SCS.edgeZ,0);
  for(const [i,s] of [1,-1].entries()){const sd=sideOf(s);legTo(c,sd,ft[i].A,V(0,.4,1));footTo(c,sd,ft[i].toe.clone().add(V(0,0,.05)));}
  const kn=wpos(c.bones.LeftLeg);const y=padY??kn.y+.08;P.padAt(y);const pz=kn.z-.11;P.pad.position.z=pz-P.lever.position.z;P.lever.updateMatrixWorld(true);
  const pw=V();P.pad.getWorldPosition(pw);ST.g.worldToLocal(pw);
  for(const s of[1,-1]){if(free===true){const K=wpos(c.bones[sideOf(s)+'Leg']),H=wpos(c.bones[sideOf(s)+'UpLeg']);armTo(c,sideOf(s),H.lerp(K,.6).add(V(s*.07,.05,0)),{hd:V(0,-.4,1),pn:V(-s,-.5,0),pole:V(s*.6,-.3,-.6),curl:.5});}
    else armTo(c,sideOf(s),pw.clone().add(V(s*.235,free==='above'?.08:0,0)),{hd:V(0,-.3,1),pn:V(-s,0,0),pole:V(s*.5,-.3,-1),curl:free==='above'?.3:.8});}return kn.y+.08;}
const SCS_FEET=()=>calfFeet(null,SCS.stepY,SCS.edgeZ,0).map(f=>({a:f.A,t:f.toe.clone().add(V(0,0,.05)),pole:V(0,.4,1)}));
const SCS_UP=1.0;
ENTRY.seatCalf={pre:[.8,-12.1],face:-Math.PI/2,
  enter:(st,e)=>[{walk:[.42,-12.1],d:.7},{turn:0},{d:.45,pose:c=>standPose(c,{x:.42,z:-12.1,h:0}),props:plantFeet(st,standFeet({x:.42,z:-12.1,h:0}))}, // arms settle at the sides before sitting (from a mid-swing arm the hand cut through the frame post)
    {d:.8,pose:c=>seatCalfSit(c,st.P,SCS_UP,'above'),props:plantFeet(st,SCS_FEET())},{d:.4,pose:c=>seatCalfSit(c,st.P,SCS_UP)}, // hands come onto the handles from above
    {d:.9,anim:(c,k)=>{const y=seatCalfSit(c,st.P,SCS_UP);seatCalfSit(c,st.P,lerp(SCS_UP,y,smooth(k)));}},{d:.8,pose:exP(.5,3)},{d:.6,anim:exFrom(.5,1)}],
  leave:(st,e)=>[{d:.8,pose:exP(.5,3)},{d:.9,anim:(c,k)=>{const y=seatCalfSit(c,st.P,SCS_UP);seatCalfSit(c,st.P,lerp(y,SCS_UP,smooth(k)));}},
    {d:.6,pose:c=>seatCalfSit(c,st.P,SCS_UP,true)},{d:.9,pose:c=>standPose(c,{x:.42,z:-12.1,h:Math.PI/2}),props:plantFeet(st,standFeet({x:.42,z:-12.1,h:Math.PI/2}))},{walk:[.8,-12.1],d:.6}]};
// hip thrust: squat down to sit on the floor in front of the bench, legs out straight, roll the bar up the legs to the hips, then lean back on the bench edge
const HT_HIP=V(0,.13,-12.08);const HT_S=V(0,HT.benchY+.11,HT.benchZ+.2);
function htSitTuck(c){const S=HT_S;setRoot(c,rootFromAxes(V().subVectors(S,HT_HIP).normalize(),V(0,1,.3)),HT_HIP);resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);const A=V(s*.17,D.ankY,-11.5);legTo(c,sd,A,V(s*.15,1,.25));footTo(c,sd,A.clone().add(V(0,-.05,.15)));}
  for(const s of[1,-1])armTo(c,sideOf(s),V(s*.3,.01,-12.0),{hd:V(0,0,1),pn:V(0,-1,0),pole:V(s*.5,-.2,-1),curl:0});}
// legs straight; leanK 0 = leaning forward to the bar on the floor, 1 = back on the bench; barK rolls the bar from its home to the hips
function floorSitHT(c,P,barK,leanK=1,grip=1){const S=HT_S;const dirB=V().subVectors(S,HT_HIP).normalize(),dirF=V(0,.62,.78).normalize();
  setRoot(c,rootFromAxes(dirF.clone().lerp(dirB,leanK).normalize(),V(0,-.3,1).lerp(V(0,1,.3),leanK)),HT_HIP);resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);const A=V(s*.17,D.ankY,HT_HIP.z+(D.thigh+D.shin)*.985);legTo(c,sd,A,V(s*.1,1,.1));footTo(c,sd,A.clone().add(V(0,.02,.15)));}
  const T=torsoAxes(c);const hipBar=wpos(c.bones.Hips).addScaledVector(T.F,.17).add(V(0,.03,0));const b=P.home.clone().lerp(hipBar,barK);
  barHands(c,b,.33*D.s,{hd:V(0,0,1),pn:V(0,-1,0),pole:V(.4,1,-.4),curl:grip});P.bar.position.copy(b);}
const HT_TUCK=[1,-1].map(s=>({a:V(s*.17,D.ankY,-11.5),t:V(s*.17,.04,-11.35),pole:V(s*.15,1,.25)}));
ENTRY.hipThrust={pre:[.9,-11.8],face:-Math.PI/2,
  enter:(st,e)=>[{walk:[.4,-11.8],d:.8},{turn:0}, // turn clear of the bench, then shuffle back to it
    {d:1.0,pose:c=>{standPose(c,{z:-11.95,drop:.38,hinge:30,arms:'none'});armsHang(c);},props:plantFeet(st,standFeet({z:-11.95}))},
    {d:1.2,pose:htSitTuck,props:plantFeet(st,HT_TUCK)},
    {d:1.0,pose:c=>floorSitHT(c,st.P,0,0,.15)},{d:.35,anim:(c,k)=>floorSitHT(c,st.P,0,0,lerp(.15,1,smooth(k)))},{call:c=>grab(c,st.P.bar,'Left',{other:'Right',align:'bar'})},
    {d:1.4,anim:(c,k)=>floorSitHT(c,st.P,smooth(k),smooth(k))},{d:.9,pose:exP(0,1)},{d:1.0,anim:exFrom(0,1)},{call:c=>{c.hold=[];}}],
  // the bar stays in the hands (it follows them through every blend) until it is back on the floor and the hands open
  leave:(st,e)=>[{call:c=>grab(c,st.P.bar,'Left',{other:'Right',align:'bar'})},{d:.8,pose:exP(0,1)},{d:.9,pose:c=>floorSitHT(c,st.P,1,1)},{d:1.3,anim:(c,k)=>floorSitHT(c,st.P,1-smooth(k),1-smooth(k))},
    {call:c=>{c.hold=[];st.P.bar.position.copy(st.P.home);st.P.bar.quaternion.identity();}},{d:.35,anim:(c,k)=>floorSitHT(c,st.P,0,0,lerp(1,.15,smooth(k)))},
    {d:1.0,pose:htSitTuck,props:plantFeet(st,HT_TUCK)},
    {d:1.2,pose:c=>{standPose(c,{z:-11.95,drop:.38,hinge:30,arms:'none'});armsHang(c);},props:plantFeet(st,standFeet({z:-11.95}))},{d:.8,pose:c=>standPose(c,{z:-11.95}),props:plantFeet(st,standFeet({z:-11.95}))},{turn:Math.PI/2},{walk:[.9,-11.8],d:.7}]};
// Bulgarian split squat at the flat dumbbell bench: back to the bench, rear foot lifted behind then set on the bench
function bulgKneeBack(c){standDB(c,{z:-10.62});const A=V(-.11,.6,-10.95);legTo(c,'Right',A,V(0,-1,.4));footTo(c,'Right',A.clone().add(V(0,-.13,.04)));}
ENTRY.bulgarian={pre:[0,-10.0],face:0, // arrive already turned round (the walk's own turn), then step back to the bench
 
  enter:(st,e)=>[{turn:0},{walk:[0,-10.62],back:true,d:.9},{call:c=>{c.carry=null;}},{d:1.0,pose:c=>{standDB(c,{z:-10.62});}},{d:.8,pose:bulgKneeBack},{d:.9,pose:exP(1,3)}],
  leave:(st,e)=>[{d:.8,pose:exP(1,3)},{d:.8,pose:bulgKneeBack},{d:.8,pose:c=>standDB(c,{z:-10.62})},{call:c=>{c.carry='db';}},{walk:[0,-10.0],d:.9}]};
// Romanian deadlift from the platform: feet under the bar, hinge down with open hands, close the grip, deadlift it up, then into the RDL.
// On the way out the bar is lowered to the floor the same way and let go before standing up, so it never leaves the hands mid-air.
function rdlFloor(c,P,p,grip=1){deadliftPose(c,P,p);if(grip<1){curlHand(c,'Left',grip);curlHand(c,'Right',grip);}}
const RDL_HOLD=c=>grab(c,ST.P.bar,'Left',{other:'Right',align:'bar'});
ENTRY.rdlBar={pre:[0,-12.75],face:0,
  enter:(st,e)=>{const P=st.P;return [{walk:[0,-11.92],d:1.2},
    {d:1.3,anim:settle(c=>rdlFloor(c,P,0,.1))},
    {d:.45,anim:(c,k)=>rdlFloor(c,P,0,lerp(.1,1,smooth(k)))},{call:()=>e.coachIn&&sayFor(e.coachIn,2.6)},
    {d:1.6,anim:(c,k)=>rdlFloor(c,P,smooth(k))},
    {call:RDL_HOLD},{d:.8,pose:exP(1,3)},{call:c=>{c.hold=[];}}];},
  leave:(st,e)=>{const P=st.P;return [{call:RDL_HOLD},{d:.8,pose:c=>rdlFloor(c,P,1)},{call:c=>{c.hold=[];}},
    {d:1.6,anim:(c,k)=>rdlFloor(c,P,1-smooth(k))},
    {d:.4,anim:(c,k)=>rdlFloor(c,P,0,lerp(1,.1,smooth(k)))},
    {call:()=>{P.bar.position.copy(P.home);P.bar.quaternion.identity();}},
    {d:1.2,anim:settle(c=>standPose(c,{z:-11.92}))},{walk:[0,-12.75],back:true,d:1.4}];}};
// ---- the exercises
const LEG_CUES={};
defEx('squat',{group:'legs',name:'Back squat',eq:'Barbell',part:'Quads & glutes',station:'squatRack',entry:'rack',kind:'squat',pose:poseSquat,
  quip:'Sit down. Stand up. Repeat until philosophical.',
  mus:{quadV:[1,'m'],glute:[1,'m'],quadRF:[.35,'h'],adduct:[.7,'h'],hams:[.3,'h'],erect:[.55,'h'],gastroc:[.25,'h']},
  labels:[['Quads','quadV','m'],['Glutes','glute','m'],['Adductors','adduct','h']],center:V(0,.95,-11.95),cam:'frontQ',coachSpot:{p:[-1.4,-12.6],h:Math.PI/2-.4},
  steps:steps4([['Sit down between the heels','2 sec, brace'],['Hip crease below the knee','depth'],['Drive up','breathe out'],['Stand tall','reset the breath']]),
  stepText:['Big breath, brace, and sit down between your heels. Knees travel forward and out over the toes; that’s normal.','Hip crease below the top of the knee. Torso about 40° forward, bar over the middle of the foot.','Drive up, chest and hips rising together. Breathe out past the hardest part.','Stand tall with straight legs. Breathe and brace for the next rep.'],
  cues:[['Sit between your heels.'],['Below the knee.'],['Drive up, knees out.'],['Stand tall.']],
  beginner:'3 sets of 6–10, starting with the empty 20 kg bar. Set the safety arms at the height of the bar at the bottom.',
  forms:mk({lower:2.0,touch:.25,press:1.1,lock:.8,prof:'smooth'},{
    kneeIn:MS('Knees cave in','Knees drift inward on the way up','Both knees drift about 10 cm inward at the bottom.','The adductors take over and the glutes aren’t driving.','Repeated caving under load is linked with knee pain.','Push the knees out over the toes.',{kneeIn:1,meas:'fppa',warn:'Knees cave',warnAt:'knee',cam:'front',strain:['adduct']}),
    goodMorning:MS('Good-morning squat','Hips shoot up, chest drops','The hips rise first and the torso tips forward past 60°.','The load moves from the quads to the lower back.','The lower back limits your squat; the quads get less work.','Chest up; knees and hips rise together.',{goodMorning:1,meas:'torsoBottom',warn:'Chest drops',warnAt:'lowback',cam:'sideHigh',strain:['erect']}),
    half:MS('Half squat','Stops well above parallel','The squat stops with the thighs well above parallel.','The glutes and adductors miss their hardest range.','Half squats grew the glutes about a third as much in one study.','Sit lower: hips below the knees.',{half:1,meas:'depth',warn:'Too shallow',warnAt:'hips',cam:'sideHigh'})})});
defEx('rdl',{group:'legs',name:'Romanian deadlift',eq:'Barbell',part:'Hamstrings',station:'platform',entry:'rdlBar',kind:'hinge',pose:poseRDL,
  quip:'A bow so deep your hamstrings applaud.',coachIn:'Lift it once from the floor, then hinge.',
  mus:{hams:[1,'m'],glute:[.85,'m'],erect:[.6,'h'],adduct:[.4,'h'],forearm:[.4,'h'],lats:[.25,'h']},
  labels:[['Hamstrings','hams','m'],['Glutes','glute','m'],['Lower back','erect','h']],center:V(0,.85,-11.95),cam:'sideFlat',coachSpot:{p:[-1.5,-11.4],h:Math.PI/2},
  steps:steps4([['Hips back, knees soft','3 sec'],['Bar just below the knees','hamstrings tight'],['Hips forward','stand up'],['Stand tall','bar on the thighs']]),
  stepText:['Push the hips back. The bar slides down the thighs; the knees stay softly bent the whole time.','Stop when the bar is just below the knees or the back wants to round. The hamstrings are stretched.','Drive the hips forward to stand up, bar sliding up the legs.','Stand tall, bar against the thighs. Breathe, then go again.'],
  cues:[['Hips back.'],['Feel the hamstrings.'],['Hips forward.'],['Stand tall.']],
  beginner:'3 sets of 8–10 with the empty bar. Stop lowering when the back wants to round; never bounce.',
  forms:mk({lower:3.0,touch:.3,press:1.1,lock:.6,prof:'smooth'},{
    round:MS('Rounded back','Back rounds at the bottom','The lower back rounds by about 30° at the bottom and the shoulders slump.','The spine, not the hamstrings, takes the stretch.','The classic deadlift-family back strain.','Chest proud, hinge at the hips.',{round:1,meas:'lumbar',warn:'Back rounds',warnAt:'lowback',cam:'sideFlat',strain:['erect']}),
    squat:MS('Squatting it','Knees bend a lot, hips drop','The knees bend to about 95° and the hips drop, like a squat.','It turns into a quad lift.','The hamstrings never get the stretch that grows them.','Knees stay soft, not bent.',{squat:1,meas:'rdlKnee',warn:'Knees bend',warnAt:'knee',cam:'sideFlat',mul:{quadV:1.5,hams:.6}}),
    drift:MS('Bar drifts forward','Bar floats away from the legs','The bar floats 8–10 cm in front of the thighs on the way down.','The lower back works at a long lever.','The back tires before the hamstrings do.','Drag the bar down your legs.',{drift:1,meas:'barThigh',warn:'Bar away from legs',warnAt:'lowback',cam:'sideFlat'})})});
defEx('bulgarian',{group:'legs',name:'Bulgarian split squat',eq:'Dumbbell',part:'Quads & glutes',station:'dbFlat',entry:'bulgarian',kind:'squat',pose:poseBulgarian,needs:'db',dbSize:'light',
  quip:'The exercise everyone loves to hate.',
  mus:{quadV:[1,'m'],glute:[1,'m'],gluteMed:[.7,'h'],hams:[.4,'h'],adduct:[.4,'h'],oblq:[.25,'h']},
  labels:[['Quads','quadV','m'],['Glutes','glute','m'],['Side glute (balance)','gluteMed','h']],center:V(0,.85,-11.0),cam:'sideFlat',coachSpot:{p:[-1.4,-10.6],h:Math.PI/2},
  steps:steps4([['Lower straight down','2 sec, torso forward'],['Rear knee near the floor','front thigh level'],['Push through the front foot','breathe out'],['Stand up','hips square']]),
  stepText:['Lower straight down with the torso leaning a little forward, about 13°.','Rear knee a hand’s width above the floor, front thigh about level.','Push through the whole front foot to stand up.','Back to the top, hips square to the front. We show the left leg; then switch.'],
  cues:[['Straight down.'],['Knee near the floor.'],['Push through the front foot.'],['Hips square.']],
  beginner:'3 sets of 8–10 per leg, bodyweight first. Add dumbbells once 10 clean reps feel steady.',
  forms:mk({lower:2.0,touch:.2,press:1.0,lock:.6,prof:'smooth'},{
    kneeIn:MS('Front knee caves','Front knee drops inward','The front knee drops 6–8 cm inside the foot at the bottom.','The side glute gives up and balance goes.','Knee pain as the sets add up.','Knee over the second toe.',{kneeIn:1,meas:'frontKnee',warn:'Knee caves',warnAt:'knee',cam:'front'}),
    close:MS('Foot too close','Front foot too near the bench','The front foot is too close to the bench, so the knee shoots forward and the heel lifts.','All knee, no hip, and wobbly.','The glutes miss out.','Step further out, heel down.',{close:1,meas:'heel',warn:'Heel lifts',warnAt:'knee',cam:'sideFlat'}),
    twist:MS('Hips twist','Hips rotate open toward the back leg','The pelvis rotates about 20° toward the back leg at the bottom.','The side glute stops stabilising.','Uneven load from side to side.','Hips square, face forward.',{twist:1,meas:'pelvisYaw',warn:'Hips twist',warnAt:'hips',cam:'front'})})});
defEx('legPress',{group:'legs',name:'Leg press',eq:'Machine',part:'Quads & glutes',station:'legPress',entry:'legPress',kind:'squat',pose:poseLegPress,
  quip:'A squat, lying down. Still not a nap.',
  mus:{quadV:[1,'m'],glute:[.8,'m'],quadRF:[.5,'h'],adduct:[.5,'h'],hams:[.2,'h'],gastroc:[.2,'h']},
  labels:[['Quads','quadV','m'],['Glutes','glute','m']],center:V(0,.8,-11.95),cam:'sideFlat',coachSpot:{p:[-1.3,-11.7],h:Math.PI/2},
  steps:steps4([['Lower the sled','2 sec'],['Knees at 90°','back on the pad'],['Press up','breathe out'],['Knees soft at the top','don’t lock']]),
  stepText:['Lower the sled slowly, knees tracking over the toes.','Stop with the knees at about 90°, lower back flat on the pad.','Press through the whole foot, breathing out.','Stop just short of straight knees, then lower again.'],
  cues:[['Lower slowly.'],['Back on the pad.'],['Press through the whole foot.'],['Don’t lock the knees.']],
  beginner:'3 sets of 10–12. Learn the safety handles first; never unlock them with the knees locked.',
  forms:mk({lower:2.0,touch:.2,press:1.0,lock:.6,prof:'smooth'},{
    deep:MS('Tailbone lifts','Going so deep the hips roll up','The sled goes so deep that the pelvis rolls and the lower back lifts off the pad.','The lower spine bends under the sled’s load.','The usual cause of leg-press back strain.','Stop where your hips stay down.',{deep:1,meas:'padGap',warn:'Hips roll off the pad',warnAt:'lowback',cam:'sideFlat',strain:['erect']}),
    lock:MS('Locked knees','Knees snap straight at the top','The knees snap to fully straight at the top with the sled on them.','Tension drops off the quads and the joint holds the weight.','Hyperextension stress on the knee.','Stop just short of straight.',{lockKnee:1,meas:'kneeTop',warn:'Knees locked',warnAt:'knee',cam:'sideFlat'}),
    heels:MS('Heels lift','Heels peel off, knees cave','The heels lift off the plate at the bottom and the knees drift in.','The knees and calves take the load.','Knee irritation.','Drive through the whole foot.',{heels:1,meas:'heelLift',warn:'Heels lift',warnAt:'knee',cam:'sideFlat'})})});
defEx('legExt',{group:'legs',name:'Leg extension',eq:'Machine',part:'Front of the thigh',station:'legExt',entry:'legExt',kind:'curl',pose:poseLegExt,
  quip:'Kick it straight. Hold. Feel the quad glow.',
  mus:{quadRF:[1,'m'],quadV:[1,'m']},
  labels:[['Quads (rectus femoris)','quadRF','m']],center:V(0,.6,-11.95),cam:'sideFlat',coachSpot:{p:[-1.3,-11.6],h:Math.PI/2},
  steps:steps4([['Lower slowly','2 sec'],['Knees at 90°','pad on the shins'],['Kick straight','one smooth push'],['Squeeze','one second']]),
  stepText:['Lower the pad slowly, about 2 seconds.','Knees back to about 90°. The back pad is reclined so the front of the thigh is stretched.','Straighten the legs in one smooth push. Hips stay on the seat.','Legs straight. Squeeze the front of the thigh for a second.'],
  cues:[['Two seconds down.'],['Hips down.'],['Kick it straight.'],['Hold one second.']],
  beginner:'3 sets of 10–15: the best first quad exercise. If the kneecap hurts at the top, stop short of straight.',
  forms:mk({lower:2.0,touch:.2,press:1.0,lock:1.0,prof:'smooth'},{
    hips:MS('Hips lift','Hips pop up to swing the weight','The hips rise off the seat and the torso rocks back to swing the weight up.','Momentum, not the quads, lifts it.','No progress, and bruises from the pad.','Hips down, grip the handles.',{hips:1,meas:'hipLift',warn:'Hips lift',warnAt:'hips',cam:'sideFlat'}),
    slam:MS('Dropping the weight','Pad drops and the stack slams','The pad drops in under half a second and the plates clank.','Half the rep, the lowering, is wasted.','Slower growth.','Lower for two seconds.',{lower:.45,touch:.05,meas:'lowerTime',warn:'Weight drops',warnAt:'knee',cam:'sideFlat'}),
    half:MS('Half reps','Legs never straighten','The legs stop at about 130° and never straighten.','The top squeeze, where the quads peak, is missing.','Less growth of the front of the thigh.','All the way straight.',{half:1,meas:'extTop',warn:'Stops short',warnAt:'knee',cam:'sideFlat'})})});
defEx('legCurl',{group:'legs',name:'Lying leg curl',eq:'Machine',part:'Hamstrings',station:'legCurl',entry:'legCurl',kind:'curl',pose:poseLegCurl,
  quip:'Heels to bum. Hamstrings file a complaint.',
  mus:{hams:[1,'m'],gastroc:[.45,'h'],glute:[.2,'h']},
  labels:[['Hamstrings','hams','m'],['Calves','gastroc','h']],center:V(0,.7,-11.7),cam:'sideFlat',coachSpot:{p:[-1.3,-11.6],h:Math.PI/2},
  steps:steps4([['Lower slowly','2 sec'],['Legs nearly straight','don’t lock'],['Curl heels to the bum','hips down'],['Squeeze','one second']]),
  stepText:['Lower the roller slowly, about 2 seconds.','Legs almost straight, roller behind the ankles.','Curl the heels toward your bum. Hips stay pressed into the pad.','Squeeze at the top for a second.'],
  cues:[['Two seconds down.'],['Almost straight.'],['Heels to the bum.'],['Squeeze.']],
  beginner:'3 sets of 10–15. Roller on the ankles, not the calves. The gym has no seated curl, which grows the hamstrings a bit more.',
  forms:mk({lower:2.0,touch:.2,press:1.0,lock:1.0,prof:'smooth'},{
    hips:MS('Hips lift','Hips rise off the pad','The hips rise off the pad, the hip angle changes 20–30°, and the back arches to cheat.','The hip flexors and back do the lift.','Lower-back ache; hamstrings under-loaded.','Hips glued to the pad.',{hips:1,meas:'curlHip',warn:'Hips lift',warnAt:'hips',cam:'sideFlat'}),
    half:MS('Half curl','Heels stop halfway up','The curl stops at about 110° at the knee.','No peak squeeze.','Slower growth.','Heels all the way up.',{half:1,meas:'curlTop',warn:'Stops short',warnAt:'knee',cam:'sideFlat'}),
    drop:MS('Dropping the weight','Roller drops in a blink','The roller drops in under half a second and bounces.','Half the training effect is lost.','Fewer gains and bruised ankles.','Two seconds on the way down.',{lower:.45,touch:.05,meas:'lowerTime',warn:'Weight drops',warnAt:'knee',cam:'sideFlat'})})});
defEx('hipThrust',{group:'legs',name:'Barbell hip thrust',eq:'Barbell',part:'Glutes',station:'hipThrust',entry:'hipThrust',kind:'raise',pose:poseHipThrust,
  quip:'Glutes, meet gravity. Gravity, meet the padded bar.',
  mus:{glute:[1,'m'],gluteMed:[.6,'h'],hams:[.45,'h'],quadV:[.6,'h'],adduct:[.35,'h']},
  labels:[['Glutes','glute','m'],['Hamstrings','hams','h'],['Quads','quadV','h']],center:V(0,.45,-11.9),cam:'sideFlat',coachSpot:{p:[-1.5,-11.4],h:Math.PI/2},
  steps:steps4([['Lower slowly','1 sec'],['Hips near the floor','chin tucked'],['Drive the hips up','squeeze'],['Torso level','one second']]),
  stepText:['Lower the hips toward the floor under control.','Hips just off the floor. Upper back on the bench edge, chin tucked.','Drive the hips up through the heels until the torso is level.','Hold a second with the glutes squeezed: torso level, shins vertical.'],
  cues:[['Lower slowly.'],['Chin tucked.'],['Drive up.'],['Squeeze, ribs down.']],
  beginner:'3 sets of 10–12 with the empty bar (with a pad) or bodyweight first.',
  forms:mk({lower:1.0,touch:.3,press:1.0,lock:1.0,prof:'smooth'},{
    arch:MS('Arched lower back','Finishes by arching the back','The hips go past level and the lower back arches, ribs flared, head dropped back.','The lower back, not the glutes, closes the last part.','Lower-back ache, and the glutes never fully squeeze.','Ribs down, squeeze, no arch.',{arch:1,meas:'hipTop',warn:'Back arches',warnAt:'lowback',cam:'sideFlat',strain:['erect']}),
    far:MS('Feet too far out','Shins lean forward at the top','The feet are too far out, so the shins lean forward at the top.','The hamstrings take over.','Hamstring cramps and less glute work.','Shins straight up at the top.',{far:1,meas:'shinTop',warn:'Feet too far',warnAt:'knee',cam:'sideFlat',mul:{hams:1.6,glute:.8}}),
    half:MS('Half thrust','Hips stop below level','The hips stop well below level, at a hip angle of about 135°.','The glute’s hardest range, full extension, is skipped.','Less growth.','Hips all the way up.',{half:1,meas:'hipTop',warn:'Stops short',warnAt:'hips',cam:'sideFlat'})})});
defEx('standCalf',{group:'legs',name:'Standing calf raise',eq:'Machine',part:'Calves',station:'standCalf',entry:'standCalf',kind:'raise',pose:poseStandCalf,
  quip:'Tiptoes, but make it heavy.',
  mus:{gastroc:[1,'m'],soleus:[.9,'m']},
  labels:[['Calves (gastrocnemius)','gastroc','m'],['Soleus','soleus','m']],center:V(0,.7,-11.9),cam:'sideFlat',coachSpot:{p:[-1.3,-11.6],h:Math.PI/2},
  steps:steps4([['Lower the heels','2 sec'],['Pause in the stretch','one second'],['Rise onto the toes','high'],['Hold','one second']]),
  stepText:['Lower the heels slowly below the step.','Pause for a second with the calves fully stretched: this part grows them most.','Rise as high as you can onto the balls of your feet. Legs stay straight.','Hold at the top for a second, then lower.'],
  cues:[['Heels down slowly.'],['Pause. No bounce.'],['Up high.'],['Hold.']],
  beginner:'3 sets of 10–15 with a slow stretch.',
  forms:mk({lower:2.0,touch:1.0,press:1.0,lock:1.0,prof:'smooth'},{
    bounce:MS('Bouncing','Quick bounce at the bottom','The heels bounce off the bottom with no pause, under a second per rep.','The Achilles tendon springs the weight; the muscle works less.','Calves don’t grow; Achilles irritation.','Pause at the bottom, no bounce.',{bounce:1,lower:.5,touch:.12,press:.5,lock:.2,meas:'bottomPause',warn:'Bouncing',warnAt:'knee',cam:'sideFlat'}),
    half:MS('Half range','Heels never drop below the step','The heels never go below the step.','It skips the stretched position.','About half the growth.','Heels below the step.',{half:1,meas:'ankleBottom',warn:'No stretch',warnAt:'knee',cam:'sideFlat'}),
    knees:MS('Knees bend','Knees bend to help','The knees bend on each rep to help push.','The gastrocnemius goes slack.','It quietly becomes a soleus-only exercise.','Legs straight, calves only.',{knees:1,meas:'calfKnee',warn:'Knees bend',warnAt:'knee',cam:'sideFlat',mul:{quadV:1.4}})})});
defEx('seatCalf',{group:'legs',name:'Seated calf raise',eq:'Machine',part:'Calves (soleus)',station:'seatCalf',entry:'seatCalf',kind:'raise',pose:poseSeatCalf,
  quip:'Sit down, calves. This one’s for the soleus.',
  mus:{soleus:[1,'m'],gastroc:[.3,'h']},
  labels:[['Soleus','soleus','m'],['Calves (gastrocnemius)','gastroc','h']],center:V(0,.55,-11.9),cam:'sideFlat',coachSpot:{p:[-1.3,-11.6],h:Math.PI/2},
  steps:steps4([['Lower the heels','2 sec'],['Pause in the stretch','one second'],['Rise onto the toes','high'],['Hold','one second']]),
  stepText:['Lower the heels slowly below the step.','Pause for a second with the heels low.','Rise onto the balls of your feet, lifting the pad.','Hold at the top. Standing calf raises grow the soleus just as well; this is the soleus-biased option, not a must.'],
  cues:[['Heels down slowly.'],['Pause.'],['Up.'],['Hold.']],
  beginner:'3 sets of 12–20. Release and re-engage the stop with the heels up.',
  forms:mk({lower:2.0,touch:1.0,press:1.0,lock:1.0,prof:'smooth'},{
    bounce:MS('Bouncing','Quick bounce at the bottom','The heels bounce off the bottom with no pause.','Tendon rebound does the work.','No growth.','Slow at the bottom.',{bounce:1,lower:.5,touch:.12,press:.5,lock:.2,meas:'bottomPause',warn:'Bouncing',warnAt:'knee',cam:'sideFlat'}),
    half:MS('Half range','Heels stay level with the step','The heels stay level with the step.','No stretch.','About half the growth.','Heels all the way down.',{half:1,meas:'ankleBottom',warn:'No stretch',warnAt:'knee',cam:'sideFlat'}),
    knee:MS('Pad on the kneecap','Pad sits on the knees','The pad sits on the kneecaps instead of the thighs.','It hurts.','Bruised kneecaps, and people quit the exercise.','Pad on the thighs, not the knees.',{knee:1,meas:'padKnee',warn:'Pad on the kneecaps',warnAt:'knee',cam:'sideFlat'})})});

function layoutLegs(){
  makeStation('squatRack',-10.4,-8.8,Math.PI/2,g=>buildSquatRack(g),{name:'squat rack'});
  makeStation('hipThrust',-9.6,-16.9,Math.PI/2,g=>buildHipThrust(g),{name:'hip thrust bench'});
  makeStation('legPress',-9.4,-21.4,0,g=>buildLegPress(g),{name:'leg press'});
  makeStation('legExt',-6.6,-21.8,0,g=>buildLegExt(g),{name:'leg extension'});
  makeStation('legCurl',-4.0,-21.8,0,g=>buildLegCurl(g),{name:'leg curl'});
  makeStation('seatCalf',-1.4,-21.8,0,g=>buildSeatCalf(g),{name:'seated calf raise'});
  makeStation('standCalf',1.2,-21.8,0,g=>buildStandCalf(g),{name:'standing calf raise'});
}
