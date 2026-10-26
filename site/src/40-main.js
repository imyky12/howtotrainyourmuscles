
// ---------------------------------------------------------------- main loop
const HERO_START=V(-.4,0,8.6),INSIDE=V(0,0,-3.4),MEET=V(.25,0,-4.75);
function update(dtReal){const dt0=paused&&flow==='exercise'?0:dtReal;const dt=flow==='exercise'?dt0:dtReal*fastF;
  ft+=dt;MU.uT.value+=dtReal;
  // lights: the gym lights flicker on, row by row, once the lifter steps in
  const tl=flow==='landing'||flow==='street'?0:1;if(tl)lightsOn=clamp(lightsOn+dt*.55,0,1);
  tubes.forEach(t=>{const on=lightsOn*7-t.userData.row;const flick=on>0&&on<1?(Math.random()<.5?0:1):on>=1?1:0;t.material.emissiveIntensity=flick*1.6;});
  inLights.forEach(([l,max])=>{l.intensity=max*smooth(clamp(lightsOn*1.2,0,1));});
  for(const c of [hero,coach,twin,...extras])if(c&&c.faceLight)c.faceLight.intensity=FACE_FILL*(.3+.15*smooth(clamp(lightsOn*1.2,0,1)));M.window.emissiveIntensity=.02+lightsOn*.55;
  signMat.emissiveIntensity=2.2*(.9+.1*Math.sin(performance.now()*.004));
  IN.traverse(o=>{if(o.userData.fan)o.userData.blades.rotation.z+=dt*9;});
  // automatic sliding doors: open when someone is within 2.2 m
  const near=[hero,coach].some(c=>c&&Math.abs(c.pos.x)<2&&c.pos.z<2.4&&c.pos.z>-2.2);doorOpen=clamp(doorOpen+(near?1:-1)*dt*1.6,0,1);
  doorL.position.x=-.35-doorOpen*.68;doorR.position.x=.35+doorOpen*.68;
  // characters
  for(const c of [hero,coach]){const a=c.act_||{};if(a.kind!=='seq'&&a.kind!=='pose')actTick(c,dt);}
  for(const m of mixers)m.update(dt);
  for(const c of [hero,coach]){const a=c.act_||{};if(a.kind==='seq')seqTick(c,dt);else postClip(c,dt);}
  for(const c of [hero,coach,twin,...extras])c&&footBlobs(c);
  if(ST&&ST.P&&ST.P.tick)ST.P.tick(); // a station's parts that follow the lifter (cables on handles being carried)
  if(coach&&coach.act_&&coach.act_.kind==='idle'&&flow!=='ask'&&flow!=='greet'&&hero)turnTo(coach,Math.atan2(hero.pos.x-coach.pos.x,hero.pos.z-coach.pos.z),dt,1.5);
  if(sayTimer>0){sayTimer-=dtReal;if(sayTimer<=0)say('',false);}
  // flow
  if(flow==='landing'&&hero){landingCam();}
  else if(flow==='street'&&swing&&swing.t<2.6){swing.t+=dt;const k=smooth(clamp(swing.t/2.6,0,1));const a1=2*Math.PI;const a=swing.a0+angDiff(a1,swing.a0)*k;
    const r=lerp(swing.r,3.6,k);cam.tPos.set(hero.pos.x+Math.sin(a)*r,lerp(swing.y,1.8,k),hero.pos.z+Math.cos(a)*r);cam.pos.copy(cam.tPos);cam.tLook.set(hero.pos.x,lerp(1.1,1.3,k),hero.pos.z);
    if(ft>.5&&ft<4)caption('Monday, 9:40 pm. Most people went home.');}
  else if(flow==='street'){followCam(hero,3.6,1.8,hero.pos.z>3?1.4:0);if(ft>.5&&ft<4)caption('Monday, 9:40 pm. Most people went home.');else caption('');
    if(hero.act_.kind==='idle'){setFlow('greet');caption('');}}
  else if(flow==='greet'){const a=ft*.25;cam.tPos.set(INSIDE.x-2.6,1.9,INSIDE.z+2.2);cam.tLook.set(MEET.x,1.35,MEET.z-.6);
    if(ft<2.6)caption('The lights know the way.');else caption('');
    if(ft>1.2&&!coach._called){coach._called=1;goTo(coach,MEET,{face:Math.atan2(INSIDE.x-MEET.x,INSIDE.z-MEET.z),done:()=>{setFlow('ask');}});}
    turnTo(hero,Math.atan2(coach.pos.x-hero.pos.x,coach.pos.z-hero.pos.z),dt,2);}
  else if(flow==='ask'){turnTo(hero,Math.atan2(coach.pos.x-hero.pos.x,coach.pos.z-hero.pos.z),dt,3);turnTo(coach,Math.atan2(hero.pos.x-coach.pos.x,hero.pos.z-coach.pos.z),dt,3);
    const mid=V().addVectors(hero.pos,coach.pos).multiplyScalar(.5);const port=innerWidth<innerHeight; // tall screens: pull back and aim low so both people sit above the choice card
    if(port){const d=V(coach.pos.x-hero.pos.x,0,coach.pos.z-hero.pos.z).normalize();let n=V(-d.z,0,d.x);if(n.x<0)n.negate(); // a three-quarter two-shot from the open side of the room
      cam.tPos.set(mid.x+n.x*3.3-d.x*1.3,2.1,mid.z+n.z*3.3-d.z*1.3);cam.tLook.set(mid.x,.55,mid.z);}
    else{cam.tPos.set(mid.x-2.4,1.75,mid.z+1.9);cam.tLook.set(mid.x+.15,1.45,mid.z);}
    if(ft>.4&&!SES.asked){$('#skip').hidden=true;SES.asked=1;chipsEl.hidden=false;say(SES.group?'Round two? Which muscle now?':'Evening! Gym’s all ours. What are we training today?');}}
  else if(flow==='plan'){const a=ft*.06;cam.tPos.set(Math.sin(a)*1.2+1.5,4.0,-1.4);cam.tLook.set(0,.4,-12.5);}
  else if(flow==='walking'){if(hero.act_.kind==='walk'||hero.act_.kind==='turn')followCam(hero,3.4,2.9,.6);
    else if(hero.act_.kind==='seq'){const a=hero.heading+2.2;cam.tPos.set(hero.pos.x+Math.sin(a)*2.4,1.7,hero.pos.z+Math.cos(a)*2.4);cam.tLook.copy(hero.pos).setY(.85);}}
  else if(flow==='exercise'){exerciseTick(dt0);}
  else if(flow==='done'){const a=ft*.1;cam.tPos.set(hero.pos.x+Math.sin(a)*3,2.2,hero.pos.z+Math.cos(a)*3);cam.tLook.copy(hero.pos).setY(1.1);}
  updateLabels();
  // camera
  if(cam.orbit){const kk=Math.min(1,dtReal*4);cam.az+=(cam.taz-cam.az)*kk;cam.el+=(cam.tel-cam.el)*kk;cam.r+=(cam.tr-cam.r)*kk;
    const rr=cam.r*(innerWidth<innerHeight?1.5:1);cam.tPos.set(cam.center.x+Math.sin(cam.az)*Math.cos(cam.el)*rr,cam.center.y+Math.sin(cam.el)*rr,cam.center.z+Math.cos(cam.az)*Math.cos(cam.el)*rr);roomRay(cam.center,cam.tPos);cam.tLook.copy(cam.center);}
  const wide=innerWidth>760,offY=Math.round(innerHeight*.22);const off=!(cam.orbit&&(flow==='exercise'))?0:wide?200:-offY;
  if(off!==cam.off||window.__offDirty){window.__offDirty=false;cam.off=off;if(!off)camera.clearViewOffset();else if(off>0)camera.setViewOffset(innerWidth+off,innerHeight,off,0,innerWidth,innerHeight);else camera.setViewOffset(innerWidth,innerHeight+offY,0,offY,innerWidth,innerHeight);}
  const k=1-Math.exp(-dtReal*cam.k);cam.pos.lerp(cam.tPos,k);cam.look.lerp(cam.tLook,k);camConstrain(cam.pos);
  camera.position.copy(cam.pos);camera.lookAt(cam.look);
  if(bubbleOn&&coach&&!bubble.classList.contains('ask')){const hp=wpos(coach.bones.Head).add(V(0,.35,0)).project(camera);
    bubble.style.left=clamp((hp.x*.5+.5)*innerWidth,190,innerWidth-190)+'px';bubble.style.top=clamp((-hp.y*.5+.5)*innerHeight,150,innerHeight-30)+'px';}}

