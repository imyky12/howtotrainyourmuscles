
// ---------------------------------------------------------------- chest: equipment and pose families (canonical frame)
function torsoPole(s,f,ang){return V(s*Math.sin(f),0,0).add(V(0,-Math.sin(ang),Math.cos(ang)).multiplyScalar(Math.cos(f))).add(V(0,Math.cos(ang),Math.sin(ang)).multiplyScalar(-.75)).normalize();}
const PRESS_HD=V(0,1,-.38).normalize();
function poseBar(c,F,b,u,P){ // barbell on a flat / incline / decline bench: vertical bar path
  const ang=(F.angle||0)*DEG;P.setAngle&&P.setAngle(F.angle||0);
  if(F.bounce&&b.phase===0)u=1-Math.pow(b.k,1.8);
  if(F.bounce&&b.phase===2&&b.k<.3)u=b.k<.08?-.04*Math.sin(Math.PI*b.k/.08):u+.18*Math.sin(Math.PI*(b.k-.08)/.22);
  const hip=F.hips?(b.phase===2?Math.sin(Math.PI*clamp(b.k*1.25,0,1))*.2:0):0;
  lieBody(c,{angle:ang,hipLift:hip,breathe:breatheOf(b),look:b.phase===2?1:0,feet:F.feet,neck:F.neck||0});
  const [sl,sr]=shoulders(c),S=sl.clone().add(sr).multiplyScalar(.5);
  const tz=S.z+Math.cos(ang)*F.touchZ;c._touchZw=tz;c._S=S;
  const lockY=S.y+reach()+.078*D.s,touchY=F.touchY??(S.y+D.chest);
  const y=lerp(touchY,lockY,u),z=S.z+(tz-S.z)*Math.pow(1-clamp(u,0,1),1.5),tr=tremorOf(b);
  const grip=F.grip??GRIP;
  const hands=[V(grip,y+tr,z),V(-grip,y-tr,z)];const f=F.flare*DEG;
  for(const s of[1,-1])armTo(c,sideOf(s),hands[s>0?0:1],{hd:PRESS_HD,pn:V(0,0,1),pole:torsoPole(s,f,ang)});
  P.bar.position.addVectors(hands[0],hands[1]).multiplyScalar(.5);P.bar.quaternion.identity();return u;}
// lying on the bench holding the bar at given hand points (unrack / rerack)
function poseBarHands(c,P,hands,ang=0,feet,curl=1){P.setAngle&&P.setAngle(ang/DEG);lieBody(c,{angle:ang,feet});const f=52*DEG; // curl < 1: fingers still open
  for(const s of[1,-1])armTo(c,sideOf(s),hands[s>0?0:1],{hd:PRESS_HD,pn:V(0,0,1),pole:torsoPole(s,f,ang),curl});
  P.bar.position.addVectors(hands[0],hands[1]).multiplyScalar(.5);P.bar.quaternion.identity();}
function lockHands(deg=0,g=GRIP){const S=lieShoulderAt(deg);const y=S.y+Math.sqrt(Math.pow((D.arm+D.fore)*.97,2)-Math.pow(g-D.shx,2))+.078*D.s;return [V(g,y,S.z),V(-g,y,S.z)];}
function poseDB(c,F,b,u,P){ // two dumbbells: apart at the bottom, converging over the shoulders at the top
  const ang=(F.angle||0)*DEG;P.setAngle&&P.setAngle(F.angle||0);lieBody(c,{angle:ang,breathe:breatheOf(b),look:b.phase===2?1:0,feet:F.feet});
  const [sl,sr]=shoulders(c),S=sl.clone().add(sr).multiplyScalar(.5);const tz=S.z+Math.cos(ang)*F.touchZ;c._touchZw=tz;c._S=S;
  const uu=clamp(u,0,1);let xt=F.topX??.2;if(F.clank&&b.phase===3)xt=.135+.012*Math.sin(Math.PI*clamp(b.k*3,0,1));
  const xb=D.shx+(F.deep?.24:.17)*D.s,yb=(F.touchY??(S.y+D.chest))-.02;const nrm=V(0,Math.cos(ang),Math.sin(ang)),deepOff=F.deep?.13*(1-smooth(uu)):0;
  const lockY=S.y+Math.sqrt(Math.pow((D.arm+D.fore)*.97,2)-Math.pow(Math.max(0,D.shx-xt),2))+.078*D.s;
  const f=F.flare*DEG,y=lerp(yb,lockY,u),z=S.z+(tz-S.z)*Math.pow(1-uu,1.5);
  for(const s of[1,-1]){const i=s>0?0:1;const ct=V(s*lerp(xb,xt,smooth(uu)),y,z).addScaledVector(nrm,-deepOff);
    armTo(c,sideOf(s),ct,{hd:PRESS_HD,pn:V(0,0,1),pole:torsoPole(s,f,ang)});if(P.db){P.db[i].position.copy(ct);P.db[i].quaternion.identity();}}
  return u;}
