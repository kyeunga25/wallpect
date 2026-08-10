import type { DeviceProfile, Rect } from "../../../types/device";

export const REVIEWED_ON = "2026-08-10";

export type ProfileGroup = {
  profile: DeviceProfile;
  previousIds: string[];
};

export type GroupIdentity = {
  id: string;
  model: string;
  compatibleModels: DeviceProfile["compatibleModels"];
  previousIds?: string[];
  sourceUrls: string[];
};

type ProfileDetails = Omit<
  DeviceProfile,
  "id" | "model" | "slug" | "releaseYear" | "compatibleModels" | "metadata"
> & {
  metadata: Omit<DeviceProfile["metadata"], "sourceUrls">;
};

export function rect(x: number, y: number, width: number, height: number): Rect {
  return { x, y, width, height };
}

export function compatibleModel(
  name: string,
  releaseYear: number,
  screenDiagonalInches: number,
): DeviceProfile["compatibleModels"][number] {
  return { name, releaseYear, screenDiagonalInches };
}

export function createProfileGroup(identity: GroupIdentity, details: ProfileDetails): ProfileGroup {
  const canonicalId = `apple-${identity.id}`;
  const releaseYear = Math.max(...identity.compatibleModels.map((item) => item.releaseYear));
  const sourceUrls = [...new Set(identity.sourceUrls)];
  const previousIds = [...new Set(identity.previousIds ?? [])]
    .map((id) => (id.startsWith("apple-") ? id : `apple-${id}`))
    .filter((id) => id !== canonicalId);

  return {
    profile: {
      id: canonicalId,
      model: identity.model,
      slug: identity.id,
      releaseYear,
      compatibleModels: identity.compatibleModels,
      ...details,
      metadata: {
        ...details.metadata,
        sourceUrls,
      },
    },
    previousIds,
  };
}
