import os
from helper import FileHelper, S3Helper
from elasticsearch import Elasticsearch, RequestsHttpConnection

def addToESIndex(objectName, s3URI, bucketName, s3FileName, objectName):
    host=os.environ['ElasticSearchHost']
    text = S3Helper.readFromS3(bucketName, s3FileName)
    es = Elasticsearch(
        hosts = [{'host': host, 'port':443}],
        use_ssl = True,
        verify_certs = True,
        connection_class = RequestsHttpConnection
        )
    document = {
        "name": "{}".format(objectName),
        "s3URI": "{}".format(s3URI),
        "tenderId": "{}".format(tenderId),
        "jobId": "{}".format(jobId),
        "content": text
        }
    es.index(index="textractsearch", doc_type="document", id=objectName, body=document)


