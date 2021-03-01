import os
from helper import S3Helper


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