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

export function getDeviceSearchText(profile: DeviceProfile) {
  const { display } = profile;
  return [
    profile.model,
    ...profile.compatibleModels.flatMap((item) => [
      item.name,
      item.releaseYear,
      item.screenDiagonalInches,
    ]),
    display.physicalWidthPx,
    display.physicalHeightPx,
    display.logicalWidthPt,
    display.logicalHeightPt,
  ]
    .join(" ")
    .toLocaleLowerCase("en");
}
