
// ---------------------------------------------------------------- whole-body poses (canonical frame, user faces +z)
// lying on a flat / incline (+) / decline (−) bench; hips stay on the seat
function lieBody(c,o){let q=qX(o.angle||0).multiply(qLie);
  const hipT=V(0,BENCH_TOP+D.back,HIPS_Z+(o.dz||0));let pos=hipT.clone().sub(D.hips.clone().applyQuaternion(q));
  if(o.hipLift){const Sw=pos.clone().add(D.sh.clone().applyQuaternion(q));q=qX(-o.hipLift).multiply(q);pos=Sw.sub(D.sh.clone().applyQuaternion(q));}
  c.root.quaternion.copy(q);c.root.position.copy(pos);c._hipT=hipT;resetRest(c);const B=c.bones;
  B.Spine1.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),-.16*.6));
  B.Spine2.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),-.16*.4+(o.breathe||0)*.02));
  B.Neck.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),.12+(o.neck||0)));
  B.Head.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),.05+(o.look||0)*.12));
  clav(c,{shrug:o.shrug??.07});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const side=sideOf(s);
    if(o.feet==='rollers')legTo(c,side,V(s*.12,.27,HIPS_Z+.66),V(s*.1,1,.5),.25);
    else if(o.feet==='knees')legTo(c,side,V(s*.14,BENCH_TOP+.12,HIPS_Z+.36),V(s*.1,1,.3),.2);
    else legTo(c,side,V(s*.31,.09,HIPS_Z+.47),V(s*.25,1,.55),-.35);}}
function seatBody(c,o){setRoot(c,qX(-SEAT_RECLINE+(o.lean||0)),V(0,SEAT_TOP+.1*D.s-(o.drop||0),SEAT_Z));resetRest(c);
  clav(c,{shrug:o.shrug??.03,protract:o.protract});c.root.updateMatrixWorld(true);
  for(const s of[1,-1])legTo(c,sideOf(s),V(s*.17,.09,SEAT_Z+.46-(o.drop||0)*.5),V(s*.15,.4,1));}
// split stance between cable towers
function standBody(c,o){setRoot(c,qX(o.lean||0),V(0,D.hips.y-.04*D.s,CZ));resetRest(c);
  clav(c,{shrug:o.shrug??.03});c.root.updateMatrixWorld(true);
  legTo(c,'Left',V(.13,D.ankY,CZ+.30),V(.1,.2,1));legTo(c,'Right',V(-.13,D.ankY+.05,CZ-.36),V(-.1,.2,1),.45);}
// general standing pose: feet planted, hips over the feet (pushed back by the hinge), knees bent by 'drop'
// o: x,z (between the feet), h (heading), hinge (deg, torso forward), drop (m the hips go down), back (m hips go back),
//    stance (half the distance between the ankles), toe (deg the feet turn out), feet:[[x,z],[x,z]] (overrides), round (spine flex, deg)
function standPose(c,o={}){const h=o.h||0,x=o.x||0,z=o.z??-12,hg=(o.hinge||0)*DEG;const qh=qY(h);
  const back=(o.back??0);const hip=V(0,D.hips.y-(o.drop||0),-back).applyQuaternion(qh).add(V(x,0,z));
  setRoot(c,qh.clone().multiply(qX(hg)).multiply(qZ((o.tilt||0)*DEG)),hip);resetRest(c);
  if(o.round||o.twist||o.side)spineBend(c,(o.round||0)*DEG,{twist:(o.twist||0)*DEG,side:(o.side||0)*DEG});
  const B=c.bones,lk=(o.look??(o.hinge||0)*.55)*DEG*.5;B.Neck.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),-lk));B.Head.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),-lk));
  clav(c,{shrug:o.shrug??.03,protract:o.protract});c.root.updateMatrixWorld(true);
  const st=o.stance??.11*D.s;const toe=(o.toe??8)*DEG;
  for(const s of[1,-1]){const side=sideOf(s);const f=o.feet?V(o.feet[s>0?0:1][0],0,o.feet[s>0?0:1][1]):V(s*st,0,.02);
    const A=f.clone().applyQuaternion(qh).add(V(x,D.ankY+(o.heel?o.heel[s>0?0:1]:0),z));const fwd=V(s*Math.sin(toe),0,Math.cos(toe)).applyQuaternion(qh);
    const pole=fwd.clone().add(V(0,.25,0)).addScaledVector(V(s,0,0).applyQuaternion(qh),o.kneeIn?-o.kneeIn*s:0);
    legTo(c,side,A,pole);footTo(c,side,A.clone().addScaledVector(fwd,.15).setY(D.ankY*.35+(o.heel?o.heel[s>0?0:1]*1.5:0)));}
  if(o.arms!=='none')armsHang(c,o.armOut||0);}
// arms hanging at the sides, palms facing the thighs
function armsHang(c,out=0,side){const T=torsoAxes(c);for(const s of side?[side]:[1,-1]){const sd=sideOf(s);const down=V(0,-1,0);
  const ua=down.clone().addScaledVector(T.L,s*(.1+out)).addScaledVector(T.F,.04);const fa=down.clone().addScaledVector(T.L,s*.04).addScaledVector(T.F,.12);
  armDir(c,sd,ua,fa,T.L.clone().multiplyScalar(-s),{hd:down.clone().addScaledVector(T.F,.1),curl:.35});}}
// sitting on the end of a flat bench, straddling it (feet on the floor either side), hands on the thighs
function benchSit(c,o={}){const z=o.z??HIPS_Z+.22;setRoot(c,qX((o.lean??8)*DEG),V(0,BENCH_TOP+D.back*.62,z));resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const side=sideOf(s);legTo(c,side,V(s*(o.feetX??.31),D.ankY,z+(o.feetZ??.28)),V(s*.3,.6,1));footTo(c,side,V(s*(o.feetX??.31)+s*.04,.03,z+(o.feetZ??.28)+.15));}
  if(o.arms!=='none'){const T=torsoAxes(c);for(const s of[1,-1]){const sd=sideOf(s);const K=wpos(c.bones[sd+'Leg']);const H=wpos(c.bones[sd+'UpLeg']);const tgt=H.lerp(K,.7).add(V(0,.06,0));
    armTo(c,sd,tgt,{hd:V(0,-.3,1),pn:V(0,-1,0),pole:V(s*.4,-.6,-.6),curl:.5});}}}
// seated upright on a bench end with feet together in front (machines, upright bench)
function chairSit(c,o={}){const y=o.y??SEAT_TOP,z=o.z??SEAT_Z;setRoot(c,qX((o.lean??0)*DEG-(o.recline||0)*DEG),V(0,y+.1*D.s,z));resetRest(c);clav(c,{shrug:.03});c.root.updateMatrixWorld(true);
  for(const s of[1,-1])legTo(c,sideOf(s),V(s*(o.fx??.17),D.ankY,z+(o.fz??.46)),V(s*.15,.4,1));}
