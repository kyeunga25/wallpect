import { expect, test, type Download, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { imageDimensions } from "./image-dimensions";

type ExportFormat = "png" | "jpeg" | "webp";
type ObjectUrlAudit = { created: string[]; revoked: string[] };

async function downloadFormat(page: Page, format: ExportFormat): Promise<Download> {
  const label = format === "png" ? "PNG" : format === "jpeg" ? "JPEG" : "WebP";
  const options = page.locator(".right-rail .export-options");
  if ((await options.getAttribute("open")) === null) await options.locator("summary").click();
  await page
    .getByRole("group", { name: "匯出格式" })
    .getByRole("button", { name: label, exact: true })
    .click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /下載桌布/ }).click();
  return downloadPromise;
}

async function downloadedBytes(download: Download) {
  const path = await download.path();
  if (!path) throw new Error("Playwright did not provide a download path");
  return readFile(path);
}

async function revealPreciseControls(scope: Locator) {
  const details = scope.locator(".precision-controls");
  await expect(details).not.toHaveAttribute("open", "");
  await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
  return details;
}

test("@desktop local upload stays private and all export formats keep exact dimensions", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const audit: ObjectUrlAudit = { created: [], revoked: [] };
    const createObjectUrl = URL.createObjectURL;
    const revokeObjectUrl = URL.revokeObjectURL;
    URL.createObjectURL = (object: Blob | MediaSource) => {
      const url = createObjectUrl.call(URL, object);
      audit.created.push(url);
      return url;
    };
    URL.revokeObjectURL = (url: string) => {
      audit.revoked.push(url);
      revokeObjectUrl.call(URL, url);
    };
    Object.defineProperty(window, "__wallpectObjectUrlAudit", { value: audit });
  });

  await page.goto("/");
  await expect(page.getByText("Wallpect", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("sample-aurora-wallpaper.png").first()).toBeVisible();
  await page.evaluate(async () => {
    if ("serviceWorker" in navigator) await navigator.serviceWorker.ready;
  });
  await page.waitForLoadState("networkidle");

  const postLoadRequests: string[] = [];
  page.on("request", (request) => {
    const protocol = new URL(request.url()).protocol;
    if (protocol === "http:" || protocol === "https:")
      postLoadRequests.push(`${request.method()} ${request.url()}`);
  });

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles("public/assets/sample-aurora-wallpaper.png");
  await expect(page.getByText("sample-aurora-wallpaper.png").first()).toBeVisible();

  const desktopSelector = page.locator(".left-rail");
  await desktopSelector.getByRole("button", { name: /目前裝置/ }).click();
  await desktopSelector.getByPlaceholder("搜尋所有 Apple 裝置…").fill("iPhone 14 Pro");
  await page
    .getByRole("button", { name: /^iPhone 14 Pro \/ 15 \/ 15 Pro \/ 16，2022–2024/ })
    .click();
  await page.getByRole("button", { name: "完整顯示" }).first().click();
  await page.getByRole("slider", { name: "縮放", exact: true }).fill("118");
  const safeArea = page.getByRole("checkbox", {
    name: "安全區域 建議的內容邊界",
    exact: true,
  });
  await safeArea.setChecked(false, { force: true });
  await expect(safeArea).not.toBeChecked();

  for (const format of ["png", "jpeg", "webp"] as const) {
    const bytes = await downloadedBytes(await downloadFormat(page, format));
    expect(imageDimensions(bytes, format)).toEqual({ width: 1179, height: 2556 });
  }

  await page.getByRole("button", { name: "移除圖片" }).first().click();
  await page.waitForTimeout(1_100);
  const objectUrls = await page.evaluate(
    () =>
      (window as Window & { __wallpectObjectUrlAudit: ObjectUrlAudit }).__wallpectObjectUrlAudit,
  );
  expect(new Set(objectUrls.created).size).toBe(4);
  expect(new Set(objectUrls.revoked)).toEqual(new Set(objectUrls.created));
  expect(postLoadRequests).toEqual([]);
});

test("@desktop replacing an image shows its thumbnail and starts a fresh composition", async ({
  page,
}) => {
  await page.goto("/");
  const rail = page.locator(".left-rail");
  await revealPreciseControls(rail);
  const thumbnail = rail.locator(".image-thumb img");
  const xPosition = rail.getByRole("spinbutton", { name: "X px" });
  const yPosition = rail.getByRole("spinbutton", { name: "Y px" });
  const undo = rail.getByRole("button", { name: "復原上一次構圖變更" });

  await expect(thumbnail).toHaveAttribute("src", "/assets/sample-aurora-wallpaper.png");
  await rail.getByRole("button", { name: "將圖片向右移動 10%" }).click();
  await expect(xPosition).toHaveValue("118");
  await rail.getByRole("button", { name: "橫向" }).click();
  await rail.getByRole("button", { name: "將圖片向下移動 10%" }).click();
  await expect(yPosition).toHaveValue("118");

  await page
    .locator('input[type="file"]')
    .setInputFiles("public/assets/sample-aurora-wallpaper.png");
  await expect(thumbnail).toHaveAttribute("src", /^blob:/);
  await expect(xPosition).toHaveValue("0");
  await expect(yPosition).toHaveValue("0");
  await expect(undo).toBeDisabled();
  await expect(page.locator('.visually-hidden[aria-live="polite"]')).toContainText(
    "並為新圖片重設構圖",
  );

  await rail.getByRole("button", { name: "直向" }).click();
  await expect(xPosition).toHaveValue("0");
  await expect(undo).toBeDisabled();
});

