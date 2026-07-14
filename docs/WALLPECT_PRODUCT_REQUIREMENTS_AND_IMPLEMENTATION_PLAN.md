# Wallpect — 產品需求與實作計劃

> 可直接交給 Codex 執行的 Product Requirements Document（PRD）與 Implementation Plan
> 工作名稱：**Wallpect**
> Repository：`wallpect`
> 公開測試網址：`wallpect.k-y.cc`
> 部署平台：Cloudflare Pages
> 文件狀態：Draft v0.1
> 目標：先完成可公開使用的 Apple-first MVP，同時保留擴展至 Android 及其他裝置的架構

---

## 1. 專案摘要

Wallpect 是一個以 Apple 裝置壁紙為核心的瀏覽器工具，MVP 優先支援不同型號的 iPhone、iPad 與 Mac。用戶可以：

1. 上傳一張圖片；
2. 選擇特定 Apple 裝置與型號；
3. 立即看到該圖片放入模擬裝置螢幕後的效果；
4. 按裝置的真實輸出解像度、長寬比例、圓角、瀏海、Dynamic Island、選單列或其他遮擋區域預覽；
5. 在裝置預覽內直接縮放、拖曳、旋轉及調整裁切；
6. 將調整結果重新輸出為該裝置適用的精確像素尺寸；
7. 下載後直接在 iPhone、iPad 或 Mac 的系統壁紙設定中選擇該圖片，盡量毋須再手動調整尺寸。

預覽畫面必須呈現「模擬裝置外殼 + 真實比例螢幕區域 + 作為 Wallpaper 的圖片 + 可選系統 UI Overlay」。圖片必須位於裝置螢幕遮罩內，並被圓角、瀏海、Dynamic Island、相機開孔或螢幕邊界正確裁切。

產品的核心價值不是單純 Resize，而是：

> 讓用戶先在指定 Apple 裝置上完成構圖與裁切，再下載已按目標裝置解像度輸出的壁紙，減少在系統設定壁紙時再次縮放或移動圖片的需要。

MVP 應優先採用本地瀏覽器處理圖片，避免將用戶圖片上傳到伺服器，降低基礎設施成本、私隱風險和日常維護工作。

---

## 2. 名稱與識別

### 2.1 工作名稱

- 英文名稱：**Wallpect**
- 中文描述：**手機壁紙畫幅預覽器**
- 英文描述：**Wallpaper Resolution & Safe Area Previewer**
- 標語候選：
  - `See the exact fit before you set it.`
  - `Preview every pixel, crop with confidence.`
  - `Fit your wallpaper to every screen.`

### 2.2 專案命名

```text
GitHub repository: wallpect
Cloudflare Pages project: wallpect
Production/public beta: wallpect.k-y.cc
Development preview: dev.wallpect.k-y.cc
```

### 2.3 品牌使用原則

- 不在主品牌名稱中使用 Apple、iPhone 或其他裝置品牌。
- Apple、iPhone、iPad 等名稱只用於描述支援的裝置。
- 頁尾加入：
  - `Wallpect is not affiliated with or endorsed by Apple Inc.`
- 不使用 Apple 官方 Logo 或模仿 Apple 官方產品介面作為 Wallpect 品牌識別。
- 「Wallpect」目前只作工作名稱；正式商業化前仍需再進行商標及網域查核。

---

## 3. 產品目標

### 3.1 主要目標

1. 提供準確的手機螢幕解像度與長寬比例資料。
2. 讓用戶直觀預覽壁紙在指定手機上的裁切結果。
3. 顯示重要遮擋區域及安全區域。
4. 允許用戶調整圖片位置、縮放與背景填充方式。
5. 匯出符合指定裝置像素尺寸的圖片。
6. 圖片預設只在用戶瀏覽器內處理。
7. 讓新裝置資料可透過 Device Profile 更新，而不需要大幅修改 UI。
8. 將運行成本維持在 Cloudflare 免費或極低成本範圍。

### 3.2 Apple-first 產品範圍

MVP 的裝置資料、介面及測試應以 Apple 產品為主，優先次序如下：

1. **iPhone**
   - 第一優先；
   - 覆蓋不同螢幕尺寸、長寬比例及頂部結構；
   - 包括 Dynamic Island、Notch、舊式無瀏海型號；
   - 支援 Lock Screen 與 Clean Screen 預覽；
   - 輸出為該型號的目標壁紙像素尺寸。

2. **iPad**
   - 第二優先；
   - 覆蓋 iPad、iPad mini、iPad Air、iPad Pro 的代表型號；
   - 支援直向及橫向；
   - 顯示圓角、狀態列及可能的系統 UI 安全區域；
   - 同一張圖片可分別保存直向與橫向調整結果。

3. **Mac**
   - 第三優先；
   - 覆蓋代表性的 MacBook Air、MacBook Pro、iMac 及 Apple Display；
   - 以內置顯示器或指定螢幕的原生像素尺寸作為輸出目標；
   - 預覽可顯示瀏海、選單列、Dock 與桌面安全區域；
   - 支援桌面 Fill、Fit、Stretch、Center 等模式的近似模擬。

MVP 不要求一次收錄所有歷代 Apple 裝置。應先建立一組具代表性、資料可驗證的型號，再透過資料驅動的 Device Profile 持續增加。

### 3.3 裝置模擬準確度原則

「模擬裝置的模樣及大小」在產品中應定義為：

