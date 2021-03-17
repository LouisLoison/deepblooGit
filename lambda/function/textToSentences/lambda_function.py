import json
import os
import spacy
from helper import S3Helper
from update_event import update_event, get_s3_object_url, get_s3_url, get_filename


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


def lambda_handler(event, context):
    print("==> Event: {0}".format(json.dumps(event)))
    aws_env = {
        **event,
        "bucketName": os.environ['DOCUMENTS_BUCKET'],
        "awsRegion": 'eu-west-1',
        "tmpOutput": "/tmp/tmp_sentences.txt",
        "outputBucket": os.environ['DOCUMENTS_BUCKET'],
        "outputNameTxt": get_s3_object_url(event['objectName'], "_sentences.txt"),
    }
    content = get_file_content(aws_env)
    if content is None:
        aws_env['status'] = -1
        aws_env['errorMessage'] =\
            "File {0} not found in s3 {1}".format(aws_env['objectName'],
                                                  aws_env['bucketName'])
        return update_event(aws_env, event)
    spacy_sentences_extraction(content, aws_env)
    print("==> Aws env: {0}".format(json.dumps(aws_env)))
    aws_env['status'] = 1
    aws_env['errorMessage'] = None
    aws_env["s3Url"] = get_s3_url(aws_env['outputNameTxt'])
    aws_env["contentType"] = "text/txt"
    aws_env['objectName'] = aws_env['outputNameTxt']
    aws_env['filename'] = get_filename(aws_env['objectName'])
    aws_env['size'] = S3Helper.getS3FileSize(aws_env['bucketName'],
                                             aws_env['outputNameTxt'],
                                             aws_env['awsRegion'])
    aws_env["sourceUrl"] = aws_env["s3Url"]
    return update_event(aws_env, event)
