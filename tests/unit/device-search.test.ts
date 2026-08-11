import { describe, expect, it } from "vitest";
import {
  deviceProfiles,
  getDeviceSearchRank,
  matchesDeviceSearch,
  normalizeDeviceSearchQuery,
} from "../../src/data/devices";

function profileFor(modelName: string) {
  const profile = deviceProfiles.find((item) =>
    item.compatibleModels.some((model) => model.name === modelName),
  );
  if (!profile) throw new Error(`Missing test profile for ${modelName}`);
  return profile;
}

describe("device search", () => {
  it("normalizes pasted multiplication signs and punctuation", () => {
    expect(normalizeDeviceSearchQuery("  5120 × 2880  ")).toBe("5120 x 2880");
    expect(normalizeDeviceSearchQuery("MacBook-Pro (14-inch)")).toBe("macbook pro 14 inch");
  });

  it("matches models, categories, dimensions, and unordered terms", () => {
    const studioDisplay = profileFor("Studio Display XDR");
    const macBookNeo = profileFor("MacBook Neo");

    expect(matchesDeviceSearch(studioDisplay, "Studio Display")).toBe(true);
    expect(matchesDeviceSearch(studioDisplay, "5120x2880")).toBe(true);
    expect(matchesDeviceSearch(macBookNeo, "2026 neo mac")).toBe(true);
    expect(matchesDeviceSearch(macBookNeo, "iPad")).toBe(false);
  });

  it("ranks an exact compatible model ahead of a partial name match", () => {
    const exact = profileFor("iPhone 14 Pro");
    const partial = profileFor("iPhone 14 Pro Max");

    expect(getDeviceSearchRank(exact, "iPhone 14 Pro")).toBeLessThan(
      getDeviceSearchRank(partial, "iPhone 14 Pro"),
    );
  });
});
