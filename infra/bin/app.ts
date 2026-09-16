import { App } from 'aws-cdk-lib';
import { PortfolioStack } from '../lib/portfolio-stack';
import { resolveStackConfig } from '../lib/stack-config';

const app = new App();
const stackConfig = resolveStackConfig(
  {
    certificateArn: app.node.tryGetContext('certificateArn'),
    domainName: app.node.tryGetContext('domainName'),
    githubRepository: app.node.tryGetContext('githubRepository'),
    sitePath: app.node.tryGetContext('sitePath'),
  },
  process.cwd(),
);

new PortfolioStack(app, 'PortfolioSiteStack', {
  ...stackConfig,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
});
