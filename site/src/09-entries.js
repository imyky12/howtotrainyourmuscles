
// ---------------------------------------------------------------- getting on and off the equipment, like a person would
// Each entry type gives: pre (canonical spot the walk ends at, facing), enter(st,e) steps, leave(st,e) steps.
// Steps are solved in the station's canonical frame (see runSeq).
const exP=(u,phase=2,k=0)=>(c)=>{EX.pose(c,FORMS.good,{phase,k},u,ST.P);};
// leaving mid-rep: settle into the right form at the rep position on screen (found by matching the hands and hips, since the
// rep clock is reset when leaving), then play the rep on to u1, so hands and props stay on the exercise's own path
function repUOnScreen(c){const st=ST,P=st.P;const pts=()=>['LeftHand','RightHand','Hips'].map(n=>wpos(c.bones[n]));const cur=pts();
  const keep=snapshot(c),props=propState(P);let best=1,bd=1e9;
  for(let i=0;i<=20;i++){const u=i/20;EX.pose(c,FORMS.good,{phase:2,k:0},u,P);frame(c,st);const d=pts().reduce((m,p,j)=>m+p.distanceTo(cur[j]),0);if(d<bd){bd=d;best=u;}}
  applySnap(c,keep);setPropState(props);return best;}
function exTo(u1,d=1.0){const m={u0:null};
  return [{d:.35,pose:c=>{if(m.u0===null)m.u0=repUOnScreen(c);exP(m.u0,1)(c);}},
    {d,anim:(c,k)=>exFrom(m.u0,u1)(c,k)}];}
function exFrom(u0,u1){return (c,k)=>{EX.pose(c,FORMS.good,{phase:u1>u0?2:0,k},lerp(u0,u1,smooth(k)),ST.P);};}
function rackHandsOf(P,g=GRIP){return [V(g,P.rack.y,P.rack.z),V(-g,P.rack.y,P.rack.z)];}
// sitting on a bench end holding two dumbbells on end on the thighs
function benchSitDB(c,o={}){benchSit(c,{...o,arms:'none'});const B=c.bones;
  for(const s of[1,-1]){const sd=sideOf(s);const K=wpos(B[sd+'Leg']),H=wpos(B[sd+'UpLeg']);const top=H.lerp(K,.78).add(V(-s*.02,.15*D.s,0));
    armTo(c,sd,top,{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.5,-.4,-.7)});}}
// standing, dumbbells at the sides
function standDB(c,o={}){standPose(c,{...o,arms:'none'});dbHangArms(c,Math.sin(c._ph||0)*.08);}
// machine seat, hands resting on the thighs
function seatRest(c){seatBody(c,{});for(const s of[1,-1]){const sd=sideOf(s);const K=wpos(c.bones[sd+'Leg']),H=wpos(c.bones[sd+'UpLeg']);armTo(c,sd,H.lerp(K,.65).add(V(0,.06,0)),{hd:V(0,-.3,1),pn:V(0,-1,0),pole:V(s*.4,-.6,-.6),curl:.5});}}
// after a blended pose step: re-solve the legs to planted ankles (canonical [x,z] per side), so the feet never slide into
// or dip through the floor while the hips move down to a seat or up from it
function pinFeet(st,feet,o={}){let from=null,lastK=1;return (c,k)=>{const h=o.h||0;const fwd=V(Math.sin(h),0,Math.cos(h)).applyQuaternion(st.q);
  if(!from||k<lastK){from=[wpos(c.bones.LeftFoot),wpos(c.bones.RightFoot)];from.toe=['Left','Right'].map(sd=>wpos(c.bones[sd+'ToeBase']).sub(wpos(c.bones[sd+'Foot'])).normalize());}lastK=k;
  for(const s of[1,-1]){const f=feet[s>0?0:1];const T=toW(st,V(f[0],o.y??D.ankY,f[1]));const F0=from[s>0?0:1];const dist=F0.distanceTo(T);
    // a foot that is not yet where it will stand takes a small step there (lifted a little in the middle)
    const A=dist<.02?T:F0.clone().lerp(T,smooth(k)).add(V(0,Math.sin(Math.PI*k)*Math.min(.08,dist*.5),0));
    const pole=fwd.clone().add(V(0,.25,0)).addScaledVector(V(s,0,0).applyQuaternion(st.q),o.out||0);legTo(c,sideOf(s),A,pole);
    // the foot turns from the way it pointed when the step began (a walk can end with the toe still pointing down) to flat
    const td=V().addScaledVector(fwd,.15).setY(-D.ankY*.65);const tl=td.length();footTo(c,sideOf(s),A.clone().add(from.toe[s>0?0:1].clone().lerp(td.normalize(),smooth(Math.min(1,k*1.6))).normalize().multiplyScalar(tl)));}
  c.root.updateMatrixWorld(true);holdUpdate(c);};}
