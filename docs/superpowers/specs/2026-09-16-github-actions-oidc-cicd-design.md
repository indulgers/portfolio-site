# GitHub Actions OIDC CI/CD design

## Purpose

Publish the Portfolio Site source to the public repository `indulgers/portfolio-site` and make `main` the only branch that can automatically deploy the existing AWS CDK stack.

## Goals

- Every pull request and push verifies tests, type checking, and the production build.
- A successful push to `main` deploys the existing `PortfolioSiteStack` in `us-east-1`.
- GitHub Actions receives short-lived AWS credentials through GitHub OIDC. No AWS access key, secret key, or session token is stored in GitHub.
- The AWS trust policy is restricted to the `indulgers/portfolio-site` repository and `main` branch.
- Deployment keeps the current custom-domain configuration: `indulger.win` and its ACM certificate ARN are GitHub repository variables, not source-code secrets.

## Non-goals

- The workflow does not change Cloudflare DNS.
- The workflow does not create servers, databases, or long-lived application credentials.
- Pull requests do not deploy infrastructure.
- The OIDC role does not receive administrator access.

## Architecture

The CDK stack optionally receives a `githubRepository` context value. When supplied, it creates:

1. A GitHub Actions OIDC identity provider, if the account does not already have one.
2. A dedicated `GitHubActionsDeployRole` trusted only by tokens whose audience is `sts.amazonaws.com` and whose subject is `repo:indulgers/portfolio-site:ref:refs/heads/main`.
3. Permissions to read the CDK bootstrap version and assume only the bootstrap deploy, file-publishing, image-publishing, and lookup roles in this account and region.
4. A CloudFormation output for the GitHub Actions role ARN.

The CDK bootstrap roles retain the permissions needed to change this stack. The OIDC role only brokers access to those predefined roles; it cannot directly administer unrelated AWS resources.

## GitHub workflows

`ci.yml` runs for pull requests and pushes to `main`:

1. Check out the repository.
2. Set up the supported Node version with npm caching.
3. Run `npm ci`, `npm test`, `npm run typecheck`, and `npm run build`.

`deploy.yml` runs after CI succeeds for pushes to `main`, and may also be invoked manually:

1. Check out the same commit.
2. Configure AWS credentials using `aws-actions/configure-aws-credentials` and the OIDC role ARN from a repository variable.
3. Install dependencies.
4. Run `npm run cdk:diff -- --no-change-set` with the stored domain/certificate context.
5. Run `npm run cdk:deploy -- --require-approval never` with that same context.

Concurrency is scoped to the production environment so two commits cannot deploy simultaneously. GitHub environment protection can be added later if manual production approval becomes desirable.

## Repository variables

- `AWS_DEPLOY_ROLE_ARN`: CDK output from `GitHubActionsDeployRoleArn`.
- `PORTFOLIO_DOMAIN`: `indulger.win`.
- `PORTFOLIO_CERTIFICATE_ARN`: the public ACM ARN in `us-east-1`.

These values are identifiers, not credentials. AWS authentication is exclusively OIDC.

## Bootstrap sequence

1. Create the public GitHub repository and push this project.
2. Deploy the existing stack once with `githubRepository=indulgers/portfolio-site` using the current local AWS identity. This creates the OIDC role.
3. Read the role ARN output and set the three GitHub repository variables.
4. Push the workflow files. The CI workflow validates the repository; the deployment workflow uses OIDC for each qualifying `main` commit.

## Failure handling and verification

- CI fails before deployment if tests, types, or builds fail.
- Deployment is serialized through GitHub Actions concurrency and CloudFormation records the failed update for inspection.
- The deployment workflow does not alter DNS, so a failed infrastructure update does not move public traffic.
- Verification includes a workflow run, GitHub OIDC role policy inspection, a CDK diff, and an HTTPS check of the deployed CloudFront hostname.
