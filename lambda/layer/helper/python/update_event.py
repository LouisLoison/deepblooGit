import os


def update_event(source: dict, dest: dict) -> dict:
    """
    Function that takes a source event to update the dest event
    :param source: the event source given to the lambda
    :param dest: the new event that will send to next lambdas
    :return: the new dict
    """
    for key, value in source.items():
        if key in dest.keys():
            dest[key] = value
    return dest


def get_new_s3_url(s3_source: str, new_extension: str) -> str:
    path, ext = os.path.splitext(s3_source)
    return "{}.{}".format(path, new_extension)
