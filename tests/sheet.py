import sys
from PIL import Image
# usage: sheet.py out.jpg cols w img1 img2 ...
out,cols,w=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]);files=sys.argv[4:]
ims=[Image.open(f).convert('RGB') for f in files]
ims=[i.resize((w,int(i.height*w/i.width))) for i in ims]
h=max(i.height for i in ims);rows=(len(ims)+cols-1)//cols
o=Image.new('RGB',(cols*w,rows*h),'white')
for k,i in enumerate(ims):o.paste(i,((k%cols)*w,(k//cols)*h))
o.save(out,quality=85)
