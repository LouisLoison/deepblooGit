import os
import json
import chardet
from io import BytesIO
from xhtml2pdf import pisa
from helper import FileHelper, S3Helper, AwsHelper


def convert_html_to_pdf(html_str, aws_env) -> None:
    aws_region = aws_env['awsRegion']
    output_bucket = aws_env['outputBucket']
    output_file = aws_env['outputName']
    output_content = BytesIO()

    print("Writing s3://%s/%s in %s" % (output_bucket, output_file, aws_region))
    s3 = AwsHelper().getResource('s3', aws_region)
    s3_obj = s3.Object(output_bucket, output_file)
    pisa.CreatePDF(html_str, dest=output_content)
    content = output_content.getvalue().decode("utf-8", errors="ignore")
    s3_obj.put(Body=content)


def read_from_s3(aws_env):
    bucket_name = aws_env['bucketName']
    s3_file_name = aws_env['objectName']
    aws_region = aws_env['awsRegion']
    s3 = AwsHelper().getResource('s3', aws_region)
    obj = s3.Object(bucket_name, s3_file_name)
    content = obj.get()['Body'].read()
    try:
        encoding = chardet.detect(content)['encoding']
        print("Trying to decode with {}".format(encoding))
        content.decode(encoding)
    except UnicodeDecodeError:
        print("Failing to decode, return content in bytes")
        return content
    return content


def get_pdf_filename(path_to_pdf: str, document_id: str) -> str:
    folder_output, pdf_output = os.path.split(path_to_pdf)
    name, ext = os.path.splitext(pdf_output)
    pdf_output = name + ".pdf"
    output_file = "{}-analysis/{}/{}".format(folder_output, document_id, pdf_output)
    return output_file


def lambda_handler(event, context):
    print("==> Event: {0}".format(json.dumps(event)))
    aws_env = {
        "bucketName": os.environ['DOCUMENTS_BUCKET'],
        "objectName": event['objectName'],
        "documentUuid": event['documentUuid'],
        "awsRegion": 'eu-west-1',
        "outputBucket": os.environ['DOCUMENTS_BUCKET'],
        "outputName": get_pdf_filename(event['objectName'],
                                       event['documentUuid'])
    }
    print("==> Aws env: {0}".format(aws_env))
    status = {
        'statusCode': 200,
        'body': 'All right'
    }
    html_content = read_from_s3(aws_env)
    convert_html_to_pdf(html_content, aws_env)
    return { **event, 'status': status, 'objectName': aws_env['outputName'] }
