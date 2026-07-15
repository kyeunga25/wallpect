# Changelog

All notable changes to Wallpect are recorded in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
