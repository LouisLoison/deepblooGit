import { CloudFrontWebDistribution, OriginAccessIdentity } from '@aws-cdk/aws-cloudfront';
import { Bucket } from '@aws-cdk/aws-s3';
import { Construct, Stack, StackProps, CfnOutput } from '@aws-cdk/core';
import { config } from './config';


// Creates a distribution for a S3 bucket.
export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const {
      NODE_ENV,
      frontCertificateArn,
    } = config

    const frontBucket = new Bucket(this, `frontBucket-${NODE_ENV}`, {
      versioned: false,
      bucketName: `front.${NODE_ENV}.deepbloo.com`,
      websiteIndexDocument:  'index.html',
    });

    const dnsName = NODE_ENV === 'prod' ? 'app.deepbloo.com' : `app.${NODE_ENV}.deepbloo.com`

    const frontIdentity = new OriginAccessIdentity(this, `frontIdentity-${NODE_ENV}`, {
      comment: `CDK ${NODE_ENV} Frontend Access Identity`,
    });
    frontBucket.grantRead(frontIdentity)

    const distrib = new CloudFrontWebDistribution(this, `frontDistrib-${NODE_ENV}`, {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: frontBucket
          },
          behaviors : [ {isDefaultBehavior: true}]
        }
      ],
      aliasConfiguration: {
        acmCertRef: frontCertificateArn,
        names: [dnsName]
      }
    });
    new CfnOutput(this, 'distributionDomainName', { value: distrib.distributionDomainName });
    new CfnOutput(this, 'distributionId', { value: distrib.distributionId });
  }
}
