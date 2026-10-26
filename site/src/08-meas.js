
// ---------------------------------------------------------------- chest measurements and calibration
function hipGapCm(c){return Math.max(0,(wpos(c.bones.Hips).y-c._hipT.y)*100);}
function touchPlace(c,P){const d=P.bar.position.z-c._S.z;return d>.08?'lower chest':d>-.02?'upper chest':'neck';}
Object.assign(MEAS,{
  flare:{at:'bottom',get:c=>(flareDeg(c,'Left')+flareDeg(c,'Right'))/2,fmt:v=>'elbows '+Math.round(v)+'° from the body at the bottom'},
  hips:{pick:'max',get:c=>hipGapCm(c),fmt:v=>v<2?'hips stay on the bench':'hips '+Math.round(v)+' cm off the bench'},
  speed:{at:'bottom',get:c=>c._vmax||0,fmt:v=>'bar comes down at '+v.toFixed(1)+' m/s'},
  touch:{at:'bottom',get:(c,x)=>touchPlace(c,x.P),fmt:v=>'bar touches the '+v},
  angle:{get:(c,x)=>x.F.angle,fmt:v=>v>=0?'bench at '+v+'°':'bench tipped '+(-v)+'° head-down'},
  elbowDrop:{at:'bottom',get:c=>{const v=venOf(c);let t=0;for(const sd of['Left','Right'])t+=V().subVectors(wpos(c.bones[sd+'Arm']),wpos(c.bones[sd+'ForeArm'])).dot(v);return t/2*100;},
    fmt:v=>v<3?'elbows level with the shoulders':'elbows '+Math.round(v)+' cm below the shoulders'},
  dbDepth:{at:'bottom',get:(c,x)=>(FORMS.good.touchY-(x.P.db[0].position.y+x.P.db[1].position.y)/2)*100,fmt:v=>v<5?'dumbbells level with the chest':'dumbbells '+Math.round(v)+' cm below the chest'},
  dbGap:{at:'top',get:(c,x)=>(Math.abs(x.P.db[0].position.x-x.P.db[1].position.x)-.28)*100,fmt:v=>v<1.5?'dumbbells bang together':'dumbbells '+Math.round(v)+' cm apart at the top'},
  armBelow:{at:'bottom',get:c=>{let t=0;for(const sd of['Left','Right']){const a=wpos(c.bones[sd+'Arm']),e=wpos(c.bones[sd+'ForeArm']);t+=THREE.MathUtils.radToDeg(Math.asin(clamp((a.y-e.y)/a.distanceTo(e),-1,1)));}return t/2;},
    fmt:v=>v<3?'upper arms level with the shoulders':'upper arms '+Math.round(v)+'° below the shoulders'},
  elbowMin:{pick:'min',get:c=>(elbowAng(c,'Left')+elbowAng(c,'Right'))/2,fmt:v=>v>172?'elbows locked straight ('+Math.round(v)+'°)':v>145?'elbows stay softly bent ('+Math.round(v)+'°)':'elbows bend to '+Math.round(v)+'°'},
  handsEnd:{at:'top',get:c=>{const h=(wpos(c.bones.LeftHand).y+wpos(c.bones.RightHand).y)/2,B=c.bones;
      return h<wpos(B.Hips).y+.22?'the hips':h<wpos(B.Spine2).y+.02?'the lower chest':h<wpos(B.Neck).y+.08?'upper-chest height':'above the head';},fmt:v=>v==='above the head'?'hands go above the head':'hands meet at '+v},
  handleH:{at:'bottom',get:c=>(wpos(c.bones.LeftArm).y-wpos(c.bones.LeftHand).y)*100,fmt:v=>v>5?'handles at mid-chest height':'handles at shoulder height'},
  pad:{pick:'max',get:c=>{const y=V(0,1,0).applyQuaternion(c.root.getWorldQuaternion(new THREE.Quaternion()));return Math.max(0,THREE.MathUtils.radToDeg(Math.atan2(y.z,y.y))+SEAT_RECLINE/DEG);},
    fmt:v=>v<3?'back stays on the pad':'back leans '+Math.round(v)+'° off the pad'},
  startOpen:{at:'bottom',get:c=>-(c._phi||0)/DEG,fmt:v=>'arms open to '+Math.round(v)+'° behind the body'},
  sag:{pick:'abs',get:c=>{const H=wpos(c.bones.Hips),S=c._S,T=c._T.clone().add(V(0,.12*D.s,-.05));const t=clamp((H.z-S.z)/(T.z-S.z),0,1);return (lerp(S.y,T.y,t)-H.y)*100;},
    fmt:v=>Math.abs(v)<4?'body in one straight line':v>0?'hips '+Math.round(v)+' cm too low':'hips '+Math.round(-v)+' cm too high'},
  dipDepth:{at:'bottom',get:c=>{let t=0;for(const sd of['Left','Right'])t+=wpos(c.bones[sd+'Arm']).y-wpos(c.bones[sd+'ForeArm']).y;return t/2*100;},
    fmt:v=>v>-6.5?'upper arms about level with the floor':'shoulders '+Math.round(-v)+' cm below the elbows'},
  shrug:{pick:'max',get:c=>{const up=V(0,1,0).applyQuaternion(c.root.getWorldQuaternion(new THREE.Quaternion()));return (V().subVectors(wpos(c.bones.LeftArm),wpos(c.bones.Neck)).dot(up)-D.shrug0)*100;},fmt:v=>v<2.5?'shoulders down, away from the ears':'shoulders '+Math.round(v)+' cm up toward the ears'},
});

// measure the real chest surface under the bar (skinned mesh, shirt included) so a "touch" really touches
function chestTopAt(c,bz){let top=-9;const v=V();c.root.updateMatrixWorld(true);
  c.root.traverse(o=>{if(!o.isSkinnedMesh)return;const n=o.geometry.attributes.position.count;
    for(let i=0;i<n;i++){o.getVertexPosition(i,v);v.applyMatrix4(o.matrixWorld);if(Math.abs(v.x)<.12&&Math.abs(v.z-bz)<.03&&v.y>top)top=v.y;}});return top;}
const BAR_R=.014;
// done once per exercise, in the canonical frame (before the station transform)
function calibrateEx(e){if(!e.calib||e._cal)return;const P=STATIONS[e.station].P;const keep=snapshot(hero);
  for(const k in e.forms){const F=e.forms[k];F.touchY=undefined;
    for(let it=0;it<3;it++){e.pose(hero,F,{phase:1,k:.5},0,P);F.touchY=chestTopAt(hero,hero._touchZw)+(e.fam==='bar'?BAR_R+.002:0);}}
  e._cal=true;applySnap(hero,keep);}
