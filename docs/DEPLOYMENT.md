# Cloudflare Workers Static Assets 部署與自行託管指南 / Deployment and Self-hosting Guide

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

Repository 亦包含鎖定版本的 Wrangler、`public/_headers` 與正式版本的 service worker。Vite 會為 JS／CSS 資源加入 hash；`_headers` 會長期快取這些不可變資源，同時讓 `index.html` 保持重新驗證，並避免長期快取 `sw.js`。註冊 service worker 時使用 `updateViaCache: "none"`；網絡失敗時只讓導覽請求回退到快取的 `/`，缺少的 JS、CSS 或其他非導覽檔案不會收到 HTML shell。

### 從 fork 自行部署

#### 1. 準備自己的環境

你需要：

- 自己控制的 Cloudflare 帳戶；
- Node.js 22 或更新版本、npm 及 Git；
- repository 的 fork，或一份本機 clone；
- 如要使用 Custom Domain，該 hostname 所屬的 active Cloudflare zone。

此版本不需要 D1、KV、R2、Durable Objects、環境變數、AI key 或任何 runtime secret。不要為了完成基本部署而建立資料庫或 binding。

```bash
git clone https://github.com/<your-account>/wallpect.git
cd wallpect
npm ci
```

#### 2. 先把部署目標改成自己的 Worker

不要直接部署 repository 內原有的 `wrangler.toml`：它描述維護者的公開部署目標。首次部署前，最少要選用自己帳戶內的 Worker `name`，並移除原有的 `[[routes]]`。如先使用免費的 `workers.dev` 網址，可採用以下不含任何 secret 或帳戶識別碼的最小設定：

```toml
name = "your-wallpect"
compatibility_date = "2026-07-18"
workers_dev = true
preview_urls = true

[assets]
directory = "./dist"
not_found_handling = "single-page-application"
```

為重現目前已測試版本，先保留 repository 的 `compatibility_date`；日後更新日期應作為獨立變更，並重新執行完整測試。`name` 只需要是你帳戶內的部署名稱，不要在設定中加入 account ID、zone ID、token 或其他供應者識別碼。

如 fork 會公開，請只提交可公開的 Worker 名稱及你確實希望公開的網域。私人測試網域可留在未追蹤的本機設定中，不要推送至 GitHub。

#### 3. 在部署前完成本機驗證

本機驗證 Workers 靜態資源設定：

```bash
npm run check
npm run format:check
npm run worker:check
```

`npm run check` 已包括 lint、單元／整合測試、strict production build 及 build-size budget；`worker:check` 是 dry-run，不會建立或更新遠端 Worker。

在 Workers runtime 本機預覽：

```bash
npm run build
npm run worker:dev
```

`npm run test:e2e` 會自行建立 production build，並在 `127.0.0.1:4174` 啟動 Vite production preview，因此會實際註冊及檢查 service worker。不要以 Vite dev server 的結果代替離線／更新驗證。

#### 4. 登入及部署到 `workers.dev`

```bash
npx wrangler login
npm run worker:deploy
```

`wrangler login` 會在瀏覽器完成授權；憑證應由 Wrangler 保存在 repository 之外。不要把登入輸出、token、Dashboard 畫面或本機設定複製到 source、issue、pull request 或 build log。部署成功後，Wrangler 會回傳你帳戶下的公開 URL。

#### 5. 驗證已部署版本

```bash
PLAYWRIGHT_BASE_URL=https://<your-worker-url> npm run test:e2e
```

另外以無私人圖片的新瀏覽器 session 手動檢查首頁、任一非檔案導覽路徑、示範圖、匯出尺寸、語言切換、安全 header 與離線 app shell。測試輸出或截圖如包含本機路徑、帳戶資訊或私人圖片，不應加入 Git。

### Custom Domain 與 Git 自動部署

建議對應：

- `main` → `wallpect.k-y.cc` Workers Custom Domain
- 非 production branch → Workers Preview URL
- 可選的 `develop` branch → 獨立 preview 或 staging Worker

`wrangler.toml` 以 `custom_domain = true` 將 `wallpect.k-y.cc` 直接綁定至 Worker。Cloudflare 會為 Custom Domain 管理相應 DNS 記錄及憑證；此專案不依賴外部 origin、Pages CNAME 或 Pages project。發生部署問題時，使用 Workers deployment history 或 `wrangler rollback` 回退，不要移除正式 Custom Domain。

自行託管者只可加入自己控制的 hostname：

```toml
[[routes]]
pattern = "app.example.com"
custom_domain = true
```

Custom Domain 需要 active Cloudflare zone，且目標 hostname 不可有互相衝突的 CNAME。確認 hostname 及帳戶後才再次執行 `npm run worker:deploy`；這個操作會建立／更新 DNS 與憑證，因此不要用不屬於自己的網域測試。

Workers Builds 設定：

