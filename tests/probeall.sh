#!/bin/bash
cd "$(dirname "$0")"; P=${PORT:-8767}
(for g in chest back legs; do G=$g PORT=$P timeout 2400 node t7.cjs > out/p-$g.txt 2>&1; done) &
(for g in shoulders biceps; do G=$g PORT=$P timeout 2400 node t7.cjs > out/p-$g.txt 2>&1; done) &
(for g in triceps core; do G=$g PORT=$P timeout 2400 node t7.cjs > out/p-$g.txt 2>&1; done; PORT=$P timeout 600 node tspots.cjs > out/p-spots.txt 2>&1) &
wait
