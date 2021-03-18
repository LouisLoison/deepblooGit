#!/bin/bash
set -e
# . $(echo `which $0`|sed "s/`basename $0`$//")common.sh

TOPLEVEL=`git rev-parse --show-toplevel`
pushd $TOPLEVEL/front

DNS_NAME=front.$NODE_ENV.deepbloo.com
# [ $ENV = 'prod' ] && DNS_NAME=www.deepbloo.com

# log_report "[+] Uploading frontend $DNS_NAME"

for FILE in dist/js/*.js ; do [ -e $FILE ] && (gzip -t $FILE >/dev/null 2>&1 || (gzip -9 $FILE ; mv $FILE.gz $FILE )); done

aws s3 sync dist/ s3://$DNS_NAME --exclude "*.js" --cache-control 'no-cache, no-store, must-revalidate' --metadata-directive REPLACE --no-progress;

(
 cd dist/js
 for FILE in *.js
 do
   if [ -e $FILE ]
   then
     aws s3api put-object --key js/$FILE --body $FILE --bucket $DNS_NAME \
       --cache-control 'no-cache, no-store, must-revalidate'  \
       --content-encoding gzip --content-type application/javascript\
       --metadata Content-Encoding=gzip,Content-Type=application/javascript
   fi
 done
)

[ $NODE_ENV = 'prod' ] && DNS_NAME=app.deepbloo.com
echo [+] Invalidating $DNS_NAME
aws cloudfront list-distributions \
            | jq -r '.DistributionList.Items[] | select(.Origins.Items[].DomainName=="'$DNS_NAME'") | .Id' \
            | xargs -I {} aws cloudfront create-invalidation \
            --distribution-id {} --paths '/*';

popd
