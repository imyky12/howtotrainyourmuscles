
// ---------------------------------------------------------------- shoulders: poses, entries and the 7 exercises
// standing overhead press from the rack (front rack → lockout over the middle of the foot)
function poseOHP(c,F,b,u,P){const uu=clamp(u,0,1),k=smooth(uu);const lean=F.lean?-24*k:0;
  standPose(c,{z:SQ_FOOT,hinge:lean,stance:.13*D.s,arms:'none',look:0});
  const T=torsoAxes(c);const [sl,sr]=shoulders(c),S=sl.clone().add(sr).multiplyScalar(.5);
  const start=S.clone().addScaledVector(T.F,.165*D.s).addScaledVector(T.U,.06*D.s);const mid=SQ_FOOT+.04;const topY=S.y+Math.sqrt(Math.pow((D.arm+D.fore)*.975,2)-Math.pow(.27*D.s-D.shx,2))+.07;
  const arc=F.arc?.13*Math.sin(Math.PI*Math.min(1,uu*1.15))+.09*uu:0;
  const ct=V(0,lerp(start.y,topY,k),lerp(start.z,(F.lean?S.z+.05:mid+.01),Math.min(1,k*1.3))+arc);
  // head moves back while the bar passes the face, then "through"
  const pass=clamp((ct.y-S.y-.05)/.3,0,1);const headBack=(F.arc?0:.32)*Math.sin(Math.PI*pass);c.bones.Neck.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),-headBack));c.root.updateMatrixWorld(true);
  clav(c,{shrug:.03+.22*Math.max(0,(k-.7)/.3)});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);armTo(c,sd,ct.clone().add(V(s*.27*D.s,0,0)),{hd:V(0,1,0),pn:V(0,.4,1),pole:V(s*.35,-1,F.wrist?-.6:.7),follow:true});
    // bent-back wrists: the hand tips back from the forearm line (worst with the bar on the chest)
    if(F.wrist){const f=handFrame(c,sd);const fa=V().subVectors(wpos(c.bones[sd+'Hand']),wpos(c.bones[sd+'ForeArm'])).normalize();const a=50*DEG*(1-k*.7);
      const back=V(0,0,-1).addScaledVector(fa,-fa.z*-1*0).addScaledVector(fa,V(0,0,-1).dot(fa)*-1).normalize();setHandWorld(c.bones[sd+'Hand'],s>0,fa.clone().multiplyScalar(Math.cos(a)).addScaledVector(back,Math.sin(a)).normalize(),f.pn);curlHand(c,sd,1);}}
  P.bar.position.copy(ct);P.bar.quaternion.identity();c._S=S;c._ohp=ct;return u;}
// seated dumbbell press on the upright bench
const UPRIGHT=80;
function poseSeatPress(c,F,b,u,P){const uu=clamp(u,0,1);const lo=F.half?.45:0;const k=smooth(lerp(lo,1,uu));P.setAngle&&P.setAngle(UPRIGHT);
  lieBody(c,{angle:UPRIGHT*DEG,feet:'floor',breathe:breatheOf(b),dz:.04,neck:-.1});if(F.arch){spineBend(c,-.45*(1-k)-.15);c.root.updateMatrixWorld(true);}
  const T=torsoAxes(c);const [sl,sr]=shoulders(c),S=sl.clone().add(sr).multiplyScalar(.5);
  for(const s of[1,-1]){const sd=sideOf(s);
    // bottom: upper arm just below level and 25° in front of the body (a T, slightly low, for the mistake); top: arms straight overhead
    const uaBot=(F.tee?T.L.clone().multiplyScalar(s).addScaledVector(T.U,-.38):T.L.clone().multiplyScalar(s*Math.cos(25*DEG)).addScaledVector(T.F,Math.sin(25*DEG)).addScaledVector(T.U,-.1)).normalize();
    const uaTop=T.U.clone().addScaledVector(T.L,s*.2).addScaledVector(T.F,.05).normalize();const ua=slerpV(uaBot,uaTop,k);
    const faTop=T.U.clone().addScaledVector(T.L,-s*.08).normalize();const fa=slerpV(T.U.clone().addScaledVector(T.F,F.tee?-.05:.08),faTop,k);
    const r=armDir(c,sd,ua,fa,T.F.clone(),{hd:fa});if(P.db){const d=P.db[s>0?0:1];d.position.copy(r.contact);d.quaternion.setFromUnitVectors(V(1,0,0),T.L);}}
  c._S=S;return u;}
function seatDBThighs(c,P){lieBody(c,{angle:UPRIGHT*DEG,feet:'floor',dz:.04,neck:-.1});const B=c.bones;
  for(const s of[1,-1]){const sd=sideOf(s);const K=wpos(B[sd+'Leg']),H=wpos(B[sd+'UpLeg']);const top=H.lerp(K,.8).add(V(-s*.02,.15*D.s,0));armTo(c,sd,top,{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.5,-.4,-.7)});}}
