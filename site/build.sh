#!/bin/sh
# concatenate the sources into one ES module, then check it parses as a module (catches names declared twice)
cd "$(dirname "$0")"
cat src/*.js > app.js
cp app.js .app-check.mjs && node --check .app-check.mjs; r=$?; rm -f .app-check.mjs; exit $r
