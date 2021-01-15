import pytest
import sys
import os


@pytest.fixture
def initialize_lambda_layers():
    pwd = os.getcwd()
    print('PWD: {}'.format(pwd))
    layer_path = "lambda/layer/helper/python"
    os.environ['DOCUMENTS_BUCKET'] = "textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj"
    os.environ['TEXTRACT_ONLY'] = "false"
    os.environ['MIN_CHAR_NEEDED'] = "10"
    os.environ['EXTRACT_PDF_LINES'] = "true"
    yield os.path.join(pwd, layer_path)


def test_lambda_execution(initialize_lambda_layers):
    sys.path.append(initialize_lambda_layers)
    event = {
        "tenderid": None,
        "cpvs": None,
        "filename": None,
        "size": 25307,
        "pageCount": None,
        "sourceUrl": "http://d.infostores.biz/T458075031.html?id=PzA7RDR6JxczJS0BUBxGdQ5jK3EcVW5oXAQENUFE",
        "s3Url": "https://textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj.s3.eu-west-1.amazonaws.com/tenders/tender%23d48adaed-3ddd-49a4-9d16-433acc0209b2/T458075031.html",
        "boxFolderId": None,
        "boxFileId": None,
        "parseResult": None,
        "status": {
            "statusCode": 200,
            "body": "All right"
        },
        "creationDate": None,
        "updateDate": "2021-01-07T16:55:31.440Z",
        "tenderUuid": "d48adaed-3ddd-49a4-9d16-433acc0209b2",
        "documentUuid": "2e61ac87-061a-41ba-8c48-42ada588ab5c",
        "contentHash": "22d9be1798016d4dcc1ca48e301d50d5715547573ffec2cbe80edc9dc832c07e",
        "contentType": "text/html",
        "objectName": "tenders/tender#d48adaed-3ddd-49a4-9d16-433acc0209b2-analysis/2e61ac87-061a-41ba-8c48-42ada588ab5c/T458075031.pdf"
    }
    from function.pdftobboxtext.lambda_function import lambda_handler
    lambda_handler(event, "")
