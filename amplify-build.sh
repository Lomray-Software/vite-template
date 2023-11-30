#!/bin/bash

rm -rf ./.amplify-hosting

mkdir -p ./.amplify-hosting/compute/default

cp -r ./build ./.amplify-hosting/compute/default/build
cp -r ./node_modules ./.amplify-hosting/compute/default/node_modules

cp -r ./build/client ./.amplify-hosting/static

cp deploy-manifest.json ./.amplify-hosting/deploy-manifest.json
