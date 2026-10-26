#!/bin/sh
# concatenate the sources into one ES module
cd "$(dirname "$0")"
cat src/*.js > app.js
