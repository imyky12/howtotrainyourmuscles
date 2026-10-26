const { chromium } = require('playwright');
(async () => {const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 400, height: 300 } });
  await p.goto('http://localhost:8767/index.html?test');await p.waitForFunction(() => window.__ready, null, { timeout: 120000 });
  const r=await p.evaluate(()=>{const o={};for(const k in __api.EXS){const E=__api.EXS[k];o[k]={name:E.name,steps:E.stepText,how:E.how,cues:E.cues,beginner:E.beginner,quip:E.quip,forms:{}};for(const f in E.forms){const F=E.forms[f];o[k].forms[f]={btn:F.btn,tag:F.tag,short:F.short,wrong:F.wrong,now:F.now,later:F.later,fix:F.fix,warn:F.warn,meas:F.meas};}}return o;});
  require('fs').writeFileSync('out/texts.json',JSON.stringify(r,null,1));await b.close();})();
