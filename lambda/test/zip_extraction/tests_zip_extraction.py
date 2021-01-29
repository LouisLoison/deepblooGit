import json
import os
from layer.helper.python.helper import S3Helper


def test_zip_extraction_execution():
    test_json_path = "lambda/test/zip_extraction/input_events/basic.json"
    result_json_path = "lambda/test/zip_extraction/output_events/basic.json"
    dest_s3_path_file_1 = "tenders/tender#6465ba2b-f0e5-4256-a6e2-b05c43f12d8c/A458075126/Tendernotice_1.pdf"
    dest_s3_path_file_2 = "tenders/tender#6465ba2b-f0e5-4256-a6e2-b05c43f12d8c/A458075126/2.xls"
    dest_s3_path = "tenders/tender#6465ba2b-f0e5-4256-a6e2-b05c43f12d8c/A458075126"
    bucket_name = os.environ['DOCUMENTS_BUCKET']
    aws_region = os.environ['AWS_REGION']

    S3Helper.deleteFileS3(bucket_name, dest_s3_path_file_1, aws_region)
    S3Helper.deleteFileS3(bucket_name, dest_s3_path_file_2, aws_region)
    S3Helper.deleteFileS3(bucket_name, dest_s3_path, aws_region)
    with open(test_json_path, "r") as test_file:
        with open(result_json_path) as result_file:
            event = json.load(test_file)
            result = json.load(result_file)
            from function.zipExtraction.lambda_function import lambda_handler
            assert lambda_handler(event, "") == result
            assert S3Helper.isS3FileExists(bucket_name,
                                           dest_s3_path_file_1,
                                           aws_region) == True
            assert S3Helper.isS3FileExists(bucket_name,
                                           dest_s3_path_file_2,
                                           aws_region) == True

