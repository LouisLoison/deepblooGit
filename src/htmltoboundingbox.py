import os
import pdfplumber
import json
from xhtml2pdf import pisa
from helper import FileHelper, S3Helper


def is_valid_path(file_to_check: str) -> bool:
    return not os.path.isfile(file_to_check)


def convert_html_to_pdf(html_content, output_pdf: str) -> int:
    html_str = html_content.read()
    with open(output_pdf, 'w+b') as pdf_file:
        pisa_status = pisa.CreatePDF(html_str, dest=pdf_file)
        pdf_file.close()
        html_content.close()
        return pisa_status.err
    return 1


def open_html_file(aws_env: dict) -> int:
    html_file = aws_env['bucketName']
    output_pdf = aws_env['outputName']
    try:
        with open(html_file, "r") as html_content:
            return convert_html_to_pdf(html_content, output_pdf)
    except UnicodeDecodeError:
        with open(html_file, "rb") as html_content:
            return convert_html_to_pdf(html_content, output_pdf)
    return 1


def extract_pdf(pdf_output: str) -> None:
    with pdfplumber.open(pdf_output) as pdf:
        for page in pdf.pages:
            words_extracted = page.extract_words(x_tolerance=3, y_tolerance=3, keep_blank_chars=True,
                                                 use_text_flow=False, horizontal_ltr=True, vertical_ttb=True,
                                                 extra_attrs=[])
            for word in words_extracted:
                print("==> Word object: {}", word)


def get_pdf_filename(path_to_html: str) -> str:
    path_file_name, file_extension = os.path.splitext([path_to_html])
    return "".join([path_file_name, ".pdf"])


def lambda_handler(event, context):
    print("event: {}".format(event))

    body = json.loads(event['Records'][0]['body'])
    message = json.loads(body['Message'])
    aws_env = {
        "bucketName": message['bucketName'],
        "objectName": message['objectName'],
        #"outputTable": os.environ['OUTPUT_TABLE']
        #"outputBucket": os.environ['OUTPUT_BUCKET'],
        "outputName": get_pdf_filename(message['bucketName'])
    }

    # Error return value if open_html_file return 1 ?
    open_html_file(aws_env)
    extract_pdf(aws_env['outputName'])

    return {
        'statusCode': 200,
        'body': 'All right'
    }
