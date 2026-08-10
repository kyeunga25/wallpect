# 準確度政策 / Accuracy Policy

## 中文

Wallpect 會將顯示硬件的公開事實，與必須量度或推算的幾何資料分開處理。

### 準確度等級

- `verified`：官方解析度，且幾何資料已與量度結果或多個權威來源交叉核對。
- `high`：硬件解析度已確認；部分安全區域、圓角或覆疊幾何為推算值。
- `estimated`：一項或多項重要遮擋區域量度屬有根據的概略估算。
- `legacy`：較舊的設定檔尚未完成目前的檢查流程。

初始資料集會刻意標記為 `high` 而非 `verified`：顯示解析度已有公開資料，但大部分安全區域、圓角、鎖定畫面、選單列與 Dock 尺寸都是推算近似值。

多個型號只會在實體及邏輯畫布、開孔、圓角、安全區域、覆疊與 wallpaper 行為一致時合併。相同吋數或相同實體解析度本身不等於相同預覽；任何會改變構圖遮擋的差異都必須保留獨立配置。合併配置內的機身尺寸是外框顯示代表值，精確輸出聲明只適用於列明的共同畫布。

### 預覽所代表的意思

- 裝置長寬比與匯出像素尺寸直接來自所選設定檔。
- 模擬機身是 CSS／SVG 近似圖形，絕不會寫入桌布。
- 安全區域、鎖定畫面、選單列、Dock 及類似系統覆疊都是構圖輔助線，不是 Apple 官方渲染畫面。
- 未經校準的螢幕無法以真實毫米顯示手機或電腦尺寸。

### 系統行為

Apple 作業系統可能透過延伸桌布、透視縮放、景深效果、顯示縮放或填滿行為改變一張尺寸正確的圖片。Wallpect 會盡量減少之後調整的需要，但無法保證所有作業系統版本與設定都會有完全一致的位置。

### 回報資料問題

回報設定檔問題時，請提供型號、作業系統版本、有問題的欄位、來源或量度方法，以及不含私人圖片的螢幕截圖。請勿提交 Apple 的專有素材。

## English

Wallpect separates facts that are published for display hardware from geometry that must be measured or derived.

### Accuracy levels

- `verified`: official resolution plus geometry cross-checked with measurements or multiple authoritative sources.
- `high`: hardware resolution is confirmed; some safe-area, corner, or overlay geometry is derived.
- `estimated`: one or more material obstruction measurements are an informed approximation.
- `legacy`: an older profile has not completed the current review process.

The initial data set is intentionally marked `high`, not `verified`: display resolutions are published, while most safe-area, corner, Lock Screen, menu-bar, and Dock dimensions are derived approximations.

Models are consolidated only when their physical and logical canvases, cutouts, corners, safe areas, overlays, and wallpaper behavior match. A shared diagonal or physical resolution does not by itself imply an identical preview; any difference that changes composition obstructions requires a separate configuration. Chassis dimensions in a grouped configuration are representative frame values, while the exact-output claim applies only to the listed shared canvas.

### What the preview means

- Device aspect ratio and export pixel dimensions come directly from the selected profile.
- The simulated chassis is a CSS/SVG approximation and is never written to the wallpaper.
- Safe Area, Lock Screen, menu bar, Dock, and similar system overlays are composition guides, not official Apple renderings.
- An uncalibrated monitor cannot show a phone or computer at true physical millimetres.

### System behavior

Apple operating systems may alter a correctly sized image through Extend Wallpaper, Perspective Zoom, depth effects, display zoom, or Fill behavior. Wallpect minimizes the need for later adjustment; it cannot guarantee identical placement across every OS version and setting.

### Reporting data issues

When reporting a profile issue, include the model, OS version, the field in question, a source or measurement method, and a screenshot that does not contain private imagery. Do not submit proprietary Apple assets.