test("@desktop production shell works offline and does not serve HTML for missing assets", async ({
  context,
  page,
}) => {
  await page.goto("/");
  const updateViaCache = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.updateViaCache;
  });
  expect(updateViaCache).toBe("none");
  await page.reload();
  await expect(page.getByText("sample-aurora-wallpaper.png").first()).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);

  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle("Wallpect — 精準檢視桌布構圖");
    await expect(page.locator("canvas").first()).toBeVisible();
    const missingAsset = await page.evaluate(async () => {
      try {
        const response = await fetch(`/missing-offline-${Date.now()}.js`);
        return { rejected: false, status: response.status };
      } catch {
        return { rejected: true, status: 0 };
      }
    });
    expect(missingAsset).toEqual({ rejected: true, status: 0 });
  } finally {
    await context.setOffline(false);
  }
});

test("@desktop keyboard editing and labelled dialogs remain accessible", async ({ page }) => {
  await page.goto("/");
  const canvas = page.getByRole("application", { name: /桌布畫布/ });
  const xPosition = page.locator(".position-control label").first().locator("input");
  await expect(xPosition).toHaveValue("0");
  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect(xPosition).toHaveValue("9");
  const undo = page.getByRole("button", { name: "復原上一次構圖變更" }).first();
  const redo = page.getByRole("button", { name: "重做上一次構圖變更" }).first();
  await expect(undo).toBeEnabled();
  await page.keyboard.press("Control+z");
  await expect(xPosition).toHaveValue("0");
  await page.keyboard.press("Control+Shift+z");
  await expect(xPosition).toHaveValue("9");
  await undo.click();
  await expect(xPosition).toHaveValue("0");
  await redo.click();
  await expect(xPosition).toHaveValue("9");

  const about = page.getByRole("button", { name: "關於", exact: true }).first();
  await about.click();
  await expect(page.getByRole("dialog", { name: "安心掌握每一個像素。" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(about).toBeFocused();
});

test("@desktop original comparison preserves the active edit and exits on adjustment", async ({
  page,
}) => {
  await page.goto("/");
  await revealPreciseControls(page.locator(".left-rail"));
  const zoom = page.getByRole("slider", { name: "縮放", exact: true }).first();
  const xPosition = page.locator(".position-control label").first().locator("input");
  const moveRight = page.getByRole("button", { name: "向右移動 1 px" }).first();
  const compare = page.getByRole("button", { name: "比較原始構圖" });

  await zoom.fill("140");
  await moveRight.click();
  await expect(zoom).toHaveValue("140");
  await expect(zoom).toHaveAttribute("aria-valuetext", "140%");
  await expect(zoom).toHaveCSS("background-image", /30\.67%/);
  await expect(xPosition).toHaveValue("1");

  await compare.click();
  await expect(compare).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".wallpaper-canvas-wrap")).toHaveAttribute(
    "data-composition-view",
    "original",
  );
  await expect(page.getByText("原始構圖", { exact: true })).toBeVisible();
  await expect(zoom).toHaveValue("140");
  await expect(xPosition).toHaveValue("1");

  await moveRight.click();
  await expect(compare).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".wallpaper-canvas-wrap")).toHaveAttribute(
    "data-composition-view",
    "edited",
  );
  await expect(xPosition).toHaveValue("2");
});

