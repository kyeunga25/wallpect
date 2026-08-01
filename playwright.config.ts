import { defineConfig, devices } from "@playwright/test";

const deployedBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  outputDir: "/tmp/wallpect-playwright-results",
  use: {
    baseURL: deployedBaseUrl ?? "http://127.0.0.1:4174",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", grep: /@desktop/, use: { ...devices["Desktop Chrome"] } },
    {
      name: "webkit-mobile",
      grep: /@mobile/,
      use: { ...devices["iPhone 13"], browserName: "webkit" },
    },
    {
      name: "edge",
      grep: /@browser-matrix/,
      use: { ...devices["Desktop Edge"], browserName: "chromium", channel: "msedge" },
    },
    {
      name: "firefox",
      grep: /@browser-matrix/,
      use: { ...devices["Desktop Firefox"], browserName: "firefox" },
    },
  ],
  webServer: deployedBaseUrl
    ? undefined
    : {
        command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4174",
        url: "http://127.0.0.1:4174",
        reuseExistingServer: false,
      },
});
