import os
import json
from layer.helper.python.helper import S3Helper


def test_pdf_to_bbox_execution():
    test_json_path = "lambda/test/pdf_to_bbox_text/input_events/basic.json"
    result_json_path = "lambda/test/pdf_to_bbox_text/input_events/basic.json"
    os.environ['TEXTRACT_ONLY'] = "false"
    os.environ['MIN_CHAR_NEEDED'] = "10"
    os.environ['EXTRACT_PDF_LINES'] = "true"
    dest_s3_path = "tenders/tender#f3f5e3bf-2bee-423c-ba27-2c08ac05a09d-analysis/2e61ac87-061a-41ba-8c48-42ada588ab5c/T459624983.txt"
    bucket_name = os.environ['DOCUMENTS_BUCKET']
    aws_region = os.environ['AWS_REGION']

    S3Helper.deleteFileS3(bucket_name, dest_s3_path)
    with open(test_json_path, "r") as test_file:
        with open(result_json_path) as result_file:
            event = json.load(test_file)
            result = json.load(result_file)
            from function.pdftobboxtext.lambda_function import lambda_handler
            assert lambda_handler(event, "") == result
            assert S3Helper.isS3FileExists(bucket_name,
                                           dest_s3_path,
                                           aws_region) == True
