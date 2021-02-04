#!/bin/bash
STACK_NAME="$1"
LAMBDA_NAME="$2"
EVENT_PATH="../$3"

function display_help() {
  echo "./start-sam.sh STACK_NAME LAMBDA_NAME EVENT_PATH"
}

if [[ -z "$STACK_NAME" ]]; then
  echo "[ERROR]: You have to give the name of the STACK."
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

echo "STACK_NAME: $STACK_NAME"
echo "LAMBDA_NAME: $LAMBDA_NAME"
echo "EVENT_PATH: $EVENT_PATH"
cd ./cdk/
echo "Creating template.yaml..."
cdk synth --no-staging "$STACK_NAME" > template.yaml
sam local invoke "$LAMBDA_NAME" --event "$EVENT_PATH"