// a blended pose step whose feet travel in a small arc from where they were to where the pose puts them (lifted, never
// dragged through the floor); the foot keeps its blended orientation. o.sides limits it to one foot.
function liftFeet(st,poseFn,o={}){let from=null,to=null,lastK=1;const sides=o.sides||['Left','Right'];
  return {pose:poseFn,props:(c,k)=>{
    if(!from||k<lastK){from={};to={};const bend=(o,sd)=>{const H=wpos(c.bones[sd+'UpLeg']),A=wpos(c.bones[sd+'Foot']);o[sd]=A;o[sd+'K']=wpos(c.bones[sd+'Leg']).sub(H.lerp(A,.5));};for(const sd of sides)bend(from,sd);const keep=snapshot(c);poseFn(c);frame(c,st);for(const sd of sides)bend(to,sd);applySnap(c,keep);}
    lastK=k;const kk=smooth(k);
    for(const sd of sides){const F0=from[sd],T=to[sd];const dist=F0.distanceTo(T);if(dist<.02)continue;
      const A=F0.clone().lerp(T,kk).add(V(0,Math.sin(Math.PI*k)*Math.min(o.lift??.1,dist*.6),0));
      const fb=c.bones[sd+'Foot'];const fq=fb.getWorldQuaternion(new THREE.Quaternion());const pole=from[sd+'K'].clone().lerp(to[sd+'K'],kk);if(pole.length()<.03)pole.copy(pelvisAxes(c).F).add(V(0,.3,0));legTo(c,sd,A,pole.normalize());
      fb.quaternion.copy(fb.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(fq));fb.updateMatrixWorld(true);}
    holdUpdate(c);}};}
// sitting on a bench with a heading: hips at (x,z), feet on the floor at given canonical spots, hands on the thighs
function sitAt(c,o){const h=o.h||0,qh=qY(h);setRoot(c,qh.clone().multiply(qX((o.lean??6)*DEG)),V(o.x||0,o.y??BENCH_TOP+D.back*.62,o.z));resetRest(c);clav(c,{shrug:.03});c.root.updateMatrixWorld(true);
  const fwd=V(Math.sin(h),0,Math.cos(h));
  for(const s of[1,-1]){const sd=sideOf(s);const f=o.feet[s>0?0:1];const A=V(f[0],o.fy??D.ankY,f[1]);const lat=V(s,0,0).applyQuaternion(qh);
    legTo(c,sd,A,fwd.clone().add(V(0,.4,0)).addScaledVector(lat,o.out||0));if(o.fy===undefined)footTo(c,sd,A.clone().addScaledVector(fwd,.15).setY(.03));}
  if(o.arms!=='none'){for(const s of[1,-1]){const sd=sideOf(s);const K=wpos(c.bones[sd+'Leg']),H=wpos(c.bones[sd+'UpLeg']);const T=torsoAxes(c);
    armTo(c,sd,H.lerp(K,.7).add(V(0,.06,0)),{hd:T.F.clone().addScaledVector(T.U,-.3),pn:V(0,-1,0),pole:T.L.clone().multiplyScalar(s*.4).addScaledVector(T.U,-.6).addScaledVector(T.F,-.6),curl:.5});}}}
// lying on the bench with the hands resting on the hips (between sitting up and reaching for the bar)
function lieRest(c,ang,feet,P){P&&P.setAngle&&P.setAngle(ang/DEG);lieBody(c,{angle:ang,feet});const T=torsoAxes(c);
  for(const s of[1,-1]){const sd=sideOf(s);const H=wpos(c.bones[sd+'UpLeg']);
    armTo(c,sd,H.addScaledVector(T.F,.1).addScaledVector(T.L,-s*.02),{hd:T.L.clone().multiplyScalar(-s).addScaledVector(T.U,-.35),pn:T.F.clone().negate(),pole:V(s*.6,-.2,.2),curl:.4});}}
