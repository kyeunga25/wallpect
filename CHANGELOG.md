# Changelog

All notable changes to Wallpect are recorded in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/kyeunga25/wallpect/compare/v0.2.2...HEAD
[0.2.2]: https://github.com/kyeunga25/wallpect/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/kyeunga25/wallpect/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/kyeunga25/wallpect/releases/tag/v0.2.0
