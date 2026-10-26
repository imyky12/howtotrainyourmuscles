
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
  defEx(k,{...o,group:'chest',part:CHEST_PART[k],fam:o.fam,pose,station:CHEST_ST[k],entry:CHEST_ENTRY[o.fam],
    mus:chestMus(o.mus),labels:[[upE>.3?'Upper chest':upE<-.3?'Lower chest':'Chest',upE>.3?'pecU':'pecL','m'],['Front shoulder','deltF','h'],...(o.mus.tri>=.2?[['Triceps','triLat','h']]:[])],
    center:V(0,c[0]+(o.angle>0?.15:0),c[1]-(o.angle>0?.15:0)),coachSpot:o.coach==='head'?{p:[-.3,o.angle>0?-13.7:-13.45],h:0}:{p:[-1.62,-11.3],h:Math.PI/2},
    needs:o.fam==='db'||o.fam==='fly'?'db':null});}
EXS.dip.coachSpot={p:[1.35,-11.2],h:-Math.PI/2-.4};EXS.machinePress.coachSpot={p:[1.3,-11.3],h:-Math.PI/2};
