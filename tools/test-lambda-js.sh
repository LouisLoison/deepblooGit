
( cd lambda/function/$1/ && ln -s ../../combined/nodejs/node_modules/ .)

sudo docker run --rm -v "$PWD":/var/task:ro,delegated -v "$PWD/lambda/layer/combined/":/opt:ro,delegated lambci/lambda:nodejs12.x lambda/function/$1/index.js.handler $2

