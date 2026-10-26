
// ---------------------------------------------------------------- characters, posing helpers, muscle painting
const loader=new GLTFLoader();
const mixers=[];
let hero=null,coach=null,twin=null;
function makeChar(g,U){
  const m=SkeletonUtils.clone(g.scene);
  const bones={};const mats=[];const meshes=[];
  m.traverse(o=>{if(o.isBone)bones[o.name.replace('mixamorig','')]=o;
    if(o.isSkinnedMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;meshes.push(o);
      const ms=Array.isArray(o.material)?o.material:[o.material];const cl=ms.map(x=>{const y=x.clone();y.userData.op=y.opacity;y.userData.tr=y.transparent;return y;});o.material=Array.isArray(o.material)?cl:cl[0];mats.push(...cl);}});
  const mixer=new THREE.AnimationMixer(m);mixers.push(mixer);
  const act={};g.animations.forEach(a=>{act[a.name]=mixer.clipAction(a);});
  const rest={};for(const k in bones)rest[k]=bones[k].quaternion.clone();
  const hipRest=bones.Hips.position.clone();
  const c={root:m,bones,rest,hipRest,mixer,act,mats,meshes,cur:null,heading:0,pos:V(),speed:0,hold:[],U};
  scene.add(m);return c;}
// one clip plays at a time, at full weight; the pose it takes over from fades out over a snapshot (applyFade), so the
// mixer never dips toward the bind pose while two clips cross-fade with weights that do not add up to one
function play(c,name,fade=.35,ts=1){const a=c.act[name];if(c.cur===a){a.setEffectiveTimeScale(ts);return;}
  // the fade starts from the pose on screen: the last clipPost output while a clip was playing (the bones may already hold the
  // raw clip pose for this frame), else the bones as they are
  if(c.root.visible&&typeof fadeFromPose==='function'){c.root.updateMatrixWorld(true);fadeFromPose(c,Math.max(.3,fade),c.cur?(c._disp||(c.fade&&c.fade.t===0?c.fade.s:snapshot(c))):snapshot(c));}
  const running=a.isRunning();a.stopFading();if(!running)a.reset();a.setEffectiveTimeScale(ts).setEffectiveWeight(1).play();
  // stopping an action restores the bind pose on the bones only it animates; keep what is on the bones
  const keep={};for(const k in c.bones)keep[k]=c.bones[k].quaternion.clone();const hp=c.bones.Hips.position.clone();
  for(const k in c.act){const o=c.act[k];if(o!==a&&o.isRunning())o.stop();}
  for(const k in c.bones)c.bones[k].quaternion.copy(keep[k]);c.bones.Hips.position.copy(hp);c.cur=a;}
// stopping clips makes three.js restore the bind pose (T-pose), so keep the current pose across the stop
function stopClips(c){c._disp=null;c.fade=null;c._lift=0;const keep={};for(const k in c.bones)keep[k]=c.bones[k].quaternion.clone();const hp=c.bones.Hips.position.clone();c.mixer.stopAllAction();c.cur=null;for(const k in c.bones)c.bones[k].quaternion.copy(keep[k]);c.bones.Hips.position.copy(hp);c.root.updateMatrixWorld(true);}
function place(c){c._lift=0;c.root.position.copy(c.pos);c.root.quaternion.setFromAxisAngle(V(0,1,0),c.heading);}
function turnTo(c,heading,dt,k=5){let dh=angDiff(heading,c.heading);c.heading+=dh*Math.min(1,dt*k);place(c);return Math.abs(dh)<.03;}
function angDiff(a,b){return ((a-b+Math.PI*3)%(Math.PI*2))-Math.PI;}