const BENCH_FEET=[[.27,-11.33],[-.27,-11.33]];
const SEAT_FEET=[[.17,SEAT_Z+.46],[-.17,SEAT_Z+.46]];
const DEC_Z=-11.92; // where the hips sit on the decline seat: behind the knee pad, which covers the front of the seat
const DEC_SIDE_FEET=[[.4,DEC_Z-.15],[.4,DEC_Z+.15]];
// sitting on the decline seat facing the foot end with the knees pulled up and the feet lifted over the knee pad
function tuckSit(c){setRoot(c,qX(-8*DEG),V(0,BENCH_TOP+D.back*.62,DEC_Z));resetRest(c);clav(c,{shrug:.03});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);const A=V(s*.11,.78,-11.42);legTo(c,sd,A,V(s*.1,1,.3));footTo(c,sd,A.clone().add(V(0,-.06,.13)));
    const K=wpos(c.bones[sd+'Leg']);armTo(c,sd,K.add(V(s*.04,.04,-.06)),{hd:V(0,-.4,1),pn:V(0,-1,0),pole:V(s*.6,-.3,-.6),curl:.6});}}
// sitting on the decline seat with the thighs over the knee pad and the feet hooked under the rollers
function legsOut(c){setRoot(c,qX(-12*DEG),V(0,BENCH_TOP+D.back*.62,DEC_Z));resetRest(c);clav(c,{shrug:.03});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);legTo(c,sd,V(s*.12,.36,DEC_Z+.64),V(s*.1,1,.3),.25);
    const H=wpos(c.bones[sd+'UpLeg']);armTo(c,sd,H.add(V(s*.02,.1,.2)),{hd:V(0,-.3,1),pn:V(0,-1,0),pole:V(s*.6,-.3,-.6),curl:.5});}}
// a blended pose step whose prop moves with the hands: obj() follows the midpoint of the hands every frame (keeping the offset the
// target pose has), not the step's target; after(c) updates whatever hangs on it (cable, stack)
function carryWith(d,poseFn,objFn,after){const mid=c=>wpos(c.bones.LeftHand).add(wpos(c.bones.RightHand)).multiplyScalar(.5);
  return {d,pose:c=>{poseFn(c);c._pOff=objFn().position.clone().sub(mid(c));},
    props:c=>{const o=objFn();o.position.copy(toC(c.act_.st,mid(c)).add(c._pOff));o.quaternion.identity();after&&after(c);}};}
