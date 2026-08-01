import { expect, test, type Download, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { imageDimensions } from "./image-dimensions";

type ExportFormat = "png" | "jpeg" | "webp";
type ObjectUrlAudit = { created: string[]; revoked: string[] };

async function downloadFormat(page: Page, format: ExportFormat): Promise<Download> {
  const label = format === "png" ? "PNG" : format === "jpeg" ? "JPEG" : "WebP";
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

  await page
    .locator(".left-rail")
    .getByPlaceholder("搜尋型號、年份或解析度…")
    .fill("iPhone 14 Pro");
  await page.getByRole("button", { name: /iPhone 14 Pro，2022/ }).click();
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

  const about = page.getByRole("button", { name: "關於", exact: true }).first();
  await about.click();
  await expect(page.getByRole("dialog", { name: "安心掌握每一個像素。" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(about).toBeFocused();
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

test("@mobile workspace has no horizontal overflow and exposes all editor tabs", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "編輯器面板" })).toBeVisible();
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
  await expect(legalDialog).toContainText("不使用 Apple 或第三方裝置資料 API");
  await expect(legalDialog).toContainText("並非法律意見");
  await expect(legalDialog.getByRole("link", { name: /Apple 網站使用條款/ })).toHaveAttribute(
    "rel",
    "noreferrer",
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
