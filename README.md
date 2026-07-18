<div align="center">

# Wallpect

**Privacy-first wallpaper preview and fitting for Apple devices.**

[Open Wallpect](https://wallpect.k-y.cc) · [繁體中文](README.zh-Hant.md) · [Documentation](#documentation)

[![CI](https://github.com/kyeunga25/wallpect/actions/workflows/ci.yml/badge.svg)](https://github.com/kyeunga25/wallpect/actions/workflows/ci.yml)
[![Latest release](https://img.shields.io/github/v/release/kyeunga25/wallpect?display_name=tag&sort=semver)](https://github.com/kyeunga25/wallpect/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-2563eb.svg)](LICENSE)
[![Live app](https://img.shields.io/badge/Live-wallpect.k--y.cc-16a34a.svg)](https://wallpect.k-y.cc)

</div>

![Wallpect desktop workspace showing an iPhone wallpaper preview and export controls](docs/screenshots/wallpect-desktop.png)

Wallpect helps you compose an image for a selected Apple device, inspect likely system obstructions, and export it at the profile's exact pixel dimensions. Image decoding, editing, preview, and export all happen inside your browser—there is no image upload endpoint, account, or third-party image analysis.

## What you can do

| Inspect                                                                         | Compose                                                                          | Export                                                                           |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Check aspect ratio, cutouts, Safe Area, Lock Screen, menu bar, and Dock guides. | Drag, zoom, pan, rotate, fill, fit, or extend an image against a device preview. | Download PNG, JPEG, or WebP at the selected profile's physical pixel dimensions. |

### Highlights

- 74 profiles: 27 iPhone, 20 iPad, and 27 Mac/display profiles, covering every requested display family introduced from 2021 through July 2026
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

Your image stays in browser memory and is released when it is replaced or the page is closed. Only preferences such as the recent device identifier may be saved in `localStorage`.

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

## Local development

Requirements: Node.js 22 or newer and npm.

```bash
git clone https://github.com/kyeunga25/wallpect.git
cd wallpect
npm ci
npm run dev
```

Run the core quality checks:

```bash
npm run check
npm run format:check
npm run worker:check
```

The Playwright suite additionally covers Chromium, WebKit, Microsoft Edge, and Firefox:

```bash
npm run test:e2e
```

Set `PLAYWRIGHT_BASE_URL` to run the same browser matrix against a deployed Workers preview or the production app.

## Deployment and releases

Wallpect is deployed as an assets-only Cloudflare Worker with Static Assets. A push to `main` triggers a production Workers Build; non-production branches create preview versions without changing production traffic. The previous Pages project is retained only as a documented rollback path.

See the [deployment guide](docs/DEPLOYMENT.md) for platform settings and the [release guide](docs/RELEASING.md) for the version, validation, preview, production, and rollback checklist.

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

## Documentation

- [Accuracy policy](docs/ACCURACY_POLICY.md)
- [Device profile guide](docs/DEVICE_PROFILE_GUIDE.md)
- [Deployment guide](docs/DEPLOYMENT.md)
- [Release guide](docs/RELEASING.md)
- [Product requirements and implementation plan](docs/WALLPECT_PRODUCT_REQUIREMENTS_AND_IMPLEMENTATION_PLAN.md)
- [Implementation checklist](TODO.md)
- [Changelog](CHANGELOG.md)

## Contributing

Issues and focused pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before changing device data, rendering behavior, or privacy-sensitive code.

## License and disclaimer

Wallpect is available under the [MIT License](LICENSE).

Wallpect is an independent tool. It is not affiliated with or endorsed by Apple Inc. Apple product names are used only to identify compatible device profiles.
