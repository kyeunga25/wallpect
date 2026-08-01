# Wallpect 版本發布指南 / Release Guide

## 中文

Wallpect 使用 Semantic Versioning，版本資料以 `package.json`、`package-lock.json`、`CHANGELOG.md` 及 Git tag 為準。GitHub Release 只應在對應的 `main` 提交已成功部署及驗證後建立。

### 1. 準備發布

1. 從最新 `main` 建立範圍清晰的分支。
2. 按變更影響更新版本：
   - patch：相容的修正或文檔更正；
   - minor：向後相容的新功能、裝置資料或部署能力；
   - major：不相容的公開行為或資料格式。
3. 同步更新 `package.json` 與 `package-lock.json`。
4. 將 `CHANGELOG.md` 的 `Unreleased` 內容移至帶日期的版本標題。
5. 更新受影響的 README、部署、準確度、裝置資料或產品文件。
6. 審核所有已追蹤及新增檔案，排除私人資料、憑證、供應商識別碼、內部規劃及非公開商業資料；公開設定只保留部署所必需的產品名稱與網址。

### 2. 公開資料外流門檻

在每次 commit、push、pull request、merge、deploy、tag 或 GitHub Release 前，重新核對實際範圍：

```bash
git status --short --branch
git diff --name-status
git diff --check
git diff --cached --name-status
git ls-files --others --exclude-standard
```

逐一檢查 diff、暫存內容及新增檔案，不要用批量加入取代審閱。確認沒有私人圖片、個人資料、對話內容、憑證、API key、Cloudflare 帳戶／資源識別碼、非公開規劃或商業資料。只明確暫存本次已審閱的檔案；範圍不清楚時停止發布。

### 3. 本機驗證

```bash
npm ci
npm run check
npm run format:check
npm run worker:check
npm run test:e2e
npm audit
npm audit --omit=dev
```

`npm run check` 會依次執行 lint、單元／整合測試、strict production build 及 raw build budget。沒有設定 `PLAYWRIGHT_BASE_URL` 時，Playwright 會自行 build 並在 `127.0.0.1:4174` 啟動 production-mode preview。`worker:check` 會以鎖定版本的 Wrangler 檢查 Static Assets 部署包，但不會部署。

### 4. Pull request 預覽

1. 推送非 production branch 並建立 pull request。
2. 記錄 pull request 的 head SHA，並只審閱及批准該 SHA。
3. 確認 GitHub CI 的 quality 與 browser jobs 均通過。
4. 確認 Workers Builds 的 non-production branch build 成功，並取得 preview URL。
5. 對 preview 執行：

```bash
PLAYWRIGHT_BASE_URL=https://<preview-url> npm run test:e2e
```

6. 手動檢查私隱邊界、精確匯出、桌面／流動版版面、SPA 導覽及安全／快取 headers。
7. 合併前重新讀取 head SHA；如有變更，舊審閱無效，必須重新檢查。使用 `gh pr merge <number> --merge --match-head-commit <reviewed-sha>` 或等效的固定 SHA 操作。

### 5. 正式部署與 GitHub Release

1. 以已審閱的固定 SHA 合併 pull request 至 `main`。
2. `git fetch origin` 後將本機 `main` 以 `git merge --ff-only origin/main` 對齊，並確認本機 `HEAD`、`origin/main` 與 GitHub merged commit 一致。
3. 等待該 SHA 的 GitHub CI 及 Workers Builds 正式 build／deploy 完成。
4. 對 `https://wallpect.k-y.cc` 執行相同的 E2E、headers、SPA route 與 no-cache HTTP 檢查；對 hashed JS／CSS 比較本機 `dist` 與正式回應的 bytes／hash。
5. 確認目前 Workers deployment 對應已合併的 `main` 提交及正式流量。若 token 或 Dashboard 權限不足以取得 deployment percentage，必須明確記錄證據缺口，不得聲稱已驗證 100% 流量。
6. 只在 production 驗證通過後，從已驗證的 `main` SHA 建立並推送 `v<version>` tag，再建立 latest GitHub Release。
7. Release notes 應概述用戶可見變更、部署變更、私隱邊界及已知限制，不應包含憑證、內部原因或私人資料。

### 6. 回退

若新版本有問題，優先以 Cloudflare Dashboard 的 Worker → Deployments 選擇上一個穩定版本，或使用 `wrangler rollback <version-id>`。回退會建立一個新的 deployment，並把所選版本設為 100% 正式流量。

