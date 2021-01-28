import os
import json


def test_text_to_sentences_execution():
    tests_json_base_path = "lambda/test/text_to_sentences/input_events/"
    test_json_path = "{}/basic.json".format(tests_json_base_path)
    result_json_path = "{}/basic.json".format(tests_json_base_path)

    with open(test_json_path, "r") as test_file:
        with open(result_json_path) as result_file:
            event = json.load(test_file)
            result = json.load(result_file)
            from function.textToSentences.lambda_function import lambda_handler
            assert lambda_handler(event, "") == result
