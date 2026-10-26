// a whole plan like a user: plan -> each exercise via "Next", checking walks for collisions and taking a filmstrip
const { chromium } = require('playwright');
const W=+(process.env.W||1000),H=+(process.env.H||640),G=process.env.G||'chest',PLAN=+(process.env.PLAN||0);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  p.on('pageerror', e => console.log('PAGEERR', e.message, (e.stack||'').split('\n').slice(1,3).join(' | ')));
  await p.goto('http://localhost:8767/index.html?test');
  await p.waitForFunction(() => window.__ready, null, { timeout: 120000 });
  const snap = async n => { await p.waitForTimeout(120); await p.screenshot({ path: `out/f/${G}${PLAN}-${n}.png` }); };
  await p.evaluate(()=>{__api.start();}); await p.evaluate(()=>__advance(.5)); await p.evaluate(()=>__api.skipIntro()); await p.evaluate(()=>__advance(1));
  await p.evaluate(g=>__api.chooseGroup(g),G); await p.evaluate(()=>__advance(1));
  if(PLAN) await p.evaluate(i=>document.querySelectorAll('#planTabs button')[i].click(),PLAN);
  const list=await p.evaluate(()=>[...document.querySelectorAll('#planList b')].map(b=>b.textContent));
  console.log(G,PLAN,'plan:',list.join(' | '));
  await p.click('#planGo');
  for(let ex=0;ex<list.length;ex++){
    let t=0,shots=0,bad={cam:0,hero:0,coach:0};const t0=Date.now();
    for(let i=0;i<240;i++){const r=await p.evaluate(()=>__walkCheck(.5));t+=.5;bad.cam+=r.cam.length;bad.hero+=r.hero;bad.coach+=r.coach;
      if(r.cam.length)console.log('  cam in wall',r.cam[0]);
      const st=await p.evaluate(()=>__api.state);
      if(i%4==1){await p.evaluate(()=>__advance(0));await snap(`${ex}-${String(shots++).padStart(2,'0')}-${st.flow}`);}
      if(st.flow==='exercise'){await p.evaluate(()=>__advance(1));await snap(`${ex}-zz-ex`);break;}}
    const st=await p.evaluate(()=>__api.state);
    console.log(` ${ex} ${st.EXK} reached=${st.flow==='exercise'} t=${t}s heroInSolid=${bad.hero} coachInSolid=${bad.coach} camInWall=${bad.cam}`);
    if(ex<list.length-1){const ok=await p.evaluate(()=>{const b=document.querySelector('#nextBtn');if(!b||b.hidden)return false;b.click();return true;});if(!ok){console.log('  no next button');break;}}
  }
  await b.close();
})();
