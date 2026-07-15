# Contributing to Wallpect

[繁體中文](#繁體中文) · [English](#english)

## 繁體中文

感謝你協助改善 Wallpect。請讓每個 issue 或 pull request 專注於一項清楚的問題，並說明對用戶可見的影響。

### 開始之前

- 使用 Node.js 22 或更新版本。
- 執行 `npm ci` 安裝鎖定版本的依賴。
- 不要加入圖片上傳 API、圖片分析、帳戶追蹤或其他把用戶圖片傳離瀏覽器的功能。
- 預覽與匯出必須共用相同的變換及渲染計算。
- 裝置資料必須位於 `src/data/devices`，不要寫入 UI 元件。
- 推算或估算的設定檔資料不得標示為 `verified`。

### 開發流程

1. 建立範圍清晰的分支及變更。
2. 為行為修正或新邏輯加入相應測試。
3. 修改裝置設定檔時，提供來源、檢查日期、證據類型及準確度等級。
4. 不要提交私人桌布、Apple 專有素材、憑證、環境檔或建置產物。
5. 執行以下檢查：

```bash
npm run lint
npm test
npm run build
```

涉及完整編輯流程、響應式版面或瀏覽器行為時，亦應執行：

```bash
npm run test:e2e
```

### Pull request 清單

- 清楚說明問題、處理方式及用戶影響。
- 列出已執行的測試及結果。
- UI 變更附上不含私人圖片的前後畫面。
- 裝置資料變更連結到可靠來源，並依照[準確度政策](docs/ACCURACY_POLICY.md)標示資料。
- 確認上傳圖片仍只留在瀏覽器中。

一般錯誤或功能建議可使用 GitHub Issues。涉及未公開漏洞或可能洩露資料的問題，請勿在公開 issue 中附上敏感細節。

## English

Thank you for helping improve Wallpect. Keep each issue or pull request focused on one clear problem, and explain the user-visible impact.

### Before you start

- Use Node.js 22 or newer.
- Run `npm ci` to install the locked dependency versions.
- Do not add image upload APIs, image analytics, account tracking, or any feature that sends a user's image out of the browser.
- Preview and export must share the same transform and rendering calculations.
- Keep device data in `src/data/devices`, outside UI components.
- Never label derived or estimated profile data as `verified`.

### Development workflow

1. Create a focused branch and change set.
2. Add tests for behavior fixes or new logic.
3. For device profiles, include sources, review dates, evidence types, and accuracy levels.
4. Do not commit private wallpapers, proprietary Apple assets, credentials, environment files, or generated build output.
5. Run the core checks:

```bash
npm run lint
npm test
npm run build
```

Also run the end-to-end suite when changing the complete editor flow, responsive layout, or browser behavior:

```bash
npm run test:e2e
```

### Pull request checklist

- Explain the problem, approach, and user impact.
- List the tests run and their results.
- Include before/after images for UI changes, without private imagery.
- Link device-data changes to reliable sources and follow the [accuracy policy](docs/ACCURACY_POLICY.md).
- Confirm that uploaded image content still stays in the browser.

Use GitHub Issues for ordinary bugs and feature requests. Do not place sensitive details in a public issue when reporting an undisclosed vulnerability or possible data exposure.
