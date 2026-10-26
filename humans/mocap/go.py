import sys,json,numpy as np,build,cyc,tgt,subprocess
cfg=json.loads(sys.argv[1]); out=sys.argv[2]
parts=[(cyc.cycles(s,vmin=cfg.get('vmin',{}).get(s,0)),w) for s,w in cfg['walk'].items()]
V0=None; res={}
for ch in cfg.get('chars',['lifter','coach','member']):
    T=tgt.Target(build.H+'prev_xbotclips/'+ch+'.glb')  # the GLBs with the Xbot clips (post.py output); walk and idle are replaced
    W=build.walk_clip(T,parts,head_down=cfg.get('head')); inf=W['info']
    # every character covers the same distance per clip second (the code uses one WALK_STRIDE): a shorter person steps faster
    V0=V0 or cfg.get('stride',inf['speed_m_per_clip_s'])
    k=inf['speed_m_per_clip_s']/V0; W['t']=W['t']*k
    inf['dur_scaled']=inf['dur']*k; inf['pass_scaled']=[p*k for p in inf['passes']]
    print(ch,'walk',json.dumps(inf,default=float))
    clips={'walk':W}
    if 'idle' in cfg:
        I=build.idle_clip(T,*cfg['idle'],head_down=cfg.get('ihead')); print(ch,'idle',I['info']); clips['idle']=I
    build.write(T,clips,f'{out}/{ch}.glb'); res[ch]=inf
json.dump(dict(cfg=cfg,stride=V0,info=res),open(f'{out}/info.json','w'),default=float,indent=1)
