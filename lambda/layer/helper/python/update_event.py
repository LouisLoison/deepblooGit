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

def get_new_s3_url(s3_path: str, new_extension: str, file_name=None) -> str:
    new_path = ""
    if file_name is None:
        new_path, _ = os.path.splitext(s3_path)
        return "{}.{}".format(new_path, new_extension)
    else:
        _, file_name = os.path.split(file_name)
        path, _ = os.path.split(s3_path)
        new_path = os.path.join(path, file_name)
        return new_path

def get_s3_object_url(document_source: str, extension: str) -> str:
    path_sliced = document_source.split('/')
    base_source = "/".join(path_sliced[0:2])
    folder_output, document_file = os.path.split(document_source)
    document_name, _ = os.path.splitext(document_file)
    new_document_file = document_name + extension
    document_output = os.path.join(base_source, document_name, new_document_file)
    return document_output

def get_s3_url(object_name: str) -> str:
    env = os.environ['NODE_ENV']
    domain_name = 'docs.deepbloo.com' if env == 'prod' else 'docs.{}.deepbloo.com'.format(env)
    s3_url = 'https://{}/{}'.format(domain_name, object_name)
    return s3_url.replace('#','%23')

def get_filename(object_name: str):
    return os.path.split(object_name)[-1]
