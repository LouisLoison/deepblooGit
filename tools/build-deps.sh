#!/bin/bash
set -e

# (cd lambda/libjs && npm pack)

sudo docker run --rm -v "$PWD":/var/task lambci/lambda:build-python3.8 bash tools/build-deps-python.sh

sudo docker run --rm -v "$PWD":/var/task lambci/lambda:build-nodejs12.x bash tools/build-deps-node.sh


mkdir -p lambda/layer/npm/nodejs/node_modules/deepblooback/
cp -a ../deepbloo-back/controllers lambda/layer/npm/nodejs/node_modules/deepblooback/
cp -a ../deepbloo-back/global lambda/function/appsearchIndex/
cp -a ../deepbloo-back/config lambda/function/appsearchIndex/

mkdir -p lambda/layer/npm/nodejs/node_modules/deepbloo/
cp -a lambda/libjs/* lambda/layer/npm/nodejs/node_modules/deepbloo/

mkdir -p lambda/function/stepTenderStore/node_modules/deepbloo
cp -a lambda/libjs/* lambda/function/stepTenderStore/node_modules/deepbloo/


sudo rm $(find lambda/layer/pipenv/bin/ -type l)

rm -fr lambda/layer/combined/{python,nodejs,bin}
mkdir -p lambda/layer/combined/{python,nodejs,bin}
cp -au lambda/layer/*/python/* lambda/layer/combined/python
cp -au lambda/layer/*/nodejs/* lambda/layer/combined/nodejs
cp -au lambda/layer/*/bin/* lambda/layer/combined/bin

