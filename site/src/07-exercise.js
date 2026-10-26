
// ---------------------------------------------------------------- exercise timing, muscles, measurements
// phase 0 = lowering / stretching (eccentric), 1 = bottom / stretch, 2 = lifting (concentric), 3 = top / squeeze
// u = 0 at the stretched end, 1 at the contracted end
const EXS={};let EX=null,EXK=null,FORMS=null,ST=null;
const PRESS=(()=>{const n=200,v=[],u=[0];for(let i=0;i<=n;i++){const t=i/n;v.push(Math.pow(Math.sin(Math.PI*t),.55)*(1-.55*Math.exp(-Math.pow((t-.42)/.11,2)))+.02);}
  for(let i=1;i<=n;i++)u.push(u[i-1]+(v[i]+v[i-1])/2);const tot=u[n];return t=>{const x=clamp(t,0,1)*n,i=Math.floor(x),f=x-i;return (u[i]+(u[Math.min(n,i+1)]-u[i])*f)/tot;};})();
let form='good', speed=1, repT=0, rep=1, fatigue=0, paused=false;
function repTiming(F=FORMS[form]){return {lower:F.lower,touch:F.touch,press:F.press*(1+fatigue*.06),lock:F.lock};}
function barAt(t,F=FORMS[form]){const T=repTiming(F);const tot=T.lower+T.touch+T.press+T.lock;t=((t%tot)+tot)%tot;const sm=F.prof!=='press';
  if(t<T.lower){const k=t/T.lower;return {u:1-smooth(k),phase:0,k};}
  t-=T.lower;if(t<T.touch){const k=t/T.touch;return {u:sm?0:-.012*Math.sin(Math.PI*k),phase:1,k};}
  t-=T.touch;if(t<T.press){const k=t/T.press;return {u:sm?smooth(k):PRESS(k),phase:2,k};}
  t-=T.press;const k=t/T.lock;return {u:1+(sm?0:.004*Math.sin(Math.PI*k)*(1-k)),phase:3,k};}
function repLength(F=FORMS[form]){const T=repTiming(F);return T.lower+T.touch+T.press+T.lock;}
function tremorOf(b){return (b.phase===2&&b.k>.3&&b.k<.6)?Math.sin(performance.now()*.07)*.0025*(1+fatigue*.4):0;}
function breatheOf(b){return b.phase===0?b.k:b.phase===1?1:b.phase===2?1-b.k:0;}
function base(o){return Object.assign({lower:2.0,touch:.18,press:1.0,lock:.55,flare:52,prof:'press'},o);}
function mk(goodTiming,mist){const f={good:Object.assign({},goodTiming)};for(const k in mist)f[k]=Object.assign({},goodTiming,mist[k]);return f;}

// ---- how hard each muscle works through the rep (relative); scaled by the exercise's map and a mistake's multipliers
function phaseCurve(kind,b){const k=b.k,p=b.phase;
  if(kind==='fly')return {m:[.45+.5*k,1,1-.15*k,.8][p],h:[.3,.5,.45,.3][p]};
  if(kind==='dip')return {m:[.45+.4*k,.95,k<.6?1:.6,.2][p],h:[.4,.6,.6+.4*k,.45][p]};
  if(kind==='pull'||kind==='curl'||kind==='raise')return {m:[.75-.25*k,.5,.6+.4*k,.95][p],h:[.45,.35,.5+.2*k,.6][p]};
  if(kind==='hold')return {m:.85+.06*Math.sin(b.k*Math.PI*2),h:.6};
  if(kind==='squat'||kind==='hinge')return {m:[.5+.4*k,1,k<.5?1:1-.6*(k-.5),.25][p],h:[.35,.6,.6,.2][p]};
  return {m:[.5+.4*k,.95,k<.6?1:1-.7*(k-.6)/.4,.22][p],h:[.35,.6,.55,.3][p]};}
function intensities(E,F,b){const c=phaseCurve(E.kind,b),x=F.mul||{},out={};
  for(const r in E.mus){const [w,role]=E.mus[r];const base=role==='m'?c.m:c.h;out[r]=clamp(base*w*(x[r]??1),0,1.15);}
  if(F.mul)for(const r in F.mul)if(!(r in out))out[r]=clamp(.6*F.mul[r],0,1);return out;}
function setGlows(U,E,F,b,hide){U.uLv.value.fill(0);U.uRole.value.fill(0);const I=intensities(E,F,b);
  for(const r in I){const id=RID[r];if(!id)continue;U.uLv.value[id]=I[r];const role=(E.mus[r]||[0,'h'])[1];U.uRole.value[id]=role==='m'?0:(!hide&&F.strain&&F.strain.includes(r))?2:1;}
  return I;}
