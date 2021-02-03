mkdir -p lambda/layer/pipenv/python
cd lambda/layer/pipenv

# To download the model needed by spacy if not installed
pipenv run python -m spacy download xx_ent_wiki_sm

(pipenv --version || pip3 install pipenv --user || pip install pipenv --user) && ( [ -e Pipfile.lock ] || pipenv lock ) && pipenv sync --bare

PIPENV=$(pipenv --venv)/lib/python3.8/site-packages

mkdir bin 2>/dev/null

pwd
cp -a $(pipenv --venv)/bin/* bin

rm $(find bin/ -type l) 

for module in `ls -1 $PIPENV |grep -v 'dist-info$'` ; do
    # echo $module
    cp -a $PIPENV/$module python
done

(
  cd python && rm -fr setuptools pip pkg_resources wheel easy_install.py boto3 boto __pycache__
)