- 裝置外形、螢幕比例、螢幕邊界、圓角、邊框、瀏海及 Dynamic Island 位置應按 Profile 顯示；
- 不同裝置並排時，外觀尺寸應按實際螢幕尺寸或機身尺寸的相對比例呈現；
- 單一裝置編輯模式可自動放大至工作區，但必須保留正確長寬比例；
- 網頁預覽不聲稱在未校準顯示器上呈現真實厘米／毫米物理尺寸；
- 裝置外殼只用於預覽，不寫入最終壁紙；
- 最終輸出只包含調整後的壁紙圖像，不包含手機、平板或電腦外框；
- 系統 UI Overlay 預設不寫入輸出。

### 3.4 次要目標

1. 支援多裝置同時預覽。
2. 支援批量輸出。
3. 提供可分享的設定 Preset。
4. 後續加入 Android、平板、桌面及摺疊裝置。
5. 後續加入智能主體定位及背景延伸。

### 3.5 非目標（MVP 不做）

- 不做完整 Photoshop 類圖片編輯器。
- 不做社交平台圖片模板工具。
- 不做 App Store 宣傳截圖編輯器。
- 不做帳戶系統。
- 不做雲端專案儲存。
- 不做多人協作。
- 不做生成式 AI。
- 不做原生 iOS 或 Android App。
- 不保證完全模擬所有 iOS 動態效果、字體縮放、桌布景深及系統級演算法。

---

## 4. 目標用戶

### 4.1 普通手機用戶

需求：

- 想知道一張圖片放在自己手機上會否被裁走。
- 想避免人臉、角色、Logo 或文字被瀏海、Dynamic Island 或時鐘遮住。
- 想輸出準確尺寸的壁紙。

### 4.2 壁紙設計者與插畫師

需求：

- 為不同手機型號預先製作適配版本。
- 減少逐部手機手動測試。
- 需要一致、可重複的輸出流程。

### 4.3 內容創作者與小型設計工作者

需求：

- 為客戶快速生成多個手機版本。
- 確認圖片主體在不同長寬比中仍然合適。
- 批量輸出及使用統一命名。

### 4.4 開發者與 UI 設計師

需求：

- 查閱裝置尺寸、像素密度及安全區域。
- 測試 Splash image、背景圖或全螢幕視覺素材。

---

## 5. 核心使用流程

### 5.1 首次進入

1. 用戶開啟 `wallpect.k-y.cc`。
2. 首頁直接顯示：
   - 上傳圖片區；
   - 裝置選擇器；
   - 私隱說明；
   - 支援格式及尺寸限制。
3. 用戶不需要註冊。

### 5.2 上傳圖片

支援：

- PNG
- JPEG / JPG
- WebP

建議限制：

- 單張最大 30 MB；
- 最長邊最大 12,000 px；
- 若超過瀏覽器穩定處理範圍，提示用戶先壓縮；
- MVP 不支援 HEIC，除非所選前端解碼方案已穩定支援。

上傳後：

- 讀取圖片寬度、高度、比例和檔案大小；
- 不自動上傳至任何伺服器；
- 顯示 `Processed locally in your browser`。

### 5.3 選擇 Apple 裝置

用戶可以按以下方式選擇：

- 產品類別：iPhone／iPad／Mac；
- 產品系列；
- 型號；
- 螢幕方向；
- 常用／最近使用裝置；
- 搜尋型號。

選擇型號後，系統必須立即載入：

- 模擬裝置外殼；
- 與該型號匹配的螢幕遮罩；
- 真實輸出解像度；
- 長寬比例；
- 圓角；
- Dynamic Island／Notch／瀏海；
- Safe Area；
- 可選 Lock Screen、Home Screen 或 Desktop Overlay；
- 預設的壁紙適配模式。

MVP 裝置優先：

- iPhone：先覆蓋 Dynamic Island、Notch、無瀏海、小尺寸、標準尺寸及 Plus／Max；
- iPad：至少覆蓋 mini、標準 iPad、Air、Pro 的代表尺寸；
- Mac：至少覆蓋 13／14／15／16 吋級別的代表 MacBook，以及一款 iMac 或 Apple 顯示器 Profile。

### 5.4 模擬裝置預覽與調整

上傳圖片並選擇裝置後，系統必須直接進入可編輯的模擬裝置預覽：

1. 先繪製裝置外殼或螢幕框；
2. 在裝置螢幕區域內顯示上傳圖片作為 Wallpaper；
3. 使用螢幕 Shape Mask 裁切圖片；
4. 在圖片之上顯示可選的系統 UI Overlay；
5. 允許用戶直接拖曳圖片及使用控制項調整。

用戶可調整：

- 圖片縮放；
- X 軸位置；
- Y 軸位置；
- 旋轉；
- Fill／Fit 模式；
- 背景色；
- 模糊背景延伸；
- 重設；
- 自動置中；
- 針對直向／橫向分別保存調整；
- 鎖定主體位置（Post-MVP 可加入）。

互動要求：

- 圖片可在模擬螢幕內直接拖曳；
- 滑鼠滾輪／觸控手勢可縮放；
- 雙擊或按 Reset 可恢復預設構圖；
- 圖片超出螢幕區域的部分應被遮罩，不可顯示在裝置外殼上；
- 預覽的圖片構圖必須與最終輸出使用同一套 Transform；
- 切換 Overlay 不可改變圖片位置與縮放。

顯示資訊：

