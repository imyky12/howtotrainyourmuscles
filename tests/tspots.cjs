const { chromium } = require('playwright');
(async () => {const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 400, height: 300 } });p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('http://localhost:8767/index.html?test');await p.waitForFunction(() => window.__ready, null, { timeout: 120000 });
  console.log((await p.evaluate(()=>__checkSpots())).join('\n')||'all spots ok');await b.close();})();
