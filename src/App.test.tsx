import {
  act,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import App from './App';

let observerCallback: IntersectionObserverCallback | undefined;

class MockIntersectionObserver {
  disconnect = vi.fn();
  observe = vi.fn();
  root = null;
  rootMargin = '0px';
  takeRecords = vi.fn(() => []);
  thresholds = [];
  unobserve = vi.fn();

  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback;
  }
}

beforeEach(() => {
  observerCallback = undefined;
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

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

test('marks the active index section after it enters the reading area', () => {
  render(<App />);

  expect(observerCallback).toBeDefined();

  const capabilities = document.getElementById('capabilities');
  if (!capabilities) {
    throw new Error('Expected the capabilities section to render');
  }

  act(() => {
    observerCallback?.(
      [
        {
          isIntersecting: true,
          target: capabilities,
        } as unknown as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );
  });

  expect(screen.getByRole('link', { name: /capabilities/i })).toHaveAttribute(
    'aria-current',
    'location',
  );
});
