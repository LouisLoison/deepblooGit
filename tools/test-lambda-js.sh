

sudo docker run --rm -v "$PWD":/var/task:ro,delegated -v "$PWD/lambda/layer/combined/":/opt:ro,delegated lambci/lambda:nodejs12.x lambda/function/$1/index.handler $2

