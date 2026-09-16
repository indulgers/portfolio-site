# GitHub Actions OIDC CI/CD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the portfolio to `indulgers/portfolio-site` with tested GitHub Actions CI and OIDC-authenticated CDK deployment from `main`.

**Architecture:** The CDK stack accepts an optional GitHub repository name and creates a constrained OIDC deployment role. CI runs on every PR and `main` push; a separate workflow deploys only after CI passes on `main`, with GitHub repository variables supplying the domain and certificate identifiers.

**Tech Stack:** GitHub Actions, GitHub OIDC, AWS IAM, AWS CDK v2, TypeScript, Vitest, GitHub CLI.

**Spec:** `docs/superpowers/specs/2026-09-16-github-actions-oidc-cicd-design.md`

## Global Constraints

- Public repository: `indulgers/portfolio-site`; production branch: `main`.
- No long-lived AWS key, secret, or session token is committed or stored in GitHub.
- OIDC trust requires audience `sts.amazonaws.com` and subject `repo:indulgers/portfolio-site:ref:refs/heads/main`.
- The OIDC role may assume only `cdk-hnb659fds` bootstrap roles in AWS account `445216898785`, region `us-east-1`, and read the bootstrap version SSM parameter.
- `PORTFOLIO_DOMAIN` and `PORTFOLIO_CERTIFICATE_ARN` remain GitHub repository variables.
- Workflows never change Cloudflare DNS.

---

### Task 1: Add a testable OIDC deployment role to CDK

**Files:**
- Modify: `infra/lib/stack-config.ts`, `infra/bin/app.ts`, `infra/lib/portfolio-stack.ts`
- Modify: `infra/test/stack-config.test.ts`, `infra/test/portfolio-stack.test.ts`

**Interfaces:** `resolveStackConfig()` returns `githubRepository?: string`; `PortfolioStackProps` accepts it; stack output is `GitHubActionsDeployRoleArn`.

- [ ] **Step 1: Write the failing context test**

Add to `infra/test/stack-config.test.ts`:

```ts
test('keeps an explicit GitHub repository for OIDC deployment configuration', () => {
  expect(resolveStackConfig({ githubRepository: 'indulgers/portfolio-site' }, '/project'))
    .toMatchObject({ githubRepository: 'indulgers/portfolio-site' });
});
```

- [ ] **Step 2: Verify the failure**

Run `npm test -- --run infra/test/stack-config.test.ts`. Expect the new assertion to fail because `githubRepository` is discarded.

- [ ] **Step 3: Implement the minimal context plumbing**

Add `readonly githubRepository?: string` to `StackConfig` and `PortfolioStackProps`. Return `githubRepository: optionalString(context.githubRepository)` from `resolveStackConfig`, and pass `app.node.tryGetContext('githubRepository')` from `infra/bin/app.ts`.

- [ ] **Step 4: Verify green**

Run `npm test -- --run infra/test/stack-config.test.ts`. Expect all tests to pass.

- [ ] **Step 5: Write the failing OIDC boundary test**

Create a stack with `githubRepository: 'indulgers/portfolio-site'` in `infra/test/portfolio-stack.test.ts`, then assert an IAM role has `sts:AssumeRoleWithWebIdentity` and both conditions:

```ts
'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com'
'token.actions.githubusercontent.com:sub': 'repo:indulgers/portfolio-site:ref:refs/heads/main'
```

Also assert `template.hasOutput('GitHubActionsDeployRoleArn', { Value: Match.anyValue() })`.

- [ ] **Step 6: Verify the failure**

Run `npm test -- --run infra/test/portfolio-stack.test.ts`. Expect no matching OIDC role or output.

- [ ] **Step 7: Implement the constrained role**

When `props.githubRepository` is present, create an `iam.OpenIdConnectProvider` for `https://token.actions.githubusercontent.com` with client ID `sts.amazonaws.com`. Create `GitHubActionsDeployRole` using `iam.WebIdentityPrincipal` with the exact Step 5 conditions. Add only these permission statements:

```ts
{
  actions: ['sts:AssumeRole'],
  resources: [
    'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-*-role-${AWS::AccountId}-${AWS::Region}',
  ],
}
{
  actions: ['ssm:GetParameter'],
  resources: [
    'arn:${AWS::Partition}:ssm:us-east-1:${AWS::AccountId}:parameter/cdk-bootstrap/hnb659fds/version',
  ],
}
```

Output `role.roleArn` as `GitHubActionsDeployRoleArn`.

- [ ] **Step 8: Verify and commit**

Run `npm test -- --run infra/test/portfolio-stack.test.ts`, then `npm test`. Expect all pass. Commit with:

```sh
git add infra/bin/app.ts infra/lib/portfolio-stack.ts infra/lib/stack-config.ts infra/test/portfolio-stack.test.ts infra/test/stack-config.test.ts
git commit -m "feat: add GitHub OIDC CDK deploy role"
```

### Task 2: Add tested CI and deployment workflows

