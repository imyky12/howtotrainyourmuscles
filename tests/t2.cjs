// each exercise: walk there from the coach, get on, train, get off. Screens at several moments.
const { chromium } = require('playwright');
const W=+(process.env.W||1280),H=+(process.env.H||760),pre=process.env.PRE||'e';
const KEYS=(process.env.EXS||'').split(',').filter(Boolean);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  p.on('pageerror', e => console.log('PAGEERR', e.message, (e.stack||'').split('\n').slice(1,3).join(' | ')));
  p.on('console', m => { if (m.type()==='error'||m.type()==='warning') console.log(m.type(), m.text().slice(0,300)); });
  await p.goto('http://localhost:8767/index.html?test');
  await p.waitForFunction(() => window.__ready, null, { timeout: 120000 });
  const snap = async n => { await p.waitForTimeout(150); await p.screenshot({ path: `out/${pre}-${n}.png` }); };
  const adv = s => p.evaluate(s => __advance(s), s);
  await p.evaluate(()=>{__api.start();}); await adv(.5); await p.evaluate(()=>__api.skipIntro()); await adv(1);
  await p.evaluate(()=>__api.chooseGroup('chest'));
  for(const k of KEYS){
    await p.evaluate(k=>__api.goExercise(k),k);
    let n=0,last='';
    for(let i=0;i<120;i++){await adv(.5);const st=await p.evaluate(()=>__api.state);
      const tag=st.flow+(st.hero.step??'');
      if(st.flow==='entering'||st.flow==='leaving'||(st.hero.act==='seq')){ if(i%2==0) await snap(`${k}-${String(n++).padStart(2,'0')}-${tag}`);}
      if(st.flow==='exercise'){await adv(1.5);await snap(`${k}-${String(n++).padStart(2,'0')}-ex`);break;}}
    console.log(k,'reached', await p.evaluate(()=>JSON.stringify(__api.state)));
  }
  await b.close();
})();
