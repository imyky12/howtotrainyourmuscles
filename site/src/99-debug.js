
// ---------------------------------------------------------------- debug: paint check (?paint)
if(/[?&]paint/.test(location.search)){
  (async()=>{const parse=b64=>new Promise((res,rej)=>{const s=atob(b64);const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);loader.parse(u.buffer,'',res,rej);});
    const g=await parse(window.GLB.lifter);hero=makeChar(g,MU);measure(hero);paintMuscles(hero);
    const cols=[0,0xff0000,0xff8800,0x00ff00,0x00aa88,0x0088ff,0xffff00,0xaa00ff,0x884400,0xff00ff,0x00ffff,0x2222ff,0xff4488,0x88ff00,0x008800,0xffaaaa,0xaa8800,0x0000aa,0x444444,0xff6600,0x66ffcc,0x8888ff,0xccff00,0xff0088,0x00ff88,0xffffff];
    REG.forEach((n,i)=>{if(i){MU.uLv.value[i]=1;MU.uRole.value[i]=0;}});
    // one colour per region for the check: encode as role colours is not enough, so use a debug override
    hero.mats.forEach(m=>{m.onBeforeCompile=sh=>{sh.uniforms.uCols={value:cols.map(c=>new THREE.Color(c))};
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float mreg;uniform vec3 uCols[26];varying vec3 vC;').replace('#include <begin_vertex>','#include <begin_vertex>\nint ri=int(mreg+.5);vC=uCols[ri];');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vC;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nif(length(vC)>0.)diffuseColor.rgb=vC;');};m.customProgramCacheKey=()=>'dbg';m.needsUpdate=true;});
    lightsOn=1;hero.root.position.set(0,0,-6);
    const az=+(new URLSearchParams(location.search).get('az')||0);
    camera.position.set(Math.sin(az)*3,1.3,-6+Math.cos(az)*3);camera.lookAt(0,1.1,-6);
    inLights.forEach(([l,m])=>l.intensity=m);fill.intensity=1.5;
    composer.render();window.__ready=true;})();
}
