mkdir -p lambda/layer/pipenv/python
cd lambda/layer/pipenv

(pipenv --version || pip install pipenv --user) && ( [ -e Pipfile.lock ] || pipenv lock ) && pipenv sync --bare

PIPENV=$(pipenv --venv)/lib/python3.8/site-packages

mkdir bin
cp -a $(pipenv --venv)/bin/* bin

for module in `ls -1 $PIPENV |grep -v 'dist-info$'` ; do
    # echo $module
    cp -a $PIPENV/$module python
done

(
  cd python && rm -fr setuptools pip pkg_resources wheel easy_install.py boto3 boto __pycache__
)