- 原圖像素；
- 裝置輸出像素；
- 原圖比例；
- 裝置比例；
- 預計裁切百分比；
- 被裁切的上下／左右區域；
- 安全區域；
- 可能被系統 UI 遮擋的區域；
- 下載後建議使用的系統壁紙顯示模式。

### 5.5 切換預覽模式

MVP 建議有三種模式：

1. **Clean Screen**
   - 只顯示螢幕本體及裁切。
2. **Lock Screen**
   - 顯示時鐘、日期、Dynamic Island／Notch、底部快捷操作等近似遮擋層。
3. **Safe Area**
   - 顯示安全區域、危險區域及邊界。

Post-MVP：

4. **Home Screen**
   - 顯示 App icon grid、Dock、Widget 區域。
5. **Always-On Display**
6. **Landscape**
7. **StandBy Mode**

### 5.6 匯出

MVP 匯出：

- PNG；
- JPEG；
- WebP；
- 原始裝置像素；
- 自訂品質；
- 自訂檔名；
- 單一裝置下載。

檔名預設：

```text
wallpect-{device-slug}-{orientation}-{width}x{height}.{ext}
```

例子：

```text
wallpect-iphone-15-pro-portrait-1179x2556.png
```

### 5.7 下載後直接使用

輸出目標是讓用戶下載後可直接到 Apple 系統設定選擇圖片，而不需要另外使用圖片編輯器調整尺寸。

系統必須：

- 使用目標 Device Profile 的指定輸出像素；
- 將已確認的縮放、位置、旋轉及背景處理寫入圖片；
- 不把模擬裝置外框、控制點或安全區域寫入正常輸出；
- 在下載前顯示目標裝置與輸出尺寸；
- 提供簡短使用提示，例如：
  - iPhone／iPad：在相片或設定中選擇圖片作為壁紙；
  - Mac：在系統設定的 Wallpaper 中選擇下載圖片；
- 對可能被系統再次自動縮放的情況提供提示。

重要限制：

- Wallpect 可以輸出正確尺寸與預先調整好的構圖；
- Apple 系統仍可能因 iOS／iPadOS／macOS 版本、Extend Wallpaper、Perspective Zoom、景深效果、顯示縮放或 Fill 模式再作處理；
- 因此產品目標是「盡量毋須再手動調整」，而不是保證所有系統版本完全不改變圖片。

Post-MVP：

- 多裝置 ZIP；
- 批量匯出；
- Preset；
- 下載清單；
- 儲存上次設定。

---

## 6. 功能需求

## FR-001：本地圖片載入

系統必須：

- 在瀏覽器內解碼圖片；
- 不將圖片內容傳送到 Cloudflare Worker、第三方 API 或分析服務；
- 在圖片載入失敗時顯示可理解錯誤；
- 在重新整理或離開頁面時清除記憶體中的圖片資料。

驗收：

- 開啟瀏覽器 DevTools Network 面板時，圖片內容不應出現在外部 Request。
- 使用者可在離線狀態下完成基本預覽及輸出，前提是網站資源已載入。

## FR-002：裝置資料選擇

每個裝置必須包含：

- 品牌；
- 型號；
- 裝置 Slug；
- 發布年份；
- 螢幕方向；
- 物理解像度；
- 邏輯 Viewport；
- Device Pixel Ratio；
- Aspect Ratio；
- 圓角半徑；
- 頂部遮擋區類型；
- Safe Area Insets；
- 狀態列區域；
- Home Indicator 區域；
- 資料來源與最後更新日期；
- Accuracy Level。

驗收：

- 用戶可以搜尋裝置型號。
- 選擇裝置後，預覽比例立即更新。
- UI 顯示該裝置的輸出像素尺寸。

## FR-003：Apple 裝置外觀與螢幕模擬

系統必須：

- 根據 Device Profile 顯示 iPhone、iPad 或 Mac 的裝置外形；
- 顯示正確長寬比例、螢幕圓角、邊框及 Cutout；
- 將 Wallpaper Canvas 放在裝置螢幕遮罩內；
- 對 iPhone／iPad 支援直向，並在 Profile 允許時支援橫向；
- 對 Mac 顯示螢幕外框，並可開關瀏海、選單列及 Dock；
- 提供「只看螢幕」與「顯示完整裝置」模式；
- 使用相對比例表示不同裝置大小；
- 不使用未獲授權的 Apple 官方產品圖片作為必要功能資產。

驗收：

- 選擇不同型號後，裝置外形、螢幕比例與 Cutout 會同步更新；
- Wallpaper 僅在螢幕區域內可見；
- 任何超出螢幕遮罩的圖像不會出現在裝置外殼；
- 裝置外框不包含在正常下載圖片中；
- 同一個 Profile 的 Preview 與 Export 尺寸邏輯一致。

## FR-004：圖片適配

系統必須提供：

- Cover／Fill；
- Contain／Fit；
- 自訂 Zoom；
- X／Y 平移；
- Reset；
- 自動置中。

驗收：

- 圖片不應因 UI 重繪而突然跳位。
- 在同一設定下輸出結果應與預覽構圖一致。
- 縮放和平移操作在主流桌面瀏覽器中保持流暢。

## FR-005：安全區域與遮擋層

系統必須能切換：

- 安全區域邊界；
- Dynamic Island／Notch；
- 狀態列；
- Lock Screen 時鐘；
- 底部操作區；
- Home Indicator。

驗收：