test("@desktop focus preview expands the canvas without changing the composition", async ({
  page,
}) => {
  await page.goto("/");
  await revealPreciseControls(page.locator(".left-rail"));
  const stage = page.locator(".preview-stage");
  const before = await stage.boundingBox();
  const xPosition = page.locator(".position-control label").first().locator("input");

  await page.getByRole("button", { name: "向右移動 1 px" }).first().click();
  await expect(xPosition).toHaveValue("1");
  await page.getByRole("button", { name: "專注預覽" }).click();

  await expect(page.locator(".app-shell")).toHaveClass(/is-preview-focused/);
  await expect(page.getByRole("button", { name: "返回編輯" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".left-rail")).toBeHidden();
  await expect(page.locator(".right-rail")).toBeHidden();
  const switchToLandscape = page.getByRole("button", { name: "將預覽切換至橫向" });
  await expect(switchToLandscape).toBeVisible();
  await switchToLandscape.click();
  await expect(stage.locator(".device-scaler")).toHaveClass(/is-landscape/);
  const switchToPortrait = page.getByRole("button", { name: "將預覽切換至直向" });
  await expect(switchToPortrait).toBeVisible();
  await switchToPortrait.click();
  await expect(stage.locator(".device-scaler")).toHaveClass(/is-portrait/);
  const focused = await stage.boundingBox();
  expect(focused?.width).toBeGreaterThan(before?.width ?? 0);
  expect(focused?.height).toBeGreaterThan(before?.height ?? 0);
  await expect(xPosition).toHaveValue("1");

  await page.keyboard.press("Escape");
  await expect(page.locator(".app-shell")).not.toHaveClass(/is-preview-focused/);
  await expect(page.locator(".left-rail")).toBeVisible();
  await expect(page.locator(".right-rail")).toBeVisible();
  await expect(xPosition).toHaveValue("1");
});

test("@desktop keeps the accepted mixed interface stable under a dark OS preference", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const appearance = await page.evaluate(() => ({
    colorScheme: getComputedStyle(document.documentElement).colorScheme,
    bodyWidth: document.body.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(appearance.colorScheme).toBe("light");
  expect(appearance.bodyWidth).toBeLessThanOrEqual(appearance.viewportWidth);
  await expect(page.locator(".preview-stage")).toBeVisible();
  await expect(page.locator(".left-rail")).toBeVisible();
});

test("@desktop finds devices across categories and keeps the selected family aligned", async ({
  page,
}) => {
  await page.goto("/");
  const selector = page.locator(".left-rail");
  const summary = selector.getByRole("button", { name: /目前裝置/ });
  await expect(summary).toHaveAttribute("aria-expanded", "false");
  await summary.click();
  const search = selector.getByLabel("搜尋裝置", { exact: true });

  await search.fill("Studio Display");
  await expect(selector.getByText("1 個跨分類結果")).toBeVisible();
  await selector.getByRole("button", { name: /iMac 27-inch 5K.*5120 × 2880/ }).click();
  await expect(summary).toHaveAttribute("aria-expanded", "false");
  await summary.click();
  await expect(selector.getByRole("button", { name: "Mac · 17", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(selector.getByText("搜尋會涵蓋 iPhone、iPad 與 Mac。")).toBeVisible();

  await search.fill("5120x2880");
  await expect(
    selector.locator(".device-list").getByRole("button", {
      name: /iMac 27-inch 5K.*5120 × 2880/,
    }),
  ).toBeVisible();
});

test("@desktop keeps adjustment controls in reach and opens device browsing on demand", async ({
  page,
}) => {
  await page.goto("/");
  const rail = page.locator(".left-rail");
  const summary = rail.getByRole("button", { name: /目前裝置/ });
  const adjustment = rail.locator(".adjust-section");
  const preciseControls = adjustment.locator(".precision-controls");

  await expect(summary).toHaveAttribute("aria-expanded", "false");
  await expect(rail.getByPlaceholder("搜尋所有 Apple 裝置…")).toBeHidden();
  await expect(adjustment.getByRole("slider", { name: "縮放", exact: true })).toBeVisible();
  await expect(preciseControls).not.toHaveAttribute("open", "");
  await expect(preciseControls.getByLabel("目前精確數值")).toHaveText("X 0 · Y 0 · 0°");
  await expect(preciseControls.locator('input[type="number"]').first()).toBeHidden();
  const railBox = await rail.boundingBox();
  const adjustmentBox = await adjustment.boundingBox();
  expect(railBox).not.toBeNull();
  expect(adjustmentBox).not.toBeNull();
  expect(adjustmentBox!.y).toBeLessThan(railBox!.y + railBox!.height);

  await revealPreciseControls(adjustment);
  await expect(preciseControls.locator('input[type="number"]').first()).toBeVisible();
  await preciseControls.locator("summary").click();
  await expect(preciseControls).not.toHaveAttribute("open", "");

  await summary.click();
  await expect(summary).toHaveAttribute("aria-expanded", "true");
  const search = rail.getByPlaceholder("搜尋所有 Apple 裝置…");
  await expect(search).toBeVisible();
  await search.fill("iPhone Air");
  await rail.getByRole("button", { name: /^iPhone Air，2025/ }).click();

  await expect(summary).toHaveAttribute("aria-expanded", "false");
  await expect(search).toBeHidden();
  await expect(adjustment.getByRole("slider", { name: "縮放", exact: true })).toBeVisible();
});

test("@desktop keeps the common export action visible at laptop height", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const rail = page.locator(".right-rail");
  const download = rail.getByRole("button", { name: "下載桌布" });
  const options = rail.locator(".export-options");
  await expect(download).toBeVisible();
  await expect(options).not.toHaveAttribute("open", "");
  await expect(rail.getByRole("group", { name: "匯出格式" })).toBeHidden();

  const railBox = await rail.boundingBox();
  const downloadBox = await download.boundingBox();
  expect(railBox).not.toBeNull();
  expect(downloadBox).not.toBeNull();
  expect(downloadBox!.y).toBeGreaterThanOrEqual(railBox!.y);
  expect(downloadBox!.y + downloadBox!.height).toBeLessThanOrEqual(railBox!.y + railBox!.height);

  await options.locator("summary").click();
  await expect(options).toHaveAttribute("open", "");
  await expect(rail.getByRole("group", { name: "匯出格式" })).toBeVisible();
});

test("@desktop keeps actionable crop guidance in the first adjustment viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");

  const rail = page.locator(".left-rail");
  await rail.getByRole("button", { name: "橫向", exact: true }).click();
  const feedback = rail.getByRole("region", { name: "構圖概況" });
  await expect(feedback).toContainText("大量裁切");
  const railBox = await rail.boundingBox();
  const feedbackBox = await feedback.boundingBox();
  expect(railBox).not.toBeNull();
  expect(feedbackBox).not.toBeNull();
  expect(feedbackBox!.y).toBeGreaterThanOrEqual(railBox!.y);
  expect(feedbackBox!.y + feedbackBox!.height).toBeLessThanOrEqual(railBox!.y + railBox!.height);

  const contentPosition = rail.getByRole("region", { name: "內容定位" });
  const verticalPosition = contentPosition.getByRole("group", { name: "垂直內容位置" });
  await contentPosition.scrollIntoViewIfNeeded();
  await expect(contentPosition).toBeVisible();
  const contentPositionBox = await contentPosition.boundingBox();
  expect(contentPositionBox).not.toBeNull();
  expect(contentPositionBox!.y).toBeGreaterThanOrEqual(railBox!.y);
  expect(contentPositionBox!.y + contentPositionBox!.height).toBeLessThanOrEqual(
    railBox!.y + railBox!.height,
  );
  const topPosition = verticalPosition.getByRole("button", { name: "上方" });
  const middlePosition = verticalPosition.getByRole("button", { name: "中央" });
  await topPosition.click();
  await expect(topPosition).toHaveAttribute("aria-pressed", "true");
  await expect(rail.getByLabel("目前精確數值")).toContainText("Y 2180");
  await expect(page.locator('.visually-hidden[aria-live="polite"]')).toContainText(
    "已定位圖片，以顯示上方內容",
  );
  await middlePosition.click();
  await expect(rail.getByLabel("目前精確數值")).toContainText("Y 0");

  await feedback.getByRole("button", { name: "顯示整張圖片" }).click();
  await expect(feedback).toContainText("完整保留");
  await expect(feedback.getByLabel("預估裁切")).toHaveText("0.0%");
  await expect(rail.getByRole("button", { name: "完整顯示" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const background = rail.getByRole("group", { name: "背景", exact: true });
  const backgroundBox = await background.boundingBox();
  expect(backgroundBox).not.toBeNull();
  expect(backgroundBox!.y).toBeGreaterThanOrEqual(railBox!.y);
  expect(backgroundBox!.y + backgroundBox!.height).toBeLessThanOrEqual(
    railBox!.y + railBox!.height,
  );
  await background.getByRole("button", { name: "模糊延伸" }).click();
  await expect(background.getByRole("button", { name: "模糊延伸" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(background).toContainText("以柔化的滿版副本填補未覆蓋區域");
  await expect(rail.getByRole("button", { name: "復原上一次構圖變更" })).toBeEnabled();
});

test("@desktop guide changes reveal their matching preview mode immediately", async ({ page }) => {
  await page.goto("/");
  const overlays = page.locator(".right-rail");
  const clean = page.getByRole("button", { name: "純桌布", exact: true });
  const lockScreen = page.getByRole("button", { name: "鎖定畫面", exact: true });
  const safePreview = page.getByRole("button", { name: "安全區域", exact: true });
  const clock = overlays.getByRole("checkbox", { name: /時鐘/ });
  const safeArea = overlays.getByRole("checkbox", { name: /安全區域/ });
  const grid = overlays.getByRole("checkbox", { name: /構圖格線/ });

  await clean.click();
  await clock.setChecked(false, { force: true });
  await expect(lockScreen).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".lock-overlay")).toBeVisible();
  await expect(page.locator(".lock-clock")).toHaveCount(0);

  await clean.click();
  await clock.setChecked(true, { force: true });
  await expect(lockScreen).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".lock-clock")).toBeVisible();
  await expect(page.locator('.visually-hidden[aria-live="polite"]')).toContainText(
    "已開啟「鎖定畫面」預覽",
  );

  await clean.click();
  await safeArea.setChecked(false, { force: true });
  await expect(safePreview).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".safe-area-overlay")).toHaveCount(0);

  await clean.click();
  await safeArea.setChecked(true, { force: true });
  await expect(safePreview).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".safe-area-overlay")).toBeVisible();

  await clean.click();
  await grid.setChecked(true, { force: true });
  await expect(clean).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".grid-overlay")).toBeVisible();
});

