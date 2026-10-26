
// ---------------------------------------------------------------- arms: biceps (6) and triceps (6)
// carry a straight bar or EZ bar from the wall rack, and put it back
// grip the bar on the rack with open hands, close the fingers, a beat, lift it off the rail and step back. The straight bar then
// goes up onto the shoulders (mid -> chest -> overhead -> behind the head -> upper back) for the walk; the EZ bar stays in the hands.
function fetchBar(e,then){const fr=barFrame(e.needs);hero.barFr=fr;const straight=e.needs==='bar';hero.barGrip=straight?.33*D.s:null;setFlow('walking');walkStatus(e.needs==='ez'?'Grabbing the EZ bar':'Grabbing a barbell');
  goTo(hero,fr.pre,{face:fr.rot,land:1,done:()=>{runSeq(hero,fr,[{walk:[0,-11.8],land:1,d:.8},
    {d:1.1,pose:c=>barPickPose(c,fr,.1,c.barGrip)},{d:.5,pose:c=>barPickPose(c,fr,1,c.barGrip)},{d:.25,pose:c=>barPickPose(c,fr,1,c.barGrip)},
    {call:c=>{scene.attach(fr.bar);grab(c,fr.bar,'Left',{other:'Right',align:'bar'});c.bar=fr.bar;}},
    {d:1.0,pose:c=>barStage(c,'thighs',{z:-11.8})},{call:c=>{c.carry='bar';}},{walk:[0,-12.5],back:true,land:1,d:.9},
    ...(straight?barUpSteps(fr):[])],()=>then());}});}
function returnBar(then){const fr=hero.barFr;if(!fr){then();return;}walkStatus('Putting the bar back');setFlow('walking');
  goTo(hero,fr.pre,{face:fr.rot,land:1,done:()=>{runSeq(hero,fr,[...(hero.carry==='backBar'?barDownSteps({x:0,z:-12.5,h:0}):[]),
    {walk:[0,-11.8],land:1,d:.8},{call:c=>{c.carry=null;}},{d:1.2,pose:c=>barPickPose(c,fr,1,c.barGrip)},{d:.2,pose:c=>barPickPose(c,fr,1,c.barGrip)},
    {call:c=>{c.hold=[];fr.home.parent.attach(fr.bar);fr.bar.position.copy(fr.home.p);fr.bar.quaternion.identity();c.bar=null;}},
    {d:.5,pose:c=>barPickPose(c,fr,.1,c.barGrip)},{d:1.0,pose:c=>standPose(c,{z:-11.8})},{walk:[0,-12.5],back:true,land:1,d:.9}],()=>{hero.barFr=null;hero.barGrip=null;then();});}});}
function holdBarThighs(c,grip){const g=grip||c.barGrip||.19;const T=torsoAxes(c);const ct=wpos(c.bones.Hips).addScaledVector(T.F,.17).addScaledVector(T.U,-.22);
  for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().addScaledVector(T.L,s*g),{hd:V(0,-1,0),pn:T.F.clone().negate(),pole:T.F.clone().negate().addScaledVector(T.L,s*.3)});}
// hands on a bar resting across the upper back, `g` out from the centre
function barBackHands(c,g){const ct=barOnBack(c);const T=torsoAxes(c);for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().addScaledVector(T.L,s*g),{hd:T.U.clone().addScaledVector(T.F,.3),pn:T.F.clone().negate(),pole:T.U.clone().negate().addScaledVector(T.F,-.5).addScaledVector(T.L,s*.2)});}
// standing at o (canonical x, z, heading) with the bar at one stage of the lift onto the shoulders; the bar follows the hands
function barStage(c,stage,o={}){const up=stage==='over'||stage==='overBack';standPose(c,{x:o.x||0,z:o.z??-12,h:o.h||0,arms:'none',look:up?14:0});const T=torsoAxes(c);const g=c.barGrip||.19;
  if(stage==='thighs')return holdBarThighs(c,g);
  if(stage==='back')return barBackHands(c,g);
  const [a,b]=shoulders(c);const S=a.add(b).multiplyScalar(.5);let ct,hd,pn,pole;
  if(stage==='mid'){ct=wpos(c.bones.Hips).addScaledVector(T.F,.3).addScaledVector(T.U,.08);hd=T.F;pn=T.U;pole=s=>T.L.clone().multiplyScalar(s*.3).addScaledVector(T.U,-1);}
  else if(stage==='chest'){ct=S.clone().addScaledVector(T.F,.17).addScaledVector(T.U,-.1);hd=T.U.clone().addScaledVector(T.F,-.15);pn=T.F.clone().negate();pole=s=>T.U.clone().negate().addScaledVector(T.L,s*.5);}
  else if(stage==='over'){ct=S.clone().addScaledVector(T.U,.5);hd=T.F.clone().addScaledVector(T.U,.4);pn=T.U.clone().addScaledVector(T.F,-.35);pole=s=>T.L.clone().multiplyScalar(s).addScaledVector(T.F,.3);}
  else {ct=S.clone().addScaledVector(T.U,.32).addScaledVector(T.F,-.2);hd=T.U.clone().addScaledVector(T.F,.4);pn=T.F.clone().negate().addScaledVector(T.U,.3);pole=s=>T.L.clone().multiplyScalar(s).addScaledVector(T.F,-.2);}
  for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().addScaledVector(T.L,s*g),{hd,pn,pole:pole(s)});}
// steps that take the bar from the hands at the thighs up onto the shoulders where the character stands (st = the frame of the sequence)
function barUpSteps(st){const at=c=>c._spot||{};return [{call:c=>{if(!c.cur){c.root.updateMatrixWorld(true);standFromRoot(c);}c._spot=hereC(c,st);}},
  {d:.7,pose:c=>barStage(c,'mid',at(c))},{d:1.0,pose:c=>barStage(c,'chest',at(c))},{d:1.25,pose:c=>barStage(c,'over',at(c))},
  {d:.7,pose:c=>barStage(c,'overBack',at(c))},{d:.9,pose:c=>barStage(c,'back',at(c))},{call:c=>{c.carry='backBar';}}];}
// and back down into the hands at the thighs, at the canonical spot o
function barDownSteps(o){return [{d:.8,pose:c=>barStage(c,'overBack',o)},{d:.8,pose:c=>barStage(c,'over',o)},{d:1.25,pose:c=>barStage(c,'chest',o)},
  {d:.7,pose:c=>barStage(c,'mid',o)},{d:.7,pose:c=>barStage(c,'thighs',o)},{call:c=>{c.carry='bar';}}];}

// ---- blending into a pose with the feet kept on the floor
// A plain pose step lerps every joint, so between standing and sitting the feet dip under the floor. settle(B) is an
// anim step: it blends from the pose the lifter is in to B while each ankle and toe slides straight between where it
// was and where B puts it, and the legs are re-solved to those points every frame.
function unframe(c,st){if(!st)return;c.root.position.applyMatrix4(st.g.matrixWorld.clone().invert());c.root.quaternion.premultiply(st.q.clone().invert());c.root.updateMatrixWorld(true);}
function feetOf(c){return [1,-1].map(s=>{const sd=sideOf(s);return {A:wpos(c.bones[sd+'Foot']),K:wpos(c.bones[sd+'Leg']),T:wpos(c.bones[sd+'ToeBase']),H:wpos(c.bones[sd+'UpLeg'])};});}
// the knee's offset square to the hip-ankle line (which way the knee points, whatever the leg's own direction)
function kneeOff(K,H,A){const v=K.clone().sub(H),l=A.clone().sub(H).normalize();return v.addScaledVector(l,-v.dot(l));}
function settle(B,o={}){let sa=null,fa=null,pk=[null,null];return (c,k)=>{const st=c.act_&&c.act_.st;
  if(!sa){unframe(c,st);sa=snapshot(c);fa=feetOf(c);}
  B(c,k);const sb=snapshot(c),fb=feetOf(c);const t=o.lin?k:ease(k);blendTo(c,sa,sb,t);
  for(const [i,s] of [1,-1].entries()){const sd=sideOf(s);
    // o.step: the feet move one after the other with a small lift (a shuffle), else they slide together
    const ft=o.step?smooth(clamp((k-i*.45)/.55,0,1)):t;const lift=o.step?Math.pow(Math.sin(Math.PI*ft),2)*.06:0; // (squared: a straight leg's knee goes as the root of the lift, so it eases off the floor instead of popping)
    const ank=fa[i].A.clone().lerp(fb[i].A,ft).add(V(0,lift,0)),toe=fa[i].T.clone().lerp(fb[i].T,ft).add(V(0,lift,0));
    if(o.arc){const a=Math.pow(Math.sin(Math.PI*ft),2);ank.addScaledVector(o.arc,a);toe.addScaledVector(o.arc,a);}
    // (plus a little of the pelvis' forward: a nearly straight leg has almost no knee offset to go by, so the knee stays forward)
    // knee direction: between the two poses' knee offsets, biased to last frame's so the knee never flips when the leg passes straight; o.kneeUp keeps it up
    const hip=wpos(c.bones[sd+'UpLeg']);const pole=kneeOff(fa[i].K,fa[i].H,fa[i].A).lerp(kneeOff(fb[i].K,fb[i].H,fb[i].A),ft);if(pk[i])pole.addScaledVector(kneeOff(pk[i],hip,ank),.5);if(o.kneeUp)pole.add(V(0,.5,0));pole.addScaledVector(pelvisAxes(c).F,.04);if(o.arc)pole.addScaledVector(o.arc,Math.pow(Math.sin(Math.PI*ft),2));
    // the foot turns from one pose's direction to the other's (a toe going from forward to back points down on the way): where
    // that would put the toe through the floor the ankle lifts instead, as a foot does when it flips over to kneel
    // an ankle out at the leg's full length would snap the knee straight in one frame: ease it in short of full stretch
    {const v=ank.clone().sub(hip),dd=v.length(),Lg=D.thigh+D.shin,s0=.965*Lg;if(dd>s0){const m=Lg*.999-s0,w=Math.min(1,4*ft*(1-ft));ank.copy(hip).addScaledVector(v,lerp(Math.min(dd,Lg),s0+m*Math.tanh((dd-s0)/m),w)/dd);}} // (only on the way: the end pose is reached exactly)
    const da=fa[i].T.clone().sub(fa[i].A),db=fb[i].T.clone().sub(fb[i].A);const dn=da.lengthSq()>1e-8&&db.lengthSq()>1e-8?slerpV(da,db,ft):toe.clone().sub(ank).normalize();
    if(ank.y<.3&&ank.y+D.footL*dn.y<.03)ank.y=.03-D.footL*dn.y;toe.copy(ank).addScaledVector(dn,D.footL);
    legTo(c,sd,ank,pole);pk[i]=wpos(c.bones[sd+'Leg']);
    footTo(c,sd,toe);}
  c.root.updateMatrixWorld(true);};}
