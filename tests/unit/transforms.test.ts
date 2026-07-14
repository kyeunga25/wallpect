import { describe, expect, it } from "vitest";
import { getDeviceProfile } from "../../src/data/devices";
import { orientDevice, orientRect, pixelsToNormalized } from "../../src/core/transforms";

describe("device orientation transforms", () => {
  it("swaps iPad output, logical viewport, and safe-area edges", () => {
    const profile = getDeviceProfile("apple-ipad-mini-6");
    const landscape = orientDevice(profile, "landscape");
    expect([landscape.outputWidth, landscape.outputHeight]).toEqual([2266, 1488]);
    expect([landscape.logicalWidth, landscape.logicalHeight]).toEqual([1133, 744]);
    expect(landscape.safeInsets).toEqual({ top: 54, right: 72, bottom: 54, left: 60 });
  });

  it("does not swap native landscape Macs", () => {
    const profile = getDeviceProfile("apple-macbook-pro-14");
    expect(orientDevice(profile, "landscape").outputWidth).toBe(3024);
  });

  it("rotates cutout rectangles", () => {
    expect(orientRect({ x: 10, y: 20, width: 30, height: 40 }, 100, 200, "landscape")).toEqual({
      x: 140,
      y: 10,
      width: 40,
      height: 30,
    });
  });

  it("converts pixels into stable normalized transforms", () => {
    expect(pixelsToNormalized(117.9, 1179)).toBeCloseTo(0.1);
  });
});
