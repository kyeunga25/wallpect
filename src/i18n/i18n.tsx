import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "en" | "zh-Hant" | "zh-Hans";

const STORAGE_KEY = "wallpect:locale:v1";

const zhHant: Record<string, string> = {
  "Wallpect — Wallpaper fit, inspected": "Wallpect — 精準檢視桌布構圖",
  "Preview, crop, and export wallpapers for exact Apple device resolutions. Images stay in your browser.":
    "依 Apple 裝置的精確解析度預覽、裁切並匯出桌布；圖片只留在你的瀏覽器中。",
  Language: "語言",
  English: "English",
  "Traditional Chinese": "繁體中文",
  "Simplified Chinese": "简体中文",
  Beta: "測試版",
  "About Wallpect": "關於 Wallpect",
  About: "關於",
  "Device data": "裝置資料",
  Privacy: "隱私",
  "Legal & data": "條款與資料",
  "Primary navigation": "主要導覽",
  "Processed locally in your browser": "只在瀏覽器本機處理",
  "Close menu": "關閉選單",
  "Open menu": "開啟選單",
  "Image, device, and adjustment controls": "圖片、裝置與調整控制",
  "Overlay, device, and export controls": "覆疊、裝置與匯出控制",
  Image: "圖片",
  Device: "裝置",
  Adjust: "調整",
  Overlays: "覆疊",
  Export: "匯出",
  "Bundled demo": "內建示範",
  "Try the demo": "示範圖片",
  Replace: "更換",
  "Remove image": "移除圖片",
  "Drop an image here": "將圖片拖放到這裡",
  "PNG, JPEG, or WebP · up to 30 MB": "PNG、JPEG 或 WebP · 上限 30 MB",
  "Browse files": "瀏覽檔案",
  "Processing image…": "正在處理圖片…",
  "Your image never leaves this browser.": "你的圖片不會離開這個瀏覽器。",
  "The image could not be loaded.": "無法載入圖片。",
  "The sample image could not be loaded. Upload your own PNG, JPEG, or WebP image.":
    "無法載入示範圖片，請上傳自己的 PNG、JPEG 或 WebP 圖片。",
  "Choose a PNG, JPEG, or WebP image. HEIC is not supported yet.":
    "請選擇 PNG、JPEG 或 WebP 圖片，目前尚未支援 HEIC。",
  "This image is larger than 30 MB. Compress it before using Wallpect.":
    "這張圖片超過 30 MB，請先壓縮再使用 Wallpect。",
  "This image is too large for your browser to process safely. Resize it below 12,000 px on the longest side and 72 megapixels.":
    "圖片太大，瀏覽器無法安全處理；請將最長邊縮至 12,000 px 以下且不超過 7,200 萬像素。",
  "The image could not be decoded. Try exporting it again as PNG or JPEG.":
    "無法解碼圖片，請重新匯出成 PNG 或 JPEG 後再試。",
  "{name} loaded locally.": "已在本機載入 {name}。",
  "{model} selected.": "已選擇 {model}。",
  "{orientation} orientation selected.": "已選擇{orientation}方向。",
  "Image composition reset.": "已重設圖片構圖。",
  "Image centered.": "圖片已置中。",
  "Search devices": "搜尋裝置",
  "Search devices…": "搜尋裝置…",
  "Search by model, year, or resolution…": "搜尋型號、年份或解析度…",
  "Clear search": "清除搜尋",
  "Device category": "裝置類別",
  "Current device": "目前裝置",
  Show: "顯示",
  "Available models": "可選型號",
  "{count} results": "{count} 個結果",
  Recent: "最近使用",
  "{group} models": "{group} 型號",
  "{model}, {year}, {width} by {height}": "{model}，{year}，{width} × {height}",
  "No matching devices.": "找不到相符的裝置。",
  Orientation: "方向",
  "Screen orientation": "螢幕方向",
  Portrait: "直向",
  Landscape: "橫向",
  "Wallpaper fit mode": "桌布填合模式",
  Fill: "填滿",
  Fit: "完整顯示",
  Zoom: "縮放",
  Position: "位置",
  Rotate: "旋轉",
  Background: "背景",
  "Canvas background": "畫布背景",
  Solid: "純色",
  Transparent: "透明",
  Blur: "模糊延伸",
  "A softened full-bleed copy fills uncovered areas.": "以柔化的滿版副本填補未覆蓋區域。",
  "Transparency is preserved in PNG and WebP exports.": "匯出 PNG 與 WebP 時會保留透明度。",
  Reset: "重設",
  Center: "置中",
  "Toggle all overlays": "切換所有覆疊",
  "Safe area": "安全區域",
  "Recommended content boundary": "建議的內容邊界",
  Cutout: "開孔",
  "Notch or Dynamic Island": "瀏海或動態島",
  "Status bar": "狀態列",
  "Approximate system status region": "概略的系統狀態區域",
  Clock: "時鐘",
  "Approximate lock-screen clock": "概略的鎖定畫面時鐘",
  "Bottom actions": "底部操作",
  "Lock-screen shortcuts": "鎖定畫面捷徑",
  "Home indicator": "主畫面指示器",
  "Bottom gesture area": "底部手勢區域",
  "Composition grid": "構圖格線",
  "Rule-of-thirds guide": "三分法輔助線",
  "Desktop safe area": "桌面安全區域",
  "Clear of menu bar and Dock": "避開選單列與 Dock",
  "Display notch": "螢幕瀏海",
  "Built-in camera housing": "內建相機區域",
  "Menu bar": "選單列",
  "Approximate macOS menu bar": "概略的 macOS 選單列",
  Dock: "Dock",
  "Approximate desktop Dock": "概略的桌面 Dock",
  "Guides affect preview only unless “Export preview with guides” is enabled.":
    "輔助線只影響預覽；除非啟用「連同安全區域輔助線匯出預覽」。",
  "Preview mode": "預覽模式",
  Clean: "純桌布",
  Desktop: "桌面",
  "Lock Screen": "鎖定畫面",
  "Device frame visibility": "裝置外框顯示",
  Frame: "外框",
  "Screen only": "僅螢幕",
  "SAFE AREA": "安全區域",
  "Approximate lock screen overlay": "概略的鎖定畫面覆疊",
  "Monday, July 13": "7 月 13 日 星期一",
  File: "檔案",
  Edit: "編輯",
  View: "顯示方式",
  "Drag to reposition": "拖曳調整位置",
  "Scroll or pinch to zoom": "滾動或雙指縮放",
  "Arrow keys to nudge": "方向鍵微調",
  "Wallpaper canvas. Drag to reposition, scroll to zoom, use arrow keys to move.":
    "桌布畫布。拖曳可調整位置、滾動可縮放、方向鍵可移動。",
  "Choose an image": "選擇圖片",
  "Device information": "裝置資訊",
  Model: "型號",
  "Physical resolution": "實體解析度",
  "Logical viewport": "邏輯視窗",
  "Pixel density": "像素密度",
  "Aspect ratio": "長寬比",
  "Estimated crop": "預估裁切",
  "Safe-area insets": "安全區域邊距",
  Accuracy: "精確度",
  "Last reviewed": "上次檢查",
  Verified: "已驗證",
  High: "高",
  Estimated: "估算",
  Legacy: "舊資料",
  "Accuracy notes": "精確度說明",
  "Lock Screen and desktop UI are approximate and not an official system rendering.":
    "鎖定畫面與桌面 UI 為概略示意，並非官方系統畫面。",
  "Source reference": "資料來源",
  "System wallpaper placement can vary by iOS version and user settings.":
    "系統桌布的位置可能因 iOS 版本與使用者設定而異。",
  "Display resolution is published; overlay and corner geometry are derived approximations.":
    "螢幕解析度為公開規格；覆疊與圓角幾何為推算值。",
  "Portrait and landscape compositions are stored independently in this editor.":
    "本編輯器會分別保存直向與橫向構圖。",
  "Published resolution with derived safe-area geometry.":
    "解析度取自公開規格；安全區域幾何為推算值。",
  "Published native display resolution with approximate menu bar, Dock, and notch regions.":
    "原生解析度取自公開規格；選單列、Dock 與瀏海區域為概略值。",
  "Export format": "匯出格式",
  Quality: "品質",
  Filename: "檔名",
  "Exact output": "精確輸出",
  "Export preview with safe-area guides": "連同安全區域輔助線匯出預覽",
  "Preparing…": "準備中…",
  "Download wallpaper": "下載桌布",
  "The wallpaper could not be exported.": "無法匯出桌布。",
  "{filename} exported at {width} × {height} ({size}).":
    "已匯出 {filename}，尺寸為 {width} × {height}（{size}）。",
  "After downloading, choose it in System Settings → Wallpaper.":
    "下載後，請到「系統設定」→「背景圖片」選用。",
  "After downloading, choose it in Photos or Settings → Wallpaper. The system may still apply Extend or Perspective effects.":
    "下載後，請到「照片」或「設定」→「背景圖片」選用；系統仍可能套用延伸或透視效果。",
  "Fit every pixel with confidence.": "安心掌握每一個像素。",
  "Wallpect is a privacy-first wallpaper previewer. Compose your image on a selected device, inspect likely obstructions, then export at the exact target resolution.":
    "Wallpect 是以隱私為優先的桌布預覽工具。你可以在所選裝置上構圖、檢查可能遮擋內容的區域，並以精確的目標解析度匯出。",
  "Device data, without false precision.": "裝置資料，不製造虛假的精準感。",
  "Hardware resolutions come from published technical specifications. Safe areas, corner radii, and system UI overlays may be measured or derived, so every profile declares its accuracy level.":
    "硬體解析度來自公開技術規格；安全區域、圓角與系統 UI 覆疊可能來自量測或推算，因此每個設定檔都會標示精確度。",
  "Your image stays on your device.": "你的圖片只留在裝置上。",
  "Wallpect decodes, previews, and exports images inside this browser. There is no image upload endpoint, account, cloud project, or third-party image analysis.":
    "Wallpect 只在這個瀏覽器中解碼、預覽與匯出圖片；沒有圖片上傳端點、帳號、雲端專案或第三方圖片分析。",
  Inspect: "檢視",
  "Real aspect ratios, cutouts, and safe areas.": "真實長寬比、開孔與安全區域。",
  Compose: "構圖",
  "Drag, zoom, rotate, fill, fit, or extend.": "拖曳、縮放、旋轉、填滿、完整顯示或延伸。",
  "PNG, JPEG, or WebP at exact pixels.": "以精確像素匯出 PNG、JPEG 或 WebP。",
  "What remains local": "留在本機的內容",
  "Image pixels and canvas data": "圖片像素與畫布資料",
  "Image filename and file path": "圖片檔名與檔案路徑",
  "Transform and export operations": "構圖變換與匯出操作",
  "Stored preferences": "儲存的偏好設定",
  "Wallpect stores only your selected language and up to four recent device identifiers in this browser. Uploaded images are held in memory, are never written to localStorage, and are cleared when replaced, refreshed, or closed.":
    "Wallpect 只會在這個瀏覽器儲存你選擇的語言及最多四個最近使用的裝置識別碼。你選擇的圖片只保留在記憶體，不會寫入 localStorage，並會在更換圖片、重新整理或關閉頁面時清除。",
  "Cookies, analytics, and cache": "Cookie、分析與快取",
  "The Wallpect app does not set advertising cookies, load client-side analytics, create accounts, or send image data to a server. Public app assets may be cached by the browser for reliability; this cache does not contain your selected images.":
    "Wallpect 應用程式不會設定廣告 Cookie、載入客戶端分析、建立帳戶或把圖片資料傳送到伺服器。瀏覽器可能為提升可靠性而快取公開的應用程式資源；該快取不包含你選擇的圖片。",
  "Hosting network data": "託管網絡資料",
  "Wallpect is hosted on Cloudflare. Requests for public site files pass through Cloudflare, which may process IP addresses, routing data, system configuration, and request metadata under its privacy policy. Selected image bytes are not part of those requests.":
    "Wallpect 託管於 Cloudflare。對公開網站檔案的請求會經過 Cloudflare；Cloudflare 可能按其私隱政策處理 IP 位址、路由資料、系統設定及請求 metadata。你選擇的圖片 bytes 不會包含在這些請求內。",
  "External links": "外部連結",
  "External links leave Wallpect and are governed by the destination site's own terms and privacy practices.":
    "外部連結會離開 Wallpect，並受目的地網站本身的條款及私隱做法規管。",
  "Legal, privacy, and data use.": "條款、私隱與資料使用。",
  "Plain-language terms, limitations, and source rules for using Wallpect.":
    "以清晰文字說明 Wallpect 的使用條款、限制及資料來源規則。",
  "Effective date: 25 July 2026": "生效日期：2026 年 7 月 25 日",
  "Terms of use": "使用條款",
  "By using Wallpect, you agree to use it lawfully and not to disrupt, bypass security controls, overload, or misuse the service. If you do not agree, do not use the service.":
    "使用 Wallpect 即表示你同意合法使用本服務，不會干擾、規避安全控制、令服務過載或以其他方式濫用服務。如你不同意，請勿使用本服務。",
  "Your images and rights": "你的圖片與權利",
  "Your images remain under your control and are processed only in your browser. You are responsible for having permission to use, edit, and export any image you select.":
    "你的圖片由你控制，並只在瀏覽器內處理。你有責任確保自己獲准使用、編輯及匯出所選圖片。",
  "Accuracy and no warranty": "準確度與不作保證",
  "Wallpect is a beta composition aid, provided as is and as available. Device profiles, safe areas, overlays, and export previews may be incomplete, approximate, outdated, or affected by operating-system settings. Check important output on the target device before relying on it.":
    "Wallpect 是測試階段的構圖輔助工具，按現況及可用情況提供。裝置設定檔、安全區域、覆疊及匯出預覽可能不完整、屬概略、已過時或受作業系統設定影響。依賴重要輸出前，請先在目標裝置檢查。",
  Liability: "責任限制",
  "To the fullest extent permitted by applicable law, Wallpect's maintainers are not responsible for indirect, incidental, or consequential loss arising from use of, inability to use, or reliance on the service or linked information.":
    "在適用法律允許的最大範圍內，Wallpect 維護者不會就使用、無法使用或依賴本服務或連結資料所引致的間接、附帶或相應損失負責。",
  "Nothing in these terms excludes rights or liabilities that applicable law does not allow to be excluded or limited.":
    "本條款不會排除或限制適用法律不容排除或限制的權利或責任。",
  "Data sources and methodology": "資料來源與方法",
  "Device names and hardware resolutions are manually curated from linked public manufacturer specification and support pages. Wallpect records a review date and accuracy level for each profile; safe areas, corner radii, cutouts, and system overlays may be measured, derived, or estimated rather than official.":
    "裝置名稱及硬件解析度由連結的製造商公開規格及支援頁面人工整理。Wallpect 為每個設定檔記錄檢查日期及準確度等級；安全區域、圓角、開孔及系統覆疊可能來自量度、推算或估算，並非官方資料。",
  "Wallpect does not use an Apple or third-party device-data API at runtime, and it does not reproduce Apple website text, product images, logos, or interface assets. Source links are references, not endorsements.":
    "Wallpect 執行時不使用 Apple 或第三方裝置資料 API，亦不複製 Apple 網站文字、產品圖片、標誌或介面資產。來源連結只供參考，不代表任何背書。",
  "Trademarks and independence": "商標與獨立性",
  "Apple, iPhone, iPad, Mac, MacBook, iMac, and related names are trademarks of Apple Inc. They are used only to identify compatible device profiles. Wallpect is independent and is not authorized, sponsored, or endorsed by Apple Inc.":
    "Apple、iPhone、iPad、Mac、MacBook、iMac 及相關名稱均為 Apple Inc. 的商標，只用於識別相容裝置設定檔。Wallpect 是獨立工具，未獲 Apple Inc. 授權、贊助或背書。",
  "Third-party sites and changes": "第三方網站與變更",
  "Linked sources may change or become unavailable and remain subject to their owners' terms. Wallpect's features, profiles, and notices may be updated; the effective date above identifies this version.":
    "連結來源可能變更或停止提供，並繼續受其擁有者的條款規管。Wallpect 的功能、設定檔及聲明可能更新；以上生效日期用於識別目前版本。",
  "Official reference links": "官方參考連結",
  "Apple website terms": "Apple 網站使用條款",
  "Apple trademark guidelines": "Apple 商標使用指引",
  "Hong Kong privacy guidance": "香港私隱指引",
  "Cloudflare privacy policy": "Cloudflare 私隱政策",
  "Report a problem on GitHub": "在 GitHub 回報問題",
  "This notice explains the current beta implementation and is general information, not legal advice.":
    "本聲明用於說明目前測試版的實作，只屬一般資料，並非法律意見。",
  "Apple-first profiles included": "個以 Apple 為主的裝置設定檔",
  "Accuracy levels": "精確度等級",
  "Cross-checked with official specifications and measured data.":
    "已與官方規格及量測資料交叉核對。",
  "Resolution confirmed; some geometry is derived.": "解析度已確認；部分幾何資料為推算值。",
  "One or more obstruction measurements are approximate.": "一項或多項遮擋區域量測為概略值。",
  "Apple technical specifications": "Apple 技術規格",
  "Wallpect is independent and is not affiliated with or endorsed by Apple Inc.":
    "Wallpect 為獨立工具，與 Apple Inc. 無關，亦未獲其背書。",
  Close: "關閉",
  Download: "下載",
  "Editor panels": "編輯器面板",
  "All changes are local and never uploaded.": "所有變更只在本機進行，絕不會上傳。",
  Move: "移動",
  "Wallpect could not start.": "Wallpect 無法啟動。",
  "Reload editor": "重新載入編輯器",
  "Cutout area": "開孔區域",
  "Dynamic Island area": "動態島區域",
  "Notch area": "瀏海區域",
};

