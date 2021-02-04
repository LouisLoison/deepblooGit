import json
import os
import spacy
from helper import S3Helper
from update_event import update_event, get_new_s3_url


def get_file_content(aws_env: dict):
    name_path_s3, _ = os.path.splitext(aws_env["objectName"])
    txt_path_s3 = name_path_s3 + ".txt"
    return S3Helper.readFromS3(aws_env['bucketName'], txt_path_s3,
                        aws_env['awsRegion'])


def spacy_sentences_extraction(content: str, aws_env: dict):
    excluded_pipeline = ["tagger", "ner", "textcat", "parser"]
    model_path = "/opt/python/xx_ent_wiki_sm/xx_ent_wiki_sm-2.3.0"
    sentence_content = ""

    if os.path.isdir(model_path) is False:
        model_path = "xx_ent_wiki_sm"
    nlp = spacy.load(model_path, disable=excluded_pipeline)
    nlp.add_pipe(nlp.create_pipe('sentencizer'))
    doc = nlp(content)
    print("Pipelines names: ", nlp.pipe_names)
    for sent in doc.sents:
        sentence = sent.text.replace('\n', ' ')
        sentence_content += "{}\n".format(sentence.strip())
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
        **event,
        "bucketName": os.environ['DOCUMENTS_BUCKET'],
        "awsRegion": 'eu-west-1',
        "tmpOutput": "/tmp/tmp_sentences.txt",
        "outputBucket": os.environ['DOCUMENTS_BUCKET'],
        "outputNameTxt": get_s3_path(event['objectName']),
    }
    content = get_file_content(aws_env)
    spacy_sentences_extraction(content, aws_env)
    print("==> Aws env: {0}".format(json.dumps(aws_env)))
    aws_env['status'] = 0
    aws_env['errorMessage'] = None
    aws_env["s3Url"] = get_new_s3_url(aws_env['s3Url'], "txt", aws_env['outputNameTxt'])
    aws_env["contentType"] = "text/txt"
    aws_env['objectName'] = aws_env['outputNameTxt']
    print("====> NEW PATH: ", aws_env['objectName'])
    return update_event(aws_env, event)
