
// ---------------------------------------------------------------- motion: walking on paths, turning, scripted sequences
// A character is always in one "activity": idle (clip), walk (path), seq (scripted keyframes), or ex (exercise driver).
// When a clip takes over from a scripted pose, the last pose fades out over 0.35 s so nothing pops.
function fadeFromPose(c,dur=.35,s){c.fade={s:s||snapshot(c),t:0,dur};}
// a foot that is on the floor in both poses never dips under it on the way (the root is lifted by the dip; place() resets it)
function applyFade(c,dt){if(c._lift){c.root.position.y-=c._lift;c._lift=0;c.root.updateMatrixWorld(true);}if(!c.fade)return;const f=c.fade;f.t+=dt;const k=1-smooth(clamp(f.t/f.dur,0,1));if(k<=0){c.fade=null;return;}
  const r=c.root;r.updateMatrixWorld(true);const m0=footMin(c);for(const n in c.bones){const b=c.bones[n];b.quaternion.slerp(f.s.b[n],k);}c.bones.Hips.position.lerp(f.s.hl,k);r.updateMatrixWorld(true);
  const lim=Math.min(m0,f.s.fmin??m0,.04);const cur=footMin(c);if(cur<lim-1e-4){c._lift=lim-cur;r.position.y+=c._lift;r.updateMatrixWorld(true);}}
// arms override while walking (carrying dumbbells or a bar); called after the mixer has posed the body
function carryArms(c,ph){if(!c.carry)return;const B=c.bones;c.root.updateMatrixWorld(true);const T=torsoAxes(c);const sw=Math.sin(ph)*.08;
  if(c.carry==='db'||c.carry==='db1')dbHangArms(c,sw);
  else if(c.carry==='bar'){holdBarThighs(c);}
  else if(c.carry==='backBar'){if(c.barGrip)barBackHands(c,c.barGrip);else backBarHands(c,barOnBack(c));}
  else if(c.carry==='frontBar'){frontRackHands(c,null);}
  holdUpdate(c);}
// arms hanging at the sides holding dumbbells, swung forward/back by sw (the same arms standDB uses, so walking and standing match)
function dbHangArms(c,sw=0){const T=torsoAxes(c);for(const s of[1,-1]){const ua=T.U.clone().negate().addScaledVector(T.L,s*.18).addScaledVector(T.F,s*sw);
  armDir(c,sideOf(s),ua,ua,T.L.clone().multiplyScalar(-s),{hd:T.U.clone().negate(),curl:1});}}
// held props follow the hands
function holdUpdate(c){for(const h of c.hold){const f=handFrame(c,h.side);const p=f.p.addScaledVector(f.hd,(h.palm??.075)*D.s).addScaledVector(f.pn,(h.off??.022)*D.s);
  if(h.other){const p2=gripPoint(c,h.other);p.add(p2).multiplyScalar(.5);}
  const par=h.obj.parent;par.updateMatrixWorld(true);
  if(h.align==='thumb'){const q=new THREE.Quaternion().setFromUnitVectors(V(1,0,0),f.tz.normalize());h.obj.quaternion.copy(par.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));}
  else if(h.align==='bar'&&h.other){const d=V().subVectors(gripPoint(c,'Left'),gripPoint(c,'Right')).normalize();const q=new THREE.Quaternion().setFromUnitVectors(V(1,0,0),d);h.obj.quaternion.copy(par.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));}
  h.obj.position.copy(par.worldToLocal(p));}}
function grab(c,obj,side,o={}){c.hold=c.hold.filter(h=>h.obj!==obj);c.hold.push({obj,side,...o});}
function release(c,obj){c.hold=c.hold.filter(h=>h.obj!==obj);}

