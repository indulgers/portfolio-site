import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

async function workflow(name: string): Promise<string> {
  return readFile(resolve(process.cwd(), '.github/workflows', name), 'utf8');
}

describe('GitHub Actions workflows', () => {
  test('validates pull requests and main before deployment', async () => {
    const ci = await workflow('ci.yml');

    expect(ci).toContain('pull_request:');
    expect(ci).toContain('npm test');
    expect(ci).toContain('npm run typecheck');
    expect(ci).toContain('npm run build');
  });

  test('deploys only after successful main CI using OIDC', async () => {
    const deploy = await workflow('deploy.yml');

    expect(deploy).toContain('workflow_run:');
    expect(deploy).toContain('id-token: write');
    expect(deploy).toContain('aws-actions/configure-aws-credentials');
    expect(deploy).toContain("github.event.workflow_run.head_branch == 'main'");
    expect(deploy).toContain('npm run cdk:deploy');
    expect(deploy).not.toContain('AWS_ACCESS_KEY_ID');
  });
});
