import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';

test('introduces Weiye Zhu as a full-stack engineer', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { name: 'Weiye Zhu' }),
  ).toBeVisible();
  expect(screen.getByText('Full-Stack Engineer')).toBeVisible();
});

test('frames Xmind as previous work and removes present-tense employment copy', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { name: /previous work at xmind/i }),
  ).toBeVisible();
  expect(screen.queryByText(/currently at xmind/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/^now$/i)).not.toBeInTheDocument();
});

test('expands a selected work narrative accessibly', () => {
  render(<App />);

  const imports = screen.getByRole('button', {
    name: /multimodal documents/i,
  });

  expect(imports).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(imports);
  expect(imports).toHaveAttribute('aria-expanded', 'true');
  expect(
    within(
      screen.getByRole('region', { name: /multimodal documents/i }),
    ).getByText(/workflow translated text, markdown/i),
  ).toBeVisible();
});

test('keeps the public profile links stable', () => {
  render(<App />);

  expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/indulgers',
  );
  expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/weiye-zhu-211ba33b7/zh/',
  );
});