function poseFly(c,F,b,u,P){ // arms sweep in a wide arc with a fixed soft bend
  P.setAngle&&P.setAngle(0);lieBody(c,{breathe:breatheOf(b)});const [sl,sr]=shoulders(c);c._S=sl.clone().add(sr).multiplyScalar(.5);const uu=clamp(u,0,1);
  const el=F.bend?lerp(92,165,smooth(uu)):(F.elbow??160);const bot=(F.bottom??10)*DEG;
  for(const s of[1,-1]){const i=s>0?0:1,S=s>0?sl:sr;const top=V(-s*.12,1,0).normalize(),lo=V(s*Math.cos(bot),-Math.sin(bot),0);
    const dir=slerpV(lo,top,uu);const ct=S.clone().addScaledVector(dir,elbowD(el)+.07*D.s).add(V(0,0,.04));
    const M0=V(0,S.y+.55,S.z+.04);const pn=M0.clone().sub(ct).normalize().add(V(-s*.45,0,0));
    armTo(c,sideOf(s),ct,{hd:dir,pn,pole:V(s*.25,-1,.1),follow:true});if(P.db){P.db[i].position.copy(ct);P.db[i].quaternion.setFromAxisAngle(V(0,1,0),Math.PI/2);}}
  return u;}
function posePressM(c,F,b,u,P){ // seated chest press: handles travel on the machine's fixed path
  const uu=clamp(u,0,1),drop=F.seatlow?.11:0;P.seat.position.y=P.seatBase-drop;
  seatBody(c,{drop,lean:F.roll?.3*smooth(uu):0,protract:F.roll?.3*uu:0,shrug:F.seatlow?.22:.03});
  const R=seatShoulderRef();const z0=R.z+.19*D.s,z1=R.z+(D.arm+D.fore)*.9+.05;
  for(const s of[1,-1]){const i=s>0?0:1;const ct=V(s*(D.shx+.06),R.y-.1*D.s,lerp(z0,z1,uu));
    armTo(c,sideOf(s),ct,{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.6,-1,-.3)});
    P.h[i].position.copy(ct);setRod(P.lever[i],V(s*.62,R.y+.62,SEAT_Z-.3),ct.clone().add(V(0,.09,0)));}
  P.stackTop.position.y=.28*uu;c._S=R;return u;}
function posePecDeck(c,F,b,u,P){ // seated fly: hands swing around a pivot above each shoulder
  const uu=clamp(u,0,1);seatBody(c,{lean:F.lean?.24:0});const R=seatShoulderRef();
  const phi=lerp((F.start??-15)*DEG,108*DEG,smooth(uu)),r=elbowD(150)+.07*D.s;
  for(const s of[1,-1]){const i=s>0?0:1;const piv=V(s*D.shx,R.y-.07,R.z);const ct=piv.clone().add(V(s*Math.cos(phi)*r,0,Math.sin(phi)*r));
    const S=wpos(c.bones[sideOf(s)+'Arm']);armTo(c,sideOf(s),ct,{hd:V().subVectors(ct,S),pn:V(-s*Math.sin(phi),0,Math.cos(phi)),pole:V(0,-1,-.25),follow:true});
    P.h[i].position.copy(ct);setRod(P.arm[i],V(piv.x,1.98,piv.z),ct.clone().add(V(0,.1,0)));}
  P.stackTop.position.y=.28*uu;c._S=R;c._phi=phi;return u;}
