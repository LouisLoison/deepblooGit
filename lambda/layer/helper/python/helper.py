import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
import os
import csv
import io
from boto3.dynamodb.conditions import Key
import shutil

class DynamoDBHelper:

    @staticmethod
    def getItems(tableName, key, value):
        items = None

        ddb = AwsHelper().getResource("dynamodb")
        table = ddb.Table(tableName)

        if key is not None and value is not None:
            filter = Key(key).eq(value)
            queryResult = table.query(KeyConditionExpression=filter)
            if(queryResult and "Items" in queryResult):
                items = queryResult["Items"]

        return items

    @staticmethod
    def insertItem(tableName, itemData):

        ddb = AwsHelper().getResource("dynamodb")
        table = ddb.Table(tableName)

        ddbResponse = table.put_item(Item=itemData)

        return ddbResponse

    @staticmethod
    def deleteItems(tableName, key, value, sk):
        items = DynamoDBHelper.getItems(tableName, key, value)
        if(items):
            ddb = AwsHelper().getResource("dynamodb")
            table = ddb.Table(tableName)
            for item in items:
                print("Deleting...")
                print("{} : {}".format(key, item[key]))
                print("{} : {}".format(sk, item[sk]))
                table.delete_item(
                    Key={
                        key: value,
                        sk : item[sk]
                    })
                print("Deleted...")

class AwsHelper:
    def getClient(self, name, awsRegion=None):
        config = Config(
            retries = dict(
                max_attempts = 30
            )
        )
        if(awsRegion):
            return boto3.client(name, region_name=awsRegion, config=config)
        else:
            return boto3.client(name, config=config)

    def getResource(self, name, awsRegion=None):
        config = Config(
            retries = dict(
                max_attempts = 30
            )
        )

        if(awsRegion):
            return boto3.resource(name, region_name=awsRegion, config=config)
        else:
            return boto3.resource(name, config=config)

    @staticmethod
    def refreshTmpFolder(folder_name):
        shutil.rmtree(folder_name)


