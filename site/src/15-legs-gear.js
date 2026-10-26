
// ---------------------------------------------------------------- equipment: squat rack, leg machines, hip thrust
// squat rack: the user faces the uprights; J-hooks hold the bar at mid-chest height; long safety arms behind
const RACK={hookY:1.31,barZ:-11.37,upZ:-11.24};
function buildSquatRack(g){const P={};
  for(const s of[1,-1]){box(.08,2.3,.08,M.black,s*.6,1.15,RACK.upZ,g);box(.08,.06,1.2,M.black,s*.6,.03,-11.7,g);
    box(.06,.05,.14,M.red,s*.52,RACK.hookY-.05,RACK.upZ-.08,g);box(.06,.07,.03,M.red,s*.52,RACK.hookY-.02,RACK.upZ-.14,g);
    box(.05,.05,1.1,M.steel,s*.6,.58,-11.78,g);}
  box(1.28,.08,.08,M.black,0,2.3,RACK.upZ,g);
  P.bar=barbell(true,M.padRed);g.add(P.bar);P.home=V(0,RACK.hookY,RACK.barZ);P.bar.position.copy(P.home);
  plateTree(g,1.15,-12.75);return P;}
// 45° leg press: reclined seat, sled on rails going up and forward
const LP={hip:V(0,.56,-12.3),dir:V(0,Math.SQRT1_2,Math.SQRT1_2)};
function buildLegPress(g){const P={};const H=LP.hip,d=LP.dir;
  const seat=box(.5,.1,.5,M.pad,0,.42,-12.28,g);const back=box(.5,.08,.85,M.pad,0,.62,-12.75,g);back.rotation.x=-Math.PI/4;
  box(.1,.42,.1,M.steel,0,.21,-12.3,g);box(.7,.06,2.2,M.black,0,.03,-11.6,g);
  for(const s of[1,-1]){const r=rod(.03,M.steel,g);setRod(r,V(s*.36,.25,-12.05),V(s*.36,1.55,-10.75));box(.06,.5,.06,M.black,s*.36,.3,-10.8,g);
    const hd=box(.04,.04,.18,M.chrome,s*.32,.62,-12.05,g);}
  P.sled=new THREE.Group();g.add(P.sled);{const pl=box(.62,.62,.05,M.black,0,0,0,P.sled);pl.rotation.x=-Math.PI/4;for(const s of[1,-1]){plate(P.sled,s*.42,.2,.06,M.rubberPlate);}}
  P.sledAt=t=>{const p=H.clone().addScaledVector(d,t).add(V(0,.04,.04));P.sled.position.copy(p);};
  P.safety=[box(.03,.12,.03,M.red,.32,.5,-11.95,g),box(.03,.12,.03,M.red,-.32,.5,-11.95,g)];
  P.sledAt(.84);return P;}
// leg extension: seat reclined, pivot at the knee, shin pad on a swinging arm
const LX={hip:V(0,.66,-12.32),knee:V(0,.66,-11.86),recline:40};
function buildLegExt(g){const P={};const th=LX.recline*DEG;
  box(.42,.1,.48,M.pad,0,LX.hip.y-.14,-12.08,g);const back=box(.42,.7,.09,M.pad,0,LX.hip.y+.22,-12.55,g);back.rotation.x=-th;back.position.set(0,LX.hip.y+.26*Math.cos(th),-12.42-.3*Math.sin(th));
  box(.1,LX.hip.y-.19,.1,M.steel,0,(LX.hip.y-.19)/2,-12.1,g);box(.8,.06,1.0,M.black,0,.03,-12.1,g);
  for(const s of[1,-1]){box(.05,.05,.3,M.chrome,s*.27,LX.hip.y-.06,-12.15,g);}
  cyl(.04,.64,M.red,0,LX.knee.y,LX.knee.z,'x',g,16);box(.12,1.4,.12,M.black,-.36,.7,-12.3,g);P.stackTop=stack(g,-.36,.12,-12.62,9);
  P.arm=new THREE.Group();P.arm.position.copy(LX.knee);g.add(P.arm);box(.05,.5,.05,M.steel,-.3,-.25,0,P.arm);P.pad=cyl(.06,.36,M.pad,-.02,-.4,.06,'x',P.arm);
  P.setKnee=a=>{P.arm.rotation.x=a;};return P;}
