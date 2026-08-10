# 裝置配置指南 / Device Configuration Guide

## 繁體中文

Wallpect 把「可在選單選取的桌布配置」與「使用該配置的具名裝置型號」分開。資料位於 `src/data/devices/apple/`：`iphone.ts`、`ipad.ts` 與 `mac.ts` 保存平台資料，`catalog.ts` 建立共用結構，`profiles.ts` 只組合公開清單及舊 ID 映射。UI 元件不保存裝置資料。

截至 2026 年 8 月 10 日，資料集提供 47 個互不重複的配置：19 個 iPhone、11 個 iPad，以及 17 個 Mac／Apple 顯示器配置，共覆蓋 191 個具名型號。範圍由第一代 iPhone、早期 iPad 與 Intel Mac，延伸至 iPhone 17e、M5 Mac、Studio Display XDR 與 Pro Display XDR。

Mac mini、Mac Studio 與 Mac Pro 沒有內建螢幕；它們應按實際連接的 Apple 顯示器配置預覽，不會獲得虛構的主機螢幕設定。

### 合併規則

只有下列 wallpaper 相關資料相同時，多個型號才可合併成一個選項：

- 平台及支援方向；
- 實體輸出解析度、邏輯畫布、DPR、長寬比及圓角；
- 瀏海、Dynamic Island 或其他開孔幾何；
- 安全區域及預覽覆疊；
- 系統 wallpaper 行為。

只有相同螢幕吋數或相同實體解析度並不足以合併。例如 iPhone 12 與 iPhone 13 的輸出同為 `1170 × 2532`，但瀏海幾何不同，因此保留兩個配置。相反，iPhone 14 Pro、iPhone 15、iPhone 15 Pro 與 iPhone 16 的畫布及遮擋幾何相同，所以共用一個選項。

每個配置的 `compatibleModels` 保存完整型號名稱、推出年份及對角線；搜尋會讀取所有別名、年份、吋數、實體及邏輯解析度。`releaseYear` 代表該配置內最新型號的年份，只用於排序。合併配置的 `chassis` 是相對外框的代表值，不應被解讀為每個相容型號都具有完全相同的機身尺寸。

### 舊 ID 遷移

0.3.0 以前每個型號各有一個 profile ID。`APPLE_DEVICE_PROFILE_ID_ALIASES` 會把仍可能存在於 `wallpect:recent-devices:v1` 的舊 ID 映射到新的標準配置 ID，去除重複後再寫回。遷移只處理最多四個裝置識別碼，不會加入圖片、檔名、構圖或其他資料。

### 必填資料與驗證

每個配置必須包含：

- 穩定的 `apple-*` ID、slug、平台、類別及精簡顯示名稱；
- 至少一個具唯一名稱、有效年份及正數對角線的 `compatibleModels` 項目；
- 支援方向、代表機身資料、實體像素、邏輯點數、DPR、原生方向及圓角；
- 開孔、安全區域、平台覆疊與 wallpaper 行為；
- 不含憑證的 `https://support.apple.com` 來源、真實檢查日期、準確度及備註。

`validateDeviceProfiles` 會拒絕重複 ID／slug／型號名稱、相同但未合併的 wallpaper 配置、非有限或越界幾何、錯誤長寬比、不安全來源 URL、無效日期，以及與最新相容型號不一致的 `releaseYear`。

### 新增資料

1. 先在 Apple 官方技術規格或型號辨識頁核對型號、年份及原生解析度。
2. 若 wallpaper 配置已存在，只在相應配置的 `compatibleModels` 加入型號及來源；不要建立重複選項。
3. 若開孔、邏輯畫布、安全區域、圓角或系統行為不同，建立新的配置。
4. 未公開的幾何必須標為 `derived` 或 `estimated`；不可把推算資料標為 `verified`。
5. 更新覆蓋數及加入代表性測試，並執行 `npm run lint`、`npm test` 與 `npm run build`。

所有像素幾何均使用設定檔的原生實體座標空間。原生直向配置的橫向幾何由 `orientDevice` 與 `orientRect` 旋轉；預覽與匯出仍共用 `renderWallpaper`。

## English

Wallpect separates a selectable wallpaper configuration from the named device models that use it. Data lives under `src/data/devices/apple/`: `iphone.ts`, `ipad.ts`, and `mac.ts` hold platform records, `catalog.ts` creates the shared structure, and `profiles.ts` only assembles the public list and previous-ID map. UI components do not own device data.

As reviewed on 10 August 2026, the data set provides 47 distinct configurations: 19 iPhone, 11 iPad, and 17 Mac/Apple-display configurations covering 191 named models. Coverage runs from the first iPhone, early iPads, and Intel Macs through iPhone 17e, M5 Macs, Studio Display XDR, and Pro Display XDR.

Mac mini, Mac Studio, and Mac Pro have no built-in screen. Preview them through the Apple display that is actually attached; Wallpect does not invent a computer-screen profile for those hosts.

### Consolidation rule

Models may share one option only when all wallpaper-relevant data matches:

- platform and supported orientations;
- physical output resolution, logical canvas, DPR, aspect ratio, and corners;
- notch, Dynamic Island, or other cutout geometry;
- safe areas and preview overlays;
- system wallpaper behavior.

Matching screen size or physical resolution alone is insufficient. For example, iPhone 12 and iPhone 13 both output `1170 × 2532`, but their notch geometry differs, so they remain separate configurations. iPhone 14 Pro, iPhone 15, iPhone 15 Pro, and iPhone 16 share the same canvas and obstruction geometry, so they use one option.

Each configuration's `compatibleModels` records every full model name, release year, and diagonal. Search indexes all aliases, years, diagonals, physical resolutions, and logical resolutions. `releaseYear` is the newest compatible-model year and is used only for sorting. A grouped configuration's `chassis` is a representative frame value; it does not claim that every compatible model has identical body dimensions.

### Previous-ID migration

Before 0.3.0, each model had its own profile ID. `APPLE_DEVICE_PROFILE_ID_ALIASES` maps IDs that may still exist in `wallpect:recent-devices:v1` to the new canonical configuration, removes duplicates, and writes the canonical list back. Migration handles only up to four device identifiers; it does not add images, filenames, compositions, or other data.

### Required data and validation

Every configuration must include:

- a stable `apple-*` ID, slug, platform, category, and concise display label;
- at least one uniquely named `compatibleModels` item with a valid year and positive diagonal;
- orientations, representative chassis data, physical pixels, logical points, DPR, native orientation, and corners;
- cutout, safe area, platform overlays, and wallpaper behavior;
- credential-free `https://support.apple.com` sources, a real review date, accuracy, and notes.

`validateDeviceProfiles` rejects duplicate IDs, slugs, or model names; identical but unconsolidated wallpaper configurations; non-finite or out-of-bounds geometry; inconsistent ratios; unsafe source URLs; invalid dates; and a `releaseYear` that does not match the newest compatible model.

### Adding data

1. Verify the model, year, and native resolution in an official Apple specification or identification page.
2. If the wallpaper configuration already exists, add the model and source to its `compatibleModels`; do not create another option.
3. Create a configuration when cutout, logical canvas, safe area, corner, or system behavior differs.
4. Mark unpublished geometry `derived` or `estimated`; never promote inferred data to `verified`.
5. Update coverage counts and representative tests, then run `npm run lint`, `npm test`, and `npm run build`.

All pixel geometry uses the profile's native physical coordinate space. `orientDevice` and `orientRect` rotate portrait-native geometry, while preview and export continue to share `renderWallpaper`.
