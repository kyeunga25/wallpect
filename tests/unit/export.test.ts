import { afterEach, describe, expect, it, vi } from "vitest";
import {
  downloadBlob,
  ensureFilenameExtension,
  extensionForFormat,
  generateFilename,
} from "../../src/core/export";

afterEach(() => vi.restoreAllMocks());

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

  it("revokes the temporary download URL after use", () => {
    vi.useFakeTimers();
    const createObjectUrl = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:wallpect-test");
    const revokeObjectUrl = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    downloadBlob(new Blob(["wallpaper"], { type: "image/png" }), "wallpaper.png");

    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectUrl).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:wallpect-test");
    vi.useRealTimers();
  });
});