- 所有 Overlay 只影響預覽，不寫入輸出圖片，除非用戶明確選擇匯出帶標記版本。
- Overlay 可透過一個總開關關閉。
- 每個 Overlay 都能顯示圖例或 Tooltip。

## FR-006：準確度提示

系統必須明確說明：

- 裝置硬件像素尺寸可以準確記錄；
- 實際壁紙顯示可能受 iOS 版本、Perspective Zoom、Extend Wallpaper、景深效果、顯示縮放和用戶設定影響；
- Lock Screen UI 屬近似模擬，不是 Apple 官方渲染結果。

Accuracy Level 建議：

- `verified`：由官方規格及實機／可信資料交叉確認；
- `high`：官方解像度已確認，部分安全區域由可靠資料推算；
- `estimated`：部分遮擋或圓角資料為推算；
- `legacy`：舊裝置資料未完整更新。

## FR-007：輸出

系統必須：

- 按目標 Apple 裝置 Profile 指定的輸出像素尺寸輸出；
- 將用戶已完成的縮放、位置、旋轉及背景處理寫入圖片；
- 保持預覽與輸出構圖一致；
- 支援 PNG、JPEG、WebP；
- 允許選擇 JPEG／WebP 品質；
- 顯示目標裝置、輸出尺寸及方向；
- 顯示預估檔案大小或在輸出後顯示實際大小；
- 不在圖片中加入 Watermark；
- 正常輸出不包含裝置外殼及 Overlay；
- 下載完成後顯示在 iPhone、iPad 或 Mac 設定壁紙的簡短提示。

## FR-008：響應式網站

網站必須：

- 支援桌面；
- 支援平板；
- 可在手機瀏覽器內基本使用；
- 桌面版優先提供最佳編輯體驗。

建議 Layout：

- Desktop：
  - 左側：上傳、裝置及數值控制；
  - 中央：裝置預覽；
  - 右側：尺寸資訊、Overlay、輸出。
- Mobile：
  - 預覽置頂；
  - 控制區使用 Bottom Sheet 或 Tabs；
  - 保持可觸控拖曳和縮放。

## FR-009：無障礙

最低要求：

- 所有按鈕有可讀 Label；
- 可用鍵盤操作主要功能；
- 輸入欄位有明確單位；
- Overlay 不只依靠顏色表示；
- 錯誤訊息與表單欄位關聯；
- 焦點樣式可見；
- 支援 `prefers-reduced-motion`。

---

## 7. 非功能需求

### 7.1 效能

目標：

- 初次載入 JavaScript 經壓縮後盡量低於 500 KB；
- Lighthouse Performance 桌面版目標 ≥ 90；
- 10 MB 圖片載入後，基本拖曳和縮放保持流暢；
- 大圖處理應使用 Web Worker／OffscreenCanvas（在支援時）；
- 避免每次拖曳都重新生成完整輸出 Canvas。

### 7.2 私隱

- 圖片預設只在本地處理；
- 不保存圖片；
- 不使用需要讀取圖片內容的第三方分析；
- 可使用 Cloudflare Web Analytics，但應確認不收集圖片；
- 頁面提供簡短 Privacy 說明。

### 7.3 安全

- 不執行圖片內嵌腳本；
- 驗證 MIME Type 及實際可解碼性；
- 限制圖片尺寸及記憶體使用；
- 使用 Content Security Policy；
- 所有依賴鎖定版本；
- 不在前端放置秘密或 API Key。

### 7.4 相容性

MVP 支援最近兩個主要版本：

- Chrome；
- Edge；
- Firefox；
- Safari。

### 7.5 可維護性

- TypeScript strict mode；
- Device Profile 與 UI 分離；
- 核心圖片計算函式必須有單元測試；
- 不將裝置數據散落在 JSX／Component 中；
- 所有裝置尺寸使用明確單位。

---

## 8. 技術架構

### 8.1 建議技術棧

```text
Framework: React
Build tool: Vite
Language: TypeScript
Styling: Tailwind CSS or CSS Modules
State: Zustand or React state
Canvas: Canvas 2D API
Heavy processing: Web Worker + OffscreenCanvas where supported
Testing: Vitest + React Testing Library + Playwright
Linting: ESLint
Formatting: Prettier
Deployment: Cloudflare Pages
Package manager: npm or pnpm
```

優先原則：

- MVP 不需要後端。
- 不需要 Cloudflare D1、R2、KV 或 Queues。
- 不需要登入。
- 不需要 Worker API。
- 所有圖片編輯及輸出在瀏覽器完成。

### 8.2 邏輯模組

```text
UI Layer
├── Upload
├── Device Selector
├── Editor Controls
├── Preview
├── Overlay Controls
└── Export Panel

Application Layer
├── Editor State
├── Device Profile Selection
├── Preview Mode
└── Export Settings

Domain Layer
├── Crop / Fit Calculation
├── Coordinate Transform
├── Safe Area Model
├── Resolution Validation
└── Export Naming

Infrastructure Layer
├── Canvas Renderer
├── Image Decoder
├── File Download
├── Local Storage
└── Device Profile Loader
```

### 8.3 建議 Repository 結構

