echo "Copying lambda functions..."
mkdir -p ../textract-pipeline/lambda/helper/python
cp -au helper.py ../textract-pipeline/lambda/helper/python/helper.py
cp -au datastore.py ../textract-pipeline/lambda/helper/python/datastore.py
cp -au esindex.py ../textract-pipeline/lambda/helper/python/esindex.py

mkdir -p ../textract-pipeline/lambda/s3processor
cp -au s3proc.py ../textract-pipeline/lambda/s3processor/lambda_function.py

mkdir -p ../textract-pipeline/lambda/s3batchprocessor
cp -au s3batchproc.py ../textract-pipeline/lambda/s3batchprocessor/lambda_function.py

mkdir -p ../textract-pipeline/lambda/documentprocessor
cp -au docproc.py ../textract-pipeline/lambda/documentprocessor/lambda_function.py

mkdir -p ../textract-pipeline/lambda/syncprocessor
cp -au syncproc.py ../textract-pipeline/lambda/syncprocessor/lambda_function.py

mkdir -p ../textract-pipeline/lambda/asyncprocessor
cp -au asyncproc.py ../textract-pipeline/lambda/asyncprocessor/lambda_function.py

mkdir -p ../textract-pipeline/lambda/jobresultprocessor
cp -au jobresultsproc.py ../textract-pipeline/lambda/jobresultprocessor/lambda_function.py

mkdir -p ../textract-pipeline/lambda/elasticindexer
cp -au esindex.py ../textract-pipeline/lambda/elasticindexer/lambda_function.py

mkdir -p ../textract-pipeline/lambda/appsearchindexer
cp -au appsearchindex.js ../textract-pipeline/lambda/appsearchindexer/index.js

mkdir -p ../textract-pipeline/lambda/pdftoimg
cp -au pdftoimg.js ../textract-pipeline/lambda/pdftoimg/index.js

mkdir -p ../textract-pipeline/lambda/textractor/python
cp -au trp.py ../textract-pipeline/lambda/textractor/python/trp.py
cp -au og.py ../textract-pipeline/lambda/textractor/python/og.py


echo "Done!"
