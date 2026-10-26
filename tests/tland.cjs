const { chromium } = require('playwright');
(async () => {const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
 for(const [w,h,n] of (process.env.ONLY==='m'?[[390,844,'m']]:[[1280,760,'d'],[390,844,'m']])){
  const p = await b.newPage({ viewport: { width: w, height: h } });p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('http://localhost:'+(process.env.PORT||8767)+'/index.html');await p.waitForFunction(() => !document.querySelector('#go').disabled, null, { timeout: 180000 });
  await p.waitForTimeout(2500);await p.screenshot({path:`out/land-${n}-0.png`,timeout:180000});
  await p.click('#go');for(const t of [.7,1.4,2.1,2.8,4,6]){await p.waitForTimeout(700);await p.screenshot({path:`out/land-${n}-${t}.png`,timeout:180000});}
  await p.close();}
 await b.close();})();
