
// ---------------------------------------------------------------- story and session flow
const $=s=>document.querySelector(s);
const capEl=$('#cap'),bubble=$('#bubble'),sayEl=$('#say'),chipsEl=$('#chips');
function caption(t){capEl.textContent=t||'';}
let bubbleOn=false;function say(t,show=true){if(t)sayEl.textContent=t;bubbleOn=show&&!!t;bubble.style.display=bubbleOn?'block':'none';if(!show)chipsEl.hidden=true;bubble.classList.toggle('ask',bubbleOn&&!chipsEl.hidden);}
let sayTimer=0;function sayFor(t,sec=3.2){say(t);sayTimer=sec;}
let flow='landing',ft=0,lightsOn=0,doorOpen=0,fastF=1;
function setFlow(s){flow=s;ft=0;}
// session
const SES={group:null,plan:null,i:0,done:new Set()};
let pending=null; // what the lifter is on the way to do

// ---- camera
const cam={pos:V(3.2,1.9,17),look:V(0,2.2,0),tPos:V(3.2,1.9,17),tLook:V(0,2.4,0),k:2.2,orbit:false,az:0,el:.25,r:2.8,taz:0,tel:.25,tr:2.8,center:V()};
const PRESETS={rearR:{az:Math.PI/2+.55,el:.45,r:3.0},sideR:{az:-Math.PI/2+.35,el:.32,r:3.0},frontQ:{az:.33,el:.28,r:3.4},sideHigh:{az:Math.PI/2+.35,el:.55,r:3.2},three:{az:.75,el:.3,r:3.2},sideFlat:{az:Math.PI/2-.3,el:.3,r:3.1},pushSide:{az:Math.PI/2-.4,el:.32,r:3.0},front:{az:.0001,el:.22,r:3.2},quiz:{az:.4,el:.5,r:2.8},above:{az:.0001,el:1.4,r:2.7},feetLow:{az:.62,el:.2,r:2.6},side:{az:Math.PI/2-.72,el:.5,r:2.8},feet:{az:0,el:.42,r:2.7},top:{az:Math.PI/2,el:1.35,r:2.4},coach:{az:Math.PI*.82,el:.5,r:2.4},back:{az:Math.PI-.5,el:.35,r:3.0},sideL:{az:-Math.PI/2+.5,el:.3,r:3.0}};
// equipment boxes that can block a camera (built once; walls are handled by roomRay)
let OCC=null;
function occluders(){if(OCC)return OCC;OCC=[];scene.updateMatrixWorld(true);const owner=new Map();for(const k in STATIONS)owner.set(STATIONS[k].g,STATIONS[k]);
  scene.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||WALLS.includes(o)||FACADE.includes(o))return;let q=o,st=null;while(q){if(owner.has(q)){st=owner.get(q);break;}if(q.userData&&q.userData.prop)return;q=q.parent;}
    const b=new THREE.Box3().setFromObject(o);const sz=b.getSize(V());if(b.max.y<.35||sz.x>12||sz.z>12||(sz.x<.05&&sz.z<.05))return;OCC.push({b,st});});return OCC;}
const _ray=new THREE.Ray(),_hit=V();
function viewClear(ctr,p,own){const d=p.distanceTo(ctr);_ray.origin.copy(p);_ray.direction.subVectors(ctr,p).normalize();
  for(const o of occluders()){if(o.b.containsPoint(p))return false;if(_ray.intersectBox(o.b,_hit)&&_hit.distanceTo(p)<d-(o.st===own?1.0:.45))return false;}return true;}
// the preset's direction, swung around until no wall or other machine sits between the camera and the person
function presetAz(n,ctr,st){const p=PRESETS[n]||PRESETS.side;const az0=p.az+(st?st.rot:0);if(!st)return az0;const rr=p.r*(innerWidth<innerHeight?1.5:1);
  for(const a of[0,20,-20,40,-40,60,-60,85,-85,120,-120,150,-150,180]){const az=az0+a*DEG;
    const q=V(ctr.x+Math.sin(az)*Math.cos(p.el)*rr,ctr.y+Math.sin(p.el)*rr,ctr.z+Math.cos(az)*Math.cos(p.el)*rr);
    if(roomRay(ctr,q.clone()).distanceTo(ctr)>=rr*.92&&viewClear(ctr,q,st))return az;}return az0;}
