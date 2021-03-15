import json
import os
from layer.helper.python.helper import S3Helper


def test_html_to_pdf_execution():
    test_json_path = "lambda/test/html_to_pdf/input_events/basic.json"
    result_json_path = "lambda/test/html_to_pdf/output_events/basic.json"
    dest_s3_file = "tenders/tender#f3f5e3bf-2bee-423c-ba27-2c08ac05a09d/T459624983/T459624983.pdf"
    bucket_name = os.environ['DOCUMENTS_BUCKET']
    aws_region = os.environ['AWS_REGION']

    S3Helper.deleteFileS3(bucket_name, dest_s3_file)
    with open(test_json_path, "r") as test_file:
        with open(result_json_path) as result_file:
            event = json.load(test_file)
            result = json.load(result_file)
            from function.htmltopdf.lambda_function import lambda_handler
            assert lambda_handler(event, "") == result
            assert S3Helper.isS3FileExists(bucket_name,
                                           dest_s3_file,
                                           aws_region) == True


def test_html_to_pdf_bad_format():
    test_json_path = "lambda/test/html_to_pdf/input_events/bad_format.json"
    result_json_path = "lambda/test/html_to_pdf/output_events/bad_format.json"

    with open(test_json_path, "r") as test_file:
        with open(result_json_path) as result_file:
            event = json.load(test_file)
            result = json.load(result_file)
            from function.htmltopdf.lambda_function import lambda_handler
            lambda_result = lambda_handler(event, "")
            assert lambda_result == result
