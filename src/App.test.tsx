import { render, screen } from '@testing-library/react';
import App from './App';

test('introduces Weiye Zhu as a full-stack engineer', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { name: 'Weiye Zhu' }),
  ).toBeVisible();
  expect(screen.getByText('Full-Stack Engineer')).toBeVisible();
});

test('offers the verified GitHub and LinkedIn profile links', () => {
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

test('shows selected production work across AI, SaaS, and mobile delivery', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { name: 'Selected work' }),
  ).toBeVisible();
  expect(
    screen.getByRole('heading', {
      name: 'AI agent canvas for knowledge work',
    }),
  ).toBeVisible();
  expect(
    screen.getByRole('heading', {
      name: 'Multimodal documents to mind maps',
    }),
  ).toBeVisible();
  expect(
    screen.getByRole('heading', {
      name: 'Cross-platform AI companion',
    }),
  ).toBeVisible();
});

test('describes the end-to-end engineering toolkit', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { name: 'End-to-end toolkit' }),
  ).toBeVisible();
  expect(screen.getByText('TypeScript')).toBeVisible();
  expect(screen.getByText('React & Next.js')).toBeVisible();
  expect(screen.getByText('Node.js & NestJS')).toBeVisible();
  expect(screen.getByText('AI agent systems')).toBeVisible();
});

test('grounds the portfolio in the current Xmind product role', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: 'Currently at Xmind' })).toBeVisible();
  expect(
    screen.getByText(/AI-enabled knowledge work in a collaborative SaaS/i),
  ).toBeVisible();
});
