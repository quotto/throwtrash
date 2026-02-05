import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface CloudFrontStackConfig {
  stage: string;
  domainName: string;
  certificateArn: string;
  frontendBucketName: string;
  backendApiDomain: string;
  mobileApiDomain: string;
  alarmApiDomain: string;
}

export class ThrowtrashCloudFrontStack extends cdk.Stack {
  public readonly distributionId: string;

  constructor(scope: Construct, id: string, config: CloudFrontStackConfig, props?: cdk.StackProps) {
    super(scope, id, props);

    cdk.Tags.of(this).add('app', 'throwtrash');

    const frontendBucket = s3.Bucket.fromBucketName(
      this,
      'FrontendBucket',
      config.frontendBucketName
    );

    const frontendCachePolicy = new cloudfront.CachePolicy(this, 'FrontendCachePolicy', {
      cachePolicyName: `throwtrash-frontend-${config.stage}`,
      defaultTtl: Duration.seconds(3600),
      maxTtl: Duration.seconds(3600),
      minTtl: Duration.seconds(3600),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      enableAcceptEncodingBrotli: true,
      enableAcceptEncodingGzip: true
    });

    const apiOriginRequestPolicy = cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER;

    const apiCachePolicyId = cloudfront.CachePolicy.CACHING_DISABLED.cachePolicyId;

    const frontendOac = this.createOriginAccessControl('FrontendOac');
    const pathRewriteFunction = new cloudfront.Function(this, 'PathRewriteFunction', {
      functionName: `throwtrash-path-rewrite-${config.stage}`,
      code: cloudfront.FunctionCode.fromInline(`function handler(event) {
  var request = event.request;
  if (request.uri === '/backend' || request.uri.indexOf('/backend/') === 0) {
    request.uri = request.uri.substring('/backend'.length);
    if (request.uri === '') {
      request.uri = '/';
    }
  } else if (request.uri === '/mobile' || request.uri.indexOf('/mobile/') === 0) {
    request.uri = request.uri.substring('/mobile'.length);
    if (request.uri === '') {
      request.uri = '/';
    }
  } else if (request.uri === '/alarm' || request.uri.indexOf('/alarm/') === 0) {
    request.uri = request.uri.substring('/alarm'.length);
    if (request.uri === '') {
      request.uri = '/';
    }
  } else if (request.uri.endsWith('/')) {
    request.uri += 'index.html';
  } else {
    request.uri.replace('/?','/index.html?');
  }
  return request;
}`)
    });

    const baseDistributionConfig = this.buildDistributionConfig({
      config,
      frontendCachePolicyId: frontendCachePolicy.cachePolicyId,
      apiOriginRequestPolicyId: apiOriginRequestPolicy.originRequestPolicyId,
      apiCachePolicyId,
      frontendBucket,
      frontendOriginAccessControlId: frontendOac.attrId,
      includeAliases: true,
      pathRewriteFunctionArn: pathRewriteFunction.functionArn
    });

    const distribution = new cloudfront.CfnDistribution(this, 'Distribution', {
      distributionConfig: baseDistributionConfig
    });
    this.distributionId = distribution.ref;

    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distributionId
    });
  }

  private buildDistributionConfig(params: {
    config: CloudFrontStackConfig;
    frontendCachePolicyId: string;
    apiOriginRequestPolicyId: string;
    apiCachePolicyId: string;
    frontendBucket: s3.IBucket;
    frontendOriginAccessControlId: string;
    includeAliases: boolean;
    pathRewriteFunctionArn: string;
  }): cloudfront.CfnDistribution.DistributionConfigProperty {
    const frontendOriginId = 'FrontendOrigin';
    const backendOriginId = 'BackendApiOrigin';
    const mobileOriginId = 'MobileApiOrigin';
    const alarmOriginId = 'AlarmApiOrigin';

    const origins: cloudfront.CfnDistribution.OriginProperty[] = [
      {
        id: frontendOriginId,
        domainName: params.frontendBucket.bucketDomainName,
        s3OriginConfig: {},
        originAccessControlId: params.frontendOriginAccessControlId
      },
      {
        id: backendOriginId,
        domainName: params.config.backendApiDomain,
        customOriginConfig: {
          originProtocolPolicy: 'https-only',
          originSslProtocols: ['TLSv1.2']
        }
      },
      {
        id: mobileOriginId,
        domainName: params.config.mobileApiDomain,
        customOriginConfig: {
          originProtocolPolicy: 'https-only',
          originSslProtocols: ['TLSv1.2']
        }
      }
    ];

    const defaultCacheBehavior: cloudfront.CfnDistribution.DefaultCacheBehaviorProperty = {
      targetOriginId: frontendOriginId,
      viewerProtocolPolicy: 'redirect-to-https',
      allowedMethods: ['GET', 'HEAD'],
      cachedMethods: ['GET', 'HEAD'],
      cachePolicyId: params.frontendCachePolicyId,
      compress: true,
      functionAssociations: [
        {
          eventType: 'viewer-request',
          functionArn: params.pathRewriteFunctionArn
        }
      ]
    };

    const cacheBehaviors: cloudfront.CfnDistribution.CacheBehaviorProperty[] = [
      {
        pathPattern: '/backend/*',
        targetOriginId: backendOriginId,
        viewerProtocolPolicy: 'redirect-to-https',
        allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
        cachedMethods: ['GET', 'HEAD'],
        cachePolicyId: params.apiCachePolicyId,
        originRequestPolicyId: params.apiOriginRequestPolicyId,
        compress: true,
        functionAssociations: [
          {
            eventType: 'viewer-request',
            functionArn: params.pathRewriteFunctionArn
          }
        ]
      },
      {
        pathPattern: '/mobile/*',
        targetOriginId: mobileOriginId,
        viewerProtocolPolicy: 'redirect-to-https',
        allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
        cachedMethods: ['GET', 'HEAD'],
        cachePolicyId: params.apiCachePolicyId,
        originRequestPolicyId: params.apiOriginRequestPolicyId,
        compress: true,
        functionAssociations: [
          {
            eventType: 'viewer-request',
            functionArn: params.pathRewriteFunctionArn
          }
        ]
      },{
        pathPattern: '/alarm/*',
        targetOriginId: alarmOriginId,
        viewerProtocolPolicy: 'redirect-to-https',
        allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
        cachedMethods: ['GET', 'HEAD'],
        cachePolicyId: params.apiCachePolicyId,
        originRequestPolicyId: params.apiOriginRequestPolicyId,
        compress: true,
        functionAssociations: [
          {
            eventType: 'viewer-request',
            functionArn: params.pathRewriteFunctionArn
          }
        ]
      }
    ];

    const viewerCertificate = params.includeAliases
      ? {
          acmCertificateArn: params.config.certificateArn,
          sslSupportMethod: 'sni-only',
          minimumProtocolVersion: 'TLSv1.2_2021'
        }
      : undefined;

    return {
      enabled: true,
      comment: `throwtrash-${params.config.stage}`,
      defaultRootObject: 'index.html',
      aliases: params.includeAliases ? [params.config.domainName] : undefined,
      origins,
      defaultCacheBehavior,
      cacheBehaviors,
      priceClass: 'PriceClass_200',
      viewerCertificate
    };
  }

  private createOriginAccessControl(id: string): cloudfront.CfnOriginAccessControl {
    return new cloudfront.CfnOriginAccessControl(this, id, {
      originAccessControlConfig: {
        name: `${this.stackName}-${id}`,
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4'
      }
    });
  }

}
