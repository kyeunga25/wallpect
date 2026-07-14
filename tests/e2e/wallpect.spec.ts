import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("@desktop upload, select, adjust, toggle an overlay, and export exact PNG", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("Wallpect", { exact: true }).first()).toBeVisible();
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles("public/assets/sample-aurora-wallpaper.png");
  await expect(page.getByText("sample-aurora-wallpaper.png").first()).toBeVisible();

  await page.getByPlaceholder("搜尋型號、年份或解析度…").fill("iPhone 14 Pro");
  await page.getByRole("option", { name: /iPhone 14 Pro，2022/ }).click();
  await page.getByRole("button", { name: "完整顯示" }).first().click();
  await page.getByRole("slider", { name: "縮放", exact: true }).fill("118");
  const safeArea = page.getByRole("checkbox", {
    name: "安全區域 建議的內容邊界",
    exact: true,
  });
  await safeArea.setChecked(false, { force: true });
  await expect(safeArea).not.toBeChecked();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /下載桌布/ }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const png = await readFile(path!);
  expect(png.toString("ascii", 1, 4)).toBe("PNG");
  expect(png.readUInt32BE(16)).toBe(1179);
  expect(png.readUInt32BE(20)).toBe(2556);
});

test("@mobile workspace has no horizontal overflow and exposes all editor tabs", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "編輯器面板" })).toBeVisible();
  for (const label of ["圖片", "裝置", "調整", "覆疊", "匯出"])
    await expect(page.getByRole("button", { name: label })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    width: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);
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