test("@mobile workspace has no horizontal overflow and exposes all editor tabs", async ({
  page,
}) => {
  await page.goto("/");
  const panelNavigation = page.getByRole("navigation", { name: "編輯器面板" });
  await expect(panelNavigation).toBeVisible();
  await expect(page.getByRole("button", { name: "調整", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const previewStage = page.locator(".preview-stage");
  const previewBeforeFocus = await previewStage.boundingBox();
  const switchToLandscape = page.getByRole("button", { name: "將預覽切換至橫向" });
  const switchToLandscapeBox = await switchToLandscape.boundingBox();
  expect(switchToLandscapeBox?.width).toBeGreaterThanOrEqual(44);
  expect(switchToLandscapeBox?.height).toBeGreaterThanOrEqual(44);
  await switchToLandscape.click();
  await expect(previewStage.locator(".device-scaler")).toHaveClass(/is-landscape/);
  await expect(page.getByRole("button", { name: "調整", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.getByRole("button", { name: "將預覽切換至直向" }).click();
  await expect(previewStage.locator(".device-scaler")).toHaveClass(/is-portrait/);
  const mobilePanel = page.locator(".mobile-panel");
  const panelBeforeExpansion = await mobilePanel.boundingBox();
  const moreControls = page.getByRole("button", { name: "更多控制", exact: true });
  const moreControlsBox = await moreControls.boundingBox();
  expect(moreControlsBox?.width).toBeGreaterThanOrEqual(44);
  expect(moreControlsBox?.height).toBeGreaterThanOrEqual(44);
  await moreControls.click();
  await expect(page.locator(".app-shell")).toHaveClass(/is-mobile-panel-expanded/);
  const morePreview = page.getByRole("button", { name: "更多預覽", exact: true });
  await expect(morePreview).toHaveAttribute("aria-expanded", "true");
  const previewWithExpandedPanel = await previewStage.boundingBox();
  const expandedPanel = await mobilePanel.boundingBox();
  expect(expandedPanel?.height).toBeGreaterThan(panelBeforeExpansion?.height ?? 0);
  expect(previewWithExpandedPanel?.height).toBeLessThan(previewBeforeFocus?.height ?? 0);
  expect(previewWithExpandedPanel?.height).toBeGreaterThanOrEqual(170);
  await morePreview.click();
  await expect(page.locator(".app-shell")).not.toHaveClass(/is-mobile-panel-expanded/);
  await expect(moreControls).toHaveAttribute("aria-expanded", "false");
  const focusPreview = page.getByRole("button", { name: "專注預覽" });
  const focusPreviewBox = await focusPreview.boundingBox();
  expect(focusPreviewBox?.width).toBeGreaterThanOrEqual(44);
  expect(focusPreviewBox?.height).toBeGreaterThanOrEqual(44);
  await focusPreview.click();
  await expect(page.locator(".app-shell")).toHaveClass(/is-preview-focused/);
  await expect(panelNavigation).toBeHidden();
  await expect(page.locator(".mobile-panel")).toBeHidden();
  const focusedPreview = await previewStage.boundingBox();
  expect(focusedPreview?.height).toBeGreaterThan(previewBeforeFocus?.height ?? 0);
  await page.keyboard.press("Escape");
  await expect(panelNavigation).toBeVisible();

  const compare = page.getByRole("button", { name: "比較原始構圖" });
  await expect(compare).toBeEnabled();
  const compareBox = await compare.boundingBox();
  expect(compareBox?.width).toBeGreaterThanOrEqual(44);
  expect(compareBox?.height).toBeGreaterThanOrEqual(44);
  await compare.click();
  await expect(compare).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("原始構圖", { exact: true })).toBeVisible();
  const comparisonDimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    width: document.documentElement.clientWidth,
  }));
  expect(comparisonDimensions.scrollWidth).toBeLessThanOrEqual(comparisonDimensions.width);

  for (const label of ["圖片", "裝置", "調整", "覆疊", "匯出"]) {
    const tab = page.getByRole("button", { name: label, exact: true });
    await tab.click();
    await expect(tab).toHaveAttribute("aria-current", "page");
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      width: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);
  }
  const mobileDownload = mobilePanel.getByRole("button", { name: "下載桌布" });
  const mobileDownloadBox = await mobileDownload.boundingBox();
  expect(mobileDownloadBox?.height).toBeGreaterThanOrEqual(44);
  await expect(mobilePanel.getByRole("group", { name: "匯出格式" })).toBeVisible();

  await page.getByRole("button", { name: "裝置", exact: true }).click();
  const mobileSelector = page.locator(".mobile-panel");
  await mobileSelector.getByLabel("搜尋裝置", { exact: true }).fill("MacBook Neo");
  const clearSearchBox = await mobileSelector
    .getByRole("button", { name: "清除搜尋" })
    .boundingBox();
  expect(clearSearchBox?.width).toBeGreaterThanOrEqual(44);
  expect(clearSearchBox?.height).toBeGreaterThanOrEqual(44);
  await mobileSelector.getByRole("button", { name: /MacBook Neo，2026/ }).click();
  await expect(page.getByRole("button", { name: "調整", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(mobileSelector).toContainText("MacBook Neo");

  await page.getByRole("button", { name: "裝置", exact: true }).click();
  await expect(
    mobileSelector.getByRole("button", { name: "Mac · 17", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "調整", exact: true }).click();
  const compositionFeedback = mobileSelector.getByRole("region", { name: "構圖概況" });
  await expect(compositionFeedback).toBeVisible();
  await expect(compositionFeedback).toContainText("大量裁切");
  const panelScroll = mobileSelector.locator(".mobile-panel-scroll");
  const compositionFeedbackBox = await compositionFeedback.boundingBox();
  const panelScrollBox = await panelScroll.boundingBox();
  expect(compositionFeedbackBox?.y).toBeGreaterThanOrEqual(panelScrollBox?.y ?? 0);
  expect(
    (compositionFeedbackBox?.y ?? 0) + (compositionFeedbackBox?.height ?? 0),
  ).toBeLessThanOrEqual((panelScrollBox?.y ?? 0) + (panelScrollBox?.height ?? 0));
  const fillCrop = Number.parseFloat(
    (await compositionFeedback.getByLabel("預估裁切").textContent()) ?? "0",
  );
  expect(fillCrop).toBeGreaterThan(70);
  const contentPosition = mobileSelector.getByRole("region", { name: "內容定位" });
  const verticalPosition = contentPosition.getByRole("group", { name: "垂直內容位置" });
  const topPosition = verticalPosition.getByRole("button", { name: "上方" });
  const middlePosition = verticalPosition.getByRole("button", { name: "中央" });
  await expect(contentPosition).toBeVisible();
  for (const control of [topPosition, middlePosition]) {
    const box = await control.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await topPosition.click();
  await expect(topPosition).toHaveAttribute("aria-pressed", "true");
  await expect(mobileSelector.getByLabel("目前精確數值")).not.toContainText("Y 0");
  await middlePosition.click();
  await expect(mobileSelector.getByLabel("目前精確數值")).toContainText("Y 0");
  const showWholeImage = compositionFeedback.getByRole("button", { name: "顯示整張圖片" });
  const showWholeImageBox = await showWholeImage.boundingBox();
  expect(showWholeImageBox?.width).toBeGreaterThanOrEqual(44);
  expect(showWholeImageBox?.height).toBeGreaterThanOrEqual(44);
  await showWholeImage.click();
  await expect(compositionFeedback).toContainText("完整保留");
  await expect(compositionFeedback.getByLabel("預估裁切")).toHaveText("0.0%");
  const backgroundChoices = mobileSelector.getByRole("group", { name: "畫布背景" });
  const backgroundChoicesBox = await backgroundChoices.boundingBox();
  expect(backgroundChoicesBox?.y).toBeGreaterThanOrEqual(panelScrollBox?.y ?? 0);
  expect((backgroundChoicesBox?.y ?? 0) + (backgroundChoicesBox?.height ?? 0)).toBeLessThanOrEqual(
    (panelScrollBox?.y ?? 0) + (panelScrollBox?.height ?? 0),
  );
  const blurBackground = backgroundChoices.getByRole("button", { name: "模糊延伸" });
  await blurBackground.click();
  await expect(blurBackground).toHaveAttribute("aria-pressed", "true");
  await expect(mobileSelector).toContainText("以柔化的滿版副本填補未覆蓋區域");
  const mobileZoom = mobileSelector.getByRole("slider", { name: "縮放", exact: true });
  await mobileZoom.scrollIntoViewIfNeeded();
  await expect(mobileZoom).toHaveAttribute("aria-valuetext", "100%");
  await expect(mobileZoom).toHaveCSS("background-image", /20%/);
  await mobileZoom.fill("125");
  await expect(mobileZoom).toHaveAttribute("aria-valuetext", "125%");
  await expect(mobileZoom).toHaveCSS("background-image", /26\.67%/);
  const preciseControls = mobileSelector.locator(".precision-controls");
  const preciseValues = preciseControls.getByLabel("目前精確數值");
  const xPosition = preciseControls.locator('.position-control input[type="number"]').first();
  await expect(preciseControls).not.toHaveAttribute("open", "");
  await expect(preciseValues).toHaveText("X 0 · Y 0 · 0°");
  await expect(xPosition).toBeHidden();
  const quickPosition = mobileSelector.getByRole("group", { name: "快速定位" });
  await quickPosition.scrollIntoViewIfNeeded();
  const quickPositionBox = await quickPosition.boundingBox();
  expect(quickPositionBox?.y).toBeGreaterThanOrEqual(panelScrollBox?.y ?? 0);
  expect((quickPositionBox?.y ?? 0) + (quickPositionBox?.height ?? 0)).toBeLessThanOrEqual(
    (panelScrollBox?.y ?? 0) + (panelScrollBox?.height ?? 0),
  );
  const quickMoveRight = quickPosition.getByRole("button", { name: "將圖片向右移動 10%" });
  const quickCenter = quickPosition.getByRole("button", { name: "置中圖片" });
  await quickMoveRight.click();
  await expect(xPosition).toHaveValue("241");
  await expect(preciseValues).toHaveText("X 241 · Y 0 · 0°");
  await quickCenter.click();
  await expect(xPosition).toHaveValue("0");
  await expect(preciseValues).toHaveText("X 0 · Y 0 · 0°");
  for (const control of [quickMoveRight, quickCenter]) {
    const box = await control.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  const preciseSummary = preciseControls.locator("summary");
  await preciseSummary.scrollIntoViewIfNeeded();
  const preciseSummaryBox = await preciseSummary.boundingBox();
  expect(preciseSummaryBox?.height).toBeGreaterThanOrEqual(44);
  await revealPreciseControls(mobileSelector);
  await expect(xPosition).toBeVisible();
  const moveRight = mobileSelector.getByRole("button", { name: "向右移動 1 px" });
  const undo = mobileSelector.getByRole("button", { name: "復原上一次構圖變更" });
  await moveRight.click();
  await expect(compare).toHaveAttribute("aria-pressed", "false");
  await expect(xPosition).toHaveValue("1");
  for (const control of [moveRight, undo]) {
    const box = await control.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await undo.click();
  await expect(xPosition).toHaveValue("0");

  await page.getByRole("button", { name: "圖片", exact: true }).click();
  await mobileSelector
    .locator('input[type="file"]')
    .setInputFiles("public/assets/sample-aurora-wallpaper.png");
  await expect(page.getByRole("button", { name: "調整", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("@mobile guide changes reveal their matching preview mode", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "覆疊", exact: true }).click();
  const panel = page.locator(".mobile-panel");
  const clean = page.getByRole("button", { name: "純桌布", exact: true });
  const lockScreen = page.getByRole("button", { name: "鎖定畫面", exact: true });
  const safePreview = page.getByRole("button", { name: "安全區域", exact: true });
  const clock = panel.getByRole("checkbox", { name: /時鐘/ });
  const safeArea = panel.getByRole("checkbox", { name: /安全區域/ });

  await clean.click();
  await clock.setChecked(false, { force: true });
  await expect(lockScreen).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".lock-overlay")).toBeVisible();

  await clean.click();
  await safeArea.setChecked(false, { force: true });
  await expect(safePreview).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".safe-area-overlay")).toHaveCount(0);

  await clean.click();
  await safeArea.setChecked(true, { force: true });
  await expect(safePreview).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".safe-area-overlay")).toBeVisible();
  await expect(panel).toContainText("調整輔助線時會自動開啟相應的預覽模式");
});

test("@mobile compact phone keeps the header and panel controls inside the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");

  const language = page.locator(".language-switcher");
  const menu = page.getByRole("button", { name: "開啟選單" });
  const moreControls = page.getByRole("button", { name: "更多控制", exact: true });
  for (const control of [language, menu, moreControls]) {
    const box = await control.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  const switchOrientation = page.getByRole("button", { name: "將預覽切換至橫向" });
  const switchOrientationBox = await switchOrientation.boundingBox();
  expect(switchOrientationBox?.width).toBeGreaterThanOrEqual(44);
  expect(switchOrientationBox?.height).toBeGreaterThanOrEqual(44);
  expect(switchOrientationBox?.x).toBeGreaterThanOrEqual(0);
  expect((switchOrientationBox?.x ?? 0) + (switchOrientationBox?.width ?? 0)).toBeLessThanOrEqual(
    320,
  );

  const stage = page.locator(".preview-stage");
  const panel = page.locator(".mobile-panel");
  const balancedPanel = await panel.boundingBox();
  await moreControls.click();
  const expandedStage = await stage.boundingBox();
  const expandedPanel = await panel.boundingBox();
  expect(expandedStage?.height).toBeGreaterThanOrEqual(170);
  expect(expandedPanel?.height).toBeGreaterThan(balancedPanel?.height ?? 0);

  await page.getByRole("button", { name: "裝置", exact: true }).click();
  await panel.getByRole("button", { name: "橫向", exact: true }).click();
  await page.getByRole("button", { name: "調整", exact: true }).click();
  const feedback = panel.getByRole("region", { name: "構圖概況" });
  const feedbackBox = await feedback.boundingBox();
  const panelScrollBox = await panel.locator(".mobile-panel-scroll").boundingBox();
  expect(feedbackBox?.y).toBeGreaterThanOrEqual(panelScrollBox?.y ?? 0);
  expect((feedbackBox?.y ?? 0) + (feedbackBox?.height ?? 0)).toBeLessThanOrEqual(
    (panelScrollBox?.y ?? 0) + (panelScrollBox?.height ?? 0),
  );
  const showWholeImage = feedback.getByRole("button", { name: "顯示整張圖片" });
  const showWholeImageBox = await showWholeImage.boundingBox();
  expect(showWholeImageBox?.height).toBeGreaterThanOrEqual(44);

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    width: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);

  await page.getByRole("button", { name: "匯出", exact: true }).click();
  const download = panel.getByRole("button", { name: "下載桌布" });
  await download.scrollIntoViewIfNeeded();
  const downloadBox = await download.boundingBox();
  expect(downloadBox?.height).toBeGreaterThanOrEqual(44);
  expect(downloadBox?.x).toBeGreaterThanOrEqual(0);
  expect((downloadBox?.x ?? 0) + (downloadBox?.width ?? 0)).toBeLessThanOrEqual(320);
});

test("@desktop defaults to Traditional Chinese and persists language switches", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("combobox", { name: "語言" })).toHaveValue("zh-Hant");
  await expect(page.getByRole("button", { name: "關於", exact: true })).toBeVisible();
  await expect(page).toHaveTitle("Wallpect — 精準檢視桌布構圖");

  await page.getByRole("combobox", { name: "語言" }).selectOption("en");
  await expect(page.getByRole("button", { name: "About", exact: true })).toBeVisible();
  await expect(page).toHaveTitle("Wallpect — Wallpaper fit, inspected");

  await page.reload();
  await expect(page.getByRole("combobox", { name: "Language" })).toHaveValue("en");
  await page.getByRole("combobox", { name: "Language" }).selectOption("zh-Hans");
  await expect(page.getByRole("button", { name: "关于", exact: true })).toBeVisible();
  await expect(page).toHaveTitle("Wallpect — 精准检查壁纸构图");
});

