import json
import os
import pdfplumber
import subprocess
from helper import AwsHelper


def get_bbox_filename(path_to_pdf: str, document_id: str) -> str:
    folder_output = "/".join(path_to_pdf.split('/')[:-1])  # get path without file
    path_without_ext, _ = os.path.splitext(path_to_pdf.split('/')[-1])
    pdf_output = path_without_ext + '.pdf'
    output_file = "{}-analysis/{}/{}".format(folder_output, document_id, pdf_output)
    return output_file


def execute_pdf_to_bbox(pdf_tmp_path: str, bbox_output: str, output_format="json", output_type="line") -> int:
    """
    Execute the pdfplumber binary with pdf_tmp_path to extract bounding boxes.

    :param pdf_tmp_path: the tmp path of the pdf to pass it to pdfplumber
    :param output_format: the output format of the bounding boxes. Can be "json" or "csv"
    :param output_type: object types to extract. "char", "rect", "line", "curve", "image", "annot"
    :return: None
    """
    available_format = ["json", "csv"]
    available_types = ["char", "rect", "line", "curve", "image", "annot"]
    if output_format not in available_format:
        print("[pdfplumber execution] => Wrong format parameter given {0}".format(output_format))
        return
    if output_type not in available_types:
        print("[pdfplumber execution] => Wrong type parameter given {0}".format(output_type))
    pdfplumber_cmd = ["pdfplumber", "--format", output_format, output_type]
    commands = [*pdfplumber_cmd, "< {}".format(pdf_tmp_path), "> {0}".format(bbox_output)]
    try:
        subprocess.call(commands, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as error:
        print("[EXIT CODE] : {0}\n[DESCRIPTION]  => {1}".format(error.returncode, error.stdout))
        return error.returncode
    return 0


def write_bbox_to_s3(aws_env: dict) -> None:
    with open(aws_env['outputName']) as file:
        bbox_content = file.read()
        AwsHelper.writeTos3(bbox_content, aws_env['bucketName'], aws_env['objectName'], aws_env['awsRegion'])


def copy_pdf_to_tmp(aws_env: dict) -> str:
    pdf_content = AwsHelper.readFroms3(aws_env['bucketName'], aws_env['objectName'], aws_env['awsRegion'])
    tmp_folder = "/tmp"
    pdf_tmp = "tmp_0.pdf"
    index = 0
    for _ in os.listdir(tmp_folder):
        if os.path.isfile(os.path.join(tmp_folder, pdf_tmp)) is False:
            break
        pdf_tmp = "tmp_{0}.pdf".format(index)
        index += 1
    pdf_tmp = os.path.join(tmp_folder, pdf_tmp)
    with open(pdf_tmp) as tmp_file:
        tmp_file.write(pdf_content)
    return pdf_tmp


def lambda_handler(event, context):
    body = json.loads(event['Records'][0]['body'])
    aws_region = event['Records'][0]['awsRegion']
    aws_env = {
        "bucketName": body['bucketName'],
        "objectName": body['objectName'],
        "documentId": body['documentId'],
        "awsRegion": aws_region,
        #"outputBucket": os.environ['OUTPUT_BUCKET'],
        "outputName": get_bbox_filename(body['objectName'], body['documentId'])
    }
    pdf_tmp_path = copy_pdf_to_tmp(aws_env)
    execute_pdf_to_bbox(pdf_tmp_path, aws_env["outputName"])
    write_bbox_to_s3(aws_env)
    return {
        'statusCode': 200,
        'body': 'All right'
    }
