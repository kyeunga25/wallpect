export const RECENT_DEVICES_STORAGE_KEY = "wallpect:recent-devices:v1";
export const LEGACY_RECENT_DEVICES_STORAGE_KEY = "wallpect:recent-devices";
export const MAX_RECENT_DEVICES = 4;

type PreferenceStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function sanitizeRecentDeviceIds(
  value: unknown,
  validDeviceIds: ReadonlySet<string>,
): string[] {
  if (!Array.isArray(value)) return [];

  const result: string[] = [];
  for (const item of value) {
    if (typeof item === "string" && validDeviceIds.has(item) && !result.includes(item)) {
      result.push(item);
    }
    if (result.length === MAX_RECENT_DEVICES) break;
  }
  return result;
}

function parseRecentDeviceIds(raw: string | null, validDeviceIds: ReadonlySet<string>) {
  if (raw === null) return [];
  try {
    return sanitizeRecentDeviceIds(JSON.parse(raw) as unknown, validDeviceIds);
  } catch {
    return [];
  }
}

export function loadRecentDeviceIds(
  storage: PreferenceStorage,
  validDeviceIds: ReadonlySet<string>,
): string[] {
  let currentRaw: string | null;
  try {
    currentRaw = storage.getItem(RECENT_DEVICES_STORAGE_KEY);
  } catch {
    return [];
  }

  if (currentRaw !== null) {
    const current = parseRecentDeviceIds(currentRaw, validDeviceIds);
    try {
      storage.setItem(RECENT_DEVICES_STORAGE_KEY, JSON.stringify(current));
      storage.removeItem(LEGACY_RECENT_DEVICES_STORAGE_KEY);
    } catch {
      // Preferences are optional and must not block the editor.
    }
    return current;
  }

  let legacyRaw: string | null;
  try {
    legacyRaw = storage.getItem(LEGACY_RECENT_DEVICES_STORAGE_KEY);
  } catch {
    return [];
  }
  if (legacyRaw === null) return [];

  const migrated = parseRecentDeviceIds(legacyRaw, validDeviceIds);
  try {
    storage.setItem(RECENT_DEVICES_STORAGE_KEY, JSON.stringify(migrated));
    storage.removeItem(LEGACY_RECENT_DEVICES_STORAGE_KEY);
  } catch {
    // Keep the legacy value if migration cannot be completed safely.
  }
  return migrated;
}

export function saveRecentDeviceIds(
  storage: PreferenceStorage,
  value: unknown,
  validDeviceIds: ReadonlySet<string>,
): string[] {
  const sanitized = sanitizeRecentDeviceIds(value, validDeviceIds);
  try {
    storage.setItem(RECENT_DEVICES_STORAGE_KEY, JSON.stringify(sanitized));
  } catch {
    // Preferences are optional and must not block the editor.
  }
  return sanitized;
}
