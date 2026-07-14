# 裝置設定檔指南 / Device Profile Guide

## 中文

裝置設定檔是位於 `src/data/devices/apple/profiles.ts` 的純 TypeScript 記錄。預覽介面不含針對個別型號的分支；只要加入有效的設定檔，它便會自動出現在搜尋、選擇器、覆疊、資訊與匯出功能中。

### 必填欄位

每個設定檔必須包含：

- 穩定的 `apple-*` id 與 slug；
- 平台、類別、系列、型號與推出年份；
- 支援的螢幕方向清單；
- 用於相對外觀顯示的機身尺寸與對角線；
- 實體像素、邏輯點數、DPR、比例、原生方向與圓角半徑；
- 開孔類型及可選的像素邊界；
- 附有證據來源的安全區域邊距；
- 與平台相關的覆疊矩形；
- 桌布行為說明；
- 來源 URL、上次檢查日期、準確度等級與備註。

所有像素幾何均使用設定檔的原生實體座標空間。對於原生直向的設定檔，橫向幾何會由 `orientDevice` 與 `orientRect` 旋轉。

### 加入設定檔

1. 找出製造商的技術規格，以及任何未公開幾何資料的可靠來源。
2. 使用適合的 phone、tablet 或 Mac helper 加入記錄。
3. 由實體寬度／高度計算 `aspectRatio`；不要輸入四捨五入的市場推廣比例。
4. 將未公開的安全區域、開孔或圓角幾何標記為 `derived` 或 `estimated`。
5. 引入新的幾何系列時，加入設定檔數量或特定設定檔的單元測試。
6. 執行 `npm run check`。

`validateDeviceProfiles` 會在匯入裝置資料及測試期間執行。它會拒絕重複記錄、無效尺寸、不一致的長寬比、缺少來源、負數邊距及格式錯誤的檢查日期。

### 資料慣例

- 實體顯示尺寸一律使用像素。
- 邏輯視窗尺寸使用點數。
- 機身尺寸使用毫米；對角線使用英吋。
- 矩形使用原生左上角為原點的 `{ x, y, width, height }`。
- 安全區域邊距使用 `{ top, right, bottom, left }`。
- 硬件解析度與系統 UI 幾何屬於兩項獨立陳述。

## English

Device profiles are plain TypeScript records in `src/data/devices/apple/profiles.ts`. The preview does not contain model-specific branches: adding a valid profile is enough for it to appear in search, selection, overlays, information, and export.

### Required fields

Every profile must include:

- stable `apple-*` id and slug;
- platform, category, family, model, and release year;
- supported orientation list;
- chassis dimensions and diagonal for relative presentation;
- physical pixels, logical points, DPR, ratio, orientation, and corner radius;
- cutout type and optional pixel bounds;
- safe-area insets with a declared evidence source;
- overlay rectangles relevant to the platform;
- wallpaper behavior notes;
- source URLs, last-review date, accuracy level, and notes.

All pixel geometry uses the profile's native physical coordinate space. For a portrait-native profile, landscape geometry is rotated by `orientDevice` and `orientRect`.

### Adding a profile

1. Locate the manufacturer's technical specification and a reliable source for any unpublished geometry.
2. Add the record through the appropriate phone, tablet, or Mac helper.
3. Compute `aspectRatio` from physical width / height; never type a rounded marketing ratio.
4. Mark unpublished safe-area, cutout, or corner geometry as `derived` or `estimated`.
5. Add a profile-count or profile-specific unit test when introducing a new geometry family.
6. Run `npm run check`.

`validateDeviceProfiles` runs when device data is imported and during tests. It rejects duplicates, invalid dimensions, inconsistent aspect ratios, missing sources, negative insets, and malformed review dates.

### Data conventions

- Physical display dimensions are always pixels.
- Logical viewport dimensions are points.
- Chassis measurements are millimetres; diagonal is inches.
- Rectangles use `{ x, y, width, height }` from the native top-left origin.
- Safe-area insets use `{ top, right, bottom, left }`.
- Hardware resolution and system UI geometry are separate claims.
