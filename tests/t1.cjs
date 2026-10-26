// story: landing -> street -> door -> coach -> pick chest -> plan -> first exercise
const { chromium } = require('playwright');
const W=+(process.env.W||1280),H=+(process.env.H||760),pre=process.env.PRE||'s';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  p.on('pageerror', e => console.log('PAGEERR', e.message, (e.stack||'').split('\n').slice(1,3).join(' | ')));
  p.on('console', m => { if (m.type()==='error'||m.type()==='warning') console.log(m.type(), m.text().slice(0,300)); });
  await p.goto('http://localhost:8767/index.html?test');
  await p.waitForFunction(() => window.__ready, null, { timeout: 120000 });
  const snap = async n => { await p.waitForTimeout(200); await p.screenshot({ path: `out/${pre}-${n}.png` }); console.log('shot',n, JSON.stringify(await p.evaluate(()=>__api.state))); };
  const adv = s => p.evaluate(s => __advance(s), s);
  await snap('landing');
  await p.click('#go'); await adv(2); await snap('street');
  await adv(3.5); await snap('door');
  await adv(3); await snap('inside');
  for(let i=0;i<20&&await p.evaluate(()=>__api.flow)!=='ask';i++) await adv(1);
  await adv(1); await snap('ask');
  await p.evaluate(g=>__api.chooseGroup(g),process.env.G||'chest'); await adv(1.5); await snap('plan');
  await p.click('#planGo'); 
  for(let i=0;i<40&&await p.evaluate(()=>__api.flow)!=='exercise';i++){ await adv(1); if(i%5==2) await snap('walk'+i);}
  await adv(1); await snap('exercise');
  await b.close();
})();
