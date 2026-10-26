
// ---------------------------------------------------------------- equipment for back (and shared with other groups)
// power tower: pull-up bar on top, dip handles in front, back pad and forearm pads for knee raises
const PU_Y=2.25,PU_Z=-12.08;
function buildTower(g){const hx=D.shx+.06*D.s;const P={};
  for(const s of[1,-1]){box(.07,2.35,.07,M.black,s*.46,1.175,-12.48,g);box(.07,.06,.95,M.black,s*.46,.03,-12.2,g);
    // dip handles (also the forearm rests for knee raises)
    cyl(.022,.8,M.chrome,s*hx,DIP_Y,DIP_Z+.08,'z',g,14);box(.05,.05,.08,M.black,s*hx,DIP_Y,-12.44,g);box((.46-hx)+.04,.05,.05,M.black,s*(hx+.46)/2,DIP_Y,-12.44,g);
    box(.1,.03,.32,M.pad,s*hx,DIP_Y+.04,DIP_Z-.1,g);}
  box(.98,.07,.07,M.black,0,2.32,-12.48,g);
  // pull-up bar sticking out in front
  for(const s of[1,-1])box(.06,.06,.42,M.black,s*.46,PU_Y,-12.28,g);
  P.bar=cyl(.016,1.2,M.chrome,0,PU_Y,PU_Z,'x',g,14);
  box(.36,.6,.07,M.pad,0,1.1,-12.43,g);return P;}
// lat pulldown: seat with thigh pad, column and stack in front, bar on a cable from the top pulley
const LPD={seatY:.5,seatZ:-12.15,pulY:2.35,pulZ:-11.95};
function buildLatPulldown(g){const P={};
  box(.4,.08,.4,M.pad,0,LPD.seatY-.04,LPD.seatZ,g);box(.07,LPD.seatY-.08,.07,M.steel,0,(LPD.seatY-.08)/2,LPD.seatZ,g);
  for(const s of[1,-1]){const tp=cyl(.06,.3,M.pad,s*.16,LPD.seatY+.2,-11.85,'x',g);}box(.06,.32,.06,M.steel,0,LPD.seatY+.06,-11.78,g);box(.4,.04,.04,M.steel,0,LPD.seatY+.2,-11.85,g);
  box(.9,.06,.5,M.black,0,.03,-12.1,g);box(.5,.06,.4,M.black,0,.03,-10.8,g);box(.1,2.45,.1,M.black,0,1.225,-10.85,g);box(.1,.1,1.25,M.black,0,2.42,-11.45,g);
  cyl(.05,.04,M.steel,0,LPD.pulY,LPD.pulZ,'x',g,16);
  P.stackTop=stack(g,0,.12,-10.68,10);box(.32,1.7,.06,M.black,0,.85,-10.6,g);
  P.bar=new THREE.Group();g.add(P.bar);{const r=cyl(.015,1.1,M.chrome,0,0,0,'x',P.bar,12);for(const s of[1,-1]){const e=cyl(.017,.18,M.black,s*.47,0,0,'x',P.bar,10);}}
  P.cable=rod(.0045,M_cable,g);P.pul=V(0,LPD.pulY,LPD.pulZ);
  P.rest=()=>{P.bar.position.set(0,1.98,LPD.pulZ);P.bar.quaternion.identity();setRod(P.cable,P.pul,P.bar.position);P.stackTop.position.y=0;};P.rest();return P;}
// seated cable row: long low seat, foot plate, low pulley in front, triangle handle
const SROW={seatY:.42,seatZ:-12.25,footZ:-11.45,pulY:.33,pulZ:-11.12};
function buildSeatedRow(g){const P={};
  box(.36,.08,1.2,M.pad,0,SROW.seatY-.04,-12.4,g);for(const z of[-12.85,-11.95])box(.06,SROW.seatY-.08,.06,M.steel,0,(SROW.seatY-.08)/2,z,g);box(.12,.05,1.9,M.steel,0,.025,-12.0,g);
  const fp=box(.5,.36,.05,M.black,0,.24,SROW.footZ,g);fp.rotation.x=-.35;box(.08,.4,.08,M.steel,0,.2,SROW.footZ+.12,g);
  box(.5,2.0,.5,M.black,0,1.0,-10.75,g);cyl(.045,.04,M.steel,0,SROW.pulY,SROW.pulZ,'x',g,16);
  P.stackTop=stack(g,0,.12,-11.03,10);
  P.h=new THREE.Group();g.add(P.h);{const a=rod(.012,M.chrome,P.h),b=rod(.012,M.chrome,P.h),c=rod(.012,M.chrome,P.h);setRod(a,V(-.07,0,0),V(.07,0,0));setRod(b,V(-.07,0,0),V(0,0,.13));setRod(c,V(.07,0,0),V(0,0,.13));
    cyl(.02,.1,M.black,-.07,0,0,'y',P.h,8);cyl(.02,.1,M.black,.07,0,0,'y',P.h,8);}
  P.cable=rod(.0045,M_cable,g);P.pul=V(0,SROW.pulY,SROW.pulZ);
  P.rest=()=>{P.h.position.set(0,.36,SROW.footZ+.06);P.h.quaternion.identity();setRod(P.cable,P.pul,P.h.position.clone().add(V(0,0,.13)));P.stackTop.position.y=0;};P.rest();return P;}