`wallpect.k-y.cc` 是 Worker 的 Custom Domain；回退時保留此網域綁定，只切換 deployment version。完成事故記錄及修正前，不要刪除可用的舊 Worker version。

## English

Wallpect follows Semantic Versioning. `package.json`, `package-lock.json`, `CHANGELOG.md`, and the Git tag are the release sources of truth. Create a GitHub Release only after the matching `main` commit has been deployed and verified.

### 1. Prepare the release

1. Create a focused branch from the latest `main`.
2. Select the version by impact:
   - patch: compatible fixes or documentation corrections;
   - minor: backward-compatible features, device data, or deployment capabilities;
   - major: incompatible public behavior or data formats.
3. Keep `package.json` and `package-lock.json` in sync.
4. Move `CHANGELOG.md` entries from `Unreleased` into a dated version section.
5. Update affected README, deployment, accuracy, device-data, or product documentation.
6. Review every tracked and new file for personal data, credentials, provider identifiers, internal planning, and non-public business information. Keep only product names and URLs required for public deployment.

### 2. Public egress gate

Before every commit, push, pull request, merge, deployment, tag, or GitHub Release, re-check the exact scope:

```bash
git status --short --branch
git diff --name-status
git diff --check
git diff --cached --name-status
git ls-files --others --exclude-standard
```

Review each diff, staged change, and new file; do not substitute bulk staging for review. Confirm that the scope contains no private imagery, personal data, conversation content, credentials, API keys, Cloudflare account/resource identifiers, non-public planning, or business data. Stage only explicit reviewed files and stop the release if scope is unclear.

### 3. Validate locally

```bash
npm ci
npm run check
npm run format:check
npm run worker:check
npm run test:e2e
npm audit
npm audit --omit=dev
```

`npm run check` runs lint, unit/integration tests, the strict production build, and the raw build budget. Without `PLAYWRIGHT_BASE_URL`, Playwright builds the app and starts a production-mode preview at `127.0.0.1:4174`. `worker:check` uses the pinned Wrangler version to validate the Static Assets package without deploying it.

### 4. Validate the pull request preview

1. Push a non-production branch and open a pull request.
2. Record the pull request head SHA and review/approve only that SHA.
3. Confirm both GitHub CI quality and browser jobs pass.
4. Confirm the Workers Builds non-production branch build succeeds and obtain its preview URL.
5. Run:

```bash
PLAYWRIGHT_BASE_URL=https://<preview-url> npm run test:e2e
```

6. Manually check the privacy boundary, exact exports, desktop/mobile layouts, SPA navigation, and security/cache headers.
7. Read the head SHA again before merge. If it changed, the prior review is stale and must be repeated. Use `gh pr merge <number> --merge --match-head-commit <reviewed-sha>` or an equivalent fixed-SHA operation.

### 5. Deploy production and publish the GitHub Release

1. Merge the pull request into `main` at the reviewed fixed SHA.
2. After `git fetch origin`, align local `main` with `git merge --ff-only origin/main`, then confirm local `HEAD`, `origin/main`, and the GitHub merged commit agree.
3. Wait for GitHub CI and the production Workers Build/deployment for that SHA.
4. Run the same E2E, header, SPA-route, and no-cache HTTP checks against `https://wallpect.k-y.cc`; byte/hash-compare deployed hashed JS/CSS with local `dist`.
5. Confirm that the active Workers deployment corresponds to the merged `main` commit and production traffic. If token or Dashboard access cannot prove the deployment percentage, record that evidence gap explicitly and do not claim verified 100% traffic.
6. Only after production passes, create and push the `v<version>` tag from the verified `main` SHA, then create the latest GitHub Release.
7. Release notes should cover user-visible changes, deployment changes, the privacy boundary, and known limitations without exposing credentials, private motives, or personal data.

### 6. Roll back

If the release is unhealthy, select the previous stable version under Worker → Deployments in the Cloudflare dashboard, or run `wrangler rollback <version-id>`. A rollback creates a new deployment and sends 100% of production traffic to the selected version.

`wallpect.k-y.cc` is the Worker's Custom Domain. Keep that domain binding in place during rollback and switch only the deployment version. Do not delete usable Worker versions until the incident is recorded and fixed.