const simplifiedCharacters: Record<string, string> = {
  體: "体",
  語: "语",
  關: "关",
  於: "于",
  裝: "装",
  資: "资",
  導: "导",
  覽: "览",
  瀏: "浏",
  處: "处",
  開: "开",
  選: "选",
  單: "单",
  圖: "图",
  調: "调",
  覆: "复",
  疊: "叠",
  匯: "导",
  內: "内",
  範: "范",
  換: "换",
  檔: "档",
  載: "载",
  壓: "压",
  縮: "缩",
  邊: "边",
  萬: "万",
  擇: "择",
  構: "构",
  尋: "寻",
  類: "类",
  別: "别",
  顯: "显",
  滿: "满",
  轉: "转",
  純: "纯",
  區: "区",
  動: "动",
  態: "态",
  島: "岛",
  狀: "状",
  鎖: "锁",
  畫: "画",
  鐘: "钟",
  徑: "径",
  勢: "势",
  線: "线",
  攝: "摄",
  輔: "辅",
  響: "响",
  預: "预",
  僅: "仅",
  螢: "屏",
  檢: "检",
  視: "视",
  實: "实",
  邏: "逻",
  輯: "辑",
  寬: "宽",
  長: "长",
  確: "确",
  驗: "验",
  證: "证",
  舊: "旧",
  說: "说",
  來: "来",
  異: "异",
  儲: "储",
  設: "设",
  發: "发",
  規: "规",
  幾: "几",
  質: "质",
  準: "准",
  備: "备",
  牆: "墙",
  這: "这",
  張: "张",
  過: "过",
  請: "请",
  無: "无",
  讀: "读",
  寫: "写",
  後: "后",
  應: "应",
  與: "与",
  絕: "绝",
  會: "会",
  傳: "传",
  統: "统",
  還: "还",
  擋: "挡",
  對: "对",
  測: "测",
  項: "项",
  屬: "属",
  據: "据",
  標: "标",
  號: "号",
  記: "记",
  續: "续",
  錯: "错",
  誤: "误",
  離: "离",
  雲: "云",
  端: "端",
  第: "第",
  三: "三",
  方: "方",
  圓: "圆",
  觸: "触",
  擬: "拟",
  際: "际",
  閱: "阅",
  讓: "让",
  優: "优",
  採: "采",
  輸: "输",
  貼: "贴",
  擴: "扩",
  啟: "启",
  頁: "页",
  時: "时",
  點: "点",
  夢: "梦",
  像: "像",
  素: "素",
  綁: "绑",
  組: "组",
  終: "终",
  較: "较",
  階: "阶",
  級: "级",
  簡: "简",
  繁: "繁",
  數: "数",
  斷: "断",
  並: "并",
  佈: "布",
  書: "书",
  護: "护",
  閉: "闭",
  除: "除",
  釋: "释",
  臺: "台",
  灣: "湾",
  滾: "滚",
  鍵: "键",
};

