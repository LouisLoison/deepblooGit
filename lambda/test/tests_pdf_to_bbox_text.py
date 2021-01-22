import os
import json


def test_pdf_to_bbox_execution():
    tests_json_base_path = "lambda/function/pdftobboxtext/tests/"
    test_json_path = "{}/test_event_step.json".format(tests_json_base_path)
    result_json_path = "{}/result_event_step.json".format(tests_json_base_path)
    os.environ['TEXTRACT_ONLY'] = "false"
    os.environ['MIN_CHAR_NEEDED'] = "10"
    os.environ['EXTRACT_PDF_LINES'] = "true"

    with open(test_json_path, "r") as test_file:
        with open(result_json_path) as result_file:
            event = json.load(test_file)
            result = json.load(result_file)
            from function.pdftobboxtext.lambda_function import lambda_handler
            assert lambda_handler(event, "") == result
