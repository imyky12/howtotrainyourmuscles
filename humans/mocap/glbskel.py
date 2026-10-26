import sys,json,struct,numpy as np
import importlib.util
spec=importlib.util.spec_from_file_location('post_','/tmp/claude-0/-home-user-anchors-demo-videos/a59811dd-c740-5dfc-b802-1ad306199947/scratchpad/humans/work/scripts/post.py')
src=open(spec.origin).read().replace('main(*sys.argv[1:4])','')
post={}; exec(compile(src,'post','exec'),post)
read_glb,write_glb,acc_data,add_acc=post['read_glb'],post['write_glb'],post['acc_data'],post['add_acc']
def skel(js):
    nodes=js['nodes']; par={}
    for i,n in enumerate(nodes):
        for c in n.get('children',[]): par[c]=i
    J={}
    for i,n in enumerate(nodes):
        nm=n.get('name','')
        if nm.startswith('mixamorig'): J[nm[9:]]=i
    pos={}  # armature-space cm
    def wp(i):
        nm=nodes[i]['name'][9:]
        if nm in pos: return pos[nm]
        t=np.array(nodes[i].get('translation',[0,0,0]))
        p=par.get(i); 
        pos[nm]= t if (p is None or not nodes[p].get('name','').startswith('mixamorig')) else wp(p)+t
        return pos[nm]
    for k,i in J.items(): wp(i)
    parent={k:(nodes[par[i]]['name'][9:] if i in par and nodes[par[i]]['name'].startswith('mixamorig') else None) for k,i in J.items()}
    return J,pos,parent
