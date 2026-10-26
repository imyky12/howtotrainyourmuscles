
// ---------------------------------------------------------------- arms: preacher bench, barbell rack pick-up
// preacher bench: the user sits facing +z, armpits on the top edge of a 45° pad; EZ bar on the rest in front
const PR={seatY:.63,seatZ:-12.16,padTop:V(0,1.12,-11.98),padDir:V(0,-Math.SQRT1_2,Math.SQRT1_2),restY:.86,restZ:-11.42};
function buildPreacher(g){const P={};box(.36,.08,.34,M.pad,0,PR.seatY-.04,PR.seatZ,g);box(.07,PR.seatY-.08,.07,M.steel,0,(PR.seatY-.08)/2,PR.seatZ,g);box(.7,.05,1.1,M.black,0,.025,-11.95,g);
  const pad=box(.5,.08,.42,M.pad,0,0,0,g);const c=PR.padTop.clone().addScaledVector(PR.padDir,.2).add(V(0,-.05,-.05));pad.position.copy(c);pad.rotation.x=Math.PI/4;
  box(.08,.95,.08,M.steel,0,.47,-11.7,g);for(const s of[1,-1]){box(.04,.3,.04,M.steel,s*.3,PR.restY-.15,PR.restZ,g);box(.05,.05,.06,M.red,s*.3,PR.restY-.02,PR.restZ,g);}
  P.bar=ezBar();g.add(P.bar);P.home=V(0,PR.restY+.01,PR.restZ);P.bar.position.copy(P.home);return P;}
// pick up a bar from the wall rack: canonical frame with the person at (0,-12) facing +z and the bar at (0,y,-11.55)
let BRACK=null;
function barFrame(which){const R=BRACK;const bar=which==='ez'?R.ez:R.straight;const w=bar.getWorldPosition(V());const rot=Math.PI/2;
  const g=new THREE.Group();g.rotation.y=rot;g.position.copy(w.clone().setY(0)).sub(V(0,0,-11.55).applyAxisAngle(V(0,1,0),rot));scene.add(g);g.updateMatrixWorld(true);
  return {g,q:qY(rot),rot,bar,y:w.y,pre:toW({g},V(0,0,-12.5)),home:{p:bar.position.clone(),parent:bar.parent}};}
function barPickPose(c,fr,k,grip=.19,sup=true){standPose(c,{z:-11.9,hinge:fr.y<.9?38:22,drop:fr.y<.9?.12:.04,back:.08,arms:'none',stance:.13});
  for(const s of[1,-1])armTo(c,sideOf(s),V(s*grip,fr.y,-11.55),{hd:sup?V(0,-.7,-.7):V(0,-.6,.8),pn:sup?V(0,.4,-1):V(0,-1,0),pole:V(s*.5,.1,-.8),curl:k});}
