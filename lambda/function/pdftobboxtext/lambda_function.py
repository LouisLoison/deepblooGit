import json
import os
from helper import AwsHelper, S3Helper
from pdfplumber.cli import parse_args, main, convert
from pdfplumber.pdf import PDF
import pdfplumber
import simplejson


def send_message(client, qUrl, json_message) -> None:
    message = json.dumps(json_message)
    client.send_message(QueueUrl=qUrl, MessageBody=message)
    print("Message to queue: {}".format(qUrl))
    print("Submitted message to queue: {}".format(message))


def send_to_textract(aws_env: dict):
    json_message = {
        "bucketName": aws_env["outputBucket"],
        "objectName": aws_env["outputName"],
        "documentId": aws_env["documentId"],
        "awsRegion": aws_env["awsRegion"]
    }
    client = AwsHelper().getClient('sqs', awsRegion=aws_env["awsRegion"])
    qUrl = aws_env['textractQueueUrl']
    send_message(client, qUrl, json_message)


def get_bbox_filename(path_to_pdf: str) -> str:
    folder_output, pdf_output = os.path.split(path_to_pdf)
    file_name, ext = os.path.splitext(pdf_output)
    json_file = file_name + ".json"
    json_output = os.path.join(folder_output, json_file)
    return json_output


def write_bbox_to_s3(aws_env: dict) -> None:
    with open(aws_env['tmpJsonOutput'], "r") as file:
        content = file.read()
        S3Helper.writeToS3(content, aws_env['outputBucket'], aws_env['outputName'], aws_env['awsRegion'])


def execute_pdf_to_bbox(pdf_tmp_path: str, bbox_output: str, output_format="json", output_type="line") -> bool:
    """
    Execute the pdfplumber binary with pdf_tmp_path to extract bounding boxes.

    :param pdf_tmp_path: the tmp path of the pdf to pass to pdfplumber
    :param bbox_output: the tmp file of the json to create and to stock pdf information
    :return: int
    """
    with pdfplumber.open(pdf_tmp_path) as pdf_file:
        page_pdf = []
        if os.path.isfile(bbox_output):
            os.remove(bbox_output)
        with open(bbox_output, "w") as json_file:
            for page in pdf_file.pages:
                page_pdf.append({
                    "page_number": page.page_number,
                    "page_content": page.extract_words(x_tolerance=3, y_tolerance=3, keep_blank_chars=False,
                                                       use_text_flow=False, horizontal_ltr=True, vertical_ttb=True,
                                                       extra_attrs=[])
                })
            json_pretty_content = simplejson.dumps(page_pdf, indent=4)
            json_file.write(json_pretty_content)
    return False


def is_valid_pdf(pdf_path, min_char_required) -> bool:
    with pdfplumber.open(pdf_path) as pdf_content:
        images = pdf_content.images
        if len(images) == 0:
            return False
        for page in pdf_content.pages:
            nb_char_in_page = len(page.chars)
            if nb_char_in_page < min_char_required:
                return False
    return True


def copy_pdf_to_tmp(aws_env: dict) -> str:
    pdf_content = S3Helper.readFromS3(aws_env['bucketName'], aws_env['objectName'], aws_env['awsRegion'])
    tmp_folder = "/tmp"
    pdf_tmp = "tmp_0.pdf"
    index = 0
    for _ in os.listdir(tmp_folder):
        if os.path.isfile(os.path.join(tmp_folder, pdf_tmp)) is False:
            break
        pdf_tmp = "tmp_{0}.pdf".format(index)
        index += 1
    pdf_tmp = os.path.join(tmp_folder, pdf_tmp)
    with open(pdf_tmp, "w") as tmp_file:
        tmp_file.write(pdf_content)
    print("Copy {0} to {1}".format(aws_env["objectName"], pdf_tmp))
    return pdf_tmp


def lambda_handler(event, context):
    body = json.loads(event['Records'][0]['body'])
    aws_region = event['Records'][0]['awsRegion']
    aws_env = {
        "bucketName": body['bucketName'],
        "objectName": body['objectName'],
        "documentId": body['documentId'],
        "awsRegion": aws_region,
        "tmpJsonOutput": "/tmp/tmp_result.json",
        "outputBucket": os.environ['OUTPUT_BUCKET'],
        "outputName": get_bbox_filename(body['objectName']),
        "textractQueueUrl": os.environ['ELASTIC_QUEUE_URL'],
        "textractOnly": os.environ['TEXTRACT_ONLY'],
        "minCharNeeded": os.environ['MIN_CHAR_NEEDED']
    }
    status = {
        'statusCode': 200,
        'body': 'All right'
    }
    pdf_tmp_path = copy_pdf_to_tmp(aws_env)
    if aws_env['textractOnly'] == "false" and is_valid_pdf(pdf_tmp_path, aws_env['minCharNeeded']) is False:
        print("Extracting bounding box without textract")
        if execute_pdf_to_bbox(pdf_tmp_path, aws_env['tmpJsonOutput']):
            print("Error while trying to get pdf information")
            return status
        write_bbox_to_s3(aws_env)
    else:
        print("Extracting bounding box with textract")
        send_to_textract(aws_env)
    return status