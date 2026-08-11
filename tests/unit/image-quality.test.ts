import { describe, expect, it } from "vitest";
import {
  calculateImageEnlargement,
  formatImageEnlargement,
  getImageResolutionSummary,
} from "../../src/core/image-quality";
import { DEFAULT_TRANSFORM } from "../../src/types/editor";

describe("source image resolution feedback", () => {
  it("calculates enlargement from the shared render geometry", () => {
    const enlargement = calculateImageEnlargement(852, 1846, 1179, 2556, DEFAULT_TRANSFORM);

    expect(enlargement).toBeCloseTo(1.385, 3);
    expect(formatImageEnlargement(enlargement)).toBe("1.4×");
    expect(getImageResolutionSummary(enlargement)).toMatchObject({
      label: "Enlarged",
      tone: "caution",
    });
  });

  it("distinguishes sufficient, small, and strong enlargement", () => {
    expect(getImageResolutionSummary(1)).toMatchObject({
      label: "Source pixels sufficient",
      tone: "good",
    });
    expect(formatImageEnlargement(1)).toBeNull();
    expect(getImageResolutionSummary(1.2).label).toBe("Small enlargement");
    expect(getImageResolutionSummary(3)).toMatchObject({
      label: "Strong enlargement",
      tone: "warning",
    });
  });

  it("rejects invalid enlargement values", () => {
    expect(() => getImageResolutionSummary(0)).toThrow(/positive/);
    expect(() => getImageResolutionSummary(Number.NaN)).toThrow(/positive/);
  });
});