function askAgain(){setFlow('walking');walkStatus('');SES.asked=0;closePanels();
  const meet=V(hero.pos.x,0,hero.pos.z);goTo(coach,findFree(meet,1.2),{done:()=>{coach.act_={kind:'idle'};setFlow('ask');}});}
function findFree(p,r){for(let a=0;a<12;a++){const q=V(p.x+Math.sin(a*.52)*r,0,p.z+Math.cos(a*.52)*r);if(navFree(q.x,q.z))return q;}return p;}
function finishWorkout(){setFlow('done');const g=SES.group,p=SES.plan;const sets=p.items.reduce((t,it)=>t+(parseInt(it[1])||0),0);
  const el=$('#done');el.hidden=false;el.innerHTML=`<span class="eyebrow">${g.name} day · done</span><h2>That’s a wrap</h2>
   <p>${p.items.length} exercises, about ${sets} hard sets. Every part of the ${g.name.toLowerCase()} got a turn: ${g.parts.join(', ').toLowerCase()}.</p>
   <p style="color:var(--muted)">Muscles grow while you rest. Train this group again in 2–3 days.</p>
   <div class="prow"><button class="btn" id="again">Train another muscle</button><button class="btn ghost sm" id="replay">Back to the plan</button></div>`;
  $('#again').onclick=()=>{el.hidden=true;askAgain();};$('#replay').onclick=()=>{el.hidden=true;SES.done=new Set();setFlow('plan');showPlan(true);};}
