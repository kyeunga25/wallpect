# Wallpect 條款、私隱與資料政策

生效日期：2026 年 7 月 25 日
適用版本：0.2.2

> 本文件記錄 Wallpect 測試版目前的產品行為及維護規則，只屬一般資料，並非法律意見。若加入收費、帳戶、廣告、分析、個人資料表格、使用者內容託管或新司法管轄區，必須先接受獨立法律審閱。

## 1. 使用條款摘要

- 使用 Wallpect 即表示使用者同意合法使用服務，不干擾、規避安全控制、令服務過載或濫用服務。
- 使用者選擇的圖片仍由使用者控制；使用者有責任確保自己有權使用、編輯及匯出圖片。
- Wallpect 是測試階段的構圖輔助工具，按現況及可用情況提供。裝置設定檔、安全區域、覆疊及預覽可能不完整、屬概略、已過時或受作業系統設定影響。
- 重要輸出應在目標裝置驗證。任何免責及責任限制只在適用法律容許的範圍內生效，並不排除法律不容排除的權利或責任。

網站上的完整使用者版本位於「條款與資料」對話框。

## 2. 現行私隱資料清單

| 資料／處理                                      | 位置                                 | 用途                         | 保留                               | 傳送對象                                               |
| ----------------------------------------------- | ------------------------------------ | ---------------------------- | ---------------------------------- | ------------------------------------------------------ |
| 使用者選擇的圖片 bytes、檔名、Canvas 像素及變換 | 瀏覽器記憶體                         | 預覽與匯出                   | 更換圖片、重新整理或關閉頁面時清除 | 不上傳；沒有圖片 API 或第三方圖片分析                  |
| 語言偏好                                        | `localStorage`：`wallpect:locale:v1` | 還原介面語言                 | 直至使用者改寫或清除網站資料       | 不由應用程式傳送                                       |
| 最多四個最近裝置 ID                             | `localStorage`：版本化 key           | 提供最近使用裝置捷徑         | 直至改寫或清除網站資料             | 不由應用程式傳送                                       |
| 公開應用程式資源                                | Browser Cache／Service Worker Cache  | 提升載入可靠性               | 由版本化 cache 及瀏覽器政策管理    | 不包含使用者選擇的圖片                                 |
| 一般網絡請求 metadata                           | Cloudflare 網絡                      | 傳送、保護及快取公開網站檔案 | 受 Cloudflare 服務及私隱政策規管   | Cloudflare；可能包括 IP、路由、系統設定及請求 metadata |

Wallpect 前端不設定廣告 Cookie、不載入客戶端分析、不建立帳戶、不收集表格資料，也不把使用者選擇的圖片傳送到 Cloudflare。正常瀏覽公開網站仍會產生網絡請求；不應把「圖片不上傳」誤寫成「託管供應商完全不處理任何網絡資料」。

