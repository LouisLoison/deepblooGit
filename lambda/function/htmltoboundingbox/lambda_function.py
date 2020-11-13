import os
import pdfplumber
import json
import chardet
from io import BytesIO
from xhtml2pdf import pisa
from subprocess import Popen
from helper import FileHelper, S3Helper, AwsHelper


def is_valid_path(file_to_check: str) -> bool:
    return not os.path.isfile(file_to_check)


def convert_html_to_pdf(html_str, aws_env) -> int:
    file_name = aws_env['objectName']
    aws_region = aws_env['awsRegion']
    output_bucket = aws_env['outputBucket']
    output_file = aws_env['outputName']
    output_content = BytesIO()

    print("Writing s3://%s/%s in %s" % (output_bucket, output_file, aws_region))
    s3 = AwsHelper().getResource('s3', aws_region)
    s3_obj = s3.Object(output_bucket, output_file)
    pisa_status = pisa.CreatePDF(html_str, dest=output_content)
    s3_obj.put(Body=output_content.getvalue().decode("utf-8", errors="ignore"))
    #print("==> PDF output: ", output_content)
    return pisa_status.err


def read_from_s3(aws_env):
    bucket_name = aws_env['bucketName']
    s3_file_name = aws_env['objectName']
    aws_region = aws_env['awsRegion']
    s3 = AwsHelper().getResource('s3', aws_region)
    obj = s3.Object(bucket_name, s3_file_name)
    content = obj.get()['Body'].read()
    try:
        encoding = chardet.detect(content)['encoding']
        print("Try to decoding with {}".format(encoding))
        content.decode(encoding)
    except UnicodeDecodeError:
        return content #content.decode('utf-8')
    return content


def open_html_file(aws_env: dict) -> (str, bytes):
    html_file = aws_env['objectName']
    output_pdf = aws_env['outputName']
    html_str = ""
    html_bytes: bytes
    print("==> html_file: ", html_file)
    print("==> output_pdf: ", output_pdf)
    try:
        with open(html_file, "r") as html_content:
            html_str = html_content.read()
            return html_str
    except UnicodeDecodeError:
        with open(html_file, "rb") as html_content:
            html_bytes = html_content.read()
    return html_str, html_bytes


def extract_pdf(pdf_output: str) -> None:
    with pdfplumber.open(pdf_output) as pdf:
        for page in pdf.pages:
            words_extracted = page.extract_words(x_tolerance=3, y_tolerance=3, keep_blank_chars=True,
                                                 use_text_flow=False, horizontal_ltr=True, vertical_ttb=True,
                                                 extra_attrs=[])
            for word in words_extracted:
                print("==> Word object: {}", word)


def get_pdf_filename(path_to_html: str, document_id: str) -> str:
    path_without_ext, _ = os.path.splitext(path_to_html)
    pdf_output = path_without_ext + '.pdf'
    output_file = "{}-analysis/{}/{}".format(path_without_ext, document_id, pdf_output)
    return output_file


def get_filename(source_path):
    file_name = source_path.split('/')
    return file_name[-1]


def get_pdf(aws_env):
    tmp_pdf, _ = os.path.splitext(get_filename(aws_env['objectName']))
    aws_file = os.path.join(aws_env['bucketName'], aws_env['objectName'])
    tmp_pdf.join(".pdf")
    getter_cmd = "aws s3 cp s3://{} {}".format(aws_file, "./")
    convert_cmd = "xhtml2pdf {} {}".format(get_filename(aws_env['objectName']), tmp_pdf)
    upload_cmd = "aws s3 cp {} s3://textractpipelinestack-outputbucket7114eb27-1taqyye7t644v/tenders/".format(tmp_pdf)
    commands = [
        getter_cmd.split(' '),
        convert_cmd.split(' '),
        upload_cmd.split(' ')
    ]
    processes = [Popen(i) for i in commands]
    for process in processes:
        process.wait()


def lambda_handler(event, context):
    print("event: {}".format(json.dumps(event)))

    print("==> Env: ", os.environ)
    body = json.loads(event['Records'][0]['body'])
    aws_region = event['Records'][0]['awsRegion']
    aws_env = {
        "bucketName": body['bucketName'],
        "objectName": body['objectName'],
        "documentId": body['documentId'],
        "awsRegion": aws_region,
        # "outputTable": os.environ['OUTPUT_TABLE'],
        "outputBucket": os.environ['OUTPUT_BUCKET'],
        "outputName": get_pdf_filename(body['objectName'], body['documentId'])
    }

    # Error return value if open_html_file return 1 ?
    html_str = read_from_s3(aws_env)
    print("html_str: ", html_str)
    convert_html_to_pdf(html_str, aws_env)

    return {
        'statusCode': 200,
        'body': 'All right'
    }
