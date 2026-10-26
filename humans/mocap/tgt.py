import numpy as np, rt, glbskel as g
MAP={'Hips':'Hips','Spine':'Chest','Spine1':'Chest2','Spine2':'Chest4','Neck':'Neck','Head':'Head',
 'LeftShoulder':'LeftCollar','LeftArm':'LeftShoulder','LeftForeArm':'LeftElbow','LeftHand':'LeftWrist',
 'RightShoulder':'RightCollar','RightArm':'RightShoulder','RightForeArm':'RightElbow','RightHand':'RightWrist',
 'LeftUpLeg':'LeftHip','LeftLeg':'LeftKnee','LeftFoot':'LeftAnkle','LeftToeBase':'LeftToe',
 'RightUpLeg':'RightHip','RightLeg':'RightKnee','RightFoot':'RightAnkle','RightToeBase':'RightToe'}
TCHILD={'Spine':'Spine1','Spine1':'Spine2','Spine2':'Neck','Neck':'Head','LeftShoulder':'LeftArm','LeftArm':'LeftForeArm','LeftForeArm':'LeftHand','LeftHand':'LeftHandMiddle1',
 'LeftUpLeg':'LeftLeg','LeftLeg':'LeftFoot'}  # feet: both rests are a flat foot, no correction
for k,v in list(TCHILD.items()):
    if k.startswith('Left'): TCHILD[k.replace('Left','Right')]=v.replace('Left','Right')
CORRECT=False  # both rest poses are the same neutral T-pose: map rotations 1:1 (aligning bone directions bent the spine forward)
class Target:
    def __init__(s,path):
        s.js,s.bin=g.read_glb(path); s.J,s.pos,s.par=g.skel(s.js)
        s.order=[]; seen=set()
        def add(k):
            if k in seen: return
            if s.par[k]: add(s.par[k])
            seen.add(k); s.order.append(k)
        for k in s.J: add(k)
        s.off={k:(s.pos[k]-s.pos[s.par[k]] if s.par[k] else s.pos[k]) for k in s.J}
        s.leg=np.linalg.norm(s.off['LeftLeg'])+np.linalg.norm(s.off['LeftFoot'])
    def fk(s,LR,hip):  # LR: dict name->(n,3,3) local; returns world rot & pos dicts (cm)
        G={};P={}
        n=len(hip)
        for k in s.order:
            R=LR.get(k,np.tile(np.eye(3),(n,1,1)))
            p=s.par[k]
            if p is None: G[k]=R; P[k]=hip.copy()
            else: G[k]=G[p]@R; P[k]=P[p]+np.einsum('nij,j->ni',G[p],s.off[k])
        return G,P
def src_dirs(b):
    n=b['names']; d={}
    for j,nm in enumerate(n):
        ch=[i for i,p in enumerate(b['parent']) if p==j]
        if nm=='Chest4': ch=[n.index('Neck')]
        if ch: d[nm]=b['off'][ch[0]]
        elif j in b['endoff']: d[nm]=b['endoff'][j]
    return d
# relaxed fingers: local rotations (curl about the knuckle-line axis, more toward the pinky)
def finger_pose(side):
    s=1 if side=='Left' else -1; R={}
    ax=np.array([0,.46,.89])
    base={'Index':(.36,.5,.28),'Middle':(.44,.56,.3),'Ring':(.52,.6,.32),'Pinky':(.6,.62,.32)}
    spread={'Index':.07,'Middle':0,'Ring':-.05,'Pinky':-.11}  # fingers gathered, not fanned
    for f,(a,b2,c) in base.items():
        for i,ang in enumerate((a,b2,c)):
            R[f'{side}Hand{f}{i+1}']=(rt.aa([0,1,0],s*spread[f]) if i==0 else np.eye(3))@rt.aa(ax,-s*ang)
    # thumb: slightly in toward the index, a bit bent
    R[f'{side}HandThumb1']=rt.aa([0,1,0],s*.15)@rt.aa([1,0,0],-.1)
    R[f'{side}HandThumb2']=rt.aa(ax,-s*.25)
    R[f'{side}HandThumb3']=rt.aa(ax,-s*.3)
    return R
def retarget(T,b,Gsrc,hip_src,hand_roll=0.0,head_down=None):
    """Gsrc: (n,J,3,3) world rotations of source in local frame; hip_src (n,3) cm. -> local rot dict, hip (n,3) cm"""
    n=len(Gsrc); names=b['names']; sd=src_dirs(b)
    Gt={}
    for t,sn in MAP.items():
        Rc=np.eye(3)
        if t in TCHILD and CORRECT:
            Rc=rt.rot_between(T.off[TCHILD[t]],sd[sn])
        if t.endswith('Hand') and hand_roll:
            sgn=1 if t.startswith('Left') else -1
            Rc=Rc@rt.aa([sgn,0,0],hand_roll)
        Gt[t]=Gsrc[:,names.index(sn)]@Rc
    if head_down is not None:  # posture: set the mean forward pitch (deg) of each spine/neck/head joint, keeping the motion around it
        post=head_down if isinstance(head_down,dict) else {'Head':head_down}
        post=dict(post); out=post.pop('ArmOut',0)
        for side,sg in (('Left',1),('Right',-1)):  # arms hang a little away from the body (rotation about the forward axis at the shoulder)
            R=rt.aa([0,0,1],sg*np.radians(out))
            for k in ('Arm','ForeArm','Hand'): Gt[side+k]=np.einsum('ij,njk->nik',R,Gt[side+k])
        for k,want in post.items():
            f=np.einsum('nij,j->ni',Gt[k],[0,0,1]); cur=np.degrees(np.arcsin(-f[:,1])).mean()
            Gt[k]=np.einsum('ij,njk->nik',rt.aa([1,0,0],np.radians(want-cur)),Gt[k])
    LR={}
    for t in MAP:
        p=T.par[t]
        LR[t]=Gt[t] if p is None else np.einsum('nji,njk->nik',Gt[p],Gt[t])
    # fingers: the relaxed pose with a slight sway over the clip (every key differs, so the three.js mixer re-applies the track
    # each frame: a constant track is written once and a pose fade or IK hand would otherwise leave the fingers where it left them)
    ph=np.linspace(0,2*np.pi,n)
    for side in ('Left','Right'):
        s=1 if side=='Left' else -1; ax=np.array([0,.46,.89])
        for k,R in finger_pose(side).items():
            w=.035*np.sin(ph+(0 if 'Thumb' in k else 1.3)+len(k)*.7)
            LR[k]=np.einsum('nij,jk->nik',np.array([rt.aa(ax,-s*x) for x in w]),R)
    scale=T.leg/ (43.743899+43.214199)
    hip=hip_src*scale
    return LR,hip,scale