// raises with dumbbells (standing by the rack): side raise and front raise
function raiseArms(c,F,k,mode,P){const T=torsoAxes(c);
  for(const s of[1,-1]){const sd=sideOf(s);let a=(mode==='front'?lerp(4,F.high?132:90,k):lerp(14,F.swing?98:86,k))*DEG;
    const down=T.U.clone().negate();const out=mode==='front'?T.F.clone().addScaledVector(T.L,s*.06).normalize():T.L.clone().multiplyScalar(s*Math.cos(30*DEG)).addScaledVector(T.F,Math.sin(30*DEG));
    const ua=down.clone().multiplyScalar(Math.cos(a)).addScaledVector(out,Math.sin(a)).normalize();
    const bend=(mode==='front'?12:16)*DEG;let fa=ua.clone().applyAxisAngle(mode==='front'?T.L.clone().multiplyScalar(s>0?1:1):V().crossVectors(ua,T.U).normalize(),0);
    // forearm: a fixed soft bend; "pouring" tips the hands above the elbows
    const lift=F.pour?.45*k:0;fa=ua.clone().addScaledVector(mode==='front'?T.U:T.F,Math.sin(bend)*(mode==='front'?1:1)).addScaledVector(T.U,lift).normalize();
    const pn=mode==='front'?T.U.clone().negate().lerp(T.L.clone().multiplyScalar(-s),1-k).normalize():(F.pour?T.F.clone().multiplyScalar(-1).lerp(T.U.clone().negate(),.5):T.L.clone().multiplyScalar(-s).lerp(T.U.clone().negate(),k)).normalize();
    const r=armDir(c,sd,ua,fa,pn,{hd:fa});if(P.db){const d=P.db[s>0?0:1];if(d){const f=handFrame(c,sd);d.position.copy(r.contact);d.quaternion.setFromUnitVectors(V(1,0,0),f.tz.normalize());}}}}
function poseLatRaise(c,F,b,u,P){const uu=clamp(u,0,1),k=smooth(uu);const sw=F.swing?(b.phase===2?Math.sin(Math.PI*b.k):0):0;
  standPose(c,{z:-12,hinge:F.swing?10-22*sw:5,arms:'none',look:0});clav(c,{shrug:F.shrug?.03+.38*k:.03});c.root.updateMatrixWorld(true);raiseArms(c,F,k,'side',P);return u;}
function poseFrontRaise(c,F,b,u,P){const uu=clamp(u,0,1),k=smooth(uu);const sw=F.swing?(b.phase===2?Math.sin(Math.PI*b.k):0):0;
  standPose(c,{z:-12,hinge:F.swing?-15*sw:2,arms:'none',look:0});clav(c,{shrug:F.shrug?.03+.38*k:.03+(F.high?.2*k:0)});c.root.updateMatrixWorld(true);raiseArms(c,F,k,'front',P);return u;}
// cable lateral raise at the column: side-on, left hand on the tower, right arm works
function poseCableLat(c,F,b,u,P){const uu=clamp(u,0,1),k=smooth(uu);P.use('dh');P.setPulley(.25);
  standPose(c,{z:-11.62,h:-Math.PI/2,arms:'none',side:F.lean?-36*k:-4,look:0});clav(c,{shrug:F.shrug?.03+.36*k:.03});c.root.updateMatrixWorld(true);
  const T=torsoAxes(c);armTo(c,'Left',V(.0,1.12,-11.08),{hd:V(0,1,0),pn:V(0,0,1),pole:V(-.3,-1,-.5)});
  const S=wpos(c.bones.RightArm);const a=lerp(-12,86,k)*DEG;const out=T.L.clone().multiplyScalar(-1).multiplyScalar(Math.cos(30*DEG)).addScaledVector(T.F,Math.sin(30*DEG));
  const ua=T.U.clone().negate().multiplyScalar(Math.cos(a)).addScaledVector(out,Math.sin(a)).normalize();const bend=(F.bend?lerp(15,70,k):15)*DEG;const pp=T.F.clone().addScaledVector(ua,-T.F.dot(ua)).normalize();
  const fa=ua.clone().multiplyScalar(Math.cos(bend)).addScaledVector(pp,Math.sin(bend)).normalize();
  const r=armDir(c,'Right',ua,fa,T.U.clone().negate().lerp(T.L,(1-k)*.8).normalize(),{hd:fa});P.dh.position.copy(r.contact);P.dh.quaternion.identity();P.cableTo(r.contact);P.stackTop.position.y=.25*k;c._S=S;return u;}
// reverse pec deck: sit facing the pad, arms sweep back at shoulder height
function poseRevDeck(c,F,b,u,P){const uu=clamp(u,0,1),k=smooth(uu);const R=seatShoulderRef();
  setRoot(c,qY(Math.PI).multiply(qX(-2*DEG)),V(0,SEAT_TOP+.1*D.s,SEAT_Z+.2));resetRest(c);clav(c,{shrug:F.row?.03+.3*k:.03,protract:.12*(1-k)});c.root.updateMatrixWorld(true);
  for(const s of[1,-1])legTo(c,sideOf(s),V(-s*.31,D.ankY+.06,SEAT_Z-.28),V(-s*.3,.3,-1));
  const r=elbowD(F.row?lerp(165,95,k):162)+.07*D.s;const hz=F.hands==='high'?.12:F.hands==='low'?-.12:0;
  const phi=lerp(-88,F.drop?-88:22,k)*DEG;const phiStart=F.drop?-96:-88;
  for(const s of[1,-1]){const i=s>0?0:1;const sd=sideOf(s);const sh=wpos(c.bones[sd+'Arm']);const w=-s; // facing −z: the lifter's left is world −x
    const ph=lerp(phiStart*DEG,22*DEG,k);const dir=V(w*Math.cos(ph),hz*k*2.2,Math.sin(ph)).normalize();
    const bend=(F.row?lerp(15,85,k):15)*DEG;const ax=V().crossVectors(dir,V(0,-1,0)).normalize();const ua=dir.clone().applyAxisAngle(ax,-bend*.5),fa=dir.clone().applyAxisAngle(ax,bend*.5);
    const rr=armDir(c,sd,ua,fa,V(-w,0,0).applyAxisAngle(V(0,1,0),0),{hd:fa});const ct=rr.contact;
    P.h[i].position.copy(ct);setRod(P.arm[i],V(w*D.shx,1.98,R.z),ct.clone().add(V(0,.1,0)));}
  P.stackTop.position.y=F.drop?.3*Math.max(0,k-.15):.05+.25*k;c._S=R;return u;}
