#!/bin/bash
set -xe
mkdir -p lambda/layer/gs
mkdir -p lambda/build/gs

cd lambda/build/gs

git clone https://github.com/sina-masnadi/lambda-ghostscript.git
cp -a lambda-ghostscript/bin ../../layer/gs


