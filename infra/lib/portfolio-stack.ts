import { Aws, CfnOutput, Duration, Stack, type StackProps } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as sns from 'aws-cdk-lib/aws-sns';
import type { Construct } from 'constructs';

export interface PortfolioStackProps extends StackProps {
  readonly customDomain?: {
    readonly certificateArn: string;
    readonly domainName: string;
  };
  readonly githubRepository?: string;
  readonly sitePath?: string;
}

export class PortfolioStack extends Stack {
  readonly siteBucket: s3.Bucket;
  readonly accessLogBucket: s3.Bucket;
  readonly distribution: cloudfront.Distribution;
  readonly operationsAlerts: sns.Topic;

  constructor(scope: Construct, id: string, props?: PortfolioStackProps) {
    super(scope, id, props);

    const certificate = props?.customDomain
      ? acm.Certificate.fromCertificateArn(
          this,
          'PortfolioCertificate',
          props.customDomain.certificateArn,
        )
      : undefined;

    this.siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
    });

    this.accessLogBucket = new s3.Bucket(this, 'AccessLogBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      lifecycleRules: [{ expiration: Duration.days(30) }],
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
    });

    const securityHeaders = new cloudfront.ResponseHeadersPolicy(
      this,
      'SecurityHeadersPolicy',
      {
        securityHeadersBehavior: {
          contentSecurityPolicy: {
            contentSecurityPolicy:
              "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; object-src 'none'; upgrade-insecure-requests",
            override: true,
          },
          contentTypeOptions: { override: true },
          frameOptions: {
            frameOption: cloudfront.HeadersFrameOption.DENY,
            override: true,
          },
          referrerPolicy: {
            referrerPolicy:
              cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
            override: true,
          },
          strictTransportSecurity: {
            accessControlMaxAge: Duration.days(365),
            includeSubdomains: true,
            override: true,
          },
        },
      },
    );

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      certificate,
      defaultRootObject: 'index.html',
      domainNames: props?.customDomain ? [props.customDomain.domainName] : undefined,
      enableLogging: true,
      logBucket: this.accessLogBucket,
      logFilePrefix: 'cloudfront/',
      logIncludesCookies: false,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.siteBucket),
        responseHeadersPolicy: securityHeaders,
        viewerProtocolPolicy:
          cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      ...(certificate
        ? {
            minimumProtocolVersion:
              cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
          }
        : {}),
    });

    this.operationsAlerts = new sns.Topic(this, 'OperationsAlerts');

    new cloudwatch.Alarm(this, 'CloudFront5xxErrorRate', {
      alarmDescription:
        'CloudFront returned 5xx errors for the Portfolio Site. Investigate the distribution and S3 origin.',
      comparisonOperator:
        cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      evaluationPeriods: 1,
      metric: this.distribution.metric5xxErrorRate({
        period: Duration.minutes(1),
        statistic: 'Average',
      }),
      threshold: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatchActions.SnsAction(this.operationsAlerts));

    new CfnOutput(this, 'DistributionDomainName', {
      description: 'Use this hostname as the DNS target after validating the distribution.',
      value: this.distribution.distributionDomainName,
    });

    new CfnOutput(this, 'OperationsAlertsTopicArn', {
      description: 'Subscribe an approved operations recipient to this topic.',
      value: this.operationsAlerts.topicArn,
    });

    if (props?.githubRepository) {
      const githubOidcProvider = new iam.OpenIdConnectProvider(
        this,
        'GitHubActionsOidcProvider',
        {
          url: 'https://token.actions.githubusercontent.com',
          clientIds: ['sts.amazonaws.com'],
        },
      );

      const githubActionsDeployRole = new iam.Role(
        this,
        'GitHubActionsDeployRole',
        {
          assumedBy: new iam.WebIdentityPrincipal(
            githubOidcProvider.openIdConnectProviderArn,
            {
              StringEquals: {
                'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
                'token.actions.githubusercontent.com:sub': `repo:${props.githubRepository}:ref:refs/heads/main`,
              },
            },
          ),
          description:
            'Allows GitHub Actions on the main branch to deploy the portfolio through CDK bootstrap roles.',
        },
      );

      githubActionsDeployRole.addToPolicy(
        new iam.PolicyStatement({
          actions: ['sts:AssumeRole'],
          resources: [
            `arn:${Aws.PARTITION}:iam::${Aws.ACCOUNT_ID}:role/cdk-hnb659fds-*-role-${Aws.ACCOUNT_ID}-${Aws.REGION}`,
          ],
        }),
      );
      githubActionsDeployRole.addToPolicy(
        new iam.PolicyStatement({
          actions: ['ssm:GetParameter'],
          resources: [
            `arn:${Aws.PARTITION}:ssm:us-east-1:${Aws.ACCOUNT_ID}:parameter/cdk-bootstrap/hnb659fds/version`,
          ],
        }),
      );

      new CfnOutput(this, 'GitHubActionsDeployRoleArn', {
        description: 'Set this ARN as the AWS_DEPLOY_ROLE_ARN GitHub repository variable.',
        value: githubActionsDeployRole.roleArn,
      });
    }

    if (props?.sitePath) {
      const siteDeployment = new s3deploy.BucketDeployment(this, 'DeploySite', {
        sources: [s3deploy.Source.asset(props.sitePath)],
        destinationBucket: this.siteBucket,
        prune: true,
        retainOnDelete: false,
        cacheControl: [
          s3deploy.CacheControl.noCache(),
          s3deploy.CacheControl.mustRevalidate(),
        ],
      });

      const assetDeployment = new s3deploy.BucketDeployment(this, 'DeployAssets', {
        sources: [s3deploy.Source.asset(props.sitePath, { exclude: ['index.html'] })],
        destinationBucket: this.siteBucket,
        prune: false,
        retainOnDelete: false,
        cacheControl: [
          s3deploy.CacheControl.maxAge(Duration.days(365)),
          s3deploy.CacheControl.setPublic(),
          s3deploy.CacheControl.immutable(),
        ],
      });

      assetDeployment.node.addDependency(siteDeployment);
    }
  }
}
