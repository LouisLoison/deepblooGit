import os
import json
import zipfile
import logging
from io import BytesIO
import shutil

from helper import AwsHelper


def extract_nested_zip(zip_file, output_zip):
    index = 0
    logging.info("=> [ZIP FILE] Found {}".format(zip_file))
    try:
        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            zip_ref.extractall(output_zip)
        os.remove(zip_file)
        for root, dirs, files in os.walk(output_zip):
            if "__MACOSX" in dirs:
                os.rmdir(os.path.join(root, "__MACOSX"))
                continue
            for filename in files:
                _, ext = os.path.splitext(filename)
                if ext == ".zip":
                    zip_file = os.path.join(root, filename)
                    print("[DEBUG] Filename that will be extracted ", filename)
                    extract_nested_zip(zip_file, root)
                index += 1
    except zipfile.BadZipFile:
        logging.warning("=> [BAD ZIP] {}".format(zip_file))


def read_bytes_from_s3(bucketName, s3FileName, awsRegion=None):
    # Serverless tests
    s3 = AwsHelper().getResource('s3', awsRegion)
    obj = s3.Object(bucketName, s3FileName)
    buffer = BytesIO(obj.get())
    # Local test of zip extraction
    # with open('Archive 2.zip', 'rb') as zip_file:
    #     buffer = BytesIO(zip_file.read())
    return buffer


def get_tmp_zip_name(tmp_folder) -> (str, str):
    """
    Get the tmp filename and path
    :param tmp_folder: the tmp folder like /tmp
    :return: the zip path, the zip filename
    """
    index = 0
    zip_tmp = "tmp_0.zip"
    for _ in os.listdir(tmp_folder):
        if os.path.isfile(os.path.join(tmp_folder, zip_tmp)) is False:
            break
        zip_tmp = "tmp_{0}.zip".format(index)
        index += 1
    zip_path = os.path.join(tmp_folder, 'output.zip')
    return zip_path, zip_tmp


def copy_zip_to_tmp(tmp_folder, aws_env: dict) -> str:
    # pdf_content = S3Helper.readFromS3(aws_env['bucketName'], aws_env['objectName'], aws_env['awsRegion'])
    zip_content = read_bytes_from_s3(aws_env['bucketName'], aws_env['objectName'],
                                         aws_env['aws_region'])
    zip_path, zip_tmp = get_tmp_zip_name(tmp_folder)
    with open(zip_path, 'wb') as zip_file:
        zip_file.write(zip_content.getvalue())
    zip_tmp = zipfile.ZipFile(zip_path)
    for file in zip_tmp.namelist():
        print(file)
    print("Copy {0} to {1}".format(aws_env["objectName"], zip_tmp))
    return zip_path


def prepare_output_zip(tmp_output: str) -> None:
    output_result = os.path.join(tmp_output)
    os.makedirs(output_result)


def lambda_handler(event, context):
    event_parsed = json.loads(event)
    aws_env = {
        "bucketName": event_parsed['document']['bucketName'],
        "objectName": event_parsed['document']['objectName'],
        "tenderUuid": event_parsed['document']['documentUuid'],
        "aws_region": "eu-west-1",
    }
    tmp_folder = os.path.join(os.getcwd(), "zip_folder")
    extraction_output = os.path.join(tmp_folder, "extractions")
    if os.path.isdir(extraction_output) is True:
        shutil.rmtree(extraction_output)
    logging.basicConfig(level=logging.INFO)
    zip_tmp_file = copy_zip_to_tmp(tmp_folder, aws_env)
    prepare_output_zip(extraction_output)
    extract_nested_zip(zip_tmp_file, extraction_output)
    event_parsed['document']['status'] = {
        'statusCode': 200,
        'body': 'All right'
    }
    return event_parsed