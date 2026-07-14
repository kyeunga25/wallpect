# Wallpect 貢獻者指引 / Contributor instructions

- 禁止批量刪除文件或目錄；每次只可刪除一個明確路徑的文件。
- 使用 TypeScript strict mode，並將裝置資料放在 UI 元件之外。
- 上傳圖片的內容必須只留在瀏覽器中；不要加入上傳 API 或圖片分析。
- 預覽與匯出必須共用相同的變換及渲染器計算。
- 不要把估算的設定檔資料標示為已驗證。
- 每個重要里程碑後執行 `npm run lint`、`npm test` 與 `npm run build`。

English:

- Never batch-delete files or directories. Delete only one explicit file path at a time.
- Use TypeScript strict mode and keep device data outside UI components.
- Uploaded image content must stay in the browser. Do not add upload APIs or image analytics.
- Preview and export must share the same transform and renderer calculations.
- Do not label estimated profile data as verified.
- Run `npm run lint`, `npm test`, and `npm run build` after material milestones.