// face pull with the rope at forehead height
function poseFacePull(c,F,b,u,P){const uu=clamp(u,0,1),k=smooth(uu);P.use('rope');P.setPulley(1.65);
  standPose(c,{z:-11.95,hinge:F.lean?-22*k:-3,arms:'none',look:0,stance:.12});clav(c,{shrug:.03,protract:.15*(1-k)});c.root.updateMatrixWorld(true);
  const T=torsoAxes(c);const [sl,sr]=shoulders(c),S=sl.clone().add(sr).multiplyScalar(.5);const head=wpos(c.bones.Head);const hands=[];
  for(const s of[1,-1]){const sd=sideOf(s);const sh=s>0?sl:sr;
    const far=S.clone().addScaledVector(T.F,(D.arm+D.fore)*.92).addScaledVector(T.U,.17).addScaledVector(T.L,s*.05);
    let near;if(F.drop)near=sh.clone().addScaledVector(T.U,-.2).addScaledVector(T.F,.18).addScaledVector(T.L,s*.05);
    else if(F.noRot)near=head.clone().addScaledVector(T.F,.2).addScaledVector(T.U,-.12).addScaledVector(T.L,s*.12);
    else near=sh.clone().addScaledVector(T.F,-.01).addScaledVector(T.U,.24).addScaledVector(T.L,s*.2);
    const ct=far.clone().lerp(near,k);hands.push(ct);
    const pole=F.drop?T.U.clone().negate().addScaledVector(T.L,s*.3):T.L.clone().multiplyScalar(s).addScaledVector(T.U,-.25*(F.noRot?1:0)-.05);
    armTo(c,sd,ct,{hd:F.noRot?T.F.clone():T.F.clone().lerp(T.U,k*.8).normalize(),pn:T.L.clone().multiplyScalar(-s),pole});}
  const mid=hands[0].clone().add(hands[1]).multiplyScalar(.5).addScaledVector(T.F,.18+.1*(1-k));P.ropeAt(mid,hands[0],hands[1]);P.cableTo(mid);P.stackTop.position.y=.25*k;c._S=S;return u;}

Object.assign(MEAS,{
  leanBackTop:{at:'top',get:c=>{const u=V().subVectors(wpos(c.bones.Neck),wpos(c.bones.Hips)).normalize();return -Math.atan2(u.z,u.y)/DEG;},fmt:v=>v<10?'standing tall ('+Math.round(Math.max(0,v))+'° lean)':'leaning back '+Math.round(v)+'°'},
  ohpBar:{at:'top',get:c=>(c._ohp?(c._ohp.z-(SQ_FOOT+.04))*100:0),fmt:v=>Math.abs(v)<4?'bar over the middle of the foot':'bar finishes '+Math.round(v)+' cm in front of the feet'},
  wristBack:{at:'bottom',get:c=>{const B=c.bones;const fa=V().subVectors(wpos(B.LeftHand),wpos(B.LeftForeArm)).normalize(),hd=handFrame(c,'Left').hd;return Math.acos(clamp(fa.dot(hd),-1,1))/DEG;},fmt:v=>v<25?'wrists stacked over the elbows':'wrists bent back '+Math.round(v)+'°'},
  pressBottom:{at:'bottom',get:c=>avg2(s=>elbowAng(c,s)),fmt:v=>v<=100?'dumbbells down to ear height (elbows '+Math.round(v)+'°)':'stops at the forehead (elbows '+Math.round(v)+'°)'},
  elbowFwd:{at:'bottom',get:c=>{const T=torsoAxes(c);return avg2(s=>{const d=V().subVectors(wpos(c.bones[s+'ForeArm']),wpos(c.bones[s+'Arm'])).normalize();return Math.asin(clamp(d.dot(T.F),-1,1))/DEG;});},fmt:v=>v>12?'elbows slightly in front ('+Math.round(v)+'°)':'elbows pinned back in a T'},
  archPad:{pick:'max',get:c=>{const S=vSpine(c);const u=V().subVectors(S.Spine2,S.Hips).normalize();const b=V(0,Math.sin(UPRIGHT*DEG),-Math.cos(UPRIGHT*DEG));return Math.acos(clamp(u.dot(b),-1,1))/DEG;},fmt:v=>v<10?'back flat on the pad':'lower back arches '+Math.round(v)+'° off the pad'},
  handElbow:{at:'top',get:c=>(wpos(c.bones.LeftHand).y-wpos(c.bones.LeftForeArm).y)*100,fmt:v=>v<=1?'elbows lead, hands just below':'hands '+Math.round(v)+' cm above the elbows'},
  flexTop:{at:'top',get:c=>{const T=torsoAxes(c);const d=V().subVectors(wpos(c.bones.LeftForeArm),wpos(c.bones.LeftArm)).normalize();return Math.acos(clamp(-d.dot(T.U),-1,1))/DEG;},fmt:v=>v<=100?'stops at shoulder height ('+Math.round(v)+'°)':'arms go up to '+Math.round(v)+'°'},
  sideLean:{pick:'max',get:c=>{const u=V().subVectors(wpos(c.bones.Neck),wpos(c.bones.Hips)).normalize();const L=pelvisAxes(c).L;return Math.abs(Math.asin(clamp(u.dot(L),-1,1))/DEG);},fmt:v=>v<10?'body still ('+Math.round(v)+'°)':'leaning '+Math.round(v)+'° into the tower'},
  elbowRangeR:{pick:'range',get:c=>elbowAng(c,'Right'),fmt:v=>v<12?'elbow angle stays fixed':'elbow bends '+Math.round(v)+'°'},
  revHands:{at:'top',get:c=>(wpos(c.bones.LeftHand).y-wpos(c.bones.LeftArm).y)*100,fmt:v=>Math.abs(v)<6?'hands level with the shoulders':v>0?'hands '+Math.round(v)+' cm above the shoulders':'hands '+Math.round(-v)+' cm below the shoulders'},
  stackRest:{at:'bottom',get:(c,x)=>(x.P.stackTop.position.y)*100,fmt:v=>v>1?'stack stays off the pile':'stack lands every rep'},
  fpElbow:{at:'top',get:c=>(avg2(s=>wpos(c.bones[s+'ForeArm']).y-wpos(c.bones[s+'Arm']).y))*100,fmt:v=>v>-11?'elbows high, about shoulder height':'elbows '+Math.round(-v)+' cm below the shoulders'},
  fpRot:{at:'top',get:c=>{const d=V().subVectors(wpos(c.bones.LeftHand),wpos(c.bones.LeftForeArm));return Math.atan2(d.y,Math.hypot(d.x,d.z))/DEG;},fmt:v=>v>=40?'hands rotate up beside the ears ('+Math.round(v)+'°)':'forearms stay flat ('+Math.round(v)+'°)'},
});
ENTRY.dbSit={pre:[0,-10.45],face:0, // arrive turned round (the walk's own turn), then back up to the bench
  enter:(st,e)=>[{turn:0},{walk:[0,-11.15],back:true,d:1.2},{call:c=>{c.carry=null;}},{d:1.1,pose:c=>seatDBThighs(c,st.P),props:plantFeet(st,[1,-1].map(s=>({a:V(s*.31,.09,HIPS_Z+.47),t:V(s*.33,.06,HIPS_Z+.62),pole:V(s*.25,1,.55)})))},
    {call:()=>sayFor('Kick each dumbbell up off the knee to the shoulder.',2.8)},{d:1.2,pose:exP(0,1)},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.8,pose:exP(0,1)},{d:1.1,pose:c=>seatDBThighs(c,st.P)},{d:1.0,pose:c=>standDB(c,{z:-11.15})},{call:c=>{c.carry='db';}},{walk:[0,-10.45],d:1.0}]};
