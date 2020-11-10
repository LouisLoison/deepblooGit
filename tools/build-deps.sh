#!/bin/bash
set -e

sudo docker run --rm -v "$PWD":/var/task lambci/lambda:build-python3.8 bash tools/build-deps-python.sh

sudo docker run --rm -v "$PWD":/var/task lambci/lambda:build-nodejs12.x bash tools/build-deps-node.sh