// ---- walking along a planned path
function others(c){return [hero,coach,...extras].filter(o=>o&&o!==c&&o.root.visible).map(o=>({x:o.pos.x,z:o.pos.z,r:.75}));}
function goTo(c,target,o={}){ // target world (x,z), o.face = world heading at the end, o.done callback
  let P=findPath(c.pos,target,o.ignoreOthers?[]:others(c));
  // a short step that someone standing nearby blocks on the grid: step straight there rather than teleport
  if(P&&P[0].distanceTo(V(c.pos.x,0,c.pos.z))>1e-3)P.unshift(c.pos.clone().setY(0)); // start and goal in one grid cell: the path is just the goal
  if(!P&&c.pos.distanceTo(V(target.x,0,target.z))<1.2&&navLOS(c.pos,target))P=[c.pos.clone().setY(0),target.clone().setY(0)];
  if(!P){console.warn('no path',c===hero?'hero':'coach',c.pos.toArray().map(v=>v.toFixed(2)),target.toArray().map(v=>v.toFixed(2)));c.act_={kind:'teleport',target,o};return false;}
  if(c.act_&&c.act_.kind==='seq')endSeq(c);
  c.act_={kind:'walk',P,L:pathLen(P),s:0,v:0,face:o.face,done:o.done,speed:o.speed||1.25,ph:0,land:o.land};return true;}
function walkTick(c,dt){const a=c.act_;const rem=a.L-a.s;
  // yield: the coach waits if the lifter is right in front
  if(c===coach&&hero&&hero.root.visible){const d=V(hero.pos.x-c.pos.x,0,hero.pos.z-c.pos.z);const fwd=V(Math.sin(c.heading),0,Math.cos(c.heading));if(d.length()<.95&&d.dot(fwd)>.3){a.v=Math.max(0,a.v-dt*3);play(c,'idle',.3);return;}}
  const want=Math.min(a.speed,Math.sqrt(Math.max(0,rem)*2.2)+.25);
  const look=pathAt(a.P,Math.min(a.L,a.s+.45));const tdir=look.dir;const dh=Math.abs(angDiff(Math.atan2(tdir.x,tdir.z),c.heading));
  const target=want*(1-.55*Math.min(1,dh/1.4));a.v+=clamp(target-a.v,-dt*2.5,dt*1.8);if(a.v<.12&&rem>.05)a.v=.12;
  a.s=Math.min(a.L,a.s+a.v*dt);const at=pathAt(a.P,a.s);c.pos.set(at.p.x,0,at.p.z);
  const hd=Math.atan2(at.dir.x,at.dir.z);c.heading+=clamp(angDiff(hd,c.heading)*Math.min(1,dt*7),-dt*3.5,dt*3.5);
  place(c);c._ph=(c._ph||0)+dt*a.v*5.3;
  // o.land: over the last 0.7 m the clip follows the distance (no skating) and stops as the swinging foot passes the planted one
  const rm=a.L-a.s;const wa=c.act.walk;
  if(a.land&&c.cur!==wa){play(c,'walk',.3,Math.max(.45,a.v/1.25));wa.time=c._wph??WALK_PASS[0];} // a landed walk carries on from the phase it stopped at
  if(a.land&&!a.wk&&c.cur===wa&&rm<1.4){const m=walkLand(c,wa.time,rm/WALK_STRIDE).m;if((m>.78&&m<1.02)||rm<.3)a.rem0=Math.max(rm,1e-3);} // start where the stride lands without hurrying
  if(a.land&&a.rem0&&c.cur===wa){walkSync(c,a,1-rm/a.rem0,a.rem0,false);}else play(c,'walk',.3,Math.max(.45,a.v/1.25));
  if(a.s>=a.L-.005){if(a.face!==undefined&&Math.abs(angDiff(a.face,c.heading))>.06){c.act_={kind:'turn',h:a.face,done:a.done,land:a.land};}
    else{c.act_={kind:'idle'};play(c,'idle',.4);a.done&&a.done();}}}