參考：[香港私隱公署《擬備收集個人資料聲明及私隱政策聲明指引》](https://www.pcpd.org.hk/tc_chi/resources_centre/publications/files/GN_picspps_c.pdf)、[Cloudflare Privacy Policy](https://www.cloudflare.com/policies/privacy/)。

## 3. 裝置資料來源與準確度

目前裝置資料由維護者人工整理，來源只限設定檔內連結的 `https://support.apple.com` 公開技術規格及支援頁面。Wallpect：

- 不在執行時呼叫 Apple 或第三方裝置資料 API；
- 不自動擷取、爬取或鏡像 Apple 網站；
- 不複製 Apple 網站文章、產品圖片、Logo、介面資產或宣傳素材；
- 只保存相容性識別所需的產品名稱、硬件規格事實、來源 URL、檢查日期及 Wallpect 自行整理的準確度 metadata；
- 把安全區域、圓角、開孔與系統覆疊清楚標示為 `measured`、`derived` 或 `estimated`，不把估算資料標示為 `verified`。

每個設定檔必須通過 schema 驗證：有限及正數尺寸、有效日期、唯一 ID／slug，以及無憑證的 `https://support.apple.com` 來源 URL。來源頁可能變更或停止提供，所以來源連結不構成持續準確的保證。

Apple 的香港網站條款限制複製、重新發佈、鏡像及自動擷取其內容，因此 Wallpect 只作人工、有限的規格事實整理並連回來源；如使用模式或商業模式改變，應重新取得法律意見或適當授權。參考：[Apple 網站使用條款](https://www.apple.com/hk/legal/internet-services/terms/site.html)。

## 4. 商標、版權與獨立性

- `Wallpect` 不包含 Apple 商標，品牌視覺不使用 Apple Logo、產品圖片、官方圖示或仿製 Apple 網站 trade dress。
- Apple、iPhone、iPad、Mac、MacBook、iMac 及相關名稱只用於識別相容裝置設定檔，顯著程度低於 Wallpect 品牌。
- Wallpect 是獨立工具，未獲 Apple Inc. 授權、贊助或背書。
- 使用者圖片的權利不會因本機處理而轉移給 Wallpect；使用者仍須確保自己有權使用圖片。
- Wallpect 程式碼按 repository 的 [MIT License](../LICENSE) 發布；MIT License 不授予第三方商標、資料或使用者圖片的權利。

參考：[Apple 使用商標和版權的指引](https://www.apple.com/hk/legal/intellectual-property/guidelinesfor3rdparties.html)。

## 5. 新增第三方來源或 API 的合併門檻

在新增任何官方或第三方資料來源、SDK 或 API 前，pull request 必須記錄：

1. 供應者、正式文件與條款／授權 URL；
2. 取得方法（人工、下載資料集或 API）及准許的用途；
3. 可保存、修改、快取、重新發佈及展示的欄位；
4. 必須展示的 attribution、商標或版權聲明；
5. 更新頻率、資料刪除／撤回機制及來源失效處理；
6. 速率限制、錯誤處理、供應鏈風險與 schema 驗證；
7. 是否涉及 IP、裝置資料、識別碼、圖片或其他個人資料；
8. API key 的保存位置。Secret 不得放入前端、Git、文件、測試 fixture 或公開 build；
9. runtime 會否把圖片、檔名、Canvas 像素或本機路徑傳出瀏覽器；這些資料目前一律禁止外傳；
10. 法律／私隱審閱結論及產品 UI 需要新增的通知或同意。

未能確認使用權、再發布權或資料處理邊界時，不應合併來源或 API。

## 6. 必須重新審閱本政策的變更

- 加入帳戶、登入、付款、廣告、分析、遙測、表格或電郵；
- 加入 Worker API、資料庫、遠端圖片處理或圖片上傳；
- 顯示第三方圖片、字體、影片或嵌入內容；
- 使用新的資料供應者、API、SDK、爬蟲或自動同步；
- 更改 Cloudflare 產品、日誌、分析或保留設定；
- 開始商業化、提供保證、面向兒童或進入其他司法管轄區；
- 使用 Apple 或其他品牌的圖像、介面資產、商標或宣傳材料。

---

# Wallpect Terms, Privacy, and Data Policy

Effective date: 25 July 2026
Applies to version: 0.2.2

> This document records the current behavior and maintenance rules of the Wallpect beta. It is general information, not legal advice. Independent legal review is required before adding payments, accounts, advertising, analytics, personal-data forms, hosted user content, or new jurisdictions.

## 1. Terms summary

- Users agree to use Wallpect lawfully and not disrupt, bypass security controls, overload, or misuse the service.
- Selected images remain under the user's control. The user is responsible for having permission to use, edit, and export them.
- Wallpect is a beta composition aid provided as is and as available. Profiles, safe areas, overlays, and previews may be incomplete, approximate, outdated, or affected by operating-system settings.
- Important output should be checked on the target device. Disclaimers and liability limits apply only to the extent permitted by applicable law and do not exclude non-excludable rights or liabilities.

The user-facing version is available in the website's “Legal & data” dialog.

## 2. Current privacy inventory

Wallpect keeps selected image bytes, filenames, Canvas pixels, and transforms in browser memory and does not upload them. It stores only the selected locale and up to four recent device identifiers in versioned `localStorage`. Public app assets may be cached for reliability, but these caches do not contain user-selected images.

The site is hosted on Cloudflare. Requests for public files pass through Cloudflare, which may process IP addresses, routing data, system configuration, and request metadata under its privacy policy. The app itself does not load advertising cookies, client-side analytics, account systems, or personal-data forms.

References: [Hong Kong PCPD guidance](https://www.pcpd.org.hk/tc_chi/resources_centre/publications/files/GN_picspps_c.pdf), [Cloudflare Privacy Policy](https://www.cloudflare.com/policies/privacy/).

## 3. Device data and source rules

Profiles are manually curated from linked public `https://support.apple.com` specification and support pages. Wallpect does not call an Apple or third-party device-data API at runtime, scrape or mirror Apple websites, or reproduce Apple articles, product images, logos, interface assets, or marketing material. Derived geometry remains clearly labelled and is never promoted to verified without evidence.

References: [Apple Website Terms of Use](https://www.apple.com/hk/legal/internet-services/terms/site.html), [Apple trademark and copyright guidelines](https://www.apple.com/hk/legal/intellectual-property/guidelinesfor3rdparties.html).

## 4. Third-party and API gate

Any new source, SDK, or API must document its provider, official terms or licence, permitted fields and uses, redistribution and attribution rules, retention and withdrawal handling, rate limits, schema validation, privacy impact, secret storage, and image-egress boundary before merge. Unknown usage or redistribution rights block adoption.

Re-review this policy whenever the project adds accounts, payments, analytics, telemetry, forms, remote image processing, uploads, a database, third-party media, automated data ingestion, a new hosting/logging product, commercialization, or another jurisdiction.
