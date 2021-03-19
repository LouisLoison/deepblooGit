import os
import json
import chardet
from io import BytesIO
from xhtml2pdf import pisa
from htmllaundry import sanitize

from helper import S3Helper, AwsHelper
from update_event import update_event, get_s3_url, get_s3_object_url, get_filename


def convert_html_to_pdf(html_str, tmp_env):
    aws_region = tmp_env['awsRegion']
    output_bucket = tmp_env['outputBucket']
    output_file = tmp_env['outputName']
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


def read_from_s3(tmp_env):
    bucket_name = tmp_env['bucketName']
    s3_file_name = tmp_env['objectName']
    aws_region = tmp_env['awsRegion']
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
    tmp_env = {
        **event,
        "bucketName": os.environ['DOCUMENTS_BUCKET'],
        "awsRegion": 'eu-west-1',
        "outputBucket": os.environ['DOCUMENTS_BUCKET'],
        "outputName": get_s3_object_url(event["objectName"],
                                       ".pdf"),
    }
    print("==> Aws Env: {0}".format(json.dumps(tmp_env)))
    html_content = read_from_s3(tmp_env)
    sanitized_html_content = sanitize_html_content(html_content)
    status = convert_html_to_pdf(sanitized_html_content, tmp_env)
    tmp_env['size'] = S3Helper.getS3FileSize(tmp_env['bucketName'],
                                             tmp_env['outputName'],
                                             tmp_env['awsRegion'])
    tmp_env["s3Url"] = get_s3_url(tmp_env["outputName"])
    tmp_env["status"] = status['status']
    tmp_env["errorMessage"] = status["errorMessage"]
    tmp_env["contentType"] = "application/pdf"
    tmp_env["objectName"] = tmp_env["outputName"]
    tmp_env['size'] = S3Helper.getS3FileSize(tmp_env['bucketName'],
                                             tmp_env['outputName'],
                                             tmp_env['awsRegion'])
    tmp_env["filename"] = get_filename(tmp_env['objectName'])
    tmp_env["sourceUrl"] = tmp_env["s3Url"]
    return update_event(tmp_env, event)
