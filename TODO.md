# Wallpect 實作清單 / Implementation checklist

## 中文

- [x] 建立 React、Vite、TypeScript strict mode、lint、格式化、Vitest 與 Playwright 基礎
- [x] 加入經驗證的 Apple 裝置設定檔 schema 與代表性資料集
- [x] 加入本機上傳驗證與只存在記憶體的圖片生命週期
- [x] 讓預覽與匯出共用適配、變換與 Canvas 渲染器
- [x] 加入資料驅動的 iPhone、iPad、Mac、開孔與螢幕遮罩
- [x] 加入拖曳、縮放、平移、旋轉、填滿／完整顯示、重設、置中與鍵盤控制
- [x] 加入預覽模式、覆疊、裝置資訊與準確度說明
- [x] 加入精確解析度的 PNG、JPEG、WebP 下載
- [x] 加入桌面／流動版版面及無障礙控制
- [x] 加入 Cloudflare Pages headers、設定、離線應用程式外殼、CI 與文檔
- [x] 加入單元、整合、端對端與瀏覽器視覺檢查
- [x] 在 Chromium、WebKit、Microsoft Edge 與 Firefox 執行自動相容性檢查
- [x] 加入預設繁體中文，並支援簡體中文與英文切換
- [x] 完成提交前的依賴、機密、瀏覽器介面與安全 header 審查
- [ ] 建立 Cloudflare Pages 專案並綁定 `wallpect.k-y.cc`（需要部署權限）
- [ ] 完成實體裝置 Safari、低記憶體流動裝置、CMYK JPEG 與 EXIF 手動 QA

## English

- [x] Bootstrap React, Vite, TypeScript strict mode, lint, formatting, Vitest, and Playwright
- [x] Add validated Apple Device Profile schema and representative data set
- [x] Add local upload validation and memory-only image lifecycle
- [x] Share fit/transform/Canvas renderer between preview and export
- [x] Add data-driven iPhone, iPad, Mac, cutout, and screen masks
- [x] Add drag, zoom, pan, rotate, Fill/Fit, reset, center, and keyboard controls
- [x] Add preview modes, overlays, device information, and accuracy notes
- [x] Add PNG, JPEG, WebP exact-resolution download
- [x] Add desktop/mobile layout and accessible controls
- [x] Add Cloudflare Pages headers, configuration, offline shell, CI, and documentation
- [x] Add unit, integration, E2E, and visual browser checks
- [x] Run automated compatibility checks in Chromium, WebKit, Microsoft Edge, and Firefox
- [x] Default to Traditional Chinese and support Simplified Chinese and English switching
- [x] Complete pre-commit dependency, secret, browser-surface, and security-header review
- [ ] Create the Cloudflare Pages project and bind `wallpect.k-y.cc` (requires deployment access)
- [ ] Complete physical-device Safari, low-memory mobile, CMYK JPEG, and EXIF manual QA
