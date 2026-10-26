
// ---------------------------------------------------------------- stations
// Every piece of equipment is built in a "canonical" frame: the user's spot is around (0, y, -12) and the user faces +z.
// A station is that frame placed in the gym (position + turn about y). Poses are solved in the canonical frame and then
// carried into the room by the station's transform, so one pose function works at any station.
const STATIONS={};
const CAN=V(0,0,-12);
function makeStation(id,x,z,rot,build,o={}){
  const g=new THREE.Group();g.rotation.y=rot;g.position.set(x,0,z).sub(CAN.clone().applyAxisAngle(V(0,1,0),rot));IN.add(g);g.updateMatrixWorld(true);
  const st={id,g,rot,q:qY(rot),pos:V(x,0,z),...o};st.P=build(g,st)||{};STATIONS[id]=st;return st;}
function toW(st,p){return p.clone().applyMatrix4(st.g.matrixWorld);}
function toC(st,p){return st.g.worldToLocal(p.clone());}
const headingW=(st,h)=>h+st.rot; // canonical heading (0 = facing +z) -> world heading
// carry a pose solved in the canonical frame into the station
function frame(c,st){if(!st)return;c.root.position.applyMatrix4(st.g.matrixWorld);c.root.quaternion.premultiply(st.q);c.root.updateMatrixWorld(true);}
// all objects a pose function moves (so the split view can show each take with its own props)
function dynList(P){const out=[];const add=o=>{if(!o)return;if(Array.isArray(o))o.forEach(add);else if(o.isObject3D)out.push(o);};
  for(const k in P)if(k!=='static')add(P[k]);return out;}
function propState(P){return dynList(P).map(o=>[o,o.position.clone(),o.quaternion.clone(),o.scale.clone(),o.visible]);}
function setPropState(S){for(const [o,p,q,s,v] of S){o.position.copy(p);o.quaternion.copy(q);o.scale.copy(s);o.visible=v;}}

// ---- shared canonical constants (chest library numbers kept)
const HIPS_Z=-11.95, BENCH_TOP=.45;
const qLie=new THREE.Quaternion().setFromAxisAngle(V(1,0,0),-Math.PI/2);
const SEAT_Z=-12.2,SEAT_TOP=.47,SEAT_RECLINE=.12;
const CZ=-11.9;

// ---- benches
// adjustable bench: seat at the hips, back pad hinged at the hips (deg > 0 head up, < 0 head down)
function angledBench(g,deg,o={}){const hz=HIPS_Z-.03;const P={};
  box(.3,.09,.46,M.pad,0,BENCH_TOP-.045,hz+.25,g);box(.06,BENCH_TOP-.09,.06,M.steel,0,(BENCH_TOP-.09)/2,hz+.3,g);box(.45,.05,.07,M.steel,0,.025,hz+.42,g);
  box(.07,.05,1.1,M.steel,0,.025,hz-.2,g);box(.45,.05,.07,M.steel,0,.025,hz-.78,g);
  const hinge=new THREE.Group();hinge.position.set(0,BENCH_TOP,hz);g.add(hinge);const L=o.len||1.02;
  const pad=box(.3,.09,L,M.pad,0,-.045,-(L/2+.02),hinge);const strut=box(.05,.05,.5,M.steel,0,-.1,-.45,hinge);
  // the back-pad support: a strut from the rail to the underside of the pad (re-placed when the angle changes)
  const leg=rod(.025,M.steel,g);
  P.hinge=hinge;P.leg=leg;
  P.setAngle=d=>{hinge.rotation.x=d*DEG;hinge.updateMatrixWorld(true);const th=d*DEG;const dir=V(0,Math.sin(th),-Math.cos(th));
    const top=V(0,BENCH_TOP,hz).addScaledVector(dir,L*.55).add(V(0,-.09*Math.cos(th),-.09*Math.sin(th)));
    setRod(leg,V(0,.05,Math.min(hz-.2,top.z+.05)),top);leg.visible=d>-1;};
  P.setAngle(deg);P.angle0=deg;
  if(o.rollers){box(.06,.62,.06,M.steel,0,.31,hz+.70,g);cyl(.06,.36,M.pad,0,.31,hz+.76,'x',g);box(.3,.07,.22,M.pad,0,.585,hz+.44,g);box(.06,.55,.06,M.steel,0,.275,hz+.44,g);}
  return P;}
