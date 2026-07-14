import { describe, expect, it } from "vitest";
import {
  calculateCropPercent,
  calculateFitScale,
  calculatePinchScale,
  calculateRenderGeometry,
  clampTransform,
} from "../../src/core/fit";
import { DEFAULT_TRANSFORM } from "../../src/types/editor";

describe("wallpaper fit calculations", () => {
  it("covers a portrait canvas without leaving gaps", () => {
    expect(calculateFitScale(4000, 3000, 1179, 2556, "cover")).toBeCloseTo(0.852);
  });

  it("contains an image without cropping", () => {
    expect(calculateFitScale(4000, 3000, 1179, 2556, "contain")).toBeCloseTo(0.29475);
  });

  it("uses normalized translation for preview/export parity", () => {
    const geometry = calculateRenderGeometry(1000, 1000, 100, 200, {
      ...DEFAULT_TRANSFORM,
      translateX: 0.1,
      translateY: -0.25,
    });
    expect(geometry.centerX).toBe(60);
    expect(geometry.centerY).toBe(50);
  });

  it("reports crop percentage and clamps unsafe transforms", () => {
    expect(calculateCropPercent(4000, 3000, 1179, 2556, DEFAULT_TRANSFORM)).toBeGreaterThan(60);
    expect(
      clampTransform({ ...DEFAULT_TRANSFORM, scale: 10, translateX: -3, rotationDeg: 300 }),
    ).toMatchObject({ scale: 4, translateX: -1, rotationDeg: 180 });
  });

  it("rejects invalid dimensions", () => {
    expect(() => calculateFitScale(0, 100, 100, 100, "cover")).toThrow(/positive/);
  });

  it("converts pinch distance into a clamped zoom scale", () => {
    expect(calculatePinchScale(1, 100, 150)).toBe(1.5);
    expect(calculatePinchScale(3, 100, 200)).toBe(4);
    expect(calculatePinchScale(1, 0, 200)).toBe(1);
  });
});