const RD_FEET=[1,-1].map(s=>({a:V(-s*.31,D.ankY+.06,SEAT_Z-.28),t:V(-s*.31,.09,SEAT_Z-.43),pole:V(-s*.3,.3,-1)}));
function revDeckSit(c){setRoot(c,qY(Math.PI),V(0,SEAT_TOP+.1*D.s,SEAT_Z+.2));resetRest(c);c.root.updateMatrixWorld(true);for(const s of[1,-1]){const sd=sideOf(s);const A=V(-s*.31,D.ankY+.06,SEAT_Z-.28);legTo(c,sd,A,V(-s*.3,.3,-1));footTo(c,sd,A.clone().add(V(0,-.06,-.15)));}armsHang(c);}
ENTRY.revDeck={pre:[0,-10.8],face:Math.PI,
  enter:(st,e)=>[{walk:[0,-11.6],d:1.0},{d:.6,pose:c=>standPose(c,{z:-11.62,h:Math.PI})},
    {d:1.1,pose:revDeckSit,props:plantFeet(st,RD_FEET)},
    {d:1.0,pose:exP(0,1)},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.8,pose:exP(0,1)},{d:.9,pose:revDeckSit},
    {d:1.0,pose:c=>standPose(c,{z:-11.62,h:Math.PI}),props:plantFeet(st,standFeet({z:-11.62,h:Math.PI}))},{turn:0},{walk:[0,-10.8],d:1.0}]};
// cable column, shoulders version: set the pulley (shared colSet), then take the attachment from where it hangs, step into place with it;
// the attachment follows the hands the whole time and is hung back on the pulley by hand before letting go
const COLS_Z=-11.48;
// crouched at the column, right hand on the D-handle hanging at the low pulley, left hand on the thigh
function dhGrab(c,curl){standPose(c,{z:COLS_Z,arms:'none',drop:.72,hinge:36,back:.05,stance:.3,toe:30,look:-10});restHandThigh(c,1);
  armTo(c,'Right',ST.P.restPos(),{hd:V(0,-.35,1),pn:V(0,-1,.25),pole:V(-.5,.1,-.6),curl});}
// standing at the column, both hands on the rope just above its knobs (rope hanging from the high pulley)
function ropeGrab(c,curl){standPose(c,{z:COLS_Z,arms:'none'});const P=ST.P;
  // the knobs where the rope hangs at rest (the same geometry as P.rest), not where it is now (it may be in the hands)
  const p=P.restPos(),dn=Math.min(.25,Math.max(0,p.y-.04)),fw=Math.sqrt(.25*.25-dn*dn);
  for(const s of[1,-1]){armTo(c,sideOf(s),p.clone().add(V(s*.04,-dn+.03,-fw)),{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.6,-.6,-.4),curl});}}
