
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