function setPreset(n){const p=PRESETS[n]||PRESETS.side;cam.taz=presetAz(n,cam.center,ST);cam.tel=p.el;cam.tr=p.r;}
let dragging=null;
canvas.addEventListener('pointerdown',e=>{if(!cam.orbit)return;dragging={x:e.clientX,y:e.clientY,az:cam.taz,el:cam.tel};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!dragging)return;cam.taz=dragging.az-(e.clientX-dragging.x)*.008;cam.tel=clamp(dragging.el+(e.clientY-dragging.y)*.006,-.05,1.45);});
canvas.addEventListener('pointerup',()=>dragging=null);
canvas.addEventListener('wheel',e=>{if(!cam.orbit)return;cam.tr=clamp(cam.tr+e.deltaY*.002,1.3,6);e.preventDefault();},{passive:false});
// keep the camera out of walls: through the facade only inside the doorway, and inside the room once in
function camConstrain(p){if(hero&&hero.pos.z<-.6&&flow!=='street'){p.x=clamp(p.x,ROOM.x0+.25,ROOM.x1-.25);p.z=clamp(p.z,ROOM.z0+.25,ROOM.z1-.25);p.y=clamp(p.y,.25,ROOM.y1-.35);return p;}if(p.z<.45&&p.z>-.45){p.x=clamp(p.x,-DOOR.half+.3,DOOR.half-.3);p.y=Math.min(p.y,DOOR.h-.3);}
  if(p.z<-.45){p.x=clamp(p.x,ROOM.x0+.25,ROOM.x1-.25);p.z=Math.max(p.z,ROOM.z0+.25);p.y=clamp(p.y,.25,ROOM.y1-.35);}return p;}
// pull an orbiting camera in along its line of sight until it is inside the room (never behind a wall)
function roomRay(ctr,p){const m=.3;const lo=V(ROOM.x0+m,.3,ROOM.z0+m),hi=V(ROOM.x1-m,ROOM.y1-.4,ROOM.z1-m);let t=1;const d=V().subVectors(p,ctr);
  for(const ax of['x','y','z']){if(d[ax]>1e-6&&ctr[ax]+d[ax]>hi[ax])t=Math.min(t,(hi[ax]-ctr[ax])/d[ax]);if(d[ax]<-1e-6&&ctr[ax]+d[ax]<lo[ax])t=Math.min(t,(lo[ax]-ctr[ax])/d[ax]);}
  p.copy(ctr).addScaledVector(d,Math.max(.25,t));return p;}
function followCam(c,back=3.4,up=1.85,side=0){const f=V(Math.sin(c.heading),0,Math.cos(c.heading));const r=V(f.z,0,-f.x);
  cam.tPos.copy(c.pos).addScaledVector(f,-back).addScaledVector(r,side).setY(up);cam.tLook.copy(c.pos).addScaledVector(f,2.2).setY(1.15);}

// ---- walking to a station and getting on it
function preOf(e){const en=ENTRY[e.entry];const st=STATIONS[e.station];return {p:toW(st,V(en.pre[0],0,en.pre[1])),face:headingW(st,en.face)};}
// where the coach watches from: the station's spot, or its mirror / opposite side if that keeps them out of the camera's line to the lifter
function coachSpotOf(e){const st=STATIONS[e.station],cs=e.coachSpot;const c=toW(st,e.center);const az=presetAz(e.cam||'side',c,st);const d=V(Math.sin(az),0,Math.cos(az));
  const cands=[[cs.p[0],cs.p[1]],[-cs.p[0],cs.p[1]],[-cs.p[0],-24-cs.p[1]],[cs.p[0],-24-cs.p[1]],[1.5,-12],[-1.5,-12],[0,-13.5],[1.2,-13.2],[-1.2,-13.2]].map(q=>toW(st,V(q[0],0,q[1])));let best=null,ba=-1e9;
  for(const p of cands){if(!navFree(p.x,p.z))continue;const toward=V(p.x-c.x,0,p.z-c.z).dot(d);if(toward<=.15){best=p;break;}if(-toward>ba){ba=-toward;best=p;}}
  best=best||cands[0];return {p:best,h:Math.atan2(c.x-best.x,c.z-best.z)};}
function coachTo(e,done){const s=coachSpotOf(e);goTo(coach,s.p,{face:s.h,speed:1.3,done});}
function walkStatus(t){$('#walk').hidden=!t;$('#walkTxt').textContent=t||'';}
function goExercise(k){const e=EXS[k];if(!e)return;closePanels();showPlan(false);pending=k;SES.i=Math.max(0,SES.plan?SES.plan.items.findIndex(it=>it[0]===k):0);renderPlanList();
  const isBar=e.needs==='bar'||e.needs==='ez';const start=()=>{if(isBar)fetchBar(e,()=>approach(e));else if(e.needs)fetchDB(e,()=>approach(e));else approach(e);};
  if(flow==='exercise')leaveStation(start);else start();}