$('#fast').addEventListener('click',()=>{fastF=fastF>1?1:4;$('#fast').textContent=fastF>1?'Normal speed':'Fast-forward ››';});
function landingCam(){const h=hero.pos,wide=innerWidth>760&&innerWidth>innerHeight;
  if(wide){cam.tPos.set(h.x-.35,1.32,h.z+3.15);cam.tLook.set(h.x-.95,1.08,h.z);}
  else{cam.tPos.set(h.x,1.25,h.z+3.9);cam.tLook.set(h.x,1.62,h.z);}}
// the street frame: canonical == world, so scripted steps (turns) can be used out here
let STREET=null;
function streetFrame(){if(!STREET){const g=new THREE.Group();scene.add(g);g.updateMatrixWorld(true);STREET={g,q:qY(0),rot:0};}return STREET;}
let swing=null; // camera arc from the landing view (in front of the hero) round to behind them
function startStory(){$('#landing').classList.add('out');$('#skip').hidden=false;setFlow('street');
  const d=V().subVectors(cam.pos,hero.pos);swing={a0:Math.atan2(d.x,d.z),r:Math.hypot(d.x,d.z),y:cam.pos.y,t:0};
  // turn round on the spot to face the door, then walk in
  runSeq(hero,streetFrame(),[...turnSteps(hero.pos.x,hero.pos.z,hero.heading,Math.PI),{call:c=>{c.heading=Math.PI;}}],()=>goTo(hero,INSIDE,{face:Math.PI,speed:WALK_SPEED*1.04,land:1}));}
function skipIntro(){if(flow!=='street'&&flow!=='greet')return;$('#skip').hidden=true;lightsOn=1;caption('');hero.pos.copy(INSIDE);hero.heading=Math.PI;place(hero);hero.act_={kind:'idle'};play(hero,'idle',0);
  coach.pos.copy(MEET);coach.heading=Math.atan2(INSIDE.x-MEET.x,INSIDE.z-MEET.z);place(coach);coach.act_={kind:'idle'};play(coach,'idle',0);coach._called=1;cam.pos.set(INSIDE.x-2.4,1.75,INSIDE.z+1.6);setFlow('ask');}
$('#go').addEventListener('click',startStory);$('#skip').addEventListener('click',skipIntro);
addEventListener('keydown',e=>{if(flow==='exercise'){if(e.code==='Space'){setPaused(!paused);e.preventDefault();}
  else if(e.code==='ArrowLeft'){cam.taz+=.25;e.preventDefault();}else if(e.code==='ArrowRight'){cam.taz-=.25;e.preventDefault();}
  else if(e.code==='ArrowUp'){cam.tr=clamp(cam.tr-.25,1.3,6);e.preventDefault();}else if(e.code==='ArrowDown'){cam.tr=clamp(cam.tr+.25,1.3,6);e.preventDefault();}
  else if(e.code==='Escape')closePanels();}});