// props: the D-handle sits in the right hand
function dhHold(st){return c=>{const p=toC(st,gripPoint(c,'Right'));st.P.dh.position.copy(p);st.P.dh.quaternion.identity();st.P.cableTo(p);};}
// props: the rope ends sit in the hands; w 0 = held just above the knobs as it hangs, 1 = the face pull's own rope line
function ropeHold(st,w){return (c,k)=>{const P=st.P,ww=w(k),iq=st.q.clone().invert();const l=toC(st,gripPoint(c,'Left')),r=toC(st,gripPoint(c,'Right'));const mid=l.clone().add(r).multiplyScalar(.5);
  const F=torsoAxes(c).F.applyQuaternion(iq);const clip=mid.clone().add(V(0,.22,0).lerp(F.multiplyScalar(.28),ww));const dn=V(0,-.03*(1-ww),0);
  P.ropeAt(clip,l.add(dn),r.add(dn));P.cableTo(clip);};}
// standing upright at the column with the D-handle hanging in the right hand
function dhCarry(c){standPose(c,{z:COLS_Z,arms:'none'});armsHang(c);curlHand(c,'Right',1);}
// the shared pulley set-up, unhurried: the reach to a far carriage and the big height change take longer
function colSetS(y,att){const cs=colSet(y,att).slice(0,3);return [cs[0],{...cs[1],d:1.4},{...cs[2],d:2.5}];}
const GRIP_CLOSE=(B,a,b)=>(c,k)=>B(c,lerp(a,b,smooth(k)));
ENTRY.cableSide={pre:[0,-12.35],face:0,
  enter:(st,e)=>[...colSetS(e.pulley,e.att),{d:1.0,anim:settle(c=>dhGrab(c,.15))},{d:.35,anim:GRIP_CLOSE(dhGrab,.15,1)},
    {d:1.1,anim:settle(dhCarry),props:dhHold(st)},{d:1.3,anim:settle(exP(0,1),{step:1}),props:dhHold(st)},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.9,pose:exP(0,1),props:dhHold(st)},{d:1.3,anim:settle(dhCarry,{step:1}),props:dhHold(st)},{d:1.1,anim:settle(c=>dhGrab(c,1)),props:dhHold(st)},{d:.35,anim:GRIP_CLOSE(dhGrab,1,.15)},
    {call:()=>st.P.rest()},{d:1.1,anim:settle(c=>standPose(c,{z:COLS_Z}))},{walk:[0,-12.35],back:true,d:1.0}]};
ENTRY.cableColS={pre:[0,-12.35],face:0,
  enter:(st,e)=>[...colSetS(e.pulley,e.att),{d:.9,anim:settle(c=>ropeGrab(c,.15),{step:1})},{d:.35,anim:GRIP_CLOSE(ropeGrab,.15,1)},
    {d:1.4,anim:settle(exP(0,1),{step:1}),props:ropeHold(st,k=>smooth(k))},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.9,pose:exP(0,1),props:ropeHold(st,()=>1)},{d:1.4,anim:settle(c=>ropeGrab(c,1),{step:1}),props:ropeHold(st,k=>1-smooth(k))},{d:.35,anim:GRIP_CLOSE(ropeGrab,1,.15)},
    {call:()=>st.P.rest()},{d:1.1,anim:settle(c=>standPose(c,{z:COLS_Z}))},{walk:[0,-12.35],back:true,d:1.0}]};
// standing with dumbbells by the rack: the first raise is animated so the rep driver (which starts at the top) takes over smoothly
ENTRY.dbStandS={pre:[0,-12.4],face:0,
  enter:(st,e)=>[{walk:[0,-12],d:.8},{call:c=>{c.carry=null;}},{d:.7,pose:c=>standDB(c,{z:-12})},{d:.8,pose:exP(0,1)},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:1.2,pose:exP(0,1)},{d:.8,pose:c=>standDB(c,{z:-12})},{call:c=>{c.carry='db';}},{walk:[0,-12.4],back:true,d:.7}]};

defEx('ohp',{group:'shoulders',name:'Overhead press',eq:'Barbell',part:'Front shoulders',station:'squatRack',entry:'rack',front:true,kind:'press',pose:poseOHP,
  quip:'Press straight up. Your lower back is not a hinge.',
  mus:{deltF:[1,'m'],deltS:[.85,'m'],triLat:[.75,'h'],triLong:[.6,'h'],trapU:[.5,'h'],deltR:[.3,'h'],abs:[.35,'h'],glute:[.25,'h']},
  labels:[['Front shoulders','deltF','m'],['Side shoulders','deltS','m'],['Triceps','triLat','h']],center:V(0,1.45,-11.95),cam:'frontQ',coachSpot:{p:[-1.4,-12.5],h:Math.PI/2-.4},
  steps:steps4([['Lower to the upper chest','2 sec'],['Bar on the chest','elbows under'],['Press straight up','head back, then through'],['Lock out','bar over the feet']]),
  stepText:['Lower the bar along the same straight line to the top of your chest.','Bar on the upper chest, elbows slightly in front, wrists stacked.','Press straight up. Tip the head back so the bar clears the face.','Head through, arms straight, bar over the middle of the foot. A small shrug at the top is correct.'],
  cues:[['Lower to the chest.'],['Elbows under.'],['Straight up.','Squeeze glutes, ribs down.'],['Head through.']],
  beginner:'3 sets of 6–10 with the empty 20 kg bar or a light technique bar.',
  forms:mk(base({lower:2.0,touch:.25,press:1.0,lock:.6}),{
    lean:MS('Leaning back','Body leans back to push','The torso leans back 20–30° with the ribs flared as you press.','It turns into an incline press and the lower back takes the load.','A sore lower back after press days.','Squeeze glutes, ribs down.',{lean:1,meas:'leanBackTop',warn:'Leaning back',warnAt:'lowback',cam:'sideHigh',strain:['erect']}),
    arc:MS('Bar drifts forward','Bar arcs out in front of the face','The bar travels 10–15 cm in front of the feet and finishes in front of the shoulders.','The shoulder works at a longer lever, so less weight goes up.','Elbow and shoulder strain from the forward lean.','Head through, bar over the ears.',{arc:1,meas:'ohpBar',warn:'Bar out front',warnAt:'shoulder',cam:'sideHigh',strain:['deltF']}),
    wrist:MS('Wrists bent back','Elbows behind the bar, wrists bent','The elbows sit behind the bar at the start and the wrists bend back about 40°.','The press starts from a weak position.','Wrist pain.','Elbows under, knuckles up.',{wrist:1,meas:'wristBack',warn:'Wrists bent back',warnAt:'wrist',cam:'sideHigh'})})});
