
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
