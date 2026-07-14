import { describe, expect, it } from "vitest";
import { MAX_FILE_SIZE, validateImageFile } from "../../src/core/image-decoder";

describe("local image validation", () => {
  it("accepts supported image types", () => {
    expect(() =>
      validateImageFile(new File(["image"], "art.webp", { type: "image/webp" })),
    ).not.toThrow();
  });

  it("rejects HEIC and oversized files with actionable errors", () => {
    expect(() => validateImageFile(new File(["x"], "photo.heic", { type: "image/heic" }))).toThrow(
      /PNG, JPEG, or WebP/,
    );
    const huge = new File(["x"], "huge.png", { type: "image/png" });
    Object.defineProperty(huge, "size", { value: MAX_FILE_SIZE + 1 });
    expect(() => validateImageFile(huge)).toThrow(/30 MB/);
  });
});
