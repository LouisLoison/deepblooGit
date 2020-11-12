echo "Copying lambda functions..."
mkdir build
mkdir -p ../lambda/layer/helper/python
cp -au helper.py ../lambda/layer/helper/python/helper.py
cp -au datastore.py ../lambda/layer/helper/python/datastore.py
cp -au esindex.py ../lambda/layer/helper/python/esindex.py

mkdir -p ../lambda/function/s3processor
cp -au s3proc.py ../lambda/function/s3processor/lambda_function.py

mkdir -p ../lambda/function/s3batchprocessor
cp -au s3batchproc.py ../lambda/function/s3batchprocessor/lambda_function.py

mkdir -p ../lambda/function/documentprocessor
cp -au docproc.py ../lambda/function/documentprocessor/lambda_function.py

mkdir -p ../lambda/function/syncprocessor
cp -au syncproc.py ../lambda/function/syncprocessor/lambda_function.py

mkdir -p ../lambda/function/asyncprocessor
cp -au asyncproc.py ../lambda/function/asyncprocessor/lambda_function.py

mkdir -p ../lambda/function/jobresultprocessor
cp -au jobresultsproc.py ../lambda/function/jobresultprocessor/lambda_function.py

mkdir -p ../lambda/function/elasticindexer
cp -au esindex.py ../lambda/function/elasticindexer/lambda_function.py

mkdir -p ../lambda/function/htmltoboundingbox
cp -au htmltoboundingbox.py ../lambda/function/htmltoboundingbox/lambda_function.py

mkdir -p ../lambda/function/appsearchindexer
cp -au appsearchindex.js ../lambda/function/appsearchindexer/index.js

mkdir -p ../lambda/function/pdftoimg
cp -au pdftoimg.js ../lambda/function/pdftoimg/index.js

mkdir -p ../lambda/layer/textractor/python
cp -au trp.py ../lambda/layer/textractor/python/trp.py
cp -au og.py ../lambda/layer/textractor/python/og.py


echo "Done!"
