import os
import json
import chardet
from io import BytesIO
from xhtml2pdf import pisa
from htmllaundry import sanitize

from helper import S3Helper, AwsHelper
from update_event import update_event, get_s3_url, get_s3_object_url, get_filename


def convert_html_to_pdf(html_str, tmp_event):
    aws_region = tmp_event['awsRegion']
    output_bucket = tmp_event['outputBucket']
    output_file = tmp_event['outputName']
    output_content = BytesIO()

    if html_str is None:
        return {
            "status": -1,
            "errorMessage": "PDF is empty"
        }
    print("Writing s3://%s/%s in %s" % (output_bucket, output_file, aws_region))
    s3 = AwsHelper().getResource('s3', aws_region)
    s3_obj = s3.Object(output_bucket, output_file)
    try:
        pisa.CreatePDF(html_str, dest=output_content)
        content = output_content.getvalue().decode("utf-8", errors="ignore")
        s3_obj.put(Body=content)
    except ValueError as e:
        print(e)
        return {
            "status": -1,
            "errorMessage": "PDF format not supported."
        }
    return {
        "status": 1,
        "errorMessage": None
    }


def read_from_s3(tmp_event):
    bucket_name = tmp_event['bucketName']
    s3_file_name = tmp_event['objectName']
    aws_region = tmp_event['awsRegion']
    s3 = AwsHelper().getResource('s3', aws_region)
    obj = s3.Object(bucket_name, s3_file_name)
    encoding = "utf-8"
    try:
        content = obj.get()['Body'].read()
    except Exception as e:
        print(e)
        return
    try:
        encoding = chardet.detect(content)['encoding']
        print("Trying to decode with {}".format(encoding))
        content_decoded = content.decode(encoding)
        return content_decoded
    except UnicodeDecodeError as e:
        print("Failing to decode with encoding {0}: {1}".format(encoding, e))
        try:
            print("Trying by removing the last character")
            content_without_last_char = content[:-1].decode(encoding)
            return content_without_last_char
        except UnicodeDecodeError as e:
            print("Failing to decode: {}".format(e))
            print("Returning content in bytes")
            return content


def sanitize_html_content(html_str: str) -> str:
    return sanitize(html_str)


def lambda_handler(event, context):
    tmp_event = {
        **event,
        "bucketName": os.environ['DOCUMENTS_BUCKET'],
        "awsRegion": 'eu-west-1',
        "outputBucket": os.environ['DOCUMENTS_BUCKET'],
        "outputName": get_s3_object_url(event["objectName"],
                                       ".pdf"),
    }
    print("==> Aws Env: {0}".format(json.dumps(tmp_event)))
    html_content = read_from_s3(tmp_event)
    sanitized_html_content = sanitize_html_content(html_content)
    status = convert_html_to_pdf(sanitized_html_content, tmp_event)
    tmp_event['size'] = S3Helper.getS3FileSize(tmp_event['bucketName'],
                                             tmp_event['outputName'],
                                             tmp_event['awsRegion'])
    tmp_event["s3Url"] = get_s3_url(tmp_event["outputName"])
    tmp_event["status"] = status['status']
    tmp_event["errorMessage"] = status["errorMessage"]
    tmp_event["contentType"] = "application/pdf"
    tmp_event["objectName"] = tmp_event["outputName"]
    tmp_event['size'] = S3Helper.getS3FileSize(tmp_event['bucketName'],
                                             tmp_event['outputName'],
                                             tmp_event['awsRegion'])
    tmp_event["filename"] = get_filename(tmp_event['objectName'])
    tmp_event["sourceUrl"] = tmp_event["s3Url"]
    return update_event(tmp_event, event)
