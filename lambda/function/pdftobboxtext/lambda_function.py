import json
import os
import pdfplumber
import simplejson

from PdfToBbox import Pdf
from helper import AwsHelper, S3Helper
from update_event import update_event, get_s3_object_url, get_s3_url, get_filename


def send_message(client, qUrl, json_message) -> None:
    message = json.dumps(json_message)
    client.send_message(QueueUrl=qUrl, MessageBody=message)
    print("Message to queue: {}".format(qUrl))
    print("Submitted message to queue: {}".format(message))


def send_to_textract(tmp_event: dict):
    json_message = {
        "bucketName": tmp_event["outputBucket"],
        "objectName": tmp_event['objectName'],
        "awsRegion": tmp_event["awsRegion"]
    }
    client = AwsHelper().getClient('sqs', awsRegion=tmp_event["awsRegion"])
    qUrl = tmp_event['textractQueueUrl']
    send_message(client, qUrl, json_message)

def write_bbox_to_s3(tmp_event: dict) -> None:
    with open(tmp_event['tmpJsonOutput'], "r") as file:
        content = file.read()
        S3Helper.writeToS3(content, tmp_event['outputBucket'], tmp_event['outputNameJson'], tmp_event['awsRegion'])
    with open(tmp_event['tmpTxtOutput'], "r") as file:
        content = file.read()
        S3Helper.writeToS3(content, tmp_event['outputBucket'], tmp_event['outputNameTxt'], tmp_event['awsRegion'])


def execute_pdf_to_bbox(pdf_tmp_path: str, bbox_output: str, output_format="json", output_type="line") -> bool:
    """
    Execute the pdfplumber binary with pdf_tmp_path to extract bounding boxes.
    :param pdf_tmp_path: the tmp path of the pdf to pass to pdfplumber
    :param bbox_output: the tmp file of the json to create and to stock pdf information
    :return: int
    """
    with pdfplumber.open(pdf_tmp_path) as pdf_file:
        page_pdf = []
        if os.path.isfile(bbox_output):
            os.remove(bbox_output)
        with open(bbox_output, "w") as json_file:
            for page in pdf_file.pages:
                page_pdf.append({
                    "page_number": page.page_number,
                    "page_content": page.extract_words(x_tolerance=3, y_tolerance=3, keep_blank_chars=False,
                                                       use_text_flow=False, horizontal_ltr=True, vertical_ttb=True,
                                                       extra_attrs=[])
                })
            json_pretty_content = simplejson.dumps(page_pdf, indent=4)
            json_file.write(json_pretty_content)
    return False


def is_pdf_has_enough_characters(pdf_path, min_char_required) -> bool:
    message = "PDF content warning:"
    with pdfplumber.open(pdf_path) as pdf_content:
        images = pdf_content.images
        image_nb = len(images)
        if image_nb != 0:
            print("{} {} image(s) detected !".format(message, image_nb))
            return False
        for page in pdf_content.pages:
            nb_char_in_page = len(page.chars)
            if nb_char_in_page < min_char_required:
                print("{} page with {} characters but need {} characters !".format(message, nb_char_in_page, min_char_required))
                return False
    return True


def copy_pdf_to_tmp(tmp_folder: str, tmp_event: dict) -> str:
    pdf_content = S3Helper.readBytesFromS3(tmp_event['bucketName'], tmp_event['objectName'], tmp_event['awsRegion'])
    pdf_tmp = "tmp_0.pdf"
    index = 0
    if os.path.isdir(tmp_folder) is True:
        AwsHelper.refreshTmpFolder(tmp_folder)
    os.makedirs(tmp_folder)
    for _ in os.listdir(tmp_folder):
        if os.path.isfile(os.path.join(tmp_folder, pdf_tmp)) is False:
            break
        pdf_tmp = "tmp_{0}.pdf".format(index)
        index += 1
    pdf_tmp = os.path.join(tmp_folder, pdf_tmp)
    with open(pdf_tmp, "wb") as tmp_file:
        tmp_file.write(pdf_content)
    print("Copy {0} to {1}".format(tmp_event["objectName"], pdf_tmp))
    return pdf_tmp


def lambda_handler(event, context):
    if event['status'] <= 0:
      return { **event, "errorMessage": "Status isnt positive" }
    tmp_event = {
        **event,
        "bucketName": os.environ.get('DOCUMENTS_BUCKET'),
        "awsRegion": 'eu-west-1',
        "tmpJsonOutput": "/tmp/tmp_result.json",
        "tmpTxtOutput": "/tmp/tmp_result.txt",
        "outputBucket": os.environ.get('DOCUMENTS_BUCKET'),
        "outputNameJson": get_s3_object_url(event['objectName'], ".json"),
        "outputNameTxt": get_s3_object_url(event['objectName'], ".txt"),
        "textractOnly": os.environ.get('TEXTRACT_ONLY'),
        "minCharNeeded": int(os.environ.get('MIN_CHAR_NEEDED')),
        "extract_pdf_lines": os.environ.get('EXTRACT_PDF_LINES'),
    }
    status =  1
    extract_pdf_lines = tmp_event['extract_pdf_lines']
    textract_only = tmp_event['textractOnly']
    tmp_folder = "/tmp/pdfToBbox"
    pdf_tmp_path = copy_pdf_to_tmp(tmp_folder, tmp_event)

    print("==> tmp_event: ", tmp_event)
    if textract_only == "false" and is_pdf_has_enough_characters(pdf_tmp_path, tmp_event['minCharNeeded']) is True:
        print("=> Extracting bounding box with pdfplumber")
        if extract_pdf_lines == "true":
            print("=> Extracting pdf lines bbox")
            pdf = Pdf(pdf_tmp_path, tmp_event['tmpJsonOutput'], tmp_event['tmpTxtOutput'])
            pdf.parse_pdf()
            pdf.save_in_json()
            pdf.save_in_txt()
            write_bbox_to_s3(tmp_event)
        else:
            print("=> Extracting pdf words bbox")
            if execute_pdf_to_bbox(pdf_tmp_path, tmp_event['tmpJsonOutput']):
                print("=> Error while trying to get pdf information")
                tmp_event["status"] = -1
                tmp_event["errorMessage"] = "PDF format not supported."
            else:
                write_bbox_to_s3(tmp_event)
    else:
        print("Extracting bounding box with textract")
        #send_to_textract(tmp_event)
    tmp_event['size'] = S3Helper.getS3FileSize(tmp_event['bucketName'],
                                             tmp_event['outputNameTxt'],
                                             tmp_event['awsRegion'])
    tmp_event["s3Url"] = get_s3_url(tmp_event['outputNameTxt'])
    tmp_event["status"] = status
    tmp_event["errorMessage"] = None
    tmp_event["contentType"] = "text/txt"
    tmp_event['objectName'] = tmp_event['outputNameTxt']
    tmp_event["filename"] = get_filename(tmp_event['objectName'])
    tmp_event["sourceUrl"] = tmp_event["s3Url"]
    AwsHelper.refreshTmpFolder(tmp_folder)
    return update_event(tmp_event, event)
