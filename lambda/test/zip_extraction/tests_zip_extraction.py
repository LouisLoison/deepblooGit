import json


def test_zip_extraction_execution():
    test_json_path = "lambda/test/zip_extraction/input_events/basic.json"
    result_json_path = "lambda/test/zip_extraction/output_events/basic.json"

    with open(test_json_path, "r") as test_file:
        with open(result_json_path) as result_file:
            event = json.load(test_file)
            result = json.load(result_file)
            from function.zipExtraction.lambda_function import lambda_handler
            assert lambda_handler(event, "") == result

