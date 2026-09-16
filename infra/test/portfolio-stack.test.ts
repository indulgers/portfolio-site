import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { resolve } from 'node:path';
import { PortfolioStack } from '../lib/portfolio-stack';

const fixtureSitePath = resolve(process.cwd(), 'infra/test/fixtures/site');

test('keeps the portfolio origin private and recoverable', () => {
  const app = new App();
  const stack = new PortfolioStack(app, 'PortfolioStack');
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::S3::Bucket', {
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    },
    VersioningConfiguration: {
      Status: 'Enabled',
    },
  });
});

test('delivers the private origin only through HTTPS CloudFront access', () => {
  const app = new App();
  const stack = new PortfolioStack(app, 'PortfolioStack');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::CloudFront::OriginAccessControl', 1);
  template.hasResourceProperties('AWS::CloudFront::Distribution', {
    DistributionConfig: {
      DefaultRootObject: 'index.html',
      DefaultCacheBehavior: {
        ViewerProtocolPolicy: 'redirect-to-https',
      },
    },
  });
  template.hasResourceProperties('AWS::S3::BucketPolicy', {
    PolicyDocument: {
      Statement: Match.arrayWith([
        Match.objectLike({
          Action: 's3:GetObject',
          Condition: {
            StringEquals: {
              'AWS:SourceArn': Match.anyValue(),
            },
          },
          Effect: 'Allow',
          Principal: {
            Service: 'cloudfront.amazonaws.com',
          },
        }),
      ]),
    },
  });
});

test('applies browser security headers and records cookie-free access logs', () => {
  const app = new App();
  const stack = new PortfolioStack(app, 'PortfolioStack');
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::CloudFront::Distribution', {
    DistributionConfig: {
      Logging: {
        Bucket: Match.anyValue(),
        IncludeCookies: false,
      },
    },
  });
  template.hasResourceProperties('AWS::CloudFront::ResponseHeadersPolicy', {
    ResponseHeadersPolicyConfig: {
      SecurityHeadersConfig: {
        ContentSecurityPolicy: {
          ContentSecurityPolicy:
            "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; object-src 'none'; upgrade-insecure-requests",
          Override: true,
        },
        ContentTypeOptions: {
          Override: true,
        },
        FrameOptions: {
          FrameOption: 'DENY',
          Override: true,
        },
        StrictTransportSecurity: {
          AccessControlMaxAgeSec: 31536000,
          IncludeSubdomains: true,
          Override: true,
        },
      },
    },
  });
  template.hasResourceProperties('AWS::S3::Bucket', {
    OwnershipControls: {
      Rules: [{ ObjectOwnership: 'ObjectWriter' }],
    },
  });
});

test('uses the externally validated certificate for the production domain', () => {
  const app = new App();
  const stack = new PortfolioStack(app, 'PortfolioStack', {
    customDomain: {
      certificateArn:
        'arn:aws:acm:us-east-1:111111111111:certificate/example-certificate',
      domainName: 'indulger.win',
    },
  });
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::CloudFront::Distribution', {
    DistributionConfig: {
      Aliases: ['indulger.win'],
      ViewerCertificate: {
        AcmCertificateArn:
          'arn:aws:acm:us-east-1:111111111111:certificate/example-certificate',
        MinimumProtocolVersion: 'TLSv1.2_2021',
        SslSupportMethod: 'sni-only',
      },
    },
  });
});

test('deploys the static build and gives fingerprinted assets immutable caching', () => {
  const app = new App();
  const stack = new PortfolioStack(app, 'PortfolioStack', {
    sitePath: fixtureSitePath,
  });
  const template = Template.fromStack(stack);

  template.resourceCountIs('Custom::CDKBucketDeployment', 2);
  template.hasResourceProperties('Custom::CDKBucketDeployment', {
    SystemMetadata: {
      'cache-control': 'max-age=31536000, public, immutable',
    },
  });
});

test('raises an operations alarm when CloudFront serves server errors', () => {
  const app = new App();
  const stack = new PortfolioStack(app, 'PortfolioStack');
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::CloudWatch::Alarm', {
    AlarmActions: Match.anyValue(),
    ComparisonOperator: 'GreaterThanThreshold',
    EvaluationPeriods: 1,
    MetricName: '5xxErrorRate',
    Namespace: 'AWS/CloudFront',
    Threshold: 1,
    TreatMissingData: 'notBreaching',
  });
  template.resourceCountIs('AWS::SNS::Topic', 1);
});

test('creates a main-only GitHub OIDC deployment role with constrained permissions', () => {
  const app = new App();
  const stack = new PortfolioStack(app, 'PortfolioStack', {
    githubRepository: 'indulgers/portfolio-site',
  });
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: Match.arrayWith([
        Match.objectLike({
          Action: 'sts:AssumeRoleWithWebIdentity',
          Condition: {
            StringEquals: {
              'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
              'token.actions.githubusercontent.com:sub':
                'repo:indulgers/portfolio-site:ref:refs/heads/main',
            },
          },
          Effect: 'Allow',
        }),
      ]),
    },
  });
  template.hasOutput('GitHubActionsDeployRoleArn', { Value: Match.anyValue() });
});
