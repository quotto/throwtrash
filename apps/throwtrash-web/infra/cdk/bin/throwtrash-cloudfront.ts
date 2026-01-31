#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { ThrowtrashCloudFrontStack, CloudFrontStackConfig } from '../lib/cloudfront-stack';

const app = new cdk.App();

const stage = app.node.tryGetContext('stage')
if (!stage) {
  throw new Error('stage is required. Use --context stage=dev or set STAGE.');
}

dotenv.config({ override: false });

const requiredEnv = [
  'CF_DOMAIN_NAME',
  'CF_CERT_ARN',
  'CF_FRONTEND_BUCKET',
  'CF_BACKEND_API_DOMAIN',
  'CF_MOBILE_API_DOMAIN'
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  throw new Error(`Missing required env: ${missingEnv.join(', ')}`);
}

const config: CloudFrontStackConfig = {
  stage: process.env.CF_STAGE || stage,
  domainName: process.env.CF_DOMAIN_NAME as string,
  certificateArn: process.env.CF_CERT_ARN as string,
  frontendBucketName: process.env.CF_FRONTEND_BUCKET as string,
  backendApiDomain: process.env.CF_BACKEND_API_DOMAIN as string,
  mobileApiDomain: process.env.CF_MOBILE_API_DOMAIN as string
};

new ThrowtrashCloudFrontStack(app, `throwtrash-cloudfront-${stage}`, config, {
  description: `throwtrash CloudFront reverse proxy (${stage})`,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1'
  }
});
