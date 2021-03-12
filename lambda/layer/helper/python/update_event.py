import os


def update_event(source: dict, dest: dict) -> dict:
    """
    Function that takes a source event to update the dest event
    :param source: the event source given to the lambda
    :param dest: the new event that will send to next lambdas
    :return: the new dict
    """
    for key, value in source.items():
        if key in dest.keys() or key == "errorMessage":
            dest[key] = value
    return dest


def get_s3_object_url(document_source: str, extension: str) -> str:
    path_sliced = document_source.split('/')
    base_source = "/".join(path_sliced[0:2])
    _, document_file = os.path.split(document_source)
    document_name, _ = os.path.splitext(document_file)
    new_document_file = document_name + extension
    document_output = os.path.join(base_source, document_name, new_document_file)
    return document_output

def get_s3_url(s3_url: str, extension: str) -> str:
    s3_url_sliced = s3_url.split('/')
    base_s3_url = "https://" + "/".join(s3_url_sliced[2:5])
    _, document_file = os.path.split(s3_url)
    document_name, _ = os.path.splitext(document_file)
    new_document_file = document_name + extension
    s3_document_url = os.path.join(base_s3_url,
                                   document_name,
                                   new_document_file)
    return s3_document_url

def get_filename(object_name: str):
    return os.path.split(object_name)[-1]