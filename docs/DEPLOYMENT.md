# Cloudflare Workers Static Assets 部署指南 / Deployment Guide

## 中文

### 專案設定

```text
Production branch: main
Build command: npm run build
Deploy command: npx wrangler deploy
Non-production branch deploy command: npx wrangler versions upload
Node.js: 22 或以上版本
```

Wallpect 使用 Workers Static Assets 的純靜態模式。`wrangler.toml` 不包含 `main` 或 `ASSETS` binding，因此請求不會執行 Worker script；圖片仍然只會在瀏覽器內解碼、預覽及匯出。`assets.not_found_handling` 明確設定為 `single-page-application`，讓非檔案導覽路徑回傳 `index.html`。

Repository 亦包含鎖定版本的 Wrangler、`public/_headers` 與正式版本的 service worker。Vite 會為 JS／CSS 資源加入 hash；`_headers` 會長期快取這些不可變資源，同時讓 `index.html` 保持重新驗證，並避免長期快取 `sw.js`。

本機驗證 Workers 靜態資源設定：

```bash
npm run build
npm run worker:check
```

在 Workers runtime 本機預覽：

```bash
npm run build
npm run worker:dev
```

### 網域

建議對應：

- `main` → `wallpect.k-y.cc` Workers Custom Domain
- 非 production branch → Workers Preview URL
- 可選的 `develop` branch → 獨立 preview 或 staging Worker

`wrangler.toml` 以 `custom_domain = true` 將 `wallpect.k-y.cc` 直接綁定至 Worker。Cloudflare 會為 Custom Domain 管理相應 DNS 記錄及憑證；此專案不依賴外部 origin、Pages CNAME 或 Pages project。發生部署問題時，使用 Workers deployment history 或 `wrangler rollback` 回退，不要移除正式 Custom Domain。

Workers Builds 設定：

1. 連接 GitHub repository；
2. Production branch 設為 `main`；
3. Build command 設為 `npm run build`；
4. Deploy command 使用 Workers Builds 預設的 `npx wrangler deploy`；
5. 開啟 non-production branch builds，並使用預設的 `npx wrangler versions upload` 建立不影響正式流量的 preview version。

Cloudflare 會使用 `package.json` 鎖定的 Wrangler 版本；本機仍可使用 `npm run worker:deploy` 與 `npm run worker:preview` 作為相同命令的簡寫。

相關官方文件：

- [Workers Builds 設定](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Build branch 控制](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)
- [Static Assets SPA 導覽](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [版本回退](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)

### 安全 header

Workers Static Assets 會直接讀取 `public/_headers` 建置後的 `dist/_headers`。它會設定 CSP、`nosniff`、referrer policy、permissions policy、same-origin opener policy 與快取規則。CSP 刻意只允許同源 scripts／styles，以及本機圖片處理與下載所需的 `blob:` 圖片／worker。收緊設定後，必須重新測試 Canvas 匯出與 service worker。

### 發佈檢查

```bash
npm ci
npm run check
npm run worker:check
npm run test:e2e
```

針對已部署的 preview 或正式 URL 執行瀏覽器矩陣：

```bash
PLAYWRIGHT_BASE_URL=https://<preview-url> npm run test:e2e
```

然後在已部署 URL 驗證：

1. 首次開啟預設顯示繁體中文，並可切換簡體中文與英文；
2. 內建示範圖片可正常渲染；
3. 上傳圖片時沒有包含圖片 bytes 的網絡請求；
4. iPhone、iPad 與 Mac 設定檔可正確切換；
5. PNG／JPEG／WebP 下載具有設定檔指定的精確尺寸；
6. 桌面與流動版版面沒有水平溢出；
7. 非檔案導覽路徑會回傳 SPA shell；
8. 安全與快取 header 已正確提供；
9. hashed JS／CSS 使用 immutable cache，而 `sw.js` 仍會重新驗證。

## English

### Project settings

```text
Production branch: main
Build command: npm run build
Deploy command: npx wrangler deploy
Non-production branch deploy command: npx wrangler versions upload
Node.js: 22 or newer
```

Wallpect uses the assets-only Workers Static Assets mode. `wrangler.toml` has no `main` entry or `ASSETS` binding, so requests do not invoke a Worker script; images remain decoded, previewed, and exported only in the browser. `assets.not_found_handling` is explicitly set to `single-page-application`, so navigation paths that do not match files receive `index.html`.

The repository also includes a pinned Wrangler version, `public/_headers`, and a production service worker. Vite hashes JS/CSS assets; `_headers` caches those immutable assets for the long term while leaving `index.html` revalidated and preventing long-lived caching of `sw.js`.

Validate the Workers static assets configuration locally:

```bash
npm run build
npm run worker:check
```

Preview with the Workers runtime locally:

```bash
npm run build
npm run worker:dev
```

### Domains

Suggested mappings:

- `main` → the `wallpect.k-y.cc` Workers Custom Domain
- non-production branches → Workers Preview URLs
- optional `develop` branch → a dedicated preview or staging Worker

`wrangler.toml` binds `wallpect.k-y.cc` directly to the Worker with `custom_domain = true`. Cloudflare manages the corresponding DNS record and certificate for the Custom Domain; the project does not depend on an external origin, Pages CNAME, or Pages project. If a deployment is unhealthy, use Workers deployment history or `wrangler rollback` instead of removing the production Custom Domain.

Workers Builds settings:

1. Connect the GitHub repository.
2. Set the production branch to `main`.
3. Set the build command to `npm run build`.
4. Keep the Workers Builds default deploy command, `npx wrangler deploy`.
5. Enable non-production branch builds and keep the default `npx wrangler versions upload` command to create preview versions without affecting production traffic.

Cloudflare uses the Wrangler version pinned in `package.json`; `npm run worker:deploy` and `npm run worker:preview` remain available as equivalent local aliases.

Related official documentation:

- [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Build branch control](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)
- [Static Assets SPA routing](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Version rollbacks](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)

### Security headers

Workers Static Assets reads `public/_headers` from the built `dist/_headers`. It sets CSP, `nosniff`, referrer policy, permissions policy, same-origin opener policy, and cache rules. The CSP intentionally allows same-origin scripts/styles plus `blob:` images/workers for local image handling and download. Re-test Canvas export and the service worker after tightening it.

### Release check

```bash
npm ci
npm run check
npm run worker:check
npm run test:e2e
```

Run the browser matrix against a deployed preview or production URL:

```bash
PLAYWRIGHT_BASE_URL=https://<preview-url> npm run test:e2e
```

Then verify on the deployed URL:

1. the first visit defaults to Traditional Chinese and can switch to Simplified Chinese or English;
2. the bundled demo renders;
3. an uploaded image produces no network request containing image bytes;
4. iPhone, iPad, and Mac profiles switch correctly;
5. PNG/JPEG/WebP downloads have exact profile dimensions;
6. desktop and mobile layouts have no horizontal overflow;
7. non-file navigation paths return the SPA shell;
8. security and cache headers are present;
9. hashed JS/CSS uses immutable caching while `sw.js` remains revalidated.
