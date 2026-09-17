import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

test('defines a reduced-motion override', async () => {
  const css = await readFile(resolve(process.cwd(), 'src/styles.css'), 'utf8');

  expect(css).toContain('@media (prefers-reduced-motion: reduce)');
});

test('removes the cramped work label from the compact mobile layout', async () => {
  const css = await readFile(resolve(process.cwd(), 'src/styles.css'), 'utf8');

  expect(css).toMatch(
    /@media \(max-width: 760px\)[\s\S]*?\.work-label\s*\{\s*display: none;/,
  );
});
