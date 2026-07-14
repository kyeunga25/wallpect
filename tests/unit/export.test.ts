import { describe, expect, it } from "vitest";
import {
  ensureFilenameExtension,
  extensionForFormat,
  generateFilename,
} from "../../src/core/export";

describe("export naming", () => {
  it("uses the required device-orientation-resolution convention", () => {
    expect(generateFilename("iphone-15-pro", "portrait", 1179, 2556, "png")).toBe(
      "wallpect-iphone-15-pro-portrait-1179x2556.png",
    );
  });

  it("normalizes extensions when format changes", () => {
    expect(ensureFilenameExtension("my-wallpaper.PNG", "webp")).toBe("my-wallpaper.webp");
    expect(extensionForFormat("jpeg")).toBe("jpg");
  });

  it("removes path separators and control characters from download names", () => {
    expect(ensureFilenameExtension("../unsafe\u202Ename\n.png", "png")).toBe("..-unsafename.png");
  });
});
