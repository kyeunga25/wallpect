import { describe, expect, it } from "vitest";
import {
  alignImageToCanvas,
  calculateCropPercent,
  calculateFitScale,
  calculateImageAlignmentOffsets,
  calculatePinchScale,
  calculateRenderGeometry,
  clampTransform,
  clampTransformForImage,
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
    const transform = {
      ...DEFAULT_TRANSFORM,
      translateX: 0.1,
      translateY: -0.25,
    };
    const preview = calculateRenderGeometry(1000, 1000, 393, 852, transform);
    const output = calculateRenderGeometry(1000, 1000, 1179, 2556, transform);
    expect(output.centerX / preview.centerX).toBeCloseTo(3);
    expect(output.centerY / preview.centerY).toBeCloseTo(3);
    expect(output.renderedWidth / preview.renderedWidth).toBeCloseTo(3);
    expect(output.renderedHeight / preview.renderedHeight).toBeCloseTo(3);
  });

  it("calculates edge alignment from the same normalized render geometry", () => {
    const offsets = calculateImageAlignmentOffsets(852, 1846, 2556, 1179, DEFAULT_TRANSFORM);
    expect(offsets.horizontal).toEqual({ start: 0, center: 0, end: -0 });
    expect(offsets.vertical.start).toBeCloseTo(1.8486, 3);
    expect(offsets.vertical.center).toBe(0);
    expect(offsets.vertical.end).toBeCloseTo(-1.8486, 3);

    const top = alignImageToCanvas(
      852,
      1846,
      2556,
      1179,
      { ...DEFAULT_TRANSFORM, translateX: 0.2 },
      "vertical",
      "start",
    );
    expect(top.translateX).toBe(0.2);
    expect(top.translateY).toBeCloseTo(offsets.vertical.start);
  });

  it("keeps edge-aligned extreme aspect ratios reachable while constraining gestures", () => {
    const clamped = clampTransformForImage(852, 1846, 2556, 1179, {
      ...DEFAULT_TRANSFORM,
      translateX: 8,
      translateY: 8,
    });
    expect(clamped.translateX).toBe(1);
    expect(clamped.translateY).toBeCloseTo(1.8486, 3);
  });

  it("reports crop percentage and clamps unsafe transforms", () => {
    expect(calculateCropPercent(4000, 3000, 1179, 2556, DEFAULT_TRANSFORM)).toBeGreaterThan(60);
    expect(
      clampTransform({ ...DEFAULT_TRANSFORM, scale: 10, translateX: -3, rotationDeg: 300 }),
    ).toMatchObject({ scale: 4, translateX: -1, rotationDeg: 180 });
  });

  it("accounts for fit mode, zoom, translation, and rotation when reporting crop", () => {
    expect(
      calculateCropPercent(100, 50, 100, 100, {
        ...DEFAULT_TRANSFORM,
        fitMode: "contain",
      }),
    ).toBeCloseTo(0);
    expect(
      calculateCropPercent(100, 100, 100, 100, {
        ...DEFAULT_TRANSFORM,
        translateX: 0.5,
      }),
    ).toBeCloseTo(50);
    expect(
      calculateCropPercent(100, 100, 100, 100, {
        ...DEFAULT_TRANSFORM,
        scale: 2,
      }),
    ).toBeCloseTo(75);
    expect(
      calculateCropPercent(100, 100, 100, 100, {
        ...DEFAULT_TRANSFORM,
        rotationDeg: 45,
      }),
    ).toBeCloseTo(17.157, 2);
    expect(
      calculateCropPercent(100, 100, 100, 100, {
        ...DEFAULT_TRANSFORM,
        translateX: 1,
      }),
    ).toBeCloseTo(100);
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
