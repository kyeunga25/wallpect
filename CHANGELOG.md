# Changelog

All notable changes to Wallpect are recorded in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-08-11

### Added

- Added a bounded 50-step undo/redo history for each device and orientation, with continuous drag, pinch, wheel, slider, and number-field edits grouped into meaningful steps.
- Added visible composition-history controls, `Command`/`Ctrl` keyboard shortcuts, and one-pixel directional nudging on desktop and mobile.
- Added an accessible original-composition comparison that leaves the edited transform and export result unchanged, then returns to the edit automatically when adjustment resumes.
- Added a distraction-free focus preview that enlarges the existing Canvas on desktop and mobile, preserves the active composition, and restores the editor by button or `Escape`.
- Added an accessible mobile workspace-size control that gives long editing panels more room and restores the balanced preview without changing the composition.
- Added an immediate composition check beside Fill/Fit that explains the current crop in plain language on desktop and mobile.
- Added an undoable “Show whole image” action for noticeable or heavy crop, and moved the composition check to the start of Adjust so the result is visible before manual controls.
- Added a first-screen quick-position row for centering or moving an image by 10% of the active canvas, while retaining exact X/Y fields and one-pixel nudging.
- Added undoable content-position controls that expose useful left/centre/right or top/middle/bottom alignments only when the image geometry has room to move, giving touch and keyboard users an alternative to repeated dragging.
- Added a live-value Precise controls disclosure for exact X/Y, one-pixel nudging, and rotation on desktop and mobile.
- Added source-pixel enlargement feedback to the composition check, device information, and exact-output summary using the same geometry as preview and export.
- Added progressive export options so exact output and the primary download stay visible before optional format, filename, quality, and guide controls.
- Added a one-tap preview orientation control that remains available in the mobile editing flow and distraction-free focus preview.

### Changed

- Made device search span iPhone, iPad, Mac, and Apple display configurations without requiring users to choose the correct category first.
- Kept desktop and mobile device selectors aligned with the selected device family and improved pasted-resolution and multi-term matching.
- Kept desktop adjustment controls in reach by collapsing the full device browser until requested and automatically returning to the compact device summary after selection; the dedicated mobile device panel remains fully expanded.
- Increased key mobile editor controls to comfortable 44 px touch targets while preserving the compact scrollable workspace.
- Replaced the non-interactive mobile sheet grabber with explicit “More controls” and “More preview” actions, and kept the header within 320 px-wide viewports with 44 px language and menu targets.
- Made Adjust the mobile starting panel and return target after successful image or device selection; removing the image returns to Image.
- Reordered the desktop reference rail to keep the common export action within the first 1280 × 720 viewport while retaining complete device information below it.
- Kept solid, transparent, and blurred-extension backgrounds close to Fill/Fit and the new content-position controls so uncovered areas can be handled immediately on desktop and mobile.
- Made estimated crop account for zoom, normalized position, and rotation by clipping the transformed image bounds against the wallpaper canvas.
- Replaced the generic loaded-image icon with the active local thumbnail and reset all per-device/orientation transforms and histories when the image is replaced or removed.
- Made zoom, rotation, and export-quality tracks reflect their actual range position instead of a fixed fill, with matching unit-aware accessible values.
- Reordered common adjustment controls ahead of advanced precision fields and folded the latter by default to reduce scanning and scrolling without removing editing accuracy.
- Made mode-specific overlay changes open their matching Lock Screen/Desktop or Safe area preview automatically, while keeping the composition grid and device cutout independent of preview mode.

### Security

- Kept local thumbnails on bundled same-origin or browser-generated `blob:` URLs; enlargement feedback and content positioning use dimensions and rendering geometry without pixel analysis, persistence, or image network requests.
- Added a deterministic public-safety check for high-confidence credentials, private paths, personal email addresses, Cloudflare resource identifiers, sensitive file types, and generated/private state without printing matched values.
- Added deployed third-party licence notices and a privacy-safe security reporting policy that uses GitHub private vulnerability reporting instead of a public email address.
- Disabled Wrangler usage metrics, deployment dependency metadata instrumentation, and Worker observability explicitly in the project configuration.
- Updated the affected Vite, jsdom, and Wrangler development dependency chains so both production-only and complete dependency audits report no known vulnerabilities.
- Added a CI gate for high- or critical-severity dependency advisories and made the Wrangler CI privacy settings explicit.

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

[Unreleased]: https://github.com/kyeunga25/wallpect/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/kyeunga25/wallpect/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/kyeunga25/wallpect/compare/v0.2.3...v0.3.0
[0.2.3]: https://github.com/kyeunga25/wallpect/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/kyeunga25/wallpect/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/kyeunga25/wallpect/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/kyeunga25/wallpect/releases/tag/v0.2.0