```text
wallpect/
├── public/
│   ├── icons/
│   └── device-assets/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── routes.tsx
│   ├── components/
│   │   ├── upload/
│   │   ├── device-selector/
│   │   ├── editor-controls/
│   │   ├── preview/
│   │   ├── overlays/
│   │   └── export/
│   ├── core/
│   │   ├── fit.ts
│   │   ├── transforms.ts
│   │   ├── device-renderer.ts
│   │   ├── renderer.ts
│   │   ├── export.ts
│   │   └── validation.ts
│   ├── data/
│   │   ├── devices/
│   │   │   ├── apple/
│   │   │   └── index.ts
│   │   └── schemas/
│   ├── hooks/
│   ├── state/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   └── workers/
│       └── image.worker.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── DEVICE_PROFILE_GUIDE.md
│   ├── ACCURACY_POLICY.md
│   └── DEPLOYMENT.md
├── .github/
│   └── workflows/
├── AGENTS.md
├── README.md
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 9. Device Profile 資料模型

### 9.1 TypeScript Interface

```ts
export type DeviceAccuracy = "verified" | "high" | "estimated" | "legacy";

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DeviceProfile {
  id: string;
  brand: "Apple";
  platform: "iOS" | "iPadOS" | "macOS";
  category: "iphone" | "ipad" | "macbook" | "imac" | "display";
  family: string;
  model: string;
  slug: string;
  releaseYear: number;

  chassis?: {
    physicalWidthMm?: number;
    physicalHeightMm?: number;
    physicalDepthMm?: number;
    screenDiagonalInches?: number;
    bezelStyle?: "edge-to-edge" | "classic" | "laptop" | "desktop-display";
    assetId?: string;
  };

  display: {
    physicalWidthPx: number;
    physicalHeightPx: number;
    logicalWidthPt?: number;
    logicalHeightPt?: number;
    devicePixelRatio?: number;
    aspectRatio: number;
    orientation: "portrait" | "landscape";
    cornerRadiusPx?: number;
  };

  cutout: {
    type: "none" | "notch" | "dynamic-island" | "camera-hole" | "custom";
    boundsPx?: Rect;
  };

  safeArea: {
    insetsPx: Insets;
    source: "official" | "measured" | "derived" | "estimated";
  };

  overlays: {
    statusBar?: Rect;
    lockScreenClock?: Rect;
    homeIndicator?: Rect;
    bottomActions?: Rect[];
    menuBar?: Rect;
    dock?: Rect;
  };

  wallpaperBehavior?: {
    systemMayZoom: boolean;
    systemMayExtend: boolean;
    notes?: string[];
  };

  metadata: {
    sourceUrls: string[];
    lastVerified: string;
    accuracy: DeviceAccuracy;
    notes?: string[];
  };
}
```

### 9.2 JSON 例子

```json
{
  "id": "apple-iphone-example",
  "brand": "Apple",
  "family": "iPhone",
  "model": "Example Model",
  "slug": "iphone-example",
  "releaseYear": 2025,
  "display": {
    "physicalWidthPx": 1206,
    "physicalHeightPx": 2622,
    "logicalWidthPt": 402,
    "logicalHeightPt": 874,
    "devicePixelRatio": 3,
    "aspectRatio": 0.4600,
    "orientation": "portrait",
    "cornerRadiusPx": 150
  },
  "cutout": {
    "type": "dynamic-island",
    "boundsPx": {
      "x": 480,
      "y": 36,
      "width": 246,
      "height": 90
    }
  },
  "safeArea": {
    "insetsPx": {
      "top": 180,
      "right": 72,
      "bottom": 120,
      "left": 72
    },
    "source": "estimated"
  },
  "metadata": {
    "sourceUrls": [],
    "lastVerified": "2026-07-13",
    "accuracy": "estimated"
  }
}
```

注意：以上例子只用於展示 Schema，不可當作真實裝置資料。

---

## 10. 圖片適配演算法

### 10.1 Cover 模式

目標：

- 圖片完全覆蓋裝置輸出畫布；
- 允許部分內容被裁切；
- 使用者可調整焦點。

基本公式：

```text
scale = max(canvasWidth / imageWidth, canvasHeight / imageHeight)
renderWidth = imageWidth × scale
renderHeight = imageHeight × scale
```

### 10.2 Contain 模式

目標：

- 完整顯示圖片；
- 可能出現留白或背景延伸。

```text
scale = min(canvasWidth / imageWidth, canvasHeight / imageHeight)
```

### 10.3 使用者 Transform

Editor state 建議：

```ts
export interface ImageTransform {
  scale: number;
  translateX: number;
  translateY: number;
  rotationDeg: number;
  fitMode: "cover" | "contain";
}
```

必須確保：

- Preview Canvas 和 Export Canvas 使用同一套 transform 計算；
- UI 座標與輸出像素座標之間有明確轉換；
- 不依賴 DOM screenshot 產生最終圖片；
- 最終輸出直接由 Canvas render。

### 10.4 背景模式

MVP：

- Solid color；
- Transparent（只適用 PNG／WebP）；
- Blurred extension。

Blurred extension 流程：

1. 先用 Cover 模式將圖片放大成背景；
2. 套用模糊；
3. 再用 Contain 或使用者 transform 放置前景；
4. 避免模糊背景越過 Alpha 邊界產生黑邊。

---

## 11. UI 與互動規格

### 11.1 首頁／工作區

頁面區域：

1. Header
2. Upload and Device Controls
3. Main Device Preview
4. Adjustment Controls
5. Device Information
6. Export
7. Privacy and Accuracy Notes
8. Footer

### 11.2 Header

包含：

- Wallpect Logo／文字；
- `About`;
- `Device data`;
- `Privacy`;
- GitHub link；
- `Beta` 標記。

### 11.3 Upload Panel

內容：

- Drag and drop；
- Browse files；
- 支援格式；
- 本地處理說明；
- 圖片 metadata；
- Remove／Replace。

### 11.4 Device Selector

選項：

- 搜尋框；
- 品牌 Filter；
- 系列 Filter；
- 型號列表；
- 收藏或最近選擇；
- 裝置卡顯示尺寸和年份。

### 11.5 Preview

需求：

- 使用 SVG／CSS 建立裝置外框；
- 內部圖片由 Canvas 顯示；
- 外框不應寫入最終 Wallpaper；
- 可開關：
  - Frame；
  - Safe area；
  - Cutout；
  - Lock screen UI；
  - Grid；
  - Center guides。

### 11.6 Editor Controls

最低包括：

- Zoom Slider；
- X position；
- Y position；
- Rotate；
- Fit mode；
- Background；
- Reset；
- Center；
- Keyboard step controls。

快捷鍵候選：

```text
Arrow keys: move
Shift + Arrow: larger move
+ / -: zoom
R: reset
0: center
```

### 11.7 Device Information

顯示：

- Model；
- Physical resolution；
- Logical viewport；
- Device pixel ratio；
- Aspect ratio；
- Safe area；
- Accuracy；
- Last verified；
- Notes。

### 11.8 Export Panel

選項：

- Format；
- Quality；
- Exact resolution；
- Filename；
- Download；
- Export preview with guides（可選，預設關閉）。

---

## 12. 錯誤處理

錯誤類型：

- 不支援格式；
- 檔案太大；
- 圖片解碼失敗；
- 瀏覽器記憶體不足；
- Canvas 尺寸超過限制；
- Device Profile 無效；
- 匯出失敗；
- 瀏覽器不支援必要 API。

錯誤訊息原則：

- 指出發生甚麼；
- 說明是否有替代方案；
- 不只顯示 `Something went wrong`；
- 不清除用戶目前設定，除非必要。

例子：

```text
This image is too large for your browser to process safely.
Try exporting or resizing it below 12,000 pixels on the longest side.
```

---

## 13. 分析與監察

MVP 可使用：

- Cloudflare Web Analytics；
- Cloudflare Pages deployment logs；
- 前端 Error Boundary；
- 可選的匿名錯誤記錄。

不能收集：

- 用戶圖片；
- 圖片內容；
- 圖片檔名，如可能包含個人資料；
- Canvas pixel data；
- 裝置本地檔案路徑。

可收集：

- 頁面瀏覽；
- 裝置 Profile 選擇次數；
- Export format；
- 是否匯出成功；
- 匿名瀏覽器錯誤類型。

所有分析事件應集中封裝，方便完全關閉。

---

## 14. 測試計劃

### 14.1 單元測試

必須測試：

- Cover scale；
- Contain scale；
- Transform 座標；
- Crop 邊界；
- Aspect ratio；
- Safe area 驗證；
- Filename generator；
- Device Profile schema；
- Export dimensions。

### 14.2 Component 測試

- 圖片上傳；
- Device selector；
- Slider；
- Overlay toggle；
- Export form；
- Error messages。

### 14.3 E2E 測試

主要流程：

1. 開啟網站；
2. 上傳測試圖片；
3. 選擇 iPhone Profile；
4. 調整 Zoom 及位置；
5. 開關 Safe Area；
6. 匯出 PNG；
7. 驗證下載檔案尺寸；
8. 驗證重新整理後圖片不被保存。

### 14.4 視覺回歸

對以下內容保存 Screenshot baseline：

- Desktop workspace；
- Mobile workspace；
- Notch device；
- Dynamic Island device；
- Safe area overlay；
- Lock screen overlay；
- Error states。

### 14.5 手動 QA

至少測試：

- 小圖；
- 超大圖；
- 超闊圖；
- 超長圖；
- 透明 PNG；
- CMYK JPEG（如瀏覽器可解碼）；
- 旋轉 EXIF；
- Safari；
- Firefox；
- 低記憶體手機瀏覽器。

---

## 15. Cloudflare 部署

### 15.1 MVP

使用 Cloudflare Pages：

```text
Repository: wallpect
Build command: npm run build
Output directory: dist
Production branch: main
```

Custom domains：

```text
wallpect.k-y.cc
dev.wallpect.k-y.cc
```

建議：

- `main` → `wallpect.k-y.cc`
- Pull Request／Preview deployment → Cloudflare Pages preview URL
- `develop` 分支如需要 → `dev.wallpect.k-y.cc`

### 15.2 Headers

至少設定：

```text
Content-Security-Policy
X-Content-Type-Options: nosniff
Referrer-Policy
Permissions-Policy
Cross-Origin-Opener-Policy where compatible
```

需要確認 Canvas、Web Worker、Blob URL 和下載功能不被 CSP 阻擋。

### 15.3 快取

- 靜態 JS／CSS 使用 fingerprint 長期快取；
- `device-profiles.json` 使用版本號或 Hash；
- HTML 使用較短快取；
- 不快取任何用戶圖片，因為圖片不離開瀏覽器。

---

## 16. 開發里程碑

## Milestone 0：Repository 初始化

交付：

- Vite + React + TypeScript；
- ESLint；
- Prettier；
- Vitest；
- Playwright；
- Cloudflare Pages build；
- README；
- AGENTS.md；
- 基本 CI。

驗收：

- `npm install`
- `npm run dev`
- `npm run build`
- `npm test`
- `npm run lint`

全部正常。

## Milestone 1：Apple Device Profile 系統

交付：

- Device Profile schema；
- JSON／TS validator；
- iPhone、iPad、Mac Profile 資料結構；
- 首批具代表性的 Apple 型號；
- Device selector；
- Profile metadata；
- Accuracy badge；
- 裝置相對尺寸及 Chassis metadata。

驗收：

- 可加入新裝置而不修改 Preview Component 核心邏輯；
- 無效 Profile 在 Build 或 Test 階段失敗。

## Milestone 2：圖片上傳與 Apple 裝置模擬 Preview

交付：

- Drag and drop；
- File validation；
- Canvas preview；
- iPhone／iPad／Mac 裝置外形；
- 螢幕 Shape Mask；
- Wallpaper 顯示於裝置螢幕內；
- Cover／Contain；
- Zoom；
- Pan；
- Reset；
- Device frame；
- Full-device／screen-only 切換。

驗收：

- 預覽與 Transform 穩定；
- 圖片不離開瀏覽器；
- 大圖有安全限制。

## Milestone 3：Overlay 與資訊

交付：

- Safe area；
- Cutout；
- Status bar；
- Lock screen clock；
- Device metadata panel；
- Accuracy notice。

驗收：

- Overlay 可開關；
- Overlay 不寫入預設輸出；
- 不同 Profile 使用不同位置資料。

## Milestone 4：Export

交付：

- PNG；
- JPEG；
- WebP；
- 品質選擇；
- Exact resolution；
- Filename；
- Download。

驗收：

- 下載圖片尺寸完全等於 Device Profile 的物理解像度；
- 輸出構圖與預覽一致；
- 透明背景只在支援格式出現。

## Milestone 5：Responsive、Accessibility 與部署

交付：

- Desktop／Mobile UI；
- Keyboard；
- Focus states；
- Error handling；
- Cloudflare deployment；
- `wallpect.k-y.cc`；
- Privacy page；
- Accuracy page。

驗收：

- 主流瀏覽器通過 smoke test；
- Lighthouse 基本指標達標；
- 公開網址可正常使用。

## Milestone 6：Post-MVP

候選：

- 多裝置 grid；
- ZIP export；
- Android profiles；
- Home Screen overlay；
- 自訂裝置；
- Preset；
- PWA；
- Smart focal point；
- AI background extension；
- Developer API。

---

## 17. MVP 優先級

### P0：必須完成

- 本地圖片上傳；
- Apple Device Profile；
- iPhone、iPad、Mac 類別選擇器；
- 首批具代表性的 Apple 型號；
- 模擬裝置外形與螢幕遮罩；
- Wallpaper 顯示於模擬裝置螢幕內；
- 準確像素尺寸；
- Cover／Contain；
- 直接拖曳、Zoom／Pan；
- Safe area；
- Cutout；
- 單一裝置精確尺寸輸出；
- 下載後直接使用提示；
- Cloudflare Pages；
- 私隱說明；
- Accuracy 說明。

### P1：應該完成

- Lock Screen overlay；
- JPEG／WebP；
- Mobile responsive；
- Keyboard；
- Device search；
- Recently used；
- Blur background；
- Export filename。

### P2：可以延後

- 多裝置同時預覽；
- ZIP；
- Android；
- Home Screen；
- Login；
- Cloud save；
- AI；
- API。

---

## 18. 驗收標準與 Definition of Done

MVP 完成必須同時符合：

1. 用戶無需登入即可使用。
2. 用戶圖片不會上傳至伺服器。
3. 用戶可選擇至少 10 個具代表性的 iPhone Profile、至少 4 個 iPad Profile，以及至少 4 個 Mac／Display Profile。
4. 選擇型號後，UI 會顯示對應的模擬裝置外形、螢幕遮罩、解像度、比例及資料準確度。
5. 上傳圖片會作為 Wallpaper 顯示於模擬裝置螢幕內。
6. 用戶可直接拖曳、移動、縮放和旋轉圖片。
7. 用戶可顯示或隱藏 Safe Area、Cutout 及相關系統 UI Overlay。
8. 用戶可下載已套用調整、並符合目標裝置像素尺寸的輸出圖片。
9. 正常輸出不包含模擬裝置外框或 Overlay。
10. 預覽和輸出構圖一致。
11. 基本功能在 Chrome、Safari、Firefox、Edge 可用。
12. `wallpect.k-y.cc` 已部署。
13. README、Device Profile Guide 和 Accuracy Policy 完成。
14. 核心計算有單元測試。
15. E2E 覆蓋完整的「上傳 → 選擇 Apple 裝置 → 預覽 → 調整 → 下載」流程。
16. 無已知 P0 級別錯誤。

---

## 19. Codex 實作指令

以下內容應放進 `AGENTS.md` 或交給 Codex 作為執行規則。

### 19.1 開始前

Codex 必須：

1. 閱讀本文件；
2. 檢查現有 repository 狀態；
3. 不假設 repository 為空；
4. 先建立或更新 TODO；
5. 將工作拆成可驗證的小步驟；
6. 每完成一個 Milestone 都執行 lint、test 和 build。

### 19.2 實作原則

- 使用 TypeScript strict mode。
- 不在 Component 中硬編碼 Device Profile。
- 不加入沒有 MVP 用途的後端。
- 不加入帳戶、付款、資料庫或 AI。
- 不將圖片傳送到伺服器。
- 不使用 DOM screenshot 產生匯出圖片。
- Preview 與 Export 共用核心 transform 邏輯。
- 優先使用瀏覽器原生 API。
- 避免大型圖片編輯依賴，除非有明確理由。
- 所有外部依賴需要記錄用途。
- 每個重要計算函式都需要測試。
- 所有裝置 Profile 必須通過 Schema 驗證。
- 不將估算數據標示為 verified。
- 不聲稱提供 Apple 官方預覽。

### 19.3 Codex 執行順序

```text
1. Inspect repository
2. Bootstrap project
3. Add quality tooling
4. Define domain types and schemas
5. Add initial iPhone, iPad, and Mac device profiles
6. Implement image upload
7. Implement transform calculations
8. Implement device shell and screen-mask renderer
9. Render wallpaper inside the simulated device
10. Implement direct manipulation, device frame, and overlays
11. Implement exact-resolution export
12. Add responsive UI
13. Add tests
14. Add Cloudflare deployment
15. Update documentation
16. Run full validation
```

### 19.4 每個階段輸出

Codex 每次工作應回報：

- 修改了甚麼；
- 主要設計決定；
- 執行了哪些測試；
- 尚未完成內容；
- 已知限制；
- 下一個建議步驟。

### 19.5 禁止事項

Codex 不應：

- 靜默改變產品名稱；
- 自行加入帳戶系統；
- 自行加入收費牆；
- 自行改用需要圖片上傳的第三方服務；
- 在未驗證數據時聲稱「Pixel-perfect」；
- 將 Apple 專有素材提交至 repository；
- 提交 API Key、Token 或 Cloudflare Secret；
- 跳過測試直接標示完成。

---

## 20. 建議初始 GitHub Issues

```text
1. Bootstrap React + TypeScript + Vite project
2. Add linting, formatting, unit tests, and E2E tests
3. Define DeviceProfile schema and validation
4. Add initial iPhone, iPad, and Mac device profiles
5. Implement proportional Apple device shell renderer
6. Implement screen shape masks for iPhone, iPad, and Mac
7. Implement local image upload and validation
8. Implement cover and contain calculations
9. Implement direct drag, zoom, pan, and rotation editor state
10. Render uploaded image as wallpaper inside selected device
11. Add device frame, cutout, and Mac notch overlays
12. Add safe-area, lock-screen, menu-bar, and Dock overlays
13. Implement exact-resolution image export without device frame
14. Add responsive layout and mobile controls
15. Add privacy and accuracy documentation
16. Configure Cloudflare Pages deployment
17. Add end-to-end upload-to-export test
```

---

## 21. 建議 README 開頭

```md
# Wallpect