// a rope or handle held in both hands follows them (props callback of a settle step), and the cable and stack follow it
function ropeFollow(c,o={}){const P=ST.P;const l=toC(ST,gripPoint(c,'Left')),r=toC(ST,gripPoint(c,'Right'));const mid=l.clone().add(r).multiplyScalar(.5);
  const pul=P.pulW();const up=V().subVectors(pul,mid).normalize();const clip=mid.clone().addScaledVector(up,o.clip??.14);
  if(P.att==='rope'){P.ropeAt(clip,l,r);P.cableTo(clip);}else{P.dh.position.copy(mid);P.dh.quaternion.setFromUnitVectors(V(1,0,0),up.y>.5?V(0,1,0):up);P.cableTo(mid);}
  P.stackTop.position.y=clamp((pul.distanceTo(clip)-.16)*.5,0,.3);}
// the lifter's left hand on the cable column's carriage, whatever height it is at: on the toes for a high one, crouched for a low one
const COL_Z=-11.3; // where the lifter stands to set the column (toes just clear of the tower)
function colReach(c,y){const lo=clamp((1.05-y)/.8,0,1),hi=clamp((y-1.6)/.4,0,1);
  standPose(c,{z:COL_Z-.18*lo,arms:'none',drop:.75*lo,hinge:36*lo,back:.05*lo,shrug:.03+.22*hi,stance:.13+.22*lo,look:28*hi,toe:8+24*lo});
  armsHang(c,0,-1);const p=ST.P.car.position.clone().add(V(.065,-.06*hi,-.02));armTo(c,'Left',p,{hd:V(0,.3*hi,1),pn:V(-1,0,0),pole:V(.5,-1,0)});}
// cable column: reach the carriage, slide it to the height the exercise needs, clip the attachment, stand back up
// (the slide takes longer the further the carriage goes: the hips drop or rise with it, never faster than about half a metre a second)
function colSet(y,att){const dy=Math.abs(((ST&&ST.P&&ST.P.car)?ST.P.car.position.y:y)-y);return [
  {walk:[0,COL_Z-.22],land:1,d:.9}, // the walk clip's leading foot swings ahead, so stop short of the tower and settle the rest
  {d:1.3,anim:settle(c=>colReach(c,ST.P.car.position.y))},
  {d:clamp(.8+dy*1.9,1.2,3.4),anim:(c,k)=>{const P=ST.P;P._y0=P._y0??P.car.position.y;P.setPulley(lerp(P._y0,y,smooth(k)));P.use(att);P.rest();colReach(c,P.car.position.y);if(k>=1)P._y0=undefined;}},
  {d:1.3,anim:settle(c=>standPose(c,{z:COL_Z-.08}),{step:1})}];} // standing up, a small step back off the tower's base

// ---- one arm curling: upper arm at `flex` degrees in front of the torso line (plane through the torso's up and forward),
// elbow bent by `bend` degrees (0 = straight). grip: 'sup' (palm up), 'neutral' (thumb up) or 'pro' (palm down)
function curlArm(c,s,o){const sd=sideOf(s);const T=o.T||torsoAxes(c);const down=o.down||T.U.clone().negate(),fwd=o.fwd||T.F;
  const out=T.L.clone().multiplyScalar(s);const f=o.flex*DEG;
  const ua=down.clone().multiplyScalar(Math.cos(f)).addScaledVector(fwd,Math.sin(f)).addScaledVector(out,o.out??.05).normalize();
  const perp=V().crossVectors(T.L,ua).multiplyScalar(-1);perp.addScaledVector(ua,-perp.dot(ua)).normalize(); // toward the front of the forearm's swing
  const e=o.bend*DEG;const fa=ua.clone().multiplyScalar(Math.cos(e)).addScaledVector(perp,Math.sin(e)).addScaledVector(out,o.in?-o.in:0).normalize();
  const grip=o.grip||'sup';let pn=grip==='sup'?V().crossVectors(fa,out).multiplyScalar(-1):grip==='pro'?V().crossVectors(fa,out):out.clone().multiplyScalar(-1);
  pn.addScaledVector(fa,-pn.dot(fa)).normalize();let hd=fa.clone();if(o.wrist)hd.applyAxisAngle(V().crossVectors(fa,pn).normalize(),-o.wrist*DEG*(grip==='sup'?1:1));
  const r=armDir(c,sd,ua,fa,pn,{hd,curl:o.curl??1});return {...r,ua,fa,pn};}
function placeDB(c,P,s,r){if(!P.db)return;const d=P.db[s>0?0:1];if(!d)return;const f=handFrame(c,sideOf(s));d.position.copy(r.contact);d.quaternion.setFromUnitVectors(V(1,0,0),f.tz.normalize());}
function placeBar2(P,a,b,obj){const o=obj||P.bar;if(!o)return;o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(V(1,0,0),V().subVectors(a,b).normalize());}
const flexOf=(F,k,lo=8,hi=135)=>lerp(F.half?Math.max(lo,45):lo,hi,k);
// standing barbell curl (in front of the bar rack) / cable curl at the column
function poseBBCurl(c,F,b,u,P){const k=smooth(clamp(u,0,1));const sw=F.swing&&b.phase===2?Math.sin(Math.PI*b.k):0;
  standPose(c,{z:-12,hinge:F.swing?-20*sw:(F.cable?5:0),arms:'none',look:0,stance:.12});const T=torsoAxes(c);
  const flex=F.fwd?lerp(-2,38,k):lerp(-3,F.cable?6:4,k);const bend=flexOf(F,k,F.cable?14:8);
  const a=curlArm(c,1,{T,flex,bend,grip:'sup'}),bb=curlArm(c,-1,{T,flex,bend,grip:'sup'});
  if(F.cable){placeBar2(P,a.contact,bb.contact,P.sbar);P.cableTo(P.sbar.position);P.stackTop.position.y=.04+.25*k;}else placeBar2(P,a.contact,bb.contact);return u;}
// hammer curl: dumbbells, thumbs up
function poseHammer(c,F,b,u,P){const k=smooth(clamp(u,0,1));const sw=F.swing&&b.phase===2?Math.sin(Math.PI*b.k):0;
  standPose(c,{z:-12,hinge:F.swing?-18*sw:0,arms:'none',look:0,stance:.12});const T=torsoAxes(c);
  for(const s of[1,-1]){const r=curlArm(c,s,{T,flex:lerp(-3,4,k),bend:lerp(8,135,k),grip:'neutral',in:F.cross?.45*k:0,wrist:F.wrist?28*k:0,out:.08});placeDB(c,P,s,r);}return u;}
// incline dumbbell curl: lying back on the incline bench, arms hang straight down, elbows stay back
const INC_CURL=50;
function poseInclineCurl(c,F,b,u,P){const k=smooth(clamp(u,0,1));P.setAngle&&P.setAngle(INC_CURL);
  lieBody(c,{angle:INC_CURL*DEG,shrug:F.roll?.07+.25*k:.07});if(F.roll){c.bones.Spine2.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),.25*k));c.root.updateMatrixWorld(true);}
  const T=torsoAxes(c);const down=V(0,-1,0),fwd=V(0,0,1);
  for(const s of[1,-1]){const flex=F.swing?lerp(0,35,k):0;const r=curlArm(c,s,{T,down,fwd,flex,bend:lerp(F.half?32:4,125,k),grip:'sup',out:.12});placeDB(c,P,s,r);}return u;}
// preacher curl: upper arms lie on the 45° pad
function posePreacher(c,F,b,u,P){const k=smooth(clamp(u,0,1));
  setRoot(c,qX(24*DEG),V(0,PR.seatY+.1*D.s,PR.seatZ));resetRest(c);c.root.updateMatrixWorld(true);{const [a,b2]=shoulders(c);const m=a.add(b2).multiplyScalar(.5);const tgt=PR.padTop.clone().add(V(0,.075,-.035));c.root.position.add(tgt.sub(m));}
  clav(c,{shrug:F.lift?.03+.25*k:.03,protract:.08});c.root.updateMatrixWorld(true);c._hipsY=wpos(c.bones.Hips).y;c._hipsZ=wpos(c.bones.Hips).z;
  for(const s of[1,-1]){legTo(c,sideOf(s),V(s*.18,D.ankY,PR.footZ),V(s*.15,.4,1));footTo(c,sideOf(s),V(s*.2,.035,PR.footZ+.19));}
  const T=torsoAxes(c);const lift=F.lift?.11*k:0;const down=PR.padDir.clone();const fwd=V(0,Math.SQRT1_2,Math.SQRT1_2);
  let bend=lerp(F.half?45:12,125,k);if(F.bounce&&b.phase===1)bend=Math.max(4,12-10*Math.sin(Math.PI*b.k));
  const pts=[];for(const s of[1,-1]){const r=curlArm(c,s,{T,down:down.clone().applyAxisAngle(V(1,0,0),-lift*5),fwd,flex:0,bend,grip:'sup',out:-.02,curl:F._curl??1});pts.push(r.contact);}
  placeBar2(P,pts[0],pts[1]);return u;}
