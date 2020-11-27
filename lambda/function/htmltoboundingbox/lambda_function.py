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


def send_message(client, qUrl, json_message) -> None:
    message = json.dumps(json_message)
    client.send_message(QueueUrl=qUrl, MessageBody=message)
    print("Submitted message to queue: {}".format(message))


def send_to_pdf_to_bbox_lambda(aws_env: dict) -> None:
    json_message = {
        "bucketName": aws_env["outputBucket"],
        "objectName": aws_env["outputName"],
        "documentId": aws_env["documentId"],
        "awsRegion": aws_env["awsRegion"]
    }
    client = AwsHelper().getClient('sqs', awsRegion=aws_env["awsRegion"])
    qUrl = aws_env['pdfToBboxQueueUrl']
    send_message(client, qUrl, json_message)


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
    output_file = "{}-analysis/{}/{}".format(folder_output, document_id, pdf_output)
    return output_file


def lambda_handler(event, context):
    body = json.loads(event['Records'][0]['body'])
    aws_region = event['Records'][0]['awsRegion']
    aws_env = {
        "bucketName": body['bucketName'],
        "objectName": body['objectName'],
        "documentId": body['documentId'],
        "awsRegion": aws_region,
        "outputBucket": os.environ['OUTPUT_BUCKET'],
        "pdfToBboxQueueUrl": os.environ['PDFTOBOUNDINGBOXANDTEXT_QUEUE_URL'],
        "outputName": get_pdf_filename(body['objectName'], body['documentId'])
    }

    html_content = read_from_s3(aws_env)
    convert_html_to_pdf(html_content, aws_env)
    send_to_pdf_to_bbox_lambda(aws_env)

    return {
        'statusCode': 200,
        'body': 'All right'
    }