function approach(e){setFlow('walking');walkStatus('Off to the '+STATIONS[e.station].name);const pr=preOf(e);
  coachTo(e);goTo(hero,pr.p,{face:pr.face,land:ENTRY[e.entry].land,done:()=>arrive(e)});}
function arrive(e){EX=e;EXK=e.key;FORMS=e.forms;ST=STATIONS[e.station];form='good';
  if(e.needs==='bar'||e.needs==='ez'){ST.P.bar=hero.bar;ST.g.attach(hero.bar);}
  else if(e.needs){ST.P.db=hero.dbs;hero.dbs.forEach(d=>{if(d)ST.g.attach(d);});}
  calibrateEx(e);
  setFlow('entering');walkStatus('');cam.orbit=true;cam.center.copy(toW(ST,e.center));fitOrbitFromCam();setPreset(e.cam||'side');
  const en=ENTRY[e.entry];let steps=en.enter(ST,e);
  if(hero.carry==='backBar'&&hero.barFr)steps=[...barDownSteps({x:en.pre[0],z:en.pre[1],h:en.face}),...steps]; // the entry then sees the bar in the hands, as before
  runSeq(hero,ST,steps,()=>startExercise());}
// canonical spot (x, z, heading) the character is standing on right now
function hereC(c,st){const p=toC(st,c.pos);return {x:p.x,z:p.z,h:angDiff(c.heading,st.rot)};}
function fitOrbitFromCam(){const d=V().subVectors(cam.pos,cam.center);cam.r=d.length();cam.az=Math.atan2(d.x,d.z);cam.el=Math.asin(clamp(d.y/cam.r,-1,1));}
function startExercise(){setFlow('exercise');form='good';setForm('good');repT=matchRepStart();rep=1;fatigue=0;showHUD(true);renderExerciseUI();hero._m=null;hero._py=undefined;
  if(SES.plan)SES.done.add(EXK);}
// the rep clock starts at whichever end of the rep (top or bottom) the entry left the hands at, so the first frame does not jump
function matchRepStart(){const F=FORMS.good,T=repTiming(F);const keep=snapshot(hero),props=propState(ST.P);const B=hero.bones;
  const hands=()=>[wpos(B.LeftHand),wpos(B.RightHand),wpos(B.Hips)];const cur=hands();let best=0,bd=1e9;
  for(const t of[0,T.lower+T.touch]){drive(hero,F,t,0);const h=hands();const d=h.reduce((m,p,i)=>Math.max(m,p.distanceTo(cur[i])),0);if(d<bd-1e-4){bd=d;best=t;}}
  applySnap(hero,keep);setPropState(props);hero._m=null;return best;}
function leaveStation(then){const e=EX;showHUD(false);setForm('good');splitOn=false;twin.root.visible=false;clearGlows(MU);setFlow('leaving');
  const steps=ENTRY[e.entry].leave(ST,e);const up=e.needs==='bar'&&hero.barFr?barUpSteps(ST):[]; // a straight bar goes up onto the shoulders for the walk back
  runSeq(hero,ST,[...steps,...up],()=>{
    const P=ST.P;cam.orbit=false;
    if(e.needs==='bar'||e.needs==='ez'){scene.attach(hero.bar);P.bar=null;returnBar(()=>{then&&then();});}
    else if(e.needs){hero.dbs.forEach(d=>d&&scene.attach(d));P.db=null;returnDB(()=>{then&&then();});}else then&&then();});}

// ---- dumbbells: take a pair from the rack, carry, put back in the same slot
function pickPair(e){const want=e.dbSize||'medium';const sizes={light:[.7,.95],medium:[.9,1.2],heavy:[1.15,1.6]}[want];
  return DBR.pairs.find(p=>p.size>=sizes[0]&&p.size<=sizes[1])||DBR.pairs[0];}
function pairFrame(pair){ // canonical frame: person at (0,-12) facing +z, the pair's handles centred at (0, y, -11.45)
  if(pair.frame)return pair.frame;const w=pair.slot.clone().add(V(-.34*pair.tier,0,0)).applyMatrix4(pair.g.matrixWorld);const rot=Math.PI/2;
  const g=new THREE.Group();g.rotation.y=rot;g.position.copy(w.clone().setY(0)).sub(V(0,0,-11.45).applyAxisAngle(V(0,1,0),rot));scene.add(g);g.updateMatrixWorld(true);
  return pair.frame={g,q:qY(rot),rot,slotY:pair.slot.y,pre:toW({g},V(0,0,-12.35))};}
