import json
import os
import boto3
import time
from helper import AwsHelper
from og import OutputGenerator
import datastore

def postMessage(client, qUrl, jsonMessage):

    message = json.dumps(jsonMessage)

    client.send_message(
        QueueUrl=qUrl,
        MessageBody=message
    )

    print("Submitted message to queue: {}".format(message))


def getJobResults(api, jobId):

    pages = []

    time.sleep(1)

    client = AwsHelper().getClient('textract')
    if(api == "StartDocumentTextDetection"):
        response = client.get_document_text_detection(JobId=jobId)
    else:
        response = client.get_document_analysis(JobId=jobId)
    pages.append(response)
    print("Resultset page recieved: {}".format(len(pages)))
    nextToken = None
    if('NextToken' in response):
        nextToken = response['NextToken']
        print("Next token: {}".format(nextToken))

    while(nextToken):
        time.sleep(1)

        if(api == "StartDocumentTextDetection"):
            response = client.get_document_text_detection(JobId=jobId, NextToken=nextToken)
        else:
            response = client.get_document_analysis(JobId=jobId, NextToken=nextToken)

        pages.append(response)
        print("Resultset page recieved: {}".format(len(pages)))
        nextToken = None
        if('NextToken' in response):
            nextToken = response['NextToken']
            print("Next token: {}".format(nextToken))

    return pages

def processRequest(request):

    output = ""

    print(request)

    jobId = request['jobId']
    jobTag = request['jobTag']
    jobStatus = request['jobStatus']
    jobAPI = request['jobAPI']
    bucketName = request['bucketName']
    objectName = request['objectName']
    outputTable = request["outputTable"]
    outputBucket = request["outputBucket"]
    documentsTable = request["documentsTable"]
    qUrl = request["elasticQueueUrl"]

    pages = getJobResults(jobAPI, jobId)

    print("Result pages recieved: {}".format(len(pages)))

    dynamodb = AwsHelper().getResource("dynamodb")
    ddb = dynamodb.Table(outputTable)

    detectForms = False
    detectTables = False
    if(jobAPI == "StartDocumentAnalysis"):
        detectForms = True
        detectTables = True

    opg = OutputGenerator(jobId, jobTag, pages, outputBucket, objectName, detectForms, detectTables, ddb)
    opg.run()

    print("DocumentId: {}".format(jobTag))

    ds = datastore.DocumentStore(documentsTable, outputTable)
    ds.markDocumentComplete(jobTag, jobId)

    jsonMessage = { 'documentId' : jobTag,
        'jobId': jobId,
        'bucketName': outputBucket,
        'objectName' : objectName }

    client = AwsHelper().getClient('sqs')
    postMessage(client, qUrl, jsonMessage)


    output = "Processed -> Document: {}, Object: {}/{} processed.".format(jobTag, bucketName, objectName)

    print(output)

    return {
        'statusCode': 200,
        'body': output
    }

def lambda_handler(event, context):

    print("event: {}".format(event))

    body = json.loads(event['Records'][0]['body'])
    message = json.loads(body['Message'])

    print("Message: {}".format(message))

    request = {}

    request["jobId"] = message['JobId']
    request["jobTag"] = message['JobTag']
    request["jobStatus"] = message['Status']
    request["jobAPI"] = message['API']
    request["bucketName"] = message['DocumentLocation']['S3Bucket']
    request["objectName"] = message['DocumentLocation']['S3ObjectName']
    
    request["outputTable"] = os.environ['OUTPUT_TABLE']
    request["outputBucket"] = os.environ['OUTPUT_BUCKET']
    request["documentsTable"] = os.environ['DOCUMENTS_TABLE']
    request["elasticQueueUrl"] = os.environ['ELASTIC_QUEUE_URL']

    return processRequest(request)

def lambda_handler_local(event, context):
    print("event: {}".format(event))
    return processRequest(event)