// ---------------------------------------------------------------- loading
function parseGLB(b64){return new Promise((res,rej)=>{const s=atob(b64);const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);loader.parse(u.buffer,'',res,rej);});}
async function boot(){try{const G={};for(const n of['lifter','coach','member']){G[n]=await parseGLB(window.GLB[n]);}
    hero=makeChar(G.lifter,MU);measure(hero);paintMuscles(hero);hero.root.updateMatrixWorld(true);
    twin=makeChar(G.lifter,MU2);twin.mats.forEach(m=>patchMuscleMat(m,MU2));twin.root.visible=false;stopClips(twin);
    coach=makeChar(G.coach,makeMU());
    layoutGym();
    const runner=makeChar(G.member,makeMU());runner.pos.set(8.5,.21,-21.8);runner.heading=Math.PI;place(runner);play(runner,'run',0,.85);extras.push(runner);
    buildNav();
    hero.pos.copy(HERO_START);hero.heading=0;place(hero);play(hero,'idle',0);hero.act_={kind:'idle'};
    coach.pos.set(2.2,0,-15.2);coach.heading=Math.PI;place(coach);play(coach,'idle',0);coach.act_={kind:'idle'};
    renderChips();
    const nEx=Object.keys(EXS).length,nM=Object.values(EXS).reduce((t,e)=>t+Object.keys(e.forms).length-1,0);
    $('#credit').textContent=`${Object.keys(GROUPS).length} muscle groups · ${nEx} exercises · ${nM} common mistakes. People made with MakeHuman (CC0); 3D clothing by Elvaerwyn, Mindfront and punkduck (CC-BY 4.0); walking and idle motion capture from the 100STYLE dataset by Mason, Starke and Komura (CC BY 4.0).`;
    $('#go').disabled=false;$('#go').textContent='Walk me in →';
    landingCam();cam.pos.copy(cam.tPos);cam.look.copy(cam.tLook);
    window.__ready=true;}catch(e){console.error(e);$('#go').textContent='The gym didn’t load. Reload the page';}}
if(!/[?&]paint/.test(location.search))boot();
const clock=new THREE.Clock();
// in test mode the page renders only after the test moves time on (keeps headless runs fast)
function loop(){requestAnimationFrame(loop);const dt=Math.min(.05,clock.getDelta());if(window.__ready&&!TEST)update(dt);
  if(TEST){if(!window.__dirty)return;window.__dirty=false;}
  if(splitOn&&flow==='exercise')renderSplit();else{showCeil(camera);composer.render();}}
loop();
window.__advance=sec=>{const n=Math.round(sec*30);for(let i=0;i<n;i++)update(1/30);window.__dirty=true;};
window.__api={D,get flow(){return flow},get state(){return {flow,EXK,form,hero:hero&&{p:hero.pos.toArray(),act:hero.act_&&hero.act_.kind,step:hero.act_&&hero.act_.i},coach:coach&&{p:coach.pos.toArray(),act:coach.act_&&coach.act_.kind}};},
  start:startStory,skipIntro,chooseGroup,goExercise,setForm,EXS,GROUPS,STATIONS,NAV,findPath,setPreset,cam,get hero(){return hero},get coach(){return coach},measText,
  seek:t=>{repT=t;rep=1;fatigue=0;speed=0;lastPhase=-1;},setSpeed:s=>speed=s,openMistakes,enterLearn,learnClick:sel=>learnEl.querySelector(sel)?.click(),get FORMS(){return FORMS},
  fast:f=>fastF=f,camera,toW,DBR};
// test helper: every walk-up spot and coach spot must be reachable
window.__checkSpots=()=>{const out=[];const near=(p)=>NAV.boxes.filter(([x0,x1,z0,z1])=>p.x>x0-NAV_R&&p.x<x1+NAV_R&&p.z>z0-NAV_R&&p.z<z1+NAV_R).map(b=>b.map(v=>+v.toFixed(2)));
  for(const k in EXS){const e=EXS[k];const st=STATIONS[e.station];if(!st){out.push(k+': no station '+e.station);continue;}const pr=preOf(e);if(!navFree(pr.p.x,pr.p.z))out.push(k+' pre blocked '+pr.p.toArray().map(v=>v.toFixed(2))+' by '+JSON.stringify(near(pr.p)));
    const cp=coachSpotOf(e).p;if(!navFree(cp.x,cp.z))out.push(k+' coach blocked '+cp.toArray().map(v=>v.toFixed(2))+' by '+JSON.stringify(near(cp)));
    else if(!findPath(V(0,0,-4),cp))out.push(k+' coach unreachable');if(navFree(pr.p.x,pr.p.z)&&!findPath(V(0,0,-4),pr.p))out.push(k+' pre unreachable');}
  for(const pr of DBR.pairs){const f=pairFrame(pr);if(!navFree(f.pre.x,f.pre.z))out.push('db pair blocked '+f.pre.toArray().map(v=>v.toFixed(2)));}
  return out;};