1. 連接 GitHub repository；
2. Production branch 設為 `main`；
3. Build command 設為 `npm run build`；
4. Deploy command 使用 Workers Builds 預設的 `npx wrangler deploy`；
5. 開啟 non-production branch builds，並使用預設的 `npx wrangler versions upload` 建立不影響正式流量的 preview version。

Cloudflare Dashboard 內的 Worker 名稱必須與 repository 指定 root directory 內 `wrangler.toml` 的 `name` 相符。Cloudflare 會使用 `package.json` 鎖定的 Wrangler 版本；本機仍可使用 `npm run worker:deploy` 與 `npm run worker:preview` 作為相同命令的簡寫。Workers Builds 自動產生或使用的 build token 只應保存在 Cloudflare Dashboard，不要寫入 GitHub 檔案、README、環境範本或截圖。

相關官方文件：

- [Static Assets 開始及部署](https://developers.cloudflare.com/workers/static-assets/get-started/)
- [Wrangler 設定](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Workers Builds 設定](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Build branch 控制](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)
- [Static Assets SPA 導覽](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [版本回退](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)

### 安全 header

Workers Static Assets 會直接讀取 `public/_headers` 建置後的 `dist/_headers`。它會設定 CSP、`nosniff`、referrer policy、permissions policy、same-origin opener policy 與快取規則。CSP 刻意只允許同源 scripts／styles，以及本機圖片處理與下載所需的 `blob:` 圖片／worker。收緊設定後，必須重新測試 Canvas 匯出與 service worker。

### 公開 repository 安全檢查

每次 push 或部署前，逐一檢查變更：

```bash
git status --short --branch
git diff --name-status
git diff --check
git ls-files --others --exclude-standard
```

不得提交 `.env`、`.dev.vars`、`.wrangler/`、API token、帳戶／zone／deployment 識別碼、私人 hostname、真實用戶圖片或檔名、正式應用數據、資料庫結構、內部架構圖、非公開規劃、個人資料、本機絕對路徑或含上述內容的 log／截圖。這些項目即使暫時可用，也不是自行部署所需的公開設定。

公開文件只應描述可從 source 驗證的產品邊界與通用部署流程。任何新 API、資料庫、遠端圖片處理、分析服務、AI runtime 或 Cloudflare binding 都屬私隱及架構變更，必須先完成獨立設計、法律／私隱審閱及測試，不可直接照本指南加入。

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
3. 上傳圖片後沒有 HTTP(S) 請求，下載使用的 `blob:` URL 及上傳 Object URL 均會釋放；
4. iPhone、iPad 與 Mac 設定檔可正確切換；
5. PNG／JPEG／WebP 下載具有設定檔指定的精確尺寸；
6. 桌面與流動版版面沒有水平溢出；
7. 非檔案導覽路徑會回傳 SPA shell；
8. 安全與快取 header 已正確提供；
9. hashed JS／CSS 使用 immutable cache，而 `sw.js` 仍會重新驗證。
10. 首次連線載入後，離線導覽可開啟 app shell；缺少的非導覽資源會失敗而不是回傳 `index.html`。

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

The repository also includes a pinned Wrangler version, `public/_headers`, and a production service worker. Vite hashes JS/CSS assets; `_headers` caches those immutable assets for the long term while leaving `index.html` revalidated and preventing long-lived caching of `sw.js`. Service-worker registration uses `updateViaCache: "none"`. On network failure, only navigation requests can fall back to cached `/`; a missing JS, CSS, or other non-navigation file does not receive the HTML shell.

### Self-deploy a fork

#### 1. Prepare an account and local environment

You need:

- a Cloudflare account that you control;
- Node.js 22 or newer, npm, and Git;
- a repository fork or local clone;
- an active Cloudflare zone for the hostname if you want a Custom Domain.

This release needs no D1, KV, R2, Durable Objects, environment variables, AI key, or runtime secret. Do not create a database or binding merely to complete the basic deployment.

```bash
git clone https://github.com/<your-account>/wallpect.git
cd wallpect
npm ci
```

#### 2. Point the configuration at your own Worker

Do not deploy the checked-in `wrangler.toml` unchanged: it describes the maintainer's public deployment target. Before the first deployment, choose a Worker `name` in your account and remove the existing `[[routes]]` block. To start with a `workers.dev` URL, use this minimum configuration, which contains no secret or account identifier:

```toml
name = "your-wallpect"
compatibility_date = "2026-07-18"
workers_dev = true
preview_urls = true

[assets]
directory = "./dist"
not_found_handling = "single-page-application"
```

Keep the repository's `compatibility_date` when reproducing the tested release. Update the date later as a separate, fully tested change. `name` is only the deployment name inside your account; do not add an account ID, zone ID, token, or other provider identifier to the configuration.

For a public fork, commit only a publishable Worker name and a domain that you intentionally expose. Keep private test hostnames in an untracked local configuration instead of pushing them to GitHub.

#### 3. Validate locally before deployment

Validate the Workers static assets configuration locally:

```bash
npm run check
npm run format:check
npm run worker:check
```

`npm run check` includes lint, unit/integration tests, the strict production build, and the build-size budget. `worker:check` is a dry run and does not create or update a remote Worker.

Preview with the Workers runtime locally:

```bash
npm run build
npm run worker:dev
```

`npm run test:e2e` creates a production build and starts a Vite production preview at `127.0.0.1:4174`, so it exercises the real service-worker registration and offline behavior. Do not substitute Vite dev-server results for offline/update verification.

#### 4. Authenticate and deploy to `workers.dev`

```bash
npx wrangler login
npm run worker:deploy
```

`wrangler login` completes authorization in the browser. Wrangler credentials must remain outside the repository. Do not paste login output, tokens, dashboard screens, or local configuration into source files, issues, pull requests, or build logs. After a successful deployment, Wrangler returns the public URL under your account.

#### 5. Verify the deployed build

```bash
PLAYWRIGHT_BASE_URL=https://<your-worker-url> npm run test:e2e
```

Also use a fresh browser session without private imagery to inspect the home page, a non-file navigation route, bundled sample, export dimensions, locale switching, security headers, and offline app shell. Do not commit test output or screenshots containing local paths, account information, or private imagery.

### Custom Domains and Git-based deployments

Suggested mappings:

- `main` → the `wallpect.k-y.cc` Workers Custom Domain
- non-production branches → Workers Preview URLs
- optional `develop` branch → a dedicated preview or staging Worker

`wrangler.toml` binds `wallpect.k-y.cc` directly to the Worker with `custom_domain = true`. Cloudflare manages the corresponding DNS record and certificate for the Custom Domain; the project does not depend on an external origin, Pages CNAME, or Pages project. If a deployment is unhealthy, use Workers deployment history or `wrangler rollback` instead of removing the production Custom Domain.

A self-hosted fork must use only a hostname that you control:

```toml
[[routes]]
pattern = "app.example.com"
custom_domain = true
```

A Custom Domain requires an active Cloudflare zone, and the target hostname cannot have a conflicting CNAME. Confirm the hostname and account before running `npm run worker:deploy` again. This operation creates or updates DNS and certificate state, so never test it with a domain that you do not own.

Workers Builds settings:

1. Connect the GitHub repository.
2. Set the production branch to `main`.
3. Set the build command to `npm run build`.
4. Keep the Workers Builds default deploy command, `npx wrangler deploy`.
5. Enable non-production branch builds and keep the default `npx wrangler versions upload` command to create preview versions without affecting production traffic.

The Worker name in the Cloudflare dashboard must match the `name` in `wrangler.toml` under the configured repository root directory. Cloudflare uses the Wrangler version pinned in `package.json`; `npm run worker:deploy` and `npm run worker:preview` remain available as equivalent local aliases. Keep the generated or selected Workers Builds token only in the Cloudflare dashboard. Never add it to GitHub files, a README, an environment template, or a screenshot.

Related official documentation:

- [Static Assets get started and deploy](https://developers.cloudflare.com/workers/static-assets/get-started/)
- [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Build branch control](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)
- [Static Assets SPA routing](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Version rollbacks](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)

### Security headers

Workers Static Assets reads `public/_headers` from the built `dist/_headers`. It sets CSP, `nosniff`, referrer policy, permissions policy, same-origin opener policy, and cache rules. The CSP intentionally allows same-origin scripts/styles plus `blob:` images/workers for local image handling and download. Re-test Canvas export and the service worker after tightening it.

### Public-repository safety check

Review the change set before every push or deployment:

```bash
git status --short --branch
git diff --name-status
git diff --check
git ls-files --others --exclude-standard
```

Never commit `.env`, `.dev.vars`, `.wrangler/`, API tokens, account/zone/deployment identifiers, private hostnames, real user imagery or filenames, production application data, database layouts, internal architecture diagrams, non-public plans, personal data, absolute local paths, or logs/screenshots containing any of them. None of those items is required public configuration for this deployment.

Public documentation should describe only source-verifiable product boundaries and generic deployment procedures. A new API, database, remote image processor, analytics service, AI runtime, or Cloudflare binding is a privacy and architecture change that requires a separate design, legal/privacy review, and test plan. Do not add one by following this guide alone.

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
3. no HTTP(S) request occurs after an image upload, and upload/download Object URLs are released;
4. iPhone, iPad, and Mac profiles switch correctly;
5. PNG/JPEG/WebP downloads have exact profile dimensions;
6. desktop and mobile layouts have no horizontal overflow;
7. non-file navigation paths return the SPA shell;
8. security and cache headers are present;
9. hashed JS/CSS uses immutable caching while `sw.js` remains revalidated.
10. after an initial online load, offline navigation opens the app shell while a missing non-navigation asset fails instead of receiving `index.html`.
