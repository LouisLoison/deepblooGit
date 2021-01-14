CDK_NAME="$1"
LAMBDA_NAME="$2"
EVENT_PATH="../$3"

function display_help() {
  echo "./start-sam.sh CDK_NAME LAMBDA_NAME EVENT_PATH"
}

if [[ -z "$CDK_NAME" ]]; then
  echo "[ERROR]: You have to give the name of the CDK."
  display_help
  exit 1
fi

if [[ -z "$LAMBDA_NAME" ]]; then
  echo "[ERROR]: You have to give the name of the lambda."
  display_help
  exit 1
fi

if [[ -z "$LAMBDA_NAME" ]]; then
  echo "[ERROR]: You have to give an event json file on your machine."
  display_help
  exit 1
fi

echo "CDK_NAME: $CDK_NAME"
echo "LAMBDA_NAME: $LAMBDA_NAME"
echo "EVENT_PATH: $EVENT_PATH"
cd ./cdk/
echo "Creating template.yaml..."
cdk synth --no-staging "$CDK_NAME" > template.yaml
sam local invoke "$LAMBDA_NAME" --event "$EVENT_PATH"