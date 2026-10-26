
// ---------------------------------------------------------------- navigation: a floor grid built from the real geometry
// Every mesh that stands between the ankles and head height blocks its footprint. People plan paths with A* on the grid,
// grown by their body radius, so a path can never pass through equipment, walls or the closed part of the facade.
const NAV={x0:-20,z0:-24,x1:20,z1:12,c:.1};NAV.nx=Math.round((NAV.x1-NAV.x0)/NAV.c);NAV.nz=Math.round((NAV.z1-NAV.z0)/NAV.c);
NAV.solid=new Uint8Array(NAV.nx*NAV.nz); // footprint of things (no clearance)
NAV.block=new Uint8Array(NAV.nx*NAV.nz); // footprint grown by the walker's radius
NAV.boxes=[];
const NAV_R=.34;
const navIdx=(i,j)=>j*NAV.nx+i;
const navCell=(x,z)=>[Math.floor((x-NAV.x0)/NAV.c),Math.floor((z-NAV.z0)/NAV.c)];
const navPos=(i,j)=>V(NAV.x0+(i+.5)*NAV.c,0,NAV.z0+(j+.5)*NAV.c);
function navSkip(o){return o.userData.walkable||o===floor||o===ground||o===walkway||(o.parent&&o.parent.userData&&o.parent.userData.walkable);}
function buildNav(){
  NAV.solid.fill(0);NAV.block.fill(0);NAV.boxes=[];scene.updateMatrixWorld(true);const bb=new THREE.Box3();
  const add=(x0,x1,z0,z1)=>{NAV.boxes.push([x0,x1,z0,z1]);};
  scene.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||navSkip(o))return;let p=o;while(p){if(p.userData&&(p.userData.walkable||p.userData.prop))return;p=p.parent;}
    bb.setFromObject(o);if(bb.min.y>1.75||bb.max.y<.06)return;if(bb.max.x-bb.min.x>30||bb.max.z-bb.min.z>30)return;add(bb.min.x,bb.max.x,bb.min.z,bb.max.z);});
  for(const [x0,x1,z0,z1] of NAV.boxes){stamp(NAV.solid,x0,x1,z0,z1,0);stamp(NAV.block,x0,x1,z0,z1,NAV_R);}
  // the street edge and far ends are out of bounds
  stamp(NAV.block,-20,20,9.5,12,0);}
function stamp(arr,x0,x1,z0,z1,r){const [i0,j0]=navCell(x0-r,z0-r),[i1,j1]=navCell(x1+r,z1+r);
  for(let j=Math.max(0,j0);j<=Math.min(NAV.nz-1,j1);j++)for(let i=Math.max(0,i0);i<=Math.min(NAV.nx-1,i1);i++){
    if(r>0){const p=navPos(i,j);const dx=Math.max(x0-p.x,0,p.x-x1),dz=Math.max(z0-p.z,0,p.z-z1);if(dx*dx+dz*dz>r*r)continue;}arr[navIdx(i,j)]=1;}}
function navFree(x,z,dyn){const [i,j]=navCell(x,z);if(i<0||j<0||i>=NAV.nx||j>=NAV.nz)return false;if(NAV.block[navIdx(i,j)])return false;
  if(dyn)for(const d of dyn){if((x-d.x)**2+(z-d.z)**2<d.r*d.r)return false;}return true;}
