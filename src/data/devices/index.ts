import { APPLE_DEVICE_PROFILES, APPLE_DEVICE_PROFILE_ID_ALIASES } from "./apple/profiles";
import { validateDeviceProfiles } from "../../core/validation";
import type { DeviceProfile } from "../../types/device";

validateDeviceProfiles(APPLE_DEVICE_PROFILES);

export const deviceProfiles = APPLE_DEVICE_PROFILES;
export const defaultDeviceProfileId = "apple-iphone-15-pro";

export function normalizeDeviceProfileId(id: string) {
  return APPLE_DEVICE_PROFILE_ID_ALIASES[id] ?? id;
}

export function getDeviceProfile(id: string) {
  const normalizedId = normalizeDeviceProfileId(id);
  return (
    deviceProfiles.find((profile) => profile.id === normalizedId) ??
    deviceProfiles.find((profile) => profile.id === defaultDeviceProfileId) ??
    deviceProfiles[0]
  );
}

export function getKnownDeviceProfileIds() {
  return new Set([
    ...deviceProfiles.map((profile) => profile.id),
    ...Object.keys(APPLE_DEVICE_PROFILE_ID_ALIASES),
  ]);
}

export function getDeviceReleaseYearLabel(profile: DeviceProfile) {
  const years = profile.compatibleModels.map((item) => item.releaseYear);
  const earliest = Math.min(...years);
  const latest = Math.max(...years);
  return earliest === latest ? String(latest) : `${earliest}–${latest}`;
}

export function getDeviceDiagonalLabel(profile: DeviceProfile) {
  const diagonals = [
    ...new Set(profile.compatibleModels.map((item) => item.screenDiagonalInches)),
  ].sort((a, b) => a - b);
  return diagonals.map((value) => `${value}″`).join(" / ");
}

export function normalizeDeviceSearchQuery(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[×✕＊*]/g, "x")
    .toLocaleLowerCase("en")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function getDeviceSearchText(profile: DeviceProfile) {
  const { display } = profile;
  const group = ["macbook", "imac", "display"].includes(profile.category)
    ? "mac"
    : profile.category;
  return normalizeDeviceSearchQuery(
    [
      profile.model,
      profile.category,
      group,
      ...profile.compatibleModels.flatMap((item) => [
        item.name,
        item.releaseYear,
        item.screenDiagonalInches,
      ]),
      display.physicalWidthPx,
      display.physicalHeightPx,
      `${display.physicalWidthPx}x${display.physicalHeightPx}`,
      `${display.physicalHeightPx}x${display.physicalWidthPx}`,
      display.logicalWidthPt,
      display.logicalHeightPt,
      `${display.logicalWidthPt}x${display.logicalHeightPt}`,
      `${display.logicalHeightPt}x${display.logicalWidthPt}`,
    ].join(" "),
  );
}

export function matchesDeviceSearch(profile: DeviceProfile, query: string) {
  const normalizedQuery = normalizeDeviceSearchQuery(query);
  if (!normalizedQuery) return true;
  const searchText = getDeviceSearchText(profile);
  return normalizedQuery.split(" ").every((token) => searchText.includes(token));
}

export function getDeviceSearchRank(profile: DeviceProfile, query: string) {
  const normalizedQuery = normalizeDeviceSearchQuery(query);
  if (!normalizedQuery) return 0;
  const names = [profile.model, ...profile.compatibleModels.map((item) => item.name)].map(
    normalizeDeviceSearchQuery,
  );
  if (names.includes(normalizedQuery)) return 0;
  if (names.some((name) => name.startsWith(normalizedQuery))) return 1;
  return 2;
}
