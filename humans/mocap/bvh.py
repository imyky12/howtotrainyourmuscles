import numpy as np, re
def rotm(axis, deg):
    a=np.radians(deg); c,s=np.cos(a),np.sin(a); n=len(a)
    R=np.zeros((n,3,3)); 
    if axis=='X': R[:,0,0]=1;R[:,1,1]=c;R[:,1,2]=-s;R[:,2,1]=s;R[:,2,2]=c
    if axis=='Y': R[:,1,1]=1;R[:,0,0]=c;R[:,0,2]=s;R[:,2,0]=-s;R[:,2,2]=c
    if axis=='Z': R[:,2,2]=1;R[:,0,0]=c;R[:,0,1]=-s;R[:,1,0]=s;R[:,1,1]=c
    return R
def load(path):
    txt=open(path).read(); head,mot=txt.split('MOTION')
    names=[];parent=[];off=[];chans=[];stack=[];endoff={}
    toks=head.split('\n'); last=None
    for line in toks:
        t=line.split()
        if not t: continue
        if t[0] in('ROOT','JOINT'):
            names.append(t[1]);parent.append(stack[-1] if stack else -1);last=len(names)-1;cur='j'
        elif t[0]=='End': cur='e'
        elif t[0]=='{': stack.append(last) if cur=='j' else stack.append(None)
        elif t[0]=='}': stack.pop()
        elif t[0]=='OFFSET':
            v=np.array(list(map(float,t[1:4])))
            if cur=='j': off.append(v)
            else: endoff[stack[-2] if stack[-1] is None else stack[-1]]=v
            cur= 'x' if cur=='e' else cur
        elif t[0]=='CHANNELS': chans.append(t[2:])
    # fix: End Site parent detection
    lines=mot.strip().split('\n'); n=int(lines[0].split()[1]); ft=float(lines[1].split()[2])
    data=np.array([list(map(float,l.split())) for l in lines[2:2+n]])
    J=len(names); R=np.zeros((n,J,3,3)); ci=0; root=None
    for j in range(J):
        r=np.tile(np.eye(3),(n,1,1))
        for c in chans[j]:
            if c.endswith('position'):
                if root is None: root=np.zeros((n,3))
                root[:,'XYZ'.index(c[0])]=data[:,ci]
            else: r=r@rotm(c[0],data[:,ci])
            ci+=1
        R[:,j]=r
    return dict(names=names,parent=parent,off=np.array(off),R=R,root=root,ft=ft,endoff=endoff)
def fk(b, R=None, root=None):
    R=b['R'] if R is None else R; root=b['root'] if root is None else root
    n,J=R.shape[:2]; G=np.zeros_like(R); P=np.zeros((n,J,3))
    for j in range(J):
        p=b['parent'][j]
        if p<0: G[:,j]=R[:,j]; P[:,j]=root+b['off'][j]
        else: G[:,j]=G[:,p]@R[:,j]; P[:,j]=P[:,p]+np.einsum('nij,j->ni',G[:,p],b['off'][j])
    return G,P
