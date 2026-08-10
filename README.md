<div align="center">

# Wallpect

**Privacy-first wallpaper preview and fitting for Apple devices.**

[Open Wallpect](https://wallpect.k-y.cc) · [繁體中文（主要文件）](README.zh-Hant.md) · [Documentation](#documentation)

[![CI](https://github.com/kyeunga25/wallpect/actions/workflows/ci.yml/badge.svg)](https://github.com/kyeunga25/wallpect/actions/workflows/ci.yml)
[![Latest release](https://img.shields.io/github/v/release/kyeunga25/wallpect?display_name=tag&sort=semver)](https://github.com/kyeunga25/wallpect/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-2563eb.svg)](LICENSE)
[![Live app](https://img.shields.io/badge/Live-wallpect.k--y.cc-16a34a.svg)](https://wallpect.k-y.cc)

</div>

![Wallpect desktop workspace showing an iPhone wallpaper preview and export controls](docs/screenshots/wallpect-desktop.png)

Wallpect helps you compose an image for a selected Apple device, inspect likely system obstructions, and export it at the profile's exact pixel dimensions. The production app is deployed on Cloudflare Workers using the assets-only Static Assets mode. Image decoding, editing, preview, and export all happen inside your browser—there is no image upload endpoint, account, database, or third-party image analysis.

## What you can do

| Inspect                                                                         | Compose                                                                          | Export                                                                           |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Check aspect ratio, cutouts, Safe Area, Lock Screen, menu bar, and Dock guides. | Drag, zoom, pan, rotate, fill, fit, or extend an image against a device preview. | Download PNG, JPEG, or WebP at the selected profile's physical pixel dimensions. |

### Highlights

- 47 distinct canvas configurations: 19 iPhone, 11 iPad, and 17 Mac/Apple-display configurations covering 191 named models from 2007–2026
- Devices with the same wallpaper canvas and obstruction geometry share one option; every model name, year, diagonal, and resolution remains searchable
- Local PNG, JPEG, and WebP decoding, limited to 30 MB, 12,000 px on the longest edge, and 72 megapixels
- Portrait and landscape compositions stored independently for each device
- Solid, transparent, or blurred-extension backgrounds
- Shared transform and Canvas rendering calculations for preview and export
- Responsive desktop and mobile workspaces
- Traditional Chinese by default, with Simplified Chinese and English options
- Offline app-shell caching after the first production visit
- Explicit accuracy levels for published, derived, and estimated device data

## Try it

1. Open [wallpect.k-y.cc](https://wallpect.k-y.cc).
2. Use the bundled sample or choose an image from your device.
3. Select a device profile and orientation.
4. Adjust the composition and enable the guides you want to inspect.
5. Choose PNG, JPEG, or WebP and export at the displayed resolution.

Your image stays in browser memory and is released when it is replaced, the page is refreshed, or the page is closed. Only the selected locale (`wallpect:locale:v1`) and up to four recent device identifiers (`wallpect:recent-devices:v1`) are saved in versioned `localStorage`. Normal requests for public site files still pass through Cloudflare, but they do not contain your selected image bytes.

The website provides directly accessible Traditional Chinese and English privacy, terms, disclaimer, and data-source notices. Maintenance and third-party source/API rules are documented in the [Terms, Privacy, and Data Policy](docs/LEGAL_PRIVACY_AND_DATA_POLICY.md).

<p align="center">
  <img src="docs/screenshots/wallpect-mobile.png" width="320" alt="Wallpect mobile workspace showing the device selector and wallpaper preview">
</p>

## Accuracy, by design

Wallpect separates published display facts from geometry that must be measured or derived:

- The selected profile defines the export pixel dimensions and aspect ratio.
- Device frames and system overlays are composition guides, not official Apple renderings.
- Profiles declare an accuracy level; the initial data set is intentionally marked `high`, not `verified`, because much of the obstruction geometry is derived.
- iOS, iPadOS, and macOS may still apply system-level zoom, extension, depth, or fill behavior.

See the [accuracy policy](docs/ACCURACY_POLICY.md) for the complete definition and reporting requirements.

## Technology stack

| Layer                 | Technology                                                | Purpose                                                        |
| --------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| UI and application    | React 19, strict TypeScript 5, Vite 8                     | Typed single-page application compiled to static assets        |
| Browser image runtime | Canvas 2D, File/Blob APIs, Object URLs                    | Local decode, composition, preview, and export                 |
| Interface assets      | Lucide React                                              | Open-source interface icons                                    |
| Hosting               | Cloudflare Workers Static Assets and Wrangler 4           | Assets-only edge delivery, SPA fallback, previews, and deploys |
| Offline shell         | Service Worker and Cache Storage                          | Same-origin app-shell fallback after the first online visit    |
| Quality               | ESLint, Prettier, Vitest, Testing Library, and Playwright | Static checks and unit, integration, and browser testing       |
| Automation            | GitHub Actions and Cloudflare Workers Builds              | Read-only CI checks plus branch previews and production builds |

The current deployment has no SSR, Worker request handler, runtime API, authentication, analytics, database, object-storage binding, or runtime AI model. Exact dependency versions are locked in [`package-lock.json`](package-lock.json), while [`package.json`](package.json) is the readable source of truth for scripts and direct dependencies.

## Local development

Requirements: Node.js 22 or newer and npm.

```bash
git clone https://github.com/kyeunga25/wallpect.git
cd wallpect
npm ci
npm run dev
```

Run the core quality checks. `npm run check` includes lint, unit/integration tests, a strict production build, and the raw build-size budget:

```bash
npm run check
npm run format:check
npm run worker:check
```

The Playwright suite builds the app and starts a production-mode local preview on port `4174`. It covers Chromium, WebKit, Microsoft Edge, and Firefox:

```bash
npm run test:e2e
```

Set `PLAYWRIGHT_BASE_URL` to run the same browser matrix against a deployed Workers preview or the production app.

## Deployment, self-hosting, and releases

Wallpect is deployed as an assets-only Cloudflare Worker with Static Assets. The Worker owns `wallpect.k-y.cc` as a Custom Domain. A push to `main` triggers a production Workers Build; non-production branches create preview versions without changing production traffic. Production rollback uses Workers version history; no Cloudflare Pages project is required.

You can self-deploy a fork to your own Cloudflare account without a database, storage binding, AI key, or runtime secret:

1. Fork or clone the repository and install Node.js 22 or newer.
2. Before the first deploy, edit `wrangler.toml`: choose a Worker `name` in your own account, and remove the checked-in `[[routes]]` block for a `workers.dev` deployment or replace it with a Custom Domain that you control.
3. Install and validate the locked project:

   ```bash
   npm ci
   npm run check
   npm run format:check
   npm run worker:check
   ```

4. Authenticate locally and deploy the static build:

   ```bash
   npx wrangler login
   npm run worker:deploy
   ```

5. Run the browser suite against the URL returned by Wrangler:

   ```bash
   PLAYWRIGHT_BASE_URL=https://<your-worker-url> npm run test:e2e
   ```

Wrangler credentials stay outside the repository. Never add API tokens, account or zone identifiers, deployment IDs, private domains, production data, local paths, logs, or screenshots containing private content to source control. The [deployment and self-hosting guide](docs/DEPLOYMENT.md) contains the safe configuration template, Workers Builds setup, Custom Domain steps, validation checklist, and rollback procedure. The [release guide](docs/RELEASING.md) covers the versioned release workflow.

## Architecture

| Path               | Responsibility                                                |
| ------------------ | ------------------------------------------------------------- |
| `src/components`   | Editor panels, controls, and device preview UI                |
| `src/state`        | Editor state, per-device transforms, and preferences          |
| `src/core`         | Fitting, transforms, validation, Canvas rendering, and export |
| `src/data/devices` | Data-driven Apple device profiles outside the UI              |
| `src/i18n`         | Locale selection, persistence, and translations               |
| `tests`            | Unit, integration, and end-to-end coverage                    |

Preview and export both call `renderWallpaper`. Pan offsets use the target canvas's normalized coordinate space, so a scaled preview and full-resolution export preserve the same composition.

See the [architecture document](docs/ARCHITECTURE.md) for the runtime boundary, local-data lifecycle, storage migration, offline behavior, and verification invariants.

## Documentation

- [Accuracy policy](docs/ACCURACY_POLICY.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Device profile guide](docs/DEVICE_PROFILE_GUIDE.md)
- [Deployment and self-hosting guide](docs/DEPLOYMENT.md)
- [Release guide](docs/RELEASING.md)
- [Legal, privacy, and data policy](docs/LEGAL_PRIVACY_AND_DATA_POLICY.md)
- [Changelog](CHANGELOG.md)

## Contributing

Issues and focused pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before changing device data, rendering behavior, or privacy-sensitive code.

## License and disclaimer

Wallpect is available under the [MIT License](LICENSE).

Wallpect is an independent tool. It is not affiliated with or endorsed by Apple Inc. Apple product names are used only to identify compatible device profiles.

Device specifications are manually curated from linked public manufacturer support pages. Wallpect does not use an Apple or third-party device-data API at runtime and does not scrape or mirror Apple website content. See the [Terms, Privacy, and Data Policy](docs/LEGAL_PRIVACY_AND_DATA_POLICY.md) for the detailed limitations and data-governance gate.

## Technology and source references

- **Web and platform technology:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/docs/), [Vite](https://vite.dev/), the browser [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) and [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), plus [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) and [Wrangler](https://developers.cloudflare.com/workers/wrangler/).
- **Device references:** Each profile records credential-free links to public Apple Support pages. The evidence levels, review rules, and correction process are documented in the [accuracy policy](docs/ACCURACY_POLICY.md) and [device profile guide](docs/DEVICE_PROFILE_GUIDE.md).
- **Privacy and legal references:** Public guidance includes the [Cloudflare Privacy Policy](https://www.cloudflare.com/policies/privacy/), [Apple Website Terms of Use](https://www.apple.com/legal/internet-services/terms/site.html), and [Apple trademark and copyright guidelines](https://www.apple.com/legal/intellectual-property/guidelinesfor3rdparties.html). Their application to Wallpect is summarized in the [legal, privacy, and data policy](docs/LEGAL_PRIVACY_AND_DATA_POLICY.md).
- **Licensing:** Wallpect's source is released under the [MIT License](LICENSE). Third-party packages and referenced content remain subject to their own licences and terms; a link is a source citation, not an endorsement or transfer of rights.
