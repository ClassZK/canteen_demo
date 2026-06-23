#!/bin/sh

ls -l node_modules/.bin/vite
echo $PATH
npm -v
node -v

rm -rf node_modules package-lock.json
npm cache clean --force

npm install
npm run build
