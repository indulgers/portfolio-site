# Editorial Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing portfolio UI with an accessible, reading-first Editorial index design that frames Xmind as prior work and uses restrained premium interaction.

**Architecture:** Portfolio content becomes typed data, rendered by focused React components for the sticky index and expandable work narratives. `App` owns active section and selected project state; the styling layer supplies the editorial visual system and motion with a `prefers-reduced-motion` fallback. The existing static Vite build and AWS deployment pipeline remain unchanged.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, CSS, Impeccable CLI.

**Spec:** `docs/superpowers/specs/2026-09-16-editorial-portfolio-redesign-design.md`

## Global Constraints

- Keep the site English-first, static-only, with no headshot, private contact address, server, database, CMS, analytics SDK, third-party font CDN, image service, or UI framework.
- Remove all present-tense Xmind employment copy; retain it only as `01 / Previous work at Xmind`.
- Preserve the existing GitHub and LinkedIn URLs.
- Keep CloudFront's self-only CSP intact; use system font fallbacks or bundled assets only.
- Use `IntersectionObserver` for active-index state; no scroll-jacking, canvas rendering, continuous animation, or horizontal mobile scroll.
- Every interactive project control must be a keyboard-operable button with `aria-expanded` and an accessible controlled region.
- Disable transitions, reveal effects, and parallax under `prefers-reduced-motion: reduce`.
- Do not alter `infra/`, `.github/workflows/`, AWS resources, DNS, certificates, or GitHub OIDC configuration.
- Impeccable 4.1.0 requires Node 22.18+ for its `npx` installer; do not modify global Node tooling without explicit user approval.

---

## File structure

- `src/content/portfolio.ts` — typed profile URLs, availability copy, and the three ordered work narratives.
- `src/components/SectionIndex.tsx` — accessible sticky anchor index and active-section presentation.
- `src/components/WorkNarratives.tsx` — buttons and controlled panels for the expandable past-work narratives.
- `src/App.tsx` — page composition, active-section observer, and selected-work state.
- `src/styles.css` — editorial tokens, responsive layout, interaction/motion rules, and reduced-motion overrides.
- `src/App.test.tsx` — semantic content, legacy-copy removal, external links, index rendering, and work expansion tests.
- `src/styles.test.ts` — source-level guard for the required reduced-motion stylesheet rule.
- `.agents/skills/impeccable/` and `.codex/hooks.json` — project-scoped Impeccable payload and hook files created by the Codex installer; review before committing any installer-created project files.

### Task 1: Prepare the local design-review tool without changing runtime dependencies

**Files:**
- Create or modify only installer-generated project files under `.agents/` and `.codex/` after inspection.
- Modify: `.gitignore` only if the installer creates machine-local cache or state outside `.agents/skills/impeccable/`.

**Interfaces:**
- Produces the `/impeccable` Codex command and optional project hook; application imports and `package.json` runtime dependencies remain unchanged.

- [ ] **Step 1: Verify the local Node version before installation**

Run: `node --version`

Expected: Node must be `v22.18.0` or higher. If it is lower, stop this task and request permission to install or select a Node 22.18+ runtime; do not run the installer under Node 20.

- [ ] **Step 2: Install Impeccable in project scope once Node is eligible**

Run from the repository root:

```bash
npx impeccable install
```

Choose the detected Codex provider and **project** scope when prompted. Do not choose global scope.

- [ ] **Step 3: Inspect the installer output before treating it as project content**

Run:

```bash
git status --short
find .agents .codex -maxdepth 4 -type f | sort
```

Expected: the skill payload and hook manifest are confined to `.agents/` and `.codex/`; no production dependency is added to `package.json`.

- [ ] **Step 4: Initialize durable Impeccable context**

Run `/impeccable init` in Codex. Record the portfolio audience, static-only constraint, editorial direction, no-headshot constraint, and accessibility/motion requirements in the files the command creates. Do not record AWS credentials or private contact data.

- [ ] **Step 5: Commit only reviewed project-scoped tool configuration**

```bash
git add .agents/skills/impeccable .codex/hooks.json PRODUCT.md .gitignore
git commit -m "chore: add impeccable design tooling"
```

