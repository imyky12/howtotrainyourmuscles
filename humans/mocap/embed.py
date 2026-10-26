import sys,base64
src,dst,name=sys.argv[1:4]
open(dst,'w').write('window.GLB=window.GLB||{};window.GLB.%s="%s";'%(name,base64.b64encode(open(src,'rb').read()).decode()))
