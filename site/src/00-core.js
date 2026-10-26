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

