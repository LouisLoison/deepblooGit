import cloudfront = require('@aws-cdk/aws-cloudfront');
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import s3 = require('@aws-cdk/aws-s3');
import { Construct, Stack, StackProps } from '@aws-cdk/core';


// Creates a distribution for a S3 bucket.
export class CloudFrontStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    const documentsBucketArn = 'arn:aws:s3:::textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj'
    const documentsBucket = s3.Bucket.fromBucketArn(this, 'DocumentsBucket', documentsBucketArn);
    const documentBucketOrigin = new origins.S3Origin(documentsBucket);

    new cloudfront.Distribution(this, 'DocumentStorageAccess', {
      defaultBehavior: {
        origin: documentBucketOrigin,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      },
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019
    });
  }
}