function navLOS(a,b,dyn){const d=a.distanceTo(b),n=Math.max(2,Math.ceil(d/.05));for(let k=0;k<=n;k++){const t=k/n;if(!navFree(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,dyn))return false;}return true;}
// A* from a to b (world xz); dyn = discs of other people to keep clear of
function findPath(a,b,dyn=[]){
  dyn=dyn.filter(d=>(a.x-d.x)**2+(a.z-d.z)**2>d.r*d.r&&(b.x-d.x)**2+(b.z-d.z)**2>d.r*d.r);
  const [si,sj]=navCell(a.x,a.z),[gi,gj]=navCell(b.x,b.z);const N=NAV.nx*NAV.nz;
  const ok=(i,j)=>i>=0&&j>=0&&i<NAV.nx&&j<NAV.nz&&!NAV.block[navIdx(i,j)]&&(!dyn.length||navFree(NAV.x0+(i+.5)*NAV.c,NAV.z0+(j+.5)*NAV.c,dyn));
  const g=new Float32Array(N).fill(1e9),came=new Int32Array(N).fill(-1),closed=new Uint8Array(N);
  const heap=[];const push=(f,k)=>{heap.push([f,k]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m;}}return top;};
  const h=(i,j)=>{const dx=Math.abs(i-gi),dz=Math.abs(j-gj);return (dx+dz+(1.4142-2)*Math.min(dx,dz));};
  const s=navIdx(si,sj),t=navIdx(gi,gj);g[s]=0;push(h(si,sj),s);let found=false;
  while(heap.length){const [,k]=pop();if(closed[k])continue;closed[k]=1;if(k===t){found=true;break;}const i=k%NAV.nx,j=(k/NAV.nx)|0;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=i+di,nj=j+dj;if(!ok(ni,nj)&&navIdx(ni,nj)!==t)continue;
      if(di&&dj&&(!ok(i+di,j)||!ok(i,j+dj)))continue;const nk=navIdx(ni,nj);const ng=g[k]+(di&&dj?1.4142:1);if(ng<g[nk]){g[nk]=ng;came[nk]=k;push(ng+h(ni,nj),nk);}}}
  if(!found)return null;
  const cells=[];for(let k=t;k!==-1;k=came[k])cells.push(navPos(k%NAV.nx,(k/NAV.nx)|0));cells.reverse();cells[0]=a.clone().setY(0);cells[cells.length-1]=b.clone().setY(0);
  // string pulling: keep only the turning points that are needed to see around corners
  const pts=[cells[0]];let i=0;while(i<cells.length-1){let j=cells.length-1;while(j>i+1&&!navLOS(cells[i],cells[j],dyn))j--;pts.push(cells[j]);i=j;}
  return smoothPath(pts,dyn);}
// round the corners with short curves so walkers turn like people, not robots
function smoothPath(pts,dyn){if(pts.length<3)return pts;const out=[pts[0]];
  for(let k=1;k<pts.length-1;k++){const p=pts[k],a=pts[k-1],b=pts[k+1];let d=Math.min(.55,a.distanceTo(p)*.45,b.distanceTo(p)*.45);
    for(let tries=0;tries<4;tries++){const p0=p.clone().addScaledVector(V().subVectors(a,p).normalize(),d),p1=p.clone().addScaledVector(V().subVectors(b,p).normalize(),d);
      const seg=[];for(let s=0;s<=6;s++){const t=s/6;seg.push(V().addScaledVector(p0,(1-t)*(1-t)).addScaledVector(p,2*(1-t)*t).addScaledVector(p1,t*t));}
      if(seg.every((q,s)=>s===0||navLOS(seg[s-1],q,dyn))&&navLOS(out[out.length-1],p0,dyn)){out.push(...seg);break;}d*=.5;if(tries===3)out.push(p);}}
  out.push(pts[pts.length-1]);return out;}
function pathLen(P){let L=0;for(let i=1;i<P.length;i++)L+=P[i].distanceTo(P[i-1]);return L;}
function pathAt(P,s){for(let i=1;i<P.length;i++){const d=P[i].distanceTo(P[i-1]);if(s<=d||i===P.length-1){const t=d>0?clamp(s/d,0,1):1;return {p:P[i-1].clone().lerp(P[i],t),dir:V().subVectors(P[i],P[i-1]).normalize()};}s-=d;}return {p:P[P.length-1].clone(),dir:V(0,0,1)};}
