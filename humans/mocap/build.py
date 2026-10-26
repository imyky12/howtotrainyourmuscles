import numpy as np, rt, cyc, tgt, bvh, json, sys, base64
H='/tmp/claude-0/-home-user-anchors-demo-videos/a59811dd-c740-5dfc-b802-1ad306199947/scratchpad/humans/'
def circ_smooth(x,sig):
    n=len(x); k=np.arange(-3*sig,3*sig+1); w=np.exp(-.5*(k/sig)**2); w/=w.sum()
    return np.stack([sum(w[i]*np.roll(x[:,c],-k[i]) for i in range(len(k))) for c in range(x.shape[1])],1)
def shoe(T):
    if not hasattr(T,'shoe'):
        p=[]
        for m in T.js['meshes']:
            if 'shoe' in m['name'].lower():
                p+= [tgt.g.acc_data(T.js,T.bin,pr['attributes']['POSITION']) for pr in m['primitives']]
        p=np.concatenate(p)*100; p=p[p[:,0]>0]; T.shoe=(p[:,2].min(),p[:,2].max())
    return T.shoe
def foot_pts(T,G,P,side):
    zmin,zmax=shoe(T); a=T.pos[side+'Foot']; t=T.pos[side+'ToeBase']
    heel=P[side+'Foot']+np.einsum('nij,j->ni',G[side+'Foot'],[0,-a[1],zmin+1.5-a[2]])
    ball=P[side+'ToeBase']+np.einsum('nij,j->ni',G[side+'ToeBase'],[0,-t[1],0])
    toe=P[side+'ToeBase']+np.einsum('nij,j->ni',G[side+'ToeBase'],[0,-t[1]+.8,zmax-1.5-t[2]])
    return heel,ball,toe
def contact(T,G,P):
    out={}
    for s in ('Left','Right'):
        heel,ball,toe=foot_pts(T,G,P,s); pts=np.stack([heel,ball,toe],1); lo=pts[:,:,1].min(1)
        out[s]=(pts,lo)
    return out
