import type { DeviceProfile } from "../types/device";

const PROFILE_ID = /^apple-[a-z0-9-]+$/;

export function validateDeviceProfile(profile: DeviceProfile): string[] {
  const errors: string[] = [];
  if (!PROFILE_ID.test(profile.id)) errors.push("id must be a stable Apple profile id");
  if (!profile.model.trim()) errors.push("model is required");
  if (profile.brand !== "Apple") errors.push("brand must be Apple for this data set");
  if (profile.display.physicalWidthPx <= 0 || profile.display.physicalHeightPx <= 0)
    errors.push("physical resolution must be positive");
  if (profile.display.logicalWidthPt <= 0 || profile.display.logicalHeightPt <= 0)
    errors.push("logical viewport must be positive");
  if (profile.display.devicePixelRatio <= 0) errors.push("devicePixelRatio must be positive");
  if (
    Math.abs(
      profile.display.aspectRatio -
        profile.display.physicalWidthPx / profile.display.physicalHeightPx,
    ) > 0.0001
  )
    errors.push("aspect ratio does not match physical resolution");
  if (!profile.metadata.sourceUrls.length) errors.push("at least one source URL is required");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.metadata.lastVerified))
    errors.push("lastVerified must use YYYY-MM-DD");
  for (const value of Object.values(profile.safeArea.insetsPx))
    if (value < 0) errors.push("safe-area insets cannot be negative");
  return errors;
}

export function validateDeviceProfiles(profiles: DeviceProfile[]): true {
  const ids = new Set<string>();
  const failures: string[] = [];
  for (const profile of profiles) {
    if (ids.has(profile.id)) failures.push(`${profile.id}: duplicate id`);
    ids.add(profile.id);
    const errors = validateDeviceProfile(profile);
    if (errors.length) failures.push(`${profile.id}: ${errors.join(", ")}`);
  }
  if (failures.length) throw new Error(`Invalid device profiles:\n${failures.join("\n")}`);
  return true;
}
