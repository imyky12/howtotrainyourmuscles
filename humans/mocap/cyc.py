import numpy as np, bvh, rt
NPH=96
def qavg(Q,w):  # Q (k,...,4) weights (k,)
    ref=Q[0]; d=np.sign(np.sum(Q*ref,-1,keepdims=True)); d[d==0]=1
    s=np.tensordot(w,Q*d,axes=(0,0)); return s/np.linalg.norm(s,axis=-1,keepdims=True)
def cycles(style,kind='FW',vmin=0,turnmax=25,fwd=True):
    b=bvh.load(rt.M+f'{style}/{style}_{kind}.bvh'); s,e=rt.cut(style,kind)
    L=rt.local_frames(b); n=b['names']; la,ra=n.index('LeftAnkle'),n.index('RightAnkle')
    def strikes(j):
        z=L['P'][:,j,2]*(1 if fwd else -1); return [f for f in range(s+3,e-3) if z[f]==z[f-3:f+4].max()]
    ls,rs=strikes(la),strikes(ra)
    dth=np.degrees(np.abs(np.gradient(L['th'])))*60
    out=[]
    for a,c in zip(ls[:-1],ls[1:]):
        r=[x for x in rs if a<x<c]
        if len(r)!=1 or not(50<c-a<130): continue
        sp=L['speed'][a:c].mean(); tm=dth[a:c].mean()
        if sp<vmin or tm>turnmax: continue
        out.append((a,r[0],c,sp))
    # resample each cycle to NPH phase samples, warping so RHS lands at mean ratio
    rat=np.mean([(m-a)/(c-a) for a,m,c,_ in out])
    Q=[];H=[]
    for a,m,c,_ in out:
        ph=np.linspace(0,1,NPH+1)
        fr=np.where(ph<rat,a+(m-a)*ph/rat,m+(c-m)*(ph-rat)/(1-rat))
        i0=np.minimum(np.floor(fr).astype(int),c-1); t=(fr-i0)[:,None]
        q0=rt.m2q(L['G'][i0]); q1=rt.m2q(L['G'][i0+1]); q1*=np.sign(np.sum(q0*q1,-1,keepdims=True))
        q=q0*(1-t[...,None])+q1*t[...,None]; Q.append(q/np.linalg.norm(q,axis=-1,keepdims=True))
        H.append(L['P'][i0,0]*(1-t)+L['P'][i0+1,0]*t)
    return dict(b=b,Q=np.array(Q),H=np.array(H),dur=np.mean([c-a for a,_,c,_ in out])*b['ft'],speed=np.mean([x[3] for x in out]),n=len(out),rat=rat)
def blend(parts):  # [(cycles,weight)]
    Qs=[];W=[];H=0;dur=0;sp=0;tw=sum(w for _,w in parts)
    for C,w in parts:
        Qs.append(C['Q']);W+= [w/tw/C['n']]*C['n']; H=H+C['H'].mean(0)*w/tw; dur+=C['dur']*w/tw; sp+=C['speed']*w/tw
    Q=qavg(np.concatenate(Qs),np.array(W)); G=rt.q2m(Q)
    # close the loop: spread the end-to-start mismatch over the cycle (rotations and hips)
    w=np.linspace(0,1,len(G))
    D=rt.logm(np.einsum('jab,jcb->jac',G[0],G[-1]))  # G0 Gend^-1 per joint
    G=np.einsum('njab,njbc->njac',rt.expm(w[:,None,None]*D[None]),G)
    H=H+w[:,None]*(H[0]-H[-1])[None]
    return dict(b=parts[0][0]['b'],G=G[:-1],hip=H[:-1],dur=dur,speed=sp)
if __name__=='__main__':
    for st in ['Neutral','SwingShoulders','Proud','Strutting']:
        for vmin in [0,.9]:
            C=cycles(st,vmin=vmin); print(st,vmin,C['n'],round(C['dur'],3),round(C['speed'],3),round(C['rat'],3))