defEx('seatPress',{group:'shoulders',name:'Seated dumbbell press',eq:'Dumbbell',part:'Front shoulders',station:'dbUpright',entry:'dbSit',kind:'press',pose:poseSeatPress,needs:'db',dbSize:'medium',
  quip:'Ears to lockout, every rep. Half reps, half shoulders.',
  mus:{deltF:[1,'m'],deltS:[.8,'m'],triLat:[.6,'h'],triLong:[.5,'h'],trapU:[.4,'h']},
  labels:[['Front shoulders','deltF','m'],['Side shoulders','deltS','m'],['Triceps','triLat','h']],center:V(0,1.2,-12.0),cam:'three',coachSpot:{p:[.15,-13.75],h:0},
  steps:steps4([['Lower to the ears','2 sec'],['Dumbbells at ear height','elbows a bit forward'],['Press up and in','breathe out'],['Lock out','over the shoulders']]),
  stepText:['Lower both dumbbells slowly to ear height.','Dumbbells level with the ears, elbows about 90° and slightly in front of the body.','Press up and slightly in, breathing out.','Arms straight, dumbbells about 10 cm apart over the shoulders.'],
  cues:[['Lower to the ears.'],['Elbows a bit forward.'],['Press up and in.'],['Lock out.']],
  beginner:'3 sets of 8–12 with dumbbells you can kick up on your own.',
  forms:mk(base({lower:2.0,touch:.2,press:1.0,lock:.5}),{
    half:MS('Half reps','Dumbbells stop at the forehead','The dumbbells stop at forehead height, so the elbows never bend past about 120°.','The stretched part of the press is skipped.','Less growth from the same sets.','Dumbbells to the ears.',{half:1,meas:'pressBottom',warn:'Stops short',warnAt:'elbow',cam:'three'}),
    flare:MS('Elbows in a T, too deep','Elbows pinned back, dumbbells too low','The elbows are pinned straight out to the sides and the dumbbells sink below the shoulders.','More strain on the front of the shoulder and a weaker press.','Front-shoulder irritation under heavy loads (coaching consensus).','Elbows slightly forward.',{tee:1,meas:'elbowFwd',warn:'Elbows pinned back',warnAt:'shoulder',cam:'above',strain:['deltF']}),
    arch:MS('Arching off the pad','Lower back peels off the pad','The lower back leaves the pad and the ribs flare.','It becomes an incline press.','A sore lower back.','Ribs down, back on the pad.',{arch:1,meas:'archPad',warn:'Back arches',warnAt:'lowback',cam:'sideFlat',strain:['erect']})})});
defEx('latRaise',{group:'shoulders',name:'Dumbbell lateral raise',eq:'Dumbbell',part:'Side shoulders',station:'dbStand',entry:'dbStandS',kind:'raise',pose:poseLatRaise,needs:'db',dbSize:'light',
  quip:'Elbows lead, body still. Light weight, big shoulders.',
  mus:{deltS:[1,'m'],deltF:[.45,'h'],deltR:[.5,'h'],trapU:[.4,'h']},
  labels:[['Side shoulders','deltS','m'],['Rear shoulders','deltR','h'],['Upper traps','trapU','h']],center:V(0,1.3,-12),cam:'front',coachSpot:{p:[-1.3,-11.3],h:Math.PI/2+.5},
  steps:steps4([['Lower slowly','2 sec'],['Arms just off the sides','keep tension'],['Raise to shoulder height','elbows lead'],['Hold one second','shoulders down']]),
  stepText:['Lower the dumbbells slowly, about 2 seconds.','Stop just before they touch your legs, so the shoulders stay loaded.','Raise the arms out and slightly forward until the elbows are level with the shoulders. Elbows lead, soft bend.','Hold a second with the shoulders down, then lower.'],
  cues:[['Lower slowly.'],['Keep tension.'],['Elbows lead.'],['Shoulders down.']],
  beginner:'3 sets of 12–15 with 2–5 kg. Stop at shoulder height; no swinging.',
  forms:mk({lower:2.0,touch:.4,press:1.0,lock:1.0,prof:'smooth'},{
    swing:MS('Swinging','Body rocks to throw the weights up','The torso rocks forward and back on every rep and the dumbbells fly above the shoulders.','Momentum, not the side shoulders, lifts the weight.','More weight on the rack, same shoulders.','Lighter weight, body still.',{swing:1,meas:'leanRange',warn:'Body swings',warnAt:'lowback',cam:'sideFlat'}),
    shrug:MS('Shrugging','Shoulders rise to the ears','The shoulders rise 4–6 cm toward the ears as the arms go up.','The upper traps steal the work.','Tight traps, flat shoulders.','Shoulders down, reach wide.',{shrug:1,meas:'shrugRise',warn:'Shoulders shrug',warnAt:'neck',cam:'front',strain:['trapU'],mul:{trapU:2.4}}),
    pour:MS('Pouring the jug','Hands above elbows, thumbs down','The hands rise above the elbows with the thumbs turned down, like pouring a jug.','It shifts the load to the rear shoulders and traps.','Thumbs-down raises at the top are the position most shoulder advice warns against.','Elbows lead, thumbs level.',{pour:1,meas:'handElbow',warn:'Thumbs down',warnAt:'shoulder',cam:'front',mul:{deltR:1.4}})})});