// concentration curl: seated on the bench end, elbow braced on the inside of the right thigh
function poseConcentration(c,F,b,u,P){const k=smooth(clamp(u,0,1));const rock=F.rock&&b.phase===2?Math.sin(Math.PI*b.k):0;
  setRoot(c,qX((62-14*rock)*DEG),V(0,BENCH_TOP+D.back*.62,HIPS_Z+.18));resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);legTo(c,sd,V(s*.36,D.ankY,HIPS_Z+.6),V(s*.6,.6,1));}
  const T=torsoAxes(c);const knee=wpos(c.bones.RightLeg),hip=wpos(c.bones.RightUpLeg);const brace=hip.lerp(knee,.82);
  // left hand rests on the left knee
  armTo(c,'Left',wpos(c.bones.LeftLeg).add(V(0,.07,-.02)),{hd:V(0,-.2,1),pn:V(0,-1,0),pole:V(.5,-.5,-.5),curl:.5});
  const S=wpos(c.bones.RightArm);const lift=F.off?.13*k:0;const ua=brace.clone().add(V(.07,.05,0)).sub(S).normalize().applyAxisAngle(V(1,0,0),-lift*7.5);
  const perp=V(.35,.25,1).normalize();perp.addScaledVector(ua,-perp.dot(ua)).normalize();const e=lerp(F.half?42:6,132,k)*DEG;
  const fa=ua.clone().multiplyScalar(Math.cos(e)).addScaledVector(perp,Math.sin(e)).normalize();const pn=V().crossVectors(fa,V(-1,0,0)).multiplyScalar(-1).normalize();
  const r=armDir(c,'Right',ua,fa,pn,{hd:fa});if(P.db&&P.db[1]){const f=handFrame(c,'Right');P.db[1].position.copy(r.contact);P.db[1].quaternion.setFromUnitVectors(V(1,0,0),f.tz.normalize());}
  c._brace=brace;return u;}
// ---- triceps
// rope pushdown at the column (top pulley), facing the tower
function posePushdown(c,F,b,u,P){const k=smooth(clamp(u,0,1));P.use('rope');P.setPulley(2.0);const bob=F.lean&&b.phase===2?Math.sin(Math.PI*b.k):0;
  standPose(c,{z:-11.62,hinge:F.lean?32+10*bob:12,arms:'none',look:6,stance:.12});const T=torsoAxes(c);
  const swing=F.swing?lerp(0,38,1-k):0;const hands=[];
  for(const s of[1,-1]){const bend=lerp(98,F.half?32:3,k);const r=curlArm(c,s,{T,flex:4+swing,bend,grip:'neutral',out:.1+.12*k});hands.push(r.contact);}
  const mid=hands[0].clone().add(hands[1]).multiplyScalar(.5).add(V(0,.16,0));P.ropeAt(mid,hands[0],hands[1]);P.cableTo(mid);P.stackTop.position.y=.05+.25*k;return u;}
// overhead rope extension: back to the tower, pulley at the bottom, elbows by the ears
function poseOverheadExt(c,F,b,u,P){const k=smooth(clamp(u,0,1));P.use('rope');P.setPulley(.25);
  standPose(c,{z:-11.85,h:Math.PI,hinge:15,arms:'none',look:0,feet:[[.12,-.25],[-.12,.22]],round:F.arch?-22*k:0});const T=torsoAxes(c);
  const hands=[];const flex=F.drop?lerp(120,150,k):lerp(165,175,k);
  for(const s of[1,-1]){const out=F.flare?.5:-.2;const r=curlArm(c,s,{T,flex,bend:lerp(115,6,k),grip:'neutral',out});hands.push(r.contact);}
  const mid=hands[0].clone().add(hands[1]).multiplyScalar(.5).addScaledVector(T.F,-.12).add(V(0,-.1,0));P.ropeAt(mid,hands[0],hands[1]);P.cableTo(mid);P.stackTop.position.y=.05+.25*k;c._T=T;return u;}
// lying EZ-bar skull crusher on the flat bench: upper arms angled back toward the head
function poseSkull(c,F,b,u,P){const k=smooth(clamp(u,0,1));P.setAngle&&P.setAngle(0);lieBody(c,{breathe:breatheOf(b)});const T=torsoAxes(c);
  const rock=F.rock?lerp(70,108,1-k):105;const pts=[];
  for(const s of[1,-1]){const out=F.flare?.42:-.17;const r=curlArm(c,s,{T,flex:rock,bend:lerp(F.half?68:112,4,k),grip:'pro',out});pts.push(r.contact);}
  if(P.bar)placeBar2(P,pts[0],pts[1]);return u;}
// one-arm dumbbell kickback on the flat bench (same support as the one-arm row, right arm works)
function poseKickback(c,F,b,u,P){const k=smooth(clamp(u,0,1));poseDBRowBase(c);
  const T=torsoAxes(c);const toHip=T.U.clone().negate();const flex=F.drop?-55:F.swing?lerp(-40,8,k):-178;
  // upper arm along the torso toward the hips (shoulder extended), forearm hangs then kicks back
  const S=wpos(c.bones.RightArm);const ua=F.drop?V(0,-1,.25).normalize():(F.swing?toHip.clone().add(V(0,.12,0)).normalize().applyAxisAngle(T.L,lerp(-.6,0,k)):toHip.clone().add(V(0,.14,0)).normalize());
  const e=lerp(92,F.half?32:4,k)*DEG;const pd=V(0,-1,0).addScaledVector(ua,V(0,-1,0).dot(ua)*-1).normalize();const fa=ua.clone().multiplyScalar(Math.cos(e)).addScaledVector(pd,Math.sin(e)).normalize();
  const r=armDir(c,'Right',ua,fa,V(-1,0,0),{hd:fa});if(P.db&&P.db[1]){const f=handFrame(c,'Right');P.db[1].position.copy(r.contact);P.db[1].quaternion.setFromUnitVectors(V(1,0,0),f.tz.normalize());}return u;}
function poseDBRowBase(c){const hip=V(.17,.80,-11.68),sh=V(.19,.9,-12.2);const fwd=V().subVectors(sh,hip).normalize();setRoot(c,rootFromAxes(fwd,V(0,-1,0)),hip);resetRest(c);spineBend(c,0,{neck:-.5,head:-.2});c.root.updateMatrixWorld(true);
  legTo(c,'Left',V(0,BENCH_TOP+.07,-11.32),V(0,-.2,1));footTo(c,'Left',V(0,BENCH_TOP+.05,-11.18));legTo(c,'Right',V(.43,D.ankY,-11.52),V(.3,.2,-1));footTo(c,'Right',V(.45,.02,-11.68));
  armTo(c,'Left',V(.03,BENCH_TOP+.01,-12.43),{hd:V(0,0,-1),pn:V(0,-1,0),pole:V(-.4,.2,1),curl:.2});}

// ---- measurements
const flexDeg=(c,s)=>180-elbowAng(c,s);
function upperArmFlex(c,s){const T=torsoAxes(c);const d=V().subVectors(wpos(c.bones[s+'ForeArm']),wpos(c.bones[s+'Arm'])).normalize();return Math.atan2(d.dot(T.F),-d.dot(T.U))/DEG;}
Object.assign(MEAS,{
  flexMin:{pick:'min',get:c=>avg2(s=>flexDeg(c,s)),fmt:v=>v<=16?'arms straighten at the bottom ('+Math.round(v)+'° bend)':'arms stay bent '+Math.round(v)+'° at the bottom'},
  flexMinR:{pick:'min',get:c=>flexDeg(c,'Right'),fmt:v=>v<=16?'arm straightens ('+Math.round(v)+'° bend)':'arm stays bent '+Math.round(v)+'°'},
  flexMax:{pick:'max',get:c=>avg2(s=>flexDeg(c,s)),fmt:v=>v>=100?'elbows bend to '+Math.round(v)+'°':'elbows bend only '+Math.round(v)+'°'},
  armTop:{at:'top',get:c=>avg2(s=>upperArmFlex(c,s)),fmt:v=>v<=12?'elbows stay by the sides ('+Math.round(v)+'°)':'elbows drift forward to '+Math.round(v)+'°'},
  armRange:{pick:'range',get:c=>avg2(s=>upperArmFlex(c,s)),fmt:v=>v<10?'upper arms stay still':'upper arms swing '+Math.round(v)+'°'},
  armRangeR:{pick:'range',get:c=>upperArmFlex(c,'Right'),fmt:v=>v<8?'upper arm stays still':'upper arm swings '+Math.round(v)+'°'},
  inclineArm:{at:'top',get:c=>avg2(s=>{const d=V().subVectors(wpos(c.bones[s+'ForeArm']),wpos(c.bones[s+'Arm'])).normalize();return Math.atan2(d.z,-d.y)/DEG;}),fmt:v=>v<=8?'elbows stay back, arms hang straight':'elbows swing forward '+Math.round(v)+'°'},
  shoulderLift:{pick:'range',get:c=>(wpos(c.bones.LeftArm).y)*100,fmt:v=>v<2.5?'shoulders stay on the pad':'shoulders lift '+Math.round(v)+' cm off the pad'},
  padLift:{at:'top',get:c=>{const e=wpos(c.bones.LeftForeArm);const n=V(0,Math.SQRT1_2,Math.SQRT1_2);return Math.max(0,(e.clone().sub(PR.padTop).dot(n)-.07)*100);},fmt:v=>v<2?'elbows stay on the pad':'elbows lift '+Math.round(v)+' cm off the pad'},
  dropTime:{get:(c,x)=>x.F.bounce?.4:x.F.lower,fmt:v=>v>=1.5?'lowers in '+v.toFixed(1)+' s':'drops in '+v.toFixed(1)+' s and bounces'},
  handIn:{at:'top',get:c=>avg2(s=>{const T=torsoAxes(c);return -(V().subVectors(wpos(c.bones[s+'Hand']),wpos(c.bones[s+'Arm'])).dot(T.L))*(s==='Left'?1:-1)*100;}),fmt:v=>v<6?'hands finish outside the shoulders':'hands cross '+Math.round(v)+' cm inward'},
  wristFlex:{at:'top',get:c=>{const B=c.bones;const fa=V().subVectors(wpos(B.LeftHand),wpos(B.LeftForeArm)).normalize();return Math.acos(clamp(fa.dot(handFrame(c,'Left').hd),-1,1))/DEG;},fmt:v=>v<12?'wrists straight':'wrists curl '+Math.round(v)+'°'},
  braceGap:{at:'top',get:c=>{const B=c.bones;const H=wpos(B.RightUpLeg),K=wpos(B.RightLeg),E=wpos(B.RightForeArm);const d=V().subVectors(K,H);const t=clamp(V().subVectors(E,H).dot(d)/d.lengthSq(),0,1);return Math.max(0,(E.distanceTo(H.clone().addScaledVector(d,t))-.115)*100);},fmt:v=>v<3?'elbow stays on the thigh':'elbow lifts '+Math.round(v)+' cm off the thigh'},
  elbowGap:{at:'bottom',get:c=>wpos(c.bones.LeftForeArm).distanceTo(wpos(c.bones.RightForeArm))*100,fmt:v=>v<=42?'elbows narrow ('+Math.round(v)+' cm apart)':'elbows flare '+Math.round(v)+' cm apart'},
  handGap:{pick:'min',get:c=>gripPoint(c,'Left').distanceTo(gripPoint(c,'Right'))*100,fmt:v=>v>=32?'hands shoulder-width ('+Math.round(v)+' cm)':'hands only '+Math.round(v)+' cm apart'},
  ohArm:{at:'bottom',get:c=>avg2(s=>upperArmFlex(c,s)),fmt:v=>v>=152?'upper arms beside the ears ('+Math.round(v)+'°)':'upper arms drop forward to '+Math.round(v)+'°'},
  kbArm:{at:'top',get:c=>{const d=V().subVectors(wpos(c.bones.RightForeArm),wpos(c.bones.RightArm)).normalize();return Math.asin(clamp(d.y,-1,1))/DEG;},fmt:v=>v>-15?'upper arm level with the back':'upper arm points '+Math.round(-v)+'° down'},
  leanMax:{pick:'max',get:c=>torsoLean(c),fmt:v=>v<22?'standing tall ('+Math.round(v)+'° lean)':'leaning '+Math.round(v)+'° over the stack'},
  archBack:{pick:'max',get:c=>{const S=vSpine(c);const T=torsoAxes(c);const a=V().subVectors(S.Spine1,S.Hips).normalize(),b=V().subVectors(S.Neck,S.Spine2).normalize();
    return Math.atan2(V().crossVectors(a,b).dot(T.L),a.dot(b))/DEG*-1;},fmt:v=>v<13?'back stays flat':'lower back arches '+Math.round(v)+'°'},
  dipFlare:{at:'bottom',get:c=>{const T=torsoAxes(c);return avg2(s=>{const d=V().subVectors(wpos(c.bones[s+'ForeArm']),wpos(c.bones[s+'Arm'])).normalize();return Math.asin(Math.abs(clamp(d.dot(T.L),-1,1)))/DEG;});},fmt:v=>v<32?'elbows point back ('+Math.round(v)+'° out)':'elbows flare '+Math.round(v)+'° out'},
  ankleSwing:{pick:'range',get:c=>wpos(c.bones.LeftFoot).z*100,fmt:v=>v<6?'legs quiet':'legs swing '+Math.round(v)+' cm'},
});

