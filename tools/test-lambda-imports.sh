
FUNCTION="pdftobboxtext"
EVENT=$(cat lambda/function/$FUNCTION/test_event.json|tr '"' '\"')

sudo docker run --rm -v "$PWD":/var/task:ro,delegated -v "$PWD/lambda/layer/combined/":/opt:ro,delegated lambci/lambda:python3.8 lambda/function/$FUNCTION/lambda_function.lambda_handler "$EVENT"

