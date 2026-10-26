
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
