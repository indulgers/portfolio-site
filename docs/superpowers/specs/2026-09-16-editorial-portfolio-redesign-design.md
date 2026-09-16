# Editorial portfolio redesign

## Goal

Replace the current generic, blue corporate layout with a premium editorial portfolio that makes Weiye Zhu's full-stack and AI product work memorable while remaining easy for international hiring teams to read.

## Scope and content decisions

- The site remains an English-first, static React/Vite portfolio with no headshot, contact address, server, database, or CMS.
- Remove all present-tense employment claims, including `Currently at Xmind` and the `Now` section label.
- Preserve Xmind as `01 / Previous work at Xmind`, framed as the lead past-work case study and never as a current role.
- Preserve the existing GitHub and LinkedIn destinations and all AWS/CDK, CloudFront, S3, DNS, and GitHub OIDC deployment behavior.
- The first screen describes the owner as a full-stack engineer building consequential AI-native product work and indicates availability for global roles without inventing a start date or employment status.

## Visual system

The visual direction is **Editorial index**:

- A warm paper background, near-black ink, and one restrained vermilion accent replace the blue palette.
- Large high-contrast editorial display type gives the owner name, thesis, and work titles a magazine-cover presence. A compact sans-serif handles labels, metadata, controls, and body copy.
- No photos or decorative stock images are used. Hierarchy comes from composition, whitespace, rules, chapter numerals, and typography.
- Fonts must be locally available through the built asset or have resilient system fallbacks. The existing CloudFront CSP permits self-hosted assets and must not be weakened merely to load third-party web fonts.

## Page architecture

The page becomes a reading sequence with a compact sticky index:

1. **Masthead and hero** — name, editorial thesis, availability signal, and public profile links.
2. **Index** — numbered anchors for Previous work, Selected work, Capabilities, and Contact.
3. **01 / Previous work at Xmind** — the primary expandable narrative: AI-enabled knowledge work, canvas interaction, streaming agents, product analytics, and reliable release work.
4. **02–03 / Selected work** — two concise project narratives, each expandable from a directory-like row.
5. **04 / Capabilities** — small, readable domain groupings rather than a card grid.
6. **Closing / Contact** — GitHub and LinkedIn calls to action.

Desktop reading width stays near 65–72 characters for prose. Mobile remains a normal vertical document with no horizontal scrolling, hover-only controls, or scroll-jacking.

## Interaction and motion

Motion supports orientation and emphasis, not spectacle:

- The index reflects the active section via `IntersectionObserver`.
- Project rows expand and collapse through visible buttons that work with keyboard and assistive technology; only the active item receives the full narrative emphasis.
- Chapter number, title, and rule animate using opacity and transform only. A subtle CSS custom-property-driven parallax treatment is allowed on pointer-capable desktop devices.
- Entering a section can use staggered typography reveals, but no continuous animation, canvas rendering, or large media asset is introduced.
- `prefers-reduced-motion: reduce` disables transitions, parallax, and reveals while preserving all content and controls.

## Implementation boundaries

- Split the current single `App.tsx` into focused presentational components and a small interaction state layer. Content should live in typed data structures so project rows are rendered consistently.
- Install Impeccable with `npx impeccable install` during implementation and use its guidance to review typography, layout rhythm, interaction polish, and responsive states. It must not become a production runtime dependency unless its installer explicitly requires a build-time package.
- Do not add a UI framework, analytics SDK, third-party font CDN, image service, or backend.
- Do not alter `infra/`, `.github/workflows/`, deployed domain configuration, or AWS permissions.

## Testing and verification

- Write tests before implementation for removal of present-tense Xmind copy, the `Previous work at Xmind` case study, accessible expand/collapse behavior, and profile links.
- Verify reduced-motion styling is present and interactive controls remain reachable on mobile.
- Run the full test suite, type check, and production build.
- Use browser verification at desktop and mobile widths to check the editorial hierarchy, index state, keyboard navigation, and project expansion.
- The existing GitHub Actions workflow remains responsible for publishing the approved build through OIDC after a `main` push.