function poseCable(c,F,b,u,P){ // standing cable fly; high = pulleys above the head
  const uu=clamp(u,0,1);P.setPulley(F.high?2.02:.32);standBody(c,{lean:(F.lean??(F.high?14:4))*DEG,shrug:F.shrug?.25:.03});
  const [sl,sr]=shoulders(c),hipsY=wpos(c.bones.Hips).y;c._S=sl.clone().add(sr).multiplyScalar(.5);
  for(const s of[1,-1]){const i=s>0?0:1,S=s>0?sl:sr;let start,endT;
    if(F.high){start=V(s*.93,.15,-.28);endT=F.upright?V(s*.05,S.y-.17,S.z+.5):V(s*.05,hipsY+.1,S.z+.42);}
    else{start=V(s*.55,-.83,-.08);endT=F.toohigh?V(s*.06,S.y+.6,S.z+.24):V(s*.05,S.y+.04,S.z+.45);}
    const end=endT.clone().sub(S).normalize(),dir=slerpV(start,end,smooth(uu));
    const el=F.bend?lerp(98,165,smooth(uu)):F.curl?lerp(160,62,smooth(uu)):160;
    const ct=S.clone().addScaledVector(dir,elbowD(el)+.07*D.s);let pn=endT.clone().sub(ct);if(pn.length()<.06)pn=V(-s,0,0);
    armTo(c,sideOf(s),ct,{hd:dir,pn:pn.normalize().add(V(-s*.3,0,0)),pole:V(s*.3,-1,-.4),follow:true});
    P.h[i].position.copy(ct);setRod(P.cable[i],P.pulL(i),ct);}
  P.stackTop.forEach(t=>t.position.y=.3*uu);return u;}
const PU_HZ=-12.42;
// ---- feet on the mat on the balls of the feet (push-up, plank, kneeling with the toes tucked)
const BALL_Y=.035; // height of the ball-of-foot joint when it rests on the mat (the sole and the toes under it)
// the toes' own direction in the toe bone's frame (horizontal forward in the rest pose)
function toeAxis(c,side){c._toeAx=c._toeAx||{};if(c._toeAx[side])return c._toeAx[side];const tb=c.bones[side+'ToeBase'];const q=new THREE.Quaternion();
  for(let o=tb;o&&o!==c.root;o=o.parent){const n=Object.keys(c.bones).find(k=>c.bones[k]===o);q.premultiply(n?c.rest[n]:o.quaternion);}
  return c._toeAx[side]=V(0,0,1).applyQuaternion(q.invert());}
// aim the foot so the ball of the foot lands on point B, then bend the toes flat along the floor toward dir (bent at the ball, like a real foot)
function toePlant(c,side,B,dir){const b=c.bones,tb=b[side+'ToeBase'];aim(b[side+'Foot'],tb,B);
  const wq=tb.getWorldQuaternion(new THREE.Quaternion());const cur=toeAxis(c,side).clone().applyQuaternion(wq);
  const dq=new THREE.Quaternion().setFromUnitVectors(cur.normalize(),dir.clone().normalize());
  tb.quaternion.copy(tb.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(dq.multiply(wq)));tb.updateMatrixWorld(true);}