### Task 2: Introduce testable editorial content and accessible work disclosure

**Files:**
- Create: `src/content/portfolio.ts`, `src/components/SectionIndex.tsx`, `src/components/WorkNarratives.tsx`, `src/styles.test.ts`
- Modify: `src/App.tsx`, `src/App.test.tsx`

**Interfaces:**
- `WorkEntry` is `{ id: 'xmind' | 'imports' | 'companion'; index: string; label: string; title: string; summary: string; details: string[] }`.
- `WORK_ENTRIES` is a readonly ordered array with Xmind at index `01` and label `Previous work at Xmind`.
- `WorkNarratives` receives `{ entries: readonly WorkEntry[]; expandedId: WorkEntry['id']; onExpandedChange(id: WorkEntry['id']): void }`.
- `SectionIndex` receives `{ activeSectionId: string }` and renders anchor links for `work`, `capabilities`, and `contact`.

- [ ] **Step 1: Write failing content and disclosure tests**

Replace the existing `src/App.test.tsx` assertions with tests that require the approved copy and interaction. Use `fireEvent` from the already-installed Testing Library package; do not add an interaction-test dependency solely for this change:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';

test('frames Xmind as previous work and removes present-tense employment copy', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /previous work at xmind/i })).toBeInTheDocument();
  expect(screen.queryByText(/currently at xmind/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/^now$/i)).not.toBeInTheDocument();
});

test('expands a selected work narrative accessibly', () => {
  render(<App />);
  const imports = screen.getByRole('button', { name: /multimodal documents/i });
  expect(imports).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(imports);
  expect(imports).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText(/editable mind maps/i)).toBeVisible();
});

test('keeps the public profile links stable', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute(
    'href',
    'https://github.com/indulgers',
  );
  expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/weiye-zhu-211ba33b7/zh/',
  );
});
```

Add a second test file that reads `src/styles.css` and asserts the literal reduced-motion media query exists:

```ts
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

test('defines a reduced-motion override', async () => {
  const css = await readFile(resolve(process.cwd(), 'src/styles.css'), 'utf8');
  expect(css).toContain('@media (prefers-reduced-motion: reduce)');
});
```

- [ ] **Step 2: Verify red**

Run: `npm test -- --run src/App.test.tsx src/styles.test.ts`

Expected: FAIL because the current page still renders `Currently at Xmind`, does not expose the required work buttons, and has no `styles.test.ts`.

- [ ] **Step 3: Create the typed content module**

Create `src/content/portfolio.ts` with these stable public URLs and work content shape:

```ts
export const PROFILE_URLS = {
  github: 'https://github.com/indulgers',
  linkedIn: 'https://www.linkedin.com/in/weiye-zhu-211ba33b7/zh/',
} as const;

export type WorkEntry = {
  id: 'xmind' | 'imports' | 'companion';
  index: string;
  label: string;
  title: string;
  summary: string;
  details: readonly string[];
};
```

Populate `WORK_ENTRIES` in the exact order `xmind`, `imports`, `companion`; use `Previous work at Xmind` as the first label and only existing, supportable portfolio claims.

- [ ] **Step 4: Create accessible presentational components**

Implement `SectionIndex` with an ordered list of `<a>` elements and `aria-current="location"` only for the matching active section. Implement `WorkNarratives` with one `<button aria-expanded aria-controls>` per entry and a matching `role="region"` panel. Render all summaries in the closed state and details only for the expanded entry.

- [ ] **Step 5: Recompose `App` around the new interfaces**

Make `App` initially expand `xmind`, remove the old current-role section, render the availability signal, and connect `useState<WorkEntry['id']>('xmind')` to `WorkNarratives`. Keep the named page anchors `work`, `capabilities`, and `contact`.

- [ ] **Step 6: Verify green**

Run: `npm test -- --run src/App.test.tsx src/styles.test.ts`

Expected: all new tests pass.

- [ ] **Step 7: Commit the semantic component system**

```bash
git add src/App.tsx src/App.test.tsx src/content/portfolio.ts src/components/SectionIndex.tsx src/components/WorkNarratives.tsx src/styles.test.ts
git commit -m "feat: add editorial portfolio content structure"
```

### Task 3: Apply the responsive Editorial index visual system and motion

**Files:**
- Modify: `src/styles.css`, `src/App.tsx`, `src/components/SectionIndex.tsx`, `src/components/WorkNarratives.tsx`
- Test: `src/App.test.tsx`, `src/styles.test.ts`

**Interfaces:**
- `App` observes sections and passes `activeSectionId` into `SectionIndex`.
- Work controls retain their names, button roles, `aria-expanded`, and controlled-region identifiers from Task 2.

- [ ] **Step 1: Write the failing active-index test**

Mock `IntersectionObserver` in `src/App.test.tsx`, invoke the observed callback with an intersecting `#capabilities` target, then require the index link to expose its state:

