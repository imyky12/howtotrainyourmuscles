
// ---------------------------------------------------------------- getting on and off the equipment, like a person would
// Each entry type gives: pre (canonical spot the walk ends at, facing), enter(st,e) steps, leave(st,e) steps.
// Steps are solved in the station's canonical frame (see runSeq).
const exP=(u,phase=2,k=0)=>(c)=>{EX.pose(c,FORMS.good,{phase,k},u,ST.P);};
function exFrom(u0,u1){return (c,k)=>{EX.pose(c,FORMS.good,{phase:u1>u0?2:0,k},lerp(u0,u1,smooth(k)),ST.P);};}
function rackHandsOf(P,g=GRIP){return [V(g,P.rack.y,P.rack.z),V(-g,P.rack.y,P.rack.z)];}
// sitting on a bench end holding two dumbbells on end on the thighs
function benchSitDB(c,o={}){benchSit(c,{...o,arms:'none'});const B=c.bones;
  for(const s of[1,-1]){const sd=sideOf(s);const K=wpos(B[sd+'Leg']),H=wpos(B[sd+'UpLeg']);const top=H.lerp(K,.78).add(V(-s*.02,.15*D.s,0));
    armTo(c,sd,top,{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.5,-.4,-.7)});}}
// standing, dumbbells at the sides
function standDB(c,o={}){standPose(c,{...o,arms:'none'});const T=torsoAxes(c);for(const s of[1,-1]){const ua=V(0,-1,0).addScaledVector(T.L,s*.18);armDir(c,sideOf(s),ua,ua,T.L.clone().multiplyScalar(-s),{hd:V(0,-1,0)});}}
// machine seat, hands resting on the thighs
function seatRest(c){seatBody(c,{});for(const s of[1,-1]){const sd=sideOf(s);const K=wpos(c.bones[sd+'Leg']),H=wpos(c.bones[sd+'UpLeg']);armTo(c,sd,H.lerp(K,.65).add(V(0,.06,0)),{hd:V(0,-.3,1),pn:V(0,-1,0),pole:V(s*.4,-.6,-.6),curl:.5});}}
const ENTRY={
  barBench:{pre:[0,-10.45],face:Math.PI,
    enter:(st,e)=>{const P=st.P,ang=(e.forms.good.angle||0)*DEG,feet=e.forms.good.feet,gr=e.forms.good.grip??GRIP;return [
      {turn:0},{walk:[0,-11.08],back:true,d:1.3},
      {d:.9,pose:c=>benchSit(c,{lean:4})},
      {d:1.4,pose:c=>poseBarHands(c,P,rackHandsOf(P,gr),ang,feet)},
      {call:()=>sayFor(e.coachIn||'Lift-off on three. One, two, three.',2.6)},
      {d:1.2,anim:(c,k)=>{const R=rackHandsOf(P,gr),L=lockHands(ang/DEG,gr);const up=Math.sin(Math.PI*Math.min(1,k*1.6))*.03;poseBarHands(c,P,R.map((h,i)=>h.clone().lerp(L[i],ease(k)).add(V(0,up,0))),ang,feet);}}];},
    leave:(st,e)=>{const P=st.P,ang=(e.forms.good.angle||0)*DEG,feet=e.forms.good.feet,gr=e.forms.good.grip??GRIP;return [
      {d:.7,pose:c=>poseBarHands(c,P,lockHands(ang/DEG,gr),ang,feet)},
      {d:1.3,anim:(c,k)=>{const R=rackHandsOf(P,gr),L=lockHands(ang/DEG,gr);const kk=ease(k);const h=L.map((p,i)=>p.clone().lerp(R[i],Math.min(1,kk*1.15)).add(V(0,kk<.85?.02*Math.sin(Math.PI*kk/.85):0,0)));poseBarHands(c,P,h,ang,feet);}},
      {d:1.2,pose:c=>{benchSit(c,{lean:4});P.bar.position.copy(P.rack);}},
      {d:1.0,pose:c=>standPose(c,{z:-11.08,h:0})},
      {walk:[0,-10.45],d:1.0}];}},
  dbLie:{pre:[0,-10.45],face:Math.PI,
    enter:(st,e)=>{const top=e.fam==='fly'?1:1;return [
      {turn:0},{walk:[0,-11.08],back:true,d:1.3},{call:c=>{c.carry=null;}},
      {d:1.0,pose:c=>benchSitDB(c,{lean:2})},
      {call:()=>sayFor('Dumbbells on your knees. Kick them up as you lie back.',3)},
      {d:1.3,pose:c=>poseDB(c,{...FORMS.good,flare:52,deep:0},{phase:1,k:0},0,ST.P)},
      {d:1.0,anim:(c,k)=>poseDB(c,{...FORMS.good,flare:52,deep:0},{phase:2,k},smooth(k),ST.P)},
      ...(e.pose===poseFly?[{d:.6,pose:exP(1,3)}]:[])];},
    leave:(st,e)=>[
      {d:.8,pose:c=>poseDB(c,{...FORMS.good,flare:52,deep:0},{phase:1,k:0},0,ST.P)},
      {d:1.3,pose:c=>benchSitDB(c,{lean:2})},
      {d:1.0,pose:c=>standDB(c,{z:-11.08})},
      {walk:[0,-10.45],d:1.0},{call:c=>{c.carry='db';}}]},
  machine:{pre:[0,-10.8],face:Math.PI,
    enter:(st,e)=>[{turn:0},{walk:[0,-11.62],back:true,d:1.4},{d:1.0,pose:seatRest},{d:.8,pose:exP(0,1)},{d:1.0,anim:exFrom(0,1)}],
    leave:(st,e)=>[{d:.8,pose:exP(0,1)},{d:.7,pose:seatRest},{d:1.0,pose:c=>standPose(c,{z:-11.62})},{walk:[0,-10.8],d:1.1}]},
  dip:{pre:[0,-10.8],face:Math.PI,
    enter:(st,e)=>[{turn:0},{walk:[0,-11.95],back:true,d:1.8},{d:.6,pose:c=>{standPose(c,{z:-11.95,arms:'none'});dipHands(c);}},{d:.7,pose:exP(1,3)}],
    leave:(st,e)=>[{d:.8,pose:c=>{standPose(c,{z:-11.95,arms:'none'});dipHands(c);}},{d:.5,pose:c=>standPose(c,{z:-11.95})},{walk:[0,-10.8],d:1.7}]},
};
function dipHands(c){const hx=D.shx+.06*D.s;for(const s of[1,-1])armTo(c,sideOf(s),V(s*hx,DIP_Y+.022,DIP_Z),{hd:V(-s*.85,-.3,.45),pn:V(-s*.4,-1,0),pole:V(s*.3,0,-1)});}
// kneeling upright facing h (canonical), knees at z
function kneelPose(c,o={}){const h=o.h??Math.PI,z=o.z??-11.6,qh=qY(h);const hipY=D.thigh+.07;
  setRoot(c,qh.clone().multiply(qX((o.lean||0)*DEG)),V(0,hipY,z).add(V(0,0,o.back||0).applyQuaternion(qh)));resetRest(c);c.root.updateMatrixWorld(true);
  const back=V(0,0,-1).applyQuaternion(qh);
  for(const s of[1,-1]){const sd=sideOf(s);const lat=V(s,0,0).applyQuaternion(qh);const K=V(0,.07,z).addScaledVector(lat,.12);const A=K.clone().addScaledVector(back,D.shin*.98).setY(.09);
    legTo(c,sd,A,V(0,0,1).applyQuaternion(qh).add(V(0,.3,0)));footTo(c,sd,A.clone().addScaledVector(back,.1).setY(.02));}
  if(o.arms!=='none')armsHang(c);}
