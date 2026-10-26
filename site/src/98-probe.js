// ---- test only: frame-by-frame animation probe (body inside equipment, props or bones jumping)
const PROBE={meshes:null,props:null,last:null,issues:[],t:0};
const PROBE_BONES=['Hips','Spine1','Spine2','Neck','Head','LeftArm','LeftForeArm','LeftHand','RightArm','RightForeArm','RightHand','LeftUpLeg','LeftLeg','LeftFoot','RightUpLeg','RightLeg','RightFoot','LeftToeBase','RightToeBase'];
const PROBE_SEGS=[['LeftArm','LeftForeArm'],['LeftForeArm','LeftHand'],['RightArm','RightForeArm'],['RightForeArm','RightHand'],['LeftUpLeg','LeftLeg'],['LeftLeg','LeftFoot'],['RightUpLeg','RightLeg'],['RightLeg','RightFoot'],['Hips','Spine2'],['Spine2','Neck']];
function probeProps(){const s=new Set();for(const pr of DBR.pairs)pr.dbs.forEach(d=>d&&s.add(d));if(BRACK){s.add(BRACK.ez);s.add(BRACK.straight);}
  for(const k in STATIONS){const P=STATIONS[k].P||{};if(P.bar)s.add(P.bar);if(P.wheel)s.add(P.wheel);}if(hero.bar)s.add(hero.bar);return [...s];}
function probeInit(){PROBE.props=probeProps();DBR.pairs.forEach((pr,i)=>pr.dbs.forEach((d,j)=>{if(d)d.userData.name='dumbbell '+i+(j?'R':'L');}));if(BRACK){BRACK.ez.userData.name='EZ bar (rack)';BRACK.straight.userData.name='barbell (curl rack)';}for(const k in STATIONS){const P=STATIONS[k].P||{};if(P.bar&&!P.bar.userData.name)P.bar.userData.name='bar @'+k;if(P.wheel)P.wheel.userData.name='ab wheel';}const pset=new Set();for(const p of PROBE.props)p.traverse(o=>pset.add(o));
  const people=new Set();for(const c of [hero,twin,coach,...extras])c&&c.root.traverse(o=>people.add(o));
  const owner=new Map();for(const k in STATIONS)owner.set(STATIONS[k].g,k);
  PROBE.meshes=[];scene.updateMatrixWorld(true);
  scene.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||pset.has(o)||people.has(o)||WALLS.includes(o)||FACADE.includes(o))return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
    const gb=o.geometry.boundingBox,sz=gb.getSize(V());if(sz.x>12||sz.z>12)return;let q=o,st=null;while(q){if(owner.has(q)){st=owner.get(q);break;}q=q.parent;}
    PROBE.meshes.push({o,st,inv:new THREE.Matrix4(),wb:new THREE.Box3()});});
  for(const m of PROBE.meshes){m.inv.copy(m.o.matrixWorld).invert();m.wb.copy(m.o.geometry.boundingBox).applyMatrix4(m.o.matrixWorld);}
  PROBE.last=null;PROBE.issues=[];PROBE.t=0;return PROBE.meshes.length;}
function probeName(m){const s=m.o.geometry.boundingBox.getSize(V());return (m.st||'gym')+':'+[s.x,s.y,s.z].map(v=>v.toFixed(2)).join('x');}
function probePoints(){const B=hero.bones,pts=[];for(const n of PROBE_BONES)pts.push([n,wpos(B[n])]);for(const [a,b] of PROBE_SEGS)pts.push([a+'~'+b,wpos(B[a]).lerp(wpos(B[b]),.5)]);return pts;}
function probeFrame(){PROBE.t+=1/30;const tag=flow+(hero.act_&&hero.act_.kind==='seq'?':seq'+(hero.act_.i??''):'')+(EXK?' '+EXK:'');
  // moving parts: refresh the current station's boxes every frame
  if(ST)ST.g.updateMatrixWorld(true); // moving parts: the lever/sled groups must be fresh, not from the last rendered frame
  for(const m of PROBE.meshes)if(m.st&&ST&&STATIONS[m.st]===ST){m.o.updateMatrixWorld(true);m.inv.copy(m.o.matrixWorld).invert();m.wb.copy(m.o.geometry.boundingBox).applyMatrix4(m.o.matrixWorld);}
  const pts=probePoints(),out=[];const lp=V();
  for(const [n,p] of pts){if(p.y<.015)out.push(['floor',n,p.y.toFixed(3)]);
    for(const m of PROBE.meshes){if(!m.wb.containsPoint(p))continue;lp.copy(p).applyMatrix4(m.inv);const bb=m.o.geometry.boundingBox;
      const d=Math.min(lp.x-bb.min.x,bb.max.x-lp.x,lp.y-bb.min.y,bb.max.y-lp.y,lp.z-bb.min.z,bb.max.z-lp.z);if(d>.01)out.push(['inside',n,probeName(m),d.toFixed(3)]);}}
  const now={b:pts.slice(0,PROBE_BONES.length).map(x=>x[1].clone()),p:PROBE.props.map(o=>o.getWorldPosition(V()))};
  const walking=hero.act_&&(hero.act_.kind==='walk'||hero.act_.kind==='turn'||(hero.act_.kind==='seq'&&hero.act_.steps&&hero.act_.steps[hero.act_.i]&&hero.act_.steps[hero.act_.i].walk));
  if(PROBE.last){now.b.forEach((p,i)=>{const n=PROBE_BONES[i];const lim=walking?(/Foot|Toe|Leg|Hand/.test(n)?.2:.12):.09;const d=p.distanceTo(PROBE.last.b[i]);if(d>lim)out.push(['boneJump',n,d.toFixed(3)]);});
    now.p.forEach((p,i)=>{const d=p.distanceTo(PROBE.last.p[i]);if(d>.07)out.push(['propJump',PROBE.props[i].userData.name||('prop'+i),d.toFixed(3)]);});}
  PROBE.last=now;for(const x of out)PROBE.issues.push([PROBE.t.toFixed(2),tag,...x]);}
window.__probe={init:probeInit,run:(sec)=>{const n=Math.round(sec*30);for(let i=0;i<n;i++){update(1/30);probeFrame();}window.__dirty=true;const r=PROBE.issues;PROBE.issues=[];return r;},reset:()=>{PROBE.last=null;}};
