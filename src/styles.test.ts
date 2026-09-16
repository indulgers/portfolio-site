import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

test('defines a reduced-motion override', async () => {
  const css = await readFile(resolve(process.cwd(), 'src/styles.css'), 'utf8');

  expect(css).toContain('@media (prefers-reduced-motion: reduce)');
});
