import json
import os
import spacy
from helper import S3Helper


def get_file_content(aws_env: dict):
    return S3Helper.readFromS3(aws_env['bucketName'], aws_env['objectName'],
                        aws_env['awsRegion'])


def spacy_sentences_extraction(content: str, aws_env: dict):
    excluded_pipeline = ["tagger", "ner", "textcat", "parser"]
    sentence_content = ""

    nlp = spacy.load("xx_ent_wiki_sm", disable=excluded_pipeline)
    nlp.add_pipe(nlp.create_pipe('sentencizer'))
    doc = nlp(content)
    print("Pipelines names: ", nlp.pipe_names)
    for sent in doc.sents:
        sentence = sent.text.replace('\n', ' ')
        sentence_content += "=> {}\n".format(sentence.strip())
    S3Helper.writeToS3(sentence_content, aws_env['outputBucket'],
                       aws_env['outputNameTxt'], aws_env['awsRegion'])


def get_s3_path(path_s3_txt: str) -> str:
    folder_output, pdf_output = os.path.split(path_s3_txt)
    file_name, ext = os.path.splitext(pdf_output)
    txt_file = "sentences_of_{}.txt".format(file_name)
    txt_output = os.path.join(folder_output, txt_file)
    return txt_output


def lambda_handler(event, context):
    print("==> Event: {0}".format(json.dumps(event)))
    aws_env = {
        "bucketName": os.environ['DOCUMENTS_BUCKET'],
        "objectName": event['objectName'],
        "documentId": event['documentUuid'],
        "awsRegion": 'eu-west-1',
        "tmpOutput": "/tmp/tmp_sentences.txt",
        "outputBucket": os.environ['DOCUMENTS_BUCKET'],
        "outputNameTxt": get_s3_path(event['objectName']),
    }
    content = get_file_content(aws_env)
    spacy_sentences_extraction(content, aws_env)
    print("==> Aws env: {0}".format(json.dumps(aws_env)))
    status = {
        'statusCode': 200,
        'body': 'All right'
    }
    return { **event, 'status': status }
