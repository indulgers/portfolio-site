# Portfolio Site deployment runbook

This project publishes the static portfolio to a private Amazon S3 bucket through Amazon CloudFront. It deliberately has no server, database, or public S3 access.

## What this stack creates

- A versioned, encrypted, non-public S3 bucket for the site build.
- A CloudFront distribution using Origin Access Control (OAC) to read that bucket.
- HTTPS redirects, security response headers, and cache rules: `index.html` revalidates; fingerprinted assets cache for one year.
- A private S3 log bucket with a 30-day retention rule.
- A CloudWatch alarm when CloudFront's 5xx error rate exceeds 1% for one minute, routed to an SNS topic. The stack outputs that topic ARN; add an approved notification subscription after deployment.

The S3 buckets are retained on stack deletion so an accidental CDK destroy does not delete the site or access logs.

CloudFront's CDK logging option uses standard logging (legacy). Its dedicated log bucket therefore enables **private** ACL support (`ObjectWriter`) solely so CloudFront can deliver logs; Block Public Access and HTTPS-only bucket access remain enabled. The site-origin bucket does not enable ACLs and stays private through OAC.

## Prerequisites

1. Install Node.js 20.19 or later and configure an AWS CLI/CDK credential profile for the intended AWS account.
2. From this repository, install dependencies and verify the project:

   ```sh
   npm ci
   npm test
   npm run build
   npm run cdk:synth
   ```

3. Bootstrap the target account once, in `us-east-1`:

   ```sh
   npx cdk bootstrap aws://YOUR_AWS_ACCOUNT_ID/us-east-1
   ```

`us-east-1` is intentional: CloudFront requires ACM certificates for alternate domain names to be issued there.

## First deployment: validate the AWS endpoint

Deploy once **without** custom-domain context. This leaves the existing Tencent Cloud DNS record untouched.

```sh
npm run cdk:diff
npm run cdk:deploy
```

Record the `DistributionDomainName` output, then visit `https://<distribution-domain-name>/`. Confirm the page is healthy, HTTPS redirects work, and the site contains the expected portfolio content.

In AWS Console, open the emitted `OperationsAlertsTopicArn` SNS topic and create an email, webhook, or incident-management subscription that you control. Confirm that subscription before relying on alerts.

## Add `indulger.win`

1. In ACM, switch to **US East (N. Virginia) / `us-east-1`** and request a public certificate for `indulger.win` using DNS validation.
2. Add ACM's validation CNAME in Cloudflare. Keep the validation record **DNS only** (not proxied) until the certificate is issued.
3. Re-deploy the same stack with the issued certificate ARN:

   ```sh
   npm run cdk:diff -- \
     -c domainName=indulger.win \
     -c certificateArn=arn:aws:acm:us-east-1:YOUR_AWS_ACCOUNT_ID:certificate/YOUR_CERTIFICATE_ID

   npm run cdk:deploy -- \
     -c domainName=indulger.win \
     -c certificateArn=arn:aws:acm:us-east-1:YOUR_AWS_ACCOUNT_ID:certificate/YOUR_CERTIFICATE_ID
   ```

4. Wait for the CloudFront update to finish, then change the Cloudflare apex record:

   - Type: `CNAME`
   - Name: `@`
   - Target: the emitted `DistributionDomainName` (for example, `d123example.cloudfront.net`)
   - Proxy status: **DNS only**

Cloudflare flattens apex CNAMEs, so this works for `indulger.win`. Do not proxy CloudFront through Cloudflare for this setup; it would add a second CDN/TLS/cache layer.

Only remove the Tencent Cloud record after `https://indulger.win/` has been validated from an external network. The existing record is the rollback path.

## Release procedure

Every site update follows the same sequence:

```sh
npm ci
npm test
npm run build
npm run cdk:diff -- \
  -c domainName=indulger.win \
  -c certificateArn=arn:aws:acm:us-east-1:YOUR_AWS_ACCOUNT_ID:certificate/YOUR_CERTIFICATE_ID
npm run cdk:deploy -- \
  -c domainName=indulger.win \
  -c certificateArn=arn:aws:acm:us-east-1:YOUR_AWS_ACCOUNT_ID:certificate/YOUR_CERTIFICATE_ID
```

The deployment copies the build to S3 and waits for the associated CloudFront invalidation. Content-hashed assets are safe to cache for a year; `index.html` is revalidated so it points visitors to each new asset revision.

## GitHub Actions CI/CD

The public repository is `https://github.com/indulgers/portfolio-site`. Pull requests and every push to `main` run tests, type checking, and a production build. A separate deployment workflow runs only after a successful `main` CI run; it can also be dispatched manually.

GitHub authenticates to AWS using OpenID Connect (OIDC), not stored AWS access keys. The CDK stack creates a role whose trust policy is limited to the `indulgers/portfolio-site` `main` branch and whose permissions are limited to assuming the CDK bootstrap deployment roles.

Set these GitHub repository variables after the first local deployment that creates the OIDC role:

- `AWS_DEPLOY_ROLE_ARN`: the stack output `GitHubActionsDeployRoleArn`.
- `PORTFOLIO_DOMAIN`: `indulger.win`.
- `PORTFOLIO_CERTIFICATE_ARN`: the issued ACM certificate ARN in `us-east-1`.

The workflows do not create or change Cloudflare records. Cloudflare remains the owner of DNS, including the apex CNAME that targets CloudFront.

## Cost and operational guardrails

- In AWS Billing → Budgets, create a monthly **Cost budget** for this portfolio. Choose a cap appropriate to your traffic and route its 80% and 100% actual-cost notifications to the emitted SNS topic ARN. No personal contact address is embedded in code.
- Review CloudFront's 5xx alarm and access logs after every material release.
- Keep the public S3 Block Public Access settings enabled. Content must only be reachable through CloudFront OAC.
- Check the AWS Cost Explorer during the first month. High traffic, data transfer, and CloudFront requests are the material variable costs for this static architecture.

## Rollback

For an application rollback, deploy the previous Git revision using the release procedure. The bucket is versioned, giving an additional recovery path for objects.

For a DNS rollback, restore the original Cloudflare record that points at the Tencent Cloud machine. Do not delete the CloudFront distribution or S3 buckets during an incident; preserve the data and logs for diagnosis.
