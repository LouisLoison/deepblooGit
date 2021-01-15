import json


def lambda_handler(event, context):
    print("==> Event: {0}".format(json.dumps(event)))
    aws_env = {
    }
    print("==> Aws env: {0}".format(json.dumps(aws_env)))
    status = {
        'statusCode': 200,
        'body': 'All right'
    }
    return { **event, 'status': status }