// on hands and knees, head toward −z, hands where the push-up hands go
function allFours(c,o={}){const hx=D.shx+.06*D.s;const S=V(0,.035+(D.arm+D.fore)*.93,PU_HZ-.02);const hs=D.sh.clone().sub(D.hips).length();
  const H=S.clone().add(V(0,0,hs)).setY(D.thigh+.07);const dir=V().subVectors(S,H).normalize();setRoot(c,rootFromAxes(dir,V(0,-1,0)),H);resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const side=sideOf(s),w=-s;const K=V(w*.12,.07,H.z);const A=K.clone().add(V(0,.02,D.shin*.98));legTo(c,side,A,V(0,-1,-.2));footTo(c,side,A.clone().add(V(0,-.06,.1)));
    armTo(c,side,V(w*hx,.012,PU_HZ),{hd:V(0,0,-1),pn:V(0,-1,0),pole:V(w*.5,.1,1).normalize(),curl:0});}}
ENTRY.mat={pre:[0,-10.55],face:Math.PI,
  enter:(st,e)=>[{walk:[0,-10.9],d:.6},{d:1.0,pose:c=>kneelPose(c,{z:-11.95+(e.kneelDz||0)})},{d:1.0,pose:allFours},{d:1.1,pose:exP(1,3)}],
  leave:(st,e)=>[{d:1.0,pose:allFours},{d:1.0,pose:c=>kneelPose(c,{z:-11.95})},{d:1.1,pose:c=>standPose(c,{z:-11.3,h:Math.PI})},{walk:[0,-10.55],d:1.0}]};