**Files:**
- Create: `infra/test/github-workflows.test.ts`
- Create: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`

**Interfaces:** GitHub variables `AWS_DEPLOY_ROLE_ARN`, `PORTFOLIO_DOMAIN`, and `PORTFOLIO_CERTIFICATE_ARN` supply deployment identifiers.

- [ ] **Step 1: Write failing workflow tests**

Create `infra/test/github-workflows.test.ts` with a `readFile(resolve(process.cwd(), '.github/workflows', name), 'utf8')` helper. Assert `ci.yml` contains `pull_request:`, `npm test`, `npm run typecheck`, and `npm run build`. Assert `deploy.yml` contains `workflow_run:`, `id-token: write`, `aws-actions/configure-aws-credentials`, `github.event.workflow_run.head_branch == 'main'`, and `npm run cdk:deploy`; assert it does not contain `AWS_ACCESS_KEY_ID`.

- [ ] **Step 2: Verify the failure**

Run `npm test -- --run infra/test/github-workflows.test.ts`. Expect failure because workflow files do not exist.

- [ ] **Step 3: Implement CI**

Create `.github/workflows/ci.yml`: trigger `pull_request` and pushes to `main`; permission `contents: read`; use `actions/checkout@v4` and `actions/setup-node@v4` with `node-version: 22` and `cache: npm`; run `npm ci`, `npm test`, `npm run typecheck`, and `npm run build`.

- [ ] **Step 4: Implement deployment**

Create `.github/workflows/deploy.yml`: trigger when workflow `CI` completes and by `workflow_dispatch`; permission `contents: read` and `id-token: write`; serialize `portfolio-production` with `cancel-in-progress: false`. Its job condition is:

```yaml
github.event_name == 'workflow_dispatch' || (github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.head_branch == 'main')
```

Use `aws-actions/configure-aws-credentials@v4` with role `${{ vars.AWS_DEPLOY_ROLE_ARN }}` and region `us-east-1`. Run `npm ci`, then `npm run cdk:diff -- --no-change-set` and `npm run cdk:deploy -- --require-approval never`, passing `githubRepository="${{ github.repository }}"`, `domainName="${{ vars.PORTFOLIO_DOMAIN }}"`, and `certificateArn="${{ vars.PORTFOLIO_CERTIFICATE_ARN }}"` to both.

- [ ] **Step 5: Verify and commit**

Run `npm test -- --run infra/test/github-workflows.test.ts`, then `npm test && npm run typecheck && npm run build`. Expect all pass. Commit with:

```sh
git add .github/workflows/ci.yml .github/workflows/deploy.yml infra/test/github-workflows.test.ts
git commit -m "ci: add OIDC deployment workflow"
```

### Task 3: Create the repository, configure OIDC, and prove delivery

**Files:**
- Modify: `docs/DEPLOYMENT-RUNBOOK.md`

**Interfaces:** The local AWS identity creates the one-time OIDC role. The stack output becomes the GitHub `AWS_DEPLOY_ROLE_ARN` variable.

- [ ] **Step 1: Document the setup**

Add a `GitHub Actions CI/CD` section to `docs/DEPLOYMENT-RUNBOOK.md`: public repository, OIDC-only authentication, the three repository variables, `main`-only automatic deployment, and manual Cloudflare DNS ownership.

- [ ] **Step 2: Create the public repository**

Run `gh repo create indulgers/portfolio-site --public --source=. --remote=origin`. If it exists, inspect it using `gh repo view indulgers/portfolio-site --json url` and add its HTTPS URL as `origin` without replacing branches.

- [ ] **Step 3: Deploy the OIDC role**

Run the existing CDK diff and deploy commands with `githubRepository=indulgers/portfolio-site`, `domainName=indulger.win`, and `certificateArn=arn:aws:acm:us-east-1:445216898785:certificate/ff8dc4b6-bbc9-4d82-bbe6-d7e6b20c3716`. Expect `UPDATE_COMPLETE` and output `GitHubActionsDeployRoleArn`.

- [ ] **Step 4: Set GitHub variables**

Use `gh variable set` for `AWS_DEPLOY_ROLE_ARN` from the output, `PORTFOLIO_DOMAIN` as `indulger.win`, and `PORTFOLIO_CERTIFICATE_ARN` as the exact certificate ARN above.

- [ ] **Step 5: Push and verify**

Commit the runbook change, then run `git push -u origin main`. Confirm CI and Deploy in `gh run list --repo indulgers/portfolio-site --limit 5`; confirm `PortfolioSiteStack` is `UPDATE_COMPLETE`. Commit any documentation result only when changed.

## Implementation adjustment: immutable GitHub OIDC subjects

GitHub created `indulgers/portfolio-site` after its immutable-subject rollout. The live repository reports `use_immutable_subject: true` and the prefix `repo:indulgers@115327474/portfolio-site@1372345246`. The initial name-only subject could not assume the role, so the implementation and tests use the exact immutable `main` subject instead:

`repo:indulgers@115327474/portfolio-site@1372345246:ref:refs/heads/main`

This is narrower than a wildcard and preserves the plan's main-only security boundary.
