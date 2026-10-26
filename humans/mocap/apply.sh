#!/bin/bash
# embed the GLBs of a build dir into the site copy and rebuild app.js
D=$1; W=/tmp/claude-0/-home-user-anchors-demo-videos/a59811dd-c740-5dfc-b802-1ad306199947/scratchpad/wt/walk
R=/tmp/claude-0/-home-user/a59811dd-c740-5dfc-b802-1ad306199947/scratchpad/rt
for n in lifter coach member; do python3 $R/embed.py $D/$n.glb $W/$n.js $n; done
cd $W && ./build.sh >/dev/null && node --check app.js && echo built
