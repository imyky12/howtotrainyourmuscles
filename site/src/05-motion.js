
// ---------------------------------------------------------------- motion: walking on paths, turning, scripted sequences
// A character is always in one "activity": idle (clip), walk (path), seq (scripted keyframes), or ex (exercise driver).
// When a clip takes over from a scripted pose, the last pose fades out over 0.35 s so nothing pops.
function fadeFromPose(c,dur=.35){c.fade={s:snapshot(c),t:0,dur};}
function applyFade(c,dt){if(!c.fade)return;const f=c.fade;f.t+=dt;const k=1-smooth(clamp(f.t/f.dur,0,1));if(k<=0){c.fade=null;return;}
  const r=c.root;for(const n in c.bones){const b=c.bones[n];b.quaternion.slerp(f.s.b[n],k);}c.bones.Hips.position.lerp(f.s.hl,k);r.updateMatrixWorld(true);}
// arms override while walking (carrying dumbbells or a bar); called after the mixer has posed the body
function carryArms(c,ph){if(!c.carry)return;const B=c.bones;c.root.updateMatrixWorld(true);const T=torsoAxes(c);const sw=Math.sin(ph)*.08;
  if(c.carry==='db'||c.carry==='db1'){for(const s of[1,-1]){const side=sideOf(s);const ua=T.U.clone().negate().addScaledVector(T.L,s*.18).addScaledVector(T.F,s*sw);
      armDir(c,side,ua,ua,T.L.clone().multiplyScalar(-s),{hd:T.U.clone().negate(),curl:1});}}
  else if(c.carry==='bar'){for(const s of[1,-1]){const side=sideOf(s);const ua=T.U.clone().negate().addScaledVector(T.F,.28).addScaledVector(T.L,s*.05);const fa=T.U.clone().negate().addScaledVector(T.F,.55);
      armDir(c,side,ua,fa,T.F.clone().negate(),{hd:T.U.clone().negate().addScaledVector(T.F,.3),curl:1});}}
  else if(c.carry==='backBar'){backBarHands(c,barOnBack(c));}
  else if(c.carry==='frontBar'){frontRackHands(c,null);}
  holdUpdate(c);}
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
  const P=findPath(c.pos,target,o.ignoreOthers?[]:others(c));
  if(!P){console.warn('no path',c===hero?'hero':'coach',c.pos.toArray().map(v=>v.toFixed(2)),target.toArray().map(v=>v.toFixed(2)));c.act_={kind:'teleport',target,o};return false;}
  if(c.act_&&c.act_.kind==='seq')endSeq(c);
  c.act_={kind:'walk',P,L:pathLen(P),s:0,v:0,face:o.face,done:o.done,speed:o.speed||1.25,ph:0};return true;}
function walkTick(c,dt){const a=c.act_;const rem=a.L-a.s;
  // yield: the coach waits if the lifter is right in front
  if(c===coach&&hero&&hero.root.visible){const d=V(hero.pos.x-c.pos.x,0,hero.pos.z-c.pos.z);const fwd=V(Math.sin(c.heading),0,Math.cos(c.heading));if(d.length()<.95&&d.dot(fwd)>.3){a.v=Math.max(0,a.v-dt*3);play(c,'idle',.3);return;}}
  const want=Math.min(a.speed,Math.sqrt(Math.max(0,rem)*2.2)+.25);
  const look=pathAt(a.P,Math.min(a.L,a.s+.45));const tdir=look.dir;const dh=Math.abs(angDiff(Math.atan2(tdir.x,tdir.z),c.heading));
  const target=want*(1-.55*Math.min(1,dh/1.4));a.v+=clamp(target-a.v,-dt*2.5,dt*1.8);if(a.v<.12&&rem>.05)a.v=.12;
  a.s=Math.min(a.L,a.s+a.v*dt);const at=pathAt(a.P,a.s);c.pos.set(at.p.x,0,at.p.z);
  const hd=Math.atan2(at.dir.x,at.dir.z);c.heading+=angDiff(hd,c.heading)*Math.min(1,dt*7);
  place(c);play(c,'walk',.3,Math.max(.45,a.v/1.25));a.ph+=dt*a.v*5.3;
  if(a.s>=a.L-.005){if(a.face!==undefined&&Math.abs(angDiff(a.face,c.heading))>.06){c.act_={kind:'turn',h:a.face,done:a.done};}
    else{c.act_={kind:'idle'};play(c,'idle',.4);a.done&&a.done();}}}
function turnTick(c,dt){const a=c.act_;const d=angDiff(a.h,c.heading);const st=Math.sign(d)*Math.min(Math.abs(d),dt*2.4);c.heading+=st;place(c);
  play(c,'walk',.25,.55);if(Math.abs(d)<.03){c.heading=a.h;place(c);c.act_={kind:'idle'};play(c,'idle',.35);a.done&&a.done();}}

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
    if(S.walk){const to=toW(a.st,V(S.walk[0],0,S.walk[1]));a.from=c.pos.clone();a.to=to;a.d=S.d||Math.max(.6,c.pos.distanceTo(to)/(S.back?.45:.8));}
    else{a.h=headingW(a.st,S.turn);}return;}
  if(c.cur){stopClips(c);}a.from=snapshot(c);}
function standFromRoot(c){const p=c.root.position;c.pos.set(p.x,0,p.z);const f=V(0,0,1).applyQuaternion(c.root.quaternion);c.heading=Math.atan2(f.x,f.z);}
function endSeq(c){const a=c.act_;c.act_={kind:'pose'};}
function seqTick(c,dt){const a=c.act_;const S=a.steps[a.i];if(!S)return;a.t+=dt;
  if(S.walk){const k=clamp(a.t/a.d,0,1);c.pos.lerpVectors(a.from,a.to,smooth(k));place(c);play(c,'walk',.25,S.back?-.6:.7);
    clipPost(c,dt);if(k>=1){play(c,'idle',.3);nextStep(c);}return;}
  if(S.turn!==undefined){const d=angDiff(a.h,c.heading);c.heading+=Math.sign(d)*Math.min(Math.abs(d),dt*2.2);place(c);play(c,'walk',.25,.5);clipPost(c,dt);if(Math.abs(d)<.03){c.heading=a.h;place(c);play(c,'idle',.3);nextStep(c);}return;}
  const k=clamp(a.t/S.d,0,1);
  if(S.anim){S.anim(c,k);frame(c,a.st);}
  else{S.pose(c,k);frame(c,a.st);const B=snapshot(c);blendTo(c,a.from,B,S.lin?k:ease(k));}
  holdUpdate(c);S.props&&S.props(c,k);
  if(k>=1)nextStep(c);}
function actTick(c,dt){const a=c.act_||{kind:'idle'};
  if(a.kind==='walk')walkTick(c,dt);else if(a.kind==='turn')turnTick(c,dt);else if(a.kind==='teleport'){c.pos.copy(a.target);if(a.o.face!==undefined)c.heading=a.o.face;place(c);c.act_={kind:'idle'};a.o.done&&a.o.done();}}
// after the mixer: apply overrides that depend on the clip pose
function postClip(c,dt){if(c.cur)clipPost(c,dt);}
function clipPost(c,dt){const a=c.act_||{};c.root.updateMatrixWorld(true);applyFade(c,dt);if(c.carry)carryArms(c,a.ph||c._ph||0);else holdUpdate(c);}
