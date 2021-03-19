import json
import os
import spacy
from helper import S3Helper
from update_event import update_event, get_s3_object_url, get_s3_url, get_filename


def get_file_content(tmp_event: dict):
    name_path_s3, _ = os.path.splitext(tmp_event["objectName"])
    txt_path_s3 = name_path_s3 + ".txt"
    return S3Helper.readFromS3(tmp_event['bucketName'], txt_path_s3,
                        tmp_event['awsRegion'])


def spacy_sentences_extraction(content: str, tmp_event: dict):
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
    S3Helper.writeToS3(sentence_content, tmp_event['outputBucket'],
                       tmp_event['outputNameTxt'], tmp_event['awsRegion'])


def lambda_handler(event, context):
    print("==> Event: {0}".format(json.dumps(event)))
    tmp_event = {
        **event,
        "bucketName": os.environ['DOCUMENTS_BUCKET'],
        "awsRegion": 'eu-west-1',
        "tmpOutput": "/tmp/tmp_sentences.txt",
        "outputBucket": os.environ['DOCUMENTS_BUCKET'],
        "outputNameTxt": get_s3_object_url(event['objectName'], "_sentences.txt"),
    }
    content = get_file_content(tmp_event)
    if content is None:
        tmp_event['status'] = -1
        tmp_event['errorMessage'] =\
            "File {0} not found in s3 {1}".format(tmp_event['objectName'],
                                                  tmp_event['bucketName'])
        return update_event(tmp_event, event)
    spacy_sentences_extraction(content, tmp_event)
    print("==> Aws env: {0}".format(json.dumps(tmp_event)))
    tmp_event['status'] = 1
    tmp_event['errorMessage'] = None
    tmp_event["s3Url"] = get_s3_url(tmp_event['outputNameTxt'])
    tmp_event["contentType"] = "text/txt"
    tmp_event['objectName'] = tmp_event['outputNameTxt']
    tmp_event['filename'] = get_filename(tmp_event['objectName'])
    tmp_event['size'] = S3Helper.getS3FileSize(tmp_event['bucketName'],
                                             tmp_event['outputNameTxt'],
                                             tmp_event['awsRegion'])
    tmp_event["sourceUrl"] = tmp_event["s3Url"]
    return update_event(tmp_event, event)