// the bench bar carried by the hands on the way back to the hooks
function barCarry(P,handsFn,ang,feet,d){return carryWith(d,c=>poseBarHands(c,P,handsFn(),ang,feet),()=>P.bar);}
const ENTRY={
  barBench:{pre:[0,-10.45],face:0,
    enter:(st,e)=>{const P=st.P,ang=(e.forms.good.angle||0)*DEG,feet=e.forms.good.feet,gr=e.forms.good.grip??GRIP;return [
      {walk:[0,-11.1],back:true,d:1.2,soft:1}, // stop short of the bench, then step back to it with the feet apart
      {d:.8,anim:settle(c=>standPose(c,{z:-11.3,stance:.27,toe:14}),{step:1,bend:1})},
      {d:.9,pose:c=>benchSit(c,{lean:4,feetX:.27,feetZ:.4}),props:pinFeet(st,BENCH_FEET,{out:.3})},
      {d:1.1,pose:c=>lieRest(c,ang,feet,P)},
      {d:.9,pose:c=>poseBarHands(c,P,rackHandsOf(P,gr),ang,feet)},
      {call:()=>sayFor(e.coachIn||'Lift-off on three. One, two, three.',2.6)},
      {d:1.2,anim:(c,k)=>{const R=rackHandsOf(P,gr),L=lockHands(ang/DEG,gr);const up=Math.sin(Math.PI*Math.min(1,k*1.6))*.03;poseBarHands(c,P,R.map((h,i)=>h.clone().lerp(L[i],ease(k)).add(V(0,up,0))),ang,feet);}}];},
    leave:(st,e)=>{const P=st.P,ang=(e.forms.good.angle||0)*DEG,feet=e.forms.good.feet,gr=e.forms.good.grip??GRIP;return [
      barCarry(P,()=>lockHands(ang/DEG,gr),ang,feet,.7),
      {d:1.3,anim:(c,k)=>{const R=rackHandsOf(P,gr),L=lockHands(ang/DEG,gr);const kk=ease(k);const h=L.map((p,i)=>p.clone().lerp(R[i],Math.min(1,kk*1.15)).add(V(0,kk<.85?.02*Math.sin(Math.PI*kk/.85):0,0)));poseBarHands(c,P,h,ang,feet);}},
      {d:.9,pose:c=>{lieRest(c,ang,feet,P);P.bar.position.copy(P.rack);}},
      {d:1.1,pose:c=>benchSit(c,{lean:4,feetX:.27,feetZ:.4})},
      {d:.9,pose:c=>standPose(c,{z:-11.3,stance:.27,toe:14}),props:pinFeet(st,BENCH_FEET,{out:.3})},
      {d:.5,pose:c=>standPose(c,{z:-11.3})},
      {walk:[0,-10.45],d:1.0}];}},
  // decline bench: the rollers block the foot end, so get on from the side: sit sideways, swing the legs over the knee pad
  // with the feet tucked, hook the feet under the rollers, lie back, reach for the bar
  barBenchDecline:{pre:[.95,DEC_Z],face:Math.PI/2,
    enter:(st,e)=>{const P=st.P,ang=(e.forms.good.angle||0)*DEG,gr=e.forms.good.grip??GRIP;return [
      {d:.8,anim:settle(c=>standPose(c,{x:.68,z:DEC_Z,h:Math.PI/2}),{step:1,bend:1})},{d:.8,anim:settle(c=>standPose(c,{x:.42,z:DEC_Z,h:Math.PI/2}),{step:1,bend:1})}, // two short steps back to the seat
      {d:1.0,pose:c=>sitAt(c,{h:Math.PI/2,z:DEC_Z,feet:DEC_SIDE_FEET,out:.2}),props:pinFeet(st,DEC_SIDE_FEET,{h:Math.PI/2,out:.2})},
      {d:1.3,pose:c=>tuckSit(c)},
      {d:1.0,pose:c=>legsOut(c)},
      {d:1.1,pose:c=>lieRest(c,ang,'rollers',P)},
      {d:.9,pose:c=>poseBarHands(c,P,rackHandsOf(P,gr),ang,'rollers')},
      {call:()=>sayFor(e.coachIn||'Lift-off on three. One, two, three.',2.6)},
      {d:1.2,anim:(c,k)=>{const R=rackHandsOf(P,gr),L=lockHands(ang/DEG,gr);const up=Math.sin(Math.PI*Math.min(1,k*1.6))*.03;poseBarHands(c,P,R.map((h,i)=>h.clone().lerp(L[i],ease(k)).add(V(0,up,0))),ang,'rollers');}}];},
    leave:(st,e)=>{const P=st.P,ang=(e.forms.good.angle||0)*DEG,gr=e.forms.good.grip??GRIP;return [
      barCarry(P,()=>lockHands(ang/DEG,gr),ang,'rollers',.7),
      {d:1.3,anim:(c,k)=>{const R=rackHandsOf(P,gr),L=lockHands(ang/DEG,gr);const kk=ease(k);const h=L.map((p,i)=>p.clone().lerp(R[i],Math.min(1,kk*1.15)).add(V(0,kk<.85?.02*Math.sin(Math.PI*kk/.85):0,0)));poseBarHands(c,P,h,ang,'rollers');}},
      {d:.9,pose:c=>{lieRest(c,ang,'rollers',P);P.bar.position.copy(P.rack);}},
      {d:1.1,pose:c=>legsOut(c)},
      {d:1.3,pose:c=>tuckSit(c)},
      {d:1.2,pose:c=>sitAt(c,{h:Math.PI/2,z:DEC_Z,feet:DEC_SIDE_FEET,out:.2})},
      {d:.9,pose:c=>standPose(c,{x:.42,z:DEC_Z,h:Math.PI/2}),props:pinFeet(st,DEC_SIDE_FEET,{h:Math.PI/2,out:.2})},
      {walk:[.95,DEC_Z],d:1.0}];}},
  dbLie:{pre:[0,-10.45],face:0,
    enter:(st,e)=>{const top=e.fam==='fly'?1:1;return [
      {walk:[0,-11.1],back:true,d:1.2,soft:1},{call:c=>{c.carry=null;}},
      {d:.8,anim:settle(c=>standDB(c,{z:-11.3,stance:.27,toe:14}),{step:1,bend:1})},
      {d:1.0,pose:c=>benchSitDB(c,{lean:2,feetX:.27,feetZ:.4}),props:pinFeet(st,BENCH_FEET,{out:.3})},
      {call:()=>sayFor('Dumbbells on your knees. Kick them up as you lie back.',3)},
      {d:1.3,pose:c=>poseDB(c,{...FORMS.good,flare:52,deep:0},{phase:1,k:0},0,ST.P)},
      {d:1.0,anim:(c,k)=>poseDB(c,{...FORMS.good,flare:52,deep:0},{phase:2,k},smooth(k),ST.P)},
      ...(e.pose===poseFly?[{d:.6,pose:exP(1,3)}]:[])];},
    leave:(st,e)=>[
      {d:.8,pose:c=>poseDB(c,{...FORMS.good,flare:52,deep:0},{phase:1,k:0},0,ST.P)},
      {d:1.3,pose:c=>benchSitDB(c,{lean:2,feetX:.27,feetZ:.4})},
      {d:1.0,pose:c=>standDB(c,{z:-11.3,stance:.27,toe:14}),props:pinFeet(st,BENCH_FEET,{out:.3})},
      {d:.5,pose:c=>standDB(c,{z:-11.3})},
      {call:c=>{c.carry='db';}},{walk:[0,-10.45],d:1.0}]}, // carried from the first step (the arms keep the standing hang)
  machine:{pre:[0,-10.8],face:0,
    enter:(st,e)=>[{walk:[0,-11.5],back:true,d:1.2,soft:1},{d:.7,anim:settle(c=>standPose(c,{z:-11.72,stance:.17}),{step:1,bend:1})}, // the last short step back with the feet apart (clear of the seat post)
      {d:1.0,pose:seatRest,props:pinFeet(st,SEAT_FEET,{out:.15})},{d:.8,pose:exP(0,1)},{d:1.0,anim:exFrom(0,1)}],
    leave:(st,e)=>[{d:.8,pose:exP(0,1)},{d:.7,pose:seatRest},{d:1.0,pose:c=>standPose(c,{z:-11.72,stance:.17}),props:pinFeet(st,SEAT_FEET,{out:.15})},
      {d:.4,pose:c=>standPose(c,{z:-11.72})},{walk:[0,-10.8],d:1.1}]},
  // dip: back in between the bars with the arms held out (clear of the handles), hands over and onto the handles, press up
  dip:{pre:[0,-10.8],face:0,
    enter:(st,e)=>[{walk:[0,-11.2],back:true,d:1.3,soft:1},
      {d:.5,anim:settle(c=>standPose(c,{z:-11.2,armOut:.6}))},
      {d:.9,anim:settle(c=>standPose(c,{z:-11.58,armOut:.6}),{step:1,bend:1})},
      {d:.9,anim:settle(c=>standPose(c,{z:-11.95,armOut:.6}),{step:1,bend:1})},
      {d:.6,anim:settle(dipHandsOver)},
      {d:.5,anim:settle(c=>{standPose(c,{z:-11.95,arms:'none'});dipHands(c,undefined,DIP_STAND_POLE);})},
      {d:.8,anim:settle(exP(1,3))}],
    leave:(st,e)=>[{d:.9,anim:settle(c=>{standPose(c,{z:-11.95,arms:'none'});dipHands(c,undefined,DIP_STAND_POLE);})},
      {d:.5,anim:settle(dipHandsOver)},
      {d:.5,anim:settle(c=>standPose(c,{z:-11.95,armOut:.6}))},
      {d:.9,anim:settle(c=>standPose(c,{z:-11.58,armOut:.6}),{step:1,bend:1})},
      {d:.9,anim:settle(c=>standPose(c,{z:-11.2,armOut:.6}),{step:1,bend:1})},
      {d:.4,anim:settle(c=>standPose(c,{z:-11.2}))},
      {walk:[0,-10.8],d:1.1}]},
};
// hands on the dip handles; hz = where the hips are (the hands sit on the handles a little in front, sliding to the dip spot)
function dipHands(c,hz,pole){const hx=D.shx+.06*D.s;const z=hz===undefined?DIP_Z:clamp(hz-.04,DIP_Z,-11.56);
  for(const s of[1,-1])armTo(c,sideOf(s),V(s*hx,DIP_Y+.022,z),{hd:V(-s*.85,-.3,.45),pn:V(-s*.4,-1,0),pole:pole?V(s*pole[0],pole[1],pole[2]):V(s*.3,0,-1)});}
