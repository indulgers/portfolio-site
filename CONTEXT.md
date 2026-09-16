# Project Context

## Canonical terms

### Portfolio Site

The public, English-first static personal website for **Weiye Zhu**, aimed at international hiring teams. It demonstrates full-stack delivery and provides public professional contact paths.

### Portfolio Content

Curated professional information derived from the owner's resume: selected experience, projects, technical strengths, and public profile links. It excludes private contact details and date-of-birth information.

### Public Profile Links

The GitHub and LinkedIn profiles explicitly supplied by the owner. They are the Portfolio Site's primary contact and verification paths.

### Production Delivery

The repeatable, static-only deployment of the Portfolio Site using AWS CDK in TypeScript, with Amazon S3 as a private origin and Amazon CloudFront as the public delivery layer. It deliberately excludes application servers, databases, and server-side rendering.

### Custom Domain

The owner-controlled domain `indulger.win`, attached to the CloudFront distribution. It requires DNS validation and an ACM certificate in `us-east-1`.

### External DNS

The DNS zone for `indulger.win` is managed through Cloudflare. The owner adds DNS records requested by the AWS deployment; CDK does not receive Cloudflare credentials.

### Legacy Origin

The current Tencent Cloud machine reached through `indulger.win`. It is scheduled for retirement but remains unchanged until the AWS portfolio deployment is verified.