// test helper: put the lifter straight on an exercise (no walking), for close-up checks
window.__studio=(k)=>{const e=EXS[k];closePanels();showPlan(false);$('#landing').classList.add('out');lightsOn=1;
  if(flow==='exercise'&&EX&&EX.needs&&hero.dbs){hero.dbs.forEach(d=>d&&scene.attach(d));const pr=hero.pair;hero.hold=[];pr.dbs.forEach((d,i)=>{pr.g.attach(d);d.position.copy(pr.home[i].p);d.quaternion.copy(pr.home[i].q);});hero.dbs=null;ST.P.db=null;}
  if(e.needs==='db'||e.needs==='db1'){const pair=pickPair(e);hero.pair=pair;const one=e.needs==='db1';hero.dbs=one?[null,pair.dbs[1]]:[pair.dbs[0],pair.dbs[1]];hero.dbOne=one;}
  if(hero.barFr){const fr=hero.barFr;fr.home.parent.attach(fr.bar);fr.bar.position.copy(fr.home.p);fr.bar.quaternion.identity();hero.bar=null;hero.barFr=null;}
  if(e.needs==='bar'||e.needs==='ez'){const fr=barFrame(e.needs);hero.barFr=fr;hero.bar=fr.bar;}
  stopClips(hero);hero.act_={kind:'pose'};hero.carry=null;hero.hold=[];
  EX=e;EXK=k;FORMS=e.forms;ST=STATIONS[e.station];form='good';
  if(e.needs==='bar'||e.needs==='ez'){ST.P.bar=hero.bar;ST.g.attach(hero.bar);}
  else if(e.needs){ST.P.db=hero.dbs;hero.dbs.forEach(d=>d&&ST.g.attach(d));}
  if(ST.P.rest)ST.P.rest();if(e.pulley&&ST.P.setPulley){ST.P.setPulley(e.pulley);ST.P.use&&ST.P.use(e.att);ST.P.rest();}
  calibrateEx(e);const cs=coachSpotOf(e);coach.pos.copy(cs.p);coach.heading=cs.h;place(coach);coach.act_={kind:'idle'};play(coach,'idle',0);
  cam.orbit=true;cam.center.copy(toW(ST,e.center));setPreset(e.cam||'side');cam.az=cam.taz;cam.el=cam.tel;cam.r=cam.tr;startExercise();$('#landing').hidden=true;__advance(.1);cam.pos.copy(cam.tPos);cam.look.copy(cam.tLook);__advance(1/30);};
// test helper: is a point inside a wall, the facade or any piece of equipment?
window.__insideSolid=(p)=>{const bb=new THREE.Box3();for(const m of [...FACADE,...WALLS]){bb.setFromObject(m);if(bb.containsPoint(p))return m===WALLS[0]?'left wall':'wall/facade';}return null;};
window.__walkCheck=(sec)=>{const out={cam:[],hero:0,coach:0,frames:0};const n=Math.round(sec*30);
  for(let i=0;i<n;i++){update(1/30);out.frames++;const w=__insideSolid(camera.position);if(w)out.cam.push(flow+' '+camera.position.toArray().map(v=>v.toFixed(2)).join(',')+' '+w);
    for(const [c,k] of [[hero,'hero'],[coach,'coach']]){const a=c.act_||{};if(a.kind==='walk'||a.kind==='idle'||a.kind==='turn'){if(!navSolidFree(c.pos.x,c.pos.z,.18))out[k]++;}}}
  window.__dirty=true;return out;};
function navSolidFree(x,z,r){for(const [x0,x1,z0,z1] of NAV.boxes){if(x>x0-r&&x<x1+r&&z>z0-r&&z<z1+r)return false;}return true;}