// ---- getting on and off
// turn on the spot (canonical x, z) from heading h0 to h1 by stepping round: up to 60° per step, the feet lifting one after the
// other, instead of the walk clip swinging them; pf(c,{x,z,h}) is the standing pose (with whatever the hands are holding)
function turnSteps(x,z,h0,h1,pf=standPose,d=.45){const dh=angDiff(h1,h0);const n=Math.max(1,Math.ceil(Math.abs(dh)/(100*DEG)-1e-3));const out=[];
  for(let i=1;i<=n;i++){const h=h0+dh*i/n;out.push({d,anim:settle(c=>pf(c,{x,z,h}),{step:1})});}return out;}
const standBarThighs=(c,o)=>{standPose(c,{...o,arms:'none'});holdBarThighs(c);};
ENTRY.barStand={land:1,pre:[0,-12.6],face:0,enter:(st,e)=>[{walk:[0,-12],land:1,d:.8},{call:c=>{c.carry=null;}},{d:.8,pose:exP(0,1)},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.8,pose:c=>{standPose(c,{z:-12,arms:'none'});holdBarThighs(c);}},{call:c=>{c.carry='bar';}},{walk:[0,-12.6],back:true,land:1,d:.8}]};
// seated sideways-on to the front, feet on the floor (preacher seat)
function sitSide(c,hip,lean,feetZ){setRoot(c,qX(lean*DEG),hip);resetRest(c);c.root.updateMatrixWorld(true);for(const s of[1,-1])legTo(c,sideOf(s),V(s*.17,D.ankY,feetZ),V(s*.2,.4,1));armsHang(c);}
// the bar waits on the rest right where the hands are at the bottom of a rep: reach it with open hands, close them, lift it off
function preacherAt(c,P,curl,home){posePreacher(c,{...FORMS.good,_curl:curl},{phase:1,k:0},0,P);if(home){P.bar.position.copy(P.home);P.bar.quaternion.identity();}}
// getting on from the side: stand beside the seat, lower the hips onto its edge while the far (right) leg steps over the base
// rail to the front of the seat, under the pad, then slide across onto the middle with the near foot following
const PR_SIDE={x:.45,z:-12.25}; // standing beside the seat, facing the pad
const prStep={step:1,arc:V(0,.06,0)}; // a foot crossing the rail is lifted over it
function prHalf(c,rx=-.15){setRoot(c,qX(10*DEG),V(.21,PR.seatY+.1*D.s+.1,PR.seatZ));resetRest(c);c.root.updateMatrixWorld(true);const rz=rx>0?-11.97:-12.02;
  legTo(c,'Left',V(.42,D.ankY,-12.12),V(.4,.4,1));footTo(c,'Left',V(.45,.03,-11.97));legTo(c,'Right',V(rx,D.ankY,rz),V(-.1,.4,1));footTo(c,'Right',V(rx-.02,.03,rz+.15));armsHang(c);}
const prHalfOut=c=>prHalf(c,.27); // the right foot still this side of the rail, in front of the seat corner
ENTRY.preacher={land:1,pre:[.85,-12.3],face:-Math.PI/2,
  enter:(st,e)=>[{walk:[PR_SIDE.x,-12.3],land:1,d:.7},...turnSteps(PR_SIDE.x,-12.3,-Math.PI/2,0),{d:.6,anim:settle(c=>standPose(c,PR_SIDE),{step:1})},
    {d:1.1,anim:settle(prHalfOut,{step:1})},{d:.9,anim:settle(prHalf,prStep)},{d:1.1,anim:settle(c=>sitSide(c,V(0,PR.seatY+.1*D.s,PR.seatZ),8,-12.02),{step:1})},
    {d:1.2,anim:settle(c=>preacherAt(c,st.P,.1,1))},{d:.4,pose:c=>preacherAt(c,st.P,1,1)},{call:c=>grab(c,st.P.bar,'Left',{other:'Right',align:'bar'})},
    {d:.5,pose:exP(0,1)},{call:c=>{release(c,st.P.bar);}},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{call:c=>grab(c,st.P.bar,'Left',{other:'Right',align:'bar'})},{d:.9,pose:exP(0,1)},{d:.4,pose:c=>preacherAt(c,st.P,1)},
    {call:c=>{release(c,st.P.bar);st.P.bar.position.copy(st.P.home);st.P.bar.quaternion.identity();}},{d:.4,pose:c=>preacherAt(c,st.P,.1,1)},
    {d:1.0,anim:settle(c=>{sitSide(c,V(0,PR.seatY+.1*D.s,PR.seatZ),8,-12.02);st.P.bar.position.copy(st.P.home);st.P.bar.quaternion.identity();})},
    {d:1.1,anim:settle(prHalf,{step:1})},{d:.9,anim:settle(prHalfOut,prStep)},{d:1.1,anim:settle(c=>standPose(c,PR_SIDE),{step:1})},...turnSteps(PR_SIDE.x,PR_SIDE.z,0,Math.PI/2),{walk:[.85,-12.3],land:1,d:.6}]};
// close-grip bench: as the chest's barBench, but sitting down and standing up with the feet on the floor
ENTRY.barBenchA={land:1,pre:[0,-10.45],face:Math.PI,
  enter:(st,e)=>{const P=st.P,ang=(e.forms.good.angle||0)*DEG,feet=e.forms.good.feet,gr=e.forms.good.grip??GRIP;return [
    ...turnSteps(0,-10.45,Math.PI,0),{walk:[0,-11.08],back:true,land:1,d:1.3},
    {d:.9,anim:settle(c=>benchSit(c,{lean:4}))},
    {d:1.4,anim:settle(c=>poseBarHands(c,P,rackHandsOf(P,gr),ang,feet,.1))},{d:.4,pose:c=>poseBarHands(c,P,rackHandsOf(P,gr),ang,feet)},{d:.2,pose:c=>poseBarHands(c,P,rackHandsOf(P,gr),ang,feet)},
    {call:()=>sayFor(e.coachIn||'Lift-off on three. One, two, three.',2.6)},
    {d:1.2,anim:(c,k)=>{const R=rackHandsOf(P,gr),L=lockHands(ang/DEG,gr);const up=Math.sin(Math.PI*Math.min(1,k*1.6))*.03;poseBarHands(c,P,R.map((h,i)=>h.clone().lerp(L[i],ease(k)).add(V(0,up,0))),ang,feet);}},
    // into the exercise's own lockout (elbows as the press holds them): the bar rides in the hands
    {call:c=>grab(c,P.bar,'Left',{other:'Right',align:'bar'})},{d:.5,pose:exP(1,3)},{call:c=>release(c,P.bar)}];},
  leave:(st,e)=>{const P=st.P,ang=(e.forms.good.angle||0)*DEG,feet=e.forms.good.feet,gr=e.forms.good.grip??GRIP;return [
    {call:c=>grab(c,P.bar,'Left',{other:'Right',align:'bar'})},{d:.7,pose:c=>poseBarHands(c,P,lockHands(ang/DEG,gr),ang,feet)},{call:c=>release(c,P.bar)},
    {d:1.3,anim:(c,k)=>{const R=rackHandsOf(P,gr),L=lockHands(ang/DEG,gr);const kk=ease(k);const h=L.map((p,i)=>p.clone().lerp(R[i],Math.min(1,kk*1.15)).add(V(0,kk<.85?.02*Math.sin(Math.PI*kk/.85):0,0)));poseBarHands(c,P,h,ang,feet);}},
    {d:.4,pose:c=>poseBarHands(c,P,rackHandsOf(P,gr),ang,feet,.1)},
    {d:1.2,anim:settle(c=>{benchSit(c,{lean:4});P.bar.position.copy(P.rack);})},
    {d:1.0,anim:settle(c=>standPose(c,{z:-11.08,h:0}))},
    {walk:[0,-10.45],land:1,d:1.0}];}};
