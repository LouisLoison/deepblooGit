#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TextractPipelineStack } from '../lib/textract-pipeline-stack';
import { ApiStack } from '../lib/api-stack';
import { ImportsStepsStack } from '../lib/imports-steps-stack';

const app = new cdk.App();

const apiStack = new ApiStack(app, 'ApiStack', { env: { account: "669031476932", region: "eu-west-1" }});

const textractPipelineStack = new TextractPipelineStack(app, 'TextractPipelineStack', { env: { account: "669031476932", region: "eu-west-1" }});

new ImportsStepsStack(app, 'ImportsStepsStack', {
  env: { account: "669031476932", region:   "eu-west-1" },
  //  nodeLayerArn: textractPipelineStack.nodeLayerArn,
});

new ImportsStepsStack(app, 'StepsStackDevelop', {
  env: { account: "669031476932", region:   "eu-west-1" },
  //  nodeLayerArn: textractPipelineStack.nodeLayerArn,
});