import pytest
import os
import sys


def initialize_common_env():
    os.environ[
        'DOCUMENTS_BUCKET'] = "textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj"


def get_common_lambda_layers_path():
    layer_path = "lambda/layer/helper/python"
    return layer_path


@pytest.fixture(scope="session", autouse=True)
def init_lambda_env():
    initialize_common_env()
    layer_path = get_common_lambda_layers_path()
    pwd = os.getcwd()
    print("PWD => {}".format(pwd))
    sys.path.append(os.path.join(pwd, layer_path))
