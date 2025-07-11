#!/bin/bash
echo "npm run build \n"
npm run build
echo "removing backend static \n"
cd ~/Docker/github-automation-with-database/github-automation-backend/src/static
rm -rf css
rm -rf js
cd -
echo "copying build to backend \n"
cp -r build/* ~/Docker/github-automation-with-database/github-automation-backend/src/static
cd ~/Docker/github-automation-with-database/github-automation-backend/src/static/static
mv css ..
mv js ..
cd ..
echo "removing static \n"
rmdir static
cd ..
echo "running flask \n"
flask --app main run
