#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TextractPipelineStack } from '../lib/textract-pipeline-stack';

const app = new cdk.App();
new TextractPipelineStack(app, 'TextractPipelineStack', { env: { account: "669031476932", region: "eu-west-1" }});
