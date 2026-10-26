import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const clamp=THREE.MathUtils.clamp, lerp=THREE.MathUtils.lerp;
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const smooth=t=>t*t*(3-2*t);
const TEST=/[?&]test/.test(location.search);

// ---------------------------------------------------------------- renderer
const canvas=document.getElementById('gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=.82;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x070a12);
scene.fog=new THREE.Fog(0x070a12,18,60);
const pmrem=new THREE.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
scene.environmentIntensity=0.25;
const camera=new THREE.PerspectiveCamera(45,1,0.05,200);camera.position.set(3.2,1.9,17);camera.lookAt(0,2.4,0);
const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),0.32,0.45,0.92);
composer.addPass(bloom); composer.addPass(new OutputPass());
function resize(){window.__offDirty=true;const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();

// ---------------------------------------------------------------- textures
function ctex(w,h,draw,rx=1,ry=1,srgb=true){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=8;if(srgb)t.colorSpace=THREE.SRGBColorSpace;return t;}
function noise(g,w,h,a,base){g.fillStyle=base;g.fillRect(0,0,w,h);const id=g.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*a;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}g.putImageData(id,0,0);}
const rubberT=ctex(512,512,(g,w,h)=>{noise(g,w,h,22,'#1c1e21');g.strokeStyle='rgba(0,0,0,.65)';g.lineWidth=3;for(let i=0;i<=2;i++){g.beginPath();g.moveTo(i*w/2,0);g.lineTo(i*w/2,h);g.stroke();g.beginPath();g.moveTo(0,i*h/2);g.lineTo(w,i*h/2);g.stroke();}
  for(let i=0;i<500;i++){g.fillStyle=`rgba(${Math.random()<.5?'255,255,255':'0,0,0'},.05)`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}},12,12);
const turfT=ctex(256,256,(g,w,h)=>{noise(g,w,h,40,'#2e8f3c');for(let i=0;i<2500;i++){g.strokeStyle=`rgba(${20+Math.random()*40|0},${110+Math.random()*60|0},${40+Math.random()*30|0},.6)`;const x=Math.random()*w,y=Math.random()*h;g.beginPath();g.moveTo(x,y);g.lineTo(x+(Math.random()-.5)*3,y-4-Math.random()*4);g.stroke();}},2,10);
const wallT=ctex(512,512,(g,w,h)=>{noise(g,w,h,10,'#bdb9b2');},6,2);
const brickT=ctex(512,512,(g,w,h)=>{g.fillStyle='#2a201d';g.fillRect(0,0,w,h);for(let r=0;r<16;r++)for(let c=0;c<8;c++){const o=r%2?32:0;const v=40+Math.random()*25|0;g.fillStyle=`rgb(${v+30},${v},${v-6})`;g.fillRect(c*64+o+2,r*32+2,60,28);}},6,3);
const asphaltT=ctex(512,512,(g,w,h)=>{noise(g,w,h,30,'#202226');},10,10);
const paveT=ctex(256,256,(g,w,h)=>{noise(g,w,h,16,'#4a4c50');g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=3;g.strokeRect(0,0,w,h);},14,2);
function signTex(text,fg,bg,font,w=1024,h=256){return ctex(w,h,(g)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.fillStyle=fg;g.font=font;g.textAlign='center';g.textBaseline='middle';g.fillText(text,w/2,h/2+6);},1,1);}
const muralT=ctex(2048,512,(g,w,h)=>{g.fillStyle='#16181b';g.fillRect(0,0,w,h);
  g.fillStyle='#d6261e';g.beginPath();g.moveTo(0,h);g.lineTo(w*.18,0);g.lineTo(w*.26,0);g.lineTo(w*.08,h);g.fill();
  g.fillStyle='#f2f2f2';g.font='900 230px Archivo Narrow, Arial Narrow, Impact, sans-serif';g.textBaseline='middle';g.fillText('CARDIO',w*.3,h*.52);
  g.fillStyle='#d6261e';g.font='800 64px Archivo, Arial, sans-serif';g.fillText('TRAIN · EAT · SLEEP · REPEAT',w*.3,h*.86);},1,1);

// ---------------------------------------------------------------- materials
const M={
  rubber:new THREE.MeshStandardMaterial({map:rubberT,roughness:.92,metalness:0}),
  turf:new THREE.MeshStandardMaterial({map:turfT,roughness:1}),
  wall:new THREE.MeshStandardMaterial({map:wallT,roughness:.95}),
  red:new THREE.MeshStandardMaterial({color:0xc4211b,roughness:.5,metalness:.1}),
  black:new THREE.MeshStandardMaterial({color:0x151617,roughness:.55,metalness:.3}),
  steel:new THREE.MeshStandardMaterial({color:0x9aa3aa,roughness:.32,metalness:.85}),
  chrome:new THREE.MeshStandardMaterial({color:0xd8dde0,roughness:.15,metalness:1}),
  pad:new THREE.MeshStandardMaterial({color:0x111214,roughness:.55,metalness:0}),
  padRed:new THREE.MeshStandardMaterial({color:0xb81d17,roughness:.5}),
  rubberPlate:new THREE.MeshStandardMaterial({color:0x1a1a1b,roughness:.8}),
  ceiling:new THREE.MeshStandardMaterial({color:0x2a2d31,roughness:.9}),
  duct:new THREE.MeshStandardMaterial({color:0xb7bec4,roughness:.35,metalness:.9}),
  brick:new THREE.MeshStandardMaterial({map:brickT,roughness:.95}),
  asphalt:new THREE.MeshStandardMaterial({map:asphaltT,roughness:.85}),
  pave:new THREE.MeshStandardMaterial({map:paveT,roughness:.9}),
  glass:new THREE.MeshStandardMaterial({color:0x99b7c8,roughness:.05,metalness:.2,transparent:true,opacity:.18}),
  mirror:new THREE.MeshStandardMaterial({color:0x8899a2,roughness:.04,metalness:1}),
  tube:new THREE.MeshStandardMaterial({color:0x111111,emissive:0xf4f8ff,emissiveIntensity:0}),
  window:new THREE.MeshStandardMaterial({color:0x111111,emissive:0xffe8c0,emissiveIntensity:.0}),
  mural:new THREE.MeshStandardMaterial({map:muralT,roughness:.8}),
};
const box=(w,h,d,m,x,y,z,par=scene,cast=true)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;par.add(o);return o;};
const cyl=(r,h,m,x,y,z,axis='y',par=scene,seg=24)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),m);o.position.set(x,y,z);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;o.castShadow=true;o.receiveShadow=true;par.add(o);return o;};


// ---------------------------------------------------------------- world: street and facade
// The facade is the gym's front wall at z=0; the doorway is a real 2.8 m x 3.6 m gap with two sliding glass doors.
const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,40),M.asphalt);ground.rotation.x=-Math.PI/2;ground.position.set(0,-.01,20);ground.receiveShadow=true;scene.add(ground);
const walkway=new THREE.Mesh(new THREE.PlaneGeometry(40,5),M.pave);walkway.rotation.x=-Math.PI/2;walkway.position.set(0,.005,2.5);walkway.receiveShadow=true;scene.add(walkway);
box(40,.12,.25,M.pave,0,.06,5.1);
for(let i=-3;i<=3;i++)box(2.4,.01,.15,new THREE.MeshStandardMaterial({color:0xd9d39a,roughness:.8}),i*6,.01,10,scene,false);
const DOOR={half:1.4,h:3.6}; // doorway gap: x in [-1.4, 1.4], y in [0, 3.6]
const FACADE=[box(10.6,6,.4,M.brick,-6.7,3,0),box(10.6,6,.4,M.brick,6.7,3,0),box(2.8,2.4,.4,M.brick,0,4.8,0)];
for(const x of[-8,-4.5,4.5,8])box(2.6,2.2,.06,M.window,x,2.2,.22,scene,false);
// door frame
for(const s of[-1,1])box(.08,DOOR.h,.42,M.steel,s*(DOOR.half-.04),DOOR.h/2,0,scene);
box(DOOR.half*2,.1,.42,M.steel,0,DOOR.h-.05,0,scene);
const doorL=box(.7,3.45,.05,M.glass,-.35,1.73,.12,scene,false), doorR=box(.7,3.45,.05,M.glass,.35,1.73,.12,scene,false);
for(const d of[doorL,doorR]){const h=box(.03,.5,.05,M.steel,0,-.1,.04,d,false);h.position.x=d===doorL?.3:-.3;}
const signMat=new THREE.MeshStandardMaterial({color:0x111111,emissive:0xff2b1c,emissiveIntensity:2.2,emissiveMap:signTex('MUSCLE HOUSE','#ffffff','#000000','900 170px Archivo Narrow, Arial Narrow, Impact, sans-serif')});
const sign=new THREE.Mesh(new THREE.PlaneGeometry(6,1.5),signMat);sign.position.set(0,5.2,.23);scene.add(sign);
const signLight=new THREE.PointLight(0xff3020,6,10,1.6);signLight.position.set(0,5,1.6);scene.add(signLight);
const openSign=new THREE.Mesh(new THREE.PlaneGeometry(.9,.32),new THREE.MeshStandardMaterial({color:0x111111,emissive:0x35d69a,emissiveIntensity:1.8,emissiveMap:signTex('OPEN 24/7','#ffffff','#000000','800 120px Archivo Narrow, Arial Narrow, sans-serif',512,180)}));
openSign.position.set(2.3,2.6,.21);scene.add(openSign);
for(const x of[-9,9]){cyl(.06,4.6,M.black,x,2.3,4.6);box(.6,.12,.3,M.black,x,4.6,4.4);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.12,16,8),new THREE.MeshStandardMaterial({emissive:0xffc27a,emissiveIntensity:3,color:0}));bulb.position.set(x,4.5,4.4);scene.add(bulb);
  const pl=new THREE.PointLight(0xffb070,14,14,1.5);pl.position.set(x,4.3,4.2);scene.add(pl);}
const moon=new THREE.DirectionalLight(0x8fa6ff,.35);moon.position.set(-10,20,25);scene.add(moon);
scene.add(new THREE.HemisphereLight(0x2a3550,0x0c0c0c,.5));

// ---------------------------------------------------------------- world: interior shell (x -12..12, z -24..0)
const IN=new THREE.Group();scene.add(IN);
const ROOM={x0:-11.85,x1:11.85,z0:-23.85,z1:-.2,y1:5.0};
const floor=new THREE.Mesh(new THREE.PlaneGeometry(24,24),M.rubber);floor.rotation.x=-Math.PI/2;floor.position.set(0,.002,-12);floor.receiveShadow=true;IN.add(floor);
const WALLS=[box(.3,5,24,M.wall,-12,2.5,-12,IN),box(.3,5,24,M.wall,12,2.5,-12,IN),box(24,5,.3,M.wall,0,2.5,-24,IN)];
const mural=new THREE.Mesh(new THREE.PlaneGeometry(12,3),M.mural);mural.position.set(-4,2.6,-23.83);IN.add(mural);
const CEIL=[box(24,.3,24,M.ceiling,0,5.15,-12,IN,false)];
for(const x of[-6,6]){const d=cyl(.35,.35,M.duct,x,4.6,-12,'z',IN);d.scale.set(1,68,1);CEIL.push(d);}
const tubes=[];
for(let r=0;r<7;r++)for(let c=0;c<5;c++){const t=box(1.6,.05,.08,M.tube.clone(),-8+c*4,4.95,-2.5-r*3.2,IN,false);t.userData.row=r;tubes.push(t);CEIL.push(t);}
const inLights=[];
const sun=new THREE.DirectionalLight(0xffffff,0);sun.position.set(4,14,-6);sun.target.position.set(0,0,-12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:1,far:30});sun.shadow.bias=-.0004;sun.shadow.normalBias=.02;scene.add(sun,sun.target);inLights.push([sun,1.1]);
const fill=new THREE.HemisphereLight(0xf2f4ff,0x2a2826,0);scene.add(fill);inLights.push([fill,.55]);
for(const [x,z] of [[0,-6],[0,-12],[0,-18],[-8,-8],[8,-10],[-8,-17],[8,-19]]){const p=new THREE.PointLight(0xf4f6ff,0,11,1.4);p.position.set(x,4.4,z);scene.add(p);inLights.push([p,5]);}
// reception desk with a plant, by the entrance
box(3,1.1,.8,M.padRed,-7.5,.55,-2.6,IN);box(3.1,.05,.9,M.black,-7.5,1.12,-2.6,IN);
{const pot=cyl(.22,.45,M.black,-10.9,.23,-1.2,'y',IN);const leaves=new THREE.Mesh(new THREE.IcosahedronGeometry(.45,1),new THREE.MeshStandardMaterial({color:0x2f6b3a,roughness:.9,flatShading:true}));leaves.position.set(-10.9,.95,-1.2);leaves.castShadow=true;IN.add(leaves);}
// wall art: a few zone signs (clean, sentence case)
function wallSign(text,x,y,z,ry,w=3.2){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshStandardMaterial({map:signTex(text,'#f2f2f2','#16181b','800 130px Archivo Narrow, Arial Narrow, sans-serif'),roughness:.8}));m.position.set(x,y,z);m.rotation.y=ry;IN.add(m);return m;}
wallSign('Free weights',11.83,3.4,-10,-Math.PI/2);wallSign('Squat & pull',-11.83,3.4,-11,Math.PI/2);wallSign('Machines',4,3.6,-23.83,0);

// ---------------------------------------------------------------- kit builders (all in the parent's local frame)
function plate(par,x,r,w,mat){const p=cyl(r,w,mat,x,0,0,'x',par,32);cyl(.03,w+.01,M.chrome,x,0,0,'x',par,16);return p;}
function barbell(withPlates=true,col=M.padRed,len=2.2){const g=new THREE.Group();cyl(.014,len,M.chrome,0,0,0,'x',g,16);for(const s of[-1,1]){cyl(.025,.04,M.chrome,s*.66,0,0,'x',g,16);cyl(.026,.42,M.chrome,s*.9,0,0,'x',g,16);
  if(withPlates){plate(g,s*.74,.225,.07,col);plate(g,s*.82,.225,.06,M.rubberPlate);cyl(.035,.04,M.black,s*.88,0,0,'x',g,16);}}return g;}
function ezBar(){const g=new THREE.Group();const pts=[[-.6,0],[-.2,0],[-.15,.025],[-.1,-.02],[-.05,.0],[.05,0],[.1,-.02],[.15,.025],[.2,0],[.6,0]];
  for(let i=0;i<pts.length-1;i++){const a=V(pts[i][0],pts[i][1],0),b=V(pts[i+1][0],pts[i+1][1],0);const r=rod(.013,M.chrome,g);setRod(r,a,b);}
  for(const s of[-1,1]){cyl(.025,.3,M.chrome,s*.75,0,0,'x',g,14);plate(g,s*.66,.14,.04,M.rubberPlate);}return g;}
function dumbbell(par,size=1){const g=new THREE.Group();cyl(.017,.15,M.chrome,0,0,0,'x',g,12);
  for(const s of[-1,1]){const h=new THREE.Mesh(new THREE.CylinderGeometry(.062*size,.062*size,.075*size,6),M.rubberPlate);h.rotation.z=Math.PI/2;h.position.x=s*(.075+.0375*size);h.castShadow=true;g.add(h);}if(par)par.add(g);return g;}
function rod(r,mat,par){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,1,10),mat);m.castShadow=true;par.add(m);return m;}
function setRod(m,a,b){const d=V().subVectors(b,a);m.position.copy(a).addScaledVector(d,.5);m.scale.set(1,Math.max(1e-3,d.length()),1);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());}
const M_cable=new THREE.MeshStandardMaterial({color:0x222222,roughness:.6});
const M_mat=new THREE.MeshStandardMaterial({color:0x1d3a5f,roughness:.9});
function stack(par,x,y,z,n=10){const g=new THREE.Group();g.position.set(x,y,z);par.add(g);for(let i=0;i<n;i++)box(.24,.045,.1,i<3?M.red:M.black,0,i*.05,0,g);
  const top=new THREE.Group();g.add(top);for(let i=0;i<3;i++)box(.24,.045,.1,M.red,0,n*.05+i*.05,0,top);return top;}
function treadmill(x,z,ry=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;IN.add(g);
  box(.8,.2,1.9,M.black,0,.1,0,g);box(.6,.02,1.6,M.rubberPlate,0,.21,.05,g);for(const s of[-1,1])box(.05,1.15,.05,M.steel,s*.36,.6,-.82,g);
  const con=box(.85,.35,.2,M.black,0,1.3,-.85,g);con.rotation.x=-.5;const scr=box(.4,.2,.01,new THREE.MeshStandardMaterial({color:0,emissive:0x3ad0ff,emissiveIntensity:.8}),0,1.32,-.74,g,false);scr.rotation.x=-.5;return g;}
function plateTree(par,x,z){const g=new THREE.Group();g.position.set(x,0,z);par.add(g);box(.5,.05,.5,M.black,0,.025,0,g);box(.07,1.1,.07,M.black,0,.55,0,g);
  const cols=[0x2aa84a,0xf0c11a,0x1f6fd1,0xc4211b];cols.forEach((c,i)=>{const p=cyl(.2+i*.012,.06,new THREE.MeshStandardMaterial({color:c,roughness:.6}),0,.3+i*.2,0,'z',g,32);p.position.z=.07;});return g;}

// ---------------------------------------------------------------- characters, posing helpers, muscle painting
const loader=new GLTFLoader();
const mixers=[];
let hero=null,coach=null,twin=null;
// ---- character look (applied to every character material when it is cloned): skin that is not plastic, fabric that reads
// as fabric, crisp hair cards, glossy eyes. Plain MeshPhysical parameters only (the muscle overlay patches the shader).
function charMat(m){const n=m.name||'';if(!m.isMeshStandardMaterial)return;
  if(/skin/i.test(n)){ // skin: soft broad highlight (low F0 like real skin), a warm sheen on the rim standing in for subsurface light
    m.roughness=.52;if('specularIntensity' in m){m.specularIntensity=.45;m.specularColor&&m.specularColor.setRGB(1,.92,.86);}
    if('sheen' in m){m.sheen=.35;m.sheenRoughness=.55;m.sheenColor.setRGB(.62,.26,.17);}
    m.color.multiply(new THREE.Color(1.03,.985,.95));}
  else if(/^Hair/.test(n)){ // alpha-tested cards: sorted with the body, no see-through halo, slight sheen along the strands
    m.transparent=false;m.alphaTest=.42;m.depthWrite=true;m.roughness=.48;if('sheen' in m){m.sheen=.4;m.sheenRoughness=.4;m.sheenColor.setRGB(.35,.28,.22);}}
  else if(/^Eyes/.test(n)){m.roughness=.12;if('specularIntensity' in m)m.specularIntensity=1;}
  else if(/^Eye(brows|lashes)/.test(n)){m.depthWrite=false;}
  else if(/shoe/i.test(n)){m.roughness=.62;}
  else if(/^Cloth/.test(n)){ // knit and synthetic gym fabric: matte with a soft grazing-angle sheen
    m.roughness=Math.max(m.roughness,.9);if('specularIntensity' in m)m.specularIntensity=.3;
    if('sheen' in m){m.sheen=.6;m.sheenRoughness=.7;m.sheenColor.copy(m.color).lerp(new THREE.Color(1,1,1),.35).multiplyScalar(.6);}}
  m.needsUpdate=true;}
// soft contact shadows: a dark blob under each foot that fades as the foot lifts (the sun shadow alone leaves the shoes floating
// under the point lights)
const BLOB_TEX=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,2,32,32,31);
  g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.5,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
function addFootBlobs(c){c.blobs=[];for(const s of['Left','Right']){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:BLOB_TEX,transparent:true,depthWrite:false,opacity:.5,toneMapped:false}));
  m.rotation.x=-Math.PI/2;m.renderOrder=1;m.userData.side=s;c.root.add(m);c.blobs.push(m);}}
const _bf=new THREE.Vector3(),_bt=new THREE.Vector3(),_bc=new THREE.Vector3(),_be=new THREE.Euler(),_bq=new THREE.Quaternion();
function footBlobs(c){if(!c.blobs||!c.root.visible)return;c.root.updateMatrixWorld(true);
  for(const m of c.blobs){const s=m.userData.side;
    c.bones[s+'Foot'].getWorldPosition(_bf);c.bones[s+'ToeBase'].getWorldPosition(_bt);const h=Math.max(0,Math.min(_bf.y-c.ankY0*.9,_bt.y-c.toeY0*.9));
    _bc.set((_bf.x+_bt.x*1.4)/2.4,.004,(_bf.z+_bt.z*1.4)/2.4);c.root.worldToLocal(_bc);m.position.copy(_bc);
    _be.set(-Math.PI/2,Math.atan2(_bt.x-_bf.x,_bt.z-_bf.z)-Math.PI,0,'YXZ');m.quaternion.setFromEuler(_be).premultiply(c.root.getWorldQuaternion(_bq).invert()); // flat on the floor, long axis along the foot
    m.scale.set(.15,.3,1);m.material.opacity=.42*Math.max(0,1-h/.12);m.visible=m.material.opacity>.01;}}
// tops sit a few millimetres off the skin: with linear-blend skinning the shoulders otherwise poke through tight shirts when the
// arms swing (bind-pose geometry is shared by every clone, so it is done once per geometry)
function inflateCloth(o){const n=(o.material&&o.material.name)||'';const g=o.geometry;if(!/^Cloth.*(shirt|tank|top)/i.test(n)||g.userData.inflated)return;
  const d=/crude_t-shirt/.test(n)?.009:.005;const P=g.attributes.position,N=g.attributes.normal;if(!N)return;
  for(let i=0;i<P.count;i++)P.setXYZ(i,P.getX(i)+N.getX(i)*d,P.getY(i)+N.getY(i)*d,P.getZ(i)+N.getZ(i)*d);P.needsUpdate=true;g.computeBoundingSphere();g.userData.inflated=true;}
function makeChar(g,U){
  const m=SkeletonUtils.clone(g.scene);
  const bones={};const mats=[];const meshes=[];
  m.traverse(o=>{if(o.isBone)bones[o.name.replace('mixamorig','')]=o;
    if(o.isSkinnedMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;meshes.push(o);inflateCloth(o);
      const ms=Array.isArray(o.material)?o.material:[o.material];const cl=ms.map(x=>{const y=x.clone();charMat(y);y.userData.op=y.opacity;y.userData.tr=y.transparent;return y;});o.material=Array.isArray(o.material)?cl:cl[0];mats.push(...cl);}});
  const mixer=new THREE.AnimationMixer(m);mixers.push(mixer);
  const act={};g.animations.forEach(a=>{act[a.name]=mixer.clipAction(a);});
  const rest={};for(const k in bones)rest[k]=bones[k].quaternion.clone();
  const hipRest=bones.Hips.position.clone();
  const c={root:m,bones,rest,hipRest,mixer,act,mats,meshes,cur:null,heading:0,pos:V(),speed:0,hold:[],U};
  m.updateMatrixWorld(true);c.ankY0=wpos(bones.LeftFoot).y;c.toeY0=wpos(bones.LeftToeBase).y;addFootBlobs(c);
  scene.add(m);return c;}
// one clip plays at a time, at full weight; the pose it takes over from fades out over a snapshot (applyFade), so the
// mixer never dips toward the bind pose while two clips cross-fade with weights that do not add up to one
function play(c,name,fade=.35,ts=1){const a=c.act[name];if(c.cur===a){a.setEffectiveTimeScale(ts);return;}
  // the fade starts from the pose on screen: the last clipPost output while a clip was playing (the bones may already hold the
  // raw clip pose for this frame), else the bones as they are
  if(c.root.visible&&typeof fadeFromPose==='function'){c.root.updateMatrixWorld(true);fadeFromPose(c,Math.max(.3,fade),c.cur?(c._disp||(c.fade&&c.fade.t===0?c.fade.s:snapshot(c))):snapshot(c));}
  const running=a.isRunning();a.stopFading();if(!running)a.reset();a.setEffectiveTimeScale(ts).setEffectiveWeight(1).play();
  // stopping an action restores the bind pose on the bones only it animates; keep what is on the bones
  const keep={};for(const k in c.bones)keep[k]=c.bones[k].quaternion.clone();const hp=c.bones.Hips.position.clone();
  for(const k in c.act){const o=c.act[k];if(o!==a&&o.isRunning())o.stop();}
  for(const k in c.bones)c.bones[k].quaternion.copy(keep[k]);c.bones.Hips.position.copy(hp);c.cur=a;}
// stopping clips makes three.js restore the bind pose (T-pose), so keep the current pose across the stop
function stopClips(c){c._disp=null;c.fade=null;c._lift=0;const keep={};for(const k in c.bones)keep[k]=c.bones[k].quaternion.clone();const hp=c.bones.Hips.position.clone();c.mixer.stopAllAction();c.cur=null;for(const k in c.bones)c.bones[k].quaternion.copy(keep[k]);c.bones.Hips.position.copy(hp);c.root.updateMatrixWorld(true);}
function place(c){c._lift=0;c.root.position.copy(c.pos);c.root.quaternion.setFromAxisAngle(V(0,1,0),c.heading);}
function turnTo(c,heading,dt,k=5){let dh=angDiff(heading,c.heading);c.heading+=dh*Math.min(1,dt*k);place(c);return Math.abs(dh)<.03;}
function angDiff(a,b){return ((a-b+Math.PI*3)%(Math.PI*2))-Math.PI;}

const _q=new THREE.Quaternion(),_q2=new THREE.Quaternion();
function wpos(b,out=V()){return b.getWorldPosition(out);}
function aim(bone,child,target){ // rotate bone so that its child points at target (world)
  const P=wpos(bone,V()),C=wpos(child,V());
  const from=C.sub(P).normalize(),to=V().subVectors(target,P).normalize();
  const dq=new THREE.Quaternion().setFromUnitVectors(from,to);
  const wq=bone.getWorldQuaternion(new THREE.Quaternion());
  const nw=dq.multiply(wq);
  const pq=bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
  bone.quaternion.copy(pq.multiply(nw));bone.updateMatrixWorld(true);}
function ik2(S,H,L1,L2,pole){const d=Math.min(V().subVectors(H,S).length(),L1+L2-1e-4);const dir=V().subVectors(H,S).normalize();
  const a=(L1*L1-L2*L2+d*d)/(2*d);const h=Math.sqrt(Math.max(0,L1*L1-a*a));
  const perp=pole.clone().addScaledVector(dir,-pole.dot(dir)).normalize();
  return S.clone().addScaledVector(dir,a).addScaledVector(perp,h);}
function resetRest(c){for(const k in c.bones)c.bones[k].quaternion.copy(c.rest[k]);c.bones.Hips.position.copy(c.hipRest);}
const CURL={axis:V(0,.46,.89).normalize(),sL:-1,sR:1};
// body dimensions, measured from the lifter in its rest pose
const D={hips:V(0,1.04,.021),sh:V(0,1.438,-.05),shx:.152,arm:.2784,fore:.2833,thigh:.4437,shin:.4443,back:.16,chest:.235,s:1,ankY:.09,footL:.2};
let GRIP=.29;
function measure(c){const r=c.root;r.position.set(0,0,0);r.quaternion.identity();resetRest(c);r.updateMatrixWorld(true);
  const B=c.bones,w=n=>wpos(B[n]);const H=w('Hips'),A=w('LeftArm'),F=w('LeftForeArm'),Hd=w('LeftHand'),U=w('LeftUpLeg'),L=w('LeftLeg'),Ft=w('LeftFoot'),T=w('LeftToeBase');
  D.s=H.y/1.04;D.shrug0=A.y-w('Neck').y;D.hips.set(0,H.y,H.z);D.sh.set(0,A.y,A.z);D.shx=A.x;D.arm=A.distanceTo(F);D.fore=F.distanceTo(Hd);D.thigh=U.distanceTo(L);D.shin=L.distanceTo(Ft);
  D.hipx=U.x;D.upLeg=U.clone();D.ankY=Ft.y;D.footL=Ft.distanceTo(T);D.neck=w('Neck');D.head=w('Head');D.spine2=w('Spine2');D.spine=w('Spine');
  D.back=.16*D.s*1.04;D.chest=.235*D.s*1.12;GRIP=.29*D.shx/.152;}
function reach(){return Math.sqrt(Math.pow((D.arm+D.fore)*.97,2)-Math.pow(GRIP-D.shx,2));}

const PALM=V(0,-.89,.46).normalize(); // hand-local palm normal at rest (fingers +X left / -X right)
function setHandWorld(bone,left,hd,pn){ // rotate the hand so its fingers follow hd and its palm faces pn
  const xl=V(left?1:-1,0,0),zl=V().crossVectors(xl,PALM),zw=V().crossVectors(hd,pn);
  const mw=new THREE.Matrix4().makeBasis(hd,pn,zw),ml=new THREE.Matrix4().makeBasis(xl,PALM,zl);
  const qw=new THREE.Quaternion().setFromRotationMatrix(mw.multiply(ml.transpose()));
  bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(qw));bone.updateMatrixWorld(true);}
const CURLJ=[.8,1.05,.75];
function curlHand(c,side,amt){const B=c.bones;for(const f of['Index','Middle','Ring','Pinky']){for(let i=1;i<=3;i++){const b=B[side+'Hand'+f+i];if(!b)continue;b.quaternion.copy(c.rest[side+'Hand'+f+i]).multiply(_q.setFromAxisAngle(CURL.axis,(side==='Left'?CURL.sL:CURL.sR)*amt*CURLJ[i-1]));}}
  const t=B[side+'HandThumb1'];if(t)t.quaternion.copy(c.rest[side+'HandThumb1']).multiply(_q.setFromAxisAngle(V(0,1,0),(side==='Left'?-1:1)*amt*.5));
  c.root.updateMatrixWorld(true);}
// world-space frame of a hand: fingers (hd), palm normal (pn), thumb side (tz)
function handFrame(c,side){const b=c.bones[side+'Hand'];const q=b.getWorldQuaternion(new THREE.Quaternion());
  const hd=V(side==='Left'?1:-1,0,0).applyQuaternion(q),pn=PALM.clone().applyQuaternion(q),tz=V().crossVectors(V(side==='Left'?1:-1,0,0),PALM).applyQuaternion(q);
  return {p:wpos(b),hd,pn,tz,q};}
// where a handle sits in a closed hand (inverse of armTo's wrist offset)
function gripPoint(c,side,palm=.075,off=.022){const f=handFrame(c,side);return f.p.addScaledVector(f.hd,palm*D.s).addScaledVector(f.pn,off*D.s);}

// snapshots and blending; blends pivot on the hips so a body never swings through a bench
function snapshot(c){c.root.updateMatrixWorld(true);const s={hip:wpos(c.bones.Hips),quat:c.root.quaternion.clone(),hl:c.bones.Hips.position.clone(),b:{},fmin:footMin(c)};for(const k in c.bones)s.b[k]=c.bones[k].quaternion.clone();return s;}
function footMin(c){const B=c.bones;let m=1e9;for(const n of['LeftFoot','RightFoot','LeftToeBase','RightToeBase']){const b=B[n];if(b)m=Math.min(m,wpos(b).y);}return m;}
function applySnap(c,s){blendTo(c,s,s,0);}
// blend pivots on the hips; a foot that is on the floor at either end of the blend never dips below the lower of the two
// endpoints' feet on the way (a half-bent leg is longer than the straight-line hip path allows)
function blendTo(c,a,b,t){const r=c.root;r.quaternion.slerpQuaternions(a.quat,b.quat,t);for(const k in c.bones)c.bones[k].quaternion.slerpQuaternions(a.b[k],b.b[k],t);
  c.bones.Hips.position.lerpVectors(a.hl,b.hl,t);r.position.set(0,0,0);r.updateMatrixWorld(true);const off=wpos(c.bones.Hips);
  r.position.copy(a.hip).lerp(b.hip,t).sub(off);r.updateMatrixWorld(true);
  if(t>0&&t<1&&a.fmin!==undefined&&b.fmin!==undefined){const lim=Math.min(a.fmin,b.fmin);if(lim<.12){const cur=footMin(c);if(cur<lim-1e-4){r.position.y+=lim-cur;r.updateMatrixWorld(true);}}}}

// ---- generic limb placement
const DEG=Math.PI/180;
const qX=a=>new THREE.Quaternion().setFromAxisAngle(V(1,0,0),a);
const qY=a=>new THREE.Quaternion().setFromAxisAngle(V(0,1,0),a);
const qZ=a=>new THREE.Quaternion().setFromAxisAngle(V(0,0,1),a);
function rootFromAxes(Y,Z){Y=Y.clone().normalize();Z=Z.clone().addScaledVector(Y,-Z.dot(Y)).normalize();const X=V().crossVectors(Y,Z);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,Y,Z));}
function setRoot(c,q,hipT){c.root.quaternion.copy(q);c.root.position.copy(hipT).sub(D.hips.clone().applyQuaternion(q));c._hipT=hipT.clone();c.root.updateMatrixWorld(true);}
function elbowD(deg){const a=D.arm,b=D.fore;return Math.sqrt(a*a+b*b-2*a*b*Math.cos(deg*DEG));} // shoulder-to-wrist distance for an elbow angle
function slerpV(a,b,t){const q=new THREE.Quaternion().setFromUnitVectors(a.clone().normalize(),b.clone().normalize());return a.clone().normalize().applyQuaternion(new THREE.Quaternion().slerp(q,t));}
const sideOf=s=>s>0?'Left':'Right';
function shoulders(c){return [wpos(c.bones.LeftArm),wpos(c.bones.RightArm)];}
// hand on a handle: contact = centre of the handle in the palm; hd = wrist→knuckles; pn = palm normal
function armTo(c,side,contact,o){const B=c.bones,s=side==='Left'?1:-1;
  let hd=o.hd.clone().normalize();const S=wpos(B[side+'Arm']);
  const solve=()=>{const pn=o.pn.clone().addScaledVector(hd,-o.pn.dot(hd)).normalize();
    const W=contact.clone().addScaledVector(hd,-(o.palm??.075)*D.s).addScaledVector(pn,-(o.off??.022)*D.s);
    return {pn,W,E:ik2(S,W,D.arm,D.fore,o.pole)};};
  let r=solve();if(o.follow){hd=V().subVectors(contact,r.E).normalize();r=solve();}
  aim(B[side+'Arm'],B[side+'ForeArm'],r.E);aim(B[side+'ForeArm'],B[side+'Hand'],r.W);
  setHandWorld(B[side+'Hand'],s>0,hd,r.pn);curlHand(c,side,o.curl??1);return r;}
// arm by directions: upper arm along ua, forearm along fa (world), hand fingers hd (default: continue the forearm), palm pn
function armDir(c,side,ua,fa,pn,o={}){const B=c.bones,s=side==='Left'?1:-1;const S=wpos(B[side+'Arm']);
  const E=S.clone().addScaledVector(ua.clone().normalize(),D.arm),W=E.clone().addScaledVector(fa.clone().normalize(),D.fore);
  aim(B[side+'Arm'],B[side+'ForeArm'],E);aim(B[side+'ForeArm'],B[side+'Hand'],W);
  const hd=(o.hd||fa).clone().normalize();setHandWorld(B[side+'Hand'],s>0,hd,pn.clone().addScaledVector(hd,-pn.dot(hd)).normalize());curlHand(c,side,o.curl??1);
  return {S,E,W,contact:W.clone().addScaledVector(hd,(o.palm??.075)*D.s).addScaledVector(pn.clone().addScaledVector(hd,-pn.dot(hd)).normalize(),(o.off??.022)*D.s)};}
function legTo(c,side,ank,pole,pitch=0){const B=c.bones;const Hp=wpos(B[side+'UpLeg']);const knee=ik2(Hp,ank,D.thigh,D.shin,pole);
  aim(B[side+'UpLeg'],B[side+'Leg'],knee);aim(B[side+'Leg'],B[side+'Foot'],ank);
  if(pitch){B[side+'Foot'].quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),pitch));B[side+'Foot'].updateMatrixWorld(true);}return knee;}
// point a foot: toes toward 'toe' (world)
function footTo(c,side,toe){aim(c.bones[side+'Foot'],c.bones[side+'ToeBase'],toe);}
// legs by directions (for legs that swing freely)
function legDir(c,side,ta,sa,toeDir){const B=c.bones;const Hp=wpos(B[side+'UpLeg']);const K=Hp.clone().addScaledVector(ta.clone().normalize(),D.thigh),A=K.clone().addScaledVector(sa.clone().normalize(),D.shin);
  aim(B[side+'UpLeg'],B[side+'Leg'],K);aim(B[side+'Leg'],B[side+'Foot'],A);if(toeDir)footTo(c,side,A.clone().addScaledVector(toeDir,.15));return {K,A};}
function clav(c,o){const B=c.bones;for(const s of[1,-1]){const b=B[sideOf(s)+'Shoulder'];
  b.quaternion.multiply(_q.setFromAxisAngle(V(0,0,1),s*(o.shrug??.07)));if(o.protract)b.quaternion.multiply(_q.setFromAxisAngle(V(0,1,0),-s*o.protract));b.updateMatrixWorld(true);}}
// bend the spine forward (+) / back (−) over the three spine joints, and twist / side-bend
function spineBend(c,flex,o={}){const B=c.bones;const w=[.3,.35,.35];['Spine','Spine1','Spine2'].forEach((n,i)=>{B[n].quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),flex*w[i]));
  if(o.twist)B[n].quaternion.multiply(_q.setFromAxisAngle(V(0,1,0),o.twist*w[i]));if(o.side)B[n].quaternion.multiply(_q.setFromAxisAngle(V(0,0,1),o.side*w[i]));});
  if(o.neck!==undefined)B.Neck.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),o.neck));if(o.head!==undefined)B.Head.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),o.head));
  c.root.updateMatrixWorld(true);}
// torso axes in world: L (lifter's left), U (up the spine), F (forward out of the chest)
function torsoAxes(c){const B=c.bones;const L=V().subVectors(wpos(B.LeftArm),wpos(B.RightArm)).normalize();const U=V().subVectors(wpos(B.Neck),wpos(B.Spine)).normalize();
  const F=V().crossVectors(L,U).normalize();U.crossVectors(F,L).normalize();return {L,U,F};}
function pelvisAxes(c){const q=c.bones.Hips.getWorldQuaternion(new THREE.Quaternion());return {L:V(1,0,0).applyQuaternion(q),U:V(0,1,0).applyQuaternion(q),F:V(0,0,1).applyQuaternion(q)};}
// a direction from torso-relative angles: flex = forward raise, abd = sideways raise (degrees), for side s
function tdir(T,s,flex,abd){const f=flex*DEG,a=abd*DEG;return V().addScaledVector(T.U,-Math.cos(f)*Math.cos(a)).addScaledVector(T.F,Math.sin(f)*Math.cos(a)).addScaledVector(T.L,s*Math.sin(a)).normalize();}

// ---------------------------------------------------------------- muscle regions painted on the body
// every vertex gets one region id; the shader lights each region by its level and role
const REG=['none','pecU','pecL','deltF','deltS','deltR','biLong','biShort','forearm','triLong','triLat','lats','trapU','midBack','erect','abs','oblq','glute','gluteMed','quadRF','quadV','hams','adduct','gastroc','soleus','serratus'];
const RID={};REG.forEach((n,i)=>RID[n]=i);
const NREG=28;
function makeMU(){return {uLv:{value:new Float32Array(NREG)},uRole:{value:new Float32Array(NREG)},uC0:{value:new THREE.Color(0xff2a1a)},uC1:{value:new THREE.Color(0xffb020)},uC2:{value:new THREE.Color(0xff2a1a)},uT:{value:0},uOn:{value:1}};}
const MU=makeMU(),MU2=makeMU();MU2.uT=MU.uT;
function patchMuscleMat(m,U){m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>
attribute float mreg;attribute float mw;uniform float uLv[${NREG}];uniform float uRole[${NREG}];uniform vec3 uC0;uniform vec3 uC1;uniform vec3 uC2;uniform float uOn;varying vec3 vMC;varying float vMA;`)
   .replace('#include <begin_vertex>',`#include <begin_vertex>
int ri=int(mreg+.5);float lv=uLv[ri];float ro=uRole[ri];vMC=ro<.5?uC0:(ro<1.5?uC1:uC2);vMA=clamp(lv*mw,0.,1.)*uOn;`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vMC;varying float vMA;uniform float uT;')
   .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
  diffuseColor.rgb=mix(diffuseColor.rgb,vMC*.85,vMA*.62);
  totalEmissiveRadiance+=vMC*vMA*(.42+.1*sin(uT*5.));`);};
  m.customProgramCacheKey=()=>'muscle-v3';m.needsUpdate=true;}
const ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
// classify every vertex in the rest pose; uses skin weights to know which body part a vertex follows
const REGPOS={}; // region id -> {mesh, index} of a vertex near the region's centre (label anchor)
function paintMuscles(c){
  const r=c.root;r.position.set(0,0,0);r.quaternion.identity();resetRest(c);r.updateMatrixWorld(true);
  const B=c.bones,w=n=>wpos(B[n]);const s=D.s;
  const A=w('LeftArm'),E=w('LeftForeArm'),Hd=w('LeftHand'),Hp=w('Hips'),S2=w('Spine2'),S1=w('Spine1'),Nk=w('Neck'),U=w('LeftUpLeg'),K=w('LeftLeg'),Ft=w('LeftFoot');
  const C=S2; // chest reference
  const sums={};
  for(const o of c.meshes){const g=o.geometry,pos=g.attributes.position,si=g.attributes.skinIndex,sw=g.attributes.skinWeight;
    const reg=new Float32Array(pos.count),mw=new Float32Array(pos.count);const v=V();
    const names=o.skeleton.bones.map(b=>b.name.replace('mixamorig',''));
    const lname=(o.name||'')+(o.material&&o.material.name||'');const skip=/Eye|Hair|brow|lash|shoe|Shoe|teeth|tongue/i.test(lname);
    for(let i=0;i<pos.count;i++){
      if(skip){reg[i]=0;continue;}
      v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);
      // dominant bone
      let bi=0,bw=-1;for(let k=0;k<4;k++){const ww=sw.getComponent(i,k);if(ww>bw){bw=ww;bi=si.getComponent(i,k);}}
      let bn=names[bi]||'';bn=bn.replace('Right','Left');
      const ax=Math.abs(v.x),y=v.y,z=v.z;let id=0,wt=1;
      if(/Hand|Head|Neck/.test(bn)&&!(bn==='Neck'&&y<Nk.y+.02*s)){id=0;}
      else if(bn==='LeftArm'||bn==='LeftShoulder'&&ax>A.x-.02*s){ // upper arm (arm out to the side, crease forward)
        const t=(ax-A.x)/(E.x-A.x);const ph=Math.atan2(z-A.z,y-A.y)/DEG; // 0 = top, 90 = front, ±180 = under, -90 = back
        const dc=Math.hypot(ax-A.x,y-A.y,z-A.z);
        if(t<.33||dc<.075*s){ // shoulder cap: deltoid heads by angle round the arm
          id=ph>28&&ph<150?RID.deltF:ph>-28&&ph<=28?RID.deltS:ph<=-28&&ph>-150?RID.deltR:0;
          if(id===0&&t>.2)id=ph>0?RID.biShort:RID.triLong;}
        else if(ph>15&&ph<168)id=ph<92?RID.biLong:RID.biShort;
        else if(ph<-15&&ph>-168)id=ph<-92?RID.triLong:RID.triLat;
        else id=ph>=0?RID.biShort:RID.triLat;
        wt=1-ss(.92,1.04,t)*.6;}
      else if(bn==='LeftForeArm'){const t=(ax-E.x)/(Hd.x-E.x);const ph=Math.atan2(z-E.z,y-E.y)/DEG;
        id=t<.62&&ph>-40&&ph<130?RID.forearm:0;wt=1-ss(.45,.62,t);}
      else if(bn==='LeftUpLeg'||(bn==='Hips'&&y<Hp.y-.06*s&&ax>.04*s)){ // thigh (and buttock)
        const t=(U.y-y)/(U.y-K.y);const cx=U.x+(K.x-U.x)*clamp(t,0,1),cz=U.z+(K.z-U.z)*clamp(t,0,1);
        const ph=Math.atan2(ax-cx,z-cz)/DEG; // 0 = front, 90 = outside, -90 = inside, 180 = back
        if(z<cz-.02*s&&t<.28)id=RID.glute;
        else if(Math.abs(ph)<28&&t<.86)id=RID.quadRF;
        else if(ph>=28&&ph<118||ph<=-28&&ph>-62)id=t<.95?RID.quadV:0;
        else if(ph<=-62&&ph>-122)id=t<.62?RID.adduct:RID.quadV;
        else id=t<.92?RID.hams:0;
        if(id===RID.glute&&y>Hp.y-.0*s&&ax>.1*s)id=RID.gluteMed;}
      else if(bn==='LeftLeg'){const t=(K.y-y)/(K.y-Ft.y);const ph=Math.atan2(ax-K.x,z-K.z)/DEG;
        const back=Math.abs(ph)>95;
        if(Math.abs(ph)>112&&t<.55)id=RID.gastroc;else if(t>=.4&&t<.82&&Math.abs(ph)>100)id=RID.soleus;else id=0;}
      else if(/Spine|Hips|Shoulder|Neck/.test(bn)){ // torso
        const front=z>S1.z+.03*s,back=z<S1.z-.03*s;
        if(y>A.y-.02*s&&ax<A.x-.03*s&&z<A.z+.05*s&&y<Nk.y+.07*s)id=RID.trapU;
        else if(front&&y>C.y-.13*s&&y<A.y+.01*s&&ax<A.x+.0*s&&ax>.008){id=RID.pecL;}
        else if(back&&y>S2.y-.04*s&&y<A.y-.02*s&&ax<.11*s)id=RID.midBack;
        else if(back&&y>Hp.y-.03*s&&y<S2.y-.04*s&&ax<.07*s)id=RID.erect;
        else if((back||ax>.12*s)&&y>Hp.y+.1*s&&y<S2.y+.08*s&&ax>.06*s&&z<.06*s)id=RID.lats;
        else if(front&&y>Hp.y-.08*s&&y<C.y-.1*s&&ax<.075*s)id=RID.abs;
        else if(y>Hp.y-.04*s&&y<C.y-.06*s&&ax>=.075*s&&z>S1.z-.06*s)id=ax>.12*s&&y>C.y-.16*s?RID.serratus:RID.oblq;
        else if(back&&y<=Hp.y-.03*s&&ax<.16*s)id=RID.glute;
        else id=0;
        if(id===RID.pecL){const up=ss(C.y-.1*s,A.y+.02*s,y);if(up>.5)id=RID.pecU;}}
      reg[i]=id;mw[i]=id?wt:0;
      if(id){const S=sums[id]||(sums[id]={x:0,y:0,z:0,n:0,best:null});if(v.x>0){S.x+=v.x;S.y+=v.y;S.z+=v.z;S.n++;}}
    }
    g.setAttribute('mreg',new THREE.BufferAttribute(reg,1));g.setAttribute('mw',new THREE.BufferAttribute(mw,1));}
  // label anchors: the vertex closest to each region's centre (left side of the body)
  for(const id in sums){const S=sums[id];if(!S.n)continue;const cc=V(S.x/S.n,S.y/S.n,S.z/S.n);let best=1e9,bm=-1,bi=0;
    for(const [mi,o] of c.meshes.entries()){const g=o.geometry,pos=g.attributes.position,reg=g.attributes.mreg.array;const v=V();
      for(let i=0;i<pos.count;i++){if(reg[i]!=id)continue;v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);const d=v.distanceToSquared(cc);if(d<best){best=d;bm=mi;bi=i;}}}
    REGPOS[id]={mi:bm,index:bi};}
  c.mats.forEach(m=>patchMuscleMat(m,c.U));}
function regionWorld(c,id,out=V()){const R=REGPOS[id];if(!R)return null;const m=c.meshes[R.mi];if(!m)return null;m.getVertexPosition(R.index,out);return out.applyMatrix4(m.matrixWorld);}

// ---------------------------------------------------------------- stations
// Every piece of equipment is built in a "canonical" frame: the user's spot is around (0, y, -12) and the user faces +z.
// A station is that frame placed in the gym (position + turn about y). Poses are solved in the canonical frame and then
// carried into the room by the station's transform, so one pose function works at any station.
const STATIONS={};
const CAN=V(0,0,-12);
function makeStation(id,x,z,rot,build,o={}){
  const g=new THREE.Group();g.rotation.y=rot;g.position.set(x,0,z).sub(CAN.clone().applyAxisAngle(V(0,1,0),rot));IN.add(g);g.updateMatrixWorld(true);
  const st={id,g,rot,q:qY(rot),pos:V(x,0,z),...o};st.P=build(g,st)||{};STATIONS[id]=st;return st;}
function toW(st,p){return p.clone().applyMatrix4(st.g.matrixWorld);}
function toC(st,p){return st.g.worldToLocal(p.clone());}
const headingW=(st,h)=>h+st.rot; // canonical heading (0 = facing +z) -> world heading
// carry a pose solved in the canonical frame into the station
function frame(c,st){if(!st)return;c.root.position.applyMatrix4(st.g.matrixWorld);c.root.quaternion.premultiply(st.q);c.root.updateMatrixWorld(true);}
// all objects a pose function moves (so the split view can show each take with its own props)
function dynList(P){const out=[];const add=o=>{if(!o)return;if(Array.isArray(o))o.forEach(add);else if(o.isObject3D)out.push(o);};
  for(const k in P)if(k!=='static')add(P[k]);return out;}
function propState(P){return dynList(P).map(o=>[o,o.position.clone(),o.quaternion.clone(),o.scale.clone(),o.visible]);}
function setPropState(S){for(const [o,p,q,s,v] of S){o.position.copy(p);o.quaternion.copy(q);o.scale.copy(s);o.visible=v;}}

// ---- shared canonical constants (chest library numbers kept)
const HIPS_Z=-11.95, BENCH_TOP=.45;
const qLie=new THREE.Quaternion().setFromAxisAngle(V(1,0,0),-Math.PI/2);
const SEAT_Z=-12.2,SEAT_TOP=.47,SEAT_RECLINE=.12;
const CZ=-11.9;

// ---- benches
// adjustable bench: seat at the hips, back pad hinged at the hips (deg > 0 head up, < 0 head down)
function angledBench(g,deg,o={}){const hz=HIPS_Z-.03;const P={};
  box(.3,.09,.46,M.pad,0,BENCH_TOP-.045,hz+.25,g);box(.06,BENCH_TOP-.09,.06,M.steel,0,(BENCH_TOP-.09)/2,hz+.3,g);box(.45,.05,.07,M.steel,0,.025,hz+.42,g);
  box(.07,.05,1.1,M.steel,0,.025,hz-.2,g);box(.45,.05,.07,M.steel,0,.025,hz-.78,g);
  const hinge=new THREE.Group();hinge.position.set(0,BENCH_TOP,hz);g.add(hinge);const L=o.len||1.02;
  const pad=box(.3,.09,L,M.pad,0,-.045,-(L/2+.02),hinge);const strut=box(.05,.05,.5,M.steel,0,-.1,-.45,hinge);
  // the back-pad support: a strut from the rail to the underside of the pad (re-placed when the angle changes)
  const leg=rod(.025,M.steel,g);
  P.hinge=hinge;P.leg=leg;
  P.setAngle=d=>{hinge.rotation.x=d*DEG;hinge.updateMatrixWorld(true);const th=d*DEG;const dir=V(0,Math.sin(th),-Math.cos(th));
    const top=V(0,BENCH_TOP,hz).addScaledVector(dir,L*.55).add(V(0,-.09*Math.cos(th),-.09*Math.sin(th)));
    setRod(leg,V(0,.05,Math.min(hz-.2,top.z+.05)),top);leg.visible=d>-1;};
  P.setAngle(deg);P.angle0=deg;
  if(o.rollers){box(.06,.62,.06,M.steel,0,.31,hz+.70,g);cyl(.06,.36,M.pad,0,.31,hz+.76,'x',g);box(.3,.07,.22,M.pad,0,.585,hz+.44,g);box(.06,.55,.06,M.steel,0,.275,hz+.44,g);}
  return P;}
function lieShoulderAt(deg){const q=qX(deg*DEG).multiply(qLie);return V(0,BENCH_TOP+D.back,HIPS_Z).add(D.sh.clone().sub(D.hips).applyQuaternion(q));}
// bench with uprights and J-hooks for a barbell press
function buildBarBench(g,deg,rollers){const lockS=lieShoulderAt(deg);const rackY=lockS.y+reach()+.09,rackZ=lockS.z-.26;
  const P=angledBench(g,deg,{rollers});
  for(const s of[-1,1]){box(.07,rackY+.18,.07,M.black,s*.6,(rackY+.18)/2,rackZ-.06,g);box(.12,.05,.08,M.red,s*.6,rackY-.04,rackZ,g);box(.09,.05,.05,M.red,s*.6,rackY-.02,rackZ+.04,g);box(.07,.07,.5,M.black,s*.6,.035,rackZ+.1,g);}
  box(1.27,.07,.07,M.black,0,.035,rackZ-.1,g);
  P.bar=barbell(true,M.padRed);g.add(P.bar);P.bar.position.set(0,rackY,rackZ);P.rack=V(0,rackY,rackZ);return P;}
function seatMachine(g){const P={};P.seat=box(.42,.09,.42,M.pad,0,SEAT_TOP-.045,SEAT_Z+.08,g);P.seatBase=P.seat.position.y;
  box(.07,SEAT_TOP-.09,.07,M.steel,0,(SEAT_TOP-.09)/2,SEAT_Z+.08,g);
  const back=box(.44,.78,.09,M.pad,0,SEAT_TOP+.47,SEAT_Z-.24,g);back.rotation.x=-SEAT_RECLINE;
  box(.9,.025,.9,M.black,0,.0125,SEAT_Z-.2,g);box(.07,1.9,.07,M.black,0,.95,SEAT_Z-.42,g);
  P.stackTop=stack(g,0,.12,SEAT_Z-.62);box(.32,1.7,.06,M.black,0,.85,SEAT_Z-.7,g);return P;}
function seatShoulderRef(){return V(0,SEAT_TOP+.1*D.s,SEAT_Z).add(D.sh.clone().sub(D.hips).applyQuaternion(qX(-SEAT_RECLINE)));}

// ---- dumbbell rack: pairs sit in saddles, handles pointing at the person taking them
const DBR={pairs:[]};
function buildDBRack(x,z,len,rot){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;IN.add(g);
  // local frame: rack runs along local z; the person stands at local +x... (front = local -x)
  for(const t of[0,1]){box(.5,.05,len,M.steel,t*.34,.5+t*.34,0,g);box(.5,.02,len,M.black,t*.34,.53+t*.34,0,g);}
  for(const sz of[-len/2,len/2])box(.85,.95,.06,M.black,.17,.47,sz,g);
  const n=Math.floor((len-.2)/.85);
  for(const t of[0,1])for(let i=0;i<n;i++){const size=.7+.05*i+(1-t)*.35;const pz=-len/2+.5+i*.85;const pair=[];
    for(const sd of[-1,1]){const db=dumbbell(g,size);db.position.set(t*.34,.5+t*.34+.03+.062*size,pz+sd*.2);db.rotation.y=Math.PI/2;pair.push(db);}
    DBR.pairs.push({dbs:pair,size,home:pair.map(d=>({p:d.position.clone(),q:d.quaternion.clone(),parent:g})),tier:t,slot:V(t*.34,.5+t*.34+.03+.062*size,pz),g});}
  g.updateMatrixWorld(true);return g;}
// fixed barbell / EZ-bar rack against a wall
function buildBarRack(x,z,rot){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;IN.add(g);
  for(const s of[-1,1]){box(.06,1.3,.5,M.black,s*.8,.65,0,g);}
  for(let i=0;i<3;i++){const y=.45+i*.32;for(const s of[-1,1])box(.13,.04,.05,M.steel,s*.735,y,.12,g);} // hooks under the bar ends, so the hands grip the bar in the open middle
  const ez=ezBar();ez.position.set(0,1.11,.12);g.add(ez);const st=barbell(false,M.padRed,1.6);for(const s of[-1,1]){plate(st,s*.58,.14,.05,M.rubberPlate);}st.position.set(0,.79,.12);g.add(st);
  g.updateMatrixWorld(true);return {g,ez,straight:st,homeEz:ez.position.clone(),homeSt:st.position.clone()};}

// ---------------------------------------------------------------- navigation: a floor grid built from the real geometry
// Every mesh that stands between the ankles and head height blocks its footprint. People plan paths with A* on the grid,
// grown by their body radius, so a path can never pass through equipment, walls or the closed part of the facade.
const NAV={x0:-20,z0:-24,x1:20,z1:12,c:.1};NAV.nx=Math.round((NAV.x1-NAV.x0)/NAV.c);NAV.nz=Math.round((NAV.z1-NAV.z0)/NAV.c);
NAV.solid=new Uint8Array(NAV.nx*NAV.nz); // footprint of things (no clearance)
NAV.block=new Uint8Array(NAV.nx*NAV.nz); // footprint grown by the walker's radius
NAV.boxes=[];NAV.extra=[]; // extra: footprints stations add by hand (a loaded bar resting on the floor)
const NAV_R=.34;
const navIdx=(i,j)=>j*NAV.nx+i;
const navCell=(x,z)=>[Math.floor((x-NAV.x0)/NAV.c),Math.floor((z-NAV.z0)/NAV.c)];
const navPos=(i,j)=>V(NAV.x0+(i+.5)*NAV.c,0,NAV.z0+(j+.5)*NAV.c);
function navSkip(o){return o.userData.walkable||o===floor||o===ground||o===walkway||(o.parent&&o.parent.userData&&o.parent.userData.walkable);}
function buildNav(){
  NAV.solid.fill(0);NAV.block.fill(0);NAV.boxes=[];scene.updateMatrixWorld(true);const bb=new THREE.Box3();
  const add=(x0,x1,z0,z1)=>{NAV.boxes.push([x0,x1,z0,z1]);};
  scene.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||navSkip(o))return;let p=o;while(p){if(p.userData&&(p.userData.walkable||p.userData.prop))return;p=p.parent;}
    bb.setFromObject(o);if(bb.min.y>1.75||bb.max.y<.06)return;if(bb.max.x-bb.min.x>30||bb.max.z-bb.min.z>30)return;add(bb.min.x,bb.max.x,bb.min.z,bb.max.z);});
  for(const b of NAV.extra)add(...b);
  for(const [x0,x1,z0,z1] of NAV.boxes){stamp(NAV.solid,x0,x1,z0,z1,0);stamp(NAV.block,x0,x1,z0,z1,NAV_R);}
  // the street edge and far ends are out of bounds
  stamp(NAV.block,-20,20,9.5,12,0);}
function stamp(arr,x0,x1,z0,z1,r){const [i0,j0]=navCell(x0-r,z0-r),[i1,j1]=navCell(x1+r,z1+r);
  for(let j=Math.max(0,j0);j<=Math.min(NAV.nz-1,j1);j++)for(let i=Math.max(0,i0);i<=Math.min(NAV.nx-1,i1);i++){
    if(r>0){const p=navPos(i,j);const dx=Math.max(x0-p.x,0,p.x-x1),dz=Math.max(z0-p.z,0,p.z-z1);if(dx*dx+dz*dz>r*r)continue;}arr[navIdx(i,j)]=1;}}
function navFree(x,z,dyn){const [i,j]=navCell(x,z);if(i<0||j<0||i>=NAV.nx||j>=NAV.nz)return false;if(NAV.block[navIdx(i,j)])return false;
  if(dyn)for(const d of dyn){if((x-d.x)**2+(z-d.z)**2<d.r*d.r)return false;}return true;}
function navLOS(a,b,dyn){const d=a.distanceTo(b),n=Math.max(2,Math.ceil(d/.05));for(let k=0;k<=n;k++){const t=k/n;if(!navFree(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,dyn))return false;}return true;}
// A* from a to b (world xz); dyn = discs of other people to keep clear of
function findPath(a,b,dyn=[]){
  dyn=dyn.filter(d=>(a.x-d.x)**2+(a.z-d.z)**2>d.r*d.r&&(b.x-d.x)**2+(b.z-d.z)**2>d.r*d.r);
  const [si,sj]=navCell(a.x,a.z),[gi,gj]=navCell(b.x,b.z);const N=NAV.nx*NAV.nz;
  const ok=(i,j)=>i>=0&&j>=0&&i<NAV.nx&&j<NAV.nz&&!NAV.block[navIdx(i,j)]&&(!dyn.length||navFree(NAV.x0+(i+.5)*NAV.c,NAV.z0+(j+.5)*NAV.c,dyn));
  const g=new Float32Array(N).fill(1e9),came=new Int32Array(N).fill(-1),closed=new Uint8Array(N);
  const heap=[];const push=(f,k)=>{heap.push([f,k]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m;}}return top;};
  const h=(i,j)=>{const dx=Math.abs(i-gi),dz=Math.abs(j-gj);return (dx+dz+(1.4142-2)*Math.min(dx,dz));};
  const s=navIdx(si,sj),t=navIdx(gi,gj);g[s]=0;push(h(si,sj),s);let found=false;
  while(heap.length){const [,k]=pop();if(closed[k])continue;closed[k]=1;if(k===t){found=true;break;}const i=k%NAV.nx,j=(k/NAV.nx)|0;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=i+di,nj=j+dj;if(!ok(ni,nj)&&navIdx(ni,nj)!==t)continue;
      if(di&&dj&&(!ok(i+di,j)||!ok(i,j+dj)))continue;const nk=navIdx(ni,nj);const ng=g[k]+(di&&dj?1.4142:1);if(ng<g[nk]){g[nk]=ng;came[nk]=k;push(ng+h(ni,nj),nk);}}}
  if(!found)return null;
  const cells=[];for(let k=t;k!==-1;k=came[k])cells.push(navPos(k%NAV.nx,(k/NAV.nx)|0));cells.reverse();cells[0]=a.clone().setY(0);cells[cells.length-1]=b.clone().setY(0);
  // string pulling: keep only the turning points that are needed to see around corners
  const pts=[cells[0]];let i=0;while(i<cells.length-1){let j=cells.length-1;while(j>i+1&&!navLOS(cells[i],cells[j],dyn))j--;pts.push(cells[j]);i=j;}
  return smoothPath(pts,dyn);}
// round the corners with short curves so walkers turn like people, not robots
function smoothPath(pts,dyn){if(pts.length<3)return pts;const out=[pts[0]];
  for(let k=1;k<pts.length-1;k++){const p=pts[k],a=pts[k-1],b=pts[k+1];let d=Math.min(.55,a.distanceTo(p)*.45,b.distanceTo(p)*.45);
    for(let tries=0;tries<4;tries++){const p0=p.clone().addScaledVector(V().subVectors(a,p).normalize(),d),p1=p.clone().addScaledVector(V().subVectors(b,p).normalize(),d);
      const seg=[];for(let s=0;s<=6;s++){const t=s/6;seg.push(V().addScaledVector(p0,(1-t)*(1-t)).addScaledVector(p,2*(1-t)*t).addScaledVector(p1,t*t));}
      if(seg.every((q,s)=>s===0||navLOS(seg[s-1],q,dyn))&&navLOS(out[out.length-1],p0,dyn)){out.push(...seg);break;}d*=.5;if(tries===3)out.push(p);}}
  out.push(pts[pts.length-1]);return out;}
function pathLen(P){let L=0;for(let i=1;i<P.length;i++)L+=P[i].distanceTo(P[i-1]);return L;}
function pathAt(P,s){for(let i=1;i<P.length;i++){const d=P[i].distanceTo(P[i-1]);if(s<=d||i===P.length-1){const t=d>0?clamp(s/d,0,1):1;return {p:P[i-1].clone().lerp(P[i],t),dir:V().subVectors(P[i],P[i-1]).normalize()};}s-=d;}return {p:P[P.length-1].clone(),dir:V(0,0,1)};}

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
  c.act_={kind:'walk',P,L:pathLen(P),s:0,v:0,face:o.face,done:o.done,speed:o.speed||WALK_SPEED,ph:0,land:o.land};return true;}
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
  if(a.land&&c.cur!==wa){play(c,'walk',.3,Math.max(.2,a.v/WALK_STRIDE));wa.time=c._wph??WALK_PASS[0];} // a landed walk carries on from the phase it stopped at
  if(a.land&&!a.wk&&c.cur===wa&&rm<1.4){const m=walkLand(c,wa.time,rm/WALK_STRIDE).m;if((m>.78&&m<1.02)||(rm<.3&&m<1.3))a.rem0=Math.max(rm,1e-3);} // start where the stride lands without hurrying (never more than 1.3x: a hurried mocap swing flicks the foot 25 cm in a frame; then the walk just ends)
  if(a.land&&a.rem0&&c.cur===wa){walkSync(c,a,1-rm/a.rem0,a.rem0,false);}else play(c,'walk',.3,Math.max(.2,a.v/WALK_STRIDE));
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
    const v=Math.max(.35,6*k*(1-k)/1.5);if(S.land){walkSync(c,a,smooth(k),a.from.distanceTo(a.to)*(S.back?-1:1));if(!a.wk.dfix){a.wk.dfix=1;a.d=Math.max(a.d,Math.abs(a.wk.T-a.wk.t0)*1.5/1.3);}} // (a short landed step is stretched so the clip never runs faster than 1.3x: a quicker step flicks the swinging foot)else play(c,'walk',.25,(S.back?-1:1)*clamp(a.from.distanceTo(a.to)*6*k*(1-k)/a.d/WALK_STRIDE,.3,1.35)); // the clip at the body's speed (feet planted), never hurried past a brisk walkc._ph=(c._ph||0)+dt*(S.back?3:4)*v;
    clipPost(c,dt);if(k>=1){play(c,'idle',.3);nextStep(c);}return;}
  if(S.turn!==undefined){if(a.h0===undefined)a.h0=Math.abs(angDiff(a.h,c.heading));const d=angDiff(a.h,c.heading);c.heading+=Math.sign(d)*Math.min(Math.abs(d),dt*2.2);place(c);
    if(S.land)walkSync(c,a,a.h0>1e-3?1-Math.abs(angDiff(a.h,c.heading))/a.h0:1,a.h0*.3);else play(c,'walk',.25,.34);clipPost(c,dt);if(Math.abs(d)<.03){c.heading=a.h;place(c);play(c,'idle',.3);a.h0=undefined;nextStep(c);}return;}
  const k=clamp(a.t/S.d,0,1);
  if(S.anim){S.anim(c,k);frame(c,a.st);}
  else{S.pose(c,k);frame(c,a.st);const B=snapshot(c);blendTo(c,a.from,B,S.lin?k:ease(k));}
  holdUpdate(c);S.props&&S.props(c,k);
  if(k>=1)nextStep(c);}
// {walk|turn, land:true}: the walk clip is driven by the distance travelled (the planted foot stays put instead of skating) and is
// timed to finish where the swinging foot passes the planted one, slowing to a stop with the body: the step that follows sets
// that foot down instead of the clip freezing mid-stride. A walk that starts from a still pose starts from that phase too.
// (the walk clip is a mocap gait cycle, see humans/README.md; these numbers are measured on it by the retarget script: every
// character's clip is time-scaled to the same WALK_STRIDE, so the clip played at timeScale v/WALK_STRIDE keeps the feet planted)
const WALK_STRIDE=0.916; // metres of travel per second of the walk clip (how fast its planted foot moves back)
const WALK_PASS=[0.438,1.094]; // clip times where the swinging foot passes the planted one
const WALK_SPEED=1.05; // cruising speed along a path (m/s): the clip then plays at WALK_SPEED/WALK_STRIDE
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

// ---------------------------------------------------------------- whole-body poses (canonical frame, user faces +z)
// lying on a flat / incline (+) / decline (−) bench; hips stay on the seat
function lieBody(c,o){let q=qX(o.angle||0).multiply(qLie);
  const hipT=V(0,BENCH_TOP+D.back,HIPS_Z+(o.dz||0));let pos=hipT.clone().sub(D.hips.clone().applyQuaternion(q));
  if(o.hipLift){const Sw=pos.clone().add(D.sh.clone().applyQuaternion(q));q=qX(-o.hipLift).multiply(q);pos=Sw.sub(D.sh.clone().applyQuaternion(q));}
  c.root.quaternion.copy(q);c.root.position.copy(pos);c._hipT=hipT;resetRest(c);const B=c.bones;
  B.Spine1.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),-.16*.6));
  B.Spine2.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),-.16*.4+(o.breathe||0)*.02));
  B.Neck.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),.12+(o.neck||0)));
  B.Head.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),.05+(o.look||0)*.12));
  clav(c,{shrug:o.shrug??.07});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const side=sideOf(s);
    if(o.feet==='rollers')legTo(c,side,V(s*.12,.33,HIPS_Z+.65),V(s*.1,1,.5),.25); // thighs over the knee pad, ankles hooked behind the rollers
    else if(o.feet==='knees')legTo(c,side,V(s*.14,BENCH_TOP+.12,HIPS_Z+.36),V(s*.1,1,.3),.2);
    else legTo(c,side,V(s*.31,.09,HIPS_Z+.47),V(s*.25,1,.55),-.35);}}
function seatBody(c,o){setRoot(c,qX(-SEAT_RECLINE+(o.lean||0)),V(0,SEAT_TOP+.1*D.s-(o.drop||0),SEAT_Z));resetRest(c);
  clav(c,{shrug:o.shrug??.03,protract:o.protract});c.root.updateMatrixWorld(true);
  for(const s of[1,-1])legTo(c,sideOf(s),V(s*.17,.09,SEAT_Z+.46-(o.drop||0)*.5),V(s*.15,.4,1));}
// split stance between cable towers
function standBody(c,o){setRoot(c,qX(o.lean||0),V(0,D.hips.y-.04*D.s,CZ));resetRest(c);
  clav(c,{shrug:o.shrug??.03});c.root.updateMatrixWorld(true);
  legTo(c,'Left',V(.13,D.ankY,CZ+.30),V(.1,.2,1));legTo(c,'Right',V(-.13,D.ankY+.05,CZ-.36),V(-.1,.2,1),.3);}
// general standing pose: feet planted, hips over the feet (pushed back by the hinge), knees bent by 'drop'
// o: x,z (between the feet), h (heading), hinge (deg, torso forward), drop (m the hips go down), back (m hips go back),
//    stance (half the distance between the ankles), toe (deg the feet turn out), feet:[[x,z],[x,z]] (overrides), round (spine flex, deg)
function standPose(c,o={}){const h=o.h||0,x=o.x||0,z=o.z??-12,hg=(o.hinge||0)*DEG;const qh=qY(h);
  const back=(o.back??0);const hip=V(0,D.hips.y-(o.drop||0),-back).applyQuaternion(qh).add(V(x,0,z));
  setRoot(c,qh.clone().multiply(qX(hg)).multiply(qZ((o.tilt||0)*DEG)),hip);resetRest(c);
  if(o.round||o.twist||o.side)spineBend(c,(o.round||0)*DEG,{twist:(o.twist||0)*DEG,side:(o.side||0)*DEG});
  const B=c.bones,lk=(o.look??(o.hinge||0)*.55)*DEG*.5;B.Neck.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),-lk));B.Head.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),-lk));
  clav(c,{shrug:o.shrug??.03,protract:o.protract});c.root.updateMatrixWorld(true);
  const st=o.stance??.11*D.s;const toe=(o.toe??8)*DEG;
  for(const s of[1,-1]){const side=sideOf(s);const f=o.feet?V(o.feet[s>0?0:1][0],0,o.feet[s>0?0:1][1]):V(s*st,0,.02);
    const A=f.clone().applyQuaternion(qh).add(V(x,D.ankY+(o.heel?o.heel[s>0?0:1]:0),z));const fwd=V(s*Math.sin(toe),0,Math.cos(toe)).applyQuaternion(qh);
    const pole=fwd.clone().add(V(0,.25,0)).addScaledVector(V(s,0,0).applyQuaternion(qh),o.kneeIn?-o.kneeIn:0); // each knee toward the midline
    legTo(c,side,A,pole);footTo(c,side,A.clone().addScaledVector(fwd,.15).setY(D.ankY*.35));} // a raised heel keeps its toes on the floor
  if(o.arms!=='none')armsHang(c,o.armOut||0);}
// arms hanging at the sides, palms facing the thighs
function armsHang(c,out=0,side){const T=torsoAxes(c);for(const s of side?[side]:[1,-1]){const sd=sideOf(s);const down=V(0,-1,0);
  const ua=down.clone().addScaledVector(T.L,s*(.1+out)).addScaledVector(T.F,.04);const fa=down.clone().addScaledVector(T.L,s*.04).addScaledVector(T.F,.12);
  armDir(c,sd,ua,fa,T.L.clone().multiplyScalar(-s),{hd:down.clone().addScaledVector(T.F,.1),curl:.35});}}
// sitting on the end of a flat bench, straddling it (feet on the floor either side), hands on the thighs
function benchSit(c,o={}){const z=o.z??HIPS_Z+.22;setRoot(c,qX((o.lean??8)*DEG),V(0,BENCH_TOP+D.back*.62,z));resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const side=sideOf(s);legTo(c,side,V(s*(o.feetX??.31),D.ankY,z+(o.feetZ??.28)),V(s*.3,.6,1));footTo(c,side,V(s*(o.feetX??.31)+s*.04,.03,z+(o.feetZ??.28)+.15));}
  if(o.arms!=='none'){const T=torsoAxes(c);for(const s of[1,-1]){const sd=sideOf(s);const K=wpos(c.bones[sd+'Leg']);const H=wpos(c.bones[sd+'UpLeg']);const tgt=H.lerp(K,.7).add(V(0,.06,0));
    armTo(c,sd,tgt,{hd:V(0,-.3,1),pn:V(0,-1,0),pole:V(s*.4,-.6,-.6),curl:.5});}}}
// seated upright on a bench end with feet together in front (machines, upright bench)
function chairSit(c,o={}){const y=o.y??SEAT_TOP,z=o.z??SEAT_Z;setRoot(c,qX((o.lean??0)*DEG-(o.recline||0)*DEG),V(0,y+.1*D.s,z));resetRest(c);clav(c,{shrug:.03});c.root.updateMatrixWorld(true);
  for(const s of[1,-1])legTo(c,sideOf(s),V(s*(o.fx??.17),D.ankY,z+(o.fz??.46)),V(s*.15,.4,1));}
// how far to hinge and to bend the knees so that both hands reach a handle at (hy, hz) in the canonical frame, standing at z
// with the hips pushed back by `back`: the shallowest hinge (from hmin, deg) whose knee bend stays within maxDrop. dx = how far
// the hand sits outside the shoulder, R = shoulder-to-handle distance that leaves the elbow a little soft.
function bendToReach(hy,hz,o={}){const T=D.sh.clone().sub(D.hips);const R=o.R??.5*D.s,dx=o.dx||0;const R2=R*R-dx*dx;const back=o.back||0,z=o.z??-12;
  let best=null;for(let h=o.hmin??20;h<=(o.hmax??78);h+=2){const hg=h*DEG;const shZ=z-back+T.y*Math.sin(hg)+T.z*Math.cos(hg);const dz=hz-shZ;if(dz*dz>R2)continue;
    const shY=hy+Math.sqrt(R2-dz*dz);const drop=D.hips.y+T.y*Math.cos(hg)-T.z*Math.sin(hg)-shY;best={hinge:h,drop:Math.max(0,drop)};if(drop<=(o.maxDrop??.3))return best;}
  return best||{hinge:o.hmax??78,drop:o.maxDrop??.3};}

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
function calibrateEx(e){if(!e.calib||e._cal)return;const P=STATIONS[e.station].P;const keep=snapshot(hero),props=propState(P); // the poses move the bar: put it back
  for(const k in e.forms){const F=e.forms[k];F.touchY=undefined;
    for(let it=0;it<3;it++){e.pose(hero,F,{phase:1,k:.5},0,P);F.touchY=chestTopAt(hero,hero._touchZw)+(e.fam==='bar'?BAR_R+.002:0);}}
  e._cal=true;applySnap(hero,keep);setPropState(props);}

// ---------------------------------------------------------------- getting on and off the equipment, like a person would
// Each entry type gives: pre (canonical spot the walk ends at, facing), enter(st,e) steps, leave(st,e) steps.
// Steps are solved in the station's canonical frame (see runSeq).
const exP=(u,phase=2,k=0)=>(c)=>{EX.pose(c,FORMS.good,{phase,k},u,ST.P);};
// leaving mid-rep: settle into the right form at the rep position on screen (found by matching the hands and hips, since the
// rep clock is reset when leaving), then play the rep on to u1, so hands and props stay on the exercise's own path
function repUOnScreen(c){const st=ST,P=st.P;const pts=()=>['LeftHand','RightHand','Hips'].map(n=>wpos(c.bones[n]));const cur=pts();
  const keep=snapshot(c),props=propState(P);let best=1,bd=1e9;
  for(let i=0;i<=20;i++){const u=i/20;EX.pose(c,FORMS.good,{phase:2,k:0},u,P);frame(c,st);const d=pts().reduce((m,p,j)=>m+p.distanceTo(cur[j]),0);if(d<bd){bd=d;best=u;}}
  applySnap(c,keep);setPropState(props);return best;}
function exTo(u1,d=1.0){const m={u0:null};
  return [{d:.35,pose:c=>{if(m.u0===null)m.u0=repUOnScreen(c);exP(m.u0,1)(c);}},
    {d,anim:(c,k)=>exFrom(m.u0,u1)(c,k)}];}
function exFrom(u0,u1){return (c,k)=>{EX.pose(c,FORMS.good,{phase:u1>u0?2:0,k},lerp(u0,u1,smooth(k)),ST.P);};}
function rackHandsOf(P,g=GRIP){return [V(g,P.rack.y,P.rack.z),V(-g,P.rack.y,P.rack.z)];}
// sitting on a bench end holding two dumbbells on end on the thighs
function benchSitDB(c,o={}){benchSit(c,{...o,arms:'none'});const B=c.bones;
  for(const s of[1,-1]){const sd=sideOf(s);const K=wpos(B[sd+'Leg']),H=wpos(B[sd+'UpLeg']);const top=H.lerp(K,.78).add(V(-s*.02,.15*D.s,0));
    armTo(c,sd,top,{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.5,-.4,-.7)});}}
// standing, dumbbells at the sides
function standDB(c,o={}){standPose(c,{...o,arms:'none'});dbHangArms(c,Math.sin(c._ph||0)*.08);}
// machine seat, hands resting on the thighs
function seatRest(c){seatBody(c,{});for(const s of[1,-1]){const sd=sideOf(s);const K=wpos(c.bones[sd+'Leg']),H=wpos(c.bones[sd+'UpLeg']);armTo(c,sd,H.lerp(K,.65).add(V(0,.06,0)),{hd:V(0,-.3,1),pn:V(0,-1,0),pole:V(s*.4,-.6,-.6),curl:.5});}}
// after a blended pose step: re-solve the legs to planted ankles (canonical [x,z] per side), so the feet never slide into
// or dip through the floor while the hips move down to a seat or up from it
function pinFeet(st,feet,o={}){let from=null,lastK=1;return (c,k)=>{const h=o.h||0;const fwd=V(Math.sin(h),0,Math.cos(h)).applyQuaternion(st.q);
  if(!from||k<lastK){from=[wpos(c.bones.LeftFoot),wpos(c.bones.RightFoot)];from.toe=['Left','Right'].map(sd=>wpos(c.bones[sd+'ToeBase']).sub(wpos(c.bones[sd+'Foot'])).normalize());}lastK=k;
  for(const s of[1,-1]){const f=feet[s>0?0:1];const T=toW(st,V(f[0],o.y??D.ankY,f[1]));const F0=from[s>0?0:1];const dist=F0.distanceTo(T);
    // a foot that is not yet where it will stand takes a small step there (lifted a little in the middle)
    const A=dist<.02?T:F0.clone().lerp(T,smooth(k)).add(V(0,Math.sin(Math.PI*k)*Math.min(.08,dist*.5),0));
    const pole=fwd.clone().add(V(0,.25,0)).addScaledVector(V(s,0,0).applyQuaternion(st.q),o.out||0);legTo(c,sideOf(s),A,pole);
    // the foot turns from the way it pointed when the step began (a walk can end with the toe still pointing down) to flat
    const td=V().addScaledVector(fwd,.15).setY(-D.ankY*.65);const tl=td.length();footTo(c,sideOf(s),A.clone().add(from.toe[s>0?0:1].clone().lerp(td.normalize(),smooth(Math.min(1,k*1.6))).normalize().multiplyScalar(tl)));}
  c.root.updateMatrixWorld(true);holdUpdate(c);};}
// a blended pose step whose feet travel in a small arc from where they were to where the pose puts them (lifted, never
// dragged through the floor); the foot keeps its blended orientation. o.sides limits it to one foot.
function liftFeet(st,poseFn,o={}){let from=null,to=null,lastK=1;const sides=o.sides||['Left','Right'];
  return {pose:poseFn,props:(c,k)=>{
    if(!from||k<lastK){from={};to={};const bend=(o,sd)=>{const H=wpos(c.bones[sd+'UpLeg']),A=wpos(c.bones[sd+'Foot']);o[sd]=A;o[sd+'K']=wpos(c.bones[sd+'Leg']).sub(H.lerp(A,.5));};for(const sd of sides)bend(from,sd);const keep=snapshot(c);poseFn(c);frame(c,st);for(const sd of sides)bend(to,sd);applySnap(c,keep);}
    lastK=k;const kk=smooth(k);
    for(const sd of sides){const F0=from[sd],T=to[sd];const dist=F0.distanceTo(T);if(dist<.02)continue;
      const A=F0.clone().lerp(T,kk).add(V(0,Math.sin(Math.PI*k)*Math.min(o.lift??.1,dist*.6),0));
      const fb=c.bones[sd+'Foot'];const fq=fb.getWorldQuaternion(new THREE.Quaternion());const pole=from[sd+'K'].clone().lerp(to[sd+'K'],kk);if(pole.length()<.03)pole.copy(pelvisAxes(c).F).add(V(0,.3,0));legTo(c,sd,A,pole.normalize());
      fb.quaternion.copy(fb.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(fq));fb.updateMatrixWorld(true);}
    holdUpdate(c);}};}
// sitting on a bench with a heading: hips at (x,z), feet on the floor at given canonical spots, hands on the thighs
function sitAt(c,o){const h=o.h||0,qh=qY(h);setRoot(c,qh.clone().multiply(qX((o.lean??6)*DEG)),V(o.x||0,o.y??BENCH_TOP+D.back*.62,o.z));resetRest(c);clav(c,{shrug:.03});c.root.updateMatrixWorld(true);
  const fwd=V(Math.sin(h),0,Math.cos(h));
  for(const s of[1,-1]){const sd=sideOf(s);const f=o.feet[s>0?0:1];const A=V(f[0],o.fy??D.ankY,f[1]);const lat=V(s,0,0).applyQuaternion(qh);
    legTo(c,sd,A,fwd.clone().add(V(0,.4,0)).addScaledVector(lat,o.out||0));if(o.fy===undefined)footTo(c,sd,A.clone().addScaledVector(fwd,.15).setY(.03));}
  if(o.arms!=='none'){for(const s of[1,-1]){const sd=sideOf(s);const K=wpos(c.bones[sd+'Leg']),H=wpos(c.bones[sd+'UpLeg']);const T=torsoAxes(c);
    armTo(c,sd,H.lerp(K,.7).add(V(0,.06,0)),{hd:T.F.clone().addScaledVector(T.U,-.3),pn:V(0,-1,0),pole:T.L.clone().multiplyScalar(s*.4).addScaledVector(T.U,-.6).addScaledVector(T.F,-.6),curl:.5});}}}
// lying on the bench with the hands resting on the hips (between sitting up and reaching for the bar)
function lieRest(c,ang,feet,P){P&&P.setAngle&&P.setAngle(ang/DEG);lieBody(c,{angle:ang,feet});const T=torsoAxes(c);
  for(const s of[1,-1]){const sd=sideOf(s);const H=wpos(c.bones[sd+'UpLeg']);
    armTo(c,sd,H.addScaledVector(T.F,.1).addScaledVector(T.L,-s*.02),{hd:T.L.clone().multiplyScalar(-s).addScaledVector(T.U,-.35),pn:T.F.clone().negate(),pole:V(s*.6,-.2,.2),curl:.4});}}
const BENCH_FEET=[[.27,-11.33],[-.27,-11.33]];
const SEAT_FEET=[[.17,SEAT_Z+.46],[-.17,SEAT_Z+.46]];
const DEC_Z=-11.92; // where the hips sit on the decline seat: behind the knee pad, which covers the front of the seat
const DEC_SIDE_FEET=[[.4,DEC_Z-.15],[.4,DEC_Z+.15]];
// sitting on the decline seat facing the foot end with the knees pulled up and the feet lifted over the knee pad
function tuckSit(c){setRoot(c,qX(-8*DEG),V(0,BENCH_TOP+D.back*.62,DEC_Z));resetRest(c);clav(c,{shrug:.03});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);const A=V(s*.11,.78,-11.42);legTo(c,sd,A,V(s*.1,1,.3));footTo(c,sd,A.clone().add(V(0,-.06,.13)));
    const K=wpos(c.bones[sd+'Leg']);armTo(c,sd,K.add(V(s*.04,.04,-.06)),{hd:V(0,-.4,1),pn:V(0,-1,0),pole:V(s*.6,-.3,-.6),curl:.6});}}
// sitting on the decline seat with the thighs over the knee pad and the feet hooked under the rollers
function legsOut(c){setRoot(c,qX(-12*DEG),V(0,BENCH_TOP+D.back*.62,DEC_Z));resetRest(c);clav(c,{shrug:.03});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);legTo(c,sd,V(s*.12,.36,DEC_Z+.64),V(s*.1,1,.3),.25);
    const H=wpos(c.bones[sd+'UpLeg']);armTo(c,sd,H.add(V(s*.02,.1,.2)),{hd:V(0,-.3,1),pn:V(0,-1,0),pole:V(s*.6,-.3,-.6),curl:.5});}}
// a blended pose step whose prop moves with the hands: obj() follows the midpoint of the hands every frame (keeping the offset the
// target pose has), not the step's target; after(c) updates whatever hangs on it (cable, stack)
function carryWith(d,poseFn,objFn,after){const mid=c=>wpos(c.bones.LeftHand).add(wpos(c.bones.RightHand)).multiplyScalar(.5);
  return {d,pose:c=>{poseFn(c);c._pOff=objFn().position.clone().sub(mid(c));},
    props:c=>{const o=objFn();o.position.copy(toC(c.act_.st,mid(c)).add(c._pOff));o.quaternion.identity();after&&after(c);}};}
// the bench bar carried by the hands on the way back to the hooks
function barCarry(P,handsFn,ang,feet,d){return carryWith(d,c=>poseBarHands(c,P,handsFn(),ang,feet),()=>P.bar);}
const ENTRY={
  barBench:{pre:[0,-10.45],face:0,
    enter:(st,e)=>{const P=st.P,ang=(e.forms.good.angle||0)*DEG,feet=e.forms.good.feet,gr=e.forms.good.grip??GRIP;return [
      {walk:[0,-11.1],back:true,d:1.2,soft:1}, // stop short of the bench, then step back to it with the feet apart
      {d:.8,anim:settle(c=>standPose(c,{z:-11.3,stance:.27,toe:14}),{step:1,bend:1})},
      {d:.9,pose:c=>benchSit(c,{lean:4,feetX:.27,feetZ:.4}),props:pinFeet(st,BENCH_FEET,{out:.3})},
      {d:1.1,pose:c=>lieRest(c,ang,feet,P)},
      {d:.9,pose:c=>poseBarHands(c,P,rackHandsOf(P,gr),ang,feet)},
      {call:()=>sayFor(e.coachIn||'Lift-off on three. One, two, three.',2.6)},
      {d:1.2,anim:(c,k)=>{const R=rackHandsOf(P,gr),L=lockHands(ang/DEG,gr);const up=Math.sin(Math.PI*Math.min(1,k*1.6))*.03;poseBarHands(c,P,R.map((h,i)=>h.clone().lerp(L[i],ease(k)).add(V(0,up,0))),ang,feet);}}];},
    leave:(st,e)=>{const P=st.P,ang=(e.forms.good.angle||0)*DEG,feet=e.forms.good.feet,gr=e.forms.good.grip??GRIP;return [
      barCarry(P,()=>lockHands(ang/DEG,gr),ang,feet,.7),
      {d:1.3,anim:(c,k)=>{const R=rackHandsOf(P,gr),L=lockHands(ang/DEG,gr);const kk=ease(k);const h=L.map((p,i)=>p.clone().lerp(R[i],Math.min(1,kk*1.15)).add(V(0,kk<.85?.02*Math.sin(Math.PI*kk/.85):0,0)));poseBarHands(c,P,h,ang,feet);}},
      {d:.9,pose:c=>{lieRest(c,ang,feet,P);P.bar.position.copy(P.rack);}},
      {d:1.1,pose:c=>benchSit(c,{lean:4,feetX:.27,feetZ:.4})},
      {d:.9,pose:c=>standPose(c,{z:-11.3,stance:.27,toe:14}),props:pinFeet(st,BENCH_FEET,{out:.3})},
      {d:.5,pose:c=>standPose(c,{z:-11.3})},
      {walk:[0,-10.45],d:1.0}];}},
  // decline bench: the rollers block the foot end, so get on from the side: sit sideways, swing the legs over the knee pad
  // with the feet tucked, hook the feet under the rollers, lie back, reach for the bar
  barBenchDecline:{pre:[.95,DEC_Z],face:Math.PI/2,
    enter:(st,e)=>{const P=st.P,ang=(e.forms.good.angle||0)*DEG,gr=e.forms.good.grip??GRIP;return [
      {d:.8,anim:settle(c=>standPose(c,{x:.68,z:DEC_Z,h:Math.PI/2}),{step:1,bend:1})},{d:.8,anim:settle(c=>standPose(c,{x:.42,z:DEC_Z,h:Math.PI/2}),{step:1,bend:1})}, // two short steps back to the seat
      {d:1.0,pose:c=>sitAt(c,{h:Math.PI/2,z:DEC_Z,feet:DEC_SIDE_FEET,out:.2}),props:pinFeet(st,DEC_SIDE_FEET,{h:Math.PI/2,out:.2})},
      {d:1.3,pose:c=>tuckSit(c)},
      {d:1.0,pose:c=>legsOut(c)},
      {d:1.1,pose:c=>lieRest(c,ang,'rollers',P)},
      {d:.9,pose:c=>poseBarHands(c,P,rackHandsOf(P,gr),ang,'rollers')},
      {call:()=>sayFor(e.coachIn||'Lift-off on three. One, two, three.',2.6)},
      {d:1.2,anim:(c,k)=>{const R=rackHandsOf(P,gr),L=lockHands(ang/DEG,gr);const up=Math.sin(Math.PI*Math.min(1,k*1.6))*.03;poseBarHands(c,P,R.map((h,i)=>h.clone().lerp(L[i],ease(k)).add(V(0,up,0))),ang,'rollers');}}];},
    leave:(st,e)=>{const P=st.P,ang=(e.forms.good.angle||0)*DEG,gr=e.forms.good.grip??GRIP;return [
      barCarry(P,()=>lockHands(ang/DEG,gr),ang,'rollers',.7),
      {d:1.3,anim:(c,k)=>{const R=rackHandsOf(P,gr),L=lockHands(ang/DEG,gr);const kk=ease(k);const h=L.map((p,i)=>p.clone().lerp(R[i],Math.min(1,kk*1.15)).add(V(0,kk<.85?.02*Math.sin(Math.PI*kk/.85):0,0)));poseBarHands(c,P,h,ang,'rollers');}},
      {d:.9,pose:c=>{lieRest(c,ang,'rollers',P);P.bar.position.copy(P.rack);}},
      {d:1.1,pose:c=>legsOut(c)},
      {d:1.3,pose:c=>tuckSit(c)},
      {d:1.2,pose:c=>sitAt(c,{h:Math.PI/2,z:DEC_Z,feet:DEC_SIDE_FEET,out:.2})},
      {d:.9,pose:c=>standPose(c,{x:.42,z:DEC_Z,h:Math.PI/2}),props:pinFeet(st,DEC_SIDE_FEET,{h:Math.PI/2,out:.2})},
      {walk:[.95,DEC_Z],d:1.0}];}},
  dbLie:{pre:[0,-10.45],face:0,
    enter:(st,e)=>{const top=e.fam==='fly'?1:1;return [
      {walk:[0,-11.1],back:true,d:1.2,soft:1},{call:c=>{c.carry=null;}},
      {d:.8,anim:settle(c=>standDB(c,{z:-11.3,stance:.27,toe:14}),{step:1,bend:1})},
      {d:1.0,pose:c=>benchSitDB(c,{lean:2,feetX:.27,feetZ:.4}),props:pinFeet(st,BENCH_FEET,{out:.3})},
      {call:()=>sayFor('Dumbbells on your knees. Kick them up as you lie back.',3)},
      {d:1.3,pose:c=>poseDB(c,{...FORMS.good,flare:52,deep:0},{phase:1,k:0},0,ST.P)},
      {d:1.0,anim:(c,k)=>poseDB(c,{...FORMS.good,flare:52,deep:0},{phase:2,k},smooth(k),ST.P)},
      ...(e.pose===poseFly?[{d:.6,pose:exP(1,3)}]:[])];},
    leave:(st,e)=>[
      {d:.8,pose:c=>poseDB(c,{...FORMS.good,flare:52,deep:0},{phase:1,k:0},0,ST.P)},
      {d:1.3,pose:c=>benchSitDB(c,{lean:2,feetX:.27,feetZ:.4})},
      {d:1.0,pose:c=>standDB(c,{z:-11.3,stance:.27,toe:14}),props:pinFeet(st,BENCH_FEET,{out:.3})},
      {d:.5,pose:c=>standDB(c,{z:-11.3})},
      {call:c=>{c.carry='db';}},{walk:[0,-10.45],d:1.0}]}, // carried from the first step (the arms keep the standing hang)
  machine:{pre:[0,-10.8],face:0,
    enter:(st,e)=>[{walk:[0,-11.5],back:true,d:1.2,soft:1},{d:.7,anim:settle(c=>standPose(c,{z:-11.72,stance:.17}),{step:1,bend:1})}, // the last short step back with the feet apart (clear of the seat post)
      {d:1.0,pose:seatRest,props:pinFeet(st,SEAT_FEET,{out:.15})},{d:.8,pose:exP(0,1)},{d:1.0,anim:exFrom(0,1)}],
    leave:(st,e)=>[{d:.8,pose:exP(0,1)},{d:.7,pose:seatRest},{d:1.0,pose:c=>standPose(c,{z:-11.72,stance:.17}),props:pinFeet(st,SEAT_FEET,{out:.15})},
      {d:.4,pose:c=>standPose(c,{z:-11.72})},{walk:[0,-10.8],d:1.1}]},
  // dip: back in between the bars with the arms held out (clear of the handles), hands over and onto the handles, press up
  dip:{pre:[0,-10.8],face:0,
    enter:(st,e)=>[{walk:[0,-11.2],back:true,d:1.3,soft:1},
      {d:.5,anim:settle(c=>standPose(c,{z:-11.2,armOut:.6}))},
      {d:.9,anim:settle(c=>standPose(c,{z:-11.58,armOut:.6}),{step:1,bend:1})},
      {d:.9,anim:settle(c=>standPose(c,{z:-11.95,armOut:.6}),{step:1,bend:1})},
      {d:.6,anim:settle(dipHandsOver)},
      {d:.5,anim:settle(c=>{standPose(c,{z:-11.95,arms:'none'});dipHands(c,undefined,DIP_STAND_POLE);})},
      {d:.8,anim:settle(exP(1,3))}],
    leave:(st,e)=>[{d:.9,anim:settle(c=>{standPose(c,{z:-11.95,arms:'none'});dipHands(c,undefined,DIP_STAND_POLE);})},
      {d:.5,anim:settle(dipHandsOver)},
      {d:.5,anim:settle(c=>standPose(c,{z:-11.95,armOut:.6}))},
      {d:.9,anim:settle(c=>standPose(c,{z:-11.58,armOut:.6}),{step:1,bend:1})},
      {d:.9,anim:settle(c=>standPose(c,{z:-11.2,armOut:.6}),{step:1,bend:1})},
      {d:.4,anim:settle(c=>standPose(c,{z:-11.2}))},
      {walk:[0,-10.8],d:1.1}]},
};
// hands on the dip handles; hz = where the hips are (the hands sit on the handles a little in front, sliding to the dip spot)
function dipHands(c,hz,pole){const hx=D.shx+.06*D.s;const z=hz===undefined?DIP_Z:clamp(hz-.04,DIP_Z,-11.56);
  for(const s of[1,-1])armTo(c,sideOf(s),V(s*hx,DIP_Y+.022,z),{hd:V(-s*.85,-.3,.45),pn:V(-s*.4,-1,0),pole:pole?V(s*pole[0],pole[1],pole[2]):V(s*.3,0,-1)});}
const DIP_STAND_POLE=[.75,.1,-.65]; // standing between the bars, hands on them: elbows bent back and out, clear of the handles
// a few short steps on the spot's floor from hips z0 to z1 (facing canonical h), with the arms placed by arms(c,hipsZ):
// one foot lifts and lands, then the other; used where the walk clip would swing the arms into equipment
function stepPoses(z0,z1,h,arms,o={}){const dz=z1-z0,st=o.stance??.11*D.s,n=Math.max(1,Math.ceil(Math.abs(dz)/.3)),out=[];const dd=(o.d??1.3)/(n*4);
  let L=z0,R=z0,hip=z0;for(let i=0;i<n;i++){const tgt=z0+dz*(i+1)/n,hip0=hip;const lead=i%2===0;let j=0;
    for(const [moveL,ph] of[[lead,0],[lead,1],[!lead,0],[!lead,1]]){j++;const from=moveL?L:R;const zf=ph===0?(from+tgt)/2:tgt;if(moveL)L=zf;else R=zf;
      hip=hip0+(tgt-hip0)*j/4;const Lz=L,Rz=R,hh=hip,hl=moveL&&ph===0?.09:0,hr=!moveL&&ph===0?.09:0;
      out.push({d:dd,lin:true,pose:c=>{standPose(c,{z:hh,h,arms:'none',feet:[[st,Lz-hh],[-st,Rz-hh]],heel:[hl,hr]});arms(c,hh);}});}}
  return out;}
// kneeling upright facing h (canonical), knees at z
function kneelPose(c,o={}){const h=o.h??Math.PI,z=o.z??-11.6,qh=qY(h);const hipY=D.thigh+.07+(o.one?.06:0);
  setRoot(c,qh.clone().multiply(qX((o.lean||0)*DEG)),V(0,hipY,z).add(V(0,0,o.back||0).applyQuaternion(qh)));resetRest(c);c.root.updateMatrixWorld(true);
  const back=V(0,0,-1).applyQuaternion(qh),fwd=back.clone().negate();
  for(const s of[1,-1]){const sd=sideOf(s);const lat=V(s,0,0).applyQuaternion(qh);
    if(o.one&&sd!==o.one){const A=V(0,D.ankY,z).addScaledVector(lat,.14).addScaledVector(fwd,.42);legTo(c,sd,A,fwd.clone().add(V(0,.6,0)));footTo(c,sd,A.clone().addScaledVector(fwd,.15).setY(.03));continue;}
    const K=V(0,.07,z).addScaledVector(lat,.12);
    if(o.tuck){const A=tuckAnkle(K,back);legTo(c,sd,A,V(0,0,1).applyQuaternion(qh).add(V(0,.3,0)));toePlant(c,sd,ballOf(A,fwd),fwd);continue;} // toes tucked under, ready to push up
    const A=K.clone().addScaledVector(back,D.shin*.98).setY(.09);
    legTo(c,sd,A,V(0,0,1).applyQuaternion(qh).add(V(0,.3,0)));footTo(c,sd,A.clone().addScaledVector(back,.19).setY(.03));}
  if(o.arms!=='none')armsHang(c);}
// on hands and knees, head toward −z, hands where the push-up hands go
function allFours(c,o={}){const hx=D.shx+.06*D.s;const S=V(0,.035+(D.arm+D.fore)*.93,PU_HZ-.02);const hs=D.sh.clone().sub(D.hips).length();
  const H=S.clone().add(V(0,0,hs)).setY(D.thigh+.07);const dir=V().subVectors(S,H).normalize();setRoot(c,rootFromAxes(dir,V(0,-1,0)),H);resetRest(c);c.root.updateMatrixWorld(true);
  const L=D.sh.y-.05;const Tz=PU_HZ+Math.sqrt(L*L-Math.pow(.035+(D.arm+D.fore)*.97-.02,2));
  for(const s of[1,-1]){const side=sideOf(s),w=-s;
    if(o.ext==='Both'||o.ext===side){const A=V(w*.1,.12*D.s+(o.tuck?.02:0),Tz-.05);legTo(c,side,A,V(0,1,0));if(o.tuck)toePlant(c,side,ballOf(A,V(0,0,-1)),V(0,0,-1));else aim(c.bones[side+'Foot'],c.bones[side+'ToeBase'],V(A.x,.02,Tz));}
    else if(o.tuck){const K=V(w*.12,.07,H.z);const A=tuckAnkle(K,V(0,0,1));legTo(c,side,A,V(0,-1,-.2));toePlant(c,side,ballOf(A,V(0,0,-1)),V(0,0,-1));}
    else{const K=V(w*.12,.07,H.z);const A=K.clone().add(V(0,.02,D.shin*.98));legTo(c,side,A,V(0,-1,-.2));footTo(c,side,A.clone().add(V(0,-.06,.19)));}
    armTo(c,side,V(w*hx,.012,PU_HZ),{hd:V(0,0,-1),pn:V(0,-1,0),pole:V(w*.5,.1,1).normalize(),curl:0});}}
// kneeling with the toes tucked: the ankle up a foot length above the mat, behind the knee K (on the mat) along `back`
function tuckAnkle(K,back){const ay=BALL_Y+D.footL*.93;return K.clone().addScaledVector(back,Math.sqrt(Math.max(0,D.shin*D.shin-Math.pow(ay-K.y,2)))).setY(ay);}
// where the knees go on all fours (hips over the knees, hands under the shoulders on the push-up spot)
function fourKneeZ(){return PU_HZ-.02+D.sh.clone().sub(D.hips).length();}
// push-up: walk onto the mat, step one foot forward, go down on one knee then both (toes tucked under), hands to the mat,
// then step the legs back one at a time into the plank; getting up is the same backwards, then turn and walk off
ENTRY.mat={pre:[0,-10.55],face:Math.PI,
  enter:(st,e)=>{const kz=fourKneeZ(),H=Math.PI;return [{walk:[0,kz+.45],d:1.0,soft:1},
    {d:.8,...liftFeet(st,c=>standPose(c,{z:kz+.05,h:H,feet:[[.12,-.38],[-.12,.45]],heel:[.06,0]}),{sides:['Right'],lift:.08})},
    {d:1.1,...liftFeet(st,c=>kneelPose(c,{z:kz,one:'Left',tuck:true}))},
    {d:.9,...liftFeet(st,c=>kneelPose(c,{z:kz,tuck:true}),{sides:['Right']})},
    {d:1.0,pose:c=>allFours(c,{tuck:true})},
    {d:.7,...liftFeet(st,c=>allFours(c,{ext:'Left',tuck:true}),{sides:['Left']})},
    {d:.7,...liftFeet(st,c=>allFours(c,{ext:'Both',tuck:true}),{sides:['Right']})},
    {d:.8,pose:exP(1,3)}];},
  leave:(st,e)=>{const kz=fourKneeZ(),H=Math.PI;return [{d:.8,pose:c=>allFours(c,{ext:'Both',tuck:true})},
    {d:.7,...liftFeet(st,c=>allFours(c,{ext:'Right',tuck:true}),{sides:['Left']})},
    {d:.7,...liftFeet(st,c=>allFours(c,{tuck:true}),{sides:['Right']})},
    {d:1.0,pose:c=>kneelPose(c,{z:kz,tuck:true})},
    {d:.9,...liftFeet(st,c=>kneelPose(c,{z:kz,one:'Right',tuck:true}),{sides:['Left']})},
    {d:1.1,...liftFeet(st,c=>standPose(c,{z:kz+.05,h:H,feet:[[.12,.45],[-.12,-.38]],heel:[0,.06]}))},
    {d:.9,...liftFeet(st,c=>standPose(c,{z:kz+.41,h:H}),{sides:['Left']})}];}}; // the walk to the next spot turns as it goes
// cable crossover: set each pulley by hand, take each handle, step into the stance.
// Reaching a carriage: up on the toes (shoulders raised) for a high one, a deep squat with the chest up for a low one; the feet stay put
const CROSS_X=.6,CROSS_Z=-11.62; // where to stand by a tower (toes just clear of it)
function crossBody(c,x,face,y){const lo=clamp((1.05-y)/.8,0,1),hi=clamp((y-1.6)/.4,0,1);
  standPose(c,{x,z:CROSS_Z,h:face,arms:'none',drop:.7*lo-.07*hi,heel:[.07*hi,.07*hi],hinge:34*lo,back:.05*lo,shrug:.03+.22*hi,stance:.16,look:28*hi-10*lo,toe:14});}
function cableReach(c,P,i,x,face,frac,y){const s=i===0?1:-1;const car=V();P.car[i].getWorldPosition(car);ST.g.worldToLocal(car);
  crossBody(c,x,face,y??car.y);armsHang(c,0,-s);const side=i===0?'Left':'Right';
  const S=wpos(c.bones[side+'Arm']);const tgt=S.clone().lerp(car.add(V(-s*.065,0,0)),frac);armTo(c,side,tgt,{hd:V(s,0,0),pn:V(0,0,-1),pole:V(0,-1,.2)});}
// the arm holding a cable handle down at the side (the cable follows); the other arm hangs, or holds its own handle (both)
function cableHoldArms(c,i,both){const s=i===0?1:-1,side=i===0?'Left':'Right';if(!both)armsHang(c,0,-s);const T=torsoAxes(c);
  for(const ss of both?[1,-1]:[s]){const sd=sideOf(ss);const ua=V(0,-1,0).addScaledVector(T.L,ss*.2),fa=V(0,-1,0).addScaledVector(T.L,ss*.08).addScaledVector(T.F,.1);armDir(c,sd,ua,fa,T.L.clone().multiplyScalar(-ss),{hd:V(0,-1,0),curl:1});}}
// turning on the spot by small steps (no walk clip): through the given canonical headings, standing at (x,z); arms(c) places the arms
function stepTurns(x,z,hs,arms,d=.6){return hs.map(h=>({d,anim:settle(c=>{standPose(c,{x,z,h,arms:arms?'none':undefined});arms&&arms(c);},{step:1,bend:1})}));}
// a few short steps (no walk clip) from (x0,z0) to (x1,z1) facing h
function shuffleTo(x0,z0,x1,z1,h,arms,n=3,d=.7){const out=[];for(let i=1;i<=n;i++){const x=lerp(x0,x1,i/n),z=lerp(z0,z1,i/n);
  out.push({d,anim:settle(c=>{standPose(c,{x,z,h,arms:arms?'none':undefined});arms&&arms(c);},{step:1,bend:1})});}return out;}
// set carriage i to the exercise height and take its handle. x / xLow: where to stand for a high / low carriage (a low one is set
// a step further from the tower, so the squatting knees clear it); from: where the lifter stands now. Returns the steps and where it ends.
function cableAdjust(i,x,face,xLow,from){const side=i===0?'Left':'Right',s=i===0?1:-1;const P=()=>ST.P;const y0=ST.P.car[i].position.y,y1=ST.P._target;
  const xs=y0<1.05?xLow:x,xe=y1<1.05?xLow:x;
  const handle=()=>{const h=V();P().h[i].getWorldPosition(h);ST.g.worldToLocal(h);return h;};
  const slide=(to,xx)=>({d:1.2,anim:(c,k)=>{const Q=P();const a=Q.car[i]._y0??Q.car[i].position.y;Q.car[i]._y0=a;Q.setPulley(lerp(a,to,smooth(k)),i);Q.rest();cableReach(c,Q,i,xx,face,1);if(k>=1)Q.car[i]._y0=undefined;}});
  const steps=[...(Math.abs(from-xs)>.02?shuffleTo(from,CROSS_Z,xs,CROSS_Z,face,null,1,.7):[]),
  {d:1.1,pose:c=>cableReach(c,P(),i,xs,face,1)},
  ...(xs!==xe?[slide(1.2,xs),{d:.8,anim:settle(c=>cableReach(c,P(),i,xe,face,1),{step:1,bend:1})},slide(y1,xe)]:[slide(y1,xs)]),
  {d:.8,pose:c=>{const h=handle();crossBody(c,xe,face,h.y+.15);armsHang(c,0,-s);armTo(c,side,h,{hd:V(0,-1,0),pn:V(-s,0,0),pole:V(0,-1,.3)});}},
  {call:c=>{grab(c,P().h[i],side);}},
  // stand up with the handle at the side (the cable follows) before turning away
  {d:1.2,pose:c=>{crossBody(c,xe,face,1.3);cableHoldArms(c,i);}}];
  return {steps,xe};}
ENTRY.cable={pre:[0,-10.6],face:Math.PI,
  enter:(st,e)=>{st.P._target=e.forms.good.high?2.02:.32;const PI=Math.PI,X=CROSS_X,Z=CROSS_Z,XL=.42;const hold0=c=>cableHoldArms(c,0),both=c=>cableHoldArms(c,0,true);
    const A=cableAdjust(0,X,PI/2,XL,.42),B=cableAdjust(1,-X,-PI/2,-XL,-X);return [
    {walk:[.42,Z],d:1.2,soft:1},...stepTurns(.42,Z,[PI*.75,PI/2],null,.9),...A.steps,
    ...stepTurns(A.xe,Z,[PI/4,0,-PI/4,-PI/2],hold0,.5),...shuffleTo(A.xe,Z,-X,Z,-PI/2,hold0,4,.6),
    ...B.steps,...stepTurns(B.xe,Z,[-PI/4,0],both),...shuffleTo(B.xe,Z,0,Z,0,both,2,.7),
    {d:1.3,anim:settle(exP(0,1),{step:1,bend:1})},{call:c=>{c.hold=[];}},{d:1.0,anim:exFrom(0,1)}];},
  leave:(st,e)=>[{d:1.0,pose:exP(0,1)},
    {d:.8,pose:c=>standPose(c,{z:-11.75}),props:(c,k)=>{const P=st.P;for(let i=0;i<2;i++){const p=V();P.pul[i].getWorldPosition(p);st.g.worldToLocal(p);p.y-=CROSS_HANG;P.h[i].position.lerp(p,k);setRod(P.cable[i],p.add(V(0,CROSS_HANG,0)),P.h[i].position);}}},
    {call:()=>st.P.rest()},{walk:[0,-10.6],d:1.2}]};

// ---------------------------------------------------------------- chest: equipment and pose families (canonical frame)
function torsoPole(s,f,ang){return V(s*Math.sin(f),0,0).add(V(0,-Math.sin(ang),Math.cos(ang)).multiplyScalar(Math.cos(f))).add(V(0,Math.cos(ang),Math.sin(ang)).multiplyScalar(-.75)).normalize();}
const PRESS_HD=V(0,1,-.38).normalize();
function poseBar(c,F,b,u,P){ // barbell on a flat / incline / decline bench: vertical bar path
  const ang=(F.angle||0)*DEG;P.setAngle&&P.setAngle(F.angle||0);
  if(F.bounce&&b.phase===0)u=1-Math.pow(b.k,1.8);
  if(F.bounce&&b.phase===2&&b.k<.3)u=b.k<.08?-.04*Math.sin(Math.PI*b.k/.08):u+.18*Math.sin(Math.PI*(b.k-.08)/.22);
  const hip=F.hips?(b.phase===2?Math.sin(Math.PI*clamp(b.k*1.25,0,1))*.2:0):0;
  lieBody(c,{angle:ang,hipLift:hip,breathe:breatheOf(b),look:b.phase===2?1:0,feet:F.feet,neck:F.neck||0});
  const [sl,sr]=shoulders(c),S=sl.clone().add(sr).multiplyScalar(.5);
  const tz=S.z+Math.cos(ang)*F.touchZ;c._touchZw=tz;c._S=S;
  const lockY=S.y+reach()+.078*D.s,touchY=F.touchY??(S.y+D.chest);
  const y=lerp(touchY,lockY,u),z=S.z+(tz-S.z)*Math.pow(1-clamp(u,0,1),1.5),tr=tremorOf(b);
  const grip=F.grip??GRIP;
  const hands=[V(grip,y+tr,z),V(-grip,y-tr,z)];const f=F.flare*DEG;
  for(const s of[1,-1])armTo(c,sideOf(s),hands[s>0?0:1],{hd:PRESS_HD,pn:V(0,0,1),pole:torsoPole(s,f,ang)});
  P.bar.position.addVectors(hands[0],hands[1]).multiplyScalar(.5);P.bar.quaternion.identity();return u;}
// lying on the bench holding the bar at given hand points (unrack / rerack)
function poseBarHands(c,P,hands,ang=0,feet,curl=1){P.setAngle&&P.setAngle(ang/DEG);lieBody(c,{angle:ang,feet});const f=52*DEG; // curl < 1: fingers still open
  for(const s of[1,-1])armTo(c,sideOf(s),hands[s>0?0:1],{hd:PRESS_HD,pn:V(0,0,1),pole:torsoPole(s,f,ang),curl});
  P.bar.position.addVectors(hands[0],hands[1]).multiplyScalar(.5);P.bar.quaternion.identity();}
function lockHands(deg=0,g=GRIP){const S=lieShoulderAt(deg);const y=S.y+Math.sqrt(Math.pow((D.arm+D.fore)*.97,2)-Math.pow(g-D.shx,2))+.078*D.s;return [V(g,y,S.z),V(-g,y,S.z)];}
function poseDB(c,F,b,u,P){ // two dumbbells: apart at the bottom, converging over the shoulders at the top
  const ang=(F.angle||0)*DEG;P.setAngle&&P.setAngle(F.angle||0);lieBody(c,{angle:ang,breathe:breatheOf(b),look:b.phase===2?1:0,feet:F.feet});
  const [sl,sr]=shoulders(c),S=sl.clone().add(sr).multiplyScalar(.5);const tz=S.z+Math.cos(ang)*F.touchZ;c._touchZw=tz;c._S=S;
  const uu=clamp(u,0,1);let xt=F.topX??.2;if(F.clank&&b.phase===3)xt=.135+.012*Math.sin(Math.PI*clamp(b.k*3,0,1));
  const xb=D.shx+(F.deep?.24:.17)*D.s,yb=(F.touchY??(S.y+D.chest))-.02;const nrm=V(0,Math.cos(ang),Math.sin(ang)),deepOff=F.deep?.13*(1-smooth(uu)):0;
  const lockY=S.y+Math.sqrt(Math.pow((D.arm+D.fore)*.97,2)-Math.pow(Math.max(0,D.shx-xt),2))+.078*D.s;
  const f=F.flare*DEG,y=lerp(yb,lockY,u),z=S.z+(tz-S.z)*Math.pow(1-uu,1.5);
  for(const s of[1,-1]){const i=s>0?0:1;const ct=V(s*lerp(xb,xt,smooth(uu)),y,z).addScaledVector(nrm,-deepOff);
    armTo(c,sideOf(s),ct,{hd:PRESS_HD,pn:V(0,0,1),pole:torsoPole(s,f,ang)});if(P.db){P.db[i].position.copy(ct);P.db[i].quaternion.identity();}}
  return u;}
function poseFly(c,F,b,u,P){ // arms sweep in a wide arc with a fixed soft bend
  P.setAngle&&P.setAngle(0);lieBody(c,{breathe:breatheOf(b)});const [sl,sr]=shoulders(c);c._S=sl.clone().add(sr).multiplyScalar(.5);const uu=clamp(u,0,1);
  const el=F.bend?lerp(92,165,smooth(uu)):(F.elbow??160);const bot=(F.bottom??10)*DEG;
  for(const s of[1,-1]){const i=s>0?0:1,S=s>0?sl:sr;const top=V(-s*.12,1,0).normalize(),lo=V(s*Math.cos(bot),-Math.sin(bot),0);
    const dir=slerpV(lo,top,uu);const ct=S.clone().addScaledVector(dir,elbowD(el)+.07*D.s).add(V(0,0,.04));
    const M0=V(0,S.y+.55,S.z+.04);const pn=M0.clone().sub(ct).normalize().add(V(-s*.45,0,0));
    armTo(c,sideOf(s),ct,{hd:dir,pn,pole:V(s*.25,-1,.1),follow:true});if(P.db){P.db[i].position.copy(ct);P.db[i].quaternion.setFromAxisAngle(V(0,1,0),Math.PI/2);}}
  return u;}
function posePressM(c,F,b,u,P){ // seated chest press: handles travel on the machine's fixed path
  const uu=clamp(u,0,1),drop=F.seatlow?.11:0;P.seat.position.y=P.seatBase-drop;
  seatBody(c,{drop,lean:F.roll?.3*smooth(uu):0,protract:F.roll?.3*uu:0,shrug:F.seatlow?.22:.03});
  const R=seatShoulderRef();const z0=R.z+.19*D.s,z1=R.z+(D.arm+D.fore)*.9+.05;
  for(const s of[1,-1]){const i=s>0?0:1;const ct=V(s*(D.shx+.06),R.y-.1*D.s,lerp(z0,z1,uu));
    armTo(c,sideOf(s),ct,{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.6,-1,-.3)});
    P.h[i].position.copy(ct);setRod(P.lever[i],V(s*.62,R.y+.62,SEAT_Z-.3),ct.clone().add(V(0,.09,0)));}
  P.stackTop.position.y=.28*uu;c._S=R;return u;}
function posePecDeck(c,F,b,u,P){ // seated fly: hands swing around a pivot above each shoulder
  const uu=clamp(u,0,1);seatBody(c,{lean:F.lean?.24:0});const R=seatShoulderRef();
  const phi=lerp((F.start??-15)*DEG,108*DEG,smooth(uu)),r=elbowD(150)+.07*D.s;
  for(const s of[1,-1]){const i=s>0?0:1;const piv=V(s*D.shx,R.y-.07,R.z);const ct=piv.clone().add(V(s*Math.cos(phi)*r,0,Math.sin(phi)*r));
    const S=wpos(c.bones[sideOf(s)+'Arm']);armTo(c,sideOf(s),ct,{hd:V().subVectors(ct,S),pn:V(-s*Math.sin(phi),0,Math.cos(phi)),pole:V(0,-1,-.25),follow:true});
    P.h[i].position.copy(ct);setRod(P.arm[i],V(piv.x,1.98,piv.z),ct.clone().add(V(0,.1,0)));}
  P.stackTop.position.y=.28*uu;c._S=R;c._phi=phi;return u;}
function poseCable(c,F,b,u,P){ // standing cable fly; high = pulleys above the head
  const uu=clamp(u,0,1);P.setPulley(F.high?2.02:.32);standBody(c,{lean:(F.lean??(F.high?14:4))*DEG,shrug:F.shrug?.25:.03});
  const [sl,sr]=shoulders(c),hipsY=wpos(c.bones.Hips).y;c._S=sl.clone().add(sr).multiplyScalar(.5);
  for(const s of[1,-1]){const i=s>0?0:1,S=s>0?sl:sr;let start,endT;
    if(F.high){start=V(s*.93,.15,-.28);endT=F.upright?V(s*.05,S.y-.17,S.z+.5):V(s*.05,hipsY+.1,S.z+.42);}
    else{start=V(s*.55,-.83,-.08);endT=F.toohigh?V(s*.06,S.y+.6,S.z+.24):V(s*.05,S.y+.04,S.z+.45);}
    const end=endT.clone().sub(S).normalize(),dir=slerpV(start,end,smooth(uu));
    const el=F.bend?lerp(98,165,smooth(uu)):F.curl?lerp(160,62,smooth(uu)):160;
    const ct=S.clone().addScaledVector(dir,elbowD(el)+.07*D.s);let pn=endT.clone().sub(ct);if(pn.length()<.06)pn=V(-s,0,0);
    armTo(c,sideOf(s),ct,{hd:dir,pn:pn.normalize().add(V(-s*.3,0,0)),pole:V(s*.3,-1,-.4),follow:true});
    P.h[i].position.copy(ct);setRod(P.cable[i],P.pulL(i),ct);}
  P.stackTop.forEach(t=>t.position.y=.3*uu);return u;}
const PU_HZ=-12.42;
// ---- feet on the mat on the balls of the feet (push-up, plank, kneeling with the toes tucked)
const BALL_Y=.035; // height of the ball-of-foot joint when it rests on the mat (the sole and the toes under it)
// the toes' own direction in the toe bone's frame (horizontal forward in the rest pose)
function toeAxis(c,side){c._toeAx=c._toeAx||{};if(c._toeAx[side])return c._toeAx[side];const tb=c.bones[side+'ToeBase'];const q=new THREE.Quaternion();
  for(let o=tb;o&&o!==c.root;o=o.parent){const n=Object.keys(c.bones).find(k=>c.bones[k]===o);q.premultiply(n?c.rest[n]:o.quaternion);}
  return c._toeAx[side]=V(0,0,1).applyQuaternion(q.invert());}
// aim the foot so the ball of the foot lands on point B, then bend the toes flat along the floor toward dir (bent at the ball, like a real foot)
function toePlant(c,side,B,dir){const b=c.bones,tb=b[side+'ToeBase'];aim(b[side+'Foot'],tb,B);
  const wq=tb.getWorldQuaternion(new THREE.Quaternion());const cur=toeAxis(c,side).clone().applyQuaternion(wq);
  const dq=new THREE.Quaternion().setFromUnitVectors(cur.normalize(),dir.clone().normalize());
  tb.quaternion.copy(tb.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(dq.multiply(wq)));tb.updateMatrixWorld(true);}
// where the ball of the foot sits for an ankle A when the foot points from the ankle toward dir (horizontal) and the ball rests on the mat
function ballOf(A,dir,ty=BALL_Y){const dy=Math.min(D.footL*.97,Math.max(0,A.y-ty));return A.clone().addScaledVector(dir.clone().setY(0).normalize(),Math.sqrt(D.footL*D.footL-dy*dy)).setY(A.y-dy);}
function posePush(c,F,b,u,P){ // push-up: hands fixed on the floor, the body pivots on the toes (rigid from toes to shoulders)
  const uu=clamp(u,0,1);const hx=D.shx+.06*D.s;const y1=.035+(D.arm+D.fore)*.97,y0=F.half?.33:.2*D.s;
  const L=D.sh.y-.05;const T=V(0,.02,PU_HZ+Math.sqrt(L*L-Math.pow(y1-.02,2)));
  const hs=D.sh.clone().sub(D.hips).length();const Ank1=T.clone().add(V(0,.12*D.s,-.05)),S1=V(0,y1,PU_HZ);
  // the body pivots on the balls of the feet (on the mat, a foot length below and toward the head from the ankles):
  // shoulders and ankles turn about them, so the feet never slide or sink while the body goes down and up
  const Bp=ballOf(Ank1,V(0,0,-1)),R=S1.distanceTo(Bp);
  const sy=lerp(y0,y1,uu);const S=V(0,sy,Bp.z-Math.sqrt(R*R-Math.pow(sy-Bp.y,2)));
  const qr=new THREE.Quaternion().setFromUnitVectors(S1.clone().sub(Bp).normalize(),S.clone().sub(Bp).normalize());
  const AnkC=Bp.clone().add(Ank1.clone().sub(Bp).applyQuaternion(qr));
  const H=S.clone().add(V().subVectors(AnkC,S).setLength(hs)).add(V(0,F.sag?-.15:F.pike?.17:0,0));
  setRoot(c,rootFromAxes(V().subVectors(S,H),V(0,-1,0)),H);resetRest(c);c.root.updateMatrixWorld(true);c._S=S;c._T=T;
  // face down with the head toward −z, so the lifter's left side is world −x; toes tucked, flat on the mat toward the head
  for(const s of[1,-1]){const side=sideOf(s),w=-s;const A=V(w*.1,AnkC.y,AnkC.z);legTo(c,side,A,V(0,1,0));toePlant(c,side,V(A.x,Bp.y,Bp.z),V(0,0,-1));
    const f=(F.flare??45)*DEG;armTo(c,side,V(w*hx,.012,PU_HZ),{hd:V(0,0,-1),pn:V(0,-1,0),pole:V(w*Math.sin(f),.08,Math.cos(f)).normalize(),curl:0});}
  return u;}
const DIP_Y=1.22,DIP_Z=-12.0;
function poseDip(c,F,b,u,P){ // dip: hands fixed on the bars, body leans forward (chest) or stays upright (triceps)
  const uu=clamp(u,0,1),lean=(F.lean??24)*DEG,hx=D.shx+.06*D.s;
  const yTop=DIP_Y+(D.arm+D.fore)*.96+.03,yBot=DIP_Y+D.fore*.92+.03-(F.deep?.16*F.deep:0)+(F.half?.12:0);
  const S=V(0,lerp(yBot,yTop,uu),DIP_Z+lerp(.12,.03,uu)*(lean/(24*DEG)));const q=rootFromAxes(V(0,Math.cos(lean),Math.sin(lean)),V(0,-Math.sin(lean),Math.cos(lean)));
  const H=S.clone().sub(D.sh.clone().sub(D.hips).applyQuaternion(q));setRoot(c,q,H);resetRest(c);clav(c,{shrug:F.shrug?.45:-.02});c.root.updateMatrixWorld(true);c._S=S;
  for(const s of[1,-1]){const side=sideOf(s);legTo(c,side,H.clone().add(V(-s*.03,-.5,-.32)),V(0,-.3,1),.3);
    const f=(F.flare??32)*DEG;armTo(c,side,V(s*hx,DIP_Y+.022,DIP_Z),{hd:V(-s*.85,-.3,.45),pn:V(-s*.4,-1,0),pole:V(s*Math.sin(f),.45,-Math.cos(f)).normalize()});}
  return u;}

// ---- equipment
function buildPressM(g){const P=seatMachine(g);const R=seatShoulderRef();P.h=[];P.lever=[];
  for(const s of[1,-1]){box(.07,1.0,.07,M.black,s*.62,R.y+.12,SEAT_Z-.3,g);P.h.push(cyl(.02,.17,M.black,0,0,0,'y',g,10));P.lever.push(rod(.022,M.steel,g));}
  box(1.31,.07,.07,M.black,0,R.y+.62,SEAT_Z-.3,g);return P;}
function buildPecDeck(g){const P=seatMachine(g);const R=seatShoulderRef();P.h=[];P.arm=[];
  box(1.0,.08,.12,M.black,0,2.0,R.z,g);box(.08,.08,.75,M.black,0,2.0,R.z-.37,g);
  for(const s of[1,-1]){P.h.push(cyl(.02,.2,M.black,0,0,0,'y',g,10));P.arm.push(rod(.022,M.steel,g));cyl(.035,.06,M.red,s*D.shx,1.98,R.z,'y',g,12);}
  return P;}
// dual cable tower (crossover); pulleys slide on the rails, attachments clip on; a free handle hangs CROSS_HANG under its pulley
const CROSS_HANG=.17;
function buildCable(g){const P={h:[],cable:[],pul:[],stackTop:[],car:[]};
  for(const s of[1,-1]){const x=s*1.05;box(.34,2.3,.34,M.black,x,1.15,CZ-.05,g);box(.06,2.1,.06,M.steel,s*.88,1.12,CZ-.05,g);
    const car=new THREE.Group();g.add(car);box(.1,.16,.1,M.red,0,0,0,car);const pul=new THREE.Group();pul.position.set(-s*.06,0,0);car.add(pul);cyl(.045,.04,M.steel,0,0,0,'x',pul,16);
    car.position.set(s*.88,2.02,CZ-.05);P.car.push(car);P.pul.push(pul);
    P.stackTop.push(stack(g,x,.1,CZ+.13,9));P.h.push(cyl(.018,.13,M.red,0,0,0,'x',g,10));P.cable.push(rod(.0045,M_cable,g));}
  box(2.44,.08,.08,M.black,0,2.3,CZ-.05,g);
  P.pulL=i=>{const p=V();P.pul[i].getWorldPosition(p);return g.worldToLocal(p);}; // pulley centre in the station frame
  P.setPulley=(y,i)=>{for(const k of i===undefined?[0,1]:[i]){P.car[k].position.y=y;P.car[k].updateMatrixWorld(true);}};
  P.rest=()=>{for(let i=0;i<2;i++){const p=V();P.pul[i].getWorldPosition(p);g.worldToLocal(p);P.h[i].position.copy(p).add(V(0,-CROSS_HANG,0));setRod(P.cable[i],p,P.h[i].position);}};
  P.tick=()=>{if(!hero)return;for(let i=0;i<2;i++){if(!hero.hold.some(h=>h.obj===P.h[i]))continue;const pw=V();P.pul[i].getWorldPosition(pw);g.worldToLocal(pw);setRod(P.cable[i],pw,P.h[i].position);}};
  P.setPulley(2.02);P.rest();return P;}
function buildMat(g){const m=box(.75,.012,2.0,M_mat,0,.006,-11.75,g,false);m.receiveShadow=true;m.userData.walkable=true;return {wheel:buildAbWheel(g)};}
function buildDip(g){const hx=D.shx+.06*D.s;const P={};
  for(const s of[1,-1]){const x=s*hx;cyl(.022,.8,M.chrome,x,DIP_Y,DIP_Z+.08,'z',g,14);
    for(const dz of[-.28,.46]){box(.05,DIP_Y,.05,M.black,x,DIP_Y/2,DIP_Z+dz,g);}box(.06,.05,.9,M.black,x,.025,DIP_Z+.08,g);}
  box(hx*2+.1,.05,.06,M.black,0,.025,DIP_Z-.28,g);return P;}

// ---------------------------------------------------------------- chest exercises (12), kept from the chest-only version
const PRESS_STEPS=[['Bring it down','2 sec, breathe in'],['Light touch','on the chest'],['Push it up','breathe out'],['Arms straight','over the shoulders']];
const FLY_STEPS=[['Open the arms','slowly, 2–3 sec'],['Feel the stretch','arms wide'],['Hug it back','same arc'],['Squeeze','hands together']];
const TXT={
  flare:{btn:'Elbows out 90°',tag:'Elbows straight out (90°)',short:'Elbows stick straight out',wrong:'Arms make a T. The bar comes down high on the chest.',
    now:'The front of your shoulders takes the weight; your chest works less.',later:'Often leads to pain at the front of the shoulder. With heavy weight, a higher risk of a shoulder strain or a torn chest muscle.',
    fix:'Elbows about 45° from your body, like an arrow. Bar to the lower chest.',warn:'Strain on the front of the shoulder',warnAt:'shoulder',meas:'flare',guide:'arms',cam:'above',delRed:1,mul:{del:1.35,low:.85,up:.85}},
  neck:{btn:'Bar too high',tag:'Bar comes down too high',short:'Bar comes down too high',wrong:'The bar comes down to the upper chest or neck.',
    now:'Your elbows flare and the shoulders take the strain.',later:'Shoulder pain. If your grip slips, the bar is over your neck and face.',
    fix:'Aim for the lower chest, around nipple level, forearms straight up and down.',warn:'Shoulders strained, bar too high',warnAt:'shoulder',meas:'touch',cam:'above',delRed:1,mul:{del:1.35}},
};
const CHEST_SRC={
  bbFlat:{name:'Bench press',eq:'Barbell',focus:'Whole chest',kind:'press',fam:'bar',calib:'bar',mus:{up:.85,low:1,del:.65,tri:.6},angle:0,
    steps:PRESS_STEPS,stepText:['Lower the bar slowly, about 2 seconds, to the lower part of your chest. Breathe in on the way down. Elbows about 45° from your body.',
      'Let the bar just touch your chest, around nipple level. No bounce, so you stay in control. Your chest works hardest right here.',
      'Push the bar up and slightly back toward your face. Breathe out as you push, and press your feet into the floor.',
      'Finish with straight arms and the bar over your shoulders. Your triceps finish the job. Breathe, then start the next rep.'],
    cues:[['Shoulder blades pinched, feet planted.','Lower to your lower chest, slow.'],['Light touch. Brace.'],['Drive! Push the floor away.','Up and slightly back.'],['Lock out over the shoulders.']],
    how:['Eyes under the bar, feet flat, shoulder blades pinched.','Grip about 1.5× shoulder width, wrists stacked over elbows.','Lower in about 2 seconds to the lower chest, elbows 45–60° from your body.','Light touch, no bounce. Press up and slightly back over the shoulders.'],
    beginner:'3 sets of 8–12; start with the empty bar (20 kg).',cam:'side',coach:'head',
    forms:mk(base({touchZ:.13}),{flare:Object.assign({flare:88,touchZ:0},TXT.flare),
      bounce:{lower:.42,touch:0,press:.75,lock:.4,bounce:1,btn:'Bouncing',tag:'Bar drops and bounces',short:'Bar bounces off the chest',wrong:'The bar drops fast and springs off the ribs.',
        now:'The bounce does the hardest part, so your chest gets less work. You lose control of the bar.',later:'Bruised breastbone or ribs, and less muscle growth for the same effort.',
        fix:'About 2 seconds down, a light touch, then push.',warn:'Bar bounces off the ribs',warnAt:'chest',meas:'speed',cam:'feetLow',mul:{up:.7,low:.7}},
      hips:{hips:1,btn:'Hips up',tag:'Hips lift off the bench',short:'Hips lift off the bench',wrong:'Your bottom lifts off the bench as you push.',
        now:'Your lower back bends and takes the strain. The lift feels easier than it really is.',later:'Lower-back pain. You overestimate your strength, and in competitions the lift doesn’t count.',
        fix:'Keep your bottom on the bench. Push your feet into the floor.',warn:'Hips off the bench, back arches',warnAt:'hips',meas:'hips',cam:'feetLow'},
      neck:Object.assign({flare:70,touchZ:-.13},TXT.neck)})},
  bbIncline:{name:'Incline bench press',eq:'Barbell',focus:'Upper chest',kind:'press',fam:'bar',calib:'bar',mus:{up:1,low:.62,del:.85,tri:.6},angle:30,
    steps:PRESS_STEPS.map((s,i)=>i===1?['Light touch','below the collarbones']:s),stepText:['Bench at 30°. Lower the bar slowly, about 2 seconds, to the top of your chest. Breathe in.',
      'Let the bar touch just below your collarbones. This is where the upper chest is stretched most.','Press straight up, breathing out. Keep your bottom on the seat.','Arms straight, bar over your shoulders. Start the next rep.'],
    cues:[['Lower to the upper chest.'],['Touch under the collarbones.'],['Press straight up.'],['Arms straight.']],
    how:['Set the bench to 30° (anything from 30–45° works).','Grip about 1.5× shoulder width, shoulder blades pinched.','Lower to just below the collarbones, elbows 45–60° from your body.','Press straight up over your shoulders.'],
    beginner:'3 sets of 8–12; expect about 20% less weight than flat.',cam:'side',coach:'head',
    forms:mk(base({touchZ:.05,angle:30}),{
      steep:{angle:60,btn:'Bench too steep',tag:'Bench too steep (60°)',short:'Bench set too steep',wrong:'The bench is raised to about 60°, so it turns into a shoulder press.',
        now:'The front of your shoulders does most of the work, and you lift about 15–20% less weight.',later:'Less upper-chest growth for the effort, more strain on the shoulders.',
        fix:'Set the bench to 30–45°. The upper chest works just as hard there.',warn:'Front shoulders take over',warnAt:'shoulder',meas:'angle',cam:'sideFlat',delRed:1,mul:{del:1.4,low:.6,up:.85}},
      chin:Object.assign({},TXT.neck,{touchZ:-.12,flare:68,btn:'Bar to the chin',tag:'Bar drifts to the chin',short:'Bar comes down to the chin',wrong:'The bar comes down toward the chin and neck instead of the upper chest.',
        fix:'Lower the bar to just below the collarbones.'})})},
  bbDecline:{name:'Decline bench press',eq:'Barbell',focus:'Lower chest',kind:'press',fam:'bar',calib:'bar',mus:{up:.6,low:1,del:.45,tri:.65},angle:-15,
    steps:PRESS_STEPS.map((s,i)=>i===1?['Light touch','lower breastbone']:s),stepText:['Legs hooked, bench at about −15°. Lower the bar slowly to the bottom of your breastbone.',
      'Light touch on the lower chest. The range is shorter than on a flat bench.','Press straight up, breathing out.','Arms straight, bar over the shoulders. Keep sets short: blood runs to your head.'],
    cues:[['Lower to the bottom of the chest.'],['Light touch.'],['Press up.'],['Arms straight.']],
    how:['Hook your legs under the rollers, bench at about −15°.','Always use a spotter to unrack.','Lower to the bottom of the breastbone, elbows 45–60°.','Press straight up; keep sets short.'],
    beginner:'3 sets of 8–12 with a spotter.',cam:'side',coach:'head',
    forms:mk(base({touchZ:.17,angle:-15,feet:'rollers'}),{
      neck:Object.assign({flare:70,touchZ:-.1},TXT.neck),
      steep:{angle:-32,btn:'Too steep',tag:'Decline too steep',short:'Bench tipped too far',wrong:'The bench is tipped so far that the lift becomes a short, awkward dip.',
        now:'Blood rushes to your head and each rep covers very little distance.',later:'Less chest work per rep, and a harder, riskier unrack.',fix:'Keep the decline gentle, about 15°.',warn:'Head far below the hips',warnAt:'chest',meas:'angle',cam:'sideFlat'}})},
  dbFlat:{name:'Dumbbell bench press',eq:'Dumbbell',focus:'Whole chest',kind:'press',fam:'db',calib:'bar',mus:{up:.85,low:1,del:.65,tri:.5},angle:0,
    steps:[['Lower the dumbbells','2 sec, breathe in'],['Level with the chest','a deep stretch'],['Press up and in','breathe out'],['Arms straight','10 cm apart']],
    stepText:['Lower both dumbbells slowly, elbows about 45° from your body.','Stop when the dumbbells are level with your chest. Dumbbells let you go a little deeper than a bar, so the chest stretches more.',
      'Press up and slightly in, breathing out.','Finish over your shoulders, dumbbells about 10 cm apart. Don’t bang them together.'],
    cues:[['Lower slowly.'],['Level with the chest.'],['Press up and in.'],['Stop just before they touch.']],
    how:['Kick the dumbbells up from your knees, then lie back.','Shoulder blades back, feet flat.','Lower until the dumbbells are level with your chest.','Press up and in; stop about 10 cm apart.'],
    beginner:'3 sets of 8–12 with dumbbells you can get into position safely.',cam:'side',coach:'side',
    forms:mk(base({touchZ:.11,topX:.2}),{
      deep:{deep:1,btn:'Too deep',tag:'Dumbbells sink too deep',short:'Dumbbells go far too deep',wrong:'The dumbbells sink well below the chest and the elbows drop under the bench.',
        now:'The front of the shoulder is stretched hard under load.',later:'A common way to strain the shoulder.',fix:'Stop when the dumbbells are level with your chest.',warn:'Shoulder pulled too far',warnAt:'shoulder',meas:'dbDepth',cam:'feetLow',delRed:1,mul:{del:1.3}},
      flare:Object.assign({},TXT.flare,{flare:100,fix:'Elbows about 45° from your body, like an arrow.'}),
      clank:{clank:1,topX:.135,btn:'Clanking',tag:'Dumbbells clank together',short:'Dumbbells bang together at the top',wrong:'The dumbbells bang together at the top of every rep.',
        now:'The chest relaxes at the top and the weights can bounce out of control.',later:'Less tension on the chest each rep, and jolts to the wrists and elbows.',fix:'Stop about 10 cm apart, right over your shoulders.',warn:'Weights collide',warnAt:'chest',meas:'dbGap',cam:'feet'}})},
  dbIncline:{name:'Incline dumbbell press',eq:'Dumbbell',focus:'Upper chest',kind:'press',fam:'db',calib:'bar',mus:{up:1,low:.6,del:.85,tri:.5},angle:30,
    steps:[['Lower the dumbbells','2 sec, breathe in'],['Level with the upper chest','stretch'],['Press up and in','breathe out'],['Arms straight','over the collarbones']],
    stepText:['Bench at 30°. Lower both dumbbells slowly toward the top of your chest.','Stop with the dumbbells level with your upper chest.','Press up and slightly in, breathing out.','Finish above your collarbones, dumbbells about 10 cm apart.'],
    cues:[['Lower to the upper chest.'],['Stretch.'],['Press up and in.'],['Squeeze.']],
    how:['Bench at 30°.','Shoulder blades back, feet flat, bottom on the seat.','Lower until the dumbbells are level with your upper chest.','Press up and in above your collarbones.'],
    beginner:'3 sets of 8–12.',cam:'side',coach:'side',
    forms:mk(base({touchZ:.05,topX:.2,angle:30}),{
      steep:{angle:60,btn:'Bench too steep',tag:'Bench too steep (60°)',short:'Bench set too steep',wrong:'The bench is raised to about 60°, so it turns into a shoulder press.',
        now:'The front shoulders take over from the upper chest.',later:'Less upper-chest growth, more shoulder strain.',fix:'Set the bench to 30–45°.',warn:'Front shoulders take over',warnAt:'shoulder',meas:'angle',cam:'sideFlat',delRed:1,mul:{del:1.4,low:.6,up:.85}},
      deep:{deep:1,btn:'Too deep',tag:'Dumbbells sink too deep',short:'Dumbbells go far too deep',wrong:'The dumbbells sink far below the chest at the bottom.',
        now:'The front of the shoulder is stretched hard under load.',later:'A common way to strain the shoulder.',fix:'Stop when the dumbbells are level with your upper chest.',warn:'Shoulder pulled too far',warnAt:'shoulder',meas:'dbDepth',cam:'feetLow',delRed:1,mul:{del:1.3}}})},
  dbFly:{name:'Dumbbell fly',eq:'Dumbbell',focus:'Chest stretch',kind:'fly',fam:'fly',mus:{up:.85,low:1,del:.5,tri:.05},angle:0,
    steps:FLY_STEPS,stepText:['Arms above your chest, palms facing each other, a soft bend in the elbows. Open the arms slowly in a wide arc, about 3 seconds.',
      'Stop when your upper arms are level with your body. Feel the stretch across your chest: this stretched position is what the fly is for.',
      'Bring the dumbbells back up along the same arc, as if hugging a big tree. The elbow bend never changes.','Hands meet over your chest without touching. Keep the chest tight.'],
    cues:[['Open wide, slowly.'],['Feel the stretch.'],['Hug the tree.'],['Squeeze.']],
    how:['Lie flat, dumbbells above your chest, palms facing each other.','Bend the elbows slightly and keep that bend the whole time.','Open the arms until the upper arms are level with your body.','Sweep back up along the same arc; don’t press.'],
    beginner:'3 sets of 10–15 with a weight you could lift 20 times.',cam:'feet',coach:'side',
    forms:mk({lower:2.6,touch:.6,press:1.2,lock:.4,prof:'fly',elbow:160,bottom:0},{
      press:{bend:1,btn:'Turns into a press',tag:'Turns into a press',short:'Elbows bend and straighten',wrong:'The elbows bend and straighten, so the fly turns into a dumbbell press.',
        now:'The triceps take part of the work and the chest loses its stretch.',later:'You lift more but train the chest less in the stretched position, which is the point of the fly.',fix:'Lock a soft bend in the elbows and keep it the whole rep.',warn:'Elbows bend',warnAt:'elbow',meas:'elbowMin',cam:'feet',mul:{tri:6}},
      deep:{bottom:36,btn:'Too deep',tag:'Arms go too deep',short:'Arms drop far too deep',wrong:'The arms drop far below the body at the bottom.',
        now:'The shoulder joint is pulled to its limit while holding weight.',later:'A common cause of shoulder strain with flies.',fix:'Stop when your upper arms are level with your body.',warn:'Shoulder at its limit',warnAt:'shoulder',meas:'armBelow',cam:'feetLow',delRed:1,mul:{del:1.4}},
      straight:{elbow:178,btn:'Arms locked',tag:'Arms locked straight',short:'Arms locked dead straight',wrong:'The elbows are locked completely straight.',
        now:'The long, straight arm puts the strain on the elbows.',later:'Elbow pain over time.',fix:'Keep a soft bend of about 15–20° in the elbows.',warn:'Strain on the elbows',warnAt:'elbow',meas:'elbowMin',cam:'feet'}})},
  machinePress:{name:'Chest press machine',eq:'Machine',focus:'Middle chest',kind:'press',fam:'machine',mus:{up:.8,low:1,del:.6,tri:.6},
    steps:[['Let the handles back','2 sec, breathe in'],['Handles by the chest','stretch'],['Push forward','breathe out'],['Arms almost straight','don’t lock']],
    stepText:['Let the handles come back slowly, elbows about 45° below shoulder height.','Stop with the handles just in front of your chest, at nipple height.','Push forward, breathing out. Keep your back against the pad.','Arms almost straight. Don’t lock the elbows hard; start the next rep.'],
    cues:[['Back slowly.'],['Handles at the chest.'],['Push.'],['Almost straight.']],
    how:['Set the seat so the handles line up with the middle of your chest.','Back and head against the pad, feet flat.','Push forward until the arms are almost straight.','Come back until the handles are just in front of the chest.'],
    beginner:'3 sets of 10–12. A great first chest exercise.',cam:'three',coach:'side',
    forms:mk(base({}),{
      seatlow:{seatlow:1,btn:'Seat too low',tag:'Seat too low',short:'Seat set too low',wrong:'The seat is too low, so the handles sit at shoulder height.',
        now:'Your shoulders shrug up and the front shoulders take over.',later:'Shoulder strain and less chest work.',fix:'Raise the seat so the handles line up with the middle of your chest.',warn:'Shoulders shrug up',warnAt:'shoulder',meas:'handleH',cam:'sideFlat',delRed:1,mul:{del:1.35,low:.8}},
      roll:{roll:1,btn:'Shoulders roll forward',tag:'Back comes off the pad',short:'Shoulders roll off the pad',wrong:'At the end of each push the upper back leaves the pad and the shoulders roll forward.',
        now:'The shoulders take the load and the chest stops working early.',later:'Shoulder strain and a rounded-shoulder habit.',fix:'Keep your shoulder blades back against the pad the whole time.',warn:'Back off the pad',warnAt:'back',meas:'pad',cam:'sideFlat',mul:{del:1.2}}})},
  pecDeck:{name:'Pec deck',eq:'Machine',focus:'Chest squeeze',kind:'fly',fam:'machine',mus:{up:.85,low:1,del:.45,tri:.05},
    steps:FLY_STEPS.map((s,i)=>i===0?['Open the arms','slowly, 2 sec']:s),stepText:['Let the arms open slowly until they are just behind your body.','Feel a stretch across the chest, not pain in the shoulder.','Bring the handles together in a wide arc in front of your chest.','Squeeze for a second with the hands together.'],
    cues:[['Open slowly.'],['Stretch, no pain.'],['Bring them together.'],['Squeeze, one second.']],
    how:['Set the seat so the handles are at chest height.','Back and head against the pad.','Bring the arms together in an arc and squeeze for a second.','Open slowly, only until the arms are just behind the body.'],
    beginner:'3 sets of 12–15.',cam:'above',coach:'side',
    forms:mk({lower:2.0,touch:.3,press:1.6,lock:.9,prof:'fly'},{
      toofar:{start:-45,btn:'Starts too far back',tag:'Arms start too far back',short:'Arms open too far behind',wrong:'The arms open far behind the body at the start of each rep.',
        now:'The front of the shoulder is jammed at its limit.',later:'Shoulder strain, the most common pec-deck injury.',fix:'Only open until the arms are just behind your body.',warn:'Shoulder jammed',warnAt:'shoulder',meas:'startOpen',cam:'above',delRed:1,mul:{del:1.4}},
      lean:{lean:1,btn:'Leaning forward',tag:'Leaning off the pad',short:'Body leans off the back pad',wrong:'The body leans forward, away from the back pad.',
        now:'The shoulders and arms take over and the chest works less.',later:'Less chest work and a rounded-shoulder habit.',fix:'Keep your back and head against the pad.',warn:'Back off the pad',warnAt:'back',meas:'pad',cam:'sideFlat',mul:{del:1.2}}})},
  cableHL:{name:'Cable crossover, high to low',eq:'Cable',focus:'Lower chest',kind:'fly',fam:'cable',high:1,mus:{up:.55,low:1,del:.4,tri:.08},
    steps:[['Let the arms open','2 sec'],['Stretch','arms wide and high'],['Pull down and in','in a wide arc'],['Squeeze','hands at the hips']],
    stepText:['Lean forward a little. Let the handles pull your arms up and out, slowly.','Arms wide at shoulder height, chest open.','Sweep the hands down and together in a wide arc. Elbows keep the same soft bend.','Hands meet in front of your hips. Squeeze for a second.'],
    cues:[['Let them open.'],['Stretch.'],['Down and in.'],['Squeeze at the hips.']],
    how:['Pulleys above head height, one handle in each hand.','Staggered stance, lean forward slightly, soft elbows.','Sweep the hands down and together in front of your hips.','Return slowly with the chest open.'],
    beginner:'2–3 sets of 12–15. Lower-chest emphasis comes from the direction of the fibres (coaching consensus).',cam:'three',coach:'side',
    forms:mk({lower:2.0,touch:.4,press:1.2,lock:.9,prof:'fly',high:1},{
      press:{bend:1,btn:'Pressing',tag:'Pressing the handles',short:'Elbows bend and push',wrong:'The elbows bend and then straighten, pushing the handles like a press.',
        now:'The triceps help out and the chest loses its stretch.',later:'Less chest work from the exercise.',fix:'Keep a soft, fixed bend in the elbows and sweep the arms in an arc.',warn:'Elbows bend',warnAt:'elbow',meas:'elbowMin',cam:'sideFlat',mul:{tri:6}},
      upright:{upright:1,lean:0,btn:'Hands to the chest',tag:'Upright, hands to the chest',short:'Hands meet at chest height',wrong:'Standing straight up, with the hands meeting at chest height.',
        now:'It turns into a mid-chest fly; the lower chest gets less work.',later:'The lower chest misses out, and that is the point of this exercise.',fix:'Lean forward a little and bring your hands down to meet in front of your hips.',warn:'Hands too high',warnAt:'chest',meas:'handsEnd',cam:'sideFlat',mul:{low:.7,up:1.2}}})},
  cableLH:{name:'Cable crossover, low to high',eq:'Cable',focus:'Upper chest',kind:'fly',fam:'cable',high:0,mus:{up:1,low:.55,del:.8,tri:.08},
    steps:[['Let the arms down','2 sec'],['Stretch','hands by the hips'],['Sweep up and in','in a wide arc'],['Squeeze','upper-chest height']],
    stepText:['Let the handles pull your arms down and back to your sides, slowly.','Hands low and wide by your hips, chest open.','Sweep the hands up and together. The elbows keep the same soft bend.','Hands meet at upper-chest or chin height. Squeeze for a second.'],
    cues:[['Down slowly.'],['Stretch.'],['Up and in.'],['Squeeze at chest height.']],
    how:['Pulleys at the lowest setting.','Stand tall in a staggered stance, soft elbows.','Sweep the hands up and in to meet at upper-chest height.','Lower slowly back to your hips.'],
    beginner:'2–3 sets of 12–15. Upper-chest emphasis comes from the direction of the fibres (coaching consensus).',cam:'three',coach:'side',
    forms:mk({lower:2.0,touch:.4,press:1.2,lock:.9,prof:'fly',high:0},{
      curl:{curl:1,btn:'Curling',tag:'Curling the handles',short:'Elbows bend like a curl',wrong:'The elbows bend and the hands come up to the shoulders, like a biceps curl.',
        now:'The biceps do the work, not the chest.',later:'The upper chest gets little work.',fix:'Keep the elbows softly bent and fixed; sweep the hands up and in.',warn:'Elbows bend',warnAt:'elbow',meas:'elbowMin',cam:'sideFlat'},
      toohigh:{toohigh:1,btn:'Hands too high',tag:'Hands finish too high',short:'Hands go above the head',wrong:'The hands keep going up above the head.',
        now:'It becomes a front raise: the front shoulders take over.',later:'Shoulder strain and less upper-chest work.',fix:'Stop when the hands meet at upper-chest or chin height.',warn:'Front shoulders take over',warnAt:'shoulder',meas:'handsEnd',cam:'sideFlat',delRed:1,mul:{del:1.4,up:.8}}})},
  pushup:{name:'Push-up',eq:'Bodyweight',focus:'Whole chest',kind:'press',fam:'push',mus:{up:.75,low:.9,del:.6,tri:.65},
    steps:[['Lower your chest','2 sec, breathe in'],['Chest near the floor','about 5 cm'],['Push the floor away','breathe out'],['Arms straight','shoulder blades spread']],
    stepText:['Body in one straight line, hands just wider than your shoulders. Lower slowly, elbows about 45° from your body.','Stop with your chest about 5 cm from the floor.','Push the floor away, breathing out. Keep your hips in line.','Arms straight at the top and spread your shoulder blades.'],
    cues:[['Lower slowly.'],['Chest near the floor.'],['Push the floor away.'],['Arms straight.']],
    how:['Hands just wider than your shoulders.','One straight line from head to heels: squeeze glutes and abs.','Lower until your chest is about 5 cm from the floor, elbows 45°.','Push back up to straight arms.'],
    beginner:'3 sets of as many clean reps as you can, minus two. Too hard? Put your hands on a bench.',cam:'pushSide',coach:'side',
    forms:mk(base({flare:45}),{
      sag:{sag:1,btn:'Hips sag',tag:'Hips sag',short:'Hips sag toward the floor',wrong:'The hips drop toward the floor, like a banana.',
        now:'Your lower back bends and takes the strain.',later:'Lower-back pain.',fix:'Squeeze your glutes and abs: one straight line from head to heels.',warn:'Lower back sags',warnAt:'hips',meas:'sag',cam:'pushSide'},
      pike:{pike:1,btn:'Hips piked',tag:'Hips piked up',short:'Hips stick up in the air',wrong:'The hips stick up in the air.',
        now:'Less of your body weight is on your arms, so the chest works less.',later:'Slower progress for the same effort.',fix:'Lower the hips into one straight line.',warn:'Hips too high',warnAt:'hips',meas:'sag',cam:'pushSide',mul:{up:.7,low:.7}},
      flare:Object.assign({},TXT.flare,{flare:85,wrong:'The elbows point straight out to the sides, like a T.',fix:'Keep the elbows about 45° from your body, like an arrow.'})})},
  dip:{name:'Chest dip',eq:'Bodyweight',focus:'Lower chest',kind:'dip',fam:'dip',mus:{up:.5,low:1,del:.6,tri:.95},
    steps:[['Lower yourself','2 sec, lean forward'],['Upper arms level','with the floor'],['Press back up','breathe out'],['Arms straight','shoulders down']],
    stepText:['Lean your body forward a little, about 20–30°. Bend the elbows and lower yourself slowly.','Stop when your upper arms are about level with the floor.','Press back up, breathing out, without swinging.','Arms straight, shoulders pushed down away from your ears.'],
    cues:[['Lean forward, lower slowly.'],['Upper arms level.'],['Press up.'],['Shoulders down.']],
    how:['Arms straight, shoulders down, feet crossed behind you.','Lean forward 20–30° for the chest version.','Lower until the upper arms are level with the floor.','Press back up without swinging.'],
    beginner:'3 sets of 6–10 on an assisted dip machine, or slow lowering-only reps.',cam:'three',coach:'side',
    forms:mk(base({}),{
      deep:{deep:1,btn:'Too deep',tag:'Going too deep',short:'Shoulders drop far below the elbows',wrong:'The shoulders drop far below the elbows at the bottom.',
        now:'The front of the shoulder is stretched hard under your whole body weight.',later:'One of the most common causes of shoulder pain from dips.',fix:'Stop when your upper arms are about level with the floor.',warn:'Front of the shoulder overstretched',warnAt:'shoulder',meas:'dipDepth',cam:'sideFlat',delRed:1,mul:{del:1.4}},
      shrug:{shrug:1,btn:'Shoulders shrug up',tag:'Shoulders up to the ears',short:'Shoulders shrug up to the ears',wrong:'The shoulders shrug up toward the ears.',
        now:'The neck and the top of the shoulders take the strain.',later:'Neck and shoulder pain.',fix:'Push your shoulders down, away from your ears, before every rep.',warn:'Shoulders up by the ears',warnAt:'shoulder',meas:'shrug',cam:'front'}})},
};

// ---- chest: register the 12 exercises on their stations
const CHEST_POSE={bar:poseBar,db:poseDB,fly:poseFly,push:posePush,dip:poseDip,cable:poseCable};
const CHEST_ST={bbFlat:'flatRack',bbIncline:'inclineRack',bbDecline:'declineRack',dbFlat:'dbFlat',dbIncline:'dbIncline',dbFly:'dbFlat',machinePress:'chestPress',pecDeck:'pecDeck',cableHL:'crossover',cableLH:'crossover',pushup:'mat',dip:'tower'};
const CHEST_ENTRY={bar:'barBench',db:'dbLie',fly:'dbLie',machine:'machine',cable:'cable',push:'mat',dip:'dip'};
const CHEST_PART={bbIncline:'Upper chest',dbIncline:'Upper chest',cableLH:'Upper chest',bbFlat:'Whole chest',dbFlat:'Whole chest',machinePress:'Middle chest',pushup:'Whole chest',dbFly:'Chest stretch',pecDeck:'Middle chest',bbDecline:'Lower chest',dip:'Lower chest',cableHL:'Lower chest'};
const CENTER={bar:[.78,-12.1],db:[.78,-12.1],fly:[.82,-12.1],machine:[1.0,-12.0],cable:[1.15,-11.85],push:[.32,-11.75],dip:[1.3,-11.95]};
function chestMus(m){return {pecU:[m.up,'m'],pecL:[m.low,'m'],deltF:[m.del,'h'],triLat:[m.tri,'h'],triLong:[m.tri*.9,'h']};}
function chestMul(x){if(!x)return undefined;const o={};if(x.up!==undefined)o.pecU=x.up;if(x.low!==undefined)o.pecL=x.low;if(x.del!==undefined)o.deltF=x.del;if(x.tri!==undefined){o.triLat=x.tri;o.triLong=x.tri;}return o;}
for(const k of ['bbIncline','bbFlat','bbDecline','dbIncline','dbFlat','dbFly','machinePress','pecDeck','cableLH','cableHL','pushup','dip']){const o=CHEST_SRC[k];
  const fam=o.fam==='machine'?(k==='pecDeck'?'pecdeck':'pressm'):o.fam;
  const pose=fam==='pecdeck'?posePecDeck:fam==='pressm'?posePressM:CHEST_POSE[fam];
  for(const f in o.forms){const F=o.forms[f];if(F.angle===undefined&&o.angle!==undefined)F.angle=o.angle;F.mul=chestMul(F.mul);if(F.delRed)F.strain=['deltF'];}
  const upE=o.mus.up-o.mus.low;
  const c=CENTER[o.fam];
  defEx(k,{...o,group:'chest',part:CHEST_PART[k],fam:o.fam,pose,station:CHEST_ST[k],entry:o.fam==='bar'&&o.angle<0?'barBenchDecline':CHEST_ENTRY[o.fam],
    mus:chestMus(o.mus),labels:[[upE>.3?'Upper chest':upE<-.3?'Lower chest':'Chest',upE>.3?'pecU':'pecL','m'],['Front shoulder','deltF','h'],...(o.mus.tri>=.2?[['Triceps','triLat','h']]:[])],
    center:V(0,c[0]+(o.angle>0?.15:0),c[1]-(o.angle>0?.15:0)),coachSpot:o.coach==='head'?{p:[-.3,o.angle>0?-13.7:-13.45],h:0}:{p:[-1.62,-11.3],h:Math.PI/2},
    needs:o.fam==='db'||o.fam==='fly'?'db':null});}
EXS.dip.coachSpot={p:[1.35,-11.2],h:-Math.PI/2-.4};EXS.machinePress.coachSpot={p:[1.3,-11.3],h:-Math.PI/2};

// ---------------------------------------------------------------- equipment for back (and shared with other groups)
// power tower: pull-up bar on top, dip handles in front, back pad and forearm pads for knee raises
const PU_Y=2.25,PU_Z=-12.08;
function buildTower(g){const hx=D.shx+.06*D.s;const P={};
  for(const s of[1,-1]){box(.07,2.35,.07,M.black,s*.46,1.175,-12.48,g);box(.07,.06,.95,M.black,s*.46,.03,-12.2,g);
    // dip handles (also the forearm rests for knee raises)
    cyl(.022,.8,M.chrome,s*hx,DIP_Y,DIP_Z+.08,'z',g,14);box(.05,.05,.08,M.black,s*hx,DIP_Y,-12.44,g);box((.46-hx)+.04,.05,.05,M.black,s*(hx+.46)/2,DIP_Y,-12.44,g);
    box(.1,.03,.32,M.pad,s*hx,DIP_Y+.04,DIP_Z-.1,g);}
  box(.98,.07,.07,M.black,0,2.32,-12.48,g);
  // pull-up bar sticking out in front
  for(const s of[1,-1])box(.06,.06,.42,M.black,s*.46,PU_Y,-12.28,g);
  P.bar=cyl(.016,1.2,M.chrome,0,PU_Y,PU_Z,'x',g,14);
  box(.36,.6,.07,M.pad,0,1.1,-12.43,g);return P;}
// lat pulldown: seat with thigh pad, column and stack in front, bar on a cable from the top pulley
const LPD={seatY:.5,seatZ:-12.15,pulY:2.35,pulZ:-11.95,sitZ:-12.22};
// where the bar rests (stack down): high over the front of the seat, within reach of someone sitting upright on it
function lpdRest(){const S=V(0,LPD.seatY+.1*D.s,LPD.sitZ).add(D.sh.clone().sub(D.hips));const dx=.3*D.s-D.shx,z=-11.97,dz=z-S.z;return V(0,S.y+Math.sqrt(Math.max(.01,.58*.58*D.s*D.s-dx*dx-dz*dz)),z);}
function buildLatPulldown(g){const P={};
  box(.4,.08,.4,M.pad,0,LPD.seatY-.04,LPD.seatZ,g);box(.07,LPD.seatY-.08,.07,M.steel,0,(LPD.seatY-.08)/2,LPD.seatZ,g);
  for(const s of[1,-1]){const tp=cyl(.06,.3,M.pad,s*.16,LPD.seatY+.2,-11.85,'x',g);}box(.4,.04,.04,M.steel,0,LPD.seatY+.2,-11.85,g);box(.04,.04,1.0,M.steel,0,LPD.seatY+.2,-11.35,g); // thigh pads held from the column (nothing under them, so the legs swing in)
  box(.9,.025,.5,M.black,0,.0125,-12.1,g);box(.5,.025,.4,M.black,0,.0125,-10.8,g);box(.1,2.45,.1,M.black,0,1.225,-10.85,g);box(.1,.1,1.25,M.black,0,2.42,-11.45,g);
  cyl(.05,.04,M.steel,0,LPD.pulY,LPD.pulZ,'x',g,16);
  P.stackTop=stack(g,0,.12,-10.68,10);box(.32,1.7,.06,M.black,0,.85,-10.6,g);
  P.bar=new THREE.Group();g.add(P.bar);{const r=cyl(.015,1.1,M.chrome,0,0,0,'x',P.bar,12);for(const s of[1,-1]){const e=cyl(.017,.18,M.black,s*.47,0,0,'x',P.bar,10);}}
  P.cable=rod(.0045,M_cable,g);P.pul=V(0,LPD.pulY,LPD.pulZ);
  P.rest=()=>{P.bar.position.copy(lpdRest());P.bar.quaternion.identity();setRod(P.cable,P.pul,P.bar.position);P.stackTop.position.y=0;};P.rest();return P;}
// seated cable row: long low seat, foot plate, low pulley in front, triangle handle
const SROW={seatY:.42,seatZ:-12.25,footZ:-11.6,pulY:.33,pulZ:-11.12};
function buildSeatedRow(g){const P={};
  box(.36,.08,1.2,M.pad,0,SROW.seatY-.04,-12.4,g);for(const z of[-12.85,-11.95])box(.06,SROW.seatY-.08,.06,M.steel,0,(SROW.seatY-.08)/2,z,g);box(.12,.05,1.9,M.steel,0,.025,-12.0,g);
  const fp=box(.5,.36,.05,M.black,0,.24,SROW.footZ,g);fp.rotation.x=.35;box(.08,.4,.08,M.steel,0,.2,SROW.footZ+.12,g);
  box(.5,2.0,.5,M.black,0,1.0,-10.75,g);cyl(.045,.04,M.steel,0,SROW.pulY,SROW.pulZ,'x',g,16);
  P.stackTop=stack(g,0,.12,-11.03,10);
  P.h=new THREE.Group();g.add(P.h);{const a=rod(.012,M.chrome,P.h),b=rod(.012,M.chrome,P.h),c=rod(.012,M.chrome,P.h);setRod(a,V(-.07,0,0),V(.07,0,0));setRod(b,V(-.07,0,0),V(0,0,.13));setRod(c,V(.07,0,0),V(0,0,.13));
    cyl(.02,.1,M.black,-.07,0,0,'y',P.h,8);cyl(.02,.1,M.black,.07,0,0,'y',P.h,8);}
  P.cable=rod(.0045,M_cable,g);P.pul=V(0,SROW.pulY,SROW.pulZ);
  P.rest=()=>{P.h.position.set(0,.36,SROW.footZ+.06);P.h.quaternion.identity();setRod(P.cable,P.pul,P.h.position.clone().add(V(0,0,.13)));P.stackTop.position.y=0;};P.rest();return P;}
// single cable column: tower in front of the user's spot, pulley slides on the rail; straight bar, rope or handle
const CCOL={z:-10.88,railZ:-11.06};
function buildCableCol(g){const P={};box(.55,2.4,.4,M.black,0,1.2,CCOL.z,g);box(.06,2.1,.06,M.steel,0,1.15,CCOL.railZ,g);box(.9,.05,.4,M.black,0,.025,CCOL.z,g);
  P.car=new THREE.Group();g.add(P.car);box(.12,.16,.08,M.red,0,0,0,P.car);P.pul=new THREE.Group();P.car.add(P.pul);P.pul.position.z=-.05;cyl(.045,.04,M.steel,0,0,0,'x',P.pul,16);
  P.car.position.set(0,2.0,CCOL.railZ);P.stackTop=stack(g,0,.12,CCOL.z+.06,9);
  // attachments: straight bar, rope, single D-handle (only the one in use is visible)
  P.sbar=new THREE.Group();g.add(P.sbar);cyl(.014,.62,M.chrome,0,0,0,'x',P.sbar,12);for(const s of[1,-1])cyl(.016,.16,M.black,s*.2,0,0,'x',P.sbar,10);
  P.rope=new THREE.Group();g.add(P.rope);P.ropeL=rod(.014,M_cable,P.rope);P.ropeR=rod(.014,M_cable,P.rope);
  for(const s of[1,-1]){const k=new THREE.Mesh(new THREE.SphereGeometry(.025,10,8),M.black);k.name='knob'+s;P.rope.add(k);}
  P.dh=new THREE.Group();g.add(P.dh);cyl(.018,.13,M.red,0,0,0,'x',P.dh,10);
  P.cable=rod(.0045,M_cable,g);P.att='sbar';
  P.pulW=()=>{const p=V();P.pul.getWorldPosition(p);return g.worldToLocal(p);};
  P.setPulley=y=>{P.car.position.y=y;P.car.updateMatrixWorld(true);};
  P.use=a=>{P.att=a;P.sbar.visible=a==='sbar';P.rope.visible=a==='rope';P.dh.visible=a==='dh';};
  // rope ends at the hands: centre clip at c, knobs at l and r
  P.ropeAt=(c,l,r)=>{P.rope.position.copy(c);P.rope.quaternion.identity();setRod(P.ropeL,V(),V().subVectors(l,c));setRod(P.ropeR,V(),V().subVectors(r,c));
    P.rope.children.forEach(k=>{if(k.name==='knob1')k.position.subVectors(l,c);if(k.name==='knob-1')k.position.subVectors(r,c);});};
  P.attPos=()=>P.att==='sbar'?P.sbar.position:P.att==='rope'?P.rope.position:P.dh.position;
  P.hang=V(0,-.12,-.08); // where an attachment hangs from the pulley at rest (clear of the tower's face)
  P.rest=()=>{const p=P.pulW().add(P.hang);for(const o of[P.sbar,P.rope,P.dh]){o.position.copy(p);o.quaternion.identity();}const dn=Math.min(.25,Math.max(0,p.y-.04)),fw=Math.sqrt(.25*.25-dn*dn);P.ropeAt(p,p.clone().add(V(.04,-dn,-fw)),p.clone().add(V(-.04,-dn,-fw)));setRod(P.cable,P.pulW(),p);P.stackTop.position.y=0;};
  P.restPos=()=>P.pulW().add(P.hang);
  P.cableTo=p=>setRod(P.cable,P.pulW(),p);
  P.use('sbar');P.rest();return P;}
// lifting platform with a loaded barbell on the floor (plates radius .225 → bar centre at .225)
const PLAT={barY:.24,barZ:-11.86};
function buildPlatform(g,o={}){const P={};const pl=box(2.4,.015,2.4,new THREE.MeshStandardMaterial({color:0x5b4632,roughness:.8}),0,.0075,-12,g,false);pl.receiveShadow=true;pl.userData.walkable=true;
  P.bar=barbell(true,M.rubberPlate);g.add(P.bar);P.bar.position.set(0,PLAT.barY,PLAT.barZ);P.home=P.bar.position.clone();
  // nobody walks across the loaded bar: its resting footprint blocks paths (people go round the plates)
  const a=g.localToWorld(V(-1.15,0,PLAT.barZ-.25)),b=g.localToWorld(V(1.15,0,PLAT.barZ+.25));NAV.extra.push([Math.min(a.x,b.x),Math.max(a.x,b.x),Math.min(a.z,b.z),Math.max(a.z,b.z)]);return P;}
// an empty spot on the floor (standing dumbbell exercises)
function buildSpot(g){return {};}

// ---------------------------------------------------------------- back: poses, getting on and off, the 8 exercises
// a mistake: button text, quiz option, what's wrong, right now, later, fix (+ pose parameters and the measurement)
function MS(btn,short,wrong,now,later,fix,o={}){return {btn,tag:o.tag||btn,short,wrong,now,later,fix,warn:o.warn||btn,...o};}
function steps4(a){return a.map(s=>Array.isArray(s)?s:[s,'']);}
// hold a straight bar (along canonical x) at centre ct with half-grip gx
function barHands(c,ct,gx,o){for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().add(V(s*gx,0,0)),{hd:o.hd,pn:o.pn,pole:typeof o.pole==='function'?o.pole(s):o.pole.clone().multiply(V(s,1,1)),curl:o.curl,follow:o.follow});}
const ARM_HANG=()=>(D.arm+D.fore)*.997+.075*D.s;

// ---- pull-up
function posePullup(c,F,b,u,P){const lo=F.noHang?.3:0,hi=F.half?.72:1;const uu=lerp(lo,hi,clamp(u,0,1));const gx=.29*D.s;
  const yHang=PU_Y-.1-.05-Math.sqrt(Math.pow((D.arm+D.fore)*.995,2)-Math.pow(gx-D.shx,2)),yTop=PU_Y-.02;
  const kip=F.kip&&b.phase===2?Math.sin(Math.PI*b.k):F.kip&&b.phase===1?-.5*Math.sin(Math.PI*b.k):0;
  const lean=(8*smooth(uu)-kip*12)*DEG;const S=V(0,lerp(yHang,yTop,smooth(uu)),PU_Z+lerp(-.01,-.075,smooth(uu))+kip*.05);
  const q=rootFromAxes(V(0,Math.cos(lean),-Math.sin(lean)),V(0,Math.sin(lean),Math.cos(lean)));
  setRoot(c,q,S.clone().sub(D.sh.clone().sub(D.hips).applyQuaternion(q)));resetRest(c);spineBend(c,0,{neck:-.1*uu,head:-.1*uu});
  clav(c,{shrug:lerp(.3,-.04,smooth(Math.min(1,uu*2.5)))});c.root.updateMatrixWorld(true);
  const T=pelvisAxes(c);const kick=kip*.9;
  for(const s of[1,-1]){const side=sideOf(s);const ta=T.U.clone().negate().addScaledVector(T.F,.2+kick).addScaledVector(T.L,s*.02);const sa=T.U.clone().negate().addScaledVector(T.F,-.75+kick*.6).addScaledVector(T.L,-s*.06);legDir(c,side,ta,sa,T.F.clone().addScaledVector(T.U,-.4));}
  barHands(c,V(0,PU_Y,PU_Z),gx,{hd:V(0,1,.15),pn:V(0,0,1),pole:V(.6,-.7,.45)});c._S=S;return u;}
// ---- lat pulldown
function poseLatPulldown(c,F,b,u,P){const lo=F.half?.18:0;const uu=lerp(lo,1,clamp(u,0,1));const lean=(15+(F.row?30*smooth(uu):0))*DEG;
  setRoot(c,qX(-lean),V(0,LPD.seatY+.1*D.s,LPD.seatZ));resetRest(c);spineBend(c,F.neck?.22*uu:0,{neck:F.neck?.35*uu:-.05,head:F.neck?.1:0});
  clav(c,{shrug:lerp(.28,-.03,smooth(Math.min(1,uu*2)))});c.root.updateMatrixWorld(true);
  for(const s of[1,-1])legTo(c,sideOf(s),V(s*.17,D.ankY,LPD.seatZ+.42),V(s*.15,.4,1));
  const [sl,sr]=shoulders(c),S=sl.clone().add(sr).multiplyScalar(.5);const T=torsoAxes(c);const gx=.3*D.s;
  const top=V(0,S.y+Math.sqrt(Math.pow((D.arm+D.fore)*.97,2)-Math.pow(gx-D.shx,2))+.07,S.z+.12);
  const bot=F.neck?S.clone().addScaledVector(T.U,.1).addScaledVector(T.F,-.09):S.clone().addScaledVector(T.U,.05).addScaledVector(T.F,.15);
  if(F.row)bot.copy(wpos(c.bones.Spine1)).addScaledVector(T.F,.17);
  const k=smooth(uu),ct=V(0,lerp(top.y,bot.y,k),lerp(top.z,bot.z,Math.pow(k,1.6)));
  barHands(c,ct,gx,{hd:V(0,1,0),pn:V(0,0,1),pole:V(.7,-.9,-.15)});
  P.bar.position.copy(ct);P.bar.quaternion.identity();setRod(P.cable,P.pul,ct);P.stackTop.position.y=.35*(top.y-ct.y)/Math.max(.1,top.y-bot.y);c._S=S;return u;}
// ---- seated cable row
function poseSeatedRow(c,F,b,u,P){const hi=F.shortR?.55:1;const uu=clamp(u,0,1)*hi;
  const lean=(F.rock?lerp(30,-18,smooth(uu)):lerp(6,0,smooth(uu)))*DEG;const hip=V(0,SROW.seatY+.1*D.s,-12.42);
  setRoot(c,qX(lean),hip);resetRest(c);clav(c,{shrug:F.shrug?.03+.48*smooth(uu):.03,protract:.12*(1-smooth(uu))});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const side=sideOf(s);const A=V(s*.13,.33,SROW.footZ-.09);legTo(c,side,A,V(s*.1,1,.3));footTo(c,side,A.clone().add(V(0,.14,.05)));}
  const [sl,sr]=shoulders(c),S=sl.clone().add(sr).multiplyScalar(.5);const T=torsoAxes(c);
  const far=V(0,S.y-.16,S.z+Math.sqrt(Math.pow((D.arm+D.fore)*.96,2)-.16*.16)+.06);const near=wpos(c.bones.Spine).addScaledVector(T.F,.2).addScaledVector(T.U,.04);near.y=Math.max(near.y,hip.y+.12);
  const ct=far.clone().lerp(near,smooth(uu));
  for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().add(V(s*.07,0,0)),{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.25,-.6,-1)});
  P.h.position.copy(ct);P.h.quaternion.identity();setRod(P.cable,P.pul,ct.clone().add(V(0,0,.13)));P.stackTop.position.y=.3*smooth(uu);c._S=S;c._near=near;return u;}
// ---- barbell bent-over row (bar lives on the platform)
function poseBarRow(c,F,b,u,P){const uu=clamp(u,0,1);const hinge=F.heave?45-25*smooth(uu):45;
  standPose(c,{z:-12.02,hinge,drop:.07,back:.1,round:F.round?46:0,arms:'none',stance:.13,look:12});
  const T=torsoAxes(c);const [sl,sr]=shoulders(c),S=sl.clone().add(sr).multiplyScalar(.5);
  const hang=V(0,S.y-ARM_HANG(),S.z+.02);const ribs=F.flare?wpos(c.bones.Spine2).addScaledVector(T.F,.17).addScaledVector(T.U,.05):wpos(c.bones.Spine1).addScaledVector(T.F,.16).addScaledVector(T.U,-.04);
  const k=smooth(uu),ct=hang.clone().lerp(ribs,k);ct.z+=.05*Math.sin(Math.PI*k);
  const f=(F.flare?82:35)*DEG;barHands(c,ct,.27*D.s,{hd:V(0,-1,-.15),pn:V(0,0,-1),pole:V(Math.sin(f),.35,-Math.cos(f))});
  P.bar.position.copy(ct);P.bar.quaternion.identity();c._S=S;return u;}
// ---- deadlift: the bar path is vertical; hips are placed so straight arms reach the bar
function deadliftPose(c,P,p,o={}){const barZ=PLAT.barZ;const top=D.sh.y-ARM_HANG()+.03;let yb,th;
  if(o.hipsFirst&&p<.3){const k=smooth(p/.3);th=68+17*k;yb=PLAT.barY+.02*k;}
  else{const pp=o.hipsFirst?(p-.3)/.7:p;yb=lerp(PLAT.barY,top,smooth(pp));const kp=clamp((yb-PLAT.barY)/(.52-PLAT.barY),0,1);th=yb<.52?lerp(o.hipsFirst?85:68,50,kp):lerp(50,0,smooth(clamp((yb-.52)/(top-.52),0,1)));}
  const front=(o.drift?.12*Math.sin(Math.PI*clamp(p*1.1,0,1)):0)+.035*(1-p);const bz=barZ+(o.drift?.12*Math.sin(Math.PI*clamp(p*1.1,0,1)):0);
  const S=V(0,yb+ARM_HANG()-.01,barZ+front);const Lt=D.sh.clone().sub(D.hips);const hip=S.clone().sub(Lt.clone().applyQuaternion(qX(th*DEG)));
  standPose(c,{z:barZ-.06,hinge:th,drop:D.hips.y-hip.y,back:(barZ-.06)-hip.z,round:o.round?46:0,arms:'none',stance:.16*D.s,toe:14,look:Math.min(th,40)});
  barHands(c,V(0,yb,bz),.28*D.s,{hd:V(0,-1,-.1),pn:V(0,0,-1),pole:V(.25,.2,-1)});
  if(P&&P.bar){P.bar.position.set(0,yb,bz);P.bar.quaternion.identity();}return {yb,th};}
function poseDeadlift(c,F,b,u,P){const r=deadliftPose(c,P,clamp(u,0,1),{hipsFirst:F.hipsFirst,round:F.round,drift:F.drift});c._dl=r;return u;}
// ---- one-arm dumbbell row: left knee and hand on the bench, right foot on the floor, right arm rows
function poseDBRow(c,F,b,u,P){const uu=clamp(u,0,1);const lo=F.shortR?.13:0;const k=smooth(lerp(lo,1,uu));
  const hip=V(.17,.92,-11.68),sh=V(.19,.95,-12.2);/* hips over the knee on the pad (thigh upright), back flat */const twist=(F.twist?28*k:0)*DEG;
  const fwd=V().subVectors(sh,hip).normalize();const q=rootFromAxes(fwd,V(0,-1,0));const q2=new THREE.Quaternion().setFromAxisAngle(fwd,-twist).multiply(q);
  setRoot(c,q2,hip);resetRest(c);spineBend(c,0,{neck:-.5,head:-.2});clav(c,{shrug:.02});c.root.updateMatrixWorld(true);
  // left leg kneels on the bench, right foot on the floor beside it (face down, head toward −z: lifter's left is world −x)
  legTo(c,'Left',V(.02,BENCH_TOP+.075,-11.28),V(0,-1,-.6));footTo(c,'Left',V(.02,BENCH_TOP+.02,-11.12));/* shin along the pad, foot off its end */
  legTo(c,'Right',V(.43,D.ankY,-11.52),V(.3,.2,-1));footTo(c,'Right',V(.45,.02,-11.68));
  armTo(c,'Left',V(.03,BENCH_TOP+.01,-12.43),{hd:V(0,0,-1),pn:V(0,-1,0),pole:V(-.4,.2,1),curl:.2});
  const S=wpos(c.bones.RightArm);const hang=V(S.x+.02,S.y-ARM_HANG(),S.z+.02);const top=wpos(c.bones.Hips).add(V(.12,.16,-.12));
  const flare=F.flare?V(S.x+.24,S.y-.08,S.z+.05):top;const end=F.flare?flare:top;
  const ct=hang.clone().lerp(end,k);const pole=F.flare?V(1,.6,0):V(.25,.4,1);
  armTo(c,'Right',ct,{hd:V(0,-1,0),pn:V(-1,0,0),pole});
  if(P.db&&P.db[1]){P.db[1].position.copy(ct);P.db[1].quaternion.setFromAxisAngle(V(0,1,0),Math.PI/2);}c._S=S;return u;}
// ---- straight-arm pulldown at the cable column (straight bar on the top pulley)
function poseStraightArm(c,F,b,u,P){const uu=clamp(u,0,1);const k=uu; // the rep clock already eases u (smoothing it twice made the sweep snap through the middle)P.use('sbar');P.setPulley(1.95);
  const hinge=F.upright?3:(F.bob?25+15*Math.sin(Math.PI*k):25);
  standPose(c,{z:-11.8,hinge,drop:.05,back:.06,arms:'none',stance:.13,look:10});clav(c,{shrug:lerp(.1,-.04,k)});c.root.updateMatrixWorld(true);
  const T=torsoAxes(c);const [sl,sr]=shoulders(c),S=sl.clone().add(sr).multiplyScalar(.5);const el=F.bend?lerp(165,85,k):165;
  const flex=lerp(165,F.upright?32:4,k);const dir=tdir(T,1,flex,0);const L=elbowD(el)+.07*D.s;
  const ct=S.clone().addScaledVector(dir,L);
  barHands(c,ct,.2*D.s,{hd:dir.clone(),pn:T.F.clone().negate(),pole:s=>T.F.clone().multiplyScalar(-1).addScaledVector(T.L,s*.3).addScaledVector(T.U,-.3)});
  P.sbar.position.copy(ct);P.sbar.quaternion.identity();P.cableTo(ct);P.stackTop.position.y=.3*k;c._S=S;return u;}
// ---- dumbbell shrug (standing by the rack)
function poseShrug(c,F,b,u,P){const uu=clamp(u,0,1);const k=smooth(uu);
  standPose(c,{z:-12,arms:'none',look:0});const roll=F.roll?Math.sin(Math.PI*2*uu)*.25:0;
  clav(c,{shrug:.0+.42*k,protract:roll});c.root.updateMatrixWorld(true);
  if(F.head){c.bones.Spine2.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),.12*k));c.bones.Neck.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),1.6*k));c.bones.Head.quaternion.multiply(_q.setFromAxisAngle(V(1,0,0),-1.5*k));c.root.updateMatrixWorld(true);}
  const T=torsoAxes(c);
  for(const s of[1,-1]){const sd=sideOf(s);const ua=V(0,-1,0).addScaledVector(T.L,s*.17);const el=F.curl?40*k:0;const fa=ua.clone().applyAxisAngle(T.L,-s*0).applyAxisAngle(T.L,el*DEG*s*0).add(T.F.clone().multiplyScalar(Math.sin(el*DEG)*1.4)).normalize();
    const r=armDir(c,sd,ua,fa,T.L.clone().multiplyScalar(-s),{hd:fa});if(P.db){const i=s>0?0:1;const d=P.db[i];if(d){d.position.copy(r.contact);d.quaternion.setFromUnitVectors(V(1,0,0),T.F);}}}
  c._acr=wpos(c.bones.LeftArm);return u;}

// ---- measurements for the back
Object.assign(MEAS,{
  hipSwing:{pick:'range',get:c=>{const p=V().subVectors(wpos(c.bones.Neck),wpos(c.bones.Hips)).normalize(),t=V().subVectors(wpos(c.bones.LeftLeg),wpos(c.bones.LeftUpLeg)).normalize();return 180-Math.acos(clamp(p.dot(t),-1,1))/DEG;},fmt:v=>v<12?'body stays still ('+Math.round(v)+'° hip swing)':'hips swing '+Math.round(v)+'° each rep'},
  chinBar:{at:'top',get:c=>(wpos(c.bones.Head).y-.03-PU_Y)*100,fmt:v=>v>=0?'chin clears the bar':'chin stops '+Math.round(-v)+' cm below the bar'},
  elbowBottom:{at:'bottom',get:c=>avg2(s=>elbowAng(c,s)),fmt:v=>v>=160?'arms straight at the bottom ('+Math.round(v)+'°)':'elbows stay bent at '+Math.round(v)+'°'},
  elbowTop:{at:'top',get:c=>avg2(s=>elbowAng(c,s)),fmt:v=>v>=160?'arms straight at the top ('+Math.round(v)+'°)':'elbows stay bent at '+Math.round(v)+'°'},
  leanRange:{pick:'range',get:c=>torsoLean(c),fmt:v=>v<10?'torso still (moves '+Math.round(v)+'°)':'torso swings '+Math.round(v)+'° each rep'},
  barNeck:{at:'top',get:(c,x)=>{const z=x.P.bar.position.z,hz=wpos(c.bones.Head).z;return (z-hz)*100;},fmt:v=>v>4?'bar comes down in front of the face':'bar goes behind the head'},
  lumbar:{pick:'max',get:c=>{const a=V().subVectors(wpos(c.bones.Spine1),wpos(c.bones.Hips)).normalize(),b2=V().subVectors(wpos(c.bones.Neck),wpos(c.bones.Spine2)).normalize();return Math.acos(clamp(a.dot(b2),-1,1))/DEG;},fmt:v=>v<12?'back stays flat':'lower back rounds '+Math.round(v)+'°'},
  rowFlare:{at:'top',get:c=>flareDeg(c,'Left'),fmt:v=>v<55?'elbows '+Math.round(v)+'° from the body':'elbows flared to '+Math.round(v)+'°'},
  shoulderRot:{pick:'max',get:c=>{const d=V().subVectors(wpos(c.bones.LeftArm),wpos(c.bones.RightArm));return Math.abs(Math.asin(clamp(d.y/d.length(),-1,1))/DEG);},fmt:v=>v<12?'shoulders square to the floor':'shoulders twist '+Math.round(v)+'°'},
  dbRowFlare:{at:'top',get:c=>flareDeg(c,'Right'),fmt:v=>v<50?'elbow tight to the body ('+Math.round(v)+'°)':'elbow flared to '+Math.round(v)+'°'},
  dbElbowBottom:{at:'bottom',get:c=>elbowAng(c,'Right'),fmt:v=>v>=168?'arm hangs straight ('+Math.round(v)+'°)':'arm stays bent at '+Math.round(v)+'°'},
  shrugRise:{pick:'range',get:c=>{const up=upOf(c);return (V().subVectors(wpos(c.bones.LeftArm),wpos(c.bones.Neck)).dot(up))*100;},fmt:v=>v<2?'shoulders stay down':'shoulders rise '+Math.round(v)+' cm'},
  handleBelly:{at:'top',get:(c,x)=>Math.max(0,(x.P.h.position.distanceTo(c._near))*100),fmt:v=>v<6?'handle reaches the belly':'handle stops '+Math.round(v)+' cm short'},
  elbowRange:{pick:'range',get:c=>avg2(s=>elbowAng(c,s)),fmt:v=>v<12?'elbows stay fixed (change '+Math.round(v)+'°)':'elbows bend '+Math.round(v)+'°'},
  hinge:{at:'top',get:c=>torsoLean(c),fmt:v=>v>15?'leaning forward '+Math.round(v)+'°':'standing upright ('+Math.round(v)+'°)'},
  dlLift:{at:'knee',pick:'max',get:c=>c._dl&&c._dl.yb<.55?c._dl.th:0,fmt:v=>v<72?'chest and hips rise together':'hips rise first: torso tips to '+Math.round(v)+'°'},
  barDrift:{pick:'max',get:(c,x)=>(x.P.bar.position.z-PLAT.barZ)*100,fmt:v=>v<4?'bar stays over the middle of the foot':'bar drifts '+Math.round(v)+' cm in front of the feet'},
  acrRoll:{pick:'range',get:c=>{const f=venOf(c);return wpos(c.bones.LeftArm).dot(f)*100;},fmt:v=>v<2?'shoulders move straight up and down':'shoulders roll '+Math.round(v)+' cm forward and back'},
  earFwd:{pick:'max',get:c=>{const f=venOf(c);return (wpos(c.bones.Head).dot(f)-wpos(c.bones.LeftArm).dot(f))*100;},fmt:v=>v<4?'chin level, head over the shoulders':'head pokes '+Math.round(v)+' cm forward'},
});

// ---- getting on and off
// arms raised overhead (stepping in under the pull-up bar between the dip handles)
function armsUp(c){const T=torsoAxes(c);for(const s of[1,-1]){const ua=T.U.clone().addScaledVector(T.L,s*.22).addScaledVector(T.F,.1),fa=T.U.clone().addScaledVector(T.L,s*.1).addScaledVector(T.F,.08);
  armDir(c,sideOf(s),ua,fa,T.F.clone().negate(),{hd:fa,curl:.3});}}
const HANG_GRIP={hd:V(0,1,.15),pn:V(0,0,1),pole:V(.6,-.7,.45)};
// back in under the bar between the dip handles with the arms raised (clear of the handles), grip, a small jump to hang
ENTRY.hang={pre:[0,-10.9],face:0,
  enter:(st,e)=>[{walk:[0,-11.2],back:true,d:1.0,soft:1},
    {d:1.3,pose:c=>{standPose(c,{z:-11.2,arms:'none'});armsUp(c);}},
    ...stepPoses(-11.2,-12.08,0,c=>armsUp(c),{d:1.6}),
    {d:.6,pose:c=>{standPose(c,{z:-12.08,arms:'none'});barHands(c,V(0,PU_Y,PU_Z),.29*D.s,HANG_GRIP);}},
    {call:()=>sayFor('Small jump, then hang still.',2.2)},{d:.55,pose:exP(0,1)},{d:1.1,anim:exFrom(0,1)}],
  leave:(st,e)=>[...exTo(0,1.2),{d:.45,pose:c=>{standPose(c,{z:-12.08,drop:.12,arms:'none'});barHands(c,V(0,PU_Y,PU_Z),.29*D.s,HANG_GRIP);}},
    {d:.6,pose:c=>{standPose(c,{z:-12.08,arms:'none'});armsUp(c);}},
    ...stepPoses(-12.08,-11.2,0,c=>armsUp(c),{d:1.6}),
    {d:1.2,pose:c=>standPose(c,{z:-11.2})},{walk:[0,-10.9],d:.8}]};
// lat pulldown: sit sideways on the seat, swing the legs in under the thigh pads, reach up for the bar where it rests, pull
const LPD_GRIP={hd:V(0,1,0),pn:V(0,0,1),pole:V(.7,-.9,-.15)};
const LPD_FEET=[[.17,LPD.seatZ+.42],[-.17,LPD.seatZ+.42]];
const LPD_SIDE=[[.42,LPD.sitZ-.15],[.42,LPD.sitZ+.15]];
const lpdSit=(h,feet,arms)=>c=>sitAt(c,{h,z:LPD.sitZ,y:LPD.seatY+.1*D.s,feet,out:.15,lean:2,arms});
// halfway round: knees low under the pads, feet on the floor
const LPD_MID=()=>{const h=Math.PI/4,f=V(Math.sin(h),0,Math.cos(h)),l=V(Math.cos(h),0,-Math.sin(h));return [1,-1].map(s=>{const p=f.clone().multiplyScalar(.46).addScaledVector(l,s*.15);return [p.x,LPD.sitZ+p.z];});};
function lpdReach(c){lpdSit(0,LPD_FEET,'none')(c);const R=lpdRest();barHands(c,R,.3*D.s,LPD_GRIP);ST.P.bar.position.copy(R);}
function lpdCable(c){const P=ST.P;setRod(P.cable,P.pul,P.bar.position);P.stackTop.position.y=clamp((lpdRest().y-P.bar.position.y)*.45,0,.35);}
ENTRY.pulldown={pre:[.9,LPD.sitZ],face:Math.PI/2,
  enter:(st,e)=>[{d:.8,anim:settle(c=>standPose(c,{x:.66,z:LPD.sitZ,h:Math.PI/2}),{step:1,bend:1})},{d:.8,anim:settle(c=>standPose(c,{x:.42,z:LPD.sitZ,h:Math.PI/2}),{step:1,bend:1})},
    {d:1.1,pose:lpdSit(Math.PI/2,LPD_SIDE),props:pinFeet(st,LPD_SIDE,{h:Math.PI/2,out:.15})},
    {d:.9,...liftFeet(st,lpdSit(Math.PI/4,LPD_MID()),{lift:.05})},
    {d:.9,...liftFeet(st,lpdSit(0,LPD_FEET),{lift:.05})},
    {d:1.0,pose:lpdReach},
    carryWith(1.0,exP(0,1),()=>st.P.bar,lpdCable),
    {d:1.1,anim:exFrom(0,1)}],
  leave:(st,e)=>[carryWith(.8,exP(0,1),()=>st.P.bar,lpdCable),
    carryWith(1.0,lpdReach,()=>st.P.bar,lpdCable),{call:()=>st.P.rest()},
    {d:1.2,pose:lpdSit(0,LPD_FEET)},
    {d:.9,...liftFeet(st,lpdSit(Math.PI/4,LPD_MID()),{lift:.05})},
    {d:.9,...liftFeet(st,lpdSit(Math.PI/2,LPD_SIDE),{lift:.05})},
    {d:1.0,pose:c=>standPose(c,{x:.42,z:LPD.sitZ,h:Math.PI/2}),props:pinFeet(st,LPD_SIDE,{h:Math.PI/2,out:.15})},
    {walk:[.95,LPD.sitZ],d:.9}]};
// seated row: sit sideways on the low seat, swing the legs up onto the foot plate, take the handle, straighten the arms
const ROW_SIDE_FEET=[[.38,-12.56],[.38,-12.28]]; // facing +x the left foot is on the −z side
const ROW_SIT={h:Math.PI/2,z:-12.42,y:SROW.seatY+.1*D.s,feet:ROW_SIDE_FEET,out:.2};
function rowTuck(c){setRoot(c,qX(8*DEG),V(0,SROW.seatY+.1*D.s,-12.42));resetRest(c);clav(c,{shrug:.03});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);const A=V(s*.13,SROW.seatY+.1,-12.0);legTo(c,sd,A,V(s*.1,1,.2));footTo(c,sd,A.clone().add(V(0,-.06,.1)));
    const K=wpos(c.bones[sd+'Leg']);armTo(c,sd,K.add(V(s*.04,.04,-.02)),{hd:V(0,-.4,1),pn:V(0,-1,0),pole:V(s*.6,-.3,-.6),curl:.6});}}
// legs on the plate, hands on the handle where it rests (k=0) ... arms straight out at the start of a rep (k=1)
function rowReach(c,P,k){poseSeatedRow(c,FORMS.good,{phase:1,k:0},0,P);const S=c._S;const far=V(0,S.y-.16,S.z+Math.sqrt(Math.pow((D.arm+D.fore)*.96,2)-.16*.16)+.06);
  const rest=V(0,.36,SROW.footZ+.06);const ct=rest.lerp(far,smooth(k));
  for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().add(V(s*.07,0,0)),{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.25,-.6,-1)});
  P.h.position.copy(ct);P.h.quaternion.identity();setRod(P.cable,P.pul,ct.clone().add(V(0,0,.13)));P.stackTop.position.y=0;}
ENTRY.seatRow={pre:[.85,-12.42],face:Math.PI/2,
  enter:(st,e)=>[{d:1.0,anim:settle(c=>standPose(c,{x:.63,z:-12.42,h:Math.PI/2}),{step:1,bend:1})},{d:.8,anim:settle(c=>standPose(c,{x:.42,z:-12.42,h:Math.PI/2}),{step:1,bend:1})},
    {d:1.0,pose:c=>sitAt(c,ROW_SIT),props:pinFeet(st,ROW_SIDE_FEET,{h:Math.PI/2,out:.2})},
    {d:1.3,...liftFeet(st,c=>rowTuck(c),{lift:.3})},
    {d:.9,pose:c=>rowReach(c,st.P,0)},
    {d:1.0,anim:(c,k)=>rowReach(c,st.P,k)},
    {d:1.1,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.8,pose:exP(0,1)},
    {d:1.0,anim:(c,k)=>rowReach(c,st.P,1-k)},{call:()=>st.P.rest()},
    {d:1.0,pose:c=>rowTuck(c)},
    {d:1.3,...liftFeet(st,c=>sitAt(c,ROW_SIT),{lift:.3})},
    {d:.8,pose:c=>standPose(c,{x:.42,z:-12.42,h:Math.PI/2}),props:pinFeet(st,ROW_SIDE_FEET,{h:Math.PI/2,out:.2})},{walk:[.85,-12.42],d:.8}]};
// a loaded bar on the floor: walk up, hinge down, grip, lift it (rows and RDLs start standing with the bar)
const DL_FEET=()=>[[.16*D.s,-11.9],[-.16*D.s,-11.9]];
ENTRY.floorBar={pre:[0,-12.75],face:0,
  enter:(st,e)=>{const first=e.startFromFloor?[]:[{d:1.6,anim:(c,k)=>deadliftPose(c,st.P,smooth(k))}];return [{walk:[0,-11.92],d:1.2,soft:1},
    {d:1.2,pose:c=>deadliftPose(c,st.P,0),props:pinFeet(st,DL_FEET())},{call:()=>e.coachIn&&sayFor(e.coachIn,2.6)},...first,...(e.startFromFloor?[{d:1.4,anim:exFrom(0,1)}]:[{d:1.0,pose:exP(1,3)}])];},
  leave:(st,e)=>{const pin=pinFeet(st,[[.11*D.s,-11.9],[-.11*D.s,-11.9]]);return [...(e.startFromFloor?exTo(0,1.6):[carryWith(.8,c=>deadliftPose(c,st.P,1),()=>st.P.bar),{d:1.6,anim:(c,k)=>deadliftPose(c,st.P,1-smooth(k))}]),
    {d:1.0,pose:c=>standPose(c,{z:-11.92}),props:(c,k)=>{if(k>.1)st.P.bar.position.copy(st.P.home);pin(c,k);}},{walk:[0,-12.75],back:true,d:1.4}];}};
// one-arm row on the flat dumbbell bench (one dumbbell in the right hand)
// bent over beside the bench, left hand on the pad, right arm hanging with the dumbbell, both feet still on the floor
function dbRowLean(c,P){standPose(c,{x:.4,z:-11.5,h:Math.PI,hinge:70,drop:.2,back:.08,feet:[[.2,-.1],[-.15,.05]],arms:'none',look:20}); // beside the bench, left leg clear of its end
  armTo(c,'Left',V(.03,BENCH_TOP+.01,-12.25),{hd:V(0,0,-1),pn:V(0,-1,0),pole:V(-.4,.2,1),curl:.2});
  const S=wpos(c.bones.RightArm);armTo(c,'Right',V(S.x+.02,S.y-ARM_HANG(),S.z+.02),{hd:V(0,-1,0),pn:V(-1,0,0),pole:V(.25,.4,1)});}
ENTRY.dbRowBench={pre:[.8,-11.35],face:Math.PI,
  enter:(st,e)=>[{call:c=>{c.carry=null;}},{d:1.2,anim:settle(c=>standDB(c,{x:.4,z:-11.55,h:Math.PI}),{step:1,bend:1})},
    {d:1.1,pose:c=>dbRowLean(c,st.P)},
    {d:1.4,...liftFeet(st,c=>{poseDBRow(c,FORMS.good,{phase:1,k:0},0,st.P);},{lift:.3,sides:['Left']})},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[...exTo(0,1.1),{d:1.4,...liftFeet(st,c=>dbRowLean(c,st.P),{lift:.3,sides:['Left']})},
    {d:1.0,pose:c=>standDB(c,{x:.4,z:-11.55,h:Math.PI})},{call:c=>{c.carry='db1';}},{walk:[.95,-11.3],d:.8}]};
// cable column: set the pulley, clip the attachment, step back into place
// the hand goes to the carriage: on tiptoe for a high carriage, in a deep crouch further back for a low one
function colReachB(c,P,y,zFix){const t=clamp((1.2-y)/.95,0,1),tip=.07*clamp((y-1.55)/.3,0,1);const z=zFix??lerp(-11.35,-11.58,t);
  standPose(c,{z,drop:.55*t,hinge:45*t+8*(1-t)*clamp((y-1.4)/.4,0,1),back:.08*t,arms:'none',heel:[tip,tip],look:y>1.4?-25:20});armsHang(c,0,-1);
  const p=P.car.position.clone().add(V(.06,0,-.02));armTo(c,'Left',p,{hd:V(0,0,1),pn:V(-1,0,0),pole:V(.5,-1,0)});}
function colAdjust(y,att,face=0){const t=clamp((1.2-y)/.95,0,1),z=lerp(-11.35,-11.58,t);return [
  {walk:[0,-11.6],d:.9,soft:1},
  {d:1.5,...liftFeet(ST,c=>colReachB(c,ST.P,ST.P.car.position.y,z))},
  {d:1.1,anim:(c,k)=>{const P=ST.P;P._y0=P._y0??P.car.position.y;P.setPulley(lerp(P._y0,y,smooth(k)));P.use(att);P.rest();colReachB(c,P,P.car.position.y,z);if(k>=1)P._y0=undefined;}},
  {d:1.2,pose:c=>standPose(c,{z})}];}
ENTRY.cableCol={pre:[0,-12.35],face:0,
  enter:(st,e)=>[...colAdjust(e.pulley,e.att),{walk:[0,e.standZ??-11.62],back:true,d:.8,soft:1},{d:1.4,pose:exP(0,1)},{d:1.4,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.9,pose:exP(0,1)},{d:1.2,pose:c=>standPose(c,{z:e.standZ??-11.62}),props:(c,k)=>{const P=st.P;const p=P.restPos();P.attPos().lerp(p,smooth(k));P.cableTo(P.attPos());if(k>=1)P.rest();}},{walk:[0,-12.35],back:true,d:1.0}]};
// standing with dumbbells (the spot by the rack)
ENTRY.dbStand={pre:[0,-12.4],face:0,
  enter:(st,e)=>[{walk:[0,-12],d:.8,soft:1},{call:c=>{c.carry=null;}},{d:.7,pose:c=>standDB(c,{z:-12})},{d:.8,pose:exP(e.startU??0,1)},{d:.9,anim:exFrom(e.startU??0,1)}],
  leave:(st,e)=>[{d:.8,pose:c=>standDB(c,{z:-12})},{call:c=>{c.carry='db';}},{walk:[0,-12.4],back:true,d:.7}]};

// ---- the exercises
const BACK_SPOT={side:{p:[-1.5,-11.6],h:Math.PI/2},sideR:{p:[1.5,-11.6],h:-Math.PI/2},front:{p:[0,-10.0],h:Math.PI}};
defEx('pullup',{group:'back',name:'Pull-up',eq:'Bodyweight',part:'Lats',station:'tower',entry:'hang',kind:'pull',pose:posePullup,
  quip:'Chin over the bar. Gravity has opinions; ignore them.',
  mus:{lats:[1,'m'],midBack:[.55,'h'],biLong:[.75,'h'],biShort:[.75,'h'],deltR:[.55,'h'],trapU:[.2,'h'],forearm:[.6,'h']},
  labels:[['Lats','lats','m'],['Biceps','biLong','h'],['Lower traps','midBack','h']],center:V(0,1.55,-12.05),cam:'sideL',coachSpot:{p:[-1.35,-11.2],h:Math.PI/2+.4},
  steps:steps4([['Lower slowly','2 sec'],['Full stretch','arms straight'],['Pull chin over bar','elbows down'],['Squeeze','chin above the bar']]),
  stepText:['Lower yourself slowly, about 2 seconds, keeping the legs still.','Hang with straight arms. Let the shoulder blades rise: this is the lats’ stretch.','Pull the shoulders down first, then drive the elbows down until your chin passes the bar.','Chin over the bar, chest close to it. Pause for a moment.'],
  cues:[['Slow on the way down.'],['Straight arms. Stretch.'],['Shoulders down, then pull.','Elbows to your back pockets.'],['Chin over the bar.']],
  beginner:'3 sets of as many clean reps as you can, minus two. Can’t do one yet? Jump up and lower yourself in 3–5 seconds.',
  forms:mk({lower:2.0,touch:.35,press:1.1,lock:.6,prof:'smooth'},{
    kip:MS('Kipping','Hips swing to throw the body up','The hips swing forward and back, so the legs throw you up to the bar.','Momentum does the work, so the lats get less of it.','You plateau, because the muscle never gets the full load.','Legs still. Pull with your back.',{kip:1,meas:'hipSwing',warn:'Swinging hips',warnAt:'hips',cam:'sideL'}),
    half:MS('Half reps','Chin never reaches the bar','The chin stops 5–10 cm below the bar at the top.','The top half of the pull, where the lats and lower traps squeeze, is skipped.','Slower strength gains at the top of the movement.','Chin over the bar, every rep.',{half:1,meas:'chinBar',warn:'Stops short',warnAt:'neck',cam:'sideL'}),
    noHang:MS('No full hang','Arms never straighten at the bottom','The elbows stay bent at about 130° at the bottom.','You cut out the stretched range, the part that grows muscle most.','Less growth from the same number of reps.','Straight arms at the bottom.',{noHang:1,meas:'elbowBottom',warn:'Elbows stay bent',warnAt:'elbow',cam:'sideL'})})});
defEx('latPulldown',{group:'back',name:'Lat pulldown',eq:'Machine',part:'Lats',station:'latPulldown',entry:'pulldown',kind:'pull',pose:poseLatPulldown,
  quip:'Bar to the collarbones, not a trip behind the neck.',
  mus:{lats:[1,'m'],midBack:[.45,'h'],biLong:[.6,'h'],biShort:[.6,'h'],deltR:[.45,'h'],forearm:[.5,'h']},
  labels:[['Lats','lats','m'],['Biceps','biLong','h'],['Rear shoulder','deltR','h']],center:V(0,1.3,-12.0),cam:'three',coachSpot:{p:[-1.4,-11.4],h:Math.PI/2+.3},
  steps:steps4([['Let the bar rise','2 sec'],['Arms straight','stretch'],['Pull to collarbones','elbows down'],['Squeeze','elbows by the ribs']]),
  stepText:['Let the bar rise slowly, about 2 seconds, until the arms are straight.','Arms straight, shoulder blades lifted. The lats are stretched here.','Pull the bar down to your collarbones, elbows driving down and slightly back. Keep the small backward lean the same.','Bar at the collarbones, elbows by your ribs. Squeeze for a moment.'],
  cues:[['Control it up.'],['Arms straight.'],['Elbows down to the ribs.','Lean once, then stay still.'],['Squeeze.']],
  beginner:'3 sets of 8–12. Don’t let the stack slam; guide the bar all the way up before you let go.',
  forms:mk({lower:2.0,touch:.3,press:1.0,lock:.6,prof:'smooth'},{
    row:MS('Leaning back','Body leans far back into a row','The torso leans back from about 15° to 45° as you pull, and the bar ends at the belly.','It becomes a half row with momentum; the lats get less of the vertical pull.','You load more than the lats can handle, and the lower back helps out.','Lean back a little once, then stay still.',{row:1,meas:'leanRange',warn:'Leaning back',warnAt:'back',cam:'sideFlat'}),
    neck:MS('Behind the neck','Bar pulled down behind the head','The head pushes forward and the bar comes down behind the neck.','You lift about 15% less (59 vs 70 kg in one study) and the lats don’t work any harder.','Repeated loaded end-range rotation can irritate the front of the shoulder.','Bar to the collarbones, chin up.',{neck:1,meas:'barNeck',warn:'Bar behind the head',warnAt:'neck',cam:'sideFlat',strain:['deltF']}),
    half:MS('Half reps','Arms never straighten at the top','The elbows stay bent at the top, so the lats never stretch.','You skip the stretched range.','Less growth from the same sets.','Let the arms go straight.',{half:1,meas:'elbowBottom',warn:'Elbows stay bent',warnAt:'elbow',cam:'three'})})});
defEx('cableRow',{group:'back',name:'Seated cable row',eq:'Cable',part:'Middle back',station:'seatedRow',entry:'seatRow',kind:'pull',pose:poseSeatedRow,
  quip:'Handle to the belly button; the chair does not rock.',
  mus:{midBack:[1,'m'],lats:[.85,'m'],deltR:[.6,'h'],biLong:[.5,'h'],biShort:[.5,'h'],erect:[.3,'h']},
  labels:[['Middle back','midBack','m'],['Lats','lats','m'],['Rear shoulder','deltR','h']],center:V(0,.9,-12.0),cam:'sideFlat',coachSpot:{p:[-1.3,-11.7],h:Math.PI/2},
  steps:steps4([['Reach forward','2 sec, slowly'],['Arms straight','shoulder blades forward'],['Pull to the belly','elbows back'],['Hold one second','shoulder blades back']]),
  stepText:['Let the handle travel forward slowly until the arms are straight. The torso stays still.','Arms straight, shoulder blades pulled forward by the cable. The middle back is stretched.','Pull the handle to your belly button, elbows sliding back along the ribs.','Handle at the belly, shoulder blades back. Hold a second, then reach forward again.'],
  cues:[['Reach slowly.'],['Stretch.'],['Elbows back along the ribs.','Torso still, arms move.'],['Hold one second.']],
  beginner:'3 sets of 10–12. Lean forward and let the stack rest before you let go of the handle.',
  forms:mk({lower:2.0,touch:.3,press:1.0,lock:1.0,prof:'smooth'},{
    rock:MS('Rocking','Torso rocks forward and back','The torso rocks about 25° forward and back on every pull.','The lower back and momentum move the weight.','You lift heavier stacks without a bigger back.','Torso still. Only the arms move.',{rock:1,meas:'leanRange',warn:'Rocking torso',warnAt:'lowback',cam:'sideFlat'}),
    shrug:MS('Shrugging','Shoulders rise toward the ears','The shoulders rise 5–7 cm toward the ears at the end of the pull.','The upper traps take over from the middle back.','Tight upper traps, little middle-back growth.','Shoulders down, elbows back.',{shrug:1,meas:'shrugRise',warn:'Shoulders shrug',warnAt:'neck',cam:'front',strain:['trapU'],mul:{trapU:2.5}}),
    short:MS('Short pull','Handle stops short of the belly','The handle stops 10–15 cm in front of the belly.','The shoulder blades never squeeze together.','A weaker middle back.','Handle to the belly button.',{shortR:1,meas:'handleBelly',warn:'Stops short',warnAt:'chest',cam:'sideFlat'})})});
defEx('barRow',{group:'back',name:'Barbell bent-over row',eq:'Barbell',part:'Middle back',station:'platform',entry:'floorBar',kind:'pull',pose:poseBarRow,
  quip:'Freeze the torso. Only the elbows get to move.',coachIn:'Stand up with it first, then hinge to 45°.',
  mus:{midBack:[1,'m'],lats:[.9,'m'],deltR:[.7,'m'],erect:[.7,'h'],biLong:[.5,'h'],biShort:[.5,'h'],hams:[.35,'h'],glute:[.3,'h']},
  labels:[['Middle back','midBack','m'],['Lats','lats','m'],['Lower back','erect','h']],center:V(0,.95,-12.0),cam:'sideFlat',coachSpot:{p:[-1.5,-11.4],h:Math.PI/2},
  steps:steps4([['Lower with control','2 sec'],['Arms straight','under the chest'],['Row to the ribs','elbows back'],['Squeeze','shoulder blades together']]),
  stepText:['Lower the bar slowly until the arms hang straight. The hinge angle does not change.','Arms straight, the bar hangs below your chest. Back flat, knees soft.','Pull the bar to your lower ribs, elbows travelling back past your body.','Bar at the ribs, shoulder blades squeezed together. Then lower.'],
  cues:[['Lower slowly.'],['Flat back.'],['Elbows to the hips.','Freeze the torso.'],['Squeeze the shoulder blades.']],
  beginner:'3 sets of 8–10, starting with the empty 20 kg bar. Stop the set when the hinge starts to drift.',
  forms:mk({lower:2.0,touch:.3,press:1.0,lock:.9,prof:'smooth'},{
    heave:MS('Torso heaving','Torso swings up to lift the bar','The torso swings up from about 45° to 20° lean on every pull.','The lower back and hips lift the bar, not the lats.','You keep adding weight your back muscles never actually move.','Freeze the torso, move only the arms.',{heave:1,meas:'leanRange',warn:'Torso swings',warnAt:'lowback',cam:'sideFlat',strain:['erect']}),
    round:MS('Rounded back','Lower back rounds over the bar','The lower back rounds by 20–30°, hips tucked under.','The spine bends under load and the discs take more shear.','A stiff, sore lower back after rowing days.','Chest up, hips back, back flat.',{round:1,meas:'lumbar',warn:'Back rounds',warnAt:'lowback',cam:'sideFlat',strain:['erect']}),
    flare:MS('Elbows flared','Elbows out wide, bar to the chest','The elbows flare out to about 90° and the bar comes up to the chest.','It turns into a rear-shoulder row; the lats do less.','The front of the shoulder gets irritated under heavy loads.','Elbows to the hips.',{flare:1,meas:'rowFlare',warn:'Elbows flared',warnAt:'elbow',cam:'front',mul:{deltR:1.4,lats:.7}})})});
defEx('dbRow',{group:'back',name:'One-arm dumbbell row',eq:'Dumbbell',part:'Lats',station:'dbFlat',entry:'dbRowBench',kind:'pull',pose:poseDBRow,needs:'db1',dbSize:'medium',
  quip:'Elbow to the back pocket, shoulders flat as a table.',
  mus:{lats:[1,'m'],midBack:[.8,'m'],deltR:[.6,'h'],biLong:[.5,'h'],biShort:[.5,'h'],oblq:[.35,'h']},
  labels:[['Lats','lats','m'],['Middle back','midBack','m'],['Biceps','biLong','h']],center:V(.25,.75,-11.9),cam:'sideR',coachSpot:{p:[1.6,-12.6],h:-Math.PI/2-.4},
  steps:steps4([['Lower and stretch','2 sec'],['Arm hangs straight','shoulder blade forward'],['Row to the hip','elbow back'],['Squeeze','one second']]),
  stepText:['Lower the dumbbell slowly until the arm hangs straight.','Let the shoulder blade reach toward the floor. The lat is stretched.','Pull the elbow up and back along your ribs, dumbbell toward the hip. Shoulders stay square.','Dumbbell at the hip, shoulder blade squeezed. Hold a second. We show the right arm; then switch sides.'],
  cues:[['Lower slowly.'],['Let it hang.'],['Elbow to the back pocket.'],['Squeeze.']],
  beginner:'3 sets of 10–12 each side. The bench holds your torso, so keep the back flat.',
  forms:mk({lower:2.0,touch:.35,press:1.0,lock:.8,prof:'smooth'},{
    twist:MS('Torso twist','Shoulders twist to lift the weight','The working shoulder rotates up 25–40° to swing the dumbbell up.','The twist, not the lat, moves the weight.','One side gets stronger than the other.','Shoulders flat to the floor.',{twist:1,meas:'shoulderRot',warn:'Torso twists',warnAt:'back',cam:'front'}),
    flare:MS('Elbow flared','Elbow out wide, pulling to the armpit','The elbow travels out to the side and the dumbbell ends under the chest.','The rear shoulder takes over from the lat.','Slower lat growth.','Elbow to the back pocket.',{flare:1,meas:'dbRowFlare',warn:'Elbow flared',warnAt:'elbow',cam:'front',mul:{deltR:1.5,lats:.7}}),
    short:MS('No stretch','Arm never hangs straight','The elbow stays bent at about 140° at the bottom.','No stretched-position work for the lat.','Less growth per set.','Let it hang, then row.',{shortR:1,meas:'dbElbowBottom',warn:'Arm stays bent',warnAt:'elbow',cam:'sideR'})})});
defEx('straightArm',{group:'back',name:'Straight-arm pulldown',eq:'Cable',part:'Lats',station:'cableCol',entry:'cableCol',standZ:-11.8,pulley:1.95,att:'sbar',kind:'pull',pose:poseStraightArm,
  quip:'Straight arms, soft elbows, lats do the sweeping.',
  mus:{lats:[1,'m'],triLong:[.45,'h'],deltR:[.4,'h'],abs:[.3,'h']},
  labels:[['Lats','lats','m'],['Triceps (long head)','triLong','h']],center:V(0,1.2,-11.55),cam:'sideFlat',coachSpot:{p:[1.5,-11.9],h:-Math.PI/2},
  steps:steps4([['Rise slowly','3 sec'],['Stretch','hands at head height'],['Sweep to the thighs','arms straight'],['Squeeze','bar at the thighs']]),
  stepText:['Let the bar rise slowly in an arc, about 3 seconds. The elbows keep the same soft bend.','Hands at head height, lats stretched, torso leaning forward about 20°.','Sweep the bar down in an arc to the front of your thighs. The arms stay straight.','Bar on the thighs. Squeeze the lats for a moment.'],
  cues:[['Slow arc up.'],['Stretch.'],['Sweep down, arms straight.'],['Squeeze.']],
  beginner:'2–3 sets of 12–15, light: you should feel the lats, not the arms.',
  forms:mk({lower:2.6,touch:.4,press:1.0,lock:.7,prof:'smooth'},{
    bend:MS('Bending the elbows','Turns into a triceps pushdown','The elbows bend from 165° to about 90° during the pull.','The triceps push the bar and the lats stop isolating.','No lat benefit from the exercise.','Soft elbows, keep them still.',{bend:1,meas:'elbowRange',warn:'Elbows bend',warnAt:'elbow',cam:'sideFlat',mul:{triLong:2,triLat:1.2}}),
    upright:MS('Standing upright','No forward lean; bar stops in front','Standing bolt upright, so the bar meets the thighs with the arms still in front.','The last part of the lat squeeze is cut off.','A weaker finish and no extra growth.','Lean forward; bar to the thighs.',{upright:1,meas:'hinge',warn:'Too upright',warnAt:'back',cam:'sideFlat'}),
    bob:MS('Body bobbing','Torso dips on every pull','The torso dips 15–20° on every pull to help the weight down.','The stretch at the top gets yanked.','Irritation at the front of the shoulder from bouncing out of the stretch.','Half the weight, double the control.',{bob:1,meas:'leanRange',warn:'Torso bobs',warnAt:'back',cam:'sideFlat'})})});
defEx('deadlift',{group:'back',name:'Deadlift',eq:'Barbell',part:'Lower back',station:'platform',entry:'floorBar',startFromFloor:true,kind:'hinge',pose:poseDeadlift,
  quip:'Chest and hips rise together, like good neighbours.',coachIn:'Bar over the middle of your feet. Big breath.',
  mus:{erect:[1,'m'],glute:[1,'m'],hams:[.9,'m'],quadV:[.6,'h'],quadRF:[.5,'h'],trapU:[.5,'h'],midBack:[.45,'h'],lats:[.4,'h'],forearm:[.6,'h']},
  labels:[['Lower back','erect','m'],['Glutes','glute','m'],['Hamstrings','hams','m']],center:V(0,.8,-11.95),cam:'sideFlat',coachSpot:{p:[-1.6,-11.5],h:Math.PI/2},
  steps:steps4([['Hinge back, lower','2 sec'],['Plates touch','reset the brace'],['Push the floor away','chest and hips together'],['Stand tall','hips through']]),
  stepText:['Push the hips back first and slide the bar down the thighs; bend the knees once it passes them.','Plates touch the floor. Bar over the middle of your feet, back flat, take a breath.','Push the floor away. Chest and hips rise together, the bar slides up the legs.','Hips forward, stand tall. No leaning back.'],
  cues:[['Hips back first.'],['Breathe, brace.'],['Push the floor away.','Drag the bar up the legs.'],['Stand tall.']],
  beginner:'3 sets of 5 with the bar and light plates. Learn the hinge with 10–20 kg first.',
  forms:mk({lower:2.0,touch:.6,press:1.4,lock:.7,prof:'smooth'},{
    hipsFirst:MS('Hips shoot up','Hips rise before the bar moves','The hips rise first and the torso tips forward before the bar leaves the floor.','It becomes a stiff-leg lift with a longer lever on the back.','The lower back limits every set before the legs do.','Chest and hips rise together.',{hipsFirst:1,meas:'dlLift',warn:'Hips first',warnAt:'lowback',cam:'sideFlat',strain:['erect']}),
    round:MS('Rounded back','Lower back rounds at liftoff','The lower back rounds by 20–30° as the bar leaves the floor.','More shear load on the lumbar discs.','Repeated heavy rounding is where most lifters’ back trouble starts.','Big breath, chest up, flat back.',{round:1,meas:'lumbar',warn:'Back rounds',warnAt:'lowback',cam:'sideFlat',strain:['erect']}),
    drift:MS('Bar drifts forward','Bar swings away from the legs','The bar drifts 10–15 cm in front of the feet as it passes the knees.','A longer lever for the hips and back.','Slower progress and a sore back.','Drag the bar up the legs.',{drift:1,meas:'barDrift',warn:'Bar drifts away',warnAt:'lowback',cam:'sideFlat'})})});
defEx('shrug',{group:'back',name:'Dumbbell shrug',eq:'Dumbbell',part:'Upper traps',station:'dbStand',entry:'dbStand',kind:'raise',pose:poseShrug,needs:'db',dbSize:'heavy',
  quip:'Straight up, straight down. No rolling, this is not dough.',
  mus:{trapU:[1,'m'],forearm:[.5,'h'],midBack:[.25,'h']},
  labels:[['Upper traps','trapU','m'],['Forearms (grip)','forearm','h']],center:V(0,1.3,-12),cam:'front',coachSpot:{p:[-1.3,-11.3],h:Math.PI/2+.5},
  steps:steps4([['Lower all the way','2 sec'],['Shoulders down','arms long'],['Shrug straight up','toward the ears'],['Hold one second','at the top']]),
  stepText:['Lower the shoulders slowly, about 2 seconds.','Let the shoulders drop all the way. Arms straight, like hooks.','Shrug straight up toward your ears. No rolling.','Hold at the top for a second, then lower.'],
  cues:[['Lower slowly.'],['All the way down.'],['Straight up.'],['Hold.']],
  beginner:'2–3 sets of 12–15. Slow tempo; the range is small.',
  forms:mk({lower:2.0,touch:.3,press:1.0,lock:1.0,prof:'smooth'},{
    roll:MS('Rolling shoulders','Shoulders circle forward and back','The shoulders roll in a circle instead of going straight up.','The rolling part works against nothing, because gravity pulls straight down.','Nothing dangerous, just wasted reps; some people get a sore shoulder joint.','Straight up, straight down.',{roll:1,meas:'acrRoll',warn:'Rolling',warnAt:'shoulder',cam:'sideFlat'}),
    curl:MS('Bending the elbows','Arms bend like a curl','The elbows bend as you shrug, so the biceps help lift.','The biceps lift part of the weight.','Elbow strain with heavy dumbbells.','Arms are hooks, not levers.',{curl:1,meas:'elbowTop',warn:'Elbows bend',warnAt:'elbow',cam:'front',mul:{biLong:1.2,biShort:1.2}}),
    head:MS('Head pokes forward','Chin juts forward on each rep','The head moves 5–8 cm forward of the shoulders as you shrug.','The neck muscles take the strain.','Neck ache after shrug days.','Chin level, eyes forward.',{head:1,meas:'earFwd',warn:'Head forward',warnAt:'neck',cam:'sideFlat'})})});

// ---------------------------------------------------------------- equipment: squat rack, leg machines, hip thrust
// squat rack: the user faces the uprights; J-hooks hold the bar at mid-chest height; long safety arms behind
const RACK={hookY:1.38,barZ:-11.37,upZ:-11.24};
function buildSquatRack(g){const P={};
  for(const s of[1,-1]){box(.08,2.3,.08,M.black,s*.6,1.15,RACK.upZ,g);box(.08,.06,1.2,M.black,s*.6,.03,-11.7,g);
    box(.06,.05,.14,M.red,s*.52,RACK.hookY-.05,RACK.upZ-.08,g);box(.06,.07,.03,M.red,s*.52,RACK.hookY-.02,RACK.upZ-.14,g);
    box(.05,.05,1.1,M.steel,s*.6,.58,-11.78,g);}
  box(1.28,.08,.08,M.black,0,2.3,RACK.upZ,g);
  P.bar=barbell(true,M.padRed);g.add(P.bar);P.home=V(0,RACK.hookY,RACK.barZ);P.bar.position.copy(P.home);
  plateTree(g,1.3,-10.75);return P;}
// 45° leg press: reclined seat, sled on rails going up and forward
const LP={hip:V(0,.56,-12.3),dir:V(0,Math.SQRT1_2,Math.SQRT1_2)};
function buildLegPress(g){const P={};const H=LP.hip,d=LP.dir;
  const seat=box(.5,.1,.5,M.pad,0,.42,-12.28,g);const back=box(.5,.08,.85,M.pad,0,.735,-12.69,g);back.rotation.x=Math.PI/4; // reclined 45°: rises up and back from the seat, under the lifter's back
  box(.1,.42,.1,M.steel,0,.21,-12.3,g);box(.7,.06,2.2,M.black,0,.03,-11.6,g);
  for(const s of[1,-1]){const r=rod(.03,M.steel,g);setRod(r,V(s*.36,.25,-12.05),V(s*.36,1.55,-10.75));box(.06,.5,.06,M.black,s*.36,.3,-10.8,g);
    const hd=box(.04,.04,.2,M.chrome,s*.34,.72,-12.42,g);hd.rotation.x=-Math.PI/4;}
  P.sled=new THREE.Group();g.add(P.sled);{const pl=box(.62,.62,.05,M.black,0,0,0,P.sled);pl.rotation.x=-Math.PI/4;for(const s of[1,-1]){plate(P.sled,s*.42,.2,.06,M.rubberPlate);}}
  P.sledAt=t=>{const p=H.clone().addScaledVector(d,t).add(V(0,.04,.04));P.sled.position.copy(p);};
  P.safety=[box(.03,.12,.03,M.red,.32,.5,-11.95,g),box(.03,.12,.03,M.red,-.32,.5,-11.95,g)];
  P.sledAt(.84);return P;}
// leg extension: seat reclined, pivot at the knee, shin pad on a swinging arm
const LX={hip:V(0,.66,-12.29),knee:V(0,.66,-11.86),recline:40};
function buildLegExt(g){const P={};const th=LX.recline*DEG;
  box(.42,.1,.4,M.pad,0,LX.hip.y-.17,-12.15,g); // seat top 12 cm under the hip joint line (the thighs rest on it, not in it)
  const back=box(.42,.7,.09,M.pad,0,LX.hip.y+.22,-12.55,g);back.rotation.x=-th;back.position.set(0,LX.hip.y+.26*Math.cos(th),-12.39-.3*Math.sin(th));
  box(.1,LX.hip.y-.22,.1,M.steel,0,(LX.hip.y-.22)/2,-12.1,g);box(.8,.06,1.0,M.black,0,.03,-12.1,g);
  for(const s of[1,-1]){box(.05,.05,.3,M.chrome,s*.27,LX.hip.y-.16,-12.15,g);}  // handles low beside the seat, under the thighs. line
  for(const s of[1,-1])cyl(.04,.14,M.red,s*.29,LX.knee.y,LX.knee.z,'x',g,16);box(.12,1.4,.12,M.black,-.36,.7,-12.3,g);P.stackTop=stack(g,-.36,.12,-12.62,9);
  P.arm=new THREE.Group();P.arm.position.copy(LX.knee);g.add(P.arm);box(.05,.5,.05,M.steel,-.3,-.25,0,P.arm);P.pad=cyl(.06,.36,M.pad,-.02,-.32,.11,'x',P.arm);
  P.setKnee=a=>{P.arm.rotation.x=-a;};return P;}
// lying leg curl: angled pad, knees just past the end, roller behind the ankles
const LC={kneeZ:-11.12,padY:.62};
function buildLegCurl(g){const P={};
  const p1=box(.42,.1,.95,M.pad,0,LC.padY-.05,-11.62,g);const p2=box(.42,.1,.7,M.pad,0,LC.padY+.02,-12.4,g);p2.rotation.x=-.2;
  box(.1,LC.padY-.1,.1,M.steel,0,(LC.padY-.1)/2,-11.6,g);box(.1,LC.padY-.05,.1,M.steel,0,(LC.padY-.05)/2,-12.5,g);box(.7,.06,1.8,M.black,0,.03,-11.9,g);
  for(const s of[1,-1])box(.04,.04,.18,M.chrome,s*.24,LC.padY+.06,-12.72,g);
  for(const s of[1,-1])cyl(.04,.14,M.red,s*.29,LC.padY,LC.kneeZ,'x',g,16);
  P.arm=new THREE.Group();P.arm.position.set(0,LC.padY,LC.kneeZ);g.add(P.arm);box(.05,.05,.42,M.steel,-.27,0,.21,P.arm);P.pad=cyl(.06,.4,M.pad,0,.2,.4,'x',P.arm);box(.05,.2,.05,M.steel,-.27,.1,.4,P.arm);
  P.stackTop=stack(g,-.55,.12,-11.1,8);box(.06,1.2,.3,M.black,-.63,.6,-11.1,g);
  P.setKnee=a=>{P.arm.rotation.x=-a;};return P;}
// standing calf raise: step block and shoulder pads on a sliding carriage
const SC={stepY:.14,edgeZ:-11.84};
function buildStandCalf(g){const P={};box(.6,SC.stepY,.3,M.black,0,SC.stepY/2,SC.edgeZ+.15,g);box(.9,.03,.55,M.black,0,.015,-11.73,g);
  box(.14,2.0,.14,M.black,0,1.0,-11.05,g);P.stackTop=stack(g,0,.12,-10.95,9);
  // the carriage reaches forward from the pads to the column (nothing behind the lifter's head, so they walk in from behind and step under)
  P.pads=new THREE.Group();g.add(P.pads);box(.44,.05,.07,M.steel,0,.06,.82,P.pads);for(const s of[1,-1]){cyl(.06,.22,M.pad,s*.17,0,-.02,'z',P.pads);box(.05,.05,.9,M.steel,s*.19,.075,.38,P.pads);box(.04,.16,.04,M.chrome,s*.3,-.1,.12,P.pads);box(.12,.04,.04,M.chrome,s*.25,-.02,.12,P.pads);}
  P.padsAt=y=>P.pads.position.set(0,y,-11.95);P.padsAt(1.56);return P;}
// seated calf raise: seat, step, knee pad on a lever
const SCS={seatY:.47,stepY:.13,edgeZ:-11.62};
function buildSeatCalf(g){const P={};box(.42,.08,.42,M.pad,0,SCS.seatY-.04,-12.12,g);box(.08,SCS.seatY-.08,.08,M.steel,0,(SCS.seatY-.08)/2,-12.12,g);
  box(.5,SCS.stepY,.25,M.steel,0,SCS.stepY/2,SCS.edgeZ+.12,g);box(.5,.012,.03,M.red,0,SCS.stepY+.006,SCS.edgeZ+.015,g);box(.7,.04,1.0,M.black,0,.02,-11.9,g);box(.1,.7,.1,M.black,0,.35,-11.5,g);
  P.lever=new THREE.Group();P.lever.position.set(0,.68,-11.5);g.add(P.lever);box(.06,.06,.6,M.steel,0,0,-.25,P.lever);P.pad=box(.42,.07,.16,M.pad,0,.0,-.52,P.lever);
  for(let i=0;i<2;i++)plate(P.lever,0,.2,.05,M.rubberPlate).position.set(0,-.05,.12);
  P.padAt=y=>{P.lever.rotation.x=0;P.lever.updateMatrixWorld(true);const pz=P.lever.position;P.lever.rotation.x=Math.asin(clamp((y-pz.y)/.52,-1,1));};return P;} // +x rotation lifts the far (−z) end
// hip thrust: flat bench side-on behind the lifter, padded barbell on the floor in front
const HT={benchZ:-12.48,benchY:.4};
function buildHipThrust(g){const P={};box(1.2,.09,.3,M.pad,0,HT.benchY-.045,HT.benchZ,g);for(const s of[1,-1]){box(.06,HT.benchY-.09,.06,M.steel,s*.45,(HT.benchY-.09)/2,HT.benchZ,g);box(.06,.05,.45,M.steel,s*.45,.025,HT.benchZ,g);}
  box(1.3,.06,.06,M.black,0,.03,HT.benchZ-.2,g);
  P.bar=barbell(true,M.padRed);g.add(P.bar);cyl(.05,.36,M.pad,0,0,0,'x',P.bar,14);P.home=V(0,.225,-11.2);P.bar.position.copy(P.home);
  const mat=box(1.2,.01,1.2,M_mat,0,.005,-11.75,g,false);mat.userData.walkable=true;return P;}

// ---------------------------------------------------------------- legs: poses, entries and the 9 exercises
// bar resting on the upper back (high bar: just below the base of the neck)
function barOnBack(c){const T=torsoAxes(c);return wpos(c.bones.Neck).addScaledVector(T.F,-.075*D.s).addScaledVector(T.U,-.035*D.s);}
function backBarHands(c,ct){const T=torsoAxes(c);for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().addScaledVector(T.L,s*.4*D.s),{hd:T.U.clone().addScaledVector(T.F,.3),pn:T.F.clone().negate(),pole:T.U.clone().negate().addScaledVector(T.F,-.5).addScaledVector(T.L,s*.2)});}
// a standing pose placed so that a point on the body (bar) sits over the middle of the foot
function overMidfoot(c,o,pt,mid){let back=o.back||0;for(let i=0;i<3;i++){standPose(c,{...o,back});const p=pt(c);back+=p.z-mid;}return back;}
const SQ_FOOT=-11.95;
function squatPose(c,P,k,o={}){const half=o.half?.6:1;const kk=k*half;
  const hinge=o.goodMorning&&o.rising?lerp(10,68,Math.sin(Math.PI*clamp(o.rising,0,1))*.0+kk):lerp(4,o.goodMorning?66:40,kk);
  const drop=lerp(.02,.56,kk)*(o.goodMorning&&o.rising?.92:1);
  const opt={z:SQ_FOOT,hinge,drop,stance:.17*D.s,toe:22,arms:'none',kneeIn:o.kneeIn?o.kneeIn*.6*kk:0,look:hinge*.7};
  overMidfoot(c,opt,c2=>barOnBack(c2),SQ_FOOT+.04);const bar=barOnBack(c);backBarHands(c,bar);if(P&&P.bar){P.bar.position.copy(bar);P.bar.quaternion.identity();}return bar;}
function poseSquat(c,F,b,u,P){const k=1-clamp(u,0,1);const rising=F.goodMorning&&b.phase===2?b.k:0;
  squatPose(c,P,smooth(k),{half:F.half,kneeIn:F.kneeIn,goodMorning:F.goodMorning,rising});c._kneeIn=F.kneeIn;return u;}
// Romanian deadlift: knees soft and fixed, hips go back, bar slides down the thighs
function rdlPose(c,P,k,o={}){const th=lerp(0,o.squat?55:74,k);const drop=lerp(.03,o.squat?.32:.145,k);
  standPose(c,{z:PLAT.barZ-.06,hinge:th,drop,back:lerp(.02,o.squat?.2:.3,k),round:o.round?50*k:0,stance:.13*D.s,toe:4,arms:'none',look:th*.6});
  // the bar rides down the front of the thighs and shins: find the point on the legs a straight arm's length from the shoulders
  const [a,b2]=shoulders(c);const S=a.add(b2).multiplyScalar(.5);const B=c.bones;const H=wpos(B.LeftUpLeg),K=wpos(B.LeftLeg),A=wpos(B.LeftFoot);const L=ARM_HANG();let bar=null;
  for(let i=0;i<=40&&!bar;i++){const t=i/40;const p=t<.5?H.clone().lerp(K,t*2):K.clone().lerp(A,(t-.5)*2);p.x=0;p.z+=(t<.5?.085:.06);if(p.distanceTo(S)>=L)bar=p;}
  if(!bar)bar=V(0,S.y-L,S.z);if(o.drift)bar.z+=.09*k;
  barHands(c,bar,.25*D.s,{hd:V(0,-1,-.1),pn:V(0,0,-1),pole:V(.25,.2,-1)});if(P&&P.bar){P.bar.position.copy(bar);P.bar.quaternion.identity();}return bar;}
function poseRDL(c,F,b,u,P){rdlPose(c,P,smooth(1-clamp(u,0,1)),{round:F.round,squat:F.squat,drift:F.drift});return u;}
// Bulgarian split squat: rear foot laces-down on the bench, front foot about a leg length ahead
function poseBulgarian(c,F,b,u,P){const k=smooth(1-clamp(u,0,1));const fz=F.close?-10.92:-10.58;
  const hz=lerp(fz-.42,fz-.46,k)+(F.close?.0:0),hy=lerp(.9*D.s,.5*D.s,k)+(F.close?.06*k:0);const yaw=(F.twist?22*k:0)*DEG;
  setRoot(c,qY(-yaw).multiply(qX(13*DEG)),V(.02,hy,hz));resetRest(c);spineBend(c,0,{neck:-.08,head:-.06});c.root.updateMatrixWorld(true);
  const heel=F.close?.035*k:0;const A=V(.11,D.ankY+heel,fz);legTo(c,'Left',A,V(F.kneeIn?-.22*k:0,.2,1));footTo(c,'Left',A.clone().add(V(0,-heel*1.2-.04,.15)));
  const R=V(-.11,BENCH_TOP+.07,-11.6);legTo(c,'Right',R,V(0,-1,.3));footTo(c,'Right',R.clone().add(V(0,-.03,-.16)));
  const T=torsoAxes(c);for(const s of[1,-1]){const ua=V(0,-1,0).addScaledVector(T.L,s*.14);const r=armDir(c,sideOf(s),ua,ua,T.L.clone().multiplyScalar(-s),{hd:V(0,-1,0)});if(P.db&&P.db[s>0?0:1]){const d=P.db[s>0?0:1];d.position.copy(r.contact);d.quaternion.setFromUnitVectors(V(1,0,0),T.F);}}
  c._front='Left';return u;}
// 45° leg press
function poseLegPress(c,F,b,u,P){const uu=clamp(u,0,1);const kTop=F.lockKnee?180:166,kBot=F.deep?62:90;const knee=lerp(kBot,kTop,smooth(uu))*DEG;const th=D.thigh,sh=D.shin;const dist=Math.sqrt(th*th+sh*sh-2*th*sh*Math.cos(knee))*(F.lockKnee?1.01:1);
  const tuck=F.deep?(1-smooth(uu))*1:0;const H=LP.hip.clone().add(V(0,.05*tuck,.04*tuck));const up=V(0,Math.SQRT1_2,-Math.SQRT1_2).applyAxisAngle(V(1,0,0),.3*tuck);
  setRoot(c,rootFromAxes(up,V(0,Math.SQRT1_2,Math.SQRT1_2).applyAxisAngle(V(1,0,0),.3*tuck)),H);resetRest(c);spineBend(c,.35*tuck,{neck:.35,head:.1});c.root.updateMatrixWorld(true);
  // the sole is flat on the plate: the heel touches it at C, the ankle sits .1 in front of the plate (toward the lifter) and a little up the plate
  const perp=V(0,Math.SQRT1_2,-Math.SQRT1_2);const heel=F.heels?.03*(1-uu):0;const U0=wpos(c.bones.LeftUpLeg);const rel=V().subVectors(LP.hip,U0).add(V(.16,0,0)).addScaledVector(perp,.04).addScaledVector(LP.dir,-.1);
  // distance along the rails that puts the ankle the right distance from the hip joint
  const bq=rel.dot(LP.dir),cq=rel.lengthSq()-dist*dist;const t=-bq+Math.sqrt(Math.max(0,bq*bq-cq));P.sledAt(t-.032);
  for(const s of[1,-1]){const sd=sideOf(s);const C=LP.hip.clone().addScaledVector(LP.dir,t).add(V(s*.16,0,0));const A=C.clone().addScaledVector(LP.dir,-.1+heel).addScaledVector(perp,.04);
    legTo(c,sd,A,V(s*(F.heels?-.4:.35),.6,.2));footTo(c,sd,C.clone().addScaledVector(perp,.2).addScaledVector(LP.dir,-.07));
}lpHandles(c); // fingers wrap across the handle, not along it
  c._lp={t,H,plateT:t};return u;}
// leg extension (seat reclined so the hip is ~130°)
function poseLegExt(c,F,b,u,P){const uu=clamp(u,0,1);const hi=F.half?.55:1;const phi=lerp(0,85,smooth(uu)*hi)*DEG;P.setKnee(phi);
  const lift=F.hips?.06*Math.sin(Math.PI*clamp(b.phase===2?b.k:0,0,1)):0;
  setRoot(c,qX(-(LX.recline+(F.hips?15*lift/.06:0))*DEG),LX.hip.clone().add(V(0,lift,0)));resetRest(c);spineBend(c,0,{neck:.45,head:.1});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);const K=LX.knee.clone().add(V(s*.12,0,0));const A=K.clone().add(V(0,-Math.cos(phi),Math.sin(phi)).multiplyScalar(D.shin));
    legTo(c,sd,A,V(0,1,.2));footTo(c,sd,A.clone().add(V(0,Math.sin(phi),Math.cos(phi)).multiplyScalar(.15)));
    armTo(c,sd,V(s*.27,LX.hip.y-.16,-12.15),{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.4,-.3,-1)});}
  c._phi=phi;return u;}
// lying leg curl (face down, head toward −z)
function poseLegCurl(c,F,b,u,P){const uu=clamp(u,0,1);const hi=F.half?.5:1;const psi=lerp(5,115,smooth(uu)*hi)*DEG;P.setKnee(psi);
  const lift=F.hips?.07*smooth(uu):0;const H=V(0,LC.padY+.13+lift,LC.kneeZ-D.thigh*.98-.05);/* hip joints a thigh's length from the knees at the pad's end */const dir=V(0,.22-(F.hips?.42*smooth(uu):0),-1).normalize();
  setRoot(c,rootFromAxes(dir,V(0,-1,-.2)),H);resetRest(c);spineBend(c,F.hips?-.25*smooth(uu):0,{neck:-.6,head:-.2});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const side=sideOf(s),w=-s;const K=V(w*.11,LC.padY+.06,LC.kneeZ);const A=K.clone().add(V(0,Math.sin(psi),Math.cos(psi)).multiplyScalar(D.shin));
    legTo(c,side,A,V(0,-1,0));footTo(c,side,A.clone().add(V(0,-.05,.15).applyAxisAngle(V(1,0,0),psi*.6)));
    armTo(c,side,V(w*.24,LC.padY+.07,-12.72),{hd:V(0,0,-1),pn:V(-w,0,0),pole:V(w*.6,.2,.6),curl:1});}
  c._psi=psi;return u;}
// barbell hip thrust: upper back on the bench edge, feet flat, hips rise until the torso is level
function poseHipThrust(c,F,b,u,P){const uu=clamp(u,0,1);const hi=F.half?.6:1;const k=smooth(uu)*hi;
  const S=V(0,HT.benchY+.17,HT.benchZ+.16);const L=D.sh.clone().sub(D.hips).length();const hipUp=D.hips.y-D.upLeg.y;const yTop=D.ankY+D.shin*.995+hipUp*.2;
  const zTop=S.z+Math.sqrt(Math.max(.01,L*L-Math.pow(S.y-yTop,2)));const az=zTop+hipUp+D.thigh+(F.far?.2:0);const hy=lerp(.16,yTop+(F.arch?.07:0),k);const hz=S.z+Math.sqrt(Math.max(.01,L*L-Math.pow(S.y-hy,2)));
  const H=V(0,hy,hz);const dir=V().subVectors(S,H).normalize();const front=V().crossVectors(dir,V(1,0,0)).negate();
  setRoot(c,rootFromAxes(dir,front.y<0?front.negate():front),H);resetRest(c);spineBend(c,F.arch?-.45*k:0,{neck:F.arch?-.4*k:.55,head:.15});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);const A=V(s*.17,D.ankY,az);legTo(c,sd,A,V(s*.2,1,.4));footTo(c,sd,A.clone().add(V(s*.03,-.07,.13)));}
  const T=torsoAxes(c);const bar=wpos(c.bones.Hips).addScaledVector(T.F,.17*D.s).addScaledVector(T.U,-.06);
  barHands(c,bar,.33*D.s,{hd:T.F.clone(),pn:T.U.clone().negate(),pole:V(.4,1,-.2)});if(P.bar){P.bar.position.copy(bar);P.bar.quaternion.identity();}c._hip=H;return u;}
// calf raises: the balls of the feet stay on the step edge; the heel moves; the body rides up and down
function calfFeet(c,stepY,edgeZ,ang,kneeBend=0){// ang: foot angle from horizontal (+ heel up)
  const out=[];for(const s of[1,-1]){const toe=V(s*.11,stepY+.025,edgeZ+.03);const A=toe.clone().add(V(0,Math.sin(ang),-Math.cos(ang)).multiplyScalar(D.footL)).add(V(0,D.ankY*.55,0));out.push({toe,A});}return out;}
function poseStandCalf(c,F,b,u,P){const uu=clamp(u,0,1);const bot=F.half?2:-25,top=25;let a=lerp(bot,top,smooth(uu));if(F.bounce&&b.phase===1)a=bot+6*Math.sin(Math.PI*b.k);
  const knee=F.knees?.13*Math.sin(Math.PI*(b.phase===2?b.k:0)):0;const ft=calfFeet(c,SC.stepY,SC.edgeZ,a*DEG);
  const A=ft[0].A;const hy=A.y+(D.hips.y-D.upLeg.y)+(D.thigh+D.shin)*.997-knee*.6;standPose(c,{z:A.z,drop:D.hips.y-hy,arms:'none',feet:[[.11,0],[-.11,0]],stance:.11});
  for(const [i,s] of [1,-1].entries()){const sd=sideOf(s);legTo(c,sd,ft[i].A,V(0,.2,1));footTo(c,sd,ft[i].toe.clone().add(V(0,0,.05)));}
  const T=torsoAxes(c);const pads=wpos(c.bones.LeftArm).y+.11;P.padsAt(pads);
  for(const s of[1,-1])armTo(c,sideOf(s),V(s*.3,pads-.1,-11.83),{hd:V(0,1,0),pn:V(0,0,-1),pole:V(s*.4,-1,-.3)});c._ank=a;return u;}
function poseSeatCalf(c,F,b,u,P){const uu=clamp(u,0,1);const bot=F.half?2:-22,top=25;let a=lerp(bot,top,smooth(uu));if(F.bounce&&b.phase===1)a=bot+6*Math.sin(Math.PI*b.k);
  setRoot(c,qX(4*DEG),V(0,SCS.seatY+.1*D.s,-12.08));resetRest(c);c.root.updateMatrixWorld(true);const ft=calfFeet(c,SCS.stepY,SCS.edgeZ,a*DEG);
  for(const [i,s] of [1,-1].entries()){const sd=sideOf(s);legTo(c,sd,ft[i].A,V(0,.4,1));footTo(c,sd,ft[i].toe.clone().add(V(0,0,.05)));}
  const kn=wpos(c.bones.LeftLeg);const padY=kn.y+.08;P.padAt(padY);const pz=F.knee?kn.z+.02:kn.z-.11;P.pad.position.z=pz-P.lever.position.z;
  for(const s of[1,-1])armTo(c,sideOf(s),V(s*.235,padY,pz),{hd:V(0,-.3,1),pn:V(-s,0,0),pole:V(s*.5,-.3,-1),curl:.8});/* hands hold the ends of the pad */c._ank=a;c._padK=pz-kn.z;return u;}

// ---- measurements
function fppa(c,side){const B=c.bones,h=wpos(B[side+'UpLeg']),k=wpos(B[side+'Leg']),a=wpos(B[side+'Foot']);const up=upOf(c),f=V(Math.sin(0),0,1);
  const t=V().subVectors(k,h),s=V().subVectors(a,k);t.z=0;s.z=0;return Math.acos(clamp(t.normalize().dot(s.normalize()),-1,1))/DEG;}
Object.assign(MEAS,{
  fppa:{at:'bottom',get:c=>avg2(s=>{const B=c.bones,h=wpos(B[s+'UpLeg']),k=wpos(B[s+'Leg']),a=wpos(B[s+'Foot']);const inward=(s==='Left'?-1:1);return Math.max(0,(k.x-(h.x+a.x)/2)*inward*100);}),fmt:v=>v<3?'knees track over the toes':'knees cave '+Math.round(v)+' cm inward'},
  torsoBottom:{at:'bottom',get:c=>torsoLean(c),fmt:v=>v<50?'torso '+Math.round(v)+'° at the bottom':'torso tips to '+Math.round(v)+'°'},
  depth:{at:'bottom',get:c=>(wpos(c.bones.Hips).y-.05-wpos(c.bones.LeftLeg).y)*100,fmt:v=>v<=0?'hip crease below the knee':'stops '+Math.round(v)+' cm above parallel'},
  rdlKnee:{at:'bottom',get:c=>avg2(s=>kneeAng(c,s)),fmt:v=>v>=148?'knees stay soft ('+Math.round(v)+'°)':'knees bend to '+Math.round(v)+'°: it became a squat'},
  barThigh:{pick:'max',get:(c,x)=>{const B=c.bones,H=wpos(B.LeftUpLeg),K=wpos(B.LeftLeg),A=wpos(B.LeftFoot);const y=x.P.bar.position.y;const p=y>K.y?H.clone().lerp(K,clamp((H.y-y)/(H.y-K.y),0,1)):K.clone().lerp(A,clamp((K.y-y)/(K.y-A.y),0,1));return (x.P.bar.position.z-p.z-(y>K.y?.085:.06))*100;},fmt:v=>v<3?'bar slides down the legs':'bar drifts '+Math.round(v)+' cm off the legs'},
  frontKnee:{at:'bottom',get:c=>{const B=c.bones,h=wpos(B.LeftUpLeg),k=wpos(B.LeftLeg),a=wpos(B.LeftFoot);return Math.max(0,((h.x+a.x)/2-k.x)*100);},fmt:v=>v<3?'front knee over the toes':'front knee caves '+Math.round(v)+' cm in'},
  heel:{at:'bottom',get:c=>Math.max(0,(wpos(c.bones.LeftFoot).y-D.ankY)*100),fmt:v=>v<1.5?'front heel stays down':'front heel lifts '+Math.round(v)+' cm'},
  pelvisYaw:{at:'bottom',get:c=>{const L=pelvisAxes(c).L;return Math.abs(Math.atan2(L.z,L.x)/DEG);},fmt:v=>v<10?'hips square to the front':'hips twist '+Math.round(v)+'°'},
  padGap:{at:'bottom',get:c=>(c._lp?Math.max(0,(c._lp.H.y-LP.hip.y)*100):0),fmt:v=>v<1.5?'lower back stays on the pad':'tailbone lifts '+Math.round(v)+' cm off the pad'},
  kneeTop:{at:'top',get:c=>avg2(s=>kneeAng(c,s)),fmt:v=>v<174?'knees stop just short of straight ('+Math.round(v)+'°)':'knees lock out ('+Math.round(v)+'°)'},
  heelLift:{at:'bottom',get:c=>{if(!c._lp)return 0;const a=wpos(c.bones.LeftFoot);const ank=V().subVectors(a,LP.hip).dot(LP.dir);return Math.max(0,(ank-(c._lp.plateT-.1))*100);},fmt:v=>v<1.5?'whole foot on the plate':'heels lift '+Math.round(v)+' cm'},
  hipLift:{pick:'max',get:c=>Math.max(0,(wpos(c.bones.Hips).y-LX.hip.y)*100),fmt:v=>v<1.5?'hips stay on the seat':'hips lift '+Math.round(v)+' cm off the seat'},
  extTop:{at:'top',get:c=>avg2(s=>kneeAng(c,s)),fmt:v=>v>=168?'legs straight at the top ('+Math.round(v)+'°)':'stops at '+Math.round(v)+'°'},
  lowerTime:{pick:'lower',get:()=>0,fmt:v=>v>=1.4?'lowers in '+v.toFixed(1)+' s':'drops in '+v.toFixed(1)+' s'},
  curlHip:{pick:'range',get:c=>{const B=c.bones;const t=V().subVectors(wpos(B.LeftLeg),wpos(B.LeftUpLeg)).normalize(),p=V().subVectors(wpos(B.Neck),wpos(B.Hips)).normalize();return Math.acos(clamp(t.dot(p),-1,1))/DEG;},fmt:v=>v<14?'hips glued to the pad':'hips lift; hip angle changes '+Math.round(v)+'°'},
  curlTop:{at:'top',get:c=>avg2(s=>kneeAng(c,s)),fmt:v=>v<=80?'heels come up to '+Math.round(v)+'° at the knee':'curl stops at '+Math.round(v)+'°'},
  hipTop:{at:'top',get:c=>{const B=c.bones;const H=wpos(B.LeftUpLeg).setX(0),K=wpos(B.LeftLeg).setX(0),S=wpos(B.LeftArm).setX(0);const a=Math.acos(clamp(V().subVectors(K,H).normalize().dot(V().subVectors(S,H).normalize()),-1,1))/DEG;
    const t=clamp((H.z-K.z)/(S.z-K.z),0,1),ly=lerp(K.y,S.y,t);return H.y>ly?360-a:a;},
    fmt:v=>v>=186?'back arches past straight ('+Math.round(v)+'°)':v>=172?'hips fully extended ('+Math.round(v)+'°)':'hips stop at '+Math.round(v)+'°'},
  shinTop:{at:'top',get:c=>{const k=wpos(c.bones.LeftLeg),a=wpos(c.bones.LeftFoot);return Math.abs(Math.atan2(k.z-a.z,k.y-a.y)/DEG);},fmt:v=>v<12?'shins vertical at the top':'shins lean '+Math.round(v)+'°'},
  ankleBottom:{at:'bottom',get:c=>-(c._ank||0),fmt:v=>v>=15?'heels drop '+Math.round(v)+'° below the step':'heels barely drop ('+Math.round(Math.max(0,v))+'°)'},
  bottomPause:{pick:'pause',get:()=>0,fmt:v=>v>=.4?'pauses '+v.toFixed(1)+' s at the bottom':'bounces off the bottom'},
  calfKnee:{pick:'min',get:c=>avg2(s=>kneeAng(c,s)),fmt:v=>v>=170?'legs stay straight':'knees bend to '+Math.round(v)+'°'},
  padKnee:{pick:'max',get:c=>(c._padK||0)*-100,fmt:v=>v>4?'pad on the thighs':'pad sits on the kneecaps'},
});
// timing measures read the form's own tempo (they describe the rep, not a pose)
MEAS.lowerTime.get=(c,x)=>x.F.lower;MEAS.lowerTime.pick=null;
MEAS.bottomPause.get=(c,x)=>x.F.bounce?.1:x.F.touch;MEAS.bottomPause.pick=null;

// ---- getting on and off
// feet that stay on the floor while a pose blends: a `props` hook that re-solves the legs after the blend, sliding each ankle
// from where it was at the start of the step to its target (canonical frame) instead of letting the leg bones slerp through the floor
function plantFeet(st,feet){let from=null;return (c,k)=>{const kk=ease(clamp(k,0,1));
  if(!from)from=feet.map((f,i)=>{const sd=i?'Right':'Left';const H=wpos(c.bones[sd+'UpLeg']),A=wpos(c.bones[sd+'Foot']);return {A,T:wpos(c.bones[sd+'ToeBase']),P:wpos(c.bones[sd+'Leg']).sub(H.lerp(A,.5)).normalize()};});
  feet.forEach((f,i)=>{const sd=i?'Right':'Left';const tA=toW(st,f.a),tT=toW(st,f.t||f.a.clone().add(V(0,-.06,.15)));let A,T;
    if(f.via){const vA=toW(st,f.via),q=1-kk;A=from[i].A.clone().multiplyScalar(q*q).addScaledVector(vA,2*q*kk).addScaledVector(tA,kk*kk);T=A.clone().add(from[i].T.clone().sub(from[i].A).lerp(tT.clone().sub(tA),kk));}
    else{A=from[i].A.clone().lerp(tA,kk);T=from[i].T.clone().lerp(tT,kk);}
    A.y=Math.max(A.y,D.ankY*.98);T.y=Math.max(T.y,.03);const pole=from[i].P.clone().lerp((f.pole||V(0,.3,1)).clone().applyQuaternion(st.q).normalize(),kk);legTo(c,sd,A,pole);footTo(c,sd,T);});};}
// the feet of a standing pose, for plantFeet: [{a,t,pole}] left then right
function standFeet(o={}){const h=o.h||0,qh=qY(h),x=o.x||0,z=o.z??-12,st=o.stance??.11*D.s;const out=[];
  for(const s of[1,-1]){const f=o.feet?V(o.feet[s>0?0:1][0],0,o.feet[s>0?0:1][1]):V(s*st,0,.02);const A=f.applyQuaternion(qh).add(V(x,D.ankY,z));const fwd=V(0,0,1).applyQuaternion(qh);
    out.push({a:A,t:A.clone().addScaledVector(fwd,.15).setY(D.ankY*.35),pole:fwd.clone().add(V(0,.25,0))});}return out;}
// walk into the rack, dip under the bar (or step under it for the front rack), stand it out of the J-hooks, step back
function rackHook(){return V(0,RACK.hookY,RACK.barZ);}
function rackStand(c,P,o){standPose(c,{z:o.z,drop:o.drop||0,arms:'none'});if(o.front)frontRackHands(c,P,o.lift||0);else{const bar=barOnBack(c);backBarHands(c,bar);P.bar.position.copy(bar);}}
function frontRackPoint(c){const T=torsoAxes(c);const [a,b]=shoulders(c);return a.add(b).multiplyScalar(.5).addScaledVector(T.F,.19*D.s).addScaledVector(T.U,.0);}
function frontRackHands(c,P,lift){const ct=frontRackPoint(c);frontRackGrip(c,ct);if(P){P.bar.position.copy(ct);P.bar.quaternion.identity();}}
// built on the body's own left/forward axes (not the room's), so it also holds while walking with the bar at any heading
function frontRackGrip(c,ct){const T=torsoAxes(c);const L=T.L.clone().setY(0).normalize(),F=T.F.clone().setY(0).normalize(),U=V(0,1,0);
  for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().addScaledVector(L,s*.27*D.s),{hd:U.clone().addScaledVector(F,-.4),pn:U.clone().multiplyScalar(.4).add(F),pole:L.clone().multiplyScalar(s*.25).addScaledVector(U,-1).addScaledVector(F,.9)});}
// hands on the racked bar from the front (facing it): fingers over the top, palms forward
function frontGrip(c,ct){for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().add(V(s*.4*D.s,0,0)),{hd:V(0,1,.35),pn:V(0,.25,1),pole:V(s*.3,-1,.3)});}
// where to stand so that the bar on the traps (or the front rack) is exactly in the J-hooks: solves z and the knee bend
function rackSet(c,front){let z=RACK.barZ,drop=.05;const pt=()=>front?frontRackPoint(c):barOnBack(c);
  for(let i=0;i<5;i++){standPose(c,{z,drop,arms:'none'});const p=pt();z-=p.z-RACK.barZ;drop+=p.y-RACK.hookY;}return {z,drop:Math.max(.03,drop)};}
const lazyPlant=(st,zf)=>{let pf=null;return (c,k)=>{(pf||(pf=plantFeet(st,standFeet({z:zf(c)}))))(c,k);};};
ENTRY.rack={pre:[0,-12.85],face:0,
  enter:(st,e)=>{const P=st.P,front=e.front;let S=null;const hook=rackHook();const set=c=>S||(S=rackSet(c,front));
    const duck={hinge:26,drop:.33,look:-45};
    return [
    {walk:[0,-11.72],d:1.2},
    // hands on the bar in the hooks, then grip it
    {d:.8,pose:c=>{const s=set(c);standPose(c,{z:s.z-(front?.27:.33),arms:'none'});if(front)frontRackGrip(c,hook);else frontGrip(c,hook);},props:lazyPlant(st,c=>set(c).z-(front?.27:.33))},
    {call:c=>{grab(c,P.bar,'Left',{other:'Right',align:'bar',palm:.075});}},
    ...(front?[
      // step under: the bar comes to rest on the front of the shoulders
      {d:.9,pose:c=>{const s=set(c);standPose(c,{z:s.z,drop:s.drop,arms:'none'});frontRackGrip(c,hook);},props:lazyPlant(st,c=>set(c).z)}]:[
      // dip, head under the bar; step forward under it; come up so the bar sits on the traps
      {d:.8,pose:c=>{const s=set(c);standPose(c,{z:s.z-.33,...duck,arms:'none'});backBarHands(c,hook);},props:lazyPlant(st,c=>set(c).z-.33)},
      {d:.7,pose:c=>{const s=set(c);standPose(c,{z:s.z,...duck,arms:'none'});backBarHands(c,hook);},props:lazyPlant(st,c=>set(c).z)},
      {d:.7,pose:c=>{const s=set(c);standPose(c,{z:s.z,drop:s.drop,arms:'none'});backBarHands(c,hook);},props:lazyPlant(st,c=>set(c).z)}]),
    // stand up: the bar lifts straight out of the hooks
    {d:.6,anim:(c,k)=>{const s=set(c);standPose(c,{z:s.z,drop:s.drop*(1-smooth(k)),arms:'none'});if(front)frontRackHands(c,null);else backBarHands(c,barOnBack(c));}},
    {call:c=>{c.carry=front?'frontBar':'backBar';}},
    {walk:[0,SQ_FOOT],back:true,d:1.4},{call:c=>{c.carry=null;}},
    {d:.6,pose:exP(front?0:1,front?1:3)},...(front?[{d:1.0,anim:exFrom(0,1)}]:[]),{call:c=>{c.hold=[];}}];},
  leave:(st,e)=>{const P=st.P,front=e.front;let S=null;const hook=rackHook();const set=c=>S||(S=rackSet(c,front));const duck={hinge:26,drop:.33,look:-45};
    return [
    {call:c=>{grab(c,P.bar,'Left',{other:'Right',align:'bar',palm:.075});}},
    {d:1.1,pose:exP(front?0:1,front?1:3)}, // lower the bar under control before walking it in
    {d:.5,pose:c=>{standPose(c,{z:SQ_FOOT,arms:'none'});if(front)frontRackHands(c,null);else backBarHands(c,barOnBack(c));}},
    {call:c=>{c.carry=front?'frontBar':'backBar';}},{walk:[0,-11.6],d:1.2},{call:c=>{c.carry=null;}},
    // settle it into the hooks
    {d:.8,pose:c=>{const s=set(c);standPose(c,{z:s.z,drop:s.drop,arms:'none'});if(front)frontRackGrip(c,hook);else backBarHands(c,hook);},props:lazyPlant(st,c=>set(c).z)},
    {call:c=>{c.hold=[];P.bar.position.copy(P.home);P.bar.quaternion.identity();}},
    ...(front?[
      {d:.8,pose:c=>{const s=set(c);standPose(c,{z:s.z-.27,drop:.06,arms:'none'});frontRackGrip(c,hook);},props:lazyPlant(st,c=>set(c).z-.27)}]:[
      {d:.7,pose:c=>{const s=set(c);standPose(c,{z:s.z,...duck,arms:'none'});backBarHands(c,hook);},props:lazyPlant(st,c=>set(c).z)},
      {d:.7,pose:c=>{const s=set(c);standPose(c,{z:s.z-.33,...duck,arms:'none'});backBarHands(c,hook);},props:lazyPlant(st,c=>set(c).z-.33)},
      {d:.7,pose:c=>{const s=set(c);standPose(c,{z:s.z-.33,arms:'none'});frontGrip(c,hook);},props:lazyPlant(st,c=>set(c).z-.33)}]),
    {d:.6,pose:c=>{const s=set(c);standPose(c,{z:s.z-(front?.27:.33)});}},
    {walk:[0,-12.85],back:true,d:1.7}];}};
// leg press: sit on the seat edge with the feet on the floor, lie back and put the feet on the plate
function legPressSit(c){setRoot(c,qX(-10*DEG),LP.hip.clone().add(V(0,.0,.05)));resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const A=V(s*.16,D.ankY+.06,-11.78);legTo(c,sideOf(s),A,V(s*.05,.5,1));footTo(c,sideOf(s),A.clone().add(V(0,-.06,.15)));}lpHandles(c);}
// hands on the side handles (they take hold as soon as they sit, so the arms never sweep through them later)
function lpHandles(c,st){const w=v=>st?v.applyQuaternion(st.q):v; // st: in the room (a props hook runs after the pose is framed)
  for(const s of[1,-1])armTo(c,sideOf(s),st?toW(st,V(s*.34,.72,-12.42)):V(s*.34,.72,-12.42),{hd:w(V(0,-Math.SQRT1_2,Math.SQRT1_2)),pn:w(V(-s,0,0)),pole:w(V(s*.7,.1,-.7))});}
const LP_FEET=[1,-1].map(s=>({a:V(s*.16,D.ankY+.06,-11.78),t:V(s*.16,.09,-11.63),pole:V(s*.05,.5,1)})); // feet well inside the sled rails
// coming from the side (or leaving to it) each foot steps up over the near sled rail
const LP_STEP=LP_FEET.map((f,i)=>({...f,via:V(i?.32:.42,.8,-11.9)}));
ENTRY.legPress={pre:[.92,-12.2],face:-Math.PI/2,
  enter:(st,e)=>[{walk:[.58,-12.25],d:.7},{turn:0},
    {d:1.3,pose:legPressSit,props:plantFeet(st,LP_STEP)},
    {d:1.1,pose:c=>{st.P.sledAt(.86);poseLegPress(c,{...FORMS.good},{phase:3,k:0},1,st.P);},props:c=>lpHandles(c,st)}, // hands stay locked on the handles
    {call:()=>sayFor('Push the sled up, flip the safeties out, then go.',2.8)},{d:.6,anim:(c,k)=>{st.P.safety.forEach((h,i)=>h.rotation.z=(i?1:-1)*.9*k);poseLegPress(c,FORMS.good,{phase:3,k:0},1,st.P);}}],
  leave:(st,e)=>[{d:.7,pose:exP(1,3)},{d:.6,anim:(c,k)=>{st.P.safety.forEach((h,i)=>h.rotation.z=(i?1:-1)*.9*(1-k));poseLegPress(c,FORMS.good,{phase:3,k:0},1,st.P);}},
    {d:1.6,pose:legPressSit,props:(pf=>(c,k)=>{pf(c,k);lpHandles(c,st);})(plantFeet(st,LP_FEET))},
    {d:1.3,pose:c=>standPose(c,{x:.58,z:-12.25,h:Math.PI/2}),props:plantFeet(st,standFeet({x:.58,z:-12.25,h:Math.PI/2}).map((f,i)=>({...f,via:LP_STEP[i].via})))},{walk:[.92,-12.2],d:.7}]};
// leg extension: sit holding the handles with the knees tucked up over the shin pad, then drop the shins behind it
function legExtTuck(c){setRoot(c,qX(-12*DEG),LX.hip.clone().add(V(0,0,.04)));resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);const A=V(s*.15,.58,-11.76);legTo(c,sd,A,V(0,1,.3));footTo(c,sd,A.clone().add(V(0,-.14,.04)));
    armTo(c,sd,V(s*.27,LX.hip.y-.16,-12.15),{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.4,-.3,-1)});}}
const LX_TUCK=[1,-1].map(s=>({a:V(s*.15,.58,-11.76),t:V(s*.15,.44,-11.72),via:V(s*.3,.78,-11.45),pole:V(0,1,.3)}));
// feet along keyframed paths (canonical ankle A and toe T per key, smoothed between keys), legs re-solved after the blend.
// keys(s) -> [[k,A,T],...] with k from 0 to 1; rev plays the path backwards (k 1 -> 0)
function feetPath(st,keys,pole,rev){const K=[1,-1].map(s=>keys(s));return (c,k)=>{const kk=rev?1-k:k;
  [1,-1].forEach((s,i)=>{const ks=K[i];let j=0;while(j<ks.length-2&&kk>ks[j+1][0])j++;const a=ks[j],b=ks[j+1];const t=smooth(clamp((kk-a[0])/(b[0]-a[0]),0,1));
    const A=toW(st,a[1].clone().lerp(b[1],t)),T=toW(st,a[2].clone().lerp(b[2],t));legTo(c,sideOf(s),A,(typeof pole==='function'?pole(kk):pole).clone().normalize().applyQuaternion(st.q));footTo(c,sideOf(s),T);});c.root.updateMatrixWorld(true);};}
// heels resting on top of the pad -> lifted back over it, toes pointed down -> straight down behind it -> toes come forward under it
const LX_KEYS=s=>{const x=s*.13,y0=.66-D.shin;return [[0,V(s*.15,.58,-11.76),V(s*.15,.44,-11.72)],[.3,V(x,.6,-11.885),V(x,.46,-11.87)],
  [.75,V(x,y0+.03,-11.885),V(x,y0-.11,-11.86)],[1,V(s*.12,y0,-11.86),V(s*.12,y0,-11.71)]];};
// sit down sideways on the seat (feet still on the floor beside the machine), then swing the legs round in front of the seat into the tuck
const LX_SIDE={h:Math.PI/2,x:.04,y:LX.hip.y,z:-12.14,feet:[[.53,-12.27],[.53,-12.01]],lean:4}; // hands rest on the thighs
function legExtSide(c){sitAt(c,LX_SIDE);}
const LX_SWING=s=>{const f=LX_SIDE.feet[s>0?0:1];return [[0,V(f[0],D.ankY,f[1]),V(f[0]+.15,.03,f[1])],[.45,V(s>0?.44:.32,.53,-11.6),V(s>0?.5:.38,.45,-11.5)],[1,V(s*.15,.58,-11.76),V(s*.15,.44,-11.72)]];};
const LX_STAND=standFeet({x:.72,z:-12.14,h:Math.PI/2});
const LX_SEAT=LX_SIDE.feet.map(f=>({a:V(f[0],D.ankY,f[1]),t:V(f[0]+.15,D.ankY*.35,f[1]),pole:V(1,.25,0)}));
const LX_SWPOLE=k=>V(1,.25,0).lerp(V(0,1,.3),smooth(clamp(k/.5,0,1)));
ENTRY.legExt={pre:[1.0,-12.14],face:Math.PI/2, // turn round before reaching the machine, then back up to the seat
  enter:(st,e)=>[{walk:[.72,-12.14],back:true,d:.9},{d:1.2,pose:legExtSide,props:plantFeet(st,LX_SEAT)},{d:1.4,pose:legExtTuck,props:feetPath(st,LX_SWING,LX_SWPOLE)},
    {d:1.4,pose:exP(0,1),props:feetPath(st,LX_KEYS,V(0,1,.2))},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.8,pose:exP(0,1),props:extFollow(st.P)},{d:1.4,pose:legExtTuck,props:feetPath(st,LX_KEYS,V(0,1,.2),true)},{d:1.4,pose:legExtSide,props:feetPath(st,LX_SWING,LX_SWPOLE,true)},
    {d:1.2,pose:c=>standPose(c,{x:.72,z:-12.14,h:Math.PI/2}),props:plantFeet(st,LX_STAND)},{walk:[1.0,-12.14],d:.6}]};
// the lever pads follow the real shins while a pose blends (the pose only sets them for its end state)
function extFollow(P){return (c,k)=>{const A=toC(ST,wpos(c.bones.LeftFoot)),K=LX.knee;P.setKnee(Math.atan2(A.z-K.z,-(A.y-K.y)));};}
function curlFollow(P){return (c,k)=>{const A=toC(ST,wpos(c.bones.LeftFoot));const K=V(0,LC.padY+.06,LC.kneeZ);P.setKnee(Math.atan2(A.y-K.y,A.z-K.z));};}
// lying leg curl: from the side, hands on the pad, near knee up onto the pad, then the other, then lie down
// the lifter faces -z here, so the left leg is the one toward -x (the far side from where they stand)
// one knee up: the inner (left) knee onto the end of the pad, shin along it, the outer (right) foot still on the floor
const LC_TOP=LC.padY+.11; // knee and ankle joints resting on the pad (pad top + the leg's half thickness)
function legCurlKneeUp(c){setRoot(c,rootFromAxes(V(0,.6,-.8),V(0,-.8,-.6)),V(.24,.94,-11.1));resetRest(c);c.root.updateMatrixWorld(true);
  curlLeg(c,'Left',V(-.03,LC_TOP,-11.52),V(-.03,LC_TOP,-11.1));
  legTo(c,'Right',V(.5,D.ankY,-11.28),V(.25,.3,-1));footTo(c,'Right',V(.5,.03,-11.43));
  for(const s of[1,-1]){const side=sideOf(s),w=-s;armTo(c,side,V(w*.15,LC.padY+.06,-11.85),{hd:V(0,0,-1),pn:V(0,-1,0),pole:V(w*.5,.3,.6),curl:0});}}
// a kneeling leg: knee at K, shin lying back along the pad to the ankle at A, laces down
function curlLeg(c,sd,K,A){const H=wpos(c.bones[sd+'UpLeg']);legTo(c,sd,A,K.clone().sub(H.clone().lerp(A,.5)));footTo(c,sd,A.clone().add(V(0,-.05,.13)));}
// both knees on the pad, hands on the pad ahead
function legCurlKneel(c){setRoot(c,rootFromAxes(V(0,.75,-.66),V(0,-.66,-.75)),V(0,1.12,-11.42));resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const side=sideOf(s),w=-s;curlLeg(c,side,V(w*.11,LC_TOP,-11.6),V(w*.11,LC_TOP,-11.18));armTo(c,side,V(w*.18,LC.padY+.06,-12.05),{hd:V(0,0,-1),pn:V(0,-1,0),pole:V(w*.5,.3,.6),curl:0});}}
// legs while a curl entry blends: the knees slide along the pad top between the two poses' knees (never into it), the shins and feet
// turn smoothly from one pose's direction to the other's
function curlKnees(st){let ends=null;const grab_=c=>['Left','Right'].map(sd=>{const K=toC(st,wpos(c.bones[sd+'Leg'])),A=toC(st,wpos(c.bones[sd+'Foot'])),T=toC(st,wpos(c.bones[sd+'ToeBase']));return {K,s:A.clone().sub(K).normalize(),t:T.clone().sub(A).normalize()};});
  return (c,k)=>{const kk=ease(clamp(k,0,1));
  if(!ends){const a0=grab_(c);const snap=snapshot(c);const a=c.act_,S=a.steps[a.i];S.pose(c,1);frame(c,st);const a1=grab_(c);applySnap(c,snap);ends=[a0,a1];}
  // the knees slide along the pad; where the blended hips are too low for a thigh to reach the knee's spot, the body rides up (rocks back) instead
  const K=ends[0].map((e,i)=>e.K.clone().lerp(ends[1][i].K,kk));let lift=0;
  ['Left','Right'].forEach((sd,i)=>{const H=toC(st,wpos(c.bones[sd+'UpLeg']));const h2=D.thigh*D.thigh-Math.pow(K[i].z-H.z,2)-Math.pow(K[i].x-H.x,2);if(h2>0)lift=Math.max(lift,K[i].y+Math.sqrt(h2)-H.y);});
  if(lift>0){c.root.position.y+=lift;c.root.updateMatrixWorld(true);holdUpdate(c);}
  ['Left','Right'].forEach((sd,i)=>{const e0=ends[0][i],e1=ends[1][i];const H=toC(st,wpos(c.bones[sd+'UpLeg']));const d=K[i].clone().sub(H).normalize();
    const sh=e0.s.clone().lerp(e1.s,kk).normalize(),to=e0.t.clone().lerp(e1.t,kk).normalize();const q=st.q;
    legDir(c,sd,d.applyQuaternion(q),sh.applyQuaternion(q),to.applyQuaternion(q));});
  c.root.updateMatrixWorld(true);};}
// the inner foot lifts up and over the side of the pad onto it; the outer foot stays put
const LC_UP=[{a:V(-.03,LC_TOP,-11.1),t:V(-.03,LC_TOP-.05,-10.97),via:V(.46,1.05,-11.4),pole:V(0,-.2,-1)},{a:V(.5,D.ankY,-11.28),t:V(.5,.03,-11.43),pole:V(.25,.3,-1)}];
// then the outer foot comes up the same way (and goes down that way when getting off)
const LC_KN=[1,-1].map(s=>{const w=-s;return {a:V(w*.11,LC_TOP,-11.18),t:V(w*.11,LC_TOP-.05,-11.05),pole:V(0,-.4,-1),via:s<0?V(.6,1.05,-11.4):undefined};});
const LC_DOWN=[{...LC_UP[0],via:undefined},{...LC_UP[1],via:LC_KN[1].via}];
ENTRY.legCurl={pre:[.9,-11.3],face:-Math.PI/2,
  enter:(st,e)=>[{walk:[.56,-11.3],d:.7},{turn:Math.PI},
    {d:1.2,pose:legCurlKneeUp,props:plantFeet(st,LC_UP)},{d:1.2,pose:legCurlKneel,props:plantFeet(st,LC_KN)},{d:1.2,pose:exP(0,1),props:curlKnees(st)},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.7,pose:exP(0,1),props:curlFollow(st.P)},{d:1.2,pose:legCurlKneel,props:curlKnees(st)},{d:1.2,pose:legCurlKneeUp,props:plantFeet(st,LC_DOWN)},
    {d:1.2,pose:c=>standPose(c,{x:.56,z:-11.3,h:Math.PI/2}),props:plantFeet(st,standFeet({x:.56,z:-11.3,h:Math.PI/2}).map((f,i)=>i?f:{...f,via:LC_UP[0].via}))},{walk:[.9,-11.3],d:.6}]};
// standing calf raise: step up onto the block (balls of the feet on the edge), dip under the shoulder pads, stand up with them
function calfStand(c,P,drop){const ft=calfFeet(c,SC.stepY,SC.edgeZ,0);const A=ft[0].A;const hy=A.y+(D.hips.y-D.upLeg.y)+(D.thigh+D.shin)*.997-drop;
  standPose(c,{z:A.z,drop:D.hips.y-hy,arms:'none',feet:[[.11,0],[-.11,0]],stance:.11});
  for(const [i,s] of [1,-1].entries()){const sd=sideOf(s);legTo(c,sd,ft[i].A,V(0,.2,1));footTo(c,sd,ft[i].toe.clone().add(V(0,0,.05)));}
  const pads=Math.max(SC_REST,wpos(c.bones.LeftArm).y+.11);P.padsAt(pads);for(const s of[1,-1])armTo(c,sideOf(s),V(s*.3,pads-.1,-11.83),{hd:V(0,1,0),pn:V(0,0,-1),pole:V(s*.4,-1,-.3)});}
const SC_REST=1.56;const padsFollow=P=>(c,k)=>P.padsAt(Math.max(SC_REST,wpos(c.bones.LeftArm).y+.11));
const SC_FEET=()=>calfFeet(null,SC.stepY,SC.edgeZ,0).map(f=>({a:f.A,t:f.toe.clone().add(V(0,0,.05)),pole:V(0,.2,1)}));
ENTRY.standCalf={pre:[0,-12.75],face:0,
  enter:(st,e)=>[{walk:[0,-12.2],d:1.0},{d:1.0,pose:c=>calfStand(c,st.P,.14),props:(c,k)=>{plantFeet(st,SC_FEET())(c,k);padsFollow(st.P)(c,k);}},{d:.9,pose:exP(.5,3)},{d:.6,anim:exFrom(.5,1)}],
  leave:(st,e)=>[{d:.7,pose:exP(.5,3)},{d:.8,pose:c=>calfStand(c,st.P,.14),props:padsFollow(st.P)},{d:.9,pose:c=>standPose(c,{z:-12.2}),props:plantFeet(st,standFeet({z:-12.2}))},{walk:[0,-12.75],back:true,d:1.1}]};
// seated calf raise: sit with the balls of the feet on the step under the raised knee pad, pull the pad down onto the thighs
function seatCalfSit(c,P,padY,free){setRoot(c,qX(4*DEG),V(0,SCS.seatY+.1*D.s,-12.08));resetRest(c);c.root.updateMatrixWorld(true);const ft=calfFeet(c,SCS.stepY,SCS.edgeZ,0);
  for(const [i,s] of [1,-1].entries()){const sd=sideOf(s);legTo(c,sd,ft[i].A,V(0,.4,1));footTo(c,sd,ft[i].toe.clone().add(V(0,0,.05)));}
  const kn=wpos(c.bones.LeftLeg);const y=padY??kn.y+.08;P.padAt(y);const pz=kn.z-.11;P.pad.position.z=pz-P.lever.position.z;P.lever.updateMatrixWorld(true);
  const pw=V();P.pad.getWorldPosition(pw);ST.g.worldToLocal(pw);
  for(const s of[1,-1]){if(free){const K=wpos(c.bones[sideOf(s)+'Leg']),H=wpos(c.bones[sideOf(s)+'UpLeg']);armTo(c,sideOf(s),H.lerp(K,.6).add(V(s*.07,.05,0)),{hd:V(0,-.4,1),pn:V(-s,-.5,0),pole:V(s*.6,-.3,-.6),curl:.5});}
    else armTo(c,sideOf(s),pw.clone().add(V(s*.235,0,0)),{hd:V(0,-.3,1),pn:V(-s,0,0),pole:V(s*.5,-.3,-1),curl:.8});}return kn.y+.08;}
const SCS_FEET=()=>calfFeet(null,SCS.stepY,SCS.edgeZ,0).map(f=>({a:f.A,t:f.toe.clone().add(V(0,0,.05)),pole:V(0,.4,1)}));
const SCS_UP=1.0;
ENTRY.seatCalf={pre:[.8,-12.1],face:-Math.PI/2,
  enter:(st,e)=>[{walk:[.42,-12.1],d:.7},{turn:0},{d:.45,pose:c=>standPose(c,{x:.42,z:-12.1,h:0}),props:plantFeet(st,standFeet({x:.42,z:-12.1,h:0}))}, // arms settle at the sides before sitting (from a mid-swing arm the hand cut through the frame post)
    {d:1.0,pose:c=>seatCalfSit(c,st.P,SCS_UP),props:plantFeet(st,SCS_FEET())},
    {d:.9,anim:(c,k)=>{const y=seatCalfSit(c,st.P,SCS_UP);seatCalfSit(c,st.P,lerp(SCS_UP,y,smooth(k)));}},{d:.8,pose:exP(.5,3)},{d:.6,anim:exFrom(.5,1)}],
  leave:(st,e)=>[{d:.8,pose:exP(.5,3)},{d:.9,anim:(c,k)=>{const y=seatCalfSit(c,st.P,SCS_UP);seatCalfSit(c,st.P,lerp(y,SCS_UP,smooth(k)));}},
    {d:.6,pose:c=>seatCalfSit(c,st.P,SCS_UP,true)},{d:.9,pose:c=>standPose(c,{x:.42,z:-12.1,h:Math.PI/2}),props:plantFeet(st,standFeet({x:.42,z:-12.1,h:Math.PI/2}))},{walk:[.8,-12.1],d:.6}]};
// hip thrust: squat down to sit on the floor in front of the bench, legs out straight, roll the bar up the legs to the hips, then lean back on the bench edge
const HT_HIP=V(0,.13,-12.08);const HT_S=V(0,HT.benchY+.11,HT.benchZ+.2);
function htSitTuck(c){const S=HT_S;setRoot(c,rootFromAxes(V().subVectors(S,HT_HIP).normalize(),V(0,1,.3)),HT_HIP);resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);const A=V(s*.17,D.ankY,-11.5);legTo(c,sd,A,V(s*.15,1,.25));footTo(c,sd,A.clone().add(V(0,-.05,.15)));}
  for(const s of[1,-1])armTo(c,sideOf(s),V(s*.3,.01,-12.0),{hd:V(0,0,1),pn:V(0,-1,0),pole:V(s*.5,-.2,-1),curl:0});}
// legs straight; leanK 0 = leaning forward to the bar on the floor, 1 = back on the bench; barK rolls the bar from its home to the hips
function floorSitHT(c,P,barK,leanK=1,grip=1){const S=HT_S;const dirB=V().subVectors(S,HT_HIP).normalize(),dirF=V(0,.62,.78).normalize();
  setRoot(c,rootFromAxes(dirF.clone().lerp(dirB,leanK).normalize(),V(0,-.3,1).lerp(V(0,1,.3),leanK)),HT_HIP);resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);const A=V(s*.17,D.ankY,HT_HIP.z+(D.thigh+D.shin)*.985);legTo(c,sd,A,V(s*.1,1,.1));footTo(c,sd,A.clone().add(V(0,.02,.15)));}
  const T=torsoAxes(c);const hipBar=wpos(c.bones.Hips).addScaledVector(T.F,.17).add(V(0,.03,0));const b=P.home.clone().lerp(hipBar,barK);
  barHands(c,b,.33*D.s,{hd:V(0,0,1),pn:V(0,-1,0),pole:V(.4,1,-.4),curl:grip});P.bar.position.copy(b);}
const HT_TUCK=[1,-1].map(s=>({a:V(s*.17,D.ankY,-11.5),t:V(s*.17,.04,-11.35),pole:V(s*.15,1,.25)}));
ENTRY.hipThrust={pre:[.9,-11.8],face:-Math.PI/2,
  enter:(st,e)=>[{walk:[.4,-11.8],d:.8},{turn:0}, // turn clear of the bench, then shuffle back to it
    {d:1.0,pose:c=>{standPose(c,{z:-11.95,drop:.38,hinge:30,arms:'none'});armsHang(c);},props:plantFeet(st,standFeet({z:-11.95}))},
    {d:1.2,pose:htSitTuck,props:plantFeet(st,HT_TUCK)},
    {d:1.0,pose:c=>floorSitHT(c,st.P,0,0,.15)},{d:.35,anim:(c,k)=>floorSitHT(c,st.P,0,0,lerp(.15,1,smooth(k)))},{call:c=>grab(c,st.P.bar,'Left',{other:'Right',align:'bar'})},
    {d:1.4,anim:(c,k)=>floorSitHT(c,st.P,smooth(k),smooth(k))},{d:.9,pose:exP(0,1)},{d:1.0,anim:exFrom(0,1)},{call:c=>{c.hold=[];}}],
  // the bar stays in the hands (it follows them through every blend) until it is back on the floor and the hands open
  leave:(st,e)=>[{call:c=>grab(c,st.P.bar,'Left',{other:'Right',align:'bar'})},{d:.8,pose:exP(0,1)},{d:.9,pose:c=>floorSitHT(c,st.P,1,1)},{d:1.3,anim:(c,k)=>floorSitHT(c,st.P,1-smooth(k),1-smooth(k))},
    {call:c=>{c.hold=[];st.P.bar.position.copy(st.P.home);st.P.bar.quaternion.identity();}},{d:.35,anim:(c,k)=>floorSitHT(c,st.P,0,0,lerp(1,.15,smooth(k)))},
    {d:1.0,pose:htSitTuck,props:plantFeet(st,HT_TUCK)},
    {d:1.2,pose:c=>{standPose(c,{z:-11.95,drop:.38,hinge:30,arms:'none'});armsHang(c);},props:plantFeet(st,standFeet({z:-11.95}))},{d:.8,pose:c=>standPose(c,{z:-11.95}),props:plantFeet(st,standFeet({z:-11.95}))},{turn:Math.PI/2},{walk:[.9,-11.8],d:.7}]};
// Bulgarian split squat at the flat dumbbell bench: back to the bench, rear foot lifted behind then set on the bench
function bulgKneeBack(c){standDB(c,{z:-10.62});const A=V(-.11,.6,-10.95);legTo(c,'Right',A,V(0,-1,.4));footTo(c,'Right',A.clone().add(V(0,-.13,.04)));}
ENTRY.bulgarian={pre:[0,-10.0],face:0, // arrive already turned round (the walk's own turn), then step back to the bench
 
  enter:(st,e)=>[{turn:0},{walk:[0,-10.62],back:true,d:.9},{call:c=>{c.carry=null;}},{d:1.0,pose:c=>{standDB(c,{z:-10.62});}},{d:.8,pose:bulgKneeBack},{d:.9,pose:exP(1,3)}],
  leave:(st,e)=>[{d:.8,pose:exP(1,3)},{d:.8,pose:bulgKneeBack},{d:.8,pose:c=>standDB(c,{z:-10.62})},{call:c=>{c.carry='db';}},{walk:[0,-10.0],d:.9}]};
// Romanian deadlift from the platform: feet under the bar, hinge down with open hands, close the grip, deadlift it up, then into the RDL.
// On the way out the bar is lowered to the floor the same way and let go before standing up, so it never leaves the hands mid-air.
function rdlFloor(c,P,p,grip=1){deadliftPose(c,P,p);if(grip<1){curlHand(c,'Left',grip);curlHand(c,'Right',grip);}}
const RDL_HOLD=c=>grab(c,ST.P.bar,'Left',{other:'Right',align:'bar'});
ENTRY.rdlBar={pre:[0,-12.75],face:0,
  enter:(st,e)=>{const P=st.P;return [{walk:[0,-11.92],d:1.2},
    {d:1.3,anim:settle(c=>rdlFloor(c,P,0,.1))},
    {d:.45,anim:(c,k)=>rdlFloor(c,P,0,lerp(.1,1,smooth(k)))},{call:()=>e.coachIn&&sayFor(e.coachIn,2.6)},
    {d:1.6,anim:(c,k)=>rdlFloor(c,P,smooth(k))},
    {call:RDL_HOLD},{d:.8,pose:exP(1,3)},{call:c=>{c.hold=[];}}];},
  leave:(st,e)=>{const P=st.P;return [{call:RDL_HOLD},{d:.8,pose:c=>rdlFloor(c,P,1)},{call:c=>{c.hold=[];}},
    {d:1.6,anim:(c,k)=>rdlFloor(c,P,1-smooth(k))},
    {d:.4,anim:(c,k)=>rdlFloor(c,P,0,lerp(1,.1,smooth(k)))},
    {call:()=>{P.bar.position.copy(P.home);P.bar.quaternion.identity();}},
    {d:1.2,anim:settle(c=>standPose(c,{z:-11.92}))},{walk:[0,-12.75],back:true,d:1.4}];}};
// ---- the exercises
const LEG_CUES={};
defEx('squat',{group:'legs',name:'Back squat',eq:'Barbell',part:'Quads & glutes',station:'squatRack',entry:'rack',kind:'squat',pose:poseSquat,
  quip:'Sit down. Stand up. Repeat until philosophical.',
  mus:{quadV:[1,'m'],glute:[1,'m'],quadRF:[.35,'h'],adduct:[.7,'h'],hams:[.3,'h'],erect:[.55,'h'],gastroc:[.25,'h']},
  labels:[['Quads','quadV','m'],['Glutes','glute','m'],['Adductors','adduct','h']],center:V(0,.95,-11.95),cam:'frontQ',coachSpot:{p:[-1.4,-12.6],h:Math.PI/2-.4},
  steps:steps4([['Sit down between the heels','2 sec, brace'],['Hip crease below the knee','depth'],['Drive up','breathe out'],['Stand tall','reset the breath']]),
  stepText:['Big breath, brace, and sit down between your heels. Knees travel forward and out over the toes; that’s normal.','Hip crease below the top of the knee. Torso about 35° forward, bar over the middle of the foot.','Drive up, chest and hips rising together. Breathe out past the hardest part.','Stand tall with straight legs. Breathe and brace for the next rep.'],
  cues:[['Sit between your heels.'],['Below the knee.'],['Drive up, knees out.'],['Stand tall.']],
  beginner:'3 sets of 6–10, starting with the empty 20 kg bar. Set the safety arms at the height of the bar at the bottom.',
  forms:mk({lower:2.0,touch:.25,press:1.1,lock:.8,prof:'smooth'},{
    kneeIn:MS('Knees cave in','Knees drift inward on the way up','Both knees drift about 10 cm inward at the bottom.','The adductors take over and the glutes aren’t driving.','Repeated caving under load is linked with knee pain.','Push the knees out over the toes.',{kneeIn:1,meas:'fppa',warn:'Knees cave',warnAt:'knee',cam:'front',strain:['adduct']}),
    goodMorning:MS('Good-morning squat','Hips shoot up, chest drops','The hips rise first and the torso tips forward to about 60°.','The load moves from the quads to the lower back.','The lower back limits your squat; the quads get less work.','Chest up; knees and hips rise together.',{goodMorning:1,meas:'torsoBottom',warn:'Chest drops',warnAt:'lowback',cam:'sideHigh',strain:['erect']}),
    half:MS('Half squat','Stops well above parallel','The squat stops with the thighs well above parallel.','The glutes and adductors miss their hardest range.','Half squats grew the glutes about a third as much in one study.','Sit lower: hips below the knees.',{half:1,meas:'depth',warn:'Too shallow',warnAt:'hips',cam:'sideHigh'})})});
defEx('rdl',{group:'legs',name:'Romanian deadlift',eq:'Barbell',part:'Hamstrings',station:'platform',entry:'rdlBar',kind:'hinge',pose:poseRDL,
  quip:'A bow so deep your hamstrings applaud.',coachIn:'Lift it once from the floor, then hinge.',
  mus:{hams:[1,'m'],glute:[.85,'m'],erect:[.6,'h'],adduct:[.4,'h'],forearm:[.4,'h'],lats:[.25,'h']},
  labels:[['Hamstrings','hams','m'],['Glutes','glute','m'],['Lower back','erect','h']],center:V(0,.85,-11.95),cam:'sideFlat',coachSpot:{p:[-1.5,-11.4],h:Math.PI/2},
  steps:steps4([['Hips back, knees soft','3 sec'],['Bar just below the knees','hamstrings tight'],['Hips forward','stand up'],['Stand tall','bar on the thighs']]),
  stepText:['Push the hips back. The bar slides down the thighs; the knees stay softly bent the whole time.','Stop when the bar is just below the knees or the back wants to round. The hamstrings are stretched.','Drive the hips forward to stand up, bar sliding up the legs.','Stand tall, bar against the thighs. Breathe, then go again.'],
  cues:[['Hips back.'],['Feel the hamstrings.'],['Hips forward.'],['Stand tall.']],
  beginner:'3 sets of 8–10 with the empty bar. Stop lowering when the back wants to round; never bounce.',
  forms:mk({lower:3.0,touch:.3,press:1.1,lock:.6,prof:'smooth'},{
    round:MS('Rounded back','Back rounds at the bottom','The lower back rounds by about 30° at the bottom and the shoulders slump.','The spine, not the hamstrings, takes the stretch.','The classic deadlift-family back strain.','Chest proud, hinge at the hips.',{round:1,meas:'lumbar',warn:'Back rounds',warnAt:'lowback',cam:'sideFlat',strain:['erect']}),
    squat:MS('Squatting it','Knees bend a lot, hips drop','The knees bend to about 95° and the hips drop, like a squat.','It turns into a quad lift.','The hamstrings never get the stretch that grows them.','Knees stay soft, not bent.',{squat:1,meas:'rdlKnee',warn:'Knees bend',warnAt:'knee',cam:'sideFlat',mul:{quadV:1.5,hams:.6}}),
    drift:MS('Bar drifts forward','Bar floats away from the legs','The bar floats 8–10 cm in front of the thighs on the way down.','The lower back works at a long lever.','The back tires before the hamstrings do.','Drag the bar down your legs.',{drift:1,meas:'barThigh',warn:'Bar away from legs',warnAt:'lowback',cam:'sideFlat'})})});
defEx('bulgarian',{group:'legs',name:'Bulgarian split squat',eq:'Dumbbell',part:'Quads & glutes',station:'dbFlat',entry:'bulgarian',kind:'squat',pose:poseBulgarian,needs:'db',dbSize:'light',
  quip:'The exercise everyone loves to hate.',
  mus:{quadV:[1,'m'],glute:[1,'m'],gluteMed:[.7,'h'],hams:[.4,'h'],adduct:[.4,'h'],oblq:[.25,'h']},
  labels:[['Quads','quadV','m'],['Glutes','glute','m'],['Side glute (balance)','gluteMed','h']],center:V(0,.85,-11.0),cam:'sideFlat',coachSpot:{p:[-1.4,-10.6],h:Math.PI/2},
  steps:steps4([['Lower straight down','2 sec, torso forward'],['Rear knee near the floor','front thigh level'],['Push through the front foot','breathe out'],['Stand up','hips square']]),
  stepText:['Lower straight down with the torso leaning a little forward, about 13°.','Rear knee a hand’s width above the floor, front thigh about level.','Push through the whole front foot to stand up.','Back to the top, hips square to the front. We show the left leg; then switch.'],
  cues:[['Straight down.'],['Knee near the floor.'],['Push through the front foot.'],['Hips square.']],
  beginner:'3 sets of 8–10 per leg, bodyweight first. Add dumbbells once 10 clean reps feel steady.',
  forms:mk({lower:2.0,touch:.2,press:1.0,lock:.6,prof:'smooth'},{
    kneeIn:MS('Front knee caves','Front knee drops inward','The front knee drops 6–8 cm inside the foot at the bottom.','The side glute gives up and balance goes.','Knee pain as the sets add up.','Knee over the second toe.',{kneeIn:1,meas:'frontKnee',warn:'Knee caves',warnAt:'knee',cam:'front'}),
    close:MS('Foot too close','Front foot too near the bench','The front foot is too close to the bench, so the knee shoots forward and the heel lifts.','All knee, no hip, and wobbly.','The glutes miss out.','Step further out, heel down.',{close:1,meas:'heel',warn:'Heel lifts',warnAt:'knee',cam:'sideFlat'}),
    twist:MS('Hips twist','Hips rotate open toward the back leg','The pelvis rotates about 20° toward the back leg at the bottom.','The side glute stops stabilising.','Uneven load from side to side.','Hips square, face forward.',{twist:1,meas:'pelvisYaw',warn:'Hips twist',warnAt:'hips',cam:'front'})})});
defEx('legPress',{group:'legs',name:'Leg press',eq:'Machine',part:'Quads & glutes',station:'legPress',entry:'legPress',kind:'squat',pose:poseLegPress,
  quip:'A squat, lying down. Still not a nap.',
  mus:{quadV:[1,'m'],glute:[.8,'m'],quadRF:[.5,'h'],adduct:[.5,'h'],hams:[.2,'h'],gastroc:[.2,'h']},
  labels:[['Quads','quadV','m'],['Glutes','glute','m']],center:V(0,.8,-11.95),cam:'sideFlat',coachSpot:{p:[-1.3,-11.7],h:Math.PI/2},
  steps:steps4([['Lower the sled','2 sec'],['Knees at 90°','back on the pad'],['Press up','breathe out'],['Knees soft at the top','don’t lock']]),
  stepText:['Lower the sled slowly, knees tracking over the toes.','Stop with the knees at about 90°, lower back flat on the pad.','Press through the whole foot, breathing out.','Stop just short of straight knees, then lower again.'],
  cues:[['Lower slowly.'],['Back on the pad.'],['Press through the whole foot.'],['Don’t lock the knees.']],
  beginner:'3 sets of 10–12. Learn the safety handles first; never unlock them with the knees locked.',
  forms:mk({lower:2.0,touch:.2,press:1.0,lock:.6,prof:'smooth'},{
    deep:MS('Tailbone lifts','Going so deep the hips roll up','The sled goes so deep that the pelvis rolls and the lower back lifts off the pad.','The lower spine bends under the sled’s load.','The usual cause of leg-press back strain.','Stop where your hips stay down.',{deep:1,meas:'padGap',warn:'Hips roll off the pad',warnAt:'lowback',cam:'sideFlat',strain:['erect']}),
    lock:MS('Locked knees','Knees snap straight at the top','The knees snap to fully straight at the top with the sled on them.','Tension drops off the quads and the joint holds the weight.','Hyperextension stress on the knee.','Stop just short of straight.',{lockKnee:1,meas:'kneeTop',warn:'Knees locked',warnAt:'knee',cam:'sideFlat'}),
    heels:MS('Heels lift','Heels peel off, knees cave','The heels lift off the plate at the bottom and the knees drift in.','The knees and calves take the load.','Knee irritation.','Drive through the whole foot.',{heels:1,meas:'heelLift',warn:'Heels lift',warnAt:'knee',cam:'sideFlat'})})});
defEx('legExt',{group:'legs',name:'Leg extension',eq:'Machine',part:'Front of the thigh',station:'legExt',entry:'legExt',kind:'curl',pose:poseLegExt,
  quip:'Kick it straight. Hold. Feel the quad glow.',
  mus:{quadRF:[1,'m'],quadV:[1,'m']},
  labels:[['Quads (rectus femoris)','quadRF','m']],center:V(0,.6,-11.95),cam:'sideFlat',coachSpot:{p:[-1.3,-11.6],h:Math.PI/2},
  steps:steps4([['Lower slowly','2 sec'],['Knees at 90°','pad on the shins'],['Kick straight','one smooth push'],['Squeeze','one second']]),
  stepText:['Lower the pad slowly, about 2 seconds.','Knees back to about 90°. The back pad is reclined so the front of the thigh is stretched.','Straighten the legs in one smooth push. Hips stay on the seat.','Legs straight. Squeeze the front of the thigh for a second.'],
  cues:[['Two seconds down.'],['Hips down.'],['Kick it straight.'],['Hold one second.']],
  beginner:'3 sets of 10–15: the best first quad exercise. If the kneecap hurts at the top, stop short of straight.',
  forms:mk({lower:2.0,touch:.2,press:1.0,lock:1.0,prof:'smooth'},{
    hips:MS('Hips lift','Hips pop up to swing the weight','The hips rise off the seat and the torso rocks back to swing the weight up.','Momentum, not the quads, lifts it.','No progress, and bruises from the pad.','Hips down, grip the handles.',{hips:1,meas:'hipLift',warn:'Hips lift',warnAt:'hips',cam:'sideFlat'}),
    slam:MS('Dropping the weight','Pad drops and the stack slams','The pad drops in under half a second and the plates clank.','Half the rep, the lowering, is wasted.','Slower growth.','Lower for two seconds.',{lower:.45,touch:.05,meas:'lowerTime',warn:'Weight drops',warnAt:'knee',cam:'sideFlat'}),
    half:MS('Half reps','Legs never straighten','The legs stop at about 130° and never straighten.','The top squeeze, where the quads peak, is missing.','Less growth of the front of the thigh.','All the way straight.',{half:1,meas:'extTop',warn:'Stops short',warnAt:'knee',cam:'sideFlat'})})});
defEx('legCurl',{group:'legs',name:'Lying leg curl',eq:'Machine',part:'Hamstrings',station:'legCurl',entry:'legCurl',kind:'curl',pose:poseLegCurl,
  quip:'Heels to bum. Hamstrings file a complaint.',
  mus:{hams:[1,'m'],gastroc:[.45,'h'],glute:[.2,'h']},
  labels:[['Hamstrings','hams','m'],['Calves','gastroc','h']],center:V(0,.7,-11.7),cam:'sideFlat',coachSpot:{p:[-1.3,-11.6],h:Math.PI/2},
  steps:steps4([['Lower slowly','2 sec'],['Legs nearly straight','don’t lock'],['Curl heels to the bum','hips down'],['Squeeze','one second']]),
  stepText:['Lower the roller slowly, about 2 seconds.','Legs almost straight, roller behind the ankles.','Curl the heels toward your bum. Hips stay pressed into the pad.','Squeeze at the top for a second.'],
  cues:[['Two seconds down.'],['Almost straight.'],['Heels to the bum.'],['Squeeze.']],
  beginner:'3 sets of 10–15. Roller on the ankles, not the calves. The gym has no seated curl, which grows the hamstrings a bit more.',
  forms:mk({lower:2.0,touch:.2,press:1.0,lock:1.0,prof:'smooth'},{
    hips:MS('Hips lift','Hips rise off the pad','The hips rise off the pad, the hip angle changes about 20°, and the back arches to cheat.','The hip flexors and back do the lift.','Lower-back ache; hamstrings under-loaded.','Hips glued to the pad.',{hips:1,meas:'curlHip',warn:'Hips lift',warnAt:'hips',cam:'sideFlat'}),
    half:MS('Half curl','Heels stop halfway up','The curl stops at about 110° at the knee.','No peak squeeze.','Slower growth.','Heels all the way up.',{half:1,meas:'curlTop',warn:'Stops short',warnAt:'knee',cam:'sideFlat'}),
    drop:MS('Dropping the weight','Roller drops in a blink','The roller drops in under half a second and bounces.','Half the training effect is lost.','Fewer gains and bruised ankles.','Two seconds on the way down.',{lower:.45,touch:.05,meas:'lowerTime',warn:'Weight drops',warnAt:'knee',cam:'sideFlat'})})});
defEx('hipThrust',{group:'legs',name:'Barbell hip thrust',eq:'Barbell',part:'Glutes',station:'hipThrust',entry:'hipThrust',kind:'raise',pose:poseHipThrust,
  quip:'Glutes, meet gravity. Gravity, meet the padded bar.',
  mus:{glute:[1,'m'],gluteMed:[.6,'h'],hams:[.45,'h'],quadV:[.6,'h'],adduct:[.35,'h']},
  labels:[['Glutes','glute','m'],['Hamstrings','hams','h'],['Quads','quadV','h']],center:V(0,.45,-11.9),cam:'sideFlat',coachSpot:{p:[-1.5,-11.4],h:Math.PI/2},
  steps:steps4([['Lower slowly','1 sec'],['Hips near the floor','chin tucked'],['Drive the hips up','squeeze'],['Torso level','one second']]),
  stepText:['Lower the hips toward the floor under control.','Hips just off the floor. Upper back on the bench edge, chin tucked.','Drive the hips up through the heels until the torso is level.','Hold a second with the glutes squeezed: torso level, shins vertical.'],
  cues:[['Lower slowly.'],['Chin tucked.'],['Drive up.'],['Squeeze, ribs down.']],
  beginner:'3 sets of 10–12 with the empty bar (with a pad) or bodyweight first.',
  forms:mk({lower:1.0,touch:.3,press:1.0,lock:1.0,prof:'smooth'},{
    arch:MS('Arched lower back','Finishes by arching the back','The hips go past level and the lower back arches, ribs flared, head dropped back.','The lower back, not the glutes, closes the last part.','Lower-back ache, and the glutes never fully squeeze.','Ribs down, squeeze, no arch.',{arch:1,meas:'hipTop',warn:'Back arches',warnAt:'lowback',cam:'sideFlat',strain:['erect']}),
    far:MS('Feet too far out','Shins lean forward at the top','The feet are too far out, so the shins lean forward at the top.','The hamstrings take over.','Hamstring cramps and less glute work.','Shins straight up at the top.',{far:1,meas:'shinTop',warn:'Feet too far',warnAt:'knee',cam:'sideFlat',mul:{hams:1.6,glute:.8}}),
    half:MS('Half thrust','Hips stop below level','The hips stop well below level, at a hip angle of about 140°.','The glute’s hardest range, full extension, is skipped.','Less growth.','Hips all the way up.',{half:1,meas:'hipTop',warn:'Stops short',warnAt:'hips',cam:'sideFlat'})})});
defEx('standCalf',{group:'legs',name:'Standing calf raise',eq:'Machine',part:'Calves',station:'standCalf',entry:'standCalf',kind:'raise',pose:poseStandCalf,
  quip:'Tiptoes, but make it heavy.',
  mus:{gastroc:[1,'m'],soleus:[.9,'m']},
  labels:[['Calves (gastrocnemius)','gastroc','m'],['Soleus','soleus','m']],center:V(0,.7,-11.9),cam:'sideFlat',coachSpot:{p:[-1.3,-11.6],h:Math.PI/2},
  steps:steps4([['Lower the heels','2 sec'],['Pause in the stretch','one second'],['Rise onto the toes','high'],['Hold','one second']]),
  stepText:['Lower the heels slowly below the step.','Pause for a second with the calves fully stretched: this part grows them most.','Rise as high as you can onto the balls of your feet. Legs stay straight.','Hold at the top for a second, then lower.'],
  cues:[['Heels down slowly.'],['Pause. No bounce.'],['Up high.'],['Hold.']],
  beginner:'3 sets of 10–15 with a slow stretch.',
  forms:mk({lower:2.0,touch:1.0,press:1.0,lock:1.0,prof:'smooth'},{
    bounce:MS('Bouncing','Quick bounce at the bottom','The heels bounce off the bottom with no pause, under a second per rep.','The Achilles tendon springs the weight; the muscle works less.','Calves don’t grow; Achilles irritation.','Pause at the bottom, no bounce.',{bounce:1,lower:.5,touch:.12,press:.5,lock:.2,meas:'bottomPause',warn:'Bouncing',warnAt:'knee',cam:'sideFlat'}),
    half:MS('Half range','Heels never drop below the step','The heels never go below the step.','It skips the stretched position.','About half the growth.','Heels below the step.',{half:1,meas:'ankleBottom',warn:'No stretch',warnAt:'knee',cam:'sideFlat'}),
    knees:MS('Knees bend','Knees bend to help','The knees bend on each rep to help push.','The gastrocnemius goes slack.','It quietly becomes a soleus-only exercise.','Legs straight, calves only.',{knees:1,meas:'calfKnee',warn:'Knees bend',warnAt:'knee',cam:'sideFlat',mul:{quadV:1.4}})})});
defEx('seatCalf',{group:'legs',name:'Seated calf raise',eq:'Machine',part:'Calves (soleus)',station:'seatCalf',entry:'seatCalf',kind:'raise',pose:poseSeatCalf,
  quip:'Sit down, calves. This one’s for the soleus.',
  mus:{soleus:[1,'m'],gastroc:[.3,'h']},
  labels:[['Soleus','soleus','m'],['Calves (gastrocnemius)','gastroc','h']],center:V(0,.55,-11.9),cam:'sideFlat',coachSpot:{p:[-1.3,-11.6],h:Math.PI/2},
  steps:steps4([['Lower the heels','2 sec'],['Pause in the stretch','one second'],['Rise onto the toes','high'],['Hold','one second']]),
  stepText:['Lower the heels slowly below the step.','Pause for a second with the heels low.','Rise onto the balls of your feet, lifting the pad.','Hold at the top. Standing calf raises grow the soleus just as well; this is the soleus-biased option, not a must.'],
  cues:[['Heels down slowly.'],['Pause.'],['Up.'],['Hold.']],
  beginner:'3 sets of 12–20. Release and re-engage the stop with the heels up.',
  forms:mk({lower:2.0,touch:1.0,press:1.0,lock:1.0,prof:'smooth'},{
    bounce:MS('Bouncing','Quick bounce at the bottom','The heels bounce off the bottom with no pause.','Tendon rebound does the work.','No growth.','Slow at the bottom.',{bounce:1,lower:.5,touch:.12,press:.5,lock:.2,meas:'bottomPause',warn:'Bouncing',warnAt:'knee',cam:'sideFlat'}),
    half:MS('Half range','Heels stay level with the step','The heels stay level with the step.','No stretch.','About half the growth.','Heels all the way down.',{half:1,meas:'ankleBottom',warn:'No stretch',warnAt:'knee',cam:'sideFlat'}),
    knee:MS('Pad on the kneecap','Pad sits on the knees','The pad sits on the kneecaps instead of the thighs.','It hurts.','Bruised kneecaps, and people quit the exercise.','Pad on the thighs, not the knees.',{knee:1,meas:'padKnee',warn:'Pad on the kneecaps',warnAt:'knee',cam:'sideFlat'})})});

function layoutLegs(){
  makeStation('squatRack',-10.4,-8.8,Math.PI/2,g=>buildSquatRack(g),{name:'squat rack'});
  makeStation('hipThrust',-9.6,-16.9,Math.PI/2,g=>buildHipThrust(g),{name:'hip thrust bench'});
  makeStation('legPress',-9.4,-21.4,0,g=>buildLegPress(g),{name:'leg press'});
  makeStation('legExt',-6.6,-21.8,0,g=>buildLegExt(g),{name:'leg extension'});
  makeStation('legCurl',-4.0,-21.8,0,g=>buildLegCurl(g),{name:'leg curl'});
  makeStation('seatCalf',-1.4,-21.8,0,g=>buildSeatCalf(g),{name:'seated calf raise'});
  makeStation('standCalf',1.2,-21.8,0,g=>buildStandCalf(g),{name:'standing calf raise'});
}

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
  archPad:{pick:'max',get:c=>{const u=V().subVectors(wpos(c.bones.Spine2),wpos(c.bones.Hips)).normalize();const b=V(0,Math.sin(UPRIGHT*DEG),-Math.cos(UPRIGHT*DEG));return Math.acos(clamp(u.dot(b),-1,1))/DEG;},fmt:v=>v<10?'back flat on the pad':'lower back arches '+Math.round(v)+'° off the pad'},
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

// ---------------------------------------------------------------- arms: preacher bench, barbell rack pick-up
// preacher bench: the user sits facing +z, armpits on the top edge of a 45° pad; EZ bar on the rest in front
const PR={seatY:.63,seatZ:-12.23,footZ:-11.8,padTop:V(0,1.12,-11.98),padDir:V(0,-Math.SQRT1_2,Math.SQRT1_2),restY:.83,restZ:-11.555}; // the rest holds the bar where the hands are at the bottom of a rep
function buildPreacher(g){const P={};box(.36,.08,.3,M.pad,0,PR.seatY-.04,PR.seatZ,g);box(.07,PR.seatY-.08,.07,M.steel,0,(PR.seatY-.08)/2,PR.seatZ,g);
  // base: one rail down the middle with a cross foot at each end, so the feet stand on the floor either side of it
  box(.14,.05,1.1,M.black,0,.025,-11.95,g);for(const z of[-12.46,-11.44])box(.7,.05,.08,M.black,0,.025,z,g);
  const pad=box(.5,.08,.42,M.pad,0,0,0,g);const c=PR.padTop.clone().addScaledVector(PR.padDir,.2).add(V(0,-.05,-.05));pad.position.copy(c);pad.rotation.x=Math.PI/4;
  box(.08,.95,.08,M.steel,0,.47,-11.7,g);box(.04,.04,.3,M.steel,0,PR.restY-.3,PR.restZ+.14,g);box(.64,.04,.04,M.steel,0,PR.restY-.3,PR.restZ,g);for(const s of[1,-1]){box(.04,.3,.04,M.steel,s*.3,PR.restY-.15,PR.restZ,g);box(.05,.05,.06,M.red,s*.3,PR.restY-.02,PR.restZ,g);}
  P.bar=ezBar();g.add(P.bar);P.home=V(0,PR.restY+.01,PR.restZ);P.bar.position.copy(P.home);return P;}
// pick up a bar from the wall rack: canonical frame with the person at (0,-12) facing +z and the bar at (0,y,-11.55)
let BRACK=null;
function barFrame(which){const R=BRACK;const bar=which==='ez'?R.ez:R.straight;const w=bar.getWorldPosition(V());const rot=Math.PI/2;
  const g=new THREE.Group();g.rotation.y=rot;g.position.copy(w.clone().setY(0)).sub(V(0,0,-11.55).applyAxisAngle(V(0,1,0),rot));scene.add(g);g.updateMatrixWorld(true);
  return {g,q:qY(rot),rot,bar,y:w.y,pre:toW({g},V(0,0,-12.5)),home:{p:bar.position.clone(),parent:bar.parent}};}
function barPickPose(c,fr,k,grip,sup=true){const g=grip||.19;const b=bendToReach(fr.y,-11.55,{z:-11.8,back:.1,hmin:fr.y<.9?28:12,maxDrop:.3,dx:Math.max(0,g-D.shx)});
  standPose(c,{z:-11.8,hinge:b.hinge,drop:b.drop,back:.1,arms:'none',stance:.13});
  for(const s of[1,-1])armTo(c,sideOf(s),V(s*g,fr.y,-11.55),{hd:sup?V(0,-.7,-.7):V(0,-.6,.8),pn:sup?V(0,.4,-1):V(0,-1,0),pole:V(s*.5,.1,-.8),curl:k});}

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
  archBack:{pick:'max',get:c=>{const T=torsoAxes(c);const a=V().subVectors(wpos(c.bones.Spine1),wpos(c.bones.Hips)).normalize(),b=V().subVectors(wpos(c.bones.Neck),wpos(c.bones.Spine2)).normalize();
    return Math.atan2(V().crossVectors(a,b).dot(T.L),a.dot(b))/DEG*-1;},fmt:v=>v<13?'back stays flat':'lower back arches '+Math.round(v)+'°'},
  dipFlare:{at:'bottom',get:c=>{const T=torsoAxes(c);return avg2(s=>{const d=V().subVectors(wpos(c.bones[s+'ForeArm']),wpos(c.bones[s+'Arm'])).normalize();return Math.asin(Math.abs(clamp(d.dot(T.L),-1,1)))/DEG;});},fmt:v=>v<32?'elbows point back ('+Math.round(v)+'° out)':'elbows flare '+Math.round(v)+'° out'},
  ankleSwing:{pick:'range',get:c=>wpos(c.bones.LeftFoot).z*100,fmt:v=>v<6?'legs quiet':'legs swing '+Math.round(v)+' cm'},
});

// ---- getting on and off
// turn on the spot (canonical x, z) from heading h0 to h1 by stepping round: up to 60° per step, the feet lifting one after the
// other, instead of the walk clip swinging them; pf(c,{x,z,h}) is the standing pose (with whatever the hands are holding)
function turnSteps(x,z,h0,h1,pf=standPose,d=.7){const dh=angDiff(h1,h0);const n=Math.max(1,Math.ceil(Math.abs(dh)/(60*DEG)-1e-3));const out=[];
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
  enter:(st,e)=>[...turnSteps(0,-10.45,Math.PI,0,standDB),{call:c=>{c.carry=null;}},{d:1.2,anim:(c,k)=>{st.P.setAngle(lerp(st.P._ang??30,INC_CURL,smooth(k)));standDB(c,{z:-10.45});}},{call:()=>{st.P._ang=INC_CURL;}},{walk:[0,-11.08],back:true,land:1,d:1.1},
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
    flare:MS('Elbows flared','Elbows out, bar to the nipples','The elbows flare to 60–90° and the bar drifts up to the nipple line.','The chest and front shoulders take the load.','Shoulder stress; triceps undertrained.','Elbows brush the ribs.',{flare:78,touchZ:.04,meas:'flare',warn:'Elbows flared',warnAt:'shoulder',cam:'above',strain:['deltF'],mul:{pecL:1.4,triLat:.7}}),
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

// ---------------------------------------------------------------- core: poses, entries and the 7 exercises
// a body held in a straight line between two support points (planks), with the hips raised (+) or sagging (−)
function lineBody(c,S,A,up,sag,o={}){const hs=D.sh.clone().sub(D.hips).length();const H=S.clone().add(V().subVectors(A,S).setLength(hs)).addScaledVector(up,sag);
  setRoot(c,rootFromAxes(V().subVectors(S,H),o.front),H);resetRest(c);if(o.neck!==undefined)spineBend(c,0,{neck:o.neck,head:o.head||0});c.root.updateMatrixWorld(true);return H;}
// front plank on the forearms, head toward −z
function posePlank(c,F,b,u,P){const br=breatheOf(b)*.004;const S=V(0,.42+br,-12.36);const toe=V(0,.02,-10.98);const sag=F.sag?-.11:F.pike?.13:0;
  const H=lineBody(c,S,toe.clone().add(V(0,.11,0)),V(0,1,0),sag,{front:V(0,-1,0),neck:F.head?.55:-.2,head:F.head?.3:-.15});
  if(F.head){clav(c,{shrug:.25});c.root.updateMatrixWorld(true);}
  for(const s of[1,-1]){const side=sideOf(s),w=-s;const A=V(w*.09,.12,toe.z-.05);legTo(c,side,A,V(0,-1,0));aim(c.bones[side+'Foot'],c.bones[side+'ToeBase'],V(A.x,.02,A.z+.14));
    const sh=wpos(c.bones[side+'Arm']);const E=V(sh.x*.9,.06,sh.z+.01);const hand=V(w*.07,.04,E.z-D.fore*.95);aim(c.bones[side+'Arm'],c.bones[side+'ForeArm'],E);aim(c.bones[side+'ForeArm'],c.bones[side+'Hand'],hand);
    setHandWorld(c.bones[side+'Hand'],side==='Left',V(-w*.25,0,-1).normalize(),V(0,-1,0));curlHand(c,side,.8);}
  c._S=S;c._T=toe;c._H=H;return u;}
// side plank on the right forearm, chest facing +x, head toward −z
function poseSidePlank(c,F,b,u,P){const br=breatheOf(b)*.004;const sag=F.down?-.12:F.sag?-.12:0;const roll=(F.roll?27:0)*DEG;
  const S=V(.0,(F.down?.33:.44)+br,-12.36),toe=V(0,.05,-10.95);const front=V(Math.cos(roll),-Math.sin(roll),0);
  const H=lineBody(c,S,toe.clone().add(V(0,.06,0)),V(0,1,0),sag,{front,neck:.05});
  if(F.shrug){clav(c,{shrug:.35});c.root.updateMatrixWorld(true);}
  const T=torsoAxes(c);
  legTo(c,'Right',V(-.0,.07,toe.z),T.F.clone());footTo(c,'Right',V(.12,.03,toe.z+.02));legTo(c,'Left',V(.05,.17,toe.z-.02),T.F.clone());footTo(c,'Left',V(.17,.15,toe.z));
  const sh=wpos(c.bones.RightArm);const E=V(sh.x+(F.shrug?.0:.0),.05,sh.z+(F.shrug?-.1:0));aim(c.bones.RightArm,c.bones.RightForeArm,E);aim(c.bones.RightForeArm,c.bones.RightHand,E.clone().add(V(D.fore*.95,0,0)));
  setHandWorld(c.bones.RightHand,false,V(1,0,0),V(0,-1,0));curlHand(c,'Right',.7);
  // top hand on the hip
  armTo(c,'Left',wpos(c.bones.Hips).addScaledVector(T.L,.16).add(V(0,.05,0)),{hd:T.U.clone().negate(),pn:T.L.clone().negate(),pole:T.F.clone().negate().addScaledVector(T.L,.3),curl:.3});
  c._S=S;c._T=toe;c._H=H;c._E=E;return u;}
// dead bug: on the back, head toward −z; opposite arm and leg reach (sides alternate every rep)
function poseDeadBug(c,F,b,u,P){const k=smooth(1-clamp(u,0,1));const side=rep%2?1:-1;const arch=F.arch?.6*k:0,lift=F.head?.3:0;
  const H=V(0,.12,-11.85);setRoot(c,rootFromAxes(V(0,arch*.55,-1).normalize(),V(0,1,arch*.55).normalize()),H);resetRest(c);
  spineBend(c,-arch*.9+lift*.45,{neck:lift*1.4,head:lift*.3});clav(c,{shrug:.05});c.root.updateMatrixWorld(true);
  const T=torsoAxes(c);
  for(const s of[1,-1]){const sd=sideOf(s);const reachLeg=s===-side;const reachArm=s===side;
    // legs: table top (hip 90, knee 90) → hip opens toward the floor
    const hipOpen=reachLeg?lerp(0,F.fast?60:52,k)*DEG:0;const thigh=V(0,Math.cos(hipOpen),Math.sin(hipOpen));const shin=V(0,-Math.sin(hipOpen)*.1,1).normalize();
    legDir(c,sd,thigh.clone().add(V(-s*.04,0,0)),thigh.clone().applyAxisAngle(V(1,0,0),Math.PI/2),V(0,1,.3));
    const ar=reachArm?lerp(0,(F.fast?80:75),k)*DEG:0;const ua=V(0,Math.cos(ar),-Math.sin(ar)).add(V(-s*.06,0,0)).normalize();armDir(c,sd,ua,ua,V(s,0,0),{curl:.4});}
  c._H=H;return u;}
// hanging knee raise in the captain's chair (forearms on the pads, back on the pad)
function poseKneeRaise(c,F,b,u,P){const k=smooth(clamp(u,0,1));const sway=F.swing?.09*Math.sin(Math.PI*2*((repT/repLength())%1)):0;const tilt=F.hips?0:24*k;
  const S=V(0,DIP_Y+.04+.31+(F.shrug?-.05*0:0),-12.27+sway*.3);const H=V(0,S.y-.48,-12.31+sway);
  const up=V().subVectors(S,H).normalize().applyAxisAngle(V(1,0,0),-tilt*DEG);setRoot(c,rootFromAxes(up,V(0,0,1).applyAxisAngle(V(1,0,0),-tilt*DEG)),H);resetRest(c);spineBend(c,tilt*DEG);clav(c,{shrug:F.shrug?.35:-.02});c.root.updateMatrixWorld(true);
  const T=pelvisAxes(c);const hip=lerp(5,F.hips?100:105,k)*DEG,knee=lerp(8,90,k)*DEG;
  for(const s of[1,-1]){const sd=sideOf(s);const ta=T.U.clone().negate().applyAxisAngle(T.L,-hip).addScaledVector(T.L,s*.03).normalize();const sa=ta.clone().applyAxisAngle(T.L,knee).normalize();legDir(c,sd,ta,sa,ta.clone().cross(T.L).negate());
    const hx=D.shx+.06*D.s;const E=V(s*hx,DIP_Y+.1,-12.28);aim(c.bones[sd+'Arm'],c.bones[sd+'ForeArm'],E);const Hd=V(s*hx,DIP_Y+.1,-11.95);aim(c.bones[sd+'ForeArm'],c.bones[sd+'Hand'],Hd);
    setHandWorld(c.bones[sd+'Hand'],s>0,V(0,0,1),V(0,-1,0));curlHand(c,sd,1);}
  c._H=H;return u;}
// kneeling cable crunch at the column (rope at the top), facing the tower
function poseCableCrunch(c,F,b,u,P){const k=smooth(clamp(u,0,1));P.use('rope');P.setPulley(2.0);
  const hipFlex=F.hinge?lerp(25,85,k):F.sit?lerp(30,95,k):lerp(28,32,k);const spine=F.hinge?0:lerp(-6,48,k);
  const z=-11.55;const H=V(0,(F.sit?lerp(D.thigh+.07,.3,k):D.thigh+.07)*1,z-.04);const q=qX(hipFlex*DEG);
  setRoot(c,q,H);resetRest(c);spineBend(c,spine*DEG,{neck:.25,head:.05});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);const K=V(s*.12,.07,z);const A=V(s*.1,.09,z-D.shin*.98);legTo(c,sd,F.sit?A.clone().add(V(0,0,.1)):A,V(0,0,1).add(V(0,.3,0)));footTo(c,sd,A.clone().add(V(0,-.06,-.19)));}
  const head=wpos(c.bones.Head);const T=torsoAxes(c);const pull=F.arms?.18*k:0;const hands=[];
  for(const s of[1,-1]){const sd=sideOf(s);const ct=head.clone().addScaledVector(T.L,s*.1).addScaledVector(T.F,.06+pull).addScaledVector(T.U,-.04-pull*.6);hands.push(ct);
    armTo(c,sd,ct,{hd:T.U.clone(),pn:T.L.clone().multiplyScalar(-s),pole:T.U.clone().negate().addScaledVector(T.F,.4)});}
  const mid=hands[0].clone().add(hands[1]).multiplyScalar(.5).add(V(0,.1,.06));P.ropeAt(mid,hands[0],hands[1]);P.cableTo(mid);P.stackTop.position.y=.05+.22*k;c._hf=hipFlex;return u;}
// Pallof press: side-on to the column (tower on the lifter's left), press the handle straight out from the chest
function posePallof(c,F,b,u,P){const k=smooth(clamp(u,0,1));P.use('dh');P.setPulley(1.32);
  standPose(c,{z:-12.15,h:-Math.PI/2,drop:.04,stance:.17,arms:'none',look:0,twist:F.twist?24*k:0,side:F.lean?-26:0});const T=torsoAxes(c);
  const st=wpos(c.bones.Spine2).addScaledVector(T.F,.17).addScaledVector(T.U,-.04);const reach=(D.arm+D.fore)*.88;
  const out=F.drift?T.F.clone().applyAxisAngle(V(0,1,0),-.3):T.F.clone();const ct=st.clone().addScaledVector(out,reach*k+.06);
  for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().addScaledVector(T.L,s*.025),{hd:out.clone(),pn:T.L.clone().multiplyScalar(-s),pole:T.U.clone().negate().addScaledVector(T.L,s*.4)});
  P.dh.position.copy(ct);P.dh.quaternion.setFromUnitVectors(V(1,0,0),V(0,1,0));P.cableTo(ct);P.stackTop.position.y=.12;c._st=st;return u;}
// ab wheel rollout from the knees, rolling toward −z
const WHEEL_HD=V(0,-.3,-1),WHEEL_PN=V(0,-1,.3); // hands on the wheel: fingers forward and down, palms down
function poseAbWheel(c,F,b,u,P){const k=smooth(1-clamp(u,0,1));const out=F.shortR?.32:1;const kk=k*out;
  const K=V(0,.07,-11.1);const wz=lerp(-11.75,-12.6,kk);const W=V(0,.08,wz);if(P.wheel)P.wheel.position.copy(W);
  const hipAng=lerp(95,F.shortR?118:158,kk);const L=D.sh.clone().sub(D.hips).length();
  // hips sit over the knees at the start and move forward as the wheel rolls
  const H=V(0,lerp(D.thigh+.07,.42,kk)-(F.arch?.09*kk:0),lerp(-11.12,-11.45,kk));
  const sink=F.bend&&b.phase===2?.14*Math.sin(Math.PI*b.k):0;const shY=lerp(.575,.38,kk)-sink,shZ=lerp(-11.75,-12.0-kk*.15,kk)+sink*.4;const S=V(0,shY,shZ);const dir=V().subVectors(S,H).normalize();
  setRoot(c,rootFromAxes(dir,V(0,-1,0).applyAxisAngle(V(1,0,0),0)),H);resetRest(c);spineBend(c,F.arch?-.5*kk:.08,{neck:-.4,head:-.1});c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const side=sideOf(s),w=-s;const Kp=K.clone().add(V(w*.12,0,0));const A=Kp.clone().add(V(0,.02,D.shin*.98));legTo(c,side,A,V(0,-1,-.3));footTo(c,side,A.clone().add(V(0,-.055,.19)));}
  // the wheel is where the hands can hold it: an arm's length (elbows soft, or bent for the mistake) out in front of the shoulders
  // (solved for the wrist, which sits palm-and-grip back from the handle along the hand: armTo's own offset)
  {const Sl=wpos(c.bones.LeftArm);const el=(F.bend?lerp(176,110,clamp(1-u,0,1)):176)*DEG;const a=D.arm,b=D.fore,dW=Math.sqrt(a*a+b*b-2*a*b*Math.cos(el));
    const hd=WHEEL_HD.clone().normalize(),pn=WHEEL_PN.clone().addScaledVector(hd,-WHEEL_PN.dot(hd)).normalize();const o=hd.multiplyScalar(.075*D.s).addScaledVector(pn,.022*D.s);
    const wr=V(-.09-o.x,W.y-o.y,0);const dx=wr.x-Sl.x,dy=wr.y-Sl.y;W.z=Sl.z+o.z-Math.sqrt(Math.max(.0025,dW*dW-dx*dx-dy*dy));}
  if(P.wheel)P.wheel.position.copy(W);
  for(const s of[1,-1]){const side=sideOf(s),w=-s;armTo(c,side,W.clone().add(V(w*.09,.0,0)),{hd:WHEEL_HD,pn:WHEEL_PN,pole:V(w*.4,.3,1)});}
  c._hipAng=hipAng;c._W=W;return u;}
function buildAbWheel(g){const w=new THREE.Group();g.add(w);const r=cyl(.08,.07,M.black,0,0,0,'x',w,20);cyl(.012,.3,M.steel,0,0,0,'x',w,8);for(const s of[1,-1])cyl(.018,.09,M.red,s*.12,0,0,'x',w,8);w.position.copy(WHEEL_HOME);w.userData.prop=true;return w;}
const WHEEL_HOME=V(-.42,.08,-11.7); // parked beside the mat, where no plank or push-up lies

Object.assign(MEAS,{
  plankSag:{pick:'abs',get:c=>{const S=c._S,T=c._T.clone().add(V(0,.11,0)),H=wpos(c.bones.Hips);const t=clamp((H.z-S.z)/(T.z-S.z),0,1);return (lerp(S.y,T.y,t)-H.y)*100;},fmt:v=>Math.abs(v)<3?'body in one straight line':v>0?'hips '+Math.round(v)+' cm too low':'hips '+Math.round(-v)+' cm too high'},
  headDrop:{pick:'max',get:c=>{const T=torsoAxes(c);const h=V().subVectors(wpos(c.bones.Head),wpos(c.bones.Neck)).normalize();return Math.acos(clamp(h.dot(T.U),-1,1))/DEG;},fmt:v=>v<18?'head in line with the body':'head drops '+Math.round(v)+'°'},
  sideSag:{pick:'abs',get:c=>{const S=c._S,T=c._T.clone().add(V(0,.06,0)),H=wpos(c.bones.Hips);const t=clamp((H.z-S.z)/(T.z-S.z),0,1);return (lerp(S.y,T.y,t)-H.y)*100;},fmt:v=>Math.abs(v)<3?'hips up, body straight':'hips sag '+Math.round(v)+' cm'},
  pelvisRoll:{pick:'max',get:c=>{const L=pelvisAxes(c).L;return Math.abs(Math.asin(clamp(L.x,-1,1))/DEG);},fmt:v=>v<10?'hips stacked':'hips roll '+Math.round(v)+'° toward the floor'},
  elbowUnder:{pick:'max',get:c=>c._E?Math.abs(c._E.z-wpos(c.bones.RightArm).z)*100:0,fmt:v=>v<4?'elbow under the shoulder':'elbow '+Math.round(v)+' cm out of line'},
  backGap:{pick:'max',get:c=>Math.max(0,(wpos(c.bones.Spine1).y-wpos(c.bones.Hips).y-.0)*100+0),fmt:v=>v<3?'lower back stays down':'lower back lifts '+Math.round(v)+' cm'},
  moveTime:{get:(c,x)=>x.F.lower,fmt:v=>v>=1.8?'each reach takes '+v.toFixed(1)+' s':'limbs swing in '+v.toFixed(1)+' s'},
  headLift:{pick:'max',get:c=>{const h=wpos(c.bones.Head),n=wpos(c.bones.Neck);const skull=h.clone().addScaledVector(h.clone().sub(n).normalize(),.09*D.s);return Math.max(0,(skull.y-.1*D.s)*100);},fmt:v=>v<4?'head rests on the mat':'head lifts '+Math.round(v)+' cm'},
  hipSway:{pick:'range',get:c=>wpos(c.bones.Hips).z*100,fmt:v=>v<5?'no swinging':'hips swing '+Math.round(v)+' cm'},
  pelvisCurl:{pick:'range',get:c=>{const U=pelvisAxes(c).U;return Math.atan2(U.z,U.y)/DEG;},fmt:v=>v>=12?'pelvis curls up '+Math.round(v)+'°':'pelvis stays still (only the hip flexors lift)'},
  crunchHip:{pick:'range',get:c=>c._hf||0,fmt:v=>v<12?'hips stay still':'hips fold '+Math.round(v)+'°'},
  handHead:{pick:'max',get:c=>gripPoint(c,'Left').distanceTo(wpos(c.bones.Head))*100-14,fmt:v=>v<6?'rope stays by the head':'hands drift '+Math.round(v)+' cm from the head'},
  shoulderYaw:{at:'top',get:c=>{const L=torsoAxes(c).L,P2=pelvisAxes(c).L;return Math.acos(clamp(L.dot(P2),-1,1))/DEG;},fmt:v=>v<8?'shoulders stay square':'shoulders twist '+Math.round(v)+'°'},
  sideLean2:{pick:'max',get:c=>{const u=V().subVectors(wpos(c.bones.Neck),wpos(c.bones.Hips)).normalize();return Math.abs(Math.asin(clamp(u.dot(pelvisAxes(c).L),-1,1))/DEG);},fmt:v=>v<6?'standing tall':'leaning '+Math.round(v)+'° away'},
  handMid:{at:'top',get:c=>{const T=torsoAxes(c);return Math.abs(V().subVectors(gripPoint(c,'Left').add(gripPoint(c,'Right')).multiplyScalar(.5),c._st).dot(T.L))*100;},fmt:v=>v<6?'hands straight out from the chest':'hands drift '+Math.round(v)+' cm toward the tower'},
  wheelHip:{at:'bottom',get:c=>c._hipAng||0,fmt:v=>v>=145?'hips open to '+Math.round(v)+'°':'hips stay back ('+Math.round(v)+'°)'},
  wheelArch:{at:'bottom',get:c=>{const a=V().subVectors(wpos(c.bones.Spine1),wpos(c.bones.Hips)).normalize(),b2=V().subVectors(wpos(c.bones.Neck),wpos(c.bones.Spine2)).normalize();return Math.acos(clamp(a.dot(b2),-1,1))/DEG;},fmt:v=>v<12?'back stays flat at full reach':'lower back arches '+Math.round(v)+'°'},
  wheelElbow:{pick:'min',get:c=>avg2(s=>elbowAng(c,s)),fmt:v=>v>=165?'arms stay straight':'elbows bend to '+Math.round(v)+'°'},
});
MEAS.backGap.get=c=>{const sp=wpos(c.bones.Spine1).y,h=wpos(c.bones.Hips).y;return Math.max(0,(sp-h-.01)*100);};

// ---- getting on and off (every change of pose is a settle: the feet stay on the floor while the body moves)
// sitting on the mat facing −z, legs out, hands by the hips (between kneeling and lying on the side)
function sitMat(c){const H=V(0,.11,-11.6);setRoot(c,qY(Math.PI).multiply(qX(-8*DEG)),H);resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s),w=-s;legTo(c,sd,V(w*.14,.09,-12.05),V(0,1,-.4));}armsHang(c);}
// sitting on the mat facing +z, knees up, hands propped on the floor behind (between standing and lying on the back)
function sitMatBack(c){setRoot(c,qX(-24*DEG),V(0,.12,-11.78));resetRest(c);c.root.updateMatrixWorld(true);
  for(const s of[1,-1])legTo(c,sideOf(s),V(s*.14,.09,-11.4),V(0,1,.4));
  for(const s of[1,-1])armTo(c,sideOf(s),V(s*.3,.03,-12.0),{hd:V(s*.3,0,-1),pn:V(0,-1,0),pole:V(s*.5,.3,-.6),curl:.2});}
// lying on the back, knees bent, feet on the mat
function lieBack(c){setRoot(c,qX(0),V(0,.11,-11.83));resetRest(c);c.root.updateMatrixWorld(true);for(const s of[1,-1])legTo(c,sideOf(s),V(s*.14,.09,-11.4),V(0,1,.4));armsHang(c);}
// kneeling bent forward, right hand on the right knee, the left hand round the near handle of the wheel parked beside the mat
function wheelReach(c){kneelPose(c,{z:-11.1,lean:100,arms:'none'});
  armTo(c,'Right',wpos(c.bones.RightLeg).add(V(.02,.07,-.03)),{hd:V(0,-.4,-1),pn:V(0,-1,0),pole:V(.5,-.3,.6),curl:.4});
  armTo(c,'Left',WHEEL_HOME.clone().add(V(-.09,0,0)),{hd:V(0,-.3,-1),pn:V(0,-1,.3),pole:V(-.4,.3,1)});}
// the wheel rides in the left hand between its parking spot and the start of the rollout
function wheelFollow(c){ST.P.wheel.position.copy(toC(ST,gripPoint(c,'Left')).add(V(.09,0,0)));}
// standing in the captain's chair with the elbows raised in front, forearms up, so they clear the handles
function chairArmsUp(c){standPose(c,{z:-12.2,arms:'none'});for(const s of[1,-1])armDir(c,sideOf(s),V(s*.15,-.35,1),V(0,1,.12),V(-s,0,0),{curl:.3});}
// forearms on the pads while still standing: the shoulders are lower than when hanging, so the elbows sit a little outside the pads
function chairArmsOn(c){standPose(c,{z:-12.2,arms:'none'});const hx=D.shx+.06*D.s;c.root.updateMatrixWorld(true);
  for(const s of[1,-1]){const sd=sideOf(s);aim(c.bones[sd+'Arm'],c.bones[sd+'ForeArm'],V(s*(hx+.14),DIP_Y+.08,-12.2));aim(c.bones[sd+'ForeArm'],c.bones[sd+'Hand'],V(s*hx,DIP_Y+.11,-11.95));
    setHandWorld(c.bones[sd+'Hand'],s>0,V(-s*.3,0,1).normalize(),V(0,-1,0));curlHand(c,sd,1);}}
const MAT={land:1,pre:[0,-10.45],face:Math.PI};
ENTRY.matPlank={...MAT,enter:(st,e)=>[{walk:[0,-10.85],land:1,d:.6},{d:1.0,anim:settle(c=>kneelPose(c,{z:-11.6}))},{d:1.0,anim:settle(allFours)},{d:1.2,anim:settle(exP(1,3))}],
  leave:(st,e)=>[{d:1.0,anim:settle(allFours)},{d:1.0,anim:settle(c=>kneelPose(c,{z:-11.6}))},{d:1.1,anim:settle(c=>standPose(c,{z:-11.1,h:Math.PI}))},{walk:[0,-10.45],land:1,d:.9}]};
ENTRY.matSide={...MAT,enter:(st,e)=>[{walk:[0,-10.85],land:1,d:.6},{d:1.0,anim:settle(c=>kneelPose(c,{z:-11.6}))},{d:1.2,anim:settle(sitMat,{arc:V(.3,.1,0)})},{d:1.3,anim:settle(c=>poseSidePlank(c,{down:1},{phase:3,k:0},1,st.P),{arc:V(.25,.08,0)})},{d:1.1,anim:settle(exP(1,3))}],
  leave:(st,e)=>[{d:1.0,anim:settle(c=>poseSidePlank(c,{down:1},{phase:3,k:0},1,st.P))},{d:1.1,anim:settle(sitMat,{arc:V(.25,.08,0)})},{d:1.2,anim:settle(c=>kneelPose(c,{z:-11.6}),{arc:V(.3,.1,0)})},{d:1.1,anim:settle(c=>standPose(c,{z:-11.1,h:Math.PI}))},{walk:[0,-10.45],land:1,d:.9}]};
ENTRY.matBack={...MAT,enter:(st,e)=>[{walk:[0,-11.35],land:1,d:.9},...turnSteps(0,-11.35,Math.PI,0),{d:1.1,anim:settle(sitMatBack)},{d:1.0,anim:settle(lieBack)},{d:1.2,anim:settle(exP(1,3),{kneeUp:1})}],
  leave:(st,e)=>[{d:1.6,anim:settle(lieBack,{kneeUp:1})},{d:1.0,anim:settle(sitMatBack)},{d:1.1,anim:settle(c=>standPose(c,{z:-11.35}))},...turnSteps(0,-11.35,0,Math.PI),{walk:[0,-10.45],land:1,d:.9}]};
ENTRY.matWheel={...MAT,enter:(st,e)=>[{walk:[0,-10.85],land:1,d:.6},{d:1.0,anim:settle(c=>kneelPose(c,{z:-11.1}))},{d:1.0,anim:settle(wheelReach)},{d:1.0,anim:settle(exP(1,3)),props:wheelFollow}],
  leave:(st,e)=>[{d:.9,pose:exP(1,3),props:wheelFollow},{d:1.0,anim:settle(wheelReach),props:wheelFollow},{d:.9,anim:settle(c=>kneelPose(c,{z:-11.1}))},{call:()=>st.P.wheel.position.copy(WHEEL_HOME)},{d:1.0,anim:settle(c=>standPose(c,{z:-10.85,h:Math.PI}))},{walk:[0,-10.45],land:1,d:.6}]};
ENTRY.chair={land:1,pre:[0,-10.8],face:Math.PI,
  enter:(st,e)=>[...turnSteps(0,-10.8,Math.PI,0),{walk:[0,-11.3],back:true,land:1,d:1.4},{d:.6,anim:settle(c=>standPose(c,{z:-11.3,armOut:.6}))},...shuffle(-11.3,-12.2),{d:1.0,anim:settle(chairArmsUp)},{d:.7,anim:settle(chairArmsOn)},{d:.7,anim:settle(exP(0,1))},{d:1.3,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:1.4,pose:exP(0,1)},{d:.8,anim:settle(chairArmsOn)},{d:1.0,anim:settle(chairArmsUp)},{d:1.0,anim:settle(c=>standPose(c,{z:-12.2,armOut:.6}))},...shuffle(-12.2,-11.3),{walk:[0,-10.8],land:1,d:1.4}]};
// cable crunch: take the rope standing, kneel down with it, then crunch; the rope, cable and stack follow the hands
function ropeHandsStanding(c){standPose(c,{z:COL_Z,arms:'none'});const P=ST.P;const p=P.pulW().add(P.hang);
  for(const s of[1,-1])armTo(c,sideOf(s),p.clone().add(V(s*.045,-.22,0)),{hd:V(0,1,0),pn:V(-s,0,0),pole:V(s*.3,-1,-.3)});}
// hands brought up in front of the chest first, so the arms do not swing out through the tower on their way up to the rope
function handsAtChest(c){standPose(c,{z:COL_Z,arms:'none'});const T=torsoAxes(c);const ct=wpos(c.bones.Spine2).addScaledVector(T.F,.16).addScaledVector(T.U,.06);
  for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().addScaledVector(T.L,s*.1),{hd:V(0,1,0),pn:V(-s,0,0),pole:V(s*.3,-1,-.3),curl:.4});}
function ropeKneel(c){kneelPose(c,{h:0,z:-11.55,arms:'none'});const head=wpos(c.bones.Head);
  for(const s of[1,-1])armTo(c,sideOf(s),head.clone().add(V(s*.1,.17,.1)),{hd:V(0,1,0),pn:V(-s,0,0),pole:V(s*.3,-1,-.3)});}
ENTRY.cableKneel={land:1,pre:[0,-12.35],face:0,
  enter:(st,e)=>[...colSet(e.pulley,e.att),{d:.5,anim:settle(handsAtChest)},{d:.7,anim:settle(ropeHandsStanding)},
    {d:1.3,anim:settle(ropeKneel),props:c=>ropeFollow(c)},{d:1.0,anim:settle(exP(0,1)),props:c=>ropeFollow(c)},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.9,pose:exP(0,1)},{d:1.0,anim:settle(ropeKneel),props:c=>ropeFollow(c)},{d:1.3,anim:settle(ropeHandsStanding),props:c=>ropeFollow(c)},{call:()=>st.P.rest()},{d:.6,anim:settle(handsAtChest)},
    {d:.6,anim:settle(c=>standPose(c,{z:COL_Z}))},{walk:[0,-12.35],back:true,land:1,d:.9}]};
// Pallof press: take the handle at the column, two side-steps out and round to side-on, press
function pallofHold(c,o){standPose(c,{...o,arms:'none'});const T=torsoAxes(c);const ct=wpos(c.bones.Spine2).addScaledVector(T.F,.17+(o.reach||0)).addScaledVector(T.U,-.04);
  for(const s of[1,-1])armTo(c,sideOf(s),ct.clone().addScaledVector(T.L,s*.025),{hd:T.F.clone(),pn:T.L.clone().multiplyScalar(-s),pole:T.U.clone().negate().addScaledVector(T.L,s*.4)});}
function dhHandsStanding(c){standPose(c,{z:COL_Z,arms:'none'});const p=ST.P.pulW().add(ST.P.hang);
  for(const s of[1,-1])armTo(c,sideOf(s),p.clone().add(V(s*.025,0,0)),{hd:V(0,0,1),pn:V(-s,0,0),pole:V(s*.4,-1,0)});}
ENTRY.pallof={land:1,pre:[0,-12.75],face:0,
  enter:(st,e)=>[...colSet(e.pulley,e.att),{d:.8,anim:settle(dhHandsStanding)},{d:.9,anim:settle(c=>pallofHold(c,{z:-11.75,h:-Math.PI/4}),{step:1}),props:c=>ropeFollow(c)},
    {d:1.0,anim:settle(exP(0,1),{step:1}),props:c=>ropeFollow(c)},{d:1.0,anim:exFrom(0,1)}],
  leave:(st,e)=>[{d:.8,pose:exP(0,1)},{d:.9,anim:settle(c=>pallofHold(c,{z:-11.75,h:-Math.PI/4}),{step:1}),props:c=>ropeFollow(c)},{d:1.2,anim:settle(dhHandsStanding,{step:1}),props:c=>ropeFollow(c)},
    {d:.7,anim:settle(c=>standPose(c,{z:COL_Z})),props:(c,k)=>{const P=st.P;const p=P.pulW().add(P.hang);P.attPos().lerp(p,smooth(k));P.cableTo(P.attPos());if(k>=1)P.rest();}},{walk:[0,-12.75],back:true,land:1,d:1.2}]};

// ---- the exercises
const CORE_HOLD=(l)=>({lower:l,touch:l,press:l,lock:l,prof:'smooth'});
defEx('plank',{group:'core',name:'Front plank',eq:'Bodyweight',part:'Abs (anti-arch)',station:'mat',entry:'matPlank',kind:'hold',hold:'20–45 s',pose:posePlank,
  quip:'Lie down. Don’t relax. Welcome to the plank.',mus:{abs:[1,'m'],oblq:[.7,'m'],erect:[.35,'h'],glute:[.45,'h'],deltF:[.3,'h']},
  labels:[['Abs','abs','m'],['Obliques','oblq','m'],['Glutes','glute','h']],center:V(0,.35,-11.7),cam:'pushSide',coachSpot:{p:[-1.4,-11.6],h:Math.PI/2},
  steps:steps4([['Elbows under the shoulders','forearms down'],['Feet back','body straight'],['Squeeze glutes','tuck the tailbone'],['Breathe and hold','20–45 s']]),
  stepText:['Elbows directly under the shoulders, forearms flat.','Feet back one at a time, toes tucked: one straight line from head to heels.','Squeeze the glutes and tuck the tailbone a little, ribs down.','Breathe normally and hold 20–45 seconds. Brace the whole belly, don’t just suck it in.'],
  cues:[['Elbows under shoulders.'],['Long straight body.'],['Squeeze, tuck.'],['Breathe, hold.']],
  beginner:'3 holds of 20–30 s (or from the knees). Add 5 s a week; past 45–60 s, try the elbows 10–15 cm further forward instead.',
  forms:mk(CORE_HOLD(1.6),{
    sag:MS('Hips sag','Hips drop, back arches','The hips drop about 10 cm below the line and the lower back arches.','The abs let go and the lower back hangs.','A sore lower back instead of ab work.','Squeeze glutes, tuck the tailbone.',{sag:1,meas:'plankSag',warn:'Hips sag',warnAt:'hips',cam:'pushSide',strain:['erect']}),
    pike:MS('Hips piked','Hips high like a tent','The hips sit 10–15 cm above the line, like a tent.','The abs are off the hook; the shoulders hold you.','No progress.','Lower the hips, long body.',{pike:1,meas:'plankSag',warn:'Hips too high',warnAt:'hips',cam:'pushSide',mul:{abs:.6,deltF:2}}),
    head:MS('Head drops','Chin to chest, shoulders collapse','The head drops toward the floor and the shoulders sink toward the ears.','Neck strain; the shoulder-blade muscles switch off.','Neck ache.','Eyes on the hands, push the floor away.',{head:1,meas:'headDrop',warn:'Head drops',warnAt:'neck',cam:'pushSide'})})});
defEx('sidePlank',{group:'core',name:'Side plank',eq:'Bodyweight',part:'Obliques',station:'mat',entry:'matSide',kind:'hold',hold:'15–40 s a side',pose:poseSidePlank,
  quip:'Half a plank, twice the wobble.',mus:{oblq:[1,'m'],gluteMed:[.75,'m'],abs:[.5,'h'],deltS:[.3,'h']},
  labels:[['Obliques','oblq','m'],['Side glute','gluteMed','m']],center:V(0,.4,-11.7),cam:'front',coachSpot:{p:[1.4,-11.6],h:-Math.PI/2},
  steps:steps4([['Elbow under the shoulder','forearm forward'],['Lift the hips','body straight'],['Hips stacked','don’t roll'],['Hold and breathe','then switch sides']]),
  stepText:['Elbow under the shoulder, forearm pointing forward, feet stacked.','Lift the hips until the body is one straight line.','Keep the hips stacked and the chest facing sideways.','Breathe and hold, then switch sides. Keep both sides within about 5 seconds of each other.'],
  cues:[['Elbow under.'],['Hips up.'],['Don’t roll.'],['Breathe.']],
  beginner:'3 holds of 15–20 s per side, from the knees if needed.',
  forms:mk(CORE_HOLD(1.6),{
    sag:MS('Hips sag','Hips drop toward the floor','The hips drop about 12 cm toward the floor, like a banana.','The obliques and side glute stop working.','The drill does nothing.','Hips up, long straight line.',{sag:1,meas:'sideSag',warn:'Hips sag',warnAt:'hips',cam:'front'}),
    roll:MS('Rolling forward','Chest turns to the floor','The chest turns toward the floor and the pelvis rolls 25–30°.','The load leaves the obliques for the shoulder.','A sore shoulder.','Chest faces the wall, not the floor.',{roll:1,meas:'pelvisRoll',warn:'Rolling forward',warnAt:'hips',cam:'front',strain:['deltF']}),
    shrug:MS('Shoulder shrugged','Elbow out of line, shoulder by the ear','The elbow sits 10 cm in front of the shoulder and the shoulder rides up toward the ear.','The shoulder joint is stressed.','A sore front shoulder.','Push the floor away, elbow under.',{shrug:1,meas:'elbowUnder',warn:'Shoulder strained',warnAt:'shoulder',cam:'front',strain:['deltS']})})});
defEx('deadBug',{group:'core',name:'Dead bug',eq:'Bodyweight',part:'Deep abs (brace)',station:'mat',entry:'matBack',kind:'raise',pose:poseDeadBug,
  quip:'Lie on your back, wave limbs, feel smug.',mus:{abs:[1,'m'],oblq:[.7,'m'],quadRF:[.4,'h']},
  labels:[['Abs','abs','m'],['Obliques','oblq','m'],['Hip flexors','quadRF','h']],center:V(0,.35,-11.8),cam:'sideFlat',coachSpot:{p:[-1.4,-11.6],h:Math.PI/2},
  steps:steps4([['Opposite arm and leg reach','slowly'],['Stop before the back lifts','heel off the floor'],['Return slowly','2 sec'],['Switch sides','back pressed down']]),
  stepText:['Lower one arm overhead and the opposite leg toward the floor at the same time, slowly.','Stop with the heel a few centimetres off the mat, before the lower back lifts.','Bring them back slowly to the table-top start.','Switch sides. The lower back stays pressed into the mat the whole time.'],
  cues:[['Slow reach.'],['Back stays down.'],['Return slowly.'],['Switch.']],
  beginner:'3 sets of 6–8 per side, legs only at first. The best start for anyone with a sore back.',
  forms:mk({lower:2.0,touch:.8,press:2.0,lock:.4,prof:'smooth'},{
    arch:MS('Lower back arches','A gap opens under the back','A gap opens under the lower back as the leg goes down.','The hip flexors win and the abs lose.','It becomes a hip-flexor drill and the back gets cranky.','Only as low as the back stays down.',{arch:1,meas:'backGap',warn:'Back lifts',warnAt:'lowback',cam:'sideFlat',mul:{quadRF:1.8}}),
    fast:MS('Too fast','Arms and legs swing quickly','The arm and leg swing out and back in under a second.','Momentum, no bracing.','You never learn the brace.','Slow, like moving through honey.',{fast:1,lower:.55,touch:.1,press:.55,lock:.15,meas:'moveTime',warn:'Too fast',warnAt:'hips',cam:'sideFlat'}),
    head:MS('Head lifts','Head and shoulders curl up','The chin tucks hard and the head and shoulders lift off the mat.','The neck works instead of the abs.','Neck ache.','Head heavy on the mat.',{head:1,meas:'headLift',warn:'Head lifts',warnAt:'neck',cam:'sideFlat'})})});
defEx('kneeRaise',{group:'core',name:'Hanging knee raise',eq:'Bodyweight',part:'Abs (lower bias)',station:'tower',entry:'chair',kind:'raise',pose:poseKneeRaise,
  quip:'Hang around and bring your knees to the party.',mus:{abs:[1,'m'],oblq:[.8,'m'],quadRF:[.6,'h'],forearm:[.3,'h']},
  labels:[['Abs','abs','m'],['Obliques','oblq','m'],['Hip flexors','quadRF','h']],center:V(0,1.1,-12.1),cam:'sideL',coachSpot:{p:[1.35,-11.2],h:-Math.PI/2-.4},
  steps:steps4([['Lower slowly','2 sec, no swing'],['Hang tall','shoulders down'],['Knees up to the chest','curl the pelvis'],['Squeeze','one second']]),
  stepText:['Lower the legs slowly, about 2 seconds, without swinging.','Hang tall with the shoulders pushed down.','Draw the knees up and curl the pelvis so the lower back rounds off the pad.','Squeeze for a second. You can bias the lower part of the abs a little this way; it is still one muscle.'],
  cues:[['Lower slowly.'],['Shoulders down.'],['Curl the hips up.'],['Squeeze.']],
  beginner:'3 sets of 8–12 in the captain’s chair. If your lower back hurts, go back to the dead bug.',
  forms:mk({lower:2.0,touch:.4,press:1.3,lock:1.0,prof:'smooth'},{
    swing:MS('Swinging','Body swings like a pendulum','The body swings 15–20 cm on every rep and the reps use momentum.','Momentum, not the abs.','No progress; your grip tires first.','Pause at the bottom, no swing.',{swing:1,meas:'hipSway',warn:'Swinging',warnAt:'hips',cam:'sideL'}),
    hips:MS('Knees only, no curl','Knees rise but the pelvis stays still','The knees come up but the pelvis never curls.','The hip flexors do all the work.','Tight hip flexors, undertrained abs.','Curl the hips up, not just the knees.',{hips:1,meas:'pelvisCurl',warn:'No pelvis curl',warnAt:'hips',cam:'sideL',mul:{quadRF:2,abs:.6}}),
    shrug:MS('Shrugged shoulders','Shoulders ride up to the ears','The shoulders ride up toward the ears.','The neck and traps hold you up.','Neck strain.','Push the shoulders down.',{shrug:1,meas:'shrug',warn:'Shoulders shrug',warnAt:'neck',cam:'front',strain:['trapU']})})});
defEx('cableCrunch',{group:'core',name:'Kneeling cable crunch',eq:'Cable',part:'Abs',station:'cableCol',entry:'cableKneel',pulley:2.0,att:'rope',kind:'curl',pose:poseCableCrunch,
  quip:'Kneel, bow to the cable, repeat fifteen times.',mus:{abs:[1,'m'],oblq:[.6,'h']},
  labels:[['Abs','abs','m'],['Obliques','oblq','h']],center:V(0,.9,-11.65),cam:'sideFlat',coachSpot:{p:[1.4,-12.1],h:-Math.PI/2},
  steps:steps4([['Return slowly','abs stretched'],['Rope by the head','hips still'],['Crunch ribs to knees','curl the spine'],['Squeeze','elbows to thighs']]),
  stepText:['Come back up slowly until the abs are stretched; the stack stays off the pile.','Rope against the head, hips fixed about 30° short of straight.','Curl the ribs toward the pelvis. The spine bends; the hips don’t move.','Elbows reach the middle of the thighs. Squeeze for a second.'],
  cues:[['Slowly up.'],['Hips still.'],['Curl the spine.'],['Squeeze.']],
  beginner:'3 sets of 10–15 with a light stack. Kneel on a mat. No study has measured this one yet; it is coaching practice.',
  forms:mk({lower:2.0,touch:.3,press:1.0,lock:1.0,prof:'smooth'},{
    hinge:MS('Hinging at the hips','Bows at the hips with a straight back','The torso folds at the hips with a straight back instead of curling.','The hip flexors and lats move the weight.','The abs grow nothing and the hip flexors tighten.','Curl the spine; the hips don’t move.',{hinge:1,meas:'crunchHip',warn:'Hips fold',warnAt:'hips',cam:'sideFlat',mul:{lats:1.4,quadRF:1.6,abs:.6}}),
    arms:MS('Pulling with the arms','Hands pull away from the head','The hands drift about 15 cm away from the head and the arms pull the rope.','It becomes a lat pulldown.','Nothing for the abs.','Rope glued to your head.',{arms:1,meas:'handHead',warn:'Arms pulling',warnAt:'elbow',cam:'sideFlat',mul:{lats:1.6}}),
    sit:MS('Sitting back','Bottom drops to the heels','The bottom drops back toward the heels at the bottom of each rep.','Momentum comes from the hips.','No ab stimulus.','Stay tall on the knees.',{sit:1,meas:'crunchHip',warn:'Sitting back',warnAt:'hips',cam:'sideFlat'})})});
defEx('pallof',{group:'core',name:'Pallof press',eq:'Cable',part:'Obliques (anti-twist)',station:'cableCol',entry:'pallof',pulley:1.32,att:'dh',kind:'press',pose:posePallof,
  quip:'The cable wants you to twist. Politely refuse.',mus:{oblq:[1,'m'],abs:[.7,'m'],glute:[.3,'h'],deltF:[.3,'h']},
  labels:[['Obliques','oblq','m'],['Abs','abs','m']],center:V(0,1.1,-12.1),cam:'front',coachSpot:{p:[-1.3,-12.7],h:Math.PI/2},
  steps:steps4([['Bring it back','to the chest'],['Handle at the chest','cable taut'],['Press straight out','don’t twist'],['Hold','two seconds']]),
  stepText:['Bring the handle back to the middle of your chest.','Handle at the breastbone, side-on to the tower, cable taut.','Press straight out to arm’s length. The cable tries to twist you; don’t let it.','Hold for two seconds, belly button facing forward. Then the other side.'],
  cues:[['Back to the chest.'],['Stand tall.'],['Press straight out.'],['Hold, no twist.']],
  beginner:'3 sets of 8–10 per side with the lightest plate. Only a small pilot study exists; this is mostly coaching practice.',
  forms:mk({lower:1.0,touch:.3,press:1.0,lock:2.0,prof:'smooth'},{
    twist:MS('Trunk twists','Shoulders turn toward the tower','The shoulders rotate 20–30° toward the tower at full reach.','The cable wins and the obliques give up.','The drill trains nothing.','Belly button faces the front.',{twist:1,meas:'shoulderYaw',warn:'Twisting',warnAt:'back',cam:'above'}),
    lean:MS('Leaning away','Body leans away to counterweight','The torso bends about 15° away from the tower to counterweight the cable.','Body weight does the anti-twist work.','No oblique work.','Stand tall, stay centred.',{lean:1,meas:'sideLean2',warn:'Leaning away',warnAt:'hips',cam:'front'}),
    drift:MS('Hands drift','Handle drifts toward the tower','The handle ends about 10 cm off the middle of the chest, toward the tower.','A shorter lever, so it gets easier.','Less and less load over time.','Press straight from your breastbone.',{drift:1,meas:'handMid',warn:'Hands drift',warnAt:'wrist',cam:'above'})})});
defEx('abWheel',{group:'core',name:'Ab wheel rollout',eq:'Ab wheel',part:'Abs (anti-arch)',station:'mat',entry:'matWheel',kind:'squat',pose:poseAbWheel,
  quip:'Roll out. Roll back. Question your choices.',mus:{abs:[1,'m'],oblq:[.8,'m'],lats:[.4,'h'],triLong:[.3,'h']},
  labels:[['Abs','abs','m'],['Obliques','oblq','m'],['Lats','lats','h']],center:V(0,.4,-11.8),cam:'pushSide',coachSpot:{p:[-1.4,-11.6],h:Math.PI/2},
  steps:steps4([['Roll out','2 sec, hips forward'],['Hold','before the back arches'],['Pull back with the abs','arms straight'],['Kneel tall','tuck the tailbone']]),
  stepText:['Roll the wheel forward, hips moving forward with it.','Stop with the body nearly straight from knees to hands, before the lower back arches. Hold a second.','Pull the wheel back to the knees with the abs. Arms stay straight.','Back to kneeling, tailbone tucked, wheel under the shoulders.'],
  cues:[['Roll out slowly.'],['Ribs down.'],['Pull with the belly.'],['Tuck.']],
  beginner:'3 sets of 5–8 to a half rollout; roll further over the weeks. Skip it with a sore lower back.',
  forms:mk({lower:2.0,touch:1.0,press:2.0,lock:.5,prof:'smooth'},{
    arch:MS('Lower back arches','Belly drops at full reach','At full reach the belly drops and the lower back arches.','The spine takes the load the abs should.','The classic ab-wheel back strain.','Ribs down, tuck, stop earlier.',{arch:1,meas:'wheelArch',warn:'Back arches',warnAt:'lowback',cam:'pushSide',strain:['erect']}),
    short:MS('Hips stay back','Only the arms move','The hips never open past about 100°, so the wheel barely rolls out.','It becomes a shoulder exercise; the abs barely work.','No progress.','Hips go forward with the wheel.',{shortR:1,meas:'wheelHip',warn:'Hips stay back',warnAt:'hips',cam:'pushSide',mul:{abs:.5,lats:1.5}}),
    bend:MS('Bending the elbows','Arms bend to drag the wheel back','The elbows bend to about 110° to drag the wheel back.','The triceps and lats do the return.','Elbow and shoulder strain; undertrained abs.','Arms straight, pull with the belly.',{bend:1,meas:'wheelElbow',warn:'Elbows bend',warnAt:'elbow',cam:'pushSide'})})});

// ---------------------------------------------------------------- the gym floor plan
// Front (z≈0, door at x=0) to back (z=−24). Right wall: free weights. Middle: barbell benches. Left wall: rack, platform, tower, mats.
// Back half: machines and the cable crossover; last row: leg machines and treadmills.
const extras=[];
doorL.userData.walkable=doorR.userData.walkable=true;
function layoutGym(){
  // barbell benches (heads toward the back wall)
  makeStation('flatRack',-2.4,-11.6,0,g=>buildBarBench(g,0,false),{name:'flat bench'});
  makeStation('inclineRack',.6,-11.6,0,g=>buildBarBench(g,30,false),{name:'incline bench'});
  makeStation('declineRack',3.6,-11.6,0,g=>buildBarBench(g,-15,true),{name:'decline bench'});
  // dumbbell benches facing the dumbbell rack and the mirror (feet toward +x)
  makeStation('dbFlat',8.0,-6.9,Math.PI/2,g=>angledBench(g,0),{name:'flat bench by the dumbbells'});
  makeStation('dbIncline',8.0,-10.1,Math.PI/2,g=>angledBench(g,30),{name:'incline bench by the dumbbells'});
  // machines along the back, users face the front of the gym
  makeStation('chestPress',-6.6,-18.3,0,g=>buildPressM(g),{name:'chest press'});
  makeStation('pecDeck',-4.0,-18.3,0,g=>buildPecDeck(g),{name:'pec deck'});
  makeStation('crossover',6.3,-18.3,0,g=>buildCable(g),{name:'cable crossover'});
  // floor and bodyweight
  makeStation('mat',-6.2,-8.3,0,g=>buildMat(g),{name:'mats'});
  makeStation('tower',-9.9,-4.8,Math.PI/2,g=>buildTower(g),{name:'pull-up tower'});
  if(typeof layoutMore==='function')layoutMore();
  // free weights along the right wall, mirror behind
  buildDBRack(11.0,-10.2,10.2,0);
  const mir=new THREE.Mesh(new THREE.PlaneGeometry(10,2.2),M.mirror);mir.rotation.y=-Math.PI/2;mir.position.set(11.84,1.75,-10.2);IN.add(mir);
  // decor that makes it a real gym
  for(let i=0;i<3;i++)treadmill(6.6+i*1.9,-21.9);
  plateTree(IN,-7.4,-12.4);plateTree(IN,5.4,-11.2);
  for(const [x,z] of [[-5.4,-14.6],[5.6,-14.6]]){box(.6,5,.6,M.red,x,2.5,z,IN);box(.62,.25,.62,M.black,x,.12,z,IN);
    const fan=new THREE.Group();fan.position.set(x,3.6,z+.42);IN.add(fan);fan.add(new THREE.Mesh(new THREE.TorusGeometry(.32,.02,8,32),M.black));
    const blades=new THREE.Group();fan.add(blades);for(let i=0;i<3;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.08,.28,.01),M.black);b.position.y=.14;const p=new THREE.Group();p.rotation.z=i*2.094;p.add(b);blades.add(p);}fan.userData.blades=blades;fan.userData.fan=true;}
  // water cooler and towel shelf by the entrance
  box(.36,1.1,.36,M.steel,-11.4,.55,-5.6,IN);cyl(.14,.36,new THREE.MeshStandardMaterial({color:0x6fb3d9,roughness:.1,transparent:true,opacity:.6}),-11.4,1.3,-5.6,'y',IN);
  box(.4,1.4,1.2,M.black,11.55,.7,-2.2,IN);for(let i=0;i<4;i++)box(.3,.08,1.0,new THREE.MeshStandardMaterial({color:0xe8e4da,roughness:.9}),11.5,.3+i*.32,-2.2,IN);
}

// ---- stations added for back, shoulders, legs, arms and core
function layoutMore(){
  makeStation('latPulldown',-1.4,-18.3,0,g=>buildLatPulldown(g),{name:'lat pulldown'});
  makeStation('seatedRow',1.25,-18.6,0,g=>buildSeatedRow(g),{name:'seated cable row'});
  makeStation('cableCol',3.75,-18.0,Math.PI,g=>buildCableCol(g),{name:'cable column'});
  makeStation('platform',-9.6,-13.4,Math.PI/2,g=>buildPlatform(g),{name:'lifting platform'});
  makeStation('dbStand',9.55,-8.5,-Math.PI/2,g=>buildSpot(g),{name:'free-weight area'});
  makeStation('dbUpright',8.0,-13.3,Math.PI/2,g=>angledBench(g,UPRIGHT),{name:'upright bench'});
  if(typeof layoutLegs==='function')layoutLegs();
  if(typeof layoutArms==='function')layoutArms();
}

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
function coachTo(e,done){const s=coachSpotOf(e);goTo(coach,s.p,{face:s.h,speed:WALK_SPEED*1.04,done});}
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

// ---------------------------------------------------------------- muscle groups and today's plans
const GROUPS={};
function defGroup(k,g){g.key=k;GROUPS[k]=g;}
defGroup('chest',{name:'Chest',sub:'upper, middle, lower',line:'Chest day. The most popular day of the week, for a reason.',
  parts:['Upper chest','Middle chest','Lower chest'],
  plans:[
    {name:'Classic barbell',who:'Intermediate · about 60 min',why:'Heavy presses first while you’re fresh: incline for the upper chest, flat for the middle. Dips and high-to-low cables finish the lower chest.',
      items:[['bbIncline','3 × 6–10','2–3 min'],['bbFlat','3 × 6–10','2–3 min'],['dip','2 × 8–12','2 min'],['cableHL','2 × 12–15','1–1.5 min']]},
    {name:'Dumbbells',who:'Beginner to intermediate · about 50 min',why:'Dumbbells let your hands go deeper, so every press stretches the chest more. The fly trains the stretch; dips cover the lower chest.',
      items:[['dbIncline','3 × 8–12','2 min'],['dbFlat','3 × 8–12','2 min'],['dbFly','2 × 12–15','1–1.5 min'],['dip','2 × 6–10','2 min']]},
    {name:'Machines',who:'Beginner, first months · about 45 min',why:'Machines guide the path, so you can learn the movement and safely train hard. Low-to-high cables hit the upper chest, high-to-low the lower chest.',
      items:[['machinePress','3 × 10–12','2 min'],['cableLH','2 × 12–15','1–1.5 min'],['pecDeck','3 × 12–15','1–1.5 min'],['cableHL','2 × 12–15','1–1.5 min']]},
    {name:'No equipment',who:'Any level · about 25 min',why:'Push-ups train the whole chest; dips add the lower chest. Make push-ups harder by slowing the lowering to 3 seconds.',
      items:[['pushup','3 × as many clean reps as you can, minus 2','1.5 min'],['dip','3 × 6–10','2 min']]},
  ],
  areaOf:{bbIncline:'Upper chest',dbIncline:'Upper chest',cableLH:'Upper chest',bbFlat:'Middle chest',dbFlat:'Middle chest',machinePress:'Middle chest',pushup:'Middle chest',dbFly:'Middle chest',pecDeck:'Middle chest',bbDecline:'Lower chest',dip:'Lower chest',cableHL:'Lower chest'}});

// ---------------------------------------------------------------- UI: coach question, plan sheet, HUD
function renderChips(){chipsEl.innerHTML=Object.values(GROUPS).map(g=>`<button data-g="${g.key}">${g.name}<small>${g.sub}</small></button>`).join('');}
chipsEl.addEventListener('click',e=>{const b=e.target.closest('[data-g]');if(b)chooseGroup(b.dataset.g);});
function chooseGroup(k){const g=GROUPS[k];SES.group=g;SES.plan=g.plans[0];SES.i=0;SES.done=new Set();chipsEl.hidden=true;bubble.classList.remove('ask');sayFor(g.line,3.5);$('#skip').hidden=true;
  setFlow('plan');showPlan(true);}
function showPlan(on,asPopup){const el=$('#plan');el.hidden=!on;if(!on)return;const g=SES.group;
  $('#planEyebrow').textContent='Today · '+g.name+' day';
  $('#planTabs').innerHTML=g.plans.map((p,i)=>`<button data-p="${i}" aria-pressed="${p===SES.plan}">${p.name}</button>`).join('');
  renderPlanList();$('#planClose').hidden=!asPopup;$('#planSwap').hidden=!!asPopup&&flow==='exercise';}
function renderPlanList(){const g=SES.group,p=SES.plan;if(!g||!p)return;$('#planTitle').textContent=p.name.toLowerCase().includes(g.name.toLowerCase())?p.name+' day':p.name+' '+g.name.toLowerCase()+' day';
  $('#planWhy').textContent=p.who+'. '+p.why;
  const covered=new Set(p.items.flatMap(it=>[].concat(g.areaOf[it[0]]||[])));
  $('#planParts').innerHTML=g.parts.map(a=>`<span class="part" style="${covered.has(a)?'':'opacity:.4'}">${covered.has(a)?'✓':'·'} ${a}</span>`).join('');
  $('#planList').innerHTML=p.items.map(([k,sets,rest],i)=>{const e=EXS[k];const cls=EXK===k&&flow==='exercise'?'now':SES.done.has(k)?'done':'';
    return `<li class="${cls}"><button data-x="${k}"><span class="n">${i+1}</span><b>${e.name}</b><span class="sets">${sets}</span><span class="meta">${[].concat(g.areaOf[k]||e.part).join(' & ')} · rest ${rest}</span></button></li>`;}).join('');
  const nextK=p.items.find(it=>!SES.done.has(it[0]))?.[0]||p.items[0][0];$('#planGo').textContent=(SES.done.size?'Go to ':'Start with ')+EXS[nextK].name.toLowerCase()+' →';$('#planGo').dataset.x=nextK;}
$('#planTabs').addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;SES.plan=SES.group.plans[+b.dataset.p];showPlan(true,!$('#planClose').hidden);});
$('#planList').addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(b){showPlan(false);goExercise(b.dataset.x);}});
$('#planGo').addEventListener('click',()=>{showPlan(false);goExercise($('#planGo').dataset.x);});
$('#planSwap').addEventListener('click',()=>{showPlan(false);if(flow==='exercise')leaveStation(()=>askAgain());else askAgain();});
$('#planClose').addEventListener('click',()=>showPlan(false));
$('#planBtn').addEventListener('click',()=>{if(!SES.group)return;const el=$('#plan');if(!el.hidden){showPlan(false);return;}closePanels();showPlan(true,true);});

function showHUD(on){$('#hud').hidden=!on;$('#planBtn').hidden=!SES.group;if(!on){$('#mist').hidden=true;$('#learn').hidden=true;learn=null;}}
function nextInPlan(){if(!SES.plan)return null;const items=SES.plan.items.map(i=>i[0]);const i=items.indexOf(EXK);return i>=0&&i<items.length-1?items[i+1]:null;}
function renderExerciseUI(){const e=EX;const items=SES.plan?SES.plan.items.map(i=>i[0]):[];const i=items.indexOf(e.key);
  $('#exEyebrow').textContent=(i>=0?`${i+1} of ${items.length} · `:'')+e.eq;$('#exTitle').textContent=e.name;$('#exQuip').textContent=e.quip||'';$('#exPart').textContent=e.part;
  $('#steps').innerHTML=e.steps.map((s,j)=>`<button data-i="${j}"><b>${j+1} · ${s[0]}</b><span>${s[1]}</span></button>`).join('');
  const nx=nextInPlan();$('#nextBtn').textContent=nx?'Next: '+EXS[nx].name.toLowerCase()+' →':i>=0?'Finish the workout ✓':'Back to the plan';
  setTool('tPause',paused);setTool('tSlow',speed<1);setTool('tMistake',false);setTool('tLearn',false);}
function setTool(id,on){$('#'+id).setAttribute('aria-pressed',!!on);}
$('#nextBtn').addEventListener('click',()=>{if(flow!=='exercise')return;const nx=nextInPlan();
  if(nx)goExercise(nx);else{const inPlan=SES.plan&&SES.plan.items.some(it=>it[0]===EXK);leaveStation(()=>{if(inPlan)finishWorkout();else{setFlow('plan');showPlan(true);}});}});
$('#tPause').addEventListener('click',()=>setPaused(!paused));
$('#tSlow').addEventListener('click',()=>{speed=speed<1?1:.4;setTool('tSlow',speed<1);});
$('#tMistake').addEventListener('click',()=>{const el=$('#mist');if(!el.hidden){closePanels();return;}closePanels();openMistakes();});
$('#tLearn').addEventListener('click',()=>{if(learn){exitLearn();return;}closePanels();enterLearn(0);});
$('#steps').addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(!b||flow!=='exercise')return;if(!learn){closePanels();enterLearn(+b.dataset.i);}else goStep(+b.dataset.i);});
function setPaused(p){paused=p;setTool('tPause',p);const b=$('#tPause');b.innerHTML=p?'<i>▶</i>Play':'<i>❚❚</i>Pause';}
function closePanels(){$('#mist').hidden=true;setTool('tMistake',false);if(learn)exitLearn();if(form!=='good'&&flow==='exercise')setForm('good');}
// ---- right vs wrong
function openMistakes(){const el=$('#mist');el.hidden=false;setTool('tMistake',true);renderMistakes();}
function renderMistakes(){const el=$('#mist');const ms=Object.keys(FORMS).filter(k=>k!=='good');const F=FORMS[form];
  el.innerHTML=`<span class="eyebrow">${EX.name} · ${ms.length} common mistakes</span><h3>Spot the mistake</h3>
   <div class="mlist">${ms.map(k=>`<button data-f="${k}" aria-pressed="${form===k}"><b>${FORMS[k].btn}</b><span>${FORMS[k].short}</span></button>`).join('')}
    <button class="good" data-f="good" aria-pressed="${form==='good'}"><b>Only the right way</b><span>Back to one view</span></button></div>
   ${form==='good'?'<p class="small" style="color:var(--muted);font-size:.85rem">Pick one. The screen splits: the right way on one side, the mistake on the other, doing the same rep.</p>':
   `<div class="mi bad"><span>What’s wrong</span><p>${F.wrong}</p></div><div class="mi"><span>Right now</span><p>${F.now}</p></div><div class="mi"><span>If you keep doing it</span><p>${F.later}</p></div><div class="mi fix"><span>Fix it</span><p>${F.fix}</p></div>`}`;}
$('#mist').addEventListener('click',e=>{const b=e.target.closest('[data-f]');if(b){setForm(b.dataset.f);renderMistakes();}});
function setForm(f){form=f;holdT=0;for(const c of [hero,twin])if(c){c._m={cur:{},last:{}};c._vmax=0;}lastPhase=-1;repT=0;fatigue=0;rep=1;
  if(!EX)return;const F=FORMS[f];setPreset(f==='good'?(EX.cam||'side'):(F.cam||'side'));}

// ---- the other six muscle groups and their plans (from the research files; sets × reps and rest are the researchers')
defGroup('back',{name:'Back',sub:'lats, traps, lower back',line:'Back day. The muscles you can’t see in the mirror but everyone else can.',
  parts:['Lats','Middle back','Upper traps','Lower back'],
  areaOf:{pullup:'Lats',latPulldown:'Lats',dbRow:'Lats',straightArm:'Lats',barRow:'Middle back',cableRow:'Middle back',shrug:'Upper traps',deadlift:'Lower back'},
  plans:[
    {name:'Full back',who:'Intermediate · about 70 min',why:'The deadlift goes first while you’re fresh: the heaviest load for the lower back. Pull-ups and rows cover the lats and the middle back, the straight-arm pulldown isolates the lats, shrugs finish the upper traps. Can’t do 5 pull-ups yet? Swap in the lat pulldown.',
      items:[['deadlift','3 × 5','3 min'],['pullup','2 × as many clean reps as you can, minus 2','2 min'],['barRow','3 × 8','2 min'],['cableRow','2 × 10–12','90 s'],['straightArm','2 × 12–15','60 s'],['shrug','2 × 12–15','60 s']]},
    {name:'No barbell',who:'Any level · about 55 min',why:'Dumbbells, cables and machines only. The lower back only works to hold the hinge here, so it gets less than with deadlifts.',
      items:[['latPulldown','3 × 8–12','2 min'],['dbRow','3 × 10 each side','90 s'],['cableRow','3 × 10–12','90 s'],['straightArm','2 × 12–15','60 s'],['shrug','2 × 12–15','60 s']]}]});
defGroup('shoulders',{name:'Shoulders',sub:'front, side, rear',line:'Shoulder day. Three heads, and we’re training all of them.',
  parts:['Front shoulders','Side shoulders','Rear shoulders'],
  areaOf:{ohp:'Front shoulders',seatPress:'Front shoulders',frontRaise:'Front shoulders',latRaise:'Side shoulders',cableLat:'Side shoulders',revDeck:'Rear shoulders',facePull:'Rear shoulders'},
  plans:[
    {name:'Barbell and raises',who:'Intermediate · about 50 min',why:'The overhead press moves the most weight, so it comes first. Then one raise for each head: side, rear, and the face pull for the rear shoulders and rotator cuff. The front raise is optional: presses already work the front hardest.',
      items:[['ohp','3 × 6–8','2–3 min'],['latRaise','3 × 12–15','60–90 s'],['revDeck','3 × 12–15','60–90 s'],['facePull','2 × 15–20','60 s'],['frontRaise','2 × 12–15 (optional)','60 s']]},
    {name:'No barbell',who:'Any level · about 40 min',why:'The seated dumbbell press is the best front-shoulder exercise in the ACE study; the cable keeps the side shoulder loaded all the way down.',
      items:[['seatPress','3 × 8–12','2 min'],['cableLat','3 × 12–15 each arm','60–90 s'],['revDeck','3 × 12–15','60–90 s'],['facePull','2 × 15–20','60 s']]}]});
defGroup('legs',{name:'Legs',sub:'quads, hamstrings, glutes, calves',line:'Leg day. Nobody skips it on my watch.',
  parts:['Quads','Hamstrings','Glutes','Calves'],
  areaOf:{squat:['Quads','Glutes'],legPress:['Quads','Glutes'],bulgarian:['Quads','Glutes'],legExt:'Quads',rdl:['Hamstrings','Glutes'],legCurl:'Hamstrings',hipThrust:'Glutes',standCalf:'Calves',seatCalf:'Calves'},
  plans:[
    {name:'Full legs',who:'Intermediate · about 60 min',why:'The squat goes first while you’re fresh. The Romanian deadlift adds the hinge for the hamstrings, the split squat trains one leg at a time, the leg extension hits the part of the quads the squat skips, and calves finish.',
      items:[['squat','3 × 6–8','3 min'],['rdl','3 × 8–10','2–3 min'],['bulgarian','2 × 8–10 each leg','90 s'],['legExt','2 × 10–15','90 s'],['legCurl','2 × 10–15','90 s'],['standCalf','3 × 10–15, 1 s stretch','90 s']]},
    {name:'Glutes and machines',who:'Any level · about 60 min',why:'Use it as your second leg day of the week: the hip thrust takes the squat’s place for the glutes, the leg press for the quads, and both calf machines cover the gastrocnemius and the soleus.',
      items:[['hipThrust','3 × 8–12','2 min'],['legPress','3 × 8–12','2–3 min'],['bulgarian','2 × 8–10 each leg','90 s'],['legExt','2 × 12–15','90 s'],['legCurl','2 × 12–15','90 s'],['seatCalf','1 × 15–20','90 s'],['standCalf','1 × 10–15','90 s']]}]});
defGroup('biceps',{name:'Biceps',sub:'long head, short head, forearms',line:'Arm day: biceps. The mirror has been expecting you.',
  parts:['Long head','Short head','Brachialis & forearms'],
  areaOf:{bbCurl:['Long head','Short head'],cableCurl:['Long head','Short head'],inclineCurl:'Long head',preacher:'Short head',concCurl:'Short head',hammer:'Brachialis & forearms'},
  plans:[
    {name:'Peak and stretch',who:'Any level · about 35 min',why:'The barbell curl is the heaviest, so it goes first. The incline curl stretches the long head, the preacher curl works the short head, and the hammer curl brings in the forearms.',
      items:[['bbCurl','3 × 8–10','90 s'],['inclineCurl','3 × 10–12','90 s'],['preacher','3 × 10–12','75 s'],['hammer','2 × 12','60 s']]},
    {name:'Cables and isolation',who:'Any level · about 30 min',why:'The cable keeps tension at the top where a bar goes light. The concentration curl scored the highest biceps activity in the ACE study with the least shoulder help.',
      items:[['cableCurl','3 × 10–12','75 s'],['inclineCurl','3 × 10–12','90 s'],['concCurl','2 × 10–12 each arm','60 s'],['hammer','2 × 12–15','60 s']]}]});
defGroup('triceps',{name:'Triceps',sub:'long head, outer heads',line:'Arm day: triceps. Two-thirds of your arm, finally getting attention.',
  parts:['Long head','Outer heads'],
  areaOf:{cgBench:['Long head','Outer heads'],triDip:['Long head','Outer heads'],ohExt:'Long head',skull:'Long head',kickback:'Long head',pushdown:'Outer heads'},
  plans:[
    {name:'Heavy press, then the long head',who:'Intermediate · about 40 min',why:'The close-grip bench is the heaviest triceps lift, so it goes first. The overhead extension stretches the long head (it grew it most in Maeo 2023), the pushdown finishes the outer heads, dips add bodyweight work.',
      items:[['cgBench','3 × 6–10','2–3 min'],['ohExt','3 × 10–15','90 s'],['pushdown','3 × 12–15','60–75 s'],['triDip','2 × 5–8','90 s']]},
    {name:'Free weights only',who:'Any level · about 35 min',why:'Dips first, then the skull crusher for the long head, kickbacks for the peak squeeze and a pushdown pump to finish.',
      items:[['triDip','3 × 5–8','2 min'],['skull','3 × 10–12','90 s'],['kickback','3 × 12–15 each arm','60 s'],['pushdown','2 × 15','60 s']]}]});
defGroup('core',{name:'Core',sub:'abs, obliques, deep core',line:'Core day. Brace yourself, literally.',
  parts:['Abs','Obliques','Deep core (brace)'],
  areaOf:{abWheel:'Abs',kneeRaise:'Abs',cableCrunch:'Abs',plank:['Abs','Deep core (brace)'],deadBug:'Deep core (brace)',sidePlank:'Obliques',pallof:'Obliques'},
  plans:[
    {name:'All three jobs',who:'Any level · about 25 min, after your main workout',why:'Hardest first: the ab wheel and knee raise curl and resist arching, the Pallof press and side plank resist twisting and side bending, the plank and dead bug teach the brace. Core work goes last so a tired trunk doesn’t make the heavy lifts unsafe.',
      items:[['abWheel','3 × 6–10','90 s'],['kneeRaise','3 × 8–12','90 s'],['pallof','2 × 8–10 each side','60 s'],['sidePlank','2 × 20–40 s each side','45 s'],['plank','1 × 30–45 s','45 s'],['deadBug','1 × 8 each side','—']]},
    {name:'Mat only, back friendly',who:'Any level · about 20 min',why:'No cables and no load on the spine: start with the dead bug, the drill for anyone with a sore back.',
      items:[['deadBug','3 × 8 each side','45 s'],['plank','3 × 20–40 s','45 s'],['sidePlank','2 × 20–30 s each side','45 s'],['abWheel','2 × 6–8 (half roll-out)','90 s'],['kneeRaise','1 × 10–12','—']]}]});

// ---------------------------------------------------------------- the exercise loop, split view, labels, learn mode
let holdT=0,splitOn=false,lastPhase=-1,cueIdx=0,warnAt=null,heroProps=null,twinProps=null;
function exerciseTick(dt){const F=FORMS[form];const sdt=dt*speed;
  repT+=sdt;const L=repLength();if(repT>=L){repT-=L;rep++;fatigue=Math.min(6,fatigue+1);if(rep>10){rep=1;fatigue=0;}}
  if(learn&&learn.seg&&repT>=learn.seg[1]-.01){repT=learn.seg[1]-.012;learn.seg=null;speed=learn.speed;setPaused(true);}
  if(EX.hold){holdT=(holdT||0)+sdt;$('#rep').textContent='Hold '+EX.hold+' · '+Math.floor(holdT)+' s';}else $('#rep').textContent='Rep '+rep+' of 10';
  const hideHints=learn&&learn.mode==='quiz'&&!learn.answered;
  const was=splitOn;splitOn=form!=='good'&&!(learn&&learn.mode!=='quiz');
  if(splitOn){const G=FORMS.good,tt=repT/L*repLength(G);const r2=drive(twin,G,tt,sdt*repLength(G)/L,F.meas);twinProps=propState(ST.P);setGlows(MU2,EX,G,r2.b,false);twin.root.visible=true;}
  else twin.root.visible=false;
  const {b}=drive(hero,F,repT,sdt);heroProps=propState(ST.P);
  setGlows(MU,EX,F,b,hideHints);
  // steps strip + coach line
  if(b.phase!==lastPhase){lastPhase=b.phase;document.querySelectorAll('#steps button').forEach((s,i)=>s.classList.toggle('on',i===b.phase));
    const sub=$('#sub');
    if(form==='good'){const list=EX.cues[b.phase]||[''];cueIdx=(cueIdx+1)%list.length;sub.innerHTML=list[cueIdx%list.length]?'<b>Coach:</b> '+list[cueIdx%list.length]:'';}
    else sub.innerHTML=hideHints?'Watch closely. What’s off?':'';}
  warnAt=form==='good'||hideHints?null:form;}
// ---- split view: same station, two takes (the right way and the mistake)
const camL=new THREE.PerspectiveCamera(45,1,.05,200),camR=new THREE.PerspectiveCamera(45,1,.05,200);
const sideOpen=()=>!$('#mist').hidden||!$('#learn').hidden;
function splitHalves(){const W=innerWidth,H=innerHeight;
  if(W>760){const w=sideOpen()?W-380:W;return [{x:0,y:0,w:Math.round(w/2),h:H},{x:Math.round(w/2),y:0,w:w-Math.round(w/2),h:H}];}
  // phone: stacked between the exercise card and whatever sits at the bottom
  const top=Math.round($('#exCard').getBoundingClientRect().bottom+4);const side=sideOpen()?(sideOpen()&&!$('#mist').hidden?$('#mist'):$('#learn')):null;
  const bot=Math.round(Math.min(side?side.getBoundingClientRect().top:H,$('#dock').getBoundingClientRect().top)-4);const h=Math.max(60,Math.round((bot-top)/2));return [{x:0,y:top,w:W,h},{x:0,y:top+h,w:W,h}];}
// swing the view around the body until a wall no longer cuts the distance short
function clearView(ctr,dir,d){let best=null,bf=-1;for(const a of[0,25,-25,45,-45,65,-65,90,-90,120,-120]){const v=dir.clone().applyAxisAngle(V(0,1,0),a*DEG);const p=roomRay(ctr,ctr.clone().addScaledVector(v,d));const f=p.distanceTo(ctr);
    const ok=viewClear(ctr,p,ST);if(f>=d*.97&&ok)return p;const sc=f*(ok?1:.5);if(sc>bf){bf=sc;best=p;}}return best;}
// each half frames the whole body (head, hands, feet) from the main camera's viewing angle
function placeSplitCams(){const hv=splitHalves(),dir=V().subVectors(cam.pos,cam.center).normalize();
  const pts=['Head','LeftHand','RightHand','LeftFoot','RightFoot','Hips','LeftToeBase','RightToeBase'].map(n=>wpos(hero.bones[n]));pts[0].y+=.12;
  const box=new THREE.Box3().setFromPoints(pts);const ctr=box.getCenter(V());let rad=0;for(const p of pts)rad=Math.max(rad,p.distanceTo(ctr));rad+=.18;
  const tv=Math.tan(22.5*DEG);
  [[camL,hv[0]],[camR,hv[1]]].forEach(([c,r])=>{const a=r.w/r.h;const half=Math.atan(tv*Math.min(1,a));const d=Math.max(1.6,rad/Math.sin(half));
    c.position.copy(clearView(ctr,dir,d));c.lookAt(ctr);c.aspect=a;c.updateProjectionMatrix();});return hv;}
function showCeil(c){const on=c.position.y<4.3;for(const o of CEIL)o.visible=on;}
function renderSplit(){const W=innerWidth,H=innerHeight,hv=placeSplitCams();
  renderer.setScissorTest(false);renderer.setViewport(0,0,W,H);
  // the gym stays visible behind the cards; the two takes are drawn on top
  if(hv[1].x+hv[1].w<W-1||hv[1].y+hv[1].h<H-1||hv[0].y>0){hero.root.visible=false;twin.root.visible=false;showCeil(camera);composer.render();hero.root.visible=true;twin.root.visible=true;}else renderer.clear();
  renderer.setScissorTest(true);
  [[camL,twinProps,false],[camR,heroProps,true]].forEach(([c,props,isHero],i)=>{const r=hv[i],y=H-r.y-r.h;showCeil(c);
    hero.root.visible=isHero;twin.root.visible=!isHero;if(props)setPropState(props);
    renderer.setViewport(r.x,y,r.w,r.h);renderer.setScissor(r.x,y,r.w,r.h);renderer.render(scene,c);});
  hero.root.visible=true;twin.root.visible=true;if(heroProps)setPropState(heroProps);
  renderer.setScissorTest(false);renderer.setViewport(0,0,W,H);}
function updateSplitUI(){const el=$('#split');const on=splitOn&&flow==='exercise';el.hidden=!on;if(!on)return;const [a,b]=splitHalves(),side=a.y===b.y;
  const dv=$('#splitDiv');if(side)Object.assign(dv.style,{left:(b.x-1)+'px',top:'0px',width:'2px',height:a.h+'px'});else Object.assign(dv.style,{left:'0px',top:(b.y-1)+'px',width:a.w+'px',height:'2px'});
  const tL=$('#tagL'),tR=$('#tagR');const F=FORMS[form];const hide=learn&&learn.mode==='quiz'&&!learn.answered;
  const ty=side?Math.round($('#exCard').getBoundingClientRect().bottom+10):0;Object.assign(tL.style,{left:(a.x+12)+'px',top:(side?ty:a.y+8)+'px'});Object.assign(tR.style,{left:(b.x+12)+'px',top:(side?ty:b.y+8)+'px'});
  tL.innerHTML='✓ Right way<small>'+measText(twin,F.meas)+'</small>';tR.innerHTML=hide?'? Spot it':'✕ '+F.tag+'<small>'+measText(hero,F.meas)+'</small>';}
// ---- labels on the body
function warnPoint(c,at){const B=c.bones,ven=venOf(c);
  return at==='hips'?wpos(B.Hips).addScaledVector(ven,-.05):at==='chest'?wpos(B.Spine2).addScaledVector(ven,.14*D.s):at==='elbow'?wpos(B.RightForeArm):at==='back'?wpos(B.Spine1).addScaledVector(ven,-.12*D.s)
    :at==='knee'?wpos(B.RightLeg):at==='lowback'?wpos(B.Spine).addScaledVector(ven,-.1*D.s):at==='neck'?wpos(B.Neck):at==='wrist'?wpos(B.RightHand):wpos(B.RightArm).addScaledVector(ven,.05*D.s);}
const lines=$('#lines');
function anchorScreen(p,c=camera,r){const v=p.clone().project(c);if(!r)r={x:0,y:0,w:innerWidth,h:innerHeight};return {x:r.x+(v.x*.5+.5)*r.w,y:r.y+(-v.y*.5+.5)*r.h,ok:v.z<1&&Math.abs(v.x)<1.1&&Math.abs(v.y)<1.1};}
function hideLabels(){['lb0','lb1','lb2','lbWarn'].forEach(id=>$('#'+id).style.display='none');lines.innerHTML='';}
function updateLabels(){updateSplitUI();if(flow!=='exercise'||(learn&&learn.mode==='quiz'&&!learn.answered&&!splitOn&&false)){hideLabels();return;}
  let svg='';const F=FORMS[form];const sm=innerWidth<760?.55:1;
  if(splitOn){['lb0','lb1','lb2'].forEach(id=>$('#'+id).style.display='none');const el=$('#lbWarn');if(!warnAt){el.style.display='none';lines.innerHTML='';return;}
    const h=placeSplitCams()[1];const a=anchorScreen(warnPoint(hero,F.warnAt),camR,h);el.textContent=F.warn;el.style.display='flex';
    const hw=el.offsetWidth/2+8;const x=clamp(a.x-Math.min(110,h.w*.3),h.x+hw,h.x+h.w-hw),y=clamp(a.y+(h.y===0?70:36),h.y+16,h.y+h.h-16);el.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;
    lines.innerHTML=`<line x1="${a.x}" y1="${a.y}" x2="${x}" y2="${y}"/><circle cx="${a.x}" cy="${a.y}" r="3.5"/>`;return;}
  $('#lbWarn').style.display='none';
  const offs=[[-150,-80],[70,-90],[80,40]];
  EX.labels.forEach(([txt,reg,role],i)=>{const el=$('#lb'+i);const p=regionWorld(hero,RID[reg]);if(!p){el.style.display='none';return;}const a=anchorScreen(p);if(!a.ok){el.style.display='none';return;}
    el.innerHTML=`<i style="background:${role==='m'?'var(--main)':'var(--help)'}"></i>${txt}<small>${role==='m'?'main muscle':'helping'}</small>`;
    el.style.display='flex';const wd=el.offsetWidth;let x=a.x+offs[i][0]*sm;const left=offs[i][0]<0;x=left?clamp(x,wd+8,innerWidth-8):clamp(x,8,innerWidth-wd-8);const y=clamp(a.y+offs[i][1]*sm,70,innerHeight-60);el.style.transform=`translate(${x}px,${y}px) translate(${left?'-100%':'0'},-50%)`;
    svg+=`<line x1="${a.x}" y1="${a.y}" x2="${x}" y2="${y}"/><circle cx="${a.x}" cy="${a.y}" r="3.5"/>`;});
  for(let i=EX.labels.length;i<3;i++)$('#lb'+i).style.display='none';
  lines.innerHTML=svg;}
// ---- learn mode: guided steps, then a spot-the-mistake quiz
let learn=null;const learnEl=$('#learn');
function stepsNow(){const G=FORMS.good,T=[G.lower,G.touch,G.press,G.lock];let t0=0;return T.map((d,i)=>{const s={n:EX.steps[i][0],t:EX.stepText[i],seg:[t0,t0+d],at:t0+d*(i===0?.6:i===2?.45:.5)};t0+=d;return s;});}
function dots(n,i){return '<div class="dots">'+Array.from({length:n},(_,k)=>`<i class="${k<=i?'on':''}"></i>`).join('')+'</div>';}
function enterLearn(i=0){if(flow!=='exercise')return;learn={mode:'steps',i,speed};setForm('good');learnEl.hidden=false;setTool('tLearn',true);goStep(i);}
function exitLearn(){if(!learn)return;speed=learn.speed;learn=null;learnEl.hidden=true;setTool('tLearn',false);setForm('good');setPaused(false);}
function goStep(i){learn.mode='steps';learn.i=i;learn.seg=null;const S=stepsNow()[i];repT=S.at;rep=1;fatigue=0;lastPhase=-1;setPaused(true);
  learnEl.innerHTML=`<span class="eyebrow">${EX.name} · step ${i+1} of 4</span>${dots(4,i)}<h3>${i+1} · ${S.n}</h3><p>${S.t}</p>
   <div class="row"><button class="tg" data-a="play">▶ Play this step</button><button class="tg" data-a="all">▶ Whole rep</button></div>
   <div class="row"><button class="tg" data-a="back" ${i===0?'disabled':''}>‹ Back</button><button class="tg on" data-a="next">${i<3?'Next ›':'Quiz: spot the mistake ›'}</button><button class="tg" data-a="exit">Done</button></div>`;}
function playStep(){const S=stepsNow()[learn.i];repT=S.seg[0];learn.seg=S.seg;speed=.5;setPaused(false);}
function playWhole(){repT=0;learn.seg=[0,repLength(FORMS.good)-.02];speed=1;setPaused(false);}
function startQuiz(){const ms=Object.keys(FORMS).filter(k=>k!=='good').sort(()=>Math.random()-.5);learn={...learn,mode:'quiz',qs:ms.slice(0,Math.min(3,ms.length)),qi:0,score:0};askQ();}
function askQ(){const q=learn.qs[learn.qi];learn.answered=false;setForm(q);setPreset('quiz');setPaused(false);speed=1;
  const others=Object.keys(FORMS).filter(k=>k!=='good'&&k!==q).sort(()=>Math.random()-.5).slice(0,2);
  const opts=[q,...others];if(opts.length<3)opts.push('none');opts.sort(()=>Math.random()-.5);
  learnEl.innerHTML=`<span class="eyebrow">Quiz · question ${learn.qi+1} of ${learn.qs.length}</span>${dots(learn.qs.length,learn.qi)}<h3>What’s wrong with the rep on the right?</h3>
   <div class="opts">${opts.map(o=>`<button data-o="${o}">${o==='none'?'Nothing, it looks right':FORMS[o].short}</button>`).join('')}</div><div id="verdict"></div>
   <div class="row"><button class="tg" data-a="exit">Done</button></div>`;}
function answer(o){if(learn.answered)return;learn.answered=true;const q=learn.qs[learn.qi],ok=o===q;if(ok)learn.score++;setPreset(FORMS[q].cam||'side');
  learnEl.querySelectorAll('.opts button').forEach(b=>{if(b.dataset.o===q)b.classList.add('right');else if(b.dataset.o===o)b.classList.add('wrong');});
  const F=FORMS[q],last=learn.qi>=learn.qs.length-1;$('#verdict').innerHTML=`<div class="verdict"><b style="color:${ok?'var(--ok)':'#ff7a6d'}">${ok?'Right!':'Not quite. It was: '+F.short.toLowerCase()+'.'}</b><span>${F.now}</span><span style="color:#9df0c8">Fix: ${F.fix}</span></div>
   <div class="row" style="margin-top:8px"><button class="tg on" data-a="nextq">${last?'See my score ›':'Next question ›'}</button></div>`;}
function nextQ(){learn.qi++;if(learn.qi<learn.qs.length){askQ();return;}setForm('good');const n=learn.qs.length;
  learnEl.innerHTML=`<span class="eyebrow">Quiz done</span><h3>You spotted ${learn.score} of ${n}</h3><p>${learn.score===n?'Sharp eyes. You know what a good '+EX.name.toLowerCase()+' looks like.':'Open “Spot the mistake” to watch the ones you missed side by side, then try again.'}</p>
   <div class="row"><button class="tg on" data-a="again">Try again</button><button class="tg" data-a="steps">Steps again</button><button class="tg" data-a="exit">Done</button></div>`;}
learnEl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!learn)return;
  if(b.dataset.o){answer(b.dataset.o);return;}
  ({play:playStep,all:playWhole,back:()=>goStep(Math.max(0,learn.i-1)),next:()=>learn.i<3?goStep(learn.i+1):startQuiz(),exit:exitLearn,nextq:nextQ,again:startQuiz,steps:()=>goStep(0)})[b.dataset.a]?.();});

// ---------------------------------------------------------------- main loop
const HERO_START=V(-.4,0,8.6),INSIDE=V(0,0,-3.4),MEET=V(.25,0,-4.75);
function update(dtReal){const dt0=paused&&flow==='exercise'?0:dtReal;const dt=flow==='exercise'?dt0:dtReal*fastF;
  ft+=dt;MU.uT.value+=dtReal;
  // lights: the gym lights flicker on, row by row, once the lifter steps in
  const tl=flow==='landing'||flow==='street'?0:1;if(tl)lightsOn=clamp(lightsOn+dt*.55,0,1);
  tubes.forEach(t=>{const on=lightsOn*7-t.userData.row;const flick=on>0&&on<1?(Math.random()<.5?0:1):on>=1?1:0;t.material.emissiveIntensity=flick*1.6;});
  inLights.forEach(([l,max])=>{l.intensity=max*smooth(clamp(lightsOn*1.2,0,1));});M.window.emissiveIntensity=.02+lightsOn*.55;
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
    const mid=V().addVectors(hero.pos,coach.pos).multiplyScalar(.5);cam.tPos.set(mid.x-2.4,1.75,mid.z+1.9);cam.tLook.set(mid.x+.15,1.45,mid.z);
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

// ---------------------------------------------------------------- debug: paint check (?paint)
if(/[?&]paint/.test(location.search)){
  (async()=>{const parse=b64=>new Promise((res,rej)=>{const s=atob(b64);const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);loader.parse(u.buffer,'',res,rej);});
    const g=await parse(window.GLB.lifter);hero=makeChar(g,MU);measure(hero);paintMuscles(hero);
    const cols=[0,0xff0000,0xff8800,0x00ff00,0x00aa88,0x0088ff,0xffff00,0xaa00ff,0x884400,0xff00ff,0x00ffff,0x2222ff,0xff4488,0x88ff00,0x008800,0xffaaaa,0xaa8800,0x0000aa,0x444444,0xff6600,0x66ffcc,0x8888ff,0xccff00,0xff0088,0x00ff88,0xffffff];
    REG.forEach((n,i)=>{if(i){MU.uLv.value[i]=1;MU.uRole.value[i]=0;}});
    // one colour per region for the check: encode as role colours is not enough, so use a debug override
    hero.mats.forEach(m=>{m.onBeforeCompile=sh=>{sh.uniforms.uCols={value:cols.map(c=>new THREE.Color(c))};
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float mreg;uniform vec3 uCols[26];varying vec3 vC;').replace('#include <begin_vertex>','#include <begin_vertex>\nint ri=int(mreg+.5);vC=uCols[ri];');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vC;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nif(length(vC)>0.)diffuseColor.rgb=vC;');};m.customProgramCacheKey=()=>'dbg';m.needsUpdate=true;});
    lightsOn=1;hero.root.position.set(0,0,-6);
    const az=+(new URLSearchParams(location.search).get('az')||0);
    camera.position.set(Math.sin(az)*3,1.3,-6+Math.cos(az)*3);camera.lookAt(0,1.1,-6);
    inLights.forEach(([l,m])=>l.intensity=m);fill.intensity=1.5;
    composer.render();window.__ready=true;})();
}
// test only: evaluate an expression in the app's module scope (poses, stations, helpers)
if(TEST)window.__eval=s=>eval(s);