function toSimplified(value: string) {
  return [...value]
    .map((character) => simplifiedCharacters[character] ?? character)
    .join("")
    .replaceAll("桌布", "壁纸")
    .replaceAll("背景图片", "壁纸")
    .replaceAll("装置", "设备")
    .replaceAll("本机", "本地")
    .replaceAll("档案", "文件")
    .replaceAll("视窗", "视口")
    .replaceAll("锁定画面", "锁定屏幕")
    .replaceAll("主画面", "主屏幕")
    .replaceAll("复叠", "叠加层")
    .replaceAll("设定", "设置")
    .replaceAll("浏海", "刘海")
    .replaceAll("检视", "检查");
}

const zhHansBase = Object.fromEntries(
  Object.entries(zhHant).map(([key, value]) => [key, toSimplified(value)]),
);

const zhHans: Record<string, string> = {
  ...zhHansBase,
  "Wallpect — Wallpaper fit, inspected": "Wallpect — 精准检查壁纸构图",
  "Preview, crop, and export wallpapers for exact Apple device resolutions. Images stay in your browser.":
    "按 Apple 设备的精确分辨率预览、裁切并导出壁纸；图片只保留在你的浏览器中。",
  Language: "语言",
  Beta: "测试版",
  About: "关于",
  "About Wallpect": "关于 Wallpect",
  "Device data": "设备数据",
  Privacy: "隐私",
  "Primary navigation": "主导航",
  "Processed locally in your browser": "仅在浏览器本地处理",
  "Close menu": "关闭菜单",
  "Open menu": "打开菜单",
  "Image, device, and adjustment controls": "图片、设备和调整控制",
  "Overlay, device, and export controls": "叠加层、设备和导出控制",
  Image: "图片",
  Device: "设备",
  Adjust: "调整",
  Overlays: "叠加层",
  Export: "导出",
  "Bundled demo": "内置示例",
  "Try the demo": "示例图片",
  Replace: "更换",
  "Remove image": "移除图片",
  "Drop an image here": "将图片拖放到这里",
  "PNG, JPEG, or WebP · up to 30 MB": "PNG、JPEG 或 WebP · 上限 30 MB",
  "Browse files": "浏览文件",
  "Your image never leaves this browser.": "你的图片不会离开这个浏览器。",
  "The image could not be loaded.": "无法加载图片。",
  "{name} loaded locally.": "已在本地加载 {name}。",
  "{model} selected.": "已选择 {model}。",
  "{orientation} orientation selected.": "已选择{orientation}方向。",
  "Image composition reset.": "已重置图片构图。",
  "Image centered.": "图片已居中。",
  "Search devices": "搜索设备",
  "Search devices…": "搜索设备…",
  "Search by model, year, or resolution…": "搜索型号、年份或分辨率…",
  "Clear search": "清除搜索",
  "Device category": "设备类别",
  "Current device": "当前设备",
  Show: "显示",
  "Available models": "可选型号",
  "{count} results": "{count} 个结果",
  Recent: "最近使用",
  "{group} models": "{group} 型号",
  "No matching devices.": "没有匹配的设备。",
  Orientation: "方向",
  "Screen orientation": "屏幕方向",
  Portrait: "竖向",
  Landscape: "横向",
  "Wallpaper fit mode": "壁纸适配模式",
  Fill: "填满",
  Fit: "完整显示",
  Zoom: "缩放",
  Position: "位置",
  Rotate: "旋转",
  Background: "背景",
  "Canvas background": "画布背景",
  Solid: "纯色",
  Transparent: "透明",
  Blur: "模糊延伸",
  Reset: "重置",
  Center: "居中",
  "Safe area": "安全区域",
  "Recommended content boundary": "建议的内容边界",
  Cutout: "开孔",
  "Status bar": "状态栏",
  Clock: "时钟",
  "Bottom actions": "底部操作",
  "Home indicator": "主屏幕指示条",
  "Composition grid": "构图网格",
  "Desktop safe area": "桌面安全区域",
  "Menu bar": "菜单栏",
  "Preview mode": "预览模式",
  Clean: "纯壁纸",
  Desktop: "桌面",
  "Lock Screen": "锁定屏幕",
  "Device frame visibility": "设备边框显示",
  Frame: "边框",
  "Screen only": "仅屏幕",
  "SAFE AREA": "安全区域",
  "Monday, July 13": "7 月 13 日 星期一",
  File: "文件",
  Edit: "编辑",
  View: "显示",
  "Drag to reposition": "拖动调整位置",
  "Scroll or pinch to zoom": "滚动或双指缩放",
  "Arrow keys to nudge": "方向键微调",
  "Choose an image": "选择图片",
  "Device information": "设备信息",
  Model: "型号",
  "Physical resolution": "物理分辨率",
  "Logical viewport": "逻辑视口",
  "Pixel density": "像素密度",
  "Aspect ratio": "宽高比",
  "Estimated crop": "预估裁切",
  "Safe-area insets": "安全区域边距",
  Accuracy: "准确度",
  "Last reviewed": "上次检查",
  Verified: "已验证",
  High: "高",
  Estimated: "估算",
  Legacy: "旧数据",
  "Accuracy notes": "准确度说明",
  "Source reference": "数据来源",
  "Export format": "导出格式",
  Quality: "质量",
  Filename: "文件名",
  "Exact output": "精确输出",
  "Export preview with safe-area guides": "连同安全区域辅助线导出预览",
  "Preparing…": "准备中…",
  "Download wallpaper": "下载壁纸",
  "The wallpaper could not be exported.": "无法导出壁纸。",
  "{filename} exported at {width} × {height} ({size}).":
    "已导出 {filename}，尺寸为 {width} × {height}（{size}）。",
  "Fit every pixel with confidence.": "放心掌握每一个像素。",
  "Device data, without false precision.": "设备数据，不制造虚假的精准感。",
  "Your image stays on your device.": "你的图片只保留在设备上。",
  Inspect: "检查",
  Compose: "构图",
  "What remains local": "保留在本地的内容",
  "Stored preferences": "保存的偏好设置",
  "Accuracy levels": "准确度等级",
  Close: "关闭",
  Download: "下载",
  "Editor panels": "编辑器面板",
  "All changes are local and never uploaded.": "所有更改只在本地进行，绝不会上传。",
  Move: "移动",
  "Wallpect could not start.": "Wallpect 无法启动。",
  "Reload editor": "重新加载编辑器",
  "Wallpect is independent and is not affiliated with or endorsed by Apple Inc.":
    "Wallpect 是独立工具，与 Apple Inc. 无关，也未获得其认可。",
};

const messages: Record<Exclude<Locale, "en">, Record<string, string>> = {
  "zh-Hant": zhHant,
  "zh-Hans": zhHans,
};

function initialLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh-Hant" || stored === "zh-Hans") return stored;
  } catch {
    // Storage is optional.
  }
  return "zh-Hant";
}

function interpolate(template: string, values?: Record<string, string | number>) {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const t = useCallback(
    (key: string, values?: Record<string, string | number>) =>
      interpolate(locale === "en" ? key : (messages[locale][key] ?? key), values),
    [locale],
  );
  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Storage is optional. */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t("Wallpect — Wallpaper fit, inspected");
    document
      .querySelector<HTMLMetaElement>('meta[name="description"]')
      ?.setAttribute(
        "content",
        t(
          "Preview, crop, and export wallpapers for exact Apple device resolutions. Images stay in your browser.",
        ),
      );
  }, [locale, t]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
