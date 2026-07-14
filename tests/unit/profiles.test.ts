import { describe, expect, it } from "vitest";
import { deviceProfiles } from "../../src/data/devices";
import { validateDeviceProfile, validateDeviceProfiles } from "../../src/core/validation";

describe("Apple device profiles", () => {
  it("meets MVP representative profile counts", () => {
    expect(deviceProfiles.filter((profile) => profile.category === "iphone")).toHaveLength(12);
    expect(deviceProfiles.filter((profile) => profile.category === "ipad")).toHaveLength(5);
    expect(
      deviceProfiles.filter((profile) => ["macbook", "imac", "display"].includes(profile.category)),
    ).toHaveLength(6);
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