test("@desktop exposes accurate privacy, terms, disclaimer, and source notices", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "隱私", exact: true }).first().click();
  const privacyDialog = page.getByRole("dialog");
  await expect(
    privacyDialog.getByRole("heading", { name: "你的圖片只留在裝置上。" }),
  ).toBeVisible();
  await expect(privacyDialog).toContainText("最多四個最近使用的裝置識別碼");
  await expect(privacyDialog).toContainText("託管於 Cloudflare");
  await privacyDialog.getByRole("button", { name: "關閉" }).click();

  await page.getByRole("button", { name: "條款與資料", exact: true }).first().click();
  const legalDialog = page.getByRole("dialog");
  await expect(legalDialog.getByRole("heading", { name: "條款、私隱與資料使用。" })).toBeVisible();
  await expect(legalDialog.getByRole("heading", { name: "使用條款" })).toBeVisible();
  await expect(legalDialog.getByRole("heading", { name: "資料來源與方法" })).toBeVisible();
  await expect(legalDialog).toContainText("生效日期：2026 年 8 月 11 日");
  await expect(legalDialog).toContainText("不使用 Apple 或第三方裝置資料 API");
  await expect(legalDialog).toContainText("並非法律意見");
  await expect(legalDialog.getByRole("link", { name: /Apple 網站使用條款/ })).toHaveAttribute(
    "rel",
    "noreferrer",
  );
  await expect(legalDialog.getByRole("link", { name: /開源授權通知/ })).toHaveAttribute(
    "href",
    "/THIRD_PARTY_NOTICES.txt",
  );
});

test("@mobile legal notice is reachable and closes the navigation menu", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "開啟選單" }).click();
  const navigation = page.getByRole("navigation", { name: "主要導覽" });
  await expect(navigation).toHaveClass(/is-open/);
  await navigation.getByRole("button", { name: "條款與資料" }).click();
  await expect(page.locator("#primary-navigation")).not.toHaveClass(/is-open/);
  await expect(page.getByRole("dialog").getByRole("heading", { name: "使用條款" })).toBeVisible();
});

test("@browser-matrix loads the editor, sample image, and device canvas", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Wallpect/);
  await expect(page.getByText("Wallpect", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("sample-aurora-wallpaper.png").first()).toBeVisible();
  await expect(page.locator("canvas").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /下載桌布/ })).toBeEnabled();

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    width: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);
});