```tsx
expect(screen.getByRole('link', { name: /capabilities/i })).toHaveAttribute(
  'aria-current',
  'location',
);
```

- [ ] **Step 2: Verify red**

Run: `npm test -- --run src/App.test.tsx`

Expected: FAIL because `App` does not yet observe sections or pass an active section to the index.

- [ ] **Step 3: Implement the active-section observer**

Use an effect that observes `#work`, `#capabilities`, and `#contact` with `IntersectionObserver`. On intersecting entries, set the matching section id. Return `observer.disconnect()` during cleanup. When `IntersectionObserver` is unavailable, leave `work` active so the document remains readable in tests and older browsers.

- [ ] **Step 4: Replace the stylesheet with the approved visual system**

Use custom properties for paper, ink, muted ink, vermilion, rule, display font stack, and UI font stack. Implement a desktop two-column editorial grid with a sticky index and a single-column prose measure. At widths below `760px`, collapse to one column and make the index non-sticky.

Apply only `opacity` and `transform` transitions to reveal elements. Gate pointer parallax behind `@media (hover: hover) and (pointer: fine)`. In the existing `prefers-reduced-motion: reduce` block, set `scroll-behavior: auto` and force animation and transition duration to `0.01ms`.

- [ ] **Step 5: Verify green and inspect Impeccable findings**

Run:

```bash
npm test -- --run src/App.test.tsx src/styles.test.ts
npx impeccable detect src/
```

Expected: tests pass. Resolve new detector findings that conflict with the approved editorial system; preserve intentional choices only when the report identifies a false positive.

- [ ] **Step 6: Commit the visual and interaction layer**

```bash
git add src/App.tsx src/App.test.tsx src/components/SectionIndex.tsx src/components/WorkNarratives.tsx src/styles.css src/styles.test.ts
git commit -m "feat: apply editorial portfolio visual system"
```

### Task 4: Verify the production-quality experience without infrastructure changes

**Files:**
- Modify only if test failures require it: `src/App.tsx`, `src/components/*.tsx`, `src/styles.css`, or their tests.

**Interfaces:**
- The Vite build output remains `dist/`, consumed unchanged by the existing CDK S3 deployment.

- [ ] **Step 1: Run the full automated verification suite**

Run:

```bash
npm test
npm run typecheck
npm run build
git diff --check
```

Expected: all tests, type checking, and production build succeed with no whitespace errors.

- [ ] **Step 2: Perform responsive visual verification**

Run `npm run dev`, inspect the local site at a 1440px desktop viewport and a 390px mobile viewport, then verify:

```text
desktop: sticky index, 65–72 character prose measure, visible editorial hierarchy, keyboard-openable work items
mobile: one-column document, visible work controls, no horizontal overflow, no hover-dependent functionality
reduced motion: operating-system preference disables reveal/parallax transitions
```

- [ ] **Step 3: Run the final Impeccable detector**

Run: `npx impeccable detect src/`

Expected: no unreviewed high-severity detector findings. Record any intentional false positive in Impeccable's ignore mechanism with its rule name and a reason.

- [ ] **Step 4: Commit final verification fixes only when needed**

```bash
git add src
git commit -m "fix: polish editorial portfolio interactions"
```

Skip this commit if the working tree is clean after verification.
