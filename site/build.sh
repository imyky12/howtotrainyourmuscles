#!/bin/sh
# concatenate the sources into one ES module, then check it parses as a module (catches names declared twice),
# then build the pages search engines read (exercise guides, muscle groups, sitemap) from the same sources
cd "$(dirname "$0")"
LC_ALL=C; export LC_ALL # the same file order on every machine (19-arms.js before 19b-core.js)
cat src/*.js > app.js
cp app.js .app-check.mjs && node --check .app-check.mjs; r=$?; rm -f .app-check.mjs; [ $r -eq 0 ] || exit $r
node ../seo/build.mjs