function lieShoulderAt(deg){const q=qX(deg*DEG).multiply(qLie);return V(0,BENCH_TOP+D.back,HIPS_Z).add(D.sh.clone().sub(D.hips).applyQuaternion(q));}
// bench with uprights and J-hooks for a barbell press
function buildBarBench(g,deg,rollers){const lockS=lieShoulderAt(deg);const rackY=lockS.y+reach()+.09,rackZ=lockS.z-.26;
  const P=angledBench(g,deg,{rollers});
  for(const s of[-1,1]){box(.07,rackY+.18,.07,M.black,s*.6,(rackY+.18)/2,rackZ-.06,g);box(.12,.05,.08,M.red,s*.6,rackY-.04,rackZ,g);box(.09,.05,.05,M.red,s*.6,rackY-.02,rackZ+.04,g);box(.07,.07,.5,M.black,s*.6,.035,rackZ+.1,g);}
  box(1.27,.07,.07,M.black,0,.035,rackZ-.1,g);
  P.bar=barbell(true,M.padRed);g.add(P.bar);P.bar.position.set(0,rackY,rackZ);P.rack=V(0,rackY,rackZ);return P;}
function seatMachine(g){const P={};P.seat=box(.42,.09,.42,M.pad,0,SEAT_TOP-.045,SEAT_Z+.08,g);P.seatBase=P.seat.position.y;
  box(.07,SEAT_TOP-.09,.07,M.steel,0,(SEAT_TOP-.09)/2,SEAT_Z+.08,g);
  const back=box(.44,.78,.09,M.pad,0,SEAT_TOP+.47,SEAT_Z-.24,g);back.rotation.x=-SEAT_RECLINE;
  box(.9,.06,.9,M.black,0,.03,SEAT_Z-.2,g);box(.07,1.9,.07,M.black,0,.95,SEAT_Z-.42,g);
  P.stackTop=stack(g,0,.12,SEAT_Z-.62);box(.32,1.7,.06,M.black,0,.85,SEAT_Z-.7,g);return P;}
function seatShoulderRef(){return V(0,SEAT_TOP+.1*D.s,SEAT_Z).add(D.sh.clone().sub(D.hips).applyQuaternion(qX(-SEAT_RECLINE)));}

// ---- dumbbell rack: pairs sit in saddles, handles pointing at the person taking them
const DBR={pairs:[]};
function buildDBRack(x,z,len,rot){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;IN.add(g);
  // local frame: rack runs along local z; the person stands at local +x... (front = local -x)
  for(const t of[0,1]){box(.5,.05,len,M.steel,t*.34,.5+t*.34,0,g);box(.5,.02,len,M.black,t*.34,.53+t*.34,0,g);}
  for(const sz of[-len/2,len/2])box(.85,.95,.06,M.black,.17,.47,sz,g);
  const n=Math.floor((len-.2)/.85);
  for(const t of[0,1])for(let i=0;i<n;i++){const size=.7+.05*i+(1-t)*.35;const pz=-len/2+.5+i*.85;const pair=[];
    for(const sd of[-1,1]){const db=dumbbell(g,size);db.position.set(t*.34,.5+t*.34+.03+.062*size,pz+sd*.2);db.rotation.y=Math.PI/2;pair.push(db);}
    DBR.pairs.push({dbs:pair,size,home:pair.map(d=>({p:d.position.clone(),q:d.quaternion.clone(),parent:g})),tier:t,slot:V(t*.34,.5+t*.34+.03+.062*size,pz),g});}
  g.updateMatrixWorld(true);return g;}
// fixed barbell / EZ-bar rack against a wall
function buildBarRack(x,z,rot){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;IN.add(g);
  for(const s of[-1,1]){box(.06,1.3,.5,M.black,s*.8,.65,0,g);}
  const bars=[];for(let i=0;i<3;i++){const y=.45+i*.32;box(1.66,.04,.04,M.steel,0,y,.12,g);}
  const ez=ezBar();ez.position.set(0,1.11,.12);g.add(ez);const st=barbell(false,M.padRed,1.6);for(const s of[-1,1]){plate(st,s*.58,.14,.05,M.rubberPlate);}st.position.set(0,.79,.12);g.add(st);
  g.updateMatrixWorld(true);return {g,ez,straight:st,homeEz:ez.position.clone(),homeSt:st.position.clone()};}
