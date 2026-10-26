// close-up of each exercise: bottom, middle, top, then each mistake in the split view
const { chromium } = require('playwright');
const W=+(process.env.W||900),H=+(process.env.H||700),pre=process.env.PRE||'x';
const KEYS=(process.env.EXS||'').split(',').filter(Boolean);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  p.on('pageerror', e => console.log('PAGEERR', e.message, (e.stack||'').split('\n').slice(1,3).join(' | ')));
  p.on('console', m => { if (m.type()==='error'||m.type()==='warning') console.log(m.type(), m.text().slice(0,300)); });
  await p.goto('http://localhost:8767/index.html?test');
  await p.waitForFunction(() => window.__ready, null, { timeout: 120000 });
  const snap = async n => { if(process.env.NOSHOT)return; await p.waitForTimeout(100); await p.screenshot({ path: `out/${pre}-${n}.png` }); };
  for(const k of (KEYS.length?KEYS:await p.evaluate(()=>Object.keys(__api.EXS)))){
    await p.evaluate(k=>{__studio(k);__advance(.6);},k);
    const T=await p.evaluate(()=>{const F=__api.FORMS.good;return [F.lower,F.touch,F.press,F.lock];});
    const at=[T[0]+T[1]*.5, T[0]+T[1]+T[2]*.5, T[0]+T[1]+T[2]+T[3]*.5];
    for(const [i,t] of at.entries()){await p.evaluate(t=>{__api.seek(t);__advance(1/30);},t);await snap(`${k}-${i}`);}
    const ms=await p.evaluate(()=>Object.keys(__api.FORMS).filter(f=>f!=='good'));
    for(const m of ms){await p.evaluate(m=>{__api.setSpeed(1);__api.setForm(m);__advance(Math.max(4,2*1));},m);
      const F=await p.evaluate(m=>{const F=__api.FORMS[m];return [F.lower,F.touch,F.press,F.lock];},m);
      await p.evaluate(F=>{__advance(F[0]+F[1]+F[2]+F[3]);},F);
      const tag=await p.evaluate(()=>[document.getElementById('tagL').innerText.replace(/\n/g,' | '),document.getElementById('tagR').innerText.replace(/\n/g,' | ')]);
      console.log(k,m,JSON.stringify(tag));
      await p.evaluate(F=>{__api.seek(F[0]+F[1]*.5);__advance(1/30);},F);await snap(`${k}-m-${m}-b`);
      await p.evaluate(F=>{__api.seek(F[0]+F[1]+F[2]+F[3]*.5);__advance(1/30);},F);await snap(`${k}-m-${m}-t`);}
    await p.evaluate(()=>{__api.setSpeed(1);__api.setForm('good');});
  }
  await b.close();
})();
