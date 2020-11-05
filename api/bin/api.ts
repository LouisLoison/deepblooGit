#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();
new ApiStack(app, 'ApiStack', { env: { account: "669031476932", region: "eu-west-1" }});
