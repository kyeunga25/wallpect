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

### 2. 本機驗證

```bash
npm ci
npm run check
npm run format:check
npm run worker:check
npm run test:e2e
```

`npm run check` 會依次執行 lint、單元／整合測試及 production build。`worker:check` 會以鎖定版本的 Wrangler 檢查 Static Assets 部署包，但不會部署。

### 3. Pull request 預覽

1. 推送非 production branch 並建立 pull request。
2. 確認 GitHub CI 通過。
3. 確認 Workers Builds 的 non-production branch build 成功，並取得 preview URL。
4. 對 preview 執行：

```bash
PLAYWRIGHT_BASE_URL=https://<preview-url> npm run test:e2e
```

5. 手動檢查私隱邊界、精確匯出、桌面／流動版版面、SPA 導覽及安全／快取 headers。

### 4. 正式部署與 GitHub Release

1. 審閱並合併 pull request 至 `main`。
2. 等待 Workers Builds 完成正式 build 及 deploy。
3. 對 `https://wallpect.k-y.cc` 執行相同的 E2E 及部署檢查。
4. 確認目前 Workers deployment 對應已合併的 `main` 提交。
5. 建立 `v<version>` tag 及 GitHub Release，並將該版本標示為 latest。
6. Release notes 應概述用戶可見變更、部署變更、私隱邊界及已知限制，不應包含憑證、內部原因或私人資料。

### 5. 回退

若新版本有問題，優先以 Cloudflare Dashboard 的 Worker → Deployments 選擇上一個穩定版本，或使用 `wrangler rollback <version-id>`。回退會建立一個新的 deployment，並把所選版本設為 100% 正式流量。

若 Workers route 本身有問題，可在 Cloudflare Dashboard 移除 `wallpect.k-y.cc/*` Worker route，讓保留的 Pages custom domain 回復接收流量。完成事故記錄及修正前，不要刪除可用的舊 Worker version 或 Pages project。

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

### 2. Validate locally

```bash
npm ci
npm run check
npm run format:check
npm run worker:check
npm run test:e2e
```

`npm run check` runs lint, unit/integration tests, and the production build. `worker:check` uses the pinned Wrangler version to validate the Static Assets package without deploying it.

### 3. Validate the pull request preview

1. Push a non-production branch and open a pull request.
2. Confirm GitHub CI passes.
3. Confirm the Workers Builds non-production branch build succeeds and obtain its preview URL.
4. Run:

```bash
PLAYWRIGHT_BASE_URL=https://<preview-url> npm run test:e2e
```

5. Manually check the privacy boundary, exact exports, desktop/mobile layouts, SPA navigation, and security/cache headers.

### 4. Deploy production and publish the GitHub Release

1. Review and merge the pull request into `main`.
2. Wait for the production Workers Build and deployment.
3. Run the same E2E and deployment checks against `https://wallpect.k-y.cc`.
4. Confirm that the active Workers deployment corresponds to the merged `main` commit.
5. Create the `v<version>` tag and GitHub Release, and mark that release as latest.
6. Release notes should cover user-visible changes, deployment changes, the privacy boundary, and known limitations without exposing credentials, private motives, or personal data.

### 5. Roll back

If the release is unhealthy, select the previous stable version under Worker → Deployments in the Cloudflare dashboard, or run `wrangler rollback <version-id>`. A rollback creates a new deployment and sends 100% of production traffic to the selected version.

If the Worker route itself is unhealthy, remove the `wallpect.k-y.cc/*` Worker route in the Cloudflare dashboard so the retained Pages custom domain receives traffic again. Do not delete usable Worker versions or the Pages project until the incident is recorded and fixed.
