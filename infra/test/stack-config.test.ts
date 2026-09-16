import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { resolveStackConfig } from '../lib/stack-config';

describe('resolveStackConfig', () => {
  test('uses a local build directory without a custom domain by default', () => {
    expect(resolveStackConfig({}, '/project')).toEqual({
      sitePath: resolve('/project', 'dist'),
    });
  });

  test('keeps an explicit GitHub repository for OIDC deployment configuration', () => {
    expect(
      resolveStackConfig({ githubRepository: 'indulgers/portfolio-site' }, '/project'),
    ).toMatchObject({ githubRepository: 'indulgers/portfolio-site' });
  });

  test('accepts a complete custom-domain configuration', () => {
    expect(
      resolveStackConfig(
        {
          certificateArn:
            'arn:aws:acm:us-east-1:111111111111:certificate/example-certificate',
          domainName: 'indulger.win',
          sitePath: 'release',
        },
        '/project',
      ),
    ).toEqual({
      customDomain: {
        certificateArn:
          'arn:aws:acm:us-east-1:111111111111:certificate/example-certificate',
        domainName: 'indulger.win',
      },
      sitePath: resolve('/project', 'release'),
    });
  });

  test('rejects incomplete custom-domain configuration', () => {
    expect(() => resolveStackConfig({ domainName: 'indulger.win' }, '/project')).toThrow(
      'domainName and certificateArn must be supplied together',
    );
  });

  test('requires the CloudFront certificate to be in us-east-1', () => {
    expect(() =>
      resolveStackConfig(
        {
          certificateArn:
            'arn:aws:acm:ap-southeast-1:111111111111:certificate/example-certificate',
          domainName: 'indulger.win',
        },
        '/project',
      ),
    ).toThrow('certificateArn must reference an ACM certificate in us-east-1');
  });
});
