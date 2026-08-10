import { IPAD_PROFILE_GROUPS } from "./ipad";
import { IPHONE_PROFILE_GROUPS } from "./iphone";
import { MAC_PROFILE_GROUPS } from "./mac";

const profileGroups = [...IPHONE_PROFILE_GROUPS, ...IPAD_PROFILE_GROUPS, ...MAC_PROFILE_GROUPS];

export const APPLE_DEVICE_PROFILES = profileGroups.map((group) => group.profile);

export const APPLE_DEVICE_PROFILE_ID_ALIASES: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(
    profileGroups.flatMap((group) =>
      group.previousIds.map((previousId) => [previousId, group.profile.id] as const),
    ),
  ),
);
