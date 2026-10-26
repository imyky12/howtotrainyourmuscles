const { chromium } = require('playwright');
(async () => {const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
 for(const [w,h,n] of [[1280,800,'d'],[390,844,'m']]){
  const p = await b.newPage({ viewport: { width: w, height: h } });p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('http://localhost:8767/index.html?test');await p.waitForFunction(() => window.__ready, null, { timeout: 120000 });
  await p.evaluate(()=>{__studio(process_k='squat');__advance(.6);});
  await p.evaluate(()=>{__api.setForm('kneeIn');__advance(3);});await p.screenshot({path:`out/split-${n}1.png`});
  await p.evaluate(()=>{__api.openMistakes();__advance(.5);});await p.screenshot({path:`out/split-${n}2.png`});
  await p.close();}
 await b.close();})();