const DIP_STAND_POLE=[.75,.1,-.65]; // standing between the bars, hands on them: elbows bent back and out, clear of the handles
// a few short steps on the spot's floor from hips z0 to z1 (facing canonical h), with the arms placed by arms(c,hipsZ):
// one foot lifts and lands, then the other; used where the walk clip would swing the arms into equipment
function stepPoses(z0,z1,h,arms,o={}){const dz=z1-z0,st=o.stance??.11*D.s,n=Math.max(1,Math.ceil(Math.abs(dz)/.3)),out=[];const dd=(o.d??1.3)/(n*4);
  let L=z0,R=z0,hip=z0;for(let i=0;i<n;i++){const tgt=z0+dz*(i+1)/n,hip0=hip;const lead=i%2===0;let j=0;
    for(const [moveL,ph] of[[lead,0],[lead,1],[!lead,0],[!lead,1]]){j++;const from=moveL?L:R;const zf=ph===0?(from+tgt)/2:tgt;if(moveL)L=zf;else R=zf;
      hip=hip0+(tgt-hip0)*j/4;const Lz=L,Rz=R,hh=hip,hl=moveL&&ph===0?.09:0,hr=!moveL&&ph===0?.09:0;
      out.push({d:dd,lin:true,pose:c=>{standPose(c,{z:hh,h,arms:'none',feet:[[st,Lz-hh],[-st,Rz-hh]],heel:[hl,hr]});arms(c,hh);}});}}
  return out;}
