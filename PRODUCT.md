# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

International hiring teams and collaborators reviewing a full-stack engineer's portfolio. They need to understand the work quickly, assess technical and product range, and reach verified public profiles.

## Product Purpose

A static personal portfolio for Weiye Zhu that makes AI-native, full-stack product work legible and memorable for global career opportunities.

## Positioning

An editorial, reading-first portfolio that connects product interaction, agent workflows, frontend, backend, and production delivery instead of presenting isolated technology badges.

## Operating Context

Visitors arrive from recruiting, professional networking, or GitHub. The primary path is reading selected work and capabilities before following a public GitHub or LinkedIn link.

## Capabilities and Constraints

- React and Vite static site deployed through S3 and CloudFront.
- No server, database, CMS, analytics SDK, headshot, private contact address, image service, third-party font CDN, or UI framework.
- GitHub and LinkedIn destinations are public facts that must remain stable.
- Xmind is previous work only; the site must not imply current employment.
- The existing CloudFront self-only Content Security Policy must remain unchanged.
- Motion must respect `prefers-reduced-motion`; project disclosures must be keyboard accessible.

## Brand Commitments

English-first professional voice. The approved visual direction is a premium editorial index: reading-focused, restrained in motion, and without photos or stock imagery.

## Evidence on Hand

The repository contains the existing static portfolio copy and three supportable work narratives: previous work at Xmind, multimodal document imports, and a cross-platform AI companion. Do not fabricate company names, metrics, testimonials, dates, availability dates, or contact details.

## Product Principles

1. Let real work and systems thinking carry the story.
2. Make international hiring review quick without making the page generic.
3. Treat accessibility and reduced motion as first-class experience requirements.
4. Keep the portfolio operationally simple and deployable as a static site.

## Accessibility & Inclusion

Use semantic landmarks and headings, visible keyboard focus, accessible controls and labels, readable line lengths, responsive vertical flow, and a complete reduced-motion alternative.
