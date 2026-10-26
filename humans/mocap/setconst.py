import json,re,sys
inf=json.load(open(sys.argv[1]+'/info.json')); L=inf['info']['lifter']
p='/tmp/claude-0/-home-user-anchors-demo-videos/a59811dd-c740-5dfc-b802-1ad306199947/scratchpad/wt/walk/src/05-motion.js'; s=open(p).read()
s=re.sub(r'const WALK_STRIDE=[0-9.]+;','const WALK_STRIDE=%.3f;'%inf['stride'],s)
s=re.sub(r'const WALK_PASS=\[[0-9.,]+\];','const WALK_PASS=[%s];'%','.join('%.3f'%x for x in L['pass_scaled']),s)
if len(sys.argv)>2: s=re.sub(r'const WALK_SPEED=[0-9.]+;','const WALK_SPEED=%s;'%sys.argv[2],s)
open(p,'w').write(s); print(re.findall(r'const WALK_[A-Z]+=[^;]+;',s))
