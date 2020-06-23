#!/bin/bash
set +e

(pipenv --version || pip install pipenv --user) && ( [ -e Pipfile.lock ] || pipenv lock ) && pipenv sync --bare

PIPENV=$(pipenv --venv)/lib/python3.?/site-packages
mkdir -p lambda/pipenv/python

for module in `ls -1 $PIPENV |grep -v 'dist-info$'` ; do
    echo $module
    cp -a $PIPENV/$module lambda/pipenv/python
done

(
  cd lambda/pipenv/python && rm -fr setuptools pip pkg_resources wheel easy_install.py boto3 boto __pycache__
)

