import json


def test_html_to_pdf_execution():
    tests_json_base_path = "lambda/function/htmltopdf/tests/"
    test_json_path = "{}/test_event_step.json".format(tests_json_base_path)
    result_json_path = "{}/result_event_step.json".format(tests_json_base_path)

    with open(test_json_path, "r") as test_file:
        with open(result_json_path) as result_file:
            event = json.load(test_file)
            result = json.load(result_file)
            from function.htmltopdf.lambda_function import lambda_handler
            assert lambda_handler(event, "") == result