const _q=new THREE.Quaternion(),_q2=new THREE.Quaternion();
function wpos(b,out=V()){return b.getWorldPosition(out);}
function aim(bone,child,target){ // rotate bone so that its child points at target (world)
  const P=wpos(bone,V()),C=wpos(child,V());
  const from=C.sub(P).normalize(),to=V().subVectors(target,P).normalize();
  const dq=new THREE.Quaternion().setFromUnitVectors(from,to);
  const wq=bone.getWorldQuaternion(new THREE.Quaternion());
  const nw=dq.multiply(wq);
  const pq=bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
  bone.quaternion.copy(pq.multiply(nw));bone.updateMatrixWorld(true);}
function ik2(S,H,L1,L2,pole){const d=Math.min(V().subVectors(H,S).length(),L1+L2-1e-4);const dir=V().subVectors(H,S).normalize();
  const a=(L1*L1-L2*L2+d*d)/(2*d);const h=Math.sqrt(Math.max(0,L1*L1-a*a));
  const perp=pole.clone().addScaledVector(dir,-pole.dot(dir)).normalize();
  return S.clone().addScaledVector(dir,a).addScaledVector(perp,h);}
function resetRest(c){for(const k in c.bones)c.bones[k].quaternion.copy(c.rest[k]);c.bones.Hips.position.copy(c.hipRest);}
const CURL={axis:V(0,.46,.89).normalize(),sL:-1,sR:1};
// body dimensions, measured from the lifter in its rest pose
const D={hips:V(0,1.04,.021),sh:V(0,1.438,-.05),shx:.152,arm:.2784,fore:.2833,thigh:.4437,shin:.4443,back:.16,chest:.235,s:1,ankY:.09,footL:.2};
let GRIP=.29;
function measure(c){const r=c.root;r.position.set(0,0,0);r.quaternion.identity();resetRest(c);r.updateMatrixWorld(true);
  const B=c.bones,w=n=>wpos(B[n]);const H=w('Hips'),A=w('LeftArm'),F=w('LeftForeArm'),Hd=w('LeftHand'),U=w('LeftUpLeg'),L=w('LeftLeg'),Ft=w('LeftFoot'),T=w('LeftToeBase');
  D.s=H.y/1.04;D.shrug0=A.y-w('Neck').y;D.hips.set(0,H.y,H.z);D.sh.set(0,A.y,A.z);D.shx=A.x;D.arm=A.distanceTo(F);D.fore=F.distanceTo(Hd);D.thigh=U.distanceTo(L);D.shin=L.distanceTo(Ft);
  D.hipx=U.x;D.upLeg=U.clone();D.ankY=Ft.y;D.footL=Ft.distanceTo(T);D.neck=w('Neck');D.head=w('Head');D.spine2=w('Spine2');D.spine=w('Spine');
  D.back=.16*D.s*1.04;D.chest=.235*D.s*1.12;GRIP=.29*D.shx/.152;}
function reach(){return Math.sqrt(Math.pow((D.arm+D.fore)*.97,2)-Math.pow(GRIP-D.shx,2));}

const PALM=V(0,-.89,.46).normalize(); // hand-local palm normal at rest (fingers +X left / -X right)
function setHandWorld(bone,left,hd,pn){ // rotate the hand so its fingers follow hd and its palm faces pn
  const xl=V(left?1:-1,0,0),zl=V().crossVectors(xl,PALM),zw=V().crossVectors(hd,pn);
  const mw=new THREE.Matrix4().makeBasis(hd,pn,zw),ml=new THREE.Matrix4().makeBasis(xl,PALM,zl);
  const qw=new THREE.Quaternion().setFromRotationMatrix(mw.multiply(ml.transpose()));
  bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(qw));bone.updateMatrixWorld(true);}
