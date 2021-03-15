import os
import json
from layer.helper.python.helper import S3Helper


def test_text_to_sentences_execution():
    test_json_path = "lambda/test/text_to_sentences/input_events/basic.json"
    result_json_path = "lambda/test/text_to_sentences/output_events/basic.json"
    dest_s3_file = "tenders/tender#f3f5e3bf-2bee-423c-ba27-2c08ac05a09d/T459624983/T459624983_sentences.txt"
    bucket_name = os.environ['DOCUMENTS_BUCKET']
    aws_region = os.environ['AWS_REGION']

    S3Helper.deleteFileS3(bucket_name, dest_s3_file)
    with open(test_json_path, "r") as test_file:
        with open(result_json_path) as result_file:
            event = json.load(test_file)
            result = json.load(result_file)
            from function.textToSentences.lambda_function import lambda_handler
            assert lambda_handler(event, "") == result
            assert S3Helper.isS3FileExists(bucket_name,
                                           dest_s3_file,
                                           aws_region) == True
