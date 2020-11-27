import json
import os
import pdfplumber
import subprocess
from helper import AwsHelper, S3Helper


def get_bbox_filename(path_to_pdf: str) -> str:
    folder_output, pdf_output = os.path.split(path_to_pdf)
    file_name, ext = os.path.splitext(pdf_output)
    json_file = file_name + ".json"
    json_output = os.path.join(folder_output, json_file)
    return json_output


def prepare_pdfplumber():
    cmd_cp_list = "cp /opt/bin/pdfplumber /tmp/".split()
    cmd_chmod_list = "chmod 755 /tmp/pdfplumber".split()
    cmd_ls_list = "ls -al /tmp".split()
    print("[RUN] {}".format(cmd_cp_list))
    subprocess.run(cmd_cp_list)
    print("[RUN] {}".format(cmd_chmod_list))
    subprocess.run(cmd_chmod_list)
    with subprocess.Popen(cmd_ls_list, stdout=subprocess.PIPE, encoding="utf-8") as proc:
        print(proc.stdout.read())



def execute_pdf_to_bbox(pdf_tmp_path: str, bbox_output: str, output_format="json", output_type="line") -> int:
    """
    Execute the pdfplumber binary with pdf_tmp_path to extract bounding boxes.

    :param pdf_tmp_path: the tmp path of the pdf to pass to pdfplumber
    :param output_format: the output format of the bounding boxes. Can be "json" or "csv"
    :param output_type: object types to extract. "char", "rect", "line", "curve", "image", "annot"
    :return: None
    """
    available_format = ["json", "csv"]
    available_types = ["char", "rect", "line", "curve", "image", "annot"]
    if output_format not in available_format:
        print("[pdfplumber execution] => Wrong format parameter given {0}".format(output_format))
        return 0
    if output_type not in available_types:
        print("[pdfplumber execution] => Wrong type parameter given {0}".format(output_type))
    pdfplumber_cmd = "/tmp/pdfplumber --format {0} --types {1}".format(output_format, output_type)
    cmd_list = pdfplumber_cmd.split()
    print("Current Path: {}".format(bbox_output))
    prepare_pdfplumber()
    print("Pdf tmp file: {}".format(pdf_tmp_path))
    print("Json tmp file: {}".format(bbox_output))
    try:
        print("Executing PDF to Bounding box: {}".format(cmd_list))
        with open(bbox_output, "w") as json_file:
            with open(pdf_tmp_path, "r") as file:
                subprocess.run(cmd_list, stdout=json_file, stdin=file,
                                 encoding="utf-8", universal_newlines=True)
    except subprocess.CalledProcessError as error:
        print("[EXIT CODE] : {0}\n[DESCRIPTION]  => {1}".format(error.returncode, error.stdout))
        return error.returncode
    return 0


def is_pdf_with_images(pdf_path) -> bool:
    with pdfplumber.open(pdf_path) as pdf_content:
        images = pdf_content.images
        if len(images) == 0:
            return False
    return True


def write_bbox_to_s3(file_path, aws_env: dict) -> None:
    with open(file_path, "r") as file:
        content = file.read()
        S3Helper.writeToS3(content, aws_env['outputBucket'], aws_env['outputName'], aws_env['awsRegion'])


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
        "outputName": get_bbox_filename(body['objectName'])
    }

    pdf_tmp_path = copy_pdf_to_tmp(aws_env)
    if is_pdf_with_images(pdf_tmp_path) is False:
        print("Extracting bounding box without textract")
        execute_pdf_to_bbox(pdf_tmp_path, aws_env['tmpJsonOutput'])
        write_bbox_to_s3(aws_env['tmpJsonOutput'], aws_env)
    else:
        print("Extracting bounding box with textract")
        # send to textract
    return {
        'statusCode': 200,
        'body': 'All right'
    }
