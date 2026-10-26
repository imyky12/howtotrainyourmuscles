import numpy as np, rt
def nrm(v): return v/np.linalg.norm(v,axis=-1,keepdims=True)
def two_bone(T,LR,hip,side,delta):
    """shift each frame's ankle by delta (n,3) cm keeping the foot's world orientation"""
    G,P=T.fk(LR,hip); U,K,F=side+'UpLeg',side+'Leg',side+'Foot'
    A,B,C=P[U],P[K],P[F]; Ct=C+delta
    l1=np.linalg.norm(B-A,axis=1); l2=np.linalg.norm(C-B,axis=1)
    d=np.clip(np.linalg.norm(Ct-A,axis=1),abs(l1-l2)+1e-3,l1+l2-1e-3)
    def ang(a,b,c): return np.arccos(np.clip((a*a+b*b-c*c)/(2*a*b),-1,1))
    cur=ang(l1,l2,np.linalg.norm(C-A,axis=1)); want=ang(l1,l2,d)
    n=np.cross(B-A,C-B); bad=np.linalg.norm(n,axis=1)<1e-6
    n[bad]=np.einsum('nij,j->ni',G[U][bad],[1,0,0]); n=nrm(n)
    # bending more = smaller interior angle; rotate shin about n by (cur-want)
    Rk=np.array([rt.aa(n[i],cur[i]-want[i]) for i in range(len(n))])
    GK=np.einsum('nij,njk->nik',Rk,G[K])
    Cn=B+np.einsum('nij,j->ni',GK,T.off[F])
    Ru=np.array([rt.rot_between(Cn[i]-A[i],Ct[i]-A[i]) for i in range(len(n))])
    GU=np.einsum('nij,njk->nik',Ru,G[U]); GK=np.einsum('nij,njk->nik',Ru,GK)
    GP=G[T.par[U]]
    LR[U]=np.einsum('nji,njk->nik',GP,GU); LR[K]=np.einsum('nji,njk->nik',GU,GK); LR[F]=np.einsum('nji,njk->nik',GK,G[F])