function turnTick(c,dt){const a=c.act_;if(a.h0===undefined)a.h0=Math.abs(angDiff(a.h,c.heading));const d=angDiff(a.h,c.heading);const st=Math.sign(d)*Math.min(Math.abs(d),dt*(a.land?1.7:2.4));c.heading+=st;place(c);
  if(a.land)walkSync(c,a,a.h0>1e-3?1-Math.abs(angDiff(a.h,c.heading))/a.h0:1,a.h0*.3,false);else play(c,'walk',.25,.55);if(Math.abs(d)<.03){c.heading=a.h;place(c);c.act_={kind:'idle'};play(c,'idle',.35);a.done&&a.done();}}

// ---- scripted sequences
// steps: {d, pose:(c,k)=>void}  blend from the previous pose to pose(), eased   (pose solved in st's canonical frame)
//        {d, anim:(c,k)=>void}  pose() animates by itself (no blend)
//        {walk:[x,z] canonical, d, back:true}  a few steps on the spot's floor using the walk clip
//        {turn: canonical heading}  turn on the spot
//        {call: fn}  instant
function runSeq(c,st,steps,done){if(c.act_&&c.act_.kind==='walk'){}c.act_={kind:'seq',st,steps,i:-1,t:0,done};nextStep(c);}
function nextStep(c){const a=c.act_;a.i++;a.t=0;if(a.i>=a.steps.length){const done=a.done;endSeq(c);done&&done();return;}
  const S=a.steps[a.i];
  if(S.call){S.call(c);nextStep(c);return;}
  if(S.walk||S.turn!==undefined){ // clip-driven steps start from the current standing spot
    if(!c.cur){c.root.updateMatrixWorld(true);standFromRoot(c);fadeFromPose(c,.3);play(c,'idle',0);}
    a.wk=null;if(S.walk){const to=toW(a.st,V(S.walk[0],0,S.walk[1]));a.from=c.pos.clone();a.to=to;a.d=S.d||Math.max(.6,c.pos.distanceTo(to)/(S.back?.45:.8));if(S.land)a.d=Math.max(a.d,c.pos.distanceTo(to)/(S.back?.6:.9));}
    else{a.h=headingW(a.st,S.turn);}return;}
  if(c.cur){stopClips(c);}a.from=snapshot(c);}
function standFromRoot(c){const p=c.root.position;c.pos.set(p.x,0,p.z);const f=V(0,0,1).applyQuaternion(c.root.quaternion);c.heading=Math.atan2(f.x,f.z);}
function endSeq(c){const a=c.act_;c.act_={kind:'pose'};}
function seqTick(c,dt){const a=c.act_;const S=a.steps[a.i];if(!S)return;a.t+=dt;
  if(S.walk){const k=clamp(a.t/a.d,0,1);c.pos.lerpVectors(a.from,a.to,smooth(k));place(c);
    // the steps follow the body's eased speed (slow at the start and the stop), so the feet don't swing at full speed while the body stops
    const v=Math.max(.35,6*k*(1-k)/1.5);if(S.land)walkSync(c,a,smooth(k),a.from.distanceTo(a.to)*(S.back?-1:1));else play(c,'walk',.25,(S.back?-.6:.7)*v);c._ph=(c._ph||0)+dt*(S.back?3:4)*v;
    clipPost(c,dt);if(k>=1){play(c,'idle',.3);nextStep(c);}return;}
  if(S.turn!==undefined){if(a.h0===undefined)a.h0=Math.abs(angDiff(a.h,c.heading));const d=angDiff(a.h,c.heading);c.heading+=Math.sign(d)*Math.min(Math.abs(d),dt*2.2);place(c);
    if(S.land)walkSync(c,a,a.h0>1e-3?1-Math.abs(angDiff(a.h,c.heading))/a.h0:1,a.h0*.3);else play(c,'walk',.25,.42);clipPost(c,dt);if(Math.abs(d)<.03){c.heading=a.h;place(c);play(c,'idle',.3);a.h0=undefined;nextStep(c);}return;}
  const k=clamp(a.t/S.d,0,1);
  if(S.anim){S.anim(c,k);frame(c,a.st);}
  else{S.pose(c,k);frame(c,a.st);const B=snapshot(c);blendTo(c,a.from,B,S.lin?k:ease(k));}
  holdUpdate(c);S.props&&S.props(c,k);
  if(k>=1)nextStep(c);}
