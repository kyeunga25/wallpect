# Cloudflare Pages 部署指南 / Deployment Guide

## 中文

### 專案設定

```text
Project: wallpect
Production branch: main
Build command: npm run build
Output directory: dist
Node.js: 22 或以上版本
```

Repository 亦包含 `wrangler.toml`、`public/_headers` 與正式版本的 service worker。Vite 會為 JS／CSS 資源加入 hash；Cloudflare 應長期快取這些不可變資源，同時讓 `index.html` 保持較短的快取時間。

### 網域

建議對應：

- `main` → `wallpect.k-y.cc`
- 預覽部署 → Cloudflare Pages 預覽 URL
- 可選的 `develop` branch → `dev.wallpect.k-y.cc`

Pages 專案建立後，必須在 Cloudflare dashboard 加入自訂網域。DNS 與正式部署屬於外部操作，不會由本機建置執行。

### 安全 header

`public/_headers` 會設定 CSP、`nosniff`、referrer policy、permissions policy 與 same-origin opener policy。CSP 刻意只允許同源 scripts／styles，以及本機圖片處理與下載所需的 `blob:` 圖片／worker。收緊設定後，必須重新測試 Canvas 匯出與 service worker。

### 發佈檢查

```bash
npm ci
npm run check
npm run test:e2e
```

然後在已部署 URL 驗證：

1. 首次開啟預設顯示繁體中文，並可切換簡體中文與英文；
2. 內建示範圖片可正常渲染；
3. 上傳圖片時沒有包含圖片 bytes 的網絡請求；
4. iPhone、iPad 與 Mac 設定檔可正確切換；
5. PNG／JPEG／WebP 下載具有設定檔指定的精確尺寸；
6. 桌面與流動版版面沒有水平溢出；
7. 安全 header 已正確提供。

## English

### Project settings

```text
Project: wallpect
Production branch: main
Build command: npm run build
Output directory: dist
Node.js: 22 or newer
```

The repository also includes `wrangler.toml`, `public/_headers`, and a production service worker. Vite hashes JS/CSS assets; Cloudflare should cache those immutable assets while keeping `index.html` short-lived.

### Domains

Suggested mappings:

- `main` → `wallpect.k-y.cc`
- preview deployments → Cloudflare Pages preview URLs
- optional `develop` branch → `dev.wallpect.k-y.cc`

Custom domains must be added in the Cloudflare dashboard after the Pages project exists. DNS and production deployment are external operations and are not performed by the local build.

### Security headers

`public/_headers` sets CSP, `nosniff`, referrer policy, permissions policy, and same-origin opener policy. The CSP intentionally allows same-origin scripts/styles plus `blob:` images/workers for local image handling and download. Re-test Canvas export and the service worker after tightening it.

### Release check

```bash
npm ci
npm run check
npm run test:e2e
```

Then verify on the deployed URL:

1. the first visit defaults to Traditional Chinese and can switch to Simplified Chinese or English;
2. the bundled demo renders;
3. an uploaded image produces no network request containing image bytes;
4. iPhone, iPad, and Mac profiles switch correctly;
5. PNG/JPEG/WebP downloads have exact profile dimensions;
6. desktop and mobile layouts have no horizontal overflow;
7. security headers are present.