// kickback on the flat bench: turn on the spot by stepping, kneel onto the bench with the feet kept on the floor
ENTRY.dbRowBenchA={land:1,pre:[.95,-11.3],face:-Math.PI/2,
  enter:(st,e)=>[{walk:[.55,-11.55],land:1,d:.8},{call:c=>{c.carry=null;}},{d:.9,anim:settle(c=>standDB(c,{x:.55,z:-11.55,h:Math.PI}),{step:1})},
    {d:1.3,anim:settle(exP(0,1))},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.6,pose:exP(0,1)},{d:1.3,anim:settle(c=>standDB(c,{x:.5,z:-11.55,h:Math.PI}))},{call:c=>{c.carry='db1';}},{walk:[.95,-11.3],land:1,d:.8}]};
ENTRY.cableColA={land:1,pre:[0,-12.35],face:0,
  enter:(st,e)=>[...colSet(e.pulley,e.att),{walk:[0,-11.62],back:true,land:1,d:.8},{d:1.0,anim:settle(exP(0,1))},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.9,pose:exP(0,1)},{d:.8,anim:settle(c=>standPose(c,{z:-11.62})),props:(c,k)=>{const P=st.P;const p=P.pulW().add(P.hang);P.attPos().lerp(p,smooth(k));P.cableTo(P.attPos());if(k>=1)P.rest();}},{walk:[0,-12.35],back:true,land:1,d:1.0}]};
// overhead extension: the rope hangs from the low pulley, so pick its ends up from the floor, stand, turn round with it, raise it
function ropeFloorPick(c){standPose(c,{z:-11.5,arms:'none',drop:.8,hinge:50,back:.04,stance:.25,toe:30});const P=ST.P;
  // fists close round the rope just above the knobs
  const ends=[P.rope.children.find(k=>k.name==='knob1'),P.rope.children.find(k=>k.name==='knob-1')].map(k=>P.rope.position.clone().add(k.position).lerp(P.rope.position,.3));
  for(const s of[1,-1])armTo(c,sideOf(s),ends[s>0?0:1].clone().add(V(0,.02,0)),{hd:V(0,-.3,-1),pn:V(0,-1,0),pole:V(s*.5,.3,.3)});}
function ropeAtThighs(c,o){standPose(c,{...o,arms:'none'});const T=torsoAxes(c);const ct=wpos(c.bones.Hips).addScaledVector(T.F,.16).addScaledVector(T.U,-.2);
  for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().addScaledVector(T.L,s*.1),{hd:T.U.clone().negate(),pn:T.L.clone().multiplyScalar(-s),pole:T.F.clone().negate().addScaledVector(T.L,s*.4)});}
// the half turn with the rope is three 60° steps (the feet step round, never across each other)
const ropeTurn=(z0,z1,h0,h1)=>[1,2,3].map(i=>({d:.75,anim:settle(c=>ropeAtThighs(c,{z:lerp(z0,z1,i/3),h:lerp(h0,h1,i/3)}),{step:1}),props:c=>ropeFollow(c)}));
ENTRY.cableBack={land:1,pre:[0,-12.35],face:0,
  enter:(st,e)=>[...colSet(e.pulley,e.att),{d:1.3,anim:settle(ropeFloorPick)},{d:1.3,anim:settle(c=>ropeAtThighs(c,{z:-11.5})),props:c=>ropeFollow(c)},
    ...ropeTurn(-11.5,-11.6,0,Math.PI),{d:1.1,anim:settle(exP(0,1),{step:1}),props:c=>ropeFollow(c)},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.9,pose:exP(0,1)},{d:1.0,anim:settle(c=>ropeAtThighs(c,{z:-11.6,h:Math.PI})),props:c=>ropeFollow(c)},...ropeTurn(-11.6,-11.5,Math.PI,0),
    {d:1.3,anim:settle(ropeFloorPick),props:c=>ropeFollow(c)},{d:1.2,anim:settle(c=>standPose(c,{z:-11.5})),props:(c,k)=>{const P=st.P;const p=P.pulW().add(P.hang);P.attPos().lerp(p,smooth(k));P.cableTo(P.attPos());if(k>=1)P.rest();}},{walk:[0,-12.35],back:true,land:1,d:.8}]};
// upright dip: hands come up outside the bars and then down onto them (never through them)
function dipHandsOver(c){standPose(c,{z:-11.95,arms:'none'});const hx=D.shx+.06*D.s;for(const s of[1,-1])armTo(c,sideOf(s),V(s*(hx+.1),DIP_Y+.16,DIP_Z),{hd:V(-s*.7,-.3,.6),pn:V(-s*.3,-1,0),pole:V(s*.6,.1,-.8),curl:.3});}
// short backward (or forward) steps of about 30 cm from hips z0 to z1, arms held out to clear the handles
function shuffle(z0,z1,o={}){const n=Math.max(1,Math.round(Math.abs(z1-z0)/.3));const out=[];for(let i=1;i<=n;i++){const z=lerp(z0,z1,i/n);out.push({d:o.d??.8,anim:settle(c=>standPose(c,{z,armOut:.6}),{step:1})});}return out;}
ENTRY.dipA={land:1,pre:[0,-10.8],face:Math.PI,
  enter:(st,e)=>[...turnSteps(0,-10.8,Math.PI,0),{walk:[0,-11.3],back:true,land:1,d:1.4},{d:.6,anim:settle(c=>standPose(c,{z:-11.3,armOut:.6}))},...shuffle(-11.3,-11.95),{d:.6,anim:settle(dipHandsOver)},{d:.5,anim:settle(c=>{standPose(c,{z:-11.95,arms:'none'});dipHands(c);})},{d:.7,anim:settle(exP(1,3))}],
  leave:(st,e)=>[{d:.8,anim:settle(c=>{standPose(c,{z:-11.95,arms:'none'});dipHands(c);})},{d:.5,anim:settle(dipHandsOver)},{d:.5,anim:settle(c=>standPose(c,{z:-11.95,armOut:.6}))},...shuffle(-11.95,-11.3),{walk:[0,-10.8],land:1,d:1.4}]};
ENTRY.inclineCurl={land:1,pre:[0,-10.45],face:Math.PI,
  enter:(st,e)=>[...turnSteps(0,-10.45,Math.PI,0,standDB,.5),{call:c=>{c.carry=null;}},{d:1.2,anim:(c,k)=>{st.P.setAngle(lerp(st.P._ang??30,INC_CURL,smooth(k)));standDB(c,{z:-10.45});}},{call:()=>{st.P._ang=INC_CURL;}},{walk:[0,-11.08],back:true,land:1,d:1.1},
    {d:1.0,anim:settle(c=>{st.P.setAngle(INC_CURL);benchSitDB(c,{lean:2});})},{d:1.3,anim:settle(exP(0,1))},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.8,pose:exP(0,1)},{d:1.2,anim:settle(c=>benchSitDB(c,{lean:2}))},{d:1.0,anim:settle(c=>standDB(c,{z:-11.08}))},{call:c=>{c.carry='db';}},{walk:[0,-10.45],land:1,d:1.0}]};
ENTRY.concentration={land:1,pre:[0,-10.45],face:Math.PI,
  enter:(st,e)=>[...turnSteps(0,-10.45,Math.PI,0,standDB),{walk:[0,-11.08],back:true,land:1,d:1.2},{call:c=>{c.carry=null;}},{d:1.0,anim:settle(c=>{benchSit(c,{lean:20,feetX:.36,feetZ:.42,arms:'none'});armsHang(c);})},{d:1.0,anim:settle(exP(0,1))},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.8,pose:exP(0,1)},{d:1.0,anim:settle(c=>{benchSit(c,{lean:20,feetX:.36,feetZ:.42,arms:'none'});armsHang(c);})},{d:1.0,anim:settle(c=>standDB(c,{z:-11.08}))},{call:c=>{c.carry='db1';}},{walk:[0,-10.45],land:1,d:1.0}]};
function skullArmsUp(c){lieBody(c,{});const T=torsoAxes(c);const pts=[];for(const s of[1,-1]){pts.push(curlArm(c,s,{T,flex:90,bend:4,grip:'pro',out:-.02}).contact);}placeBar2(ST.P,pts[0],pts[1]);}
// lying back (or sitting up) with the bar resting on the thighs, before pressing it up over the chest
function skullLieBar(c){lieBody(c,{});holdBarThighs(c);}
ENTRY.skull={land:1,pre:[0,-10.45],face:Math.PI,
  enter:(st,e)=>[...turnSteps(0,-10.45,Math.PI,0,standBarThighs),{walk:[0,-11.08],back:true,land:1,d:1.2},{call:c=>{c.carry=null;}},
    {d:1.0,anim:settle(c=>{benchSit(c,{lean:4,arms:'none'});holdBarThighs(c);})},{d:1.4,anim:settle(skullLieBar)},{d:1.5,anim:settle(skullArmsUp)},{d:.8,anim:settle(exP(1,3))}],
  leave:(st,e)=>[{d:.8,anim:settle(skullArmsUp)},{d:1.5,anim:settle(skullLieBar)},{d:1.4,anim:settle(c=>{benchSit(c,{lean:4,arms:'none'});holdBarThighs(c);})},{d:1.0,anim:settle(c=>{standPose(c,{z:-11.08,arms:'none'});holdBarThighs(c);})},{call:c=>{c.carry='bar';}},{walk:[0,-10.45],land:1,d:1.0}]};