class S3Helper:
    @staticmethod
    def getS3BucketRegion(bucketName):
        client = boto3.client('s3')
        response = client.get_bucket_location(Bucket=bucketName)
        awsRegion = response['LocationConstraint']
        return awsRegion

    @staticmethod
    def getFileNames(bucketName, prefix, maxPages, allowedFileTypes, awsRegion=None):

        files = []

        currentPage = 1
        hasMoreContent = True
        continuationToken = None

        s3client = AwsHelper().getClient('s3', awsRegion)

        while(hasMoreContent and currentPage <= maxPages):
            if(continuationToken):
                listObjectsResponse = s3client.list_objects_v2(
                    Bucket=bucketName,
                    Prefix=prefix,
                    ContinuationToken=continuationToken)
            else:
                listObjectsResponse = s3client.list_objects_v2(
                    Bucket=bucketName,
                    Prefix=prefix)

            if(listObjectsResponse['IsTruncated']):
                continuationToken = listObjectsResponse['NextContinuationToken']
            else:
                hasMoreContent = False

            for doc in listObjectsResponse['Contents']:
                docName = doc['Key']
                docExt = FileHelper.getFileExtenstion(docName)
                docExtLower = docExt.lower()
                if(docExtLower in allowedFileTypes):
                    files.append(docName)

        return files

    @staticmethod
    def writeToS3(content, bucketName, s3FileName, awsRegion=None):
        print ("Writing s3://%s/%s in %s" % (bucketName, s3FileName, awsRegion))
        s3 = AwsHelper().getResource('s3', awsRegion)
        object = s3.Object(bucketName, s3FileName)
        object.put(Body=content)

    @staticmethod
    def readBytesFromS3(bucketName, s3FileName, awsRegion=None):
        s3 = AwsHelper().getResource('s3', awsRegion)
        obj = s3.Object(bucketName, s3FileName)
        try:
            content = obj.get()['Body'].read()
            return content
        except ClientError as e:
            print("[ReadBytesFromS3 Error]: {}".format(e))
            return None

    @staticmethod
    def readFromS3(bucketName, s3FileName, awsRegion=None):
        content = S3Helper.readBytesFromS3(bucketName, s3FileName, awsRegion)
        if content is None:
            return None
        return content.decode('utf-8')

    @staticmethod
    def writeCSV(fieldNames, csvData, bucketName, s3FileName, awsRegion=None):
        csv_file = io.StringIO()
        writer = csv.DictWriter(csv_file, fieldnames=fieldNames)
        writer.writeheader()

        for item in csvData:
            i = 0
            row = {}
            for value in item:
                row[fieldNames[i]] = value
                i = i + 1
            writer.writerow(row)
        S3Helper.writeToS3(csv_file.getvalue(), bucketName, s3FileName)

    @staticmethod
    def writeCSVRaw(csvData, bucketName, s3FileName):
        csv_file = io.StringIO()
        writer = csv.writer(csv_file)
        for item in csvData:
            writer.writerow(item)
        S3Helper.writeToS3(csv_file.getvalue(), bucketName, s3FileName)

    @staticmethod
    def deleteFileS3(bucketName, s3FileName, awsRegion=None) -> None:
        try:
            s3 = AwsHelper().getResource('s3', awsRegion)
            s3.Object(bucketName, s3FileName).delete()
        except ClientError as _:
            return

    @staticmethod
    def isS3FileExists(bucketName, s3FileName, awsRegion=None) -> bool:
        s3 = AwsHelper().getResource('s3', awsRegion)
        try:
            s3.Object(bucketName, s3FileName).load()
            return True
        except ClientError as e:
            print("S3FileExists Errors: {}".format(e.response))
            return False

    @staticmethod
    def getS3FileSize(bucketName, s3FileName, awsRegion=None):
        client_s3 = AwsHelper().getClient('s3', awsRegion)
        try:
            response = client_s3.head_object(
                Bucket=bucketName,
                Key=s3FileName)
        except ClientError:
            return None
        return response.get('ContentLength')


class FileHelper:
    @staticmethod
    def getFileNameAndExtension(filePath):
        basename = os.path.basename(filePath)
        dn, dext = os.path.splitext(basename)
        return (dn, dext[1:])

    @staticmethod
    def getFileName(fileName):
        basename = os.path.basename(fileName)
        dn, dext = os.path.splitext(basename)
        return dn

    @staticmethod
    def getFileExtenstion(fileName):
        basename = os.path.basename(fileName)
        dn, dext = os.path.splitext(basename)
        return dext[1:]


    @staticmethod
    def readFile(fileName):
        with open(fileName, 'r') as document:
            return document.read()

    @staticmethod
    def writeToFile(fileName, content):
        with open(fileName, 'w') as document:
            document.write(content)

    @staticmethod
    def writeToFileWithMode(fileName, content, mode):
        with open(fileName, mode) as document:
            document.write(content)
    @staticmethod
    def getFilesInFolder(path, fileTypes):
        for file in os.listdir(path):
            if os.path.isfile(os.path.join(path, file)):
                ext = FileHelper.getFileExtenstion(file)
                if(ext.lower() in fileTypes):
                    yield file

    @staticmethod
    def getFileNames(path, allowedLocalFileTypes):
        files = []

        for file in FileHelper.getFilesInFolder(path, allowedLocalFileTypes):
            files.append(path + file)

        return files

    @staticmethod
    def writeCSV(fileName, fieldNames, csvData):
        with open(fileName, 'w') as csv_file:
            writer = csv.DictWriter(csv_file, fieldnames=fieldNames)
            writer.writeheader()

            for item in csvData:
                i = 0
                row = {}
                for value in item:
                    row[fieldNames[i]] = value
                    i = i + 1
                writer.writerow(row)

    @staticmethod
    def writeCSVRaw(fileName, csvData):
        with open(fileName, 'w') as csv_file:
            writer = csv.writer(csv_file)
            for item in csvData:
                writer.writerow(item)
