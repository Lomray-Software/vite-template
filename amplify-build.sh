#!/bin/bash

rm -rf ./.amplify-hosting

mkdir -p ./.amplify-hosting/compute/default

cp -r ./build ./.amplify-hosting/compute/default/build
cp -r ./node_modules ./.amplify-hosting/compute/default/node_modules
cp -r ./package.json ./.amplify-hosting/compute/default/package.json

cp -r ./build/client ./.amplify-hosting/static
rm -r ./.amplify-hosting/compute/default/build/client/assets

cp deploy-manifest.json ./.amplify-hosting/deploy-manifest.json
