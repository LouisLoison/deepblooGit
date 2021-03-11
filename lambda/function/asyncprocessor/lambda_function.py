import json
import boto3
import os
from helper import AwsHelper
import time

def startJob(bucketName, objectName, documentId, snsTopic, snsRole, detectForms, detectTables):

    print("Starting job with documentId: {}, bucketName: {}, objectName: {}".format(documentId, bucketName, objectName))

    response = None
    client = AwsHelper().getClient('textract')
    if(not detectForms and not detectTables):
        response = client.start_document_text_detection(
            ClientRequestToken  = documentId,
            DocumentLocation={
                'S3Object': {
                    'Bucket': bucketName,
                    'Name': objectName
                }
            },
            NotificationChannel= {
              "RoleArn": snsRole,
              "SNSTopicArn": snsTopic
           },
           JobTag = documentId)
    else:
        features  = []
        if(detectTables):
            features.append("TABLES")
        if(detectForms):
            features.append("FORMS")

        response = client.start_document_analysis(
            ClientRequestToken  = documentId,
            DocumentLocation={
                'S3Object': {
                    'Bucket': bucketName,
                    'Name': objectName
                }
            },
            FeatureTypes=features,
            NotificationChannel= {
                  "RoleArn": snsRole,
                  "SNSTopicArn": snsTopic
               },
            JobTag = documentId)

    return response["JobId"]


def processItem(message, snsTopic, snsRole):

    print('message:')
    print(message)

    messageBody = json.loads(message['body'])

    bucketName = messageBody['bucketName']
    objectName = messageBody['objectName']
    documentId = messageBody['documentId']
    features = messageBody['features']

    print('Bucket Name: ' + bucketName)
    print('Object Name: ' + objectName)
    print('Task ID: ' + documentId)
    print("API: {}".format(features))

    print('starting Textract job...')

    detectForms = 'Forms' in features
    detectTables = 'Tables' in features

    jobId = startJob(bucketName, objectName, documentId, snsTopic, snsRole, detectForms, detectTables)

    if(jobId):
        print("Started Job with Id: {}".format(jobId))

    return jobId

def lambda_handler(event, context):

    print("event: {}".format(event))

    request = {}

    request["qUrl"] = os.environ['ASYNC_QUEUE_URL']
    request["snsTopic"] = os.environ['SNS_TOPIC_ARN']
    request["snsRole"] = os.environ['SNS_ROLE_ARN']
    request["messages"] = event['Records']

    jobId = processItem(request["messages"][0], request["snsTopic"], request["snsRole"])
    time.sleep (3) # crude rate-limit achieved here
    return {
        'statusCode': 200,
        'body': 'Started job {}'.format(jobId)
    }


