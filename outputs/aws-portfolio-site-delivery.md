# AWS portfolio site delivery

## Delivered

- An English-first, responsive personal portfolio for **Weiye Zhu**, positioned for international full-stack and AI-agent engineering roles.
- No headshot, phone number, email address, or birth date is exposed.
- Verified GitHub and LinkedIn links are included.
- A testable TypeScript AWS CDK deployment for a private S3 origin, CloudFront OAC, HTTPS redirects, security headers, immutable asset caching, access logging, a 5xx alert, and an SNS notification endpoint.
- A controlled Cloudflare cutover and rollback procedure that preserves the current Tencent Cloud DNS path until verification passes.

## Verification evidence

- 15 unit/infrastructure/configuration tests passed.
- Type checking passed.
- The production Vite build passed.
- CDK synthesis passed.
- Production dependency audit: 0 vulnerabilities.
- Desktop and 390px mobile browser previews were checked with no console errors.

## What has not changed

No AWS resources were deployed. No ACM certificate was requested. No Cloudflare DNS record was changed. The existing Tencent Cloud endpoint remains the rollback path.

## Your next actions

1. Use Node.js 20.19+ and authenticate the AWS CLI for the target account.
2. Follow `docs/DEPLOYMENT-RUNBOOK.md` to bootstrap `us-east-1`, deploy the default CloudFront hostname, and validate it.
3. Request an ACM DNS-validated certificate for `indulger.win` in `us-east-1`.
4. Re-deploy with the supplied certificate ARN, then change Cloudflare's apex record to the CloudFront hostname as **DNS only**.
5. Subscribe an approved notification recipient to the emitted SNS topic and set an AWS Budget against it.
