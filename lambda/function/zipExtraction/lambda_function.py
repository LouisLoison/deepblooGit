import os
import zipfile
from io import BytesIO
import shutil
import json

from helper import AwsHelper, S3Helper
from update_event import update_event, get_s3_object_url


def extract_nested_zip(zip_file, output_zip):
    index = 0
    print("[DEBUG]: Found {}".format(zip_file))
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
        print("[DEBUG]: [BAD ZIP] {}".format(zip_file))


def read_bytes_from_s3(bucketName, s3FileName, awsRegion=None):
    s3 = AwsHelper().getResource('s3', awsRegion)
    obj = s3.Object(bucketName, s3FileName)
    content = obj.get()['Body'].read()
    buffer = BytesIO(content)
    return buffer


def get_tmp_name(tmp_folder: str, prefix: str="tmp") -> (str, str):
    """
    Get the tmp filename and path
    :param tmp_folder: the tmp folder like /tmp
    :return: the zip path, the zip filename
    """
    index = 0
    zip_tmp = "{0}_0.zip".format(prefix)
    for _ in os.listdir(tmp_folder):
        if os.path.isfile(os.path.join(tmp_folder, zip_tmp)) is False:
            break
        zip_tmp = "{0}_{1}.zip".format(prefix, index)
        index += 1
    zip_path = os.path.join(tmp_folder, 'output.zip')
    return zip_path, zip_tmp


def copy_zip_to_tmp(tmp_folder, aws_env: dict) -> str:
    zip_content = read_bytes_from_s3(aws_env['bucketName'],
                                     aws_env['objectName'],
                                     aws_env['awsRegion'])
    zip_path, zip_tmp = get_tmp_name(tmp_folder)
    print("[DEBUG]: Copying {0} to {1}".format(aws_env["objectName"], zip_tmp))
    try:
        shutil.rmtree(zip_path)
    except FileNotFoundError:
        pass
    with open(zip_path, 'wb') as zip_file:
        zip_file.write(zip_content.getvalue())
    zip_tmp = zipfile.ZipFile(zip_path)
    for file in zip_tmp.namelist():
        print("[DEBUG] Element found in zip: ", file)
    return zip_path


def prepare_output_zip(tmp_output: str) -> None:
    output_result = os.path.join(tmp_output)
    os.makedirs(output_result)


def write_extracted_zip(aws_env: dict, zip_tmp: str):
    output_bucket = aws_env['bucketName']
    output_folder = aws_env['outputName']
    aws_region = aws_env['awsRegion']

    print("Writing s3://{0}/{1} in {2}".format(output_bucket, output_folder,
                                               aws_region))
    for path, folders, files in os.walk(zip_tmp):
        print("=> Path: {0}".format(path))
        for file in files:
            print("=> File: {0}".format(files))
            file_path = os.path.join(path, file)
            s3_output_path = os.path.join(output_folder, file)
            try:
                with open(file_path, "r") as open_file:
                    content = open_file.read()
                    print("=> Writing {0} to s3: {0}".format(file_path,
                                                             s3_output_path))
                    S3Helper.writeToS3(content, output_bucket, s3_output_path,
                                       aws_region)
            except UnicodeDecodeError:
                with open(file_path, "rb") as open_file:
                    content = open_file.read()
                    print("=> Writing to s3: {0}".format(file_path,
                                                         s3_output_path))
                    S3Helper.writeToS3(content, output_bucket, s3_output_path,
                                       aws_region)


# def get_zip_output(object_name: str) -> str:
#     folder_output, zip_name = os.path.split(object_name)
#     name, ext = os.path.splitext(zip_name)
#     output = os.path.join(folder_output, name)
#     return output


def lambda_handler(event, context):
    print("=> Event: {0}".format(json.dumps(event)))
    aws_env = {
        **event,
        "bucketName": os.environ['DOCUMENTS_BUCKET'],
        "outputBucket": os.environ['DOCUMENTS_BUCKET'],
        "awsRegion": "eu-west-1",
        "outputName": event['objectName'][0:-4]
    }
    print("=> AWS env: {0}".format(json.dumps(aws_env)))
    tmp_folder = "/tmp/zip_extraction"
    if os.path.isdir(tmp_folder) is True:
        AwsHelper.refreshTmpFolder(tmp_folder)
    extraction_output = os.path.join(tmp_folder, "extractions")
    prepare_output_zip(extraction_output)
    zip_tmp = copy_zip_to_tmp(tmp_folder, aws_env)
    print("[DEBUG]: Extracting {0} into tmp file: {1}".format(zip_tmp,
                                                              extraction_output))
    extract_nested_zip(zip_tmp, extraction_output)
    write_extracted_zip(aws_env, extraction_output)
    aws_env["status"] = 1
    aws_env["errorMessage"] = None
    AwsHelper.refreshTmpFolder(tmp_folder)
    return update_event(aws_env, event)