// where to stand for each tier, and how deep to bend: the shallowest hinge that puts both handles within reach of the hands
const DBPICK=tier=>tier===0?{z:-12.0,back:.14,hmin:44,maxDrop:.36,dx:.05}:{z:-11.8,back:.08,hmin:50,maxDrop:.14,dx:.05};
function pickupPose(c,fr,pair,k){const one=c.dbOne||(EXS[pending]&&EXS[pending].needs==='db1');const hy=fr.slotY,hz=-11.45+.34*pair.tier;
  const o=DBPICK(pair.tier);const b=bendToReach(hy,hz,o);standPose(c,{z:o.z,hinge:b.hinge,drop:b.drop,back:o.back,arms:'none',stance:.14});
  for(const s of[1,-1]){const sd=sideOf(s);if(one&&s>0){restHandThigh(c,s);continue;}armTo(c,sd,V(s*.2,hy,hz),{hd:V(0,-.55,1),pn:V(0,-1,.25),pole:V(s*.5,.1,-.8),curl:k});}}
// the free hand rests on the thigh while bending down
function restHandThigh(c,s){const sd=sideOf(s);const K=wpos(c.bones[sd+'Leg']),H=wpos(c.bones[sd+'UpLeg']);const T=torsoAxes(c);
  armTo(c,sd,H.lerp(K,.55).add(V(s*.02,.06,0)),{hd:V().subVectors(K,H).normalize(),pn:V(0,-1,0),pole:T.L.clone().multiplyScalar(s*.5).addScaledVector(T.F,-.5),curl:.45});}
// walk up, bend with open hands to the handles, close the fingers (a clear grip), a beat, then lift: the dumbbells only ever move with the hands
function fetchDB(e,then){const pair=pickPair(e);hero.pair=pair;const fr=pairFrame(pair);const z0=DBPICK(pair.tier).z;hero.dbOne=e.needs==='db1';setFlow('walking');walkStatus('Grabbing dumbbells first');
  goTo(hero,fr.pre,{face:fr.rot,land:1,done:()=>{
    runSeq(hero,fr,[{walk:[0,z0],land:1,d:.6},
      {d:1.1,pose:c=>pickupPose(c,fr,pair,.1)},
      {d:.5,pose:c=>pickupPose(c,fr,pair,1)},
      {d:.25,pose:c=>pickupPose(c,fr,pair,1)},
      {call:c=>{const one=c.dbOne;pair.dbs.forEach((d,i)=>{if(one&&i===0)return;scene.attach(d);grab(c,d,i===0?'Left':'Right',{align:'thumb'});});c.dbs=one?[null,pair.dbs[1]]:[pair.dbs[0],pair.dbs[1]];}},
      {d:1.1,pose:c=>standDB(c,{z:z0})},
      {call:c=>{c.carry=c.dbOne?'db1':'db';}},{walk:[0,-12.35],back:true,land:1,d:.9}],()=>then());}});}
// the reverse: lower them into their own slot, open the hands, stand up
function returnDB(then){const pair=hero.pair;if(!pair){then();return;}const fr=pairFrame(pair);const z0=DBPICK(pair.tier).z;walkStatus('Putting the dumbbells back');setFlow('walking');
  goTo(hero,fr.pre,{face:fr.rot,land:1,done:()=>{
    runSeq(hero,fr,[{walk:[0,z0],land:1,d:.6},{call:c=>{c.carry=null;}},{d:.5,pose:c=>standDB(c,{z:z0})},
      {d:1.2,pose:c=>pickupPose(c,fr,pair,1)},
      {d:.2,pose:c=>pickupPose(c,fr,pair,1)},
      {call:c=>{c.hold=[];pair.dbs.forEach((d,i)=>{pair.g.attach(d);d.position.copy(pair.home[i].p);d.quaternion.copy(pair.home[i].q);});c.dbs=null;}},
      {d:.5,pose:c=>pickupPose(c,fr,pair,.1)},
      {d:1.0,pose:c=>standPose(c,{z:z0})},{call:c=>{c.dbOne=false;}},{walk:[0,-12.35],back:true,land:1,d:.9}],()=>{hero.pair=null;then();});}});}
