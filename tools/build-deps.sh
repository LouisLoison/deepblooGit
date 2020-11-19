#!/bin/bash
set -e

(cd lambda/libjs && npm pack)

sudo docker run --rm -v "$PWD":/var/task lambci/lambda:build-python3.8 bash tools/build-deps-python.sh

sudo docker run --rm -v "$PWD":/var/task lambci/lambda:build-nodejs12.x bash tools/build-deps-node.sh

mkdir -p lambda/layer/npm/nodejs/node_modules/deepblooback/
cp -a ../deepbloo-back/{controllers,config,global} lambda/layer/npm/nodejs/node_modules/deepblooback/

mkdir -p lambda/layer/npm/nodejs/node_modules/deepbloo/
cp -a lambda/libjs/* lambda/layer/npm/nodejs/node_modules/deepbloo/

rm -fr lambda/layer/combined/{python,nodejs,bin}
mkdir -p lambda/layer/combined/
cp -au lambda/layer/*/python lambda/layer/combined/
cp -au lambda/layer/*/nodejs lambda/layer/combined/
cp -au lambda/layer/*/bin lambda/layer/combined/