const CURLJ=[.8,1.05,.75];
function curlHand(c,side,amt){const B=c.bones;for(const f of['Index','Middle','Ring','Pinky']){for(let i=1;i<=3;i++){const b=B[side+'Hand'+f+i];if(!b)continue;b.quaternion.copy(c.rest[side+'Hand'+f+i]).multiply(_q.setFromAxisAngle(CURL.axis,(side==='Left'?CURL.sL:CURL.sR)*amt*CURLJ[i-1]));}}
  const t=B[side+'HandThumb1'];if(t)t.quaternion.copy(c.rest[side+'HandThumb1']).multiply(_q.setFromAxisAngle(V(0,1,0),(side==='Left'?-1:1)*amt*.5));
  c.root.updateMatrixWorld(true);}
// world-space frame of a hand: fingers (hd), palm normal (pn), thumb side (tz)
function handFrame(c,side){const b=c.bones[side+'Hand'];const q=b.getWorldQuaternion(new THREE.Quaternion());
  const hd=V(side==='Left'?1:-1,0,0).applyQuaternion(q),pn=PALM.clone().applyQuaternion(q),tz=V().crossVectors(V(side==='Left'?1:-1,0,0),PALM).applyQuaternion(q);
  return {p:wpos(b),hd,pn,tz,q};}
// where a handle sits in a closed hand (inverse of armTo's wrist offset)
function gripPoint(c,side,palm=.075,off=.022){const f=handFrame(c,side);return f.p.addScaledVector(f.hd,palm*D.s).addScaledVector(f.pn,off*D.s);}

// snapshots and blending; blends pivot on the hips so a body never swings through a bench
function snapshot(c){c.root.updateMatrixWorld(true);const s={hip:wpos(c.bones.Hips),quat:c.root.quaternion.clone(),hl:c.bones.Hips.position.clone(),b:{},fmin:footMin(c)};for(const k in c.bones)s.b[k]=c.bones[k].quaternion.clone();return s;}
function footMin(c){const B=c.bones;let m=1e9;for(const n of['LeftFoot','RightFoot','LeftToeBase','RightToeBase']){const b=B[n];if(b)m=Math.min(m,wpos(b).y);}return m;}
function applySnap(c,s){blendTo(c,s,s,0);}
// blend pivots on the hips; a foot that is on the floor at either end of the blend never dips below the lower of the two
// endpoints' feet on the way (a half-bent leg is longer than the straight-line hip path allows)
function blendTo(c,a,b,t){const r=c.root;r.quaternion.slerpQuaternions(a.quat,b.quat,t);for(const k in c.bones)c.bones[k].quaternion.slerpQuaternions(a.b[k],b.b[k],t);
  c.bones.Hips.position.lerpVectors(a.hl,b.hl,t);r.position.set(0,0,0);r.updateMatrixWorld(true);const off=wpos(c.bones.Hips);
  r.position.copy(a.hip).lerp(b.hip,t).sub(off);r.updateMatrixWorld(true);
  if(t>0&&t<1&&a.fmin!==undefined&&b.fmin!==undefined){const lim=Math.min(a.fmin,b.fmin);if(lim<.12){const cur=footMin(c);if(cur<lim-1e-4){r.position.y+=lim-cur;r.updateMatrixWorld(true);}}}}

