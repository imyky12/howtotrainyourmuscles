const { chromium } = require('playwright');
(async () => {const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
 for(const [w,h,n] of [[1280,760,'d'],[390,844,'m']]){
  const p = await b.newPage({ viewport: { width: w, height: h } });p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('http://localhost:8767/index.html');await p.waitForFunction(() => !document.querySelector('#go').disabled, null, { timeout: 180000 });
  await p.waitForTimeout(3000);await p.screenshot({path:`out/real-${n}-landing.png`});
  await p.click('#go');await p.waitForTimeout(6000);await p.screenshot({path:`out/real-${n}-walk.png`});
  await p.close();}
 await b.close();})();
