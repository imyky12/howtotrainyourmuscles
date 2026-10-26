import numpy as np, bvh, glbskel as g, json, sys
M='/tmp/claude-0/-home-user/a59811dd-c740-5dfc-b802-1ad306199947/scratchpad/mocap/100STYLE/'
CUTS={}
for l in open(M+'Frame_Cuts.csv').read().split('\n')[1:]:
    t=l.strip().split(',')
    if len(t)>5: CUTS[t[0]]=t[1:]
HDR='BR_START,BR_STOP,BW_START,BW_STOP,FR_START,FR_STOP,FW_START,FW_STOP,ID_START,ID_STOP,SR_START,SR_STOP,SW_START,SW_STOP,TR1_START,TR1_STOP'.split(',')
def cut(style,kind):
    r=CUTS[style]; return int(r[HDR.index(kind+'_START')]),int(r[HDR.index(kind+'_STOP')])
# ---------- quaternion / matrix utils
def m2q(R):  # (...,3,3) -> (...,4) xyzw
    R=np.asarray(R); sh=R.shape[:-2]; R=R.reshape(-1,3,3); q=np.zeros((len(R),4))
    for i,m in enumerate(R):
        t=np.trace(m)
        if t>0: s=np.sqrt(t+1)*2; q[i]=[(m[2,1]-m[1,2])/s,(m[0,2]-m[2,0])/s,(m[1,0]-m[0,1])/s,.25*s]
        elif m[0,0]>m[1,1] and m[0,0]>m[2,2]: s=np.sqrt(1+m[0,0]-m[1,1]-m[2,2])*2; q[i]=[.25*s,(m[0,1]+m[1,0])/s,(m[0,2]+m[2,0])/s,(m[2,1]-m[1,2])/s]
        elif m[1,1]>m[2,2]: s=np.sqrt(1+m[1,1]-m[0,0]-m[2,2])*2; q[i]=[(m[0,1]+m[1,0])/s,.25*s,(m[1,2]+m[2,1])/s,(m[0,2]-m[2,0])/s]
        else: s=np.sqrt(1+m[2,2]-m[0,0]-m[1,1])*2; q[i]=[(m[0,2]+m[2,0])/s,(m[1,2]+m[2,1])/s,.25*s,(m[1,0]-m[0,1])/s]
    return q.reshape(sh+(4,))
def q2m(q):
    q=np.asarray(q); x,y,z,w=[q[...,i] for i in range(4)]
    return np.stack([np.stack([1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],-1),np.stack([2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],-1),np.stack([2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)],-1)],-2)
def aa(axis,ang):
    axis=np.asarray(axis,float); axis=axis/np.linalg.norm(axis); K=np.array([[0,-axis[2],axis[1]],[axis[2],0,-axis[0]],[-axis[1],axis[0],0]])
    return np.eye(3)+np.sin(ang)*K+(1-np.cos(ang))*K@K
def rot_between(a,b):
    a=a/np.linalg.norm(a); b=b/np.linalg.norm(b); v=np.cross(a,b); c=a@b
    if np.linalg.norm(v)<1e-9: return np.eye(3)
    return aa(v,np.arctan2(np.linalg.norm(v),c))
def logm(R):  # rotation matrices -> rotation vectors
    q=m2q(R); q=q*np.sign(q[...,3:4]+1e-12); v=q[...,:3]; s=np.linalg.norm(v,axis=-1,keepdims=True); ang=2*np.arctan2(s,q[...,3:4])
    return np.where(s>1e-12,v/np.maximum(s,1e-12)*ang,0*v)
def expm(r):
    ang=np.linalg.norm(r,axis=-1,keepdims=True); ax=np.where(ang>1e-12,r/np.maximum(ang,1e-12),np.array([1.,0,0]))
    h=ang/2; q=np.concatenate([ax*np.sin(h),np.cos(h)],-1); return q2m(q)
def Ry(th):
    c,s=np.cos(th),np.sin(th); R=np.zeros(np.shape(th)+(3,3)); R[...,0,0]=c;R[...,0,2]=s;R[...,1,1]=1;R[...,2,0]=-s;R[...,2,2]=c; return R
def gsmooth(x,sig):
    k=np.arange(-3*int(sig),3*int(sig)+1); w=np.exp(-.5*(k/sig)**2); w/=w.sum()
    xp=np.concatenate([np.repeat(x[:1],len(k)//2,0),x,np.repeat(x[-1:],len(k)//2,0)],0)
    return np.stack([np.convolve(xp[:,i],w,'valid') for i in range(x.shape[1])],1) if x.ndim>1 else np.convolve(xp,w,'valid')
# ---------- source in a moving local frame
def local_frames(b, heading_mode='vel', sig=30):
    G,P=bvh.fk(b); h=P[:,0,[0,2]]
    hs=gsmooth(h,sig)
    if heading_mode=='vel':
        v=np.gradient(hs,axis=0); th=np.unwrap(np.arctan2(v[:,0],v[:,1])); th=gsmooth(th,sig//2)
    else:  # mean hip facing (idle)
        f=G[:,0,:,2]; th=np.unwrap(np.arctan2(f[:,0],f[:,2])); th=gsmooth(th,sig)
    Rinv=Ry(-th)
    Gl=np.einsum('nij,nkjl->nkil',Rinv,G)
    root=np.zeros((len(P),3)); root[:,0]=hs[:,0]; root[:,2]=hs[:,1]
    Pl=np.einsum('nij,nkj->nki',Rinv,P-root[:,None,:])
    return dict(G=Gl,P=Pl,th=th,hs=hs,speed=np.linalg.norm(np.gradient(hs,axis=0),axis=1)/b['ft']/100)