// ---- generic limb placement
const DEG=Math.PI/180;
const qX=a=>new THREE.Quaternion().setFromAxisAngle(V(1,0,0),a);
const qY=a=>new THREE.Quaternion().setFromAxisAngle(V(0,1,0),a);
const qZ=a=>new THREE.Quaternion().setFromAxisAngle(V(0,0,1),a);
function rootFromAxes(Y,Z){Y=Y.clone().normalize();Z=Z.clone().addScaledVector(Y,-Z.dot(Y)).normalize();const X=V().crossVectors(Y,Z);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,Y,Z));}
function setRoot(c,q,hipT){c.root.quaternion.copy(q);c.root.position.copy(hipT).sub(D.hips.clone().applyQuaternion(q));c._hipT=hipT.clone();c.root.updateMatrixWorld(true);}
function elbowD(deg){const a=D.arm,b=D.fore;return Math.sqrt(a*a+b*b-2*a*b*Math.cos(deg*DEG));} // shoulder-to-wrist distance for an elbow angle
function slerpV(a,b,t){const q=new THREE.Quaternion().setFromUnitVectors(a.clone().normalize(),b.clone().normalize());return a.clone().normalize().applyQuaternion(new THREE.Quaternion().slerp(q,t));}
const sideOf=s=>s>0?'Left':'Right';
function shoulders(c){return [wpos(c.bones.LeftArm),wpos(c.bones.RightArm)];}
// hand on a handle: contact = centre of the handle in the palm; hd = wrist→knuckles; pn = palm normal
function armTo(c,side,contact,o){const B=c.bones,s=side==='Left'?1:-1;
  let hd=o.hd.clone().normalize();const S=wpos(B[side+'Arm']);
  const solve=()=>{const pn=o.pn.clone().addScaledVector(hd,-o.pn.dot(hd)).normalize();
    const W=contact.clone().addScaledVector(hd,-(o.palm??.075)*D.s).addScaledVector(pn,-(o.off??.022)*D.s);
    return {pn,W,E:ik2(S,W,D.arm,D.fore,o.pole)};};
  let r=solve();if(o.follow){hd=V().subVectors(contact,r.E).normalize();r=solve();}
  aim(B[side+'Arm'],B[side+'ForeArm'],r.E);aim(B[side+'ForeArm'],B[side+'Hand'],r.W);
  setHandWorld(B[side+'Hand'],s>0,hd,r.pn);curlHand(c,side,o.curl??1);return r;}
// arm by directions: upper arm along ua, forearm along fa (world), hand fingers hd (default: continue the forearm), palm pn
function armDir(c,side,ua,fa,pn,o={}){const B=c.bones,s=side==='Left'?1:-1;const S=wpos(B[side+'Arm']);
  const E=S.clone().addScaledVector(ua.clone().normalize(),D.arm),W=E.clone().addScaledVector(fa.clone().normalize(),D.fore);
  aim(B[side+'Arm'],B[side+'ForeArm'],E);aim(B[side+'ForeArm'],B[side+'Hand'],W);
  const hd=(o.hd||fa).clone().normalize();setHandWorld(B[side+'Hand'],s>0,hd,pn.clone().addScaledVector(hd,-pn.dot(hd)).normalize());curlHand(c,side,o.curl??1);
  return {S,E,W,contact:W.clone().addScaledVector(hd,(o.palm??.075)*D.s).addScaledVector(pn.clone().addScaledVector(hd,-pn.dot(hd)).normalize(),(o.off??.022)*D.s)};}
function legTo(c,side,ank,pole,pitch=0){const B=c.bones;const Hp=wpos(B[side+'UpLeg']);const knee=ik2(Hp,ank,D.thigh,D.shin,pole);
  aim(B[side+'UpLeg'],B[side+'Leg'],knee);aim(B[side+'Leg'],B[side+'Foot'],ank);
  if(pitch){B[side+'Foot'].quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),pitch));B[side+'Foot'].updateMatrixWorld(true);}return knee;}
// point a foot: toes toward 'toe' (world)
function footTo(c,side,toe){aim(c.bones[side+'Foot'],c.bones[side+'ToeBase'],toe);}
// legs by directions (for legs that swing freely)
function legDir(c,side,ta,sa,toeDir){const B=c.bones;const Hp=wpos(B[side+'UpLeg']);const K=Hp.clone().addScaledVector(ta.clone().normalize(),D.thigh),A=K.clone().addScaledVector(sa.clone().normalize(),D.shin);
  aim(B[side+'UpLeg'],B[side+'Leg'],K);aim(B[side+'Leg'],B[side+'Foot'],A);if(toeDir)footTo(c,side,A.clone().addScaledVector(toeDir,.15));return {K,A};}
