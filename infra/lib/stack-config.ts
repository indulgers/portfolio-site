import { resolve } from 'node:path';

export interface StackConfig {
  readonly customDomain?: {
    readonly certificateArn: string;
    readonly domainName: string;
  };
  readonly githubRepository?: string;
  readonly sitePath: string;
}

export function resolveStackConfig(
  context: Record<string, unknown>,
  workingDirectory: string,
): StackConfig {
  const domainName = optionalString(context.domainName);
  const certificateArn = optionalString(context.certificateArn);
  const githubRepository = optionalString(context.githubRepository);
  const sitePath = optionalString(context.sitePath) ?? 'dist';

  if (Boolean(domainName) !== Boolean(certificateArn)) {
    throw new Error('domainName and certificateArn must be supplied together');
  }

  if (certificateArn && certificateArn.split(':')[3] !== 'us-east-1') {
    throw new Error(
      'certificateArn must reference an ACM certificate in us-east-1',
    );
  }

  return {
    ...(domainName && certificateArn
      ? {
          customDomain: {
            certificateArn,
            domainName,
          },
        }
      : {}),
    ...(githubRepository ? { githubRepository } : {}),
    sitePath: resolve(workingDirectory, sitePath),
  };
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}
