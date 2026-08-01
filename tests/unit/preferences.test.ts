import { beforeEach, describe, expect, it } from "vitest";
import {
  LEGACY_RECENT_DEVICES_STORAGE_KEY,
  RECENT_DEVICES_STORAGE_KEY,
  loadRecentDeviceIds,
  saveRecentDeviceIds,
} from "../../src/core/preferences";

const validIds = new Set(["one", "two", "three", "four", "five"]);

describe("recent device preferences", () => {
  beforeEach(() => localStorage.clear());

  it("sanitizes the current version to valid, unique IDs with a four-item limit", () => {
    localStorage.setItem(
      RECENT_DEVICES_STORAGE_KEY,
      JSON.stringify(["one", "missing", "one", "two", 3, "three", "four", "five"]),
    );

    expect(loadRecentDeviceIds(localStorage, validIds)).toEqual(["one", "two", "three", "four"]);
    expect(JSON.parse(localStorage.getItem(RECENT_DEVICES_STORAGE_KEY) ?? "null")).toEqual([
      "one",
      "two",
      "three",
      "four",
    ]);
  });

  it("migrates the legacy key without retaining duplicate preference data", () => {
    localStorage.setItem(LEGACY_RECENT_DEVICES_STORAGE_KEY, JSON.stringify(["two", "one"]));

    expect(loadRecentDeviceIds(localStorage, validIds)).toEqual(["two", "one"]);
    expect(localStorage.getItem(LEGACY_RECENT_DEVICES_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(RECENT_DEVICES_STORAGE_KEY)).toBe('["two","one"]');
  });

  it("recovers from malformed or unavailable storage without blocking the editor", () => {
    localStorage.setItem(RECENT_DEVICES_STORAGE_KEY, "not-json");
    expect(loadRecentDeviceIds(localStorage, validIds)).toEqual([]);

    const unavailableStorage = {
      getItem: () => {
        throw new Error("disabled");
      },
      setItem: () => {
        throw new Error("disabled");
      },
      removeItem: () => {
        throw new Error("disabled");
      },
    };
    expect(loadRecentDeviceIds(unavailableStorage, validIds)).toEqual([]);
    expect(saveRecentDeviceIds(unavailableStorage, ["one"], validIds)).toEqual(["one"]);
  });
});