Wallpect is a privacy-first wallpaper preview and fitting tool.

Upload an image, select a phone model, inspect its exact resolution,
aspect ratio, crop area, cutout, and safe-area overlays, then export a
wallpaper at the target device resolution.

## Principles

- Images stay in the browser
- Exact output dimensions
- Device profiles are data-driven
- Preview and export share the same rendering logic
- Accuracy levels are disclosed
```

---

## 22. 已知風險

### 22.1 裝置資料準確度

風險：

- 官方可能只公布螢幕解像度，不公布所有壁紙安全區域；
- 不同 iOS 版本可能改變 Lock Screen UI；
- Wallpaper 系統可能自動 Zoom 或 Extend。

應對：

- 每個 Profile 加 Accuracy Level；
- 顯示來源及驗證日期；
- 將硬件尺寸與 UI Overlay 分開；
- 提供「Report incorrect data」入口。

### 22.2 瀏覽器記憶體

風險：

- 超高解像度圖片可能造成 Canvas 崩潰；
- 手機 Safari 記憶體限制較低。

應對：

- 上傳前驗證；
- 建立最大像素面積限制；
- Preview 使用較低解析度；
- Export 才建立目標尺寸 Canvas；
- 完成後主動釋放 Object URL 和 Canvas。

### 22.3 商標與產品名稱

風險：

- Wallpect 可能日後出現同名產品；
- Apple 品牌使用有風險。

應對：

- 正式推出前再查商標；
- 不在品牌主名使用 Apple；
- 加非官方聲明；
- 不模仿 Apple 官方 Logo。

### 22.4 維護成本

風險：

- 新裝置每年發布；
- Android 型號數量龐大。

應對：

- 先 Apple-first；
- Device Profile 資料驅動；
- 建立 Contributor Guide；
- Profile 可由 Community PR 更新；
- 不承諾一開始覆蓋所有手機。

---

## 23. 後續商業化選項

MVP 先維持免費工具。後續可考慮：

- 批量輸出；
- ZIP；
- 無限自訂裝置；
- 設計師 Preset；
- API；
- AI 主體偵測；
- AI 背景延伸；
- 專業 Device Pack；
- 自訂品牌 Overlay；
- 白標工具。

商業化不應破壞：

- 本地圖片處理；
- 基本裝置預覽；
- 基本精確輸出。

---

## 24. 最終產品原則

Wallpect 的優先次序：

1. **準確**
2. **私隱**
3. **簡單**
4. **快速**
5. **可維護**
6. **可擴展**
7. **商業化**

所有實作決定應先回答：

> 這項功能是否令用戶更容易判斷圖片在指定裝置上是否合適？

若答案不明確，應延後至 Post-MVP。
