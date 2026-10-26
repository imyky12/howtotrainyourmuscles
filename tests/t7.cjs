// animation probe: every exercise of a group in a row, through fetch, walk, entry, reps, exit and putting things back
const { chromium } = require('playwright');
const G=process.env.G||'chest';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 640, height: 400 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message, (e.stack||'').split('\n').slice(1,3).join(' | ')));
  await p.goto('http://localhost:'+(process.env.PORT||8767)+'/index.html?test');
  await p.waitForFunction(() => window.__ready, null, { timeout: 120000 });
  await p.evaluate(()=>{__api.start();__advance(.5);__api.skipIntro();__advance(1);});
  await p.evaluate(g=>__api.chooseGroup(g),G);
  const keys=await p.evaluate(g=>Object.keys(__api.EXS).filter(k=>__api.EXS[k].group===g),G);
  console.log('meshes',await p.evaluate(()=>__probe.init()));
  const all=[...keys,keys[0]];
  for(const [i,k] of all.entries()){
    await p.evaluate(k=>{__api.goExercise(k);},k);const iss=[];let t=0;
    for(;t<150;t+=1){iss.push(...await p.evaluate(()=>__probe.run(1)));if(await p.evaluate(()=>__api.flow)==='exercise')break;}
    if(i<keys.length)iss.push(...await p.evaluate(()=>__probe.run(7)));
    const agg={};for(const x of iss){const key=x.slice(1,5).join(' | ').replace(/ \| [0-9.]+$/,'');if(!agg[key])agg[key]={n:0,t:x[0],max:x[x.length-1]};agg[key].n++;agg[key].max=Math.max(+agg[key].max||0,+x[x.length-1]||0);}
    console.log(`== ${k} reached=${await p.evaluate(()=>__api.flow)} after ${t}s`);
    for(const [key,v] of Object.entries(agg))console.log(`  ${v.n}x @${v.t} ${key} max=${v.max}`);
  }
  await b.close();
})();
