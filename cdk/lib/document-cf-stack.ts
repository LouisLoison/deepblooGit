import cloudfront = require('@aws-cdk/aws-cloudfront');
// import * as origins from '@aws-cdk/aws-cloudfront-origins';
import s3 = require('@aws-cdk/aws-s3');
import { Construct, Stack, StackProps, CfnOutput } from '@aws-cdk/core';
import { config } from './config';


// Creates a distribution for a S3 bucket.
export class DocumentCfStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const {
      NODE_ENV,
      DOCUMENTS_BUCKET,
      docsCertificateArn,
    } = config

    const documentsBucketArn = `arn:aws:s3:::${DOCUMENTS_BUCKET}`
    const documentsBucket = s3.Bucket.fromBucketArn(this, 'DocumentsBucket', documentsBucketArn);

    const domainName = NODE_ENV === 'prod' ? 'docs.deepbloo.com' : `docs.${NODE_ENV}.deepbloo.com`

    const distrib = new cloudfront.CloudFrontWebDistribution(this, `docsDistrib-${NODE_ENV}`, {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: documentsBucket
          },
          behaviors : [ {isDefaultBehavior: true}]
        }
      ],
      aliasConfiguration: {
        acmCertRef: docsCertificateArn,
        names: [domainName]
      }
    });
    new CfnOutput(this, 'distributionDomainName', { value: distrib.distributionDomainName });
    new CfnOutput(this, 'distributionId', { value: distrib.distributionId });
  }
}