// standing with dumbbells by the rack (as the back's dbStand, with the walk clip landing its steps)
ENTRY.dbStandA={land:1,pre:[0,-12.4],face:0,
  enter:(st,e)=>[{walk:[0,-12],land:1,d:.8},{call:c=>{c.carry=null;}},{d:.7,pose:c=>standDB(c,{z:-12})},{d:.8,pose:exP(e.startU??0,1)},{d:.9,anim:exFrom(e.startU??0,1)}],
  leave:(st,e)=>[{d:.8,pose:c=>standDB(c,{z:-12})},{call:c=>{c.carry='db';}},{walk:[0,-12.4],back:true,land:1,d:.7}]};
// ---- biceps
const BI_MUS={biLong:[1,'m'],biShort:[1,'m'],forearm:[.55,'h'],deltF:[.25,'h']};
defEx('bbCurl',{group:'biceps',name:'Barbell curl',eq:'Barbell',part:'Biceps',station:'barStand',entry:'barStand',kind:'curl',pose:poseBBCurl,needs:'bar',
  quip:'The oldest exercise in the mirror. Still works.',mus:BI_MUS,
  labels:[['Biceps','biLong','m'],['Forearms','forearm','h']],center:V(0,1.15,-12),cam:'sideFlat',coachSpot:{p:[-1.3,-11.3],h:Math.PI/2+.5},
  steps:steps4([['Lower slowly','2 sec'],['Arms almost straight','bar at the thighs'],['Curl to the chest','elbows still'],['Squeeze','one second']]),
  stepText:['Lower the bar slowly, about 2 seconds, until the arms are almost straight.','Bar at the thighs, elbows just in front of the ribs.','Curl the bar up to the upper chest. Only the forearms move.','Squeeze for a second at the top, then lower.'],
  cues:[['Lower slowly.'],['Almost straight.'],['Elbows still, chest tall.'],['Squeeze.']],
  beginner:'3 sets of 8–12 with the empty bar or a 10 kg fixed bar. If your wrists ache, use the EZ bar.',
  forms:mk({lower:2.0,touch:.2,press:1.0,lock:1.0,prof:'smooth'},{
    swing:MS('Body swing','Torso throws the bar up','The torso leans back 15–25° and the hips push forward as the bar goes up.','The lower back and hips lift the bar; the biceps relax.','The weight climbs faster than your arms earn it; lower-back strain.','Elbows still, chest tall.',{swing:1,meas:'leanRange',warn:'Body swings',warnAt:'lowback',cam:'sideFlat'}),
    fwd:MS('Elbows drift forward','Elbows travel up and forward','The elbows travel forward and up so the upper arms reach about 35° at the top.','The front shoulders take over at the top.','Tired front shoulders and stalled curl progress.','Pin the elbows to your sides.',{fwd:1,meas:'armTop',warn:'Elbows forward',warnAt:'elbow',cam:'sideFlat',mul:{deltF:3}}),
    half:MS('Half reps','Arms never straighten','The elbows stay bent about 45° at the bottom.','You skip the stretched range that drives growth.','Less growth per set.','Straighten the arms every rep.',{half:1,meas:'flexMin',warn:'Stops short',warnAt:'elbow',cam:'sideFlat'})})});
defEx('inclineCurl',{group:'biceps',name:'Incline dumbbell curl',eq:'Dumbbell',part:'Biceps (long head)',station:'dbIncline',entry:'inclineCurl',kind:'curl',pose:poseInclineCurl,needs:'db',dbSize:'light',
  quip:'Lean back. The stretch is the exercise.',mus:{biLong:[1,'m'],biShort:[.85,'m'],forearm:[.5,'h']},
  labels:[['Biceps (long head)','biLong','m'],['Forearms','forearm','h']],center:V(0,.95,-12.1),cam:'sideFlat',coachSpot:{p:[-1.5,-11.6],h:Math.PI/2},
  steps:steps4([['Lower to a full stretch','2 sec'],['Arms hang straight','pause one second'],['Curl without moving the elbows','palms up'],['Squeeze','at shoulder level']]),
  stepText:['Lower the dumbbells slowly until the arms hang straight down.','Pause a second in the stretch: the elbows are behind the body, which stretches the long head.','Curl up. The elbows stay back; only the forearms move.','Squeeze with the dumbbells level with the front of the shoulders.'],
  cues:[['Full stretch.'],['Pause.'],['Elbows stay behind you.'],['Squeeze.']],
  beginner:'3 sets of 10–12 with dumbbells 30–40% lighter than your standing curl. The bench is set to 50° for this one.',
  forms:mk({lower:2.0,touch:1.0,press:1.0,lock:1.0,prof:'smooth'},{
    swing:MS('Elbows swing forward','Elbows come forward to help','The elbows swing about 35° forward as you curl.','The stretch that makes the exercise special is gone.','The same growth as any curl, with a sore front shoulder.','Elbows stay behind you.',{swing:1,meas:'inclineArm',warn:'Elbows forward',warnAt:'elbow',cam:'sideFlat',mul:{deltF:3}}),
    roll:MS('Shoulders roll off the pad','Shoulders lift off the bench','The shoulders lift 5–8 cm off the bench as you curl.','The front shoulders hold the weight; the biceps lose tension.','Irritation at the front of the shoulder.','Shoulder blades glued to the bench.',{roll:1,meas:'shoulderLift',warn:'Shoulders lift',warnAt:'shoulder',cam:'sideFlat',strain:['deltF']}),
    half:MS('Too heavy, half range','Arms never straighten','The arms stop about 30° short of straight at the bottom.','You skip the stretched third.','Less growth.','Lighter dumbbells, full stretch.',{half:1,meas:'flexMin',warn:'Stops short',warnAt:'elbow',cam:'sideFlat'})})});
defEx('preacher',{group:'biceps',name:'Preacher curl',eq:'EZ bar',part:'Biceps (short head)',station:'preacher',entry:'preacher',kind:'curl',pose:posePreacher,
  quip:'Confess your half reps. The pad knows.',mus:{biShort:[1,'m'],biLong:[.85,'m'],forearm:[.55,'h']},
  labels:[['Biceps (short head)','biShort','m'],['Forearms','forearm','h']],center:V(0,1.0,-11.9),cam:'sideFlat',coachSpot:{p:[-1.4,-11.5],h:Math.PI/2},
  steps:steps4([['Lower slowly','2–3 sec'],['Almost straight','soft elbows'],['Curl up','elbows on the pad'],['Hold','one second']]),
  stepText:['Lower the bar slowly, 2–3 seconds: this is the hard part.','Arms almost straight at the bottom, never a hard lock.','Curl up with the elbows pressed into the pad.','Hold for a second about 10–15 cm short of your face.'],
  cues:[['Lower like it’s fragile.'],['Soft lock.'],['Elbows welded to the pad.'],['Hold.']],
  beginner:'3 sets of 10–12 with the EZ bar plus 2.5–5 kg a side. Never drop into a locked elbow at the bottom.',
  forms:mk({lower:2.5,touch:.3,press:1.0,lock:1.0,prof:'smooth'},{
    lift:MS('Elbows lift off the pad','Elbows rise and shoulders shrug','The elbows rise 10–15 cm off the pad at the top and the shoulders shrug.','The pad no longer fixes the shoulder; the front shoulders and traps join in.','A lighter load on the biceps and slower progress.','Elbows welded to the pad.',{lift:1,meas:'padLift',warn:'Elbows lift',warnAt:'elbow',cam:'sideFlat',mul:{deltF:3,trapU:2}}),
    bounce:MS('Bouncing at the bottom','Drops fast and jerks out','The bar drops fast into straight arms and is jerked back up.','The tendon takes the jolt.','Biceps-tendon strain: the preacher curl’s known risk.','Lower like it’s fragile.',{bounce:1,lower:.6,touch:.12,meas:'dropTime',warn:'Bounce at the bottom',warnAt:'elbow',cam:'sideFlat'}),
    half:MS('Bottom cut short','Arms stop well short of straight','The bar stops with the elbows still bent about 45°.','It skips the part of the preacher where the biceps work hardest.','Less growth near the elbow.','All the way down, soft lock.',{half:1,meas:'flexMin',warn:'Stops short',warnAt:'elbow',cam:'sideFlat'})})});
defEx('hammer',{group:'biceps',name:'Hammer curl',eq:'Dumbbell',part:'Forearms & brachialis',station:'dbStand',entry:'dbStandA',kind:'curl',pose:poseHammer,needs:'db',dbSize:'light',
  quip:'Thumbs up. Your forearms finally get invited.',mus:{forearm:[1,'m'],biLong:[.85,'m'],biShort:[.75,'m']},
  labels:[['Forearms (brachioradialis)','forearm','m'],['Biceps','biLong','m']],center:V(0,1.15,-12),cam:'sideFlat',coachSpot:{p:[-1.3,-11.3],h:Math.PI/2+.5},
  steps:steps4([['Lower under control','2 sec'],['Arms hang','thumbs forward'],['Curl to the shoulder','thumbs up'],['Squeeze','briefly']]),
  stepText:['Lower the dumbbells under control.','Arms hang at the sides, thumbs pointing forward.','Curl up with the thumbs up, finishing just outside the front of the shoulders.','Squeeze briefly. The thumbs-up grip lets most people lift a bit more and is easy on the wrists.'],
  cues:[['Lower slowly.'],['Thumbs forward.'],['Only the forearm moves.'],['Squeeze.']],
  beginner:'3 sets of 10–12, 1–2 kg heavier than your dumbbell curl. Easiest curl on the wrists.',
  forms:mk({lower:2.0,touch:.2,press:1.0,lock:1.0,prof:'smooth'},{
    swing:MS('Swinging','Torso and knees bounce the weight','The torso leans back 15° or more and the knees bounce.','Momentum lifts the weight.','Lower-back strain and no arm growth.','Only the forearm moves.',{swing:1,meas:'leanRange',warn:'Body swings',warnAt:'lowback',cam:'sideFlat'}),
    cross:MS('Cross-body drift','Hands drift across the body','The hands drift 10 cm or more inside the shoulders at the top.','Load shifts to the front shoulders when it’s not on purpose.','Uneven arms.','Straight up, outside the shoulder.',{cross:1,meas:'handIn',warn:'Hands cross over',warnAt:'wrist',cam:'front',mul:{deltF:2.5}}),
    wrist:MS('Wrist curling','Wrists bend at the top','The wrists bend 20–30° at the top of each rep.','The forearm flexors steal the finish.','Wrist-tendon irritation.','Wrist straight, like a hammer handle.',{wrist:1,meas:'wristFlex',warn:'Wrists bend',warnAt:'wrist',cam:'sideFlat'})})});