// cable crossover: set each pulley by hand, take each handle, step into the stance
function cableReach(c,P,i,x,face,frac){const s=i===0?1:-1;standPose(c,{x,z:-11.62,h:face,arms:'none'});armsHang(c,0,-s*(face>0?1:-1)*0+(-s));
  const car=V();P.car[i].getWorldPosition(car);ST.g.worldToLocal(car);const side=i===0?'Left':'Right';
  const S=wpos(c.bones[side+'Arm']);const tgt=S.clone().lerp(car.add(V(-s*.06,0,0)),frac);armTo(c,side,tgt,{hd:V(s,0,0),pn:V(0,0,-1),pole:V(0,-1,.2)});}
function cableAdjust(i,x,face){return [
  {d:.7,pose:c=>cableReach(c,ST.P,i,x,face,1)},
  {d:1.2,anim:(c,k)=>{const P=ST.P;const y0=P.car[i]._y0??P.car[i].position.y;P.car[i]._y0=y0;P.setPulley(lerp(y0,P._target,smooth(k)),i);P.rest();cableReach(c,P,i,x,face,1);if(k>=1)P.car[i]._y0=undefined;}},
  {d:.6,pose:c=>{const P=ST.P;const h=V();P.h[i].getWorldPosition(h);ST.g.worldToLocal(h);standPose(c,{x,z:-11.62,h:face,arms:'none'});armsHang(c,0,i===0?-1:1);
    const side=i===0?'Left':'Right';armTo(c,side,h,{hd:V(0,-1,0),pn:V(i===0?-1:1,0,0),pole:V(0,-1,.3)});}},
  {call:c=>{grab(c,ST.P.h[i],i===0?'Left':'Right');}}];}
ENTRY.cable={pre:[0,-10.6],face:Math.PI,
  enter:(st,e)=>{st.P._target=e.forms.good.high?2.02:.32;return [
    {walk:[.42,-11.62],d:1.2},{turn:Math.PI/2},...cableAdjust(0,.42,Math.PI/2),
    {turn:Math.PI},{walk:[-.42,-11.62],d:1.4},{turn:-Math.PI/2},...cableAdjust(1,-.42,-Math.PI/2),
    {turn:0},{call:c=>{c.hold=[];}},{d:1.2,pose:exP(0,1)},{d:1.0,anim:exFrom(0,1)}];},
  leave:(st,e)=>[{d:1.0,pose:exP(0,1)},
    {d:.8,pose:c=>standPose(c,{z:-11.75}),props:(c,k)=>{const P=st.P;for(let i=0;i<2;i++){const p=V();P.pul[i].getWorldPosition(p);st.g.worldToLocal(p);p.y-=.08;P.h[i].position.lerp(p,k);setRod(P.cable[i],p.add(V(0,.08,0)),P.h[i].position);}}},
    {call:()=>st.P.rest()},{walk:[0,-10.6],d:1.2}]};
