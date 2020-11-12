

sudo docker run --rm -v "$PWD":/var/task:ro,delegated -v "$PWD/lambda/layer/combined/":/opt:ro,delegated lambci/lambda:python3.8 lambda/function/htmltoboundingbox/lambda_function.lambda_handler

