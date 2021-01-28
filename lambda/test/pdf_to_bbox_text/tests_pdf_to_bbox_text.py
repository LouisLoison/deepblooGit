import os
import json


def test_pdf_to_bbox_execution():
    test_json_path = "lambda/test/pdf_to_bbox_text/input_events/basic.json"
    result_json_path = "lambda/test/pdf_to_bbox_text/input_events/basic.json"
    os.environ['TEXTRACT_ONLY'] = "false"
    os.environ['MIN_CHAR_NEEDED'] = "10"
    os.environ['EXTRACT_PDF_LINES'] = "true"

    with open(test_json_path, "r") as test_file:
        with open(result_json_path) as result_file:
            event = json.load(test_file)
            result = json.load(result_file)
            from function.pdftobboxtext.lambda_function import lambda_handler
            assert lambda_handler(event, "") == result
