import { describe, expect, it } from "vitest";
import { deviceProfiles } from "../../src/data/devices";
import { validateDeviceProfile, validateDeviceProfiles } from "../../src/core/validation";

describe("Apple device profiles", () => {
  it("covers every requested Apple display model from the target years", () => {
    expect(deviceProfiles.filter((profile) => profile.category === "iphone")).toHaveLength(27);
    expect(deviceProfiles.filter((profile) => profile.category === "ipad")).toHaveLength(20);
    expect(
      deviceProfiles.filter((profile) => ["macbook", "imac", "display"].includes(profile.category)),
    ).toHaveLength(27);

    for (const id of [
      "apple-iphone-13-pro-max",
      "apple-iphone-se-3",
      "apple-iphone-16-pro-max",
      "apple-iphone-air",
      "apple-iphone-17e",
      "apple-ipad-9",
      "apple-ipad-pro-12-9-6",
      "apple-ipad-mini-a17-pro",
      "apple-ipad-pro-13-m5",
      "apple-ipad-air-13-m4",
      "apple-macbook-pro-16-m1-pro-max",
      "apple-macbook-pro-13-m2",
      "apple-macbook-neo",
      "apple-macbook-air-15-m5",
      "apple-macbook-pro-16-m5-pro-max",
    ]) {
      expect(
        deviceProfiles.some((profile) => profile.id === id),
        id,
      ).toBe(true);
    }
  });

  it("keeps same-size models distinct when their display configuration differs", () => {
    const iphone14 = deviceProfiles.find((profile) => profile.id === "apple-iphone-14");
    const iphone14Pro = deviceProfiles.find((profile) => profile.id === "apple-iphone-14-pro");
    const iphone15 = deviceProfiles.find((profile) => profile.id === "apple-iphone-15");
    const iphone15Pro = deviceProfiles.find((profile) => profile.id === "apple-iphone-15-pro");

    expect(iphone14?.chassis.screenDiagonalInches).toBe(iphone14Pro?.chassis.screenDiagonalInches);
    expect(iphone14?.display.physicalHeightPx).not.toBe(iphone14Pro?.display.physicalHeightPx);
    expect(iphone14?.cutout.type).toBe("notch");
    expect(iphone14Pro?.cutout.type).toBe("dynamic-island");
    expect(iphone15?.chassis.physicalWidthMm).not.toBe(iphone15Pro?.chassis.physicalWidthMm);
  });

  it("validates the complete data set", () => {
    expect(validateDeviceProfiles(deviceProfiles)).toBe(true);
    expect(deviceProfiles.every((profile) => validateDeviceProfile(profile).length === 0)).toBe(
      true,
    );
  });

  it("keeps all device ids and slugs unique", () => {
    expect(new Set(deviceProfiles.map((profile) => profile.id)).size).toBe(deviceProfiles.length);
    expect(new Set(deviceProfiles.map((profile) => profile.slug)).size).toBe(deviceProfiles.length);
  });
});
