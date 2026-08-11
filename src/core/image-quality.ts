import { calculateRenderGeometry } from "./fit";
import type { ImageTransform } from "../types/editor";

export type ImageResolutionTone = "good" | "caution" | "warning";

export interface ImageResolutionSummary {
  label: string;
  message: string;
  tone: ImageResolutionTone;
}

export function calculateImageEnlargement(
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  transform: ImageTransform,
) {
  return calculateRenderGeometry(imageWidth, imageHeight, canvasWidth, canvasHeight, transform)
    .effectiveScale;
}

export function getImageResolutionSummary(enlargement: number): ImageResolutionSummary {
  if (!Number.isFinite(enlargement) || enlargement <= 0) {
    throw new Error("Image enlargement must be positive.");
  }
  if (enlargement <= 1.05) {
    return {
      label: "Source pixels sufficient",
      message: "The source has enough pixels for this composition.",
      tone: "good",
    };
  }
  if (enlargement <= 1.25) {
    return {
      label: "Small enlargement",
      message: "Only a small enlargement is needed for this output.",
      tone: "good",
    };
  }
  if (enlargement <= 2) {
    return {
      label: "Enlarged",
      message: "The source is enlarged for this output and may look softer.",
      tone: "caution",
    };
  }
  return {
    label: "Strong enlargement",
    message: "The source is enlarged substantially; a higher-resolution image may look sharper.",
    tone: "warning",
  };
}

export function formatImageEnlargement(enlargement: number) {
  return enlargement <= 1.05
    ? null
    : `${enlargement < 10 ? enlargement.toFixed(1) : Math.round(enlargement)}×`;
}