// kneeling upright facing h (canonical), knees at z
function kneelPose(c,o={}){const h=o.h??Math.PI,z=o.z??-11.6,qh=qY(h);const hipY=D.thigh+.07+(o.one?.06:0);
  setRoot(c,qh.clone().multiply(qX((o.lean||0)*DEG)),V(0,hipY,z).add(V(0,0,o.back||0).applyQuaternion(qh)));resetRest(c);c.root.updateMatrixWorld(true);
  const back=V(0,0,-1).applyQuaternion(qh),fwd=back.clone().negate();
  for(const s of[1,-1]){const sd=sideOf(s);const lat=V(s,0,0).applyQuaternion(qh);
    if(o.one&&sd!==o.one){const A=V(0,D.ankY,z).addScaledVector(lat,.14).addScaledVector(fwd,.42);legTo(c,sd,A,fwd.clone().add(V(0,.6,0)));footTo(c,sd,A.clone().addScaledVector(fwd,.15).setY(.03));continue;}
    const K=V(0,.07,z).addScaledVector(lat,.12);
    if(o.tuck){const A=tuckAnkle(K,back);legTo(c,sd,A,V(0,0,1).applyQuaternion(qh).add(V(0,.3,0)));toePlant(c,sd,ballOf(A,fwd),fwd);continue;} // toes tucked under, ready to push up
    const A=K.clone().addScaledVector(back,D.shin*.98).setY(.09);
    legTo(c,sd,A,V(0,0,1).applyQuaternion(qh).add(V(0,.3,0)));footTo(c,sd,A.clone().addScaledVector(back,.19).setY(.03));}
  if(o.arms!=='none')armsHang(c);}
// on hands and knees, head toward −z, hands where the push-up hands go
function allFours(c,o={}){const hx=D.shx+.06*D.s;const S=V(0,.035+(D.arm+D.fore)*.93,PU_HZ-.02);const hs=D.sh.clone().sub(D.hips).length();
  const H=S.clone().add(V(0,0,hs)).setY(D.thigh+.07);const dir=V().subVectors(S,H).normalize();setRoot(c,rootFromAxes(dir,V(0,-1,0)),H);resetRest(c);c.root.updateMatrixWorld(true);
  const L=D.sh.y-.05;const Tz=PU_HZ+Math.sqrt(L*L-Math.pow(.035+(D.arm+D.fore)*.97-.02,2));
  for(const s of[1,-1]){const side=sideOf(s),w=-s;
    if(o.ext==='Both'||o.ext===side){const A=V(w*.1,.12*D.s+(o.tuck?.02:0),Tz-.05);legTo(c,side,A,V(0,1,0));if(o.tuck)toePlant(c,side,ballOf(A,V(0,0,-1)),V(0,0,-1));else aim(c.bones[side+'Foot'],c.bones[side+'ToeBase'],V(A.x,.02,Tz));}
    else if(o.tuck){const K=V(w*.12,.07,H.z);const A=tuckAnkle(K,V(0,0,1));legTo(c,side,A,V(0,-1,-.2));toePlant(c,side,ballOf(A,V(0,0,-1)),V(0,0,-1));}
    else{const K=V(w*.12,.07,H.z);const A=K.clone().add(V(0,.02,D.shin*.98));legTo(c,side,A,V(0,-1,-.2));footTo(c,side,A.clone().add(V(0,-.06,.19)));}
    armTo(c,side,V(w*hx,.012,PU_HZ),{hd:V(0,0,-1),pn:V(0,-1,0),pole:V(w*.5,.1,1).normalize(),curl:0});}}