def walk_clip(T,parts,plant=True,head_down=None):
    C=cyc.blend(parts); b=C['b']; n=len(C['G'])
    LR,hip,scale=tgt.retarget(T,b,C['G'],C['hip'],head_down=head_down)
    dur=C['dur']; dt=dur/n
    G,P=T.fk(LR,hip)
    # ground: lowest foot point -> 0
    ct=contact(T,G,P); low=np.minimum(ct['Left'][1],ct['Right'][1]); g0=np.median(np.sort(low)[:n//2]); hip[:,1]-=max(g0,low.min()+0.4)  # stance on the floor; no shoe point more than 4 mm below it
    G,P=T.fk(LR,hip); ct=contact(T,G,P)
    # stance speed from the ball point of each foot while low
    vs=[]
    for s in ('Left','Right'):
        pts,lo=ct[s]; st=lo<lo.min()+1.5; z=pts[:,1,2]; dz=np.diff(np.r_[z,z[0]]); vs.append(-np.median(dz[st[:]]))
    v=np.mean(vs)  # cm per sample
    def contacts(ct):
        C={}
        for s in ('Left','Right'):
            pts,lo=ct[s]
            for k in (0,1,2):  # heel, ball, toe tip
                y=pts[:,k,1]; C[(s,k)]=np.clip((1.2-y)/1.0,0,1)
        return C
    if plant:
        import ik
        C=contacts(ct)
        for s in ('Left','Right'):
            pts=ct[s][0]; wh,wb,wt=C[(s,0)],C[(s,1)],C[(s,2)]; wf=np.maximum(np.maximum(wh,wb),wt); st=wf>0
            vel=lambda p:(np.roll(p,-1,0)-np.roll(p,1,0))/2
            vr=(vel(pts[:,0])*wh[:,None]+vel(pts[:,1])*wb[:,None]+vel(pts[:,2])*wt[:,None])/np.maximum(wh+wb+wt,1e-6)[:,None]
            vr[:,2]+=v; vr[:,1]=0
            delta=np.zeros((n,3)); wgt=np.zeros(n)
            for a in [i for i in range(n) if st[i] and not st[i-1]]:
                seg=[];i=a
                while st[i%n] and len(seg)<n: seg.append(i%n); i+=1
                seg=np.array(seg); ww=wf[seg]
                acc=-np.cumsum(vr[seg]*ww[:,None],0); acc-=np.sum(ww[:,None]*acc,0)/ww.sum()
                delta[seg]=acc; wgt[seg]=1
                # ramp in/out over 8 samples of swing: hold the edge values fading to 0
                for j in range(1,9):
                    f=1-j/9
                    for e,sgn in ((seg[0],-1),(seg[-1],1)):
                        k=(e+sgn*j)%n
                        if not st[k] and wgt[k]<f: delta[k]=delta[e]*f; wgt[k]=f
            two_bone=ik.two_bone; two_bone(T,LR,hip,s,delta)
        G,P=T.fk(LR,hip); ct=contact(T,G,P)
    low=np.minimum(ct['Left'][1],ct['Right'][1])
    if low.min()<-0.4: hip[:,1]+=-0.4-low.min(); G,P=T.fk(LR,hip); ct=contact(T,G,P)
    rep={}
    C=contacts(ct)
    for (s,k),w in C.items():
        pts=ct[s][0][:,k]; d=np.diff(np.r_[pts,pts[:1]],axis=0); d[:,2]+=v; st=(w>.5)&np.r_[w[1:]>.5,w[:1]>.5]
        acc=np.cumsum(np.where(st[:,None],d[:,[0,2]],0),0)
        segs=[];cur=[]
        for i in range(n):
            if st[i]: cur.append(acc[i])
            elif cur: segs.append(np.ptp(np.array(cur),0).max()); cur=[]
        if cur: segs.append(np.ptp(np.array(cur),0).max())
        rep[f'{s}{["heel","ball","toe"][k]}']=(round(float(np.abs(d[st][:,[0,2]]).max()/dt) if st.any() else 0,1),round(max(segs) if segs else 0,2))
    # pass times: ankle z crossing
    zL=P['LeftFoot'][:,2]; zR=P['RightFoot'][:,2]; dd=zL-zR; pas=[]
    for i in range(n):
        j=(i+1)%n
        if dd[i]*dd[j]<0 or dd[i]==0: pas.append((i+abs(dd[i])/(abs(dd[i])+abs(dd[j])))*dt)
    info=dict(dur=dur,speed_m_per_clip_s=v*n/dur/100,passes=pas,skate_cm_s=rep,scale=scale,hip_y=float(hip[:,1].mean()),
              footmin=float(min(P['LeftFoot'][:,1].min(),P['RightFoot'][:,1].min(),P['LeftToeBase'][:,1].min(),P['RightToeBase'][:,1].min())),
              lowest=float(np.minimum(ct['Left'][1],ct['Right'][1]).min()))
    # close loop: append first sample
    LR={k:np.concatenate([R,R[:1]]) for k,R in LR.items()}; hip=np.concatenate([hip,hip[:1]])
    return dict(t=np.arange(n+1)*dt,LR=LR,hip=hip,info=info)
def idle_clip(T,style,start,secs,head_down=None):
    b=bvh.load(rt.M+f'{style}/{style}_ID.bvh'); G,P=bvh.fk(b); n=b['names']
    a=start; e=start+int(secs/b['ft'])
    la,ra=n.index('LeftAnkle'),n.index('RightAnkle')
    mid=(P[a:e,la]+P[a:e,ra]).mean(0)/2; dv=(P[a:e,la]-P[a:e,ra]).mean(0); th=np.arctan2(dv[0],dv[2])-np.pi/2  # facing perpendicular to the feet line
    # left foot at +x: the facing is +z rotated by th
    Rinv=rt.Ry(-th)
    Gl=np.einsum('ij,nkjl->nkil',Rinv,G[a:e+1]); hip=np.einsum('ij,nj->ni',Rinv,P[a:e+1,0]-[mid[0],0,mid[2]])
    LR,hipt,scale=tgt.retarget(T,b,Gl,hip,head_down=head_down)
    # loop: distribute the end-start mismatch linearly
    m=len(hipt)-1; w=np.arange(m+1)/m
    for k,R in LR.items():
        D=rt.logm(np.einsum('ij,jk->ik',R[0],R[-1].T)) # R0 R_end^-1
        LR[k]=np.einsum('nij,njk->nik',rt.expm(w[:,None]*D[None]),R)
    hipt+=w[:,None]*(hipt[0]-hipt[-1])[None]
    Gt,Pt=T.fk(LR,hipt); ct=contact(T,Gt,Pt); low=np.minimum(ct['Left'][1],ct['Right'][1]); hipt[:,1]-=np.median(low)
    Gt,Pt=T.fk(LR,hipt); ct=contact(T,Gt,Pt)
    slide={s:float(np.ptp(ct[s][0][:,1,[0,2]],axis=0).max()) for s in ('Left','Right')}
    # sub-sample to 30 fps
    idx=np.arange(0,m+1,2); 
    if idx[-1]!=m: idx=np.r_[idx,m]
    return dict(t=idx*b['ft'],LR={k:R[idx] for k,R in LR.items()},hip=hipt[idx],info=dict(dur=m*b['ft'],slide_cm=slide,th=float(np.degrees(th))))
def write(T,clips,dst):
    js,bin_=T.js,T.bin
    js['animations']=[a for a in js['animations'] if a['name'] not in clips]
    for name,c in clips.items():
        na={'name':name,'channels':[],'samplers':[]}
        ti=tgt.g.add_acc(js,bin_,c['t'][:,None],'SCALAR',minmax=True)
        for k,R in c['LR'].items():
            q=rt.m2q(R)
            for i in range(1,len(q)):
                if np.dot(q[i],q[i-1])<0: q[i]=-q[i]
            oi=tgt.g.add_acc(js,bin_,q,'VEC4'); na['samplers'].append({'input':ti,'output':oi,'interpolation':'LINEAR'})
            na['channels'].append({'sampler':len(na['samplers'])-1,'target':{'node':T.J[k],'path':'rotation'}})
        oi=tgt.g.add_acc(js,bin_,c['hip'],'VEC3'); na['samplers'].append({'input':ti,'output':oi,'interpolation':'LINEAR'})
        na['channels'].append({'sampler':len(na['samplers'])-1,'target':{'node':T.J['Hips'],'path':'translation'}})
        js['animations'].append(na)
    tgt.g.write_glb(dst,js,bin_)
