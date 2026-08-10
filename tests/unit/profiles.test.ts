import { describe, expect, it } from "vitest";
import { deviceProfiles, getDeviceProfile, normalizeDeviceProfileId } from "../../src/data/devices";
import { validateDeviceProfile, validateDeviceProfiles } from "../../src/core/validation";

function profileForModel(name: string) {
  return deviceProfiles.find((profile) =>
    profile.compatibleModels.some((item) => item.name === name),
  );
}

describe("Apple device profiles", () => {
  it("covers common Apple display families through consolidated wallpaper configurations", () => {
    expect(deviceProfiles.filter((profile) => profile.category === "iphone")).toHaveLength(19);
    expect(deviceProfiles.filter((profile) => profile.category === "ipad")).toHaveLength(11);
    expect(
      deviceProfiles.filter((profile) => ["macbook", "imac", "display"].includes(profile.category)),
    ).toHaveLength(17);
    expect(
      deviceProfiles.reduce((count, profile) => count + profile.compatibleModels.length, 0),
    ).toBe(191);

    for (const model of [
      "iPhone (1st gen)",
      "iPhone 8",
      "iPhone 17e",
      "iPad mini (5th gen)",
      "iPad Pro 13-inch (M5)",
      "MacBook Air 13-inch (M1)",
      "MacBook Neo",
      "iMac Retina 5K 27-inch (2020)",
      "Studio Display",
      "Studio Display XDR",
      "Pro Display XDR",
    ]) {
      expect(profileForModel(model), model).toBeDefined();
    }
  });

  it("combines identical wallpaper canvases but keeps obstruction geometry distinct", () => {
    const iphone14Pro = profileForModel("iPhone 14 Pro");
    const iphone15Pro = profileForModel("iPhone 15 Pro");
    const iphone12 = profileForModel("iPhone 12");
    const iphone13 = profileForModel("iPhone 13");

    expect(iphone14Pro?.id).toBe(iphone15Pro?.id);
    expect(iphone12?.display.physicalWidthPx).toBe(iphone13?.display.physicalWidthPx);
    expect(iphone12?.display.physicalHeightPx).toBe(iphone13?.display.physicalHeightPx);
    expect(iphone12?.id).not.toBe(iphone13?.id);
    expect(iphone12?.cutout.boundsPx?.width).not.toBe(iphone13?.cutout.boundsPx?.width);
  });

  it("maps previously stored profile IDs to their consolidated configuration", () => {
    expect(normalizeDeviceProfileId("apple-iphone-14-pro")).toBe("apple-iphone-15-pro");
    expect(getDeviceProfile("apple-iphone-14-pro").id).toBe("apple-iphone-15-pro");
    expect(getDeviceProfile("apple-ipad-air-13-m4").id).toBe("apple-ipad-pro-12-9-5");
    expect(getDeviceProfile("apple-macbook-pro-16-m5-pro-max").id).toBe(
      "apple-macbook-pro-16-m1-pro-max",
    );
  });

  it("validates the complete data set", () => {
    expect(validateDeviceProfiles(deviceProfiles)).toBe(true);
    expect(deviceProfiles.every((profile) => validateDeviceProfile(profile).length === 0)).toBe(
      true,
    );
  });

  it("keeps all profile and compatible-model identifiers unique", () => {
    expect(new Set(deviceProfiles.map((profile) => profile.id)).size).toBe(deviceProfiles.length);
    expect(new Set(deviceProfiles.map((profile) => profile.slug)).size).toBe(deviceProfiles.length);
    const modelNames = deviceProfiles.flatMap((profile) =>
      profile.compatibleModels.map((item) => item.name.toLocaleLowerCase("en")),
    );
    expect(new Set(modelNames).size).toBe(modelNames.length);
  });

  it("rejects unsafe or malformed source, model, and geometry data", () => {
    const unsafeSource = structuredClone(deviceProfiles[0]);
    unsafeSource.metadata.sourceUrls = ["javascript:alert(1)"];
    expect(validateDeviceProfile(unsafeSource)).toContain(
      "source URL must use HTTPS on support.apple.com without credentials",
    );

    const invalidNumber = structuredClone(deviceProfiles[0]);
    invalidNumber.display.physicalWidthPx = Number.NaN;
    expect(validateDeviceProfile(invalidNumber)).toContain(
      "physical resolution must be finite and positive",
    );

    const invalidDate = structuredClone(deviceProfiles[0]);
    invalidDate.metadata.lastVerified = "2026-02-30";
    expect(validateDeviceProfile(invalidDate)).toContain(
      "lastVerified must be a real YYYY-MM-DD date",
    );

    const missingModels = structuredClone(deviceProfiles[0]);
    missingModels.compatibleModels = [];
    expect(validateDeviceProfile(missingModels)).toContain(
      "at least one compatible model is required",
    );

    const outOfBoundsOverlay = structuredClone(deviceProfiles[0]);
    outOfBoundsOverlay.overlays.statusBar = {
      x: 0,
      y: 0,
      width: outOfBoundsOverlay.display.physicalWidthPx + 1,
      height: 10,
    };
    expect(validateDeviceProfile(outOfBoundsOverlay)).toContain(
      "statusBar must fit inside the physical display",
    );
  });

  it("rejects duplicate slugs and unconsolidated wallpaper configurations", () => {
    const first = structuredClone(deviceProfiles[0]);
    const duplicateSlug = structuredClone(deviceProfiles[1]);
    duplicateSlug.slug = first.slug;
    expect(() => validateDeviceProfiles([first, duplicateSlug])).toThrow("duplicate slug");

    const duplicateConfiguration = structuredClone(first);
    duplicateConfiguration.id = "apple-duplicate-configuration";
    duplicateConfiguration.slug = "duplicate-configuration";
    duplicateConfiguration.model = "Duplicate configuration";
    duplicateConfiguration.compatibleModels = [
      {
        name: "Duplicate configuration model",
        releaseYear: duplicateConfiguration.releaseYear,
        screenDiagonalInches: duplicateConfiguration.chassis.screenDiagonalInches,
      },
    ];
    expect(() => validateDeviceProfiles([first, duplicateConfiguration])).toThrow(
      "duplicates wallpaper configuration",
    );
  });
});
