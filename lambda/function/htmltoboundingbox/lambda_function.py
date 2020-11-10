def lambda_handler(event, context):

    print("event: {}".format(event))

    request = {}

    message = event['Records'][0]

    return {
        'statusCode': 200,
        'body': 'All right'
    }