defEx('cableCurl',{group:'biceps',name:'Cable curl',eq:'Cable',part:'Biceps',station:'cableCol',entry:'cableColA',pulley:.25,att:'sbar',kind:'curl',pose:(c,F,b,u,P)=>poseBBCurl(c,{...F,cable:1},b,u,P),
  quip:'Tension at the top. The bar never had that.',mus:BI_MUS,
  labels:[['Biceps','biLong','m'],['Forearms','forearm','h']],center:V(0,1.15,-11.65),cam:'sideFlat',coachSpot:{p:[1.4,-12.1],h:-Math.PI/2},
  steps:steps4([['Lower slowly','2 sec'],['Arms almost straight','stack stays up'],['Curl to the chest','elbows by the ribs'],['Squeeze','one second']]),
  stepText:['Lower the bar slowly, about 2 seconds.','Arms almost straight; the stack stays just off the pile.','Curl up to the upper chest, elbows by your ribs.','Squeeze at the top: the cable keeps pulling here, where a barbell goes light.'],
  cues:[['Lower slowly.'],['Stack stays up.'],['Elbows by the ribs.'],['Squeeze.']],
  beginner:'3 sets of 10–15. A good first curl. Step in before you let go of the bar.',
  forms:mk({lower:2.0,touch:.2,press:1.0,lock:1.0,prof:'smooth'},{
    swing:MS('Leaning back','Torso leans back to pull the stack','The torso leans back 15–25° to pull the stack with the back.','The lats and lower back take over.','Lower-back strain; arms untrained.','Lean in, not back.',{swing:1,meas:'leanRange',warn:'Leaning back',warnAt:'lowback',cam:'sideFlat'}),
    fwd:MS('Elbows ride up','Elbows lift forward at the top','The elbows ride up so the upper arms reach about 35° at the top.','It turns into a front raise with a cable.','Sore front shoulders.','Elbows down by the ribs.',{fwd:1,meas:'armTop',warn:'Elbows forward',warnAt:'elbow',cam:'sideFlat',mul:{deltF:3}}),
    half:MS('Half reps','Arms never straighten','The elbows stay bent about 45° at the bottom.','The stretched part is skipped.','Less growth per set.','Straighten the arms every rep.',{half:1,meas:'flexMin',warn:'Stops short',warnAt:'elbow',cam:'sideFlat'})})});
defEx('concCurl',{group:'biceps',name:'Concentration curl',eq:'Dumbbell',part:'Biceps (peak)',station:'dbFlat',entry:'concentration',kind:'curl',pose:poseConcentration,needs:'db1',dbSize:'light',
  quip:'Scored highest in the lab. Needs no spotter.',mus:{biShort:[1,'m'],biLong:[1,'m'],forearm:[.45,'h']},
  labels:[['Biceps','biShort','m'],['Forearm','forearm','h']],center:V(-.1,.8,-11.6),cam:'front',coachSpot:{p:[-1.4,-11.2],h:Math.PI/2},
  steps:steps4([['Lower all the way','2 sec'],['Straight arm','pause one second'],['Curl toward the shoulder','elbow on the thigh'],['Squeeze','one second']]),
  stepText:['Lower the dumbbell slowly until the arm is straight.','Pause a second at the bottom.','Curl toward the shoulder with the elbow braced on the inside of the thigh.','Squeeze for a second. We show the right arm; then swap.'],
  cues:[['Lower all the way.'],['Pause.'],['Elbow stays on the leg.'],['Squeeze.']],
  beginner:'3 sets of 10–12 per arm with the lightest dumbbells (4–8 kg). Keep the back flat.',
  forms:mk({lower:2.0,touch:1.0,press:1.0,lock:1.0,prof:'smooth'},{
    off:MS('Elbow leaves the thigh','Upper arm lifts off the leg','The upper arm lifts off the leg and swings up 10–15 cm.','The brace is gone; the front shoulder and momentum join in.','The exercise loses its one advantage: almost no shoulder help.','Elbow stays on the leg.',{off:1,meas:'braceGap',warn:'Elbow lifts off',warnAt:'elbow',cam:'front',mul:{deltF:3}}),
    rock:MS('Torso rocks','Body lifts the weight','The torso rocks back about 15° on every curl.','The dumbbell is too heavy and the body is lifting it.','Lower-back fatigue, nothing for the biceps.','Drop 2 kg, stay still.',{rock:1,meas:'leanRange',warn:'Torso rocks',warnAt:'lowback',cam:'sideR'}),
    half:MS('Half rep at the bottom','Arm never straightens','The elbow stays bent about 40° at the bottom.','You skip the stretched range.','Less growth.','Straight arm at the bottom.',{half:1,meas:'flexMinR',warn:'Stops short',warnAt:'elbow',cam:'front'})})});
// ---- triceps
const TRI_MUS={triLong:[1,'m'],triLat:[1,'m']};
defEx('cgBench',{group:'triceps',name:'Close-grip bench press',eq:'Barbell',part:'Triceps (all heads)',station:'flatRack',entry:'barBenchA',kind:'press',pose:poseBar,calib:'bar',fam:'bar',
  quip:'Same bench. Narrower hands. Your triceps noticed.',mus:{triLat:[1,'m'],triLong:[.9,'m'],pecL:[.6,'h'],pecU:[.5,'h'],deltF:[.55,'h']},
  labels:[['Triceps','triLat','m'],['Chest','pecL','h'],['Front shoulder','deltF','h']],center:V(0,.78,-12.1),cam:'side',coachSpot:{p:[-.3,-13.45],h:0},
  steps:steps4([['Bring it down','2 sec, elbows tucked'],['Touch the lower chest','light touch'],['Press up','elbows brush the ribs'],['Lock out','over the shoulders']]),
  stepText:['Lower the bar slowly, elbows tucked about 15° from your body.','Touch lightly on the lower chest, a few centimetres lower than a normal bench press.','Press up with the elbows brushing the ribs.','Arms straight over the shoulders.'],
  cues:[['Elbows tucked.'],['Light touch, low.'],['Press.'],['Lock out.']],
  beginner:'3 sets of 6–10, starting with the empty bar. Hands shoulder-width, not touching.',
  forms:mk(base({touchZ:.17,flare:26,grip:.19}),{
    narrow:MS('Grip too narrow','Hands almost touching','The hands are under 25 cm apart, wrists bent back, elbows flaring to make room.','Wrist and elbow strain, and less weight.','Wrist and elbow tendon pain.','Shoulder width, not thumbs.',{grip:.105,flare:48,meas:'handGap',warn:'Hands too close',warnAt:'wrist',cam:'feet'}),
    flare:MS('Elbows flared','Elbows out, bar to the nipples','The elbows flare to 55–90° and the bar drifts up to the nipple line.','The chest and front shoulders take the load.','Shoulder stress; triceps undertrained.','Elbows brush the ribs.',{flare:78,touchZ:.04,meas:'flare',warn:'Elbows flared',warnAt:'shoulder',cam:'above',strain:['deltF'],mul:{pecL:1.4,triLat:.7}}),
    hips:MS('Hips lift','Hips rise off the bench','The bottom lifts off the bench as you press.','Shorter range and the lower back arches under load.','Lower-back strain.','Bottom down, drive the floor.',{hips:1,meas:'hips',warn:'Hips off the bench',warnAt:'hips',cam:'feetLow'})})});
defEx('pushdown',{group:'triceps',name:'Rope pushdown',eq:'Cable',part:'Triceps (outer heads)',station:'cableCol',entry:'cableColA',pulley:2.0,att:'rope',kind:'curl',pose:posePushdown,
  quip:'Elbows glued. Only the forearms are allowed to move.',mus:TRI_MUS,
  labels:[['Triceps','triLat','m']],center:V(0,1.1,-11.65),cam:'sideFlat',coachSpot:{p:[1.4,-12.1],h:-Math.PI/2},
  steps:steps4([['Return slowly','to chest height'],['Elbows at the ribs','hands at the chest'],['Push to the thighs','split the rope'],['Lock out','squeeze']]),
  stepText:['Let the rope rise slowly to chest height.','Elbows by the ribs, hands at the lower chest.','Push the rope down to the thighs, parting the ends at the bottom.','Arms straight; squeeze for a moment.'],
  cues:[['Slowly up.'],['Elbows glued.'],['Push and split.'],['Squeeze.']],
  beginner:'3 sets of 12–15: the best first triceps exercise. Step in before you let go of the rope.',
  forms:mk({lower:2.0,touch:.2,press:1.0,lock:1.0,prof:'smooth'},{
    swing:MS('Elbows swing','Elbows travel forward and back','The upper arms swing about 40° forward and back on every rep.','The lats and shoulders press the stack.','Progress stalls; elbow irritation.','Elbows glued, forearms hinge.',{swing:1,meas:'armRange',warn:'Elbows swing',warnAt:'elbow',cam:'sideFlat',mul:{lats:1.5}}),
    lean:MS('Leaning on the stack','Torso leans over the rope','The torso leans forward 30° or more and bobs with every rep.','Body weight pushes the weight.','Too heavy, no arm growth.','Lighter, stand tall.',{lean:1,meas:'leanMax',warn:'Leaning over it',warnAt:'back',cam:'sideFlat'}),
    half:MS('Half lockout','Arms never straighten','The elbows stop about 30° short of straight.','The last part, the medial head’s, is never loaded.','Weaker lockouts.','Straight arms, squeeze.',{half:1,meas:'flexMin',warn:'Stops short',warnAt:'elbow',cam:'sideFlat'})})});