// {walk|turn, land:true}: the walk clip is driven by the distance travelled (the planted foot stays put instead of skating) and is
// timed to finish where the swinging foot passes the planted one, slowing to a stop with the body: the step that follows sets
// that foot down instead of the clip freezing mid-stride. A walk that starts from a still pose starts from that phase too.
const WALK_STRIDE=1.27; // metres of travel per second of the walk clip (how fast its planted foot moves back)
const WALK_PASS=[.09,.545]; // clip times where the swinging foot passes the planted one
// the pass-phase clip time to finish at, from clip time t0 with A0 clip-seconds of travel ahead: {T, m = how much faster the clip runs}
// (a hurried clip swings the foot fast, so slowing down is preferred to speeding up, and more than a third faster is never
// chosen: a stalled clip (a pivot on the spot) is better than a flicked foot)
function walkLand(c,t0,A0){const L=c.act.walk._clip.duration;let best=null,bs=1e9,bm=1;
  for(let n=-3;n<=4;n++)for(const P of WALK_PASS){const T=P+n*L;const dd=T-t0;if(dd*A0<-2e-3)continue;
    const m=Math.abs(A0)>1e-3?dd/A0:9;const lm=Math.log(Math.max(m,1e-3));const sc=m>1.35?100+m:(lm>0?lm*3:-lm);if(sc<bs){bs=sc;best=T;bm=m;}}
  return {T:best??t0,m:bm};}
// (now: pose the bones at once; walkTick/turnTick run before the mixer update, which poses them, so they leave it false)
function walkSync(c,a,ks,dist,now=true){const act=c.act.walk,L=act._clip.duration;
  if(!a.wk){const fresh=c.cur!==act;play(c,'walk',.25,0);if(fresh)act.time=c._wph??WALK_PASS[0];const t0=act.time;a.wk={t0,T:walkLand(c,t0,dist/WALK_STRIDE).T};}
  else play(c,'walk',.25,0);
  // (the mixer only writes a bone whose value changed since the last frame: a clip held at one time would let a fade or an
  // override stick, so the time is nudged by a tenth of a millisecond every other frame)
  c._wflip=!c._wflip;const t=a.wk.t0+(a.wk.T-a.wk.t0)*ks+(c._wflip?1e-4:0);act.time=((t%L)+L)%L;c._wph=act.time;if(now)c.mixer.update(0);}
function actTick(c,dt){const a=c.act_||{kind:'idle'};
  if(a.kind==='walk')walkTick(c,dt);else if(a.kind==='turn')turnTick(c,dt);else if(a.kind==='teleport'){c.pos.copy(a.target);if(a.o.face!==undefined)c.heading=a.o.face;place(c);c.act_={kind:'idle'};a.o.done&&a.o.done();}}
// after the mixer: apply overrides that depend on the clip pose
function postClip(c,dt){if(c.cur)clipPost(c,dt);}
function clipPost(c,dt){c.root.updateMatrixWorld(true);applyFade(c,dt);clipFloor(c);if(c.carry)carryArms(c,c._ph||0);else holdUpdate(c);c._disp=snapshot(c);}
// the walk clip played backwards (stepping back out of a station) dips a toe a few mm into the floor: lift the body by that much
function clipFloor(c){const m=footMin(c);if(m<.016){const d=.016-m;c._lift=(c._lift||0)+d;c.root.position.y+=d;c.root.updateMatrixWorld(true);}} // undone by applyFade next frame, like its own lift