// single cable column: tower in front of the user's spot, pulley slides on the rail; straight bar, rope or handle
const CCOL={z:-10.88,railZ:-11.06};
function buildCableCol(g){const P={};box(.55,2.4,.4,M.black,0,1.2,CCOL.z,g);box(.06,2.1,.06,M.steel,0,1.15,CCOL.railZ,g);box(.9,.05,.9,M.black,0,.025,CCOL.z+.1,g);
  P.car=new THREE.Group();g.add(P.car);box(.12,.16,.08,M.red,0,0,0,P.car);P.pul=new THREE.Group();P.car.add(P.pul);P.pul.position.z=-.05;cyl(.045,.04,M.steel,0,0,0,'x',P.pul,16);
  P.car.position.set(0,2.1,CCOL.railZ);P.stackTop=stack(g,0,.12,CCOL.z+.06,9);
  // attachments: straight bar, rope, single D-handle (only the one in use is visible)
  P.sbar=new THREE.Group();g.add(P.sbar);cyl(.014,.62,M.chrome,0,0,0,'x',P.sbar,12);for(const s of[1,-1])cyl(.016,.16,M.black,s*.2,0,0,'x',P.sbar,10);
  P.rope=new THREE.Group();g.add(P.rope);P.ropeL=rod(.014,M_cable,P.rope);P.ropeR=rod(.014,M_cable,P.rope);
  for(const s of[1,-1]){const k=new THREE.Mesh(new THREE.SphereGeometry(.025,10,8),M.black);k.name='knob'+s;P.rope.add(k);}
  P.dh=new THREE.Group();g.add(P.dh);cyl(.018,.13,M.red,0,0,0,'x',P.dh,10);
  P.cable=rod(.0045,M_cable,g);P.att='sbar';
  P.pulW=()=>{const p=V();P.pul.getWorldPosition(p);return g.worldToLocal(p);};
  P.setPulley=y=>{P.car.position.y=y;P.car.updateMatrixWorld(true);};
  P.use=a=>{P.att=a;P.sbar.visible=a==='sbar';P.rope.visible=a==='rope';P.dh.visible=a==='dh';};
  // rope ends at the hands: centre clip at c, knobs at l and r
  P.ropeAt=(c,l,r)=>{P.rope.position.copy(c);P.rope.quaternion.identity();setRod(P.ropeL,V(),V().subVectors(l,c));setRod(P.ropeR,V(),V().subVectors(r,c));
    P.rope.children.forEach(k=>{if(k.name==='knob1')k.position.subVectors(l,c);if(k.name==='knob-1')k.position.subVectors(r,c);});};
  P.attPos=()=>P.att==='sbar'?P.sbar.position:P.att==='rope'?P.rope.position:P.dh.position;
  P.rest=()=>{const p=P.pulW().add(V(0,-.12,.02));for(const o of[P.sbar,P.rope,P.dh]){o.position.copy(p);o.quaternion.identity();}P.ropeAt(p,p.clone().add(V(.04,-.25,0)),p.clone().add(V(-.04,-.25,0)));setRod(P.cable,P.pulW(),p);P.stackTop.position.y=0;};
  P.cableTo=p=>setRod(P.cable,P.pulW(),p);
  P.use('sbar');P.rest();return P;}
// lifting platform with a loaded barbell on the floor (plates radius .225 → bar centre at .225)
const PLAT={barY:.225,barZ:-11.86};
function buildPlatform(g,o={}){const P={};const pl=box(2.4,.03,2.4,new THREE.MeshStandardMaterial({color:0x5b4632,roughness:.8}),0,.015,-12,g,false);pl.receiveShadow=true;pl.userData.walkable=true;
  P.bar=barbell(true,M.rubberPlate);g.add(P.bar);P.bar.position.set(0,PLAT.barY,PLAT.barZ);P.home=P.bar.position.clone();return P;}
// an empty spot on the floor (standing dumbbell exercises)
function buildSpot(g){return {};}