function clearGlows(U){U.uLv.value.fill(0);}

// ---- measurements read from the pose (held per rep so a number means something)
function elbowAng(c,side){const B=c.bones;const a=wpos(B[side+'Arm']),e=wpos(B[side+'ForeArm']),w=wpos(B[side+'Hand']);return THREE.MathUtils.radToDeg(V().subVectors(a,e).angleTo(V().subVectors(w,e)));}
function kneeAng(c,side){const B=c.bones;const a=wpos(B[side+'UpLeg']),k=wpos(B[side+'Leg']),f=wpos(B[side+'Foot']);return THREE.MathUtils.radToDeg(V().subVectors(a,k).angleTo(V().subVectors(f,k)));}
function venOf(c){return V(0,0,1).applyQuaternion(c.root.getWorldQuaternion(new THREE.Quaternion()));}
function upOf(c){return V(0,1,0).applyQuaternion(c.root.getWorldQuaternion(new THREE.Quaternion()));}
function flareDeg(c,side){const B=c.bones,ven=venOf(c);
  const caud=V().subVectors(wpos(B.Hips),wpos(B.Spine2)).normalize();const h=V().subVectors(wpos(B[side+'ForeArm']),wpos(B[side+'Arm']));
  h.addScaledVector(ven,-h.dot(ven));caud.addScaledVector(ven,-caud.dot(ven)).normalize();return THREE.MathUtils.radToDeg(Math.acos(clamp(h.normalize().dot(caud),-1,1)));}
function torsoLean(c){const u=V().subVectors(wpos(c.bones.Neck),wpos(c.bones.Hips)).normalize();return Math.acos(clamp(u.y,-1,1))/DEG;}
function avg2(f){return (f('Left')+f('Right'))/2;}
const MEAS={};
function measTick(c,b,x){const key=x.key||x.F.meas;c._m=c._m||{cur:{},last:{}};const m=c._m;
  if(b.phase===0&&m.ph===3){m.last=m.cur;m.cur={};}m.ph=b.phase;if(!key)return;const D2=MEAS[key];if(!D2)return;const v=D2.get(c,x);
  if(D2.at==='bottom'){if(b.phase===1||(b.phase===0&&b.k>.92))m.cur[key]=v;}
  else if(D2.at==='top'){if(b.phase===3)m.cur[key]=v;}
  else if(D2.pick==='max')m.cur[key]=Math.max(m.cur[key]??-1e9,v);
  else if(D2.pick==='min')m.cur[key]=Math.min(m.cur[key]??1e9,v);
  else if(D2.pick==='range'){m.cur[key+'_lo']=Math.min(m.cur[key+'_lo']??1e9,v);m.cur[key+'_hi']=Math.max(m.cur[key+'_hi']??-1e9,v);m.cur[key]=m.cur[key+'_hi']-m.cur[key+'_lo'];}
  else if(D2.pick==='abs')m.cur[key]=Math.abs(v)>Math.abs(m.cur[key]??0)?v:(m.cur[key]??v);
  else m.cur[key]=v;}
function measText(c,key){if(!key||!MEAS[key])return '';const m=c._m||{cur:{},last:{}};const v=m.last[key]??m.cur[key];return v===undefined?'watch the rep':MEAS[key].fmt(v);}
function measVal(c,key){const m=c._m||{cur:{},last:{}};return m.last[key]??m.cur[key];}
function trackBar(c,obj,dt,phase){const y=obj.position.y;if(c._py!==undefined&&dt>0&&phase===0){const v=(c._py-y)/dt;c._vmax=Math.max(c._vmax||0,v);}
  if(phase===3)c._vmax=0;c._py=y;}

// ---- registering exercises
// e: name, group, part (the area it targets), station, kind, pose(c,F,b,u,P), forms, mus, labels, steps, cam, coach{p:[x,z],h}
//    enter(st,e) / leave(st,e): sequences that bring the lifter from the walk-up spot into the start pose and back
function defEx(k,e){e.key=k;EXS[k]=e;for(const f in e.forms){const F=e.forms[f];F.key=f;}return e;}
// measurements are read in the canonical frame, before the pose is carried into the room
function drive(c,F,t,dt=0,key){const b=barAt(t,F);const P=ST.P;const u=EX.pose(c,F,b,b.u,P);if(P.bar)trackBar(c,P.bar,dt,b.phase);measTick(c,b,{F,P,key});frame(c,ST);return {b,u,P};}
function poseAtT(c,t,F=FORMS.good){return drive(c,F,t);}