defEx('cableLat',{group:'shoulders',name:'Cable lateral raise',eq:'Cable',part:'Side shoulders',station:'cableCol',entry:'cableSide',pulley:.25,att:'dh',kind:'raise',pose:poseCableLat,
  quip:'Tension at the bottom too. The cable never rests.',
  mus:{deltS:[1,'m'],deltF:[.4,'h'],deltR:[.45,'h'],trapU:[.35,'h']},
  labels:[['Side shoulder','deltS','m'],['Upper traps','trapU','h']],center:V(0,1.2,-11.7),cam:'back',coachSpot:{p:[-1.4,-12.3],h:Math.PI/2},
  steps:steps4([['Lower across the body','3 sec'],['Handle at the far hip','stretch'],['Sweep out to shoulder height','elbow leads'],['Hold one second','shoulder down']]),
  stepText:['Lower the handle slowly back across the front of the body.','Hand by the opposite hip: the cable keeps the side shoulder loaded even here.','Sweep the arm out and slightly forward to shoulder height.','Hold a second. We show the right arm; then turn round for the left. It grows the shoulder the same as dumbbells; the cable just keeps tension at the bottom.'],
  cues:[['Slow across.'],['Stretch.'],['Sweep out.'],['Hold.']],
  beginner:'3 sets of 12–15 each arm on the lightest plates.',
  forms:mk({lower:2.6,touch:.4,press:1.0,lock:1.0,prof:'smooth'},{
    lean:MS('Leaning into the tower','Body tilts toward the tower','The torso tilts 20–30° toward the tower and the hips swing out.','The body does the lifting.','No extra shoulder, and strain on the lower back.','Hips still; only the arm moves.',{lean:1,meas:'sideLean',warn:'Leaning',warnAt:'hips',cam:'back'}),
    bend:MS('Bending the elbow','Elbow bends like a curl','The elbow bends from about 165° to 110° as the arm rises.','A shorter lever means less shoulder work.','The biceps grow; the shoulders don’t.','The elbow angle never changes.',{bend:1,meas:'elbowRangeR',warn:'Elbow bends',warnAt:'elbow',cam:'back',mul:{biLong:1.4}}),
    shrug:MS('Shrugging','Shoulder rises toward the ear','The working shoulder rises 4–6 cm toward the ear.','The upper traps take over.','Tight traps, flat shoulders.','Shoulder down, reach wide.',{shrug:1,meas:'shrugRise',warn:'Shoulder shrugs',warnAt:'neck',cam:'back',strain:['trapU'],mul:{trapU:2.4}})})});
defEx('frontRaise',{group:'shoulders',name:'Dumbbell front raise',eq:'Dumbbell',part:'Front shoulders',station:'dbStand',entry:'dbStandS',kind:'raise',pose:poseFrontRaise,needs:'db',dbSize:'light',
  quip:'Raise to the shoulder, stop. Higher is just showing off.',
  mus:{deltF:[1,'m'],pecU:[.4,'h'],deltS:[.4,'h'],trapU:[.3,'h']},
  labels:[['Front shoulders','deltF','m'],['Upper chest','pecU','h']],center:V(0,1.3,-12),cam:'sideFlat',coachSpot:{p:[-1.3,-11.3],h:Math.PI/2+.5},
  steps:steps4([['Lower to the thighs','2 sec'],['Dumbbells on the thighs','reset'],['Raise to shoulder height','arms long'],['Hold one second','shoulders down']]),
  stepText:['Lower the dumbbells slowly to the front of the thighs.','Dumbbells against the thighs, palms facing you.','Raise straight in front to shoulder height, elbows softly bent.','Hold for a second, then lower. Presses already work the front shoulder hard, so this one is optional.'],
  cues:[['Lower slowly.'],['Reset.'],['Up to shoulder height.'],['Stop there.']],
  beginner:'2 sets of 12–15 with 2–5 kg. Skip it if the front of the shoulder is sore after pressing.',
  forms:mk({lower:2.0,touch:.3,press:1.0,lock:1.0,prof:'smooth'},{
    swing:MS('Leaning back','Body leans back to swing them up','The torso leans back about 15° on each raise to swing the dumbbells up.','Momentum lifts the weight.','The lower back takes the strain.','Body still, arms only.',{swing:1,meas:'leanRange',warn:'Leaning back',warnAt:'lowback',cam:'sideFlat'}),
    high:MS('Above the head','Raises far above the head','The arms keep going to about 130°, above the head.','The traps and serratus do the top part.','Wasted range, nothing dangerous.','Stop at shoulder height.',{high:1,meas:'flexTop',warn:'Too high',warnAt:'shoulder',cam:'sideFlat',mul:{trapU:2}}),
    shrug:MS('Shrugging','Shoulders rise to the ears','The shoulders rise toward the ears as the arms go up.','The upper traps take over.','Tight traps.','Shoulders down.',{shrug:1,meas:'shrugRise',warn:'Shoulders shrug',warnAt:'neck',cam:'front',strain:['trapU'],mul:{trapU:2.4}})})});