// kneeling with the toes tucked: the ankle up a foot length above the mat, behind the knee K (on the mat) along `back`
function tuckAnkle(K,back){const ay=BALL_Y+D.footL*.93;return K.clone().addScaledVector(back,Math.sqrt(Math.max(0,D.shin*D.shin-Math.pow(ay-K.y,2)))).setY(ay);}
// where the knees go on all fours (hips over the knees, hands under the shoulders on the push-up spot)
function fourKneeZ(){return PU_HZ-.02+D.sh.clone().sub(D.hips).length();}
// push-up: walk onto the mat, step one foot forward, go down on one knee then both (toes tucked under), hands to the mat,
// then step the legs back one at a time into the plank; getting up is the same backwards, then turn and walk off
ENTRY.mat={pre:[0,-10.55],face:Math.PI,
  enter:(st,e)=>{const kz=fourKneeZ(),H=Math.PI;return [{walk:[0,kz+.45],d:1.0,soft:1},
    {d:.8,...liftFeet(st,c=>standPose(c,{z:kz+.05,h:H,feet:[[.12,-.38],[-.12,.45]],heel:[.06,0]}),{sides:['Right'],lift:.08})},
    {d:1.1,...liftFeet(st,c=>kneelPose(c,{z:kz,one:'Left',tuck:true}))},
    {d:.9,...liftFeet(st,c=>kneelPose(c,{z:kz,tuck:true}),{sides:['Right']})},
    {d:1.0,pose:c=>allFours(c,{tuck:true})},
    {d:.7,...liftFeet(st,c=>allFours(c,{ext:'Left',tuck:true}),{sides:['Left']})},
    {d:.7,...liftFeet(st,c=>allFours(c,{ext:'Both',tuck:true}),{sides:['Right']})},
    {d:.8,pose:exP(1,3)}];},
  leave:(st,e)=>{const kz=fourKneeZ(),H=Math.PI;return [{d:.8,pose:c=>allFours(c,{ext:'Both',tuck:true})},
    {d:.7,...liftFeet(st,c=>allFours(c,{ext:'Right',tuck:true}),{sides:['Left']})},
    {d:.7,...liftFeet(st,c=>allFours(c,{tuck:true}),{sides:['Right']})},
    {d:1.0,pose:c=>kneelPose(c,{z:kz,tuck:true})},
    {d:.9,...liftFeet(st,c=>kneelPose(c,{z:kz,one:'Right',tuck:true}),{sides:['Left']})},
    {d:1.1,...liftFeet(st,c=>standPose(c,{z:kz+.05,h:H,feet:[[.12,.45],[-.12,-.38]],heel:[0,.06]}))},
    {d:.9,...liftFeet(st,c=>standPose(c,{z:kz+.41,h:H}),{sides:['Left']})}];}}; // the walk to the next spot turns as it goes
// cable crossover: set each pulley by hand, take each handle, step into the stance.
// Reaching a carriage: up on the toes (shoulders raised) for a high one, a deep squat with the chest up for a low one; the feet stay put
const CROSS_X=.6,CROSS_Z=-11.62; // where to stand by a tower (toes just clear of it)
function crossBody(c,x,face,y){const lo=clamp((1.05-y)/.8,0,1),hi=clamp((y-1.6)/.4,0,1);
  standPose(c,{x,z:CROSS_Z,h:face,arms:'none',drop:.7*lo-.07*hi,heel:[.07*hi,.07*hi],hinge:34*lo,back:.05*lo,shrug:.03+.22*hi,stance:.16,look:28*hi-10*lo,toe:14});}
function cableReach(c,P,i,x,face,frac,y){const s=i===0?1:-1;const car=V();P.car[i].getWorldPosition(car);ST.g.worldToLocal(car);
  crossBody(c,x,face,y??car.y);armsHang(c,0,-s);const side=i===0?'Left':'Right';
  const S=wpos(c.bones[side+'Arm']);const tgt=S.clone().lerp(car.add(V(-s*.065,0,0)),frac);armTo(c,side,tgt,{hd:V(s,0,0),pn:V(0,0,-1),pole:V(0,-1,.2)});}
// the arm holding a cable handle down at the side (the cable follows); the other arm hangs, or holds its own handle (both)
function cableHoldArms(c,i,both){const s=i===0?1:-1,side=i===0?'Left':'Right';if(!both)armsHang(c,0,-s);const T=torsoAxes(c);
  for(const ss of both?[1,-1]:[s]){const sd=sideOf(ss);const ua=V(0,-1,0).addScaledVector(T.L,ss*.2),fa=V(0,-1,0).addScaledVector(T.L,ss*.08).addScaledVector(T.F,.1);armDir(c,sd,ua,fa,T.L.clone().multiplyScalar(-ss),{hd:V(0,-1,0),curl:1});}}