function clav(c,o){const B=c.bones;for(const s of[1,-1]){const b=B[sideOf(s)+'Shoulder'];
  b.quaternion.multiply(_q.setFromAxisAngle(V(0,0,1),s*(o.shrug??.07)));if(o.protract)b.quaternion.multiply(_q.setFromAxisAngle(V(0,1,0),-s*o.protract));b.updateMatrixWorld(true);}}
// bend the spine forward (+) / back (−) over the three spine joints, and twist / side-bend
function spineBend(c,flex,o={}){const B=c.bones;const w=[.3,.35,.35];['Spine','Spine1','Spine2'].forEach((n,i)=>{B[n].quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),flex*w[i]));
  if(o.twist)B[n].quaternion.multiply(_q.setFromAxisAngle(V(0,1,0),o.twist*w[i]));if(o.side)B[n].quaternion.multiply(_q.setFromAxisAngle(V(0,0,1),o.side*w[i]));});
  if(o.neck!==undefined)B.Neck.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),o.neck));if(o.head!==undefined)B.Head.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),o.head));
  c.root.updateMatrixWorld(true);}
// torso axes in world: L (lifter's left), U (up the spine), F (forward out of the chest)
function torsoAxes(c){const B=c.bones;const L=V().subVectors(wpos(B.LeftArm),wpos(B.RightArm)).normalize();const U=V().subVectors(wpos(B.Neck),wpos(B.Spine)).normalize();
  const F=V().crossVectors(L,U).normalize();U.crossVectors(F,L).normalize();return {L,U,F};}
function pelvisAxes(c){const q=c.bones.Hips.getWorldQuaternion(new THREE.Quaternion());return {L:V(1,0,0).applyQuaternion(q),U:V(0,1,0).applyQuaternion(q),F:V(0,0,1).applyQuaternion(q)};}
// a direction from torso-relative angles: flex = forward raise, abd = sideways raise (degrees), for side s
function tdir(T,s,flex,abd){const f=flex*DEG,a=abd*DEG;return V().addScaledVector(T.U,-Math.cos(f)*Math.cos(a)).addScaledVector(T.F,Math.sin(f)*Math.cos(a)).addScaledVector(T.L,s*Math.sin(a)).normalize();}

// ---------------------------------------------------------------- muscle regions painted on the body
// every vertex gets one region id; the shader lights each region by its level and role
const REG=['none','pecU','pecL','deltF','deltS','deltR','biLong','biShort','forearm','triLong','triLat','lats','trapU','midBack','erect','abs','oblq','glute','gluteMed','quadRF','quadV','hams','adduct','gastroc','soleus','serratus'];
const RID={};REG.forEach((n,i)=>RID[n]=i);
const NREG=28;
function makeMU(){return {uLv:{value:new Float32Array(NREG)},uRole:{value:new Float32Array(NREG)},uC0:{value:new THREE.Color(0xff2a1a)},uC1:{value:new THREE.Color(0xffb020)},uC2:{value:new THREE.Color(0xff2a1a)},uT:{value:0},uOn:{value:1}};}
const MU=makeMU(),MU2=makeMU();MU2.uT=MU.uT;
function patchMuscleMat(m,U){m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>
attribute float mreg;attribute float mw;uniform float uLv[${NREG}];uniform float uRole[${NREG}];uniform vec3 uC0;uniform vec3 uC1;uniform vec3 uC2;uniform float uOn;varying vec3 vMC;varying float vMA;`)
   .replace('#include <begin_vertex>',`#include <begin_vertex>
int ri=int(mreg+.5);float lv=uLv[ri];float ro=uRole[ri];vMC=ro<.5?uC0:(ro<1.5?uC1:uC2);vMA=clamp(lv*mw,0.,1.)*uOn;`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vMC;varying float vMA;uniform float uT;')
   .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
  diffuseColor.rgb=mix(diffuseColor.rgb,vMC*.85,vMA*.62);
  totalEmissiveRadiance+=vMC*vMA*(.42+.1*sin(uT*5.));`);};
  m.customProgramCacheKey=()=>'muscle-v3';m.needsUpdate=true;}
const ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
// classify every vertex in the rest pose; uses skin weights to know which body part a vertex follows
const REGPOS={}; // region id -> {mesh, index} of a vertex near the region's centre (label anchor)
function paintMuscles(c){
  const r=c.root;r.position.set(0,0,0);r.quaternion.identity();resetRest(c);r.updateMatrixWorld(true);
  const B=c.bones,w=n=>wpos(B[n]);const s=D.s;
  const A=w('LeftArm'),E=w('LeftForeArm'),Hd=w('LeftHand'),Hp=w('Hips'),S2=w('Spine2'),S1=w('Spine1'),Nk=w('Neck'),U=w('LeftUpLeg'),K=w('LeftLeg'),Ft=w('LeftFoot');
  const C=S2; // chest reference
  const sums={};
  for(const o of c.meshes){const g=o.geometry,pos=g.attributes.position,si=g.attributes.skinIndex,sw=g.attributes.skinWeight;
    const reg=new Float32Array(pos.count),mw=new Float32Array(pos.count);const v=V();
    const names=o.skeleton.bones.map(b=>b.name.replace('mixamorig',''));
    const lname=(o.name||'')+(o.material&&o.material.name||'');const skip=/Eye|Hair|brow|lash|shoe|Shoe|teeth|tongue/i.test(lname);
    for(let i=0;i<pos.count;i++){
      if(skip){reg[i]=0;continue;}
      v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);
      // dominant bone
      let bi=0,bw=-1;for(let k=0;k<4;k++){const ww=sw.getComponent(i,k);if(ww>bw){bw=ww;bi=si.getComponent(i,k);}}
      let bn=names[bi]||'';bn=bn.replace('Right','Left');
      const ax=Math.abs(v.x),y=v.y,z=v.z;let id=0,wt=1;
      if(/Hand|Head|Neck/.test(bn)&&!(bn==='Neck'&&y<Nk.y+.02*s)){id=0;}
      else if(bn==='LeftArm'||bn==='LeftShoulder'&&ax>A.x-.02*s){ // upper arm (arm out to the side, crease forward)
        const t=(ax-A.x)/(E.x-A.x);const ph=Math.atan2(z-A.z,y-A.y)/DEG; // 0 = top, 90 = front, ±180 = under, -90 = back
        const dc=Math.hypot(ax-A.x,y-A.y,z-A.z);
        if(t<.33||dc<.075*s){ // shoulder cap: deltoid heads by angle round the arm
          id=ph>28&&ph<150?RID.deltF:ph>-28&&ph<=28?RID.deltS:ph<=-28&&ph>-150?RID.deltR:0;
          if(id===0&&t>.2)id=ph>0?RID.biShort:RID.triLong;}
        else if(ph>15&&ph<168)id=ph<92?RID.biLong:RID.biShort;
        else if(ph<-15&&ph>-168)id=ph<-92?RID.triLong:RID.triLat;
        else id=ph>=0?RID.biShort:RID.triLat;
        wt=1-ss(.92,1.04,t)*.6;}
      else if(bn==='LeftForeArm'){const t=(ax-E.x)/(Hd.x-E.x);const ph=Math.atan2(z-E.z,y-E.y)/DEG;
        id=t<.62&&ph>-40&&ph<130?RID.forearm:0;wt=1-ss(.45,.62,t);}
      else if(bn==='LeftUpLeg'||(bn==='Hips'&&y<Hp.y-.06*s&&ax>.04*s)){ // thigh (and buttock)
        const t=(U.y-y)/(U.y-K.y);const cx=U.x+(K.x-U.x)*clamp(t,0,1),cz=U.z+(K.z-U.z)*clamp(t,0,1);
        const ph=Math.atan2(ax-cx,z-cz)/DEG; // 0 = front, 90 = outside, -90 = inside, 180 = back
        if(z<cz-.02*s&&t<.28)id=RID.glute;
        else if(Math.abs(ph)<28&&t<.86)id=RID.quadRF;
        else if(ph>=28&&ph<118||ph<=-28&&ph>-62)id=t<.95?RID.quadV:0;
        else if(ph<=-62&&ph>-122)id=t<.62?RID.adduct:RID.quadV;
        else id=t<.92?RID.hams:0;
        if(id===RID.glute&&y>Hp.y-.0*s&&ax>.1*s)id=RID.gluteMed;}
      else if(bn==='LeftLeg'){const t=(K.y-y)/(K.y-Ft.y);const ph=Math.atan2(ax-K.x,z-K.z)/DEG;
        const back=Math.abs(ph)>95;
        if(Math.abs(ph)>112&&t<.55)id=RID.gastroc;else if(t>=.4&&t<.82&&Math.abs(ph)>100)id=RID.soleus;else id=0;}
      else if(/Spine|Hips|Shoulder|Neck/.test(bn)){ // torso
        const front=z>S1.z+.03*s,back=z<S1.z-.03*s;
        if(y>A.y-.02*s&&ax<A.x-.03*s&&z<A.z+.05*s&&y<Nk.y+.07*s)id=RID.trapU;
        else if(front&&y>C.y-.13*s&&y<A.y+.01*s&&ax<A.x+.0*s&&ax>.008){id=RID.pecL;}
        else if(back&&y>S2.y-.04*s&&y<A.y-.02*s&&ax<.11*s)id=RID.midBack;
        else if(back&&y>Hp.y-.03*s&&y<S2.y-.04*s&&ax<.07*s)id=RID.erect;
        else if((back||ax>.12*s)&&y>Hp.y+.1*s&&y<S2.y+.08*s&&ax>.06*s&&z<.06*s)id=RID.lats;
        else if(front&&y>Hp.y-.08*s&&y<C.y-.1*s&&ax<.075*s)id=RID.abs;
        else if(y>Hp.y-.04*s&&y<C.y-.06*s&&ax>=.075*s&&z>S1.z-.06*s)id=ax>.12*s&&y>C.y-.16*s?RID.serratus:RID.oblq;
        else if(back&&y<=Hp.y-.03*s&&ax<.16*s)id=RID.glute;
        else id=0;
        if(id===RID.pecL){const up=ss(C.y-.1*s,A.y+.02*s,y);if(up>.5)id=RID.pecU;}}
      reg[i]=id;mw[i]=id?wt:0;
      if(id){const S=sums[id]||(sums[id]={x:0,y:0,z:0,n:0,best:null});if(v.x>0){S.x+=v.x;S.y+=v.y;S.z+=v.z;S.n++;}}
    }
    g.setAttribute('mreg',new THREE.BufferAttribute(reg,1));g.setAttribute('mw',new THREE.BufferAttribute(mw,1));}
  // label anchors: the vertex closest to each region's centre (left side of the body)
  for(const id in sums){const S=sums[id];if(!S.n)continue;const cc=V(S.x/S.n,S.y/S.n,S.z/S.n);let best=1e9,bm=-1,bi=0;
    for(const [mi,o] of c.meshes.entries()){const g=o.geometry,pos=g.attributes.position,reg=g.attributes.mreg.array;const v=V();
      for(let i=0;i<pos.count;i++){if(reg[i]!=id)continue;v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);const d=v.distanceToSquared(cc);if(d<best){best=d;bm=mi;bi=i;}}}
    REGPOS[id]={mi:bm,index:bi};}
  c.mats.forEach(m=>patchMuscleMat(m,c.U));}
function regionWorld(c,id,out=V()){const R=REGPOS[id];if(!R)return null;const m=c.meshes[R.mi];if(!m)return null;m.getVertexPosition(R.index,out);return out.applyMatrix4(m.matrixWorld);}
