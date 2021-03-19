import json
import os
import spacy
from helper import S3Helper
from update_event import update_event, get_s3_object_url, get_s3_url, get_filename


def get_file_content(tmp_env: dict):
    name_path_s3, _ = os.path.splitext(tmp_env["objectName"])
    txt_path_s3 = name_path_s3 + ".txt"
    return S3Helper.readFromS3(tmp_env['bucketName'], txt_path_s3,
                        tmp_env['awsRegion'])


def spacy_sentences_extraction(content: str, tmp_env: dict):
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
    S3Helper.writeToS3(sentence_content, tmp_env['outputBucket'],
                       tmp_env['outputNameTxt'], tmp_env['awsRegion'])


def lambda_handler(event, context):
    print("==> Event: {0}".format(json.dumps(event)))
    tmp_env = {
        **event,
        "bucketName": os.environ['DOCUMENTS_BUCKET'],
        "awsRegion": 'eu-west-1',
        "tmpOutput": "/tmp/tmp_sentences.txt",
        "outputBucket": os.environ['DOCUMENTS_BUCKET'],
        "outputNameTxt": get_s3_object_url(event['objectName'], "_sentences.txt"),
    }
    content = get_file_content(tmp_env)
    if content is None:
        tmp_env['status'] = -1
        tmp_env['errorMessage'] =\
            "File {0} not found in s3 {1}".format(tmp_env['objectName'],
                                                  tmp_env['bucketName'])
        return update_event(tmp_env, event)
    spacy_sentences_extraction(content, tmp_env)
    print("==> Aws env: {0}".format(json.dumps(tmp_env)))
    tmp_env['status'] = 1
    tmp_env['errorMessage'] = None
    tmp_env["s3Url"] = get_s3_url(tmp_env['outputNameTxt'])
    tmp_env["contentType"] = "text/txt"
    tmp_env['objectName'] = tmp_env['outputNameTxt']
    tmp_env['filename'] = get_filename(tmp_env['objectName'])
    tmp_env['size'] = S3Helper.getS3FileSize(tmp_env['bucketName'],
                                             tmp_env['outputNameTxt'],
                                             tmp_env['awsRegion'])
    tmp_env["sourceUrl"] = tmp_env["s3Url"]
    return update_event(tmp_env, event)