// lying leg curl: angled pad, knees just past the end, roller behind the ankles
const LC={kneeZ:-11.12,padY:.62};
function buildLegCurl(g){const P={};
  const p1=box(.42,.1,.95,M.pad,0,LC.padY-.05,-11.62,g);const p2=box(.42,.1,.7,M.pad,0,LC.padY+.02,-12.4,g);p2.rotation.x=-.2;
  box(.1,LC.padY-.1,.1,M.steel,0,(LC.padY-.1)/2,-11.6,g);box(.1,LC.padY-.05,.1,M.steel,0,(LC.padY-.05)/2,-12.5,g);box(.7,.06,1.8,M.black,0,.03,-11.9,g);
  for(const s of[1,-1])box(.04,.04,.18,M.chrome,s*.24,LC.padY+.06,-12.72,g);
  cyl(.04,.6,M.red,0,LC.padY,LC.kneeZ,'x',g,16);
  P.arm=new THREE.Group();P.arm.position.set(0,LC.padY,LC.kneeZ);g.add(P.arm);box(.05,.05,.42,M.steel,.27,0,.21,P.arm);P.pad=cyl(.06,.4,M.pad,0,.1,.4,'x',P.arm);
  P.stackTop=stack(g,.0,.12,-10.8,8);box(.3,1.2,.06,M.black,0,.6,-10.72,g);
  P.setKnee=a=>{P.arm.rotation.x=-a;};return P;}
// standing calf raise: step block and shoulder pads on a sliding carriage
const SC={stepY:.14,edgeZ:-11.84};
function buildStandCalf(g){const P={};box(.6,SC.stepY,.3,M.black,0,SC.stepY/2,SC.edgeZ+.15,g);box(.9,.03,.9,M.black,0,.015,-11.9,g);
  box(.14,2.0,.14,M.black,0,1.0,-11.05,g);P.stackTop=stack(g,0,.12,-10.95,9);
  P.pads=new THREE.Group();g.add(P.pads);box(.08,.06,.42,M.steel,0,0,.0,P.pads);for(const s of[1,-1]){cyl(.06,.2,M.pad,s*.16,-.04,-.02,'z',P.pads);box(.04,.16,.04,M.chrome,s*.3,-.1,.12,P.pads);}
  P.padsAt=y=>P.pads.position.set(0,y,-11.95);P.padsAt(1.42);return P;}
// seated calf raise: seat, step, knee pad on a lever
const SCS={seatY:.47,stepY:.13,edgeZ:-11.62};
function buildSeatCalf(g){const P={};box(.42,.08,.42,M.pad,0,SCS.seatY-.04,-12.12,g);box(.08,SCS.seatY-.08,.08,M.steel,0,(SCS.seatY-.08)/2,-12.12,g);
  box(.5,SCS.stepY,.25,M.steel,0,SCS.stepY/2,SCS.edgeZ+.12,g);box(.5,.012,.03,M.red,0,SCS.stepY+.006,SCS.edgeZ+.015,g);box(.7,.04,1.0,M.black,0,.02,-11.9,g);box(.1,.7,.1,M.black,0,.35,-11.5,g);
  P.lever=new THREE.Group();P.lever.position.set(0,.68,-11.5);g.add(P.lever);box(.06,.06,.6,M.steel,0,0,-.25,P.lever);P.pad=box(.42,.07,.16,M.pad,0,.0,-.52,P.lever);
  for(let i=0;i<2;i++)plate(P.lever,0,.2,.05,M.rubberPlate).position.set(0,-.05,.12);
  P.padAt=y=>{P.lever.rotation.x=0;P.lever.updateMatrixWorld(true);const pz=P.lever.position;P.lever.rotation.x=-Math.asin(clamp((y-pz.y)/.52,-1,1));};return P;}
// hip thrust: flat bench side-on behind the lifter, padded barbell on the floor in front
const HT={benchZ:-12.48,benchY:.4};
function buildHipThrust(g){const P={};box(1.2,.09,.3,M.pad,0,HT.benchY-.045,HT.benchZ,g);for(const s of[1,-1]){box(.06,HT.benchY-.09,.06,M.steel,s*.45,(HT.benchY-.09)/2,HT.benchZ,g);box(.06,.05,.45,M.steel,s*.45,.025,HT.benchZ,g);}
  box(1.3,.06,.06,M.black,0,.03,HT.benchZ-.2,g);
  P.bar=barbell(true,M.padRed);g.add(P.bar);cyl(.05,.36,M.pad,0,0,0,'x',P.bar,14);P.home=V(0,.225,-11.2);P.bar.position.copy(P.home);
  const mat=box(1.2,.01,1.2,M_mat,0,.005,-11.75,g,false);mat.userData.walkable=true;return P;}