defEx('ohExt',{group:'triceps',name:'Overhead rope extension',eq:'Cable',part:'Triceps (long head)',station:'cableCol',entry:'cableBack',pulley:.25,att:'rope',kind:'curl',pose:poseOverheadExt,
  quip:'Arms up. The long head finally stretches.',mus:{triLong:[1,'m'],triLat:[.75,'m'],abs:[.25,'h']},
  labels:[['Triceps (long head)','triLong','m']],center:V(0,1.4,-11.9),cam:'sideFlat',coachSpot:{p:[1.4,-12.4],h:-Math.PI/2},
  steps:steps4([['Lower into the stretch','3 sec'],['Hands behind the head','pause one second'],['Extend overhead','elbows by the ears'],['Arms straight','squeeze']]),
  stepText:['Lower slowly, about 3 seconds, hands going behind the head.','Pause for a second in the stretch: this is the point of the exercise.','Straighten the arms overhead. Upper arms stay beside the ears.','Arms straight above and slightly in front of the head.'],
  cues:[['Slow into the stretch.'],['Pause.'],['Elbows by the ears.'],['Lock out.']],
  beginner:'3 sets of 10–15, light (5–15 kg). Limited overhead mobility? Use a single dumbbell on a 60° bench.',
  forms:mk({lower:3.0,touch:1.0,press:1.0,lock:.4,prof:'smooth'},{
    flare:MS('Elbows flare wide','Elbows point out to the sides','The elbows drift to about 60 cm apart and point sideways.','The shoulders and traps share the load.','Shoulder irritation and less stretch on the long head.','Elbows narrow, pointing forward.',{flare:1,meas:'elbowGap',warn:'Elbows wide',warnAt:'elbow',cam:'front'}),
    arch:MS('Lower-back arch','Ribs flare, back arches','The lower back arches 20° or more as the weight goes up.','The back braces for the arms.','Lower-back strain.','Ribs down, squeeze the glutes.',{arch:1,meas:'archBack',warn:'Back arches',warnAt:'lowback',cam:'sideFlat',strain:['erect']}),
    drop:MS('Upper arms drop','Arms fall forward of the head','The upper arms fall to about 120°, so the hands move in front of the head.','The long head loses its stretch.','No overhead benefit.','Biceps touch the ears.',{drop:1,meas:'ohArm',warn:'Arms drop forward',warnAt:'shoulder',cam:'sideFlat'})})});
defEx('skull',{group:'triceps',name:'Skull crusher',eq:'EZ bar',part:'Triceps (long head)',station:'dbFlat',entry:'skull',kind:'curl',pose:poseSkull,needs:'ez',
  quip:'Named for the mistake. Aim behind the head.',mus:{triLong:[1,'m'],triLat:[.85,'m'],deltF:[.2,'h']},
  labels:[['Triceps','triLong','m']],center:V(0,.95,-12.25),cam:'sideFlat',coachSpot:{p:[-.3,-13.6],h:0},
  steps:steps4([['Bend the elbows','3 sec, slowly'],['Bar behind the head','elbows up'],['Extend','upper arms still'],['Lock out','arms angled back']]),
  stepText:['Bend the elbows slowly, about 3 seconds. The upper arms stay angled slightly back toward the head.','The bar passes the hairline and finishes behind the head, not on it.','Straighten the arms without moving the upper arms.','Lock out with the arms angled slightly back, so the triceps stay loaded.'],
  cues:[['Slow down.'],['Past the head.'],['Freeze the upper arms.'],['Lock out.']],
  beginner:'3 sets of 10–12 with the empty EZ bar (about 10 kg). If your elbows hurt, use the overhead rope instead.',
  forms:mk({lower:3.0,touch:.2,press:1.0,lock:.5,prof:'smooth'},{
    flare:MS('Elbows flare out','Elbows spread to the sides','The elbows spread from about 35 cm to 60 cm apart.','The shoulders and chest join in and the elbows take a sideways load.','Elbow-tendon pain: the classic skull-crusher complaint.','Elbows in, pointing up.',{flare:1,meas:'elbowGap',warn:'Elbows flare',warnAt:'elbow',cam:'feet'}),
    rock:MS('Upper arms rock','Arms swing like a pullover','The upper arms swing back and forth by about 40° every rep.','The lats and shoulders move the bar.','Triceps undertrained.','Freeze the upper arms.',{rock:1,meas:'armRange',warn:'Upper arms rock',warnAt:'shoulder',cam:'sideFlat',mul:{lats:1.5}}),
    half:MS('Bar to the forehead','Half range, aimed at the face','The bar stops just above the forehead with the elbows bent only about 70°.','You skip the stretched range.','Less growth, and a real risk of hitting your forehead.','Past the head, not onto it.',{half:1,meas:'flexMax',warn:'Too short',warnAt:'elbow',cam:'sideFlat'})})});
defEx('triDip',{group:'triceps',name:'Upright dip',eq:'Bodyweight',part:'Triceps (all heads)',station:'tower',entry:'dipA',kind:'dip',pose:poseDip,
  quip:'Stay tall; lean forward and it’s chest day.',mus:{triLat:[1,'m'],triLong:[1,'m'],pecL:[.55,'h'],deltF:[.55,'h']},
  labels:[['Triceps','triLat','m'],['Chest','pecL','h'],['Front shoulder','deltF','h']],center:V(0,1.3,-11.95),cam:'sideFlat',coachSpot:{p:[1.35,-11.2],h:-Math.PI/2-.4},
  steps:steps4([['Lower yourself','2 sec, upright'],['Upper arms level','with the floor'],['Press back up','elbows back'],['Lock out','shoulders down']]),
  stepText:['Stay upright, elbows pointing back, and lower yourself slowly.','Stop when the upper arms are about level with the floor.','Press back up without swinging.','Arms straight, shoulders pushed down.'],
  cues:[['Upright, slow.'],['Stop at level.'],['Press.'],['Shoulders down.']],
  beginner:'3 sets of 5–8, or slow lowering-only reps. Front-shoulder pain? Use the close-grip bench or pushdown instead.',
  forms:mk(base({lean:6,flare:14}),{
    flare:MS('Elbows flare','Elbows point out to the sides','The elbows flare to 45–60° and point sideways.','It turns into a chest dip with extra shoulder load.','Front-shoulder strain.','Elbows point behind you.',{flare:60,lean:16,meas:'dipFlare',warn:'Elbows flared',warnAt:'shoulder',cam:'front',strain:['deltF'],mul:{pecL:1.5}}),
    deep:MS('Too deep','Shoulders sink below the elbows','The shoulders drop well below the elbows at the bottom.','The front of the shoulder is loaded at the end of its range.','Shoulder impingement or instability.','Stop at level.',{deep:1.5,meas:'dipDepth',warn:'Too deep',warnAt:'shoulder',cam:'sideFlat',strain:['deltF']}),
    shrug:MS('Shrugging and swinging','Shoulders up, legs swinging','The shoulders rise toward the ears and the legs swing.','Momentum helps and the neck strains.','Fewer reps that count, and neck strain.','Quiet legs, shoulders down.',{shrug:1,meas:'shrug',warn:'Shrugging',warnAt:'neck',cam:'front',strain:['trapU']})})});
defEx('kickback',{group:'triceps',name:'Dumbbell kickback',eq:'Dumbbell',part:'Triceps (long head)',station:'dbFlat',entry:'dbRowBenchA',kind:'curl',pose:poseKickback,needs:'db1',dbSize:'light',
  quip:'Light weight, straight arm, one honest second.',mus:{triLong:[1,'m'],triLat:[.9,'m'],deltR:[.35,'h']},
  labels:[['Triceps','triLong','m'],['Rear shoulder','deltR','h']],center:V(.25,.75,-11.9),cam:'rearR',coachSpot:{p:[1.6,-12.6],h:-Math.PI/2-.4},
  steps:steps4([['Lower the forearm','1 sec'],['Forearm hangs','upper arm level'],['Kick back','straight arm'],['Squeeze','one second']]),
  stepText:['Lower only the forearm until it hangs straight down.','Upper arm level with your back, elbow by the ribs.','Straighten the arm back until it is one straight line.','Squeeze for a second: that squeeze is the whole exercise. We show the right arm; then swap.'],
  cues:[['Forearm down.'],['Elbow high.'],['Kick back.'],['One honest second.']],
  beginner:'3 sets of 12–15 per arm with 2–6 kg. It is a light exercise by design.',
  forms:mk({lower:1.0,touch:.2,press:1.0,lock:1.0,prof:'smooth'},{
    drop:MS('Upper arm drops','Elbow sags toward the floor','The elbow sags so the upper arm points down at the floor.','Gravity no longer loads the lockout, so the rep gets easy.','No stimulus.','Elbow higher than your back.',{drop:1,meas:'kbArm',warn:'Elbow sags',warnAt:'elbow',cam:'rearR'}),
    swing:MS('Swinging the upper arm','Upper arm rows back and forth','The upper arm swings about 35° every rep, like a row.','The rear shoulder and lats do a half row.','Nothing for the triceps.','Only the forearm moves.',{swing:1,meas:'armRangeR',warn:'Upper arm swings',warnAt:'elbow',cam:'rearR',mul:{deltR:2,lats:1.5}}),
    half:MS('Half lockout','Arm never straightens','The elbow stops about 30° short of straight.','The top squeeze, the whole point, never happens.','Wasted sets.','Straight arm, one second.',{half:1,meas:'flexMinR',warn:'Stops short',warnAt:'elbow',cam:'rearR'})})});

function layoutArms(){
  BRACK=buildBarRack(11.35,-16.9,-Math.PI/2);
  makeStation('barStand',9.6,-16.9,-Math.PI/2,g=>buildSpot(g),{name:'barbell rack'});
  makeStation('preacher',3.75,-21.8,0,g=>buildPreacher(g),{name:'preacher bench'});
}
