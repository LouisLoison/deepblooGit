#!/usr/bin/env node
import 'source-map-support/register';
import { App }  from '@aws-cdk/core';
import { TextractPipelineStack } from '../lib/textract-pipeline-stack';
import { ApiStack } from '../lib/api-stack';
import { TenderStack } from '../lib/tender-stack';
import { DocumentStack } from '../lib/document-stack';
import { AuroraDbStack } from '../lib/auroradb-stack';
// import { CloudFrontStack } from '../lib/cloud-front-stack';


import { config } from '../lib/config';

const app = new App();

const { account, region } = config

const env = { account, region }

const apiStack = new ApiStack(app, 'ApiStack', { env });

const textractPipelineStack = new TextractPipelineStack(app, 'TextractPipelineStack', { env });

// const cloudFrontStack = new CloudFrontStack(app, 'DocumentAccessStack', { env: { account: "669031476932", region: "eu-west-1" }});

const auroraDbStack = new AuroraDbStack(app, 'AuroraPostgresStack', {
  env
  })

const documentStack = new DocumentStack(app, 'DocumentStack', {
  env,
});

new TenderStack(app, 'TenderStack', {
  env,
  documentMachine: documentStack.documentMachine,
  //  nodeLayerArn: textractPipelineStack.nodeLayerArn,
});
