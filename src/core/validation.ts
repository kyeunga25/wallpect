import type { DeviceProfile } from "../types/device";

const PROFILE_ID = /^apple-[a-z0-9-]+$/;
const PROFILE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REVIEW_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isPositiveFinite(value: number) {
  return Number.isFinite(value) && value > 0;
}

function isNonNegativeFinite(value: number) {
  return Number.isFinite(value) && value >= 0;
}

function isValidReviewDate(value: string) {
  if (!REVIEW_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function isAllowedSourceUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "support.apple.com" &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function validateRect(
  label: string,
  rect: { x: number; y: number; width: number; height: number },
  canvasWidth: number,
  canvasHeight: number,
) {
  const values = [rect.x, rect.y, rect.width, rect.height];
  if (!values.every(isNonNegativeFinite) || rect.width === 0 || rect.height === 0)
    return `${label} must contain finite positive dimensions and non-negative coordinates`;
  if (rect.x + rect.width > canvasWidth || rect.y + rect.height > canvasHeight)
    return `${label} must fit inside the physical display`;
  return null;
}

export function validateDeviceProfile(profile: DeviceProfile): string[] {
  const errors: string[] = [];
  if (!PROFILE_ID.test(profile.id)) errors.push("id must be a stable Apple profile id");
  if (!PROFILE_SLUG.test(profile.slug)) errors.push("slug must use lowercase URL-safe segments");
  if (!profile.model.trim()) errors.push("model is required");
  if (profile.brand !== "Apple") errors.push("brand must be Apple for this data set");
  if (
    !Number.isInteger(profile.releaseYear) ||
    profile.releaseYear < 2007 ||
    profile.releaseYear > 2100
  )
    errors.push("releaseYear must be a plausible four-digit year");
  if (!profile.supportedOrientations.length)
    errors.push("at least one supported orientation is required");
  if (new Set(profile.supportedOrientations).size !== profile.supportedOrientations.length)
    errors.push("supported orientations must be unique");
  if (
    !isPositiveFinite(profile.chassis.physicalWidthMm) ||
    !isPositiveFinite(profile.chassis.physicalHeightMm) ||
    !isPositiveFinite(profile.chassis.screenDiagonalInches)
  )
    errors.push("physical chassis measurements must be finite and positive");
  if (
    !isPositiveFinite(profile.display.physicalWidthPx) ||
    !isPositiveFinite(profile.display.physicalHeightPx)
  )
    errors.push("physical resolution must be finite and positive");
  if (
    !isPositiveFinite(profile.display.logicalWidthPt) ||
    !isPositiveFinite(profile.display.logicalHeightPt)
  )
    errors.push("logical viewport must be finite and positive");
  if (!isPositiveFinite(profile.display.devicePixelRatio))
    errors.push("devicePixelRatio must be finite and positive");
  if (!isNonNegativeFinite(profile.display.cornerRadiusPx))
    errors.push("corner radius must be finite and non-negative");
  if (
    !isPositiveFinite(profile.display.aspectRatio) ||
    Math.abs(
      profile.display.aspectRatio -
        profile.display.physicalWidthPx / profile.display.physicalHeightPx,
    ) > 0.0001
  )
    errors.push("aspect ratio does not match physical resolution");
  if (!profile.metadata.sourceUrls.length) errors.push("at least one source URL is required");
  for (const sourceUrl of profile.metadata.sourceUrls)
    if (!isAllowedSourceUrl(sourceUrl))
      errors.push("source URL must use HTTPS on support.apple.com without credentials");
  if (!isValidReviewDate(profile.metadata.lastVerified))
    errors.push("lastVerified must be a real YYYY-MM-DD date");
  const insets = profile.safeArea.insetsPx;
  for (const value of Object.values(insets))
    if (!isNonNegativeFinite(value))
      errors.push("safe-area insets must be finite and non-negative");
  if (
    isPositiveFinite(profile.display.physicalWidthPx) &&
    isPositiveFinite(profile.display.physicalHeightPx) &&
    (insets.left + insets.right >= profile.display.physicalWidthPx ||
      insets.top + insets.bottom >= profile.display.physicalHeightPx)
  )
    errors.push("safe-area insets must leave a positive display area");

  const rects = [
    ...(profile.cutout.boundsPx ? [["cutout", profile.cutout.boundsPx] as const] : []),
    ...Object.entries(profile.overlays).flatMap(([name, value]) => {
      if (!value) return [];
      return Array.isArray(value)
        ? value.map((rect, index) => [`${name}[${index}]`, rect] as const)
        : [[name, value] as const];
    }),
  ];
  for (const [label, rect] of rects) {
    const error = validateRect(
      label,
      rect,
      profile.display.physicalWidthPx,
      profile.display.physicalHeightPx,
    );
    if (error) errors.push(error);
  }
  return errors;
}

export function validateDeviceProfiles(profiles: DeviceProfile[]): true {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const failures: string[] = [];
  for (const profile of profiles) {
    if (ids.has(profile.id)) failures.push(`${profile.id}: duplicate id`);
    ids.add(profile.id);
    if (slugs.has(profile.slug)) failures.push(`${profile.id}: duplicate slug`);
    slugs.add(profile.slug);
    const errors = validateDeviceProfile(profile);
    if (errors.length) failures.push(`${profile.id}: ${errors.join(", ")}`);
  }
  if (failures.length) throw new Error(`Invalid device profiles:\n${failures.join("\n")}`);
  return true;
}
