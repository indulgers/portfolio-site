# Delivery Tickets

## PT-001 - Establish the static portfolio workspace

**Outcome:** A React + TypeScript static-site workspace builds and runs repeatable quality checks.

**Acceptance criteria:**

- The project produces deployable static files.
- Unit and infrastructure tests run locally.
- Project scripts expose build, test, type-check, and CDK synthesis commands.

## PT-002 - Publish the international full-stack portfolio

**Outcome:** Recruiters can understand Weiye Zhu's profile, selected production work, technical strengths, and verified public profiles from one responsive, accessible page.

**Acceptance criteria:**

- The rendered page presents the name, full-stack/AI Agent positioning, current XMind role, selected work, skills, and GitHub/LinkedIn links.
- The page does not expose the resume's photo, phone number, email address, or date of birth.
- Navigation, outbound links, and reduced-motion behavior are accessible by keyboard.

## PT-003 - Define secure static delivery with AWS CDK

**Outcome:** A TypeScript CDK app synthesizes the private S3 + CloudFront production delivery baseline.

**Acceptance criteria:**

- The content bucket blocks public access, is versioned, encrypted, and only readable by its CloudFront distribution through OAC.
- CloudFront enforces HTTPS, serves the custom domain configuration, applies a security-headers policy, and records access logs without cookies.
- Static assets are cached immutably while the HTML entry point is revalidated promptly.
- CloudWatch alarms and a budget-alert integration point are defined without embedding personal contact data.

## PT-004 - Prepare the controlled cutover runbook

**Outcome:** The owner can validate the default CloudFront address, issue the ACM certificate, update Cloudflare DNS, verify the live domain, and roll back to Tencent Cloud if required.

**Acceptance criteria:**

- The runbook separates AWS-managed steps from manual Cloudflare actions.
- It names no Cloudflare API token or AWS secret.
- DNS cutover is explicitly deferred until the default distribution is verified.

## Test seams for this project

1. **Portfolio page seam:** the rendered React application observed through accessible browser roles and links.
2. **Infrastructure seam:** the synthesized CloudFormation template observed through CDK assertions.
3. **Release seam:** the generated static output observed through the build command and static-file checks.
