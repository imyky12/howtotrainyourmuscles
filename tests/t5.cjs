// the intro: camera never inside a wall; people never inside equipment while walking
const { chromium } = require('playwright');
(async () => {const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  for(const [W,H] of [[1280,760],[390,844]]){
  const p = await b.newPage({ viewport: { width: W, height: H } });p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('http://localhost:8767/index.html?test');await p.waitForFunction(() => window.__ready, null, { timeout: 120000 });
  await p.evaluate(()=>__api.start());
  let r=await p.evaluate(()=>__walkCheck(16));console.log(W,'intro',JSON.stringify({...r,cam:r.cam.slice(0,5),camN:r.cam.length}),await p.evaluate(()=>__api.flow));
  await p.evaluate(()=>__api.chooseGroup('legs'));
  for(const k of ['squat','legPress','standCalf','rdl']){await p.evaluate(k=>__api.goExercise(k),k);r=await p.evaluate(()=>__walkCheck(40));console.log(W,k,JSON.stringify({...r,cam:r.cam.slice(0,3),camN:r.cam.length}),await p.evaluate(()=>__api.flow));}
  await p.close();}
  await b.close();})();