// where the ball of the foot sits for an ankle A when the foot points from the ankle toward dir (horizontal) and the ball rests on the mat
function ballOf(A,dir,ty=BALL_Y){const dy=Math.min(D.footL*.97,Math.max(0,A.y-ty));return A.clone().addScaledVector(dir.clone().setY(0).normalize(),Math.sqrt(D.footL*D.footL-dy*dy)).setY(A.y-dy);}
function posePush(c,F,b,u,P){ // push-up: hands fixed on the floor, the body pivots on the toes (rigid from toes to shoulders)
  const uu=clamp(u,0,1);const hx=D.shx+.06*D.s;const y1=.035+(D.arm+D.fore)*.97,y0=F.half?.33:.2*D.s;
  const L=D.sh.y-.05;const T=V(0,.02,PU_HZ+Math.sqrt(L*L-Math.pow(y1-.02,2)));
  const hs=D.sh.clone().sub(D.hips).length();const Ank1=T.clone().add(V(0,.12*D.s,-.05)),S1=V(0,y1,PU_HZ);
  // the body pivots on the balls of the feet (on the mat, a foot length below and toward the head from the ankles):
  // shoulders and ankles turn about them, so the feet never slide or sink while the body goes down and up
  const Bp=ballOf(Ank1,V(0,0,-1)),R=S1.distanceTo(Bp);
  const sy=lerp(y0,y1,uu);const S=V(0,sy,Bp.z-Math.sqrt(R*R-Math.pow(sy-Bp.y,2)));
  const qr=new THREE.Quaternion().setFromUnitVectors(S1.clone().sub(Bp).normalize(),S.clone().sub(Bp).normalize());
  const AnkC=Bp.clone().add(Ank1.clone().sub(Bp).applyQuaternion(qr));
  const H=S.clone().add(V().subVectors(AnkC,S).setLength(hs)).add(V(0,F.sag?-.15:F.pike?.17:0,0));
  setRoot(c,rootFromAxes(V().subVectors(S,H),V(0,-1,0)),H);resetRest(c);c.root.updateMatrixWorld(true);c._S=S;c._T=T;
  // face down with the head toward −z, so the lifter's left side is world −x; toes tucked, flat on the mat toward the head
  for(const s of[1,-1]){const side=sideOf(s),w=-s;const A=V(w*.1,AnkC.y,AnkC.z);legTo(c,side,A,V(0,1,0));toePlant(c,side,V(A.x,Bp.y,Bp.z),V(0,0,-1));
    const f=(F.flare??45)*DEG;armTo(c,side,V(w*hx,.012,PU_HZ),{hd:V(0,0,-1),pn:V(0,-1,0),pole:V(w*Math.sin(f),.08,Math.cos(f)).normalize(),curl:0});}
  return u;}
const DIP_Y=1.22,DIP_Z=-12.0;
function poseDip(c,F,b,u,P){ // dip: hands fixed on the bars, body leans forward (chest) or stays upright (triceps)
  const uu=clamp(u,0,1),lean=(F.lean??24)*DEG,hx=D.shx+.06*D.s;
  const yTop=DIP_Y+(D.arm+D.fore)*.96+.03,yBot=DIP_Y+D.fore*.92+.03-(F.deep?.16*F.deep:0)+(F.half?.12:0);
  const S=V(0,lerp(yBot,yTop,uu),DIP_Z+lerp(.12,.03,uu)*(lean/(24*DEG)));const q=rootFromAxes(V(0,Math.cos(lean),Math.sin(lean)),V(0,-Math.sin(lean),Math.cos(lean)));
  const H=S.clone().sub(D.sh.clone().sub(D.hips).applyQuaternion(q));setRoot(c,q,H);resetRest(c);clav(c,{shrug:F.shrug?.45:-.02});c.root.updateMatrixWorld(true);c._S=S;
  for(const s of[1,-1]){const side=sideOf(s);legTo(c,side,H.clone().add(V(-s*.03,-.5,-.32)),V(0,-.3,1),.3);
    const f=(F.flare??32)*DEG;armTo(c,side,V(s*hx,DIP_Y+.022,DIP_Z),{hd:V(-s*.85,-.3,.45),pn:V(-s*.4,-1,0),pole:V(s*Math.sin(f),.45,-Math.cos(f)).normalize()});}
  return u;}