// turning on the spot by small steps (no walk clip): through the given canonical headings, standing at (x,z); arms(c) places the arms
function stepTurns(x,z,hs,arms,d=.6){return hs.map(h=>({d,anim:settle(c=>{standPose(c,{x,z,h,arms:arms?'none':undefined});arms&&arms(c);},{step:1,bend:1})}));}
// a few short steps (no walk clip) from (x0,z0) to (x1,z1) facing h
function shuffleTo(x0,z0,x1,z1,h,arms,n=3,d=.7){const out=[];for(let i=1;i<=n;i++){const x=lerp(x0,x1,i/n),z=lerp(z0,z1,i/n);
  out.push({d,anim:settle(c=>{standPose(c,{x,z,h,arms:arms?'none':undefined});arms&&arms(c);},{step:1,bend:1})});}return out;}
// set carriage i to the exercise height and take its handle. x / xLow: where to stand for a high / low carriage (a low one is set
// a step further from the tower, so the squatting knees clear it); from: where the lifter stands now. Returns the steps and where it ends.
function cableAdjust(i,x,face,xLow,from){const side=i===0?'Left':'Right',s=i===0?1:-1;const P=()=>ST.P;const y0=ST.P.car[i].position.y,y1=ST.P._target;
  const xs=y0<1.05?xLow:x,xe=y1<1.05?xLow:x;
  const handle=()=>{const h=V();P().h[i].getWorldPosition(h);ST.g.worldToLocal(h);return h;};
  const slide=(to,xx)=>({d:1.2,anim:(c,k)=>{const Q=P();const a=Q.car[i]._y0??Q.car[i].position.y;Q.car[i]._y0=a;Q.setPulley(lerp(a,to,smooth(k)),i);Q.rest();cableReach(c,Q,i,xx,face,1);if(k>=1)Q.car[i]._y0=undefined;}});
  const steps=[...(Math.abs(from-xs)>.02?shuffleTo(from,CROSS_Z,xs,CROSS_Z,face,null,1,.7):[]),
  {d:1.1,pose:c=>cableReach(c,P(),i,xs,face,1)},
  ...(xs!==xe?[slide(1.2,xs),{d:.8,anim:settle(c=>cableReach(c,P(),i,xe,face,1),{step:1,bend:1})},slide(y1,xe)]:[slide(y1,xs)]),
  {d:.8,pose:c=>{const h=handle();crossBody(c,xe,face,h.y+.15);armsHang(c,0,-s);armTo(c,side,h,{hd:V(0,-1,0),pn:V(-s,0,0),pole:V(0,-1,.3)});}},
  {call:c=>{grab(c,P().h[i],side);}},
  // stand up with the handle at the side (the cable follows) before turning away
  {d:1.2,pose:c=>{crossBody(c,xe,face,1.3);cableHoldArms(c,i);}}];
  return {steps,xe};}
ENTRY.cable={pre:[0,-10.6],face:Math.PI,
  enter:(st,e)=>{st.P._target=e.forms.good.high?2.02:.32;const PI=Math.PI,X=CROSS_X,Z=CROSS_Z,XL=.42;const hold0=c=>cableHoldArms(c,0),both=c=>cableHoldArms(c,0,true);
    const A=cableAdjust(0,X,PI/2,XL,.42),B=cableAdjust(1,-X,-PI/2,-XL,-X);return [
    {walk:[.42,Z],d:1.2,soft:1},...stepTurns(.42,Z,[PI*.75,PI/2],null,.9),...A.steps,
    ...stepTurns(A.xe,Z,[PI/4,0,-PI/4,-PI/2],hold0,.5),...shuffleTo(A.xe,Z,-X,Z,-PI/2,hold0,4,.6),
    ...B.steps,...stepTurns(B.xe,Z,[-PI/4,0],both),...shuffleTo(B.xe,Z,0,Z,0,both,2,.7),
    {d:1.3,anim:settle(exP(0,1),{step:1,bend:1})},{call:c=>{c.hold=[];}},{d:1.0,anim:exFrom(0,1)}];},
  leave:(st,e)=>[{d:1.0,pose:exP(0,1)},
    {d:.8,pose:c=>standPose(c,{z:-11.75}),props:(c,k)=>{const P=st.P;for(let i=0;i<2;i++){const p=V();P.pul[i].getWorldPosition(p);st.g.worldToLocal(p);p.y-=CROSS_HANG;P.h[i].position.lerp(p,k);setRod(P.cable[i],p.add(V(0,CROSS_HANG,0)),P.h[i].position);}}},
    {call:()=>st.P.rest()},{walk:[0,-10.6],d:1.2}]};
