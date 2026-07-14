import { APPLE_DEVICE_PROFILES } from "./apple/profiles";
import { validateDeviceProfiles } from "../../core/validation";

validateDeviceProfiles(APPLE_DEVICE_PROFILES);

export const deviceProfiles = APPLE_DEVICE_PROFILES;

export function getDeviceProfile(id: string) {
  return deviceProfiles.find((profile) => profile.id === id) ?? deviceProfiles[0];
}
