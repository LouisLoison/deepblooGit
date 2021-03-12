#!/usr/bin/env node
import 'source-map-support/register';
import { App }  from '@aws-cdk/core';
import { TextractPipelineStack } from '../lib/textract-pipeline-stack';
import { ApiStack } from '../lib/api-stack';
import { TenderStack } from '../lib/tender-stack';
import { DocumentStack } from '../lib/document-stack';
import { AuroraDbStack } from '../lib/auroradb-stack';
// import { CloudFrontStack } from '../lib/cloud-front-stack';

const app = new App();

const apiStack = new ApiStack(app, 'ApiStack', { env: { account: "669031476932", region: "eu-west-1" }});

const textractPipelineStack = new TextractPipelineStack(app, 'TextractPipelineStack', { env: { account: "669031476932", region: "eu-west-1" }});

// const cloudFrontStack = new CloudFrontStack(app, 'DocumentAccessStack', { env: { account: "669031476932", region: "eu-west-1" }});

/*
const auroraDbStack = new AuroraDbStack(app, 'AuroraPostgresStack', {
  env: { account: "669031476932", region: "eu-west-1"}
  })
*/

const documentStack = new DocumentStack(app, 'DocumentStack', {
  env: { account: "669031476932", region:   "eu-west-1" },
});

new TenderStack(app, 'TenderStack', {
  env: { account: "669031476932", region: "eu-west-1" },
  documentMachine: documentStack.documentMachine,
  //  nodeLayerArn: textractPipelineStack.nodeLayerArn,
});
