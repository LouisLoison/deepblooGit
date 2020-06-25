import os
import json
from helper import FileHelper, S3Helper
from elasticsearch import Elasticsearch

def addToESIndex(document, objectName):
    host=os.environ['ELASTIC_HOST']
    port=os.environ['ELASTIC_PORT']
    user=os.environ['ELASTIC_USER']
    secret=os.environ['ELASTIC_SECRET']

    es = Elasticsearch(
        hosts = [{'host': host, 'port':port, 'http_auth': (user, secret) }],
        use_ssl = True,
        verify_certs = True,
        )

    es.index(index="textractsearch", doc_type="document", id=objectName, body=document)

def getResults(bucketName, outputPath):
    content = {
        "responseByPage":  json.loads(S3Helper.readFromS3(bucketName,"{}pages.json".format(outputPath))),
        "fullText": S3Helper.readFromS3(bucketName,"{}text.txt".format(outputPath)),
        "fullTextReadingOrder": S3Helper.readFromS3(bucketName,"{}text-inreadingorder.txt".format(outputPath))
    }
    return content

def processRequest(request):
    documentId = request["documentId"]
    objectName = request['objectName']
    bucketName = request['bucketName']
     
    outputPath = "{}-analysis/{}/".format(objectName, documentId)

    content = getResults(bucketName, outputPath)
    tenderId = objectName.split('#')[1].split('/')[0]
    content["tenderId"] = "{}".format(tenderId),
    content["name"] = "{}".format(objectName),
    content["objectName"] = "{}".format(objectName),
    content["bucketName"] = "{}".format(bucketName),
    addToESIndex(content, objectName)

def lambda_handler(event, context):

    print("event: {}".format(event))
    message = json.loads(event['Records'][0]['body'])
    print("Message: {}".format(message))

    request = {}
    request["documentId"] = message['documentId']
    request["bucketName"] = message['bucketName']
    request["objectName"] = message['objectName']
    request["outputTable"] = os.environ['OUTPUT_TABLE']
    request["documentsTable"] = os.environ['DOCUMENTS_TABLE']

    return processRequest(request)
