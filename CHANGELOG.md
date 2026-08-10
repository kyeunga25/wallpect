# Changelog

All notable changes to Wallpect are recorded in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-08-10

### Added

- Added common legacy iPhone, iPad, Intel MacBook, iMac, Apple display, Studio Display XDR, and Pro Display XDR coverage.
- Added searchable compatible-model metadata and a backward-compatible mapping from previous per-model profile IDs.

### Changed

- Consolidated 74 per-model entries into 47 distinct wallpaper configurations covering 191 named Apple models; configurations remain separate when cutout, logical canvas, safe area, or overlay geometry differs.
- Split Apple device data into platform modules outside UI components and exposed model counts, year ranges, diagonals, and compatible-model details in the bilingual interface.
- Expanded both READMEs with the Cloudflare Workers Static Assets deployment model, technology stack, safe self-hosting steps, runtime AI boundary, and source acknowledgements.
- Expanded the bilingual deployment guide with fork-safe Wrangler configuration, local and Workers Builds workflows, Custom Domain setup, deployed verification, rollback, and public-repository data controls.
- Removed a jurisdiction-specific privacy reference from the public documentation and in-app legal links.

### Security

- Extended profile validation to reject duplicate compatible-model names, malformed alias metadata, and identical wallpaper configurations that were not consolidated.
- Kept recent-device migration limited to canonical device identifiers; image bytes, filenames, composition state, and export settings remain browser-memory only.

## [0.2.3] - 2026-08-02

### Added

- Added a bilingual architecture document covering the browser-only boundary, data lifecycle, renderer invariants, offline model, and verification gates.
- Added production-mode browser coverage for exact PNG/JPEG/WebP dimensions, zero post-upload HTTP(S) egress, Object URL cleanup, offline navigation, keyboard editing, dark OS preference stability, and every mobile editor panel.
- Added raw build-size budgets and Chromium, WebKit, and Firefox jobs to GitHub CI; Microsoft Edge remains part of the complete local browser matrix.

### Changed

- Migrated recent-device preferences from `wallpect:recent-devices` to the sanitized, versioned `wallpect:recent-devices:v1` key.
- Replaced simulated listbox options with native device-selection buttons and labelled every information dialog through its visible heading and introduction.
- Fixed the accepted light-rail/dark-stage interface to a light browser color scheme so operating-system dark preference does not recolor native controls.
- Updated service-worker installation and activation lifecycles, bypassed HTTP cache during update checks, and limited offline shell fallback to navigation requests.
- Expanded the release process with explicit public-data review, fixed-SHA merge, deployed-asset byte comparison, and evidence requirements before tagging.

### Security

- Updated `minimatch` and `brace-expansion` in the development dependency lock to a patched release for CVE-2026-14257.
- Confirmed zero known vulnerabilities in the complete and production npm dependency graphs at release preparation time.

## [0.2.2] - 2026-07-25

### Added

- Added Traditional Chinese and English terms, privacy, disclaimer, trademark, and data-source notices inside the app.
- Added a public legal, privacy, and data policy with a review gate for future third-party sources, SDKs, and APIs.
- Added profile validation for safe source URLs, real review dates, finite geometry, in-bounds overlays, and unique slugs.
- Added automated coverage for the legal and privacy interface on desktop and mobile.

### Changed

- Documented the exact browser-memory, versioned `localStorage`, browser-cache, and Cloudflare network-data boundaries.
- Prevented overlapping image decodes and restored same-file selection after a decode attempt.
- Updated Wrangler to `4.114.0`, pinned GitHub Actions to reviewed commits, and limited CI permissions to read-only repository contents.
- Tightened public-repository hygiene and release review guidance.

### Security

- Restricted device-profile source URLs to credential-free HTTPS links on `support.apple.com`.
- Confirmed zero known npm vulnerabilities in both the complete and production dependency graphs at release preparation time.

## [0.2.1] - 2026-07-23

### Changed

- Moved `wallpect.k-y.cc` from a Worker route over the former Pages DNS record to a Workers Custom Domain.
- Updated deployment and rollback documentation for the Workers-only production architecture.

### Removed

- Removed the redundant Cloudflare Pages project, its public `pages.dev` deployment endpoint, and duplicate Git builds.

## [0.2.0] - 2026-07-19

### Added

- Added Workers Builds production deployment from `main` and preview versions for non-production branches.
- Added local Workers validation, preview, deployment, and deployed-environment E2E commands.
- Added a repeatable release, production verification, and rollback guide.

### Changed

- Migrated production from Cloudflare Pages to an assets-only Worker with Static Assets, explicit SPA fallback, and the existing Pages project retained as a rollback path.
- Pinned Wrangler and aligned the bilingual project, contribution, deployment, implementation, and product documentation with the current architecture.
- Added immutable caching for fingerprinted JavaScript and CSS while keeping the service worker revalidated.

## 0.1.0 - 2026-07-16

### Added

- Privacy-first browser-only wallpaper composition and exact-resolution PNG, JPEG, and WebP export.
- 74 Apple display profiles: 27 iPhone, 20 iPad, and 27 Mac/display profiles.
- Complete requested coverage for iPhone 13 and later, iPad models introduced in 2021 or later, and Macs with built-in displays introduced in 2021 or later, current through July 2026.
- Traditional Chinese, Simplified Chinese, and English interfaces.
- Desktop and mobile editor layouts, device search, recent devices, orientation controls, safe-area guides, and system-overlay previews.
- Automated unit, integration, browser, privacy, and exact-output checks.
- MIT license, contribution guide, bilingual project documentation, and Cloudflare Pages deployment configuration.

### Changed

- Device previews now use profile-specific screen corner geometry and distinguish MacBook laptop frames from desktop Mac/display frames.
- The device picker now exposes model year, diagonal size, physical resolution, accuracy level, category counts, and searchable profile metadata.
- Apple device sources and review dates were refreshed on 2026-07-16.

### Security

- Uploaded images remain in browser memory and are not sent to an upload API or analytics service.
- Local secrets, credentials, build output, browser reports, and editor/OS metadata are excluded from version control.

[Unreleased]: https://github.com/kyeunga25/wallpect/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/kyeunga25/wallpect/compare/v0.2.3...v0.3.0
[0.2.3]: https://github.com/kyeunga25/wallpect/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/kyeunga25/wallpect/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/kyeunga25/wallpect/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/kyeunga25/wallpect/releases/tag/v0.2.0
