# Wallpect

Wallpect 是一個以隱私為優先的桌布預覽與適配工具。

上傳圖片、選擇 Apple 裝置設定檔，即可檢查精確解析度、長寬比、裁切範圍、開孔與安全區域覆疊，並以目標裝置的解析度匯出桌布。介面首次載入時預設使用繁體中文，也可切換至簡體中文或英文；語言偏好只會儲存在瀏覽器本機。

## 設計原則

- 圖片只留在瀏覽器中
- 精確的輸出尺寸
- 以資料驅動裝置設定檔
- 預覽與匯出共用相同的渲染邏輯
- 清楚標示資料準確度

## MVP 已包含功能

- 12 個代表性 iPhone、5 個 iPad，以及 6 個 Mac／顯示器設定檔
- 在本機解碼 PNG、JPEG 與 WebP，安全限制為 30 MB／最長邊 12,000 px
- 直接拖曳、雙指或滾動縮放、鍵盤微調、數值平移、旋轉，以及填滿／完整顯示
- 純色、透明與模糊延伸背景
- 純桌布、鎖定畫面／桌面與安全區域預覽模式
- 以資料驅動的開孔、安全區域、鎖定畫面、選單列與 Dock 覆疊
- 每部支援裝置分別保存直向／橫向構圖
- 以 Canvas 匯出精確解析度的 PNG、JPEG 與 WebP
- 響應式桌面與流動版工作區
- 預設繁體中文，並可切換簡體中文或英文；偏好設定保存在本機
- 首次載入正式版本後可離線快取應用程式外殼

## 本機開發

需求：Node.js 22 或以上版本，以及 npm。

```bash
npm install
npm run dev
```

品質檢查：

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

端對端測試涵蓋 Chromium、WebKit、本機安裝的 Microsoft Edge，以及 Firefox。

## 架構

```text
src/components     UI 面板與裝置預覽介面
src/state          編輯器狀態、各裝置的構圖變換與偏好設定
src/core           適配、變換、驗證、Canvas 渲染與匯出邏輯
src/data/devices   資料驅動的 Apple 裝置設定檔
src/i18n           預設語言、偏好保存與介面翻譯
src/types          領域模型
tests/unit         計算與資料驗證測試
tests/integration  元件互動測試
tests/e2e          從上傳至匯出的 Playwright 流程
```

預覽與匯出均會呼叫 `renderWallpaper`。平移值會儲存為目標畫布的標準化比例，因此縮小的預覽與完整解析度匯出可保持相同構圖。

## 私隱與限制

上傳圖片的像素、名稱與 Canvas 資料不會傳送到伺服器。最近使用的裝置識別碼可能儲存在 `localStorage`；圖片與 object URL 只存在記憶體中，在圖片被取代或頁面關閉時釋放。

Wallpect 會按所選設定檔輸出精確像素尺寸，但 iOS、iPadOS 與 macOS 仍可能套用系統層級的縮放、延伸桌布、透視、景深或填滿效果。

Wallpect 是獨立工具，與 Apple Inc. 無關，亦未獲其背書。

## 安全控制

- 沒有圖片上傳端點、帳號系統、分析服務或第三方圖片處理
- 圖片進入編輯器前會驗證 MIME、檔案大小、最長邊與總像素數
- Cloudflare Pages 使用嚴格的 Content Security Policy 與瀏覽器權限政策
- 同源 Service Worker 快取只使用 Wallpect 專屬快取名稱
- 正式版本停用 source map
- Git 會排除本機環境檔、憑證、證書、建置輸出與測試產物

## 部署

專案已設定使用 Cloudflare Pages：

- 建置指令：`npm run build`
- 輸出目錄：`dist`
- 預定正式網域：`wallpect.k-y.cc`
- 預定開發網域：`dev.wallpect.k-y.cc`

請參閱 [部署指南](docs/DEPLOYMENT.md)、[裝置設定檔指南](docs/DEVICE_PROFILE_GUIDE.md)、[準確度政策](docs/ACCURACY_POLICY.md)，以及已使用中文撰寫的[產品需求與實作計劃](docs/WALLPECT_PRODUCT_REQUIREMENTS_AND_IMPLEMENTATION_PLAN.md)。

---

## English

Wallpect is a privacy-first wallpaper preview and fitting tool.

Upload an image, select an Apple device profile, inspect its exact resolution, aspect ratio, crop area, cutout, and safe-area overlays, then export a wallpaper at the target device resolution. The interface defaults to Traditional Chinese on first load and can be switched to Simplified Chinese or English; the preference stays in the browser.

### Principles

- Images stay in the browser
- Exact output dimensions
- Device profiles are data-driven
- Preview and export share the same rendering logic
- Accuracy levels are disclosed

### Local development

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

The end-to-end suite covers Chromium, WebKit, the locally installed Microsoft Edge, and Firefox. See the Chinese sections above for the complete feature, architecture, privacy, security, and deployment reference.