// ---- equipment
function buildPressM(g){const P=seatMachine(g);const R=seatShoulderRef();P.h=[];P.lever=[];
  for(const s of[1,-1]){box(.07,1.0,.07,M.black,s*.62,R.y+.12,SEAT_Z-.3,g);P.h.push(cyl(.02,.17,M.black,0,0,0,'y',g,10));P.lever.push(rod(.022,M.steel,g));}
  box(1.31,.07,.07,M.black,0,R.y+.62,SEAT_Z-.3,g);return P;}
function buildPecDeck(g){const P=seatMachine(g);const R=seatShoulderRef();P.h=[];P.arm=[];
  box(1.0,.08,.12,M.black,0,2.0,R.z,g);box(.08,.08,.75,M.black,0,2.0,R.z-.37,g);
  for(const s of[1,-1]){P.h.push(cyl(.02,.2,M.black,0,0,0,'y',g,10));P.arm.push(rod(.022,M.steel,g));cyl(.035,.06,M.red,s*D.shx,1.98,R.z,'y',g,12);}
  return P;}
// dual cable tower (crossover); pulleys slide on the rails, attachments clip on; a free handle hangs CROSS_HANG under its pulley
const CROSS_HANG=.17;
function buildCable(g){const P={h:[],cable:[],pul:[],stackTop:[],car:[]};
  for(const s of[1,-1]){const x=s*1.05;box(.34,2.3,.34,M.black,x,1.15,CZ-.05,g);box(.06,2.1,.06,M.steel,s*.88,1.12,CZ-.05,g);
    const car=new THREE.Group();g.add(car);box(.1,.16,.1,M.red,0,0,0,car);const pul=new THREE.Group();pul.position.set(-s*.06,0,0);car.add(pul);cyl(.045,.04,M.steel,0,0,0,'x',pul,16);
    car.position.set(s*.88,2.02,CZ-.05);P.car.push(car);P.pul.push(pul);
    P.stackTop.push(stack(g,x,.1,CZ+.13,9));P.h.push(cyl(.018,.13,M.red,0,0,0,'x',g,10));P.cable.push(rod(.0045,M_cable,g));}
  box(2.44,.08,.08,M.black,0,2.3,CZ-.05,g);
  P.pulL=i=>{const p=V();P.pul[i].getWorldPosition(p);return g.worldToLocal(p);}; // pulley centre in the station frame
  P.setPulley=(y,i)=>{for(const k of i===undefined?[0,1]:[i]){P.car[k].position.y=y;P.car[k].updateMatrixWorld(true);}};
  P.rest=()=>{for(let i=0;i<2;i++){const p=V();P.pul[i].getWorldPosition(p);g.worldToLocal(p);P.h[i].position.copy(p).add(V(0,-CROSS_HANG,0));setRod(P.cable[i],p,P.h[i].position);}};
  P.tick=()=>{if(!hero)return;for(let i=0;i<2;i++){if(!hero.hold.some(h=>h.obj===P.h[i]))continue;const pw=V();P.pul[i].getWorldPosition(pw);g.worldToLocal(pw);setRod(P.cable[i],pw,P.h[i].position);}};
  P.setPulley(2.02);P.rest();return P;}
function buildMat(g){const m=box(.75,.012,2.0,M_mat,0,.006,-11.75,g,false);m.receiveShadow=true;m.userData.walkable=true;return {wheel:buildAbWheel(g)};}
function buildDip(g){const hx=D.shx+.06*D.s;const P={};
  for(const s of[1,-1]){const x=s*hx;cyl(.022,.8,M.chrome,x,DIP_Y,DIP_Z+.08,'z',g,14);
    for(const dz of[-.28,.46]){box(.05,DIP_Y,.05,M.black,x,DIP_Y/2,DIP_Z+dz,g);}box(.06,.05,.9,M.black,x,.025,DIP_Z+.08,g);}
  box(hx*2+.1,.05,.06,M.black,0,.025,DIP_Z-.28,g);return P;}