defEx('revDeck',{group:'shoulders',name:'Reverse pec deck',eq:'Machine',part:'Rear shoulders',station:'pecDeck',entry:'revDeck',kind:'raise',pose:poseRevDeck,
  quip:'Sweep, don’t row. The rear delt is shy, not absent.',
  mus:{deltR:[1,'m'],midBack:[.6,'h'],deltS:[.35,'h']},
  labels:[['Rear shoulders','deltR','m'],['Middle back','midBack','h']],center:V(0,1.3,-12.1),cam:'above',coachSpot:{p:[-1.5,-11.4],h:Math.PI/2},
  steps:steps4([['Return slowly','2 sec'],['Hands together','don’t let the stack land'],['Sweep the arms back','long arms'],['Hold one second','hands at shoulder height']]),
  stepText:['Bring the handles back together slowly.','Hands meet in front at shoulder height. The stack stays just off the pile.','Sweep the arms out and back in a wide arc, elbows softly bent.','Arms just behind the body, hands level with the shoulders. Hold a second.'],
  cues:[['Return slowly.'],['Stack stays up.'],['Sweep back.'],['Hold.']],
  beginner:'3 sets of 12–15, light. Set the handles to the rear position and sit facing the pad.',
  forms:mk({lower:2.0,touch:.4,press:1.0,lock:1.0,prof:'smooth'},{
    row:MS('Turning it into a row','Elbows bend and shoulders shrug','The elbows bend about 70° and the shoulders rise, so it becomes a row.','The traps and middle back row the weight; the rear shoulders are bypassed.','Little rear-shoulder growth.','Long arms. Sweep, don’t row.',{row:1,meas:'elbowRange',warn:'Rowing',warnAt:'elbow',cam:'above',mul:{midBack:1.6,deltR:.7,trapU:1.6}}),
    high:MS('Hands too high','Hands finish above the shoulders','The hands finish 10–15 cm above the shoulders.','The upper traps take over.','The rear shoulders stay undertrained.','Hands level with the shoulders.',{hands:'high',meas:'revHands',warn:'Hands too high',warnAt:'shoulder',cam:'sideFlat',mul:{trapU:1.8}}),
    drop:MS('Letting the stack land','Stack drops at the front each rep','The arms rest at the front and the stack lands on every rep.','Tension is lost every rep.','Fewer reps that count.','Stop just before the plates touch.',{drop:1,meas:'stackRest',warn:'Stack lands',warnAt:'shoulder',cam:'three'})})});
defEx('facePull',{group:'shoulders',name:'Cable face pull',eq:'Cable',part:'Rear shoulders',station:'cableCol',entry:'cableColS',pulley:1.65,att:'rope',kind:'pull',pose:poseFacePull,
  quip:'Pull the rope to your face, not your ego.',
  mus:{deltR:[1,'m'],midBack:[.8,'m'],deltS:[.4,'h'],biLong:[.3,'h']},
  labels:[['Rear shoulders','deltR','m'],['Middle back','midBack','m']],center:V(0,1.45,-11.6),cam:'sideFlat',coachSpot:{p:[1.5,-12.0],h:-Math.PI/2},
  steps:steps4([['Return slowly','2 sec'],['Arms straight','rope at forehead height'],['Pull to the ears','elbows high'],['Rotate up','one second']]),
  stepText:['Let the rope travel back slowly until the arms are straight.','Arms straight toward the pulley at forehead height.','Pull the rope apart toward your ears, elbows high and wide.','Finish with the hands beside the ears, rotated up. Hold a second.'],
  cues:[['Return slowly.'],['Arms straight.'],['Elbows high.'],['Show your biceps.']],
  beginner:'2–3 sets of 15–20, light. This is never a heavy exercise.',
  forms:mk({lower:2.0,touch:.3,press:1.0,lock:1.0,prof:'smooth'},{
    drop:MS('Elbows dropping','Elbows drop to the ribs like a row','The elbows end down by the ribs, 20–30 cm below the shoulders.','The lats and middle back row the weight; the rear shoulders are bypassed.','The rear shoulders stay small.','Elbows high, pull to the face.',{drop:1,meas:'fpElbow',warn:'Elbows drop',warnAt:'elbow',cam:'sideFlat',mul:{lats:1.5,deltR:.6}}),
    lean:MS('Leaning back','Body leans back to pull','The torso leans back 20–30° and the hips push forward.','Body weight pulls the stack.','Lower-back strain as the pin goes up.','Lighter pin, body still.',{lean:1,meas:'leanRange',warn:'Leaning back',warnAt:'lowback',cam:'sideFlat'}),
    noRot:MS('No rotation','Hands stop level with the elbows','The forearms stay flat and the hands stop in front of the chin.','The rotator-cuff part of the exercise is skipped.','Less cuff work from the same sets.','Show your biceps at the end.',{noRot:1,meas:'fpRot',warn:'No rotation',warnAt:'wrist',cam:'sideFlat'})})});
