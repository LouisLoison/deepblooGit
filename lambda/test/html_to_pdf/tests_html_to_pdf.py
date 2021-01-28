import json
from layer.helper.python.helper import S3Helper


def test_html_to_pdf_execution():
    test_json_path = "lambda/test/html_to_pdf/input_events/basic.json"
    result_json_path = "lambda/test/html_to_pdf/output_events/basic.json"
    bucket_name = "textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj"
    dest_s3_file = "tenders/tender#000ac386-c063-4b7d-a709-09d04828c047/T459624983.pdf"
    aws_region = "eu-west-1"

    S3Helper.deleteFileS3(bucket_name, dest_s3_file)
    with open(test_json_path, "r") as test_file:
        with open(result_json_path) as result_file:
            event = json.load(test_file)
            result = json.load(result_file)
            from function.htmltopdf.lambda_function import lambda_handler
            assert lambda_handler(event, "") == result
            # assert S3Helper.isS3FileExists(bucket_name,
            #                                result_file_expected,
            #                                aws_region) == True

def test_html_to_pdf_bad_format():
    test_json_path = "lambda/test/html_to_pdf/input_events/bad_format.json"
    result_json_path = "lambda/test/html_to_pdf/output_events/bad_format.json"
    # bucket_name = "textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj"
    # dest_s3_file = "tenders/tender#f3f5e3bf-2bee-423c-ba27-2c08ac05a09d/T459071539.html"
    # aws_region = "eu-west-1"

    with open(test_json_path, "r") as test_file:
        with open(result_json_path) as result_file:
            event = json.load(test_file)
            result = json.load(result_file)
            from function.htmltopdf.lambda_function import lambda_handler
            lambda_result = lambda_handler(event, "")
            print("==> RESULT: {}".format(lambda_result))
            assert lambda_result == result
            # assert S3Helper.isS3FileExists(bucket_name,
            #                                result_file_expected,
            #                                aws_region) == True
