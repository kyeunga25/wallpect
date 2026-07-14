import type { FitMode, ImageTransform } from "../types/editor";

export interface RenderGeometry {
  baseScale: number;
  effectiveScale: number;
  renderedWidth: number;
  renderedHeight: number;
  centerX: number;
  centerY: number;
}

export function calculateFitScale(
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  fitMode: FitMode,
) {
  if ([imageWidth, imageHeight, canvasWidth, canvasHeight].some((value) => value <= 0)) {
    throw new Error("Image and canvas dimensions must be positive.");
  }
  const widthScale = canvasWidth / imageWidth;
  const heightScale = canvasHeight / imageHeight;
  return fitMode === "cover"
    ? Math.max(widthScale, heightScale)
    : Math.min(widthScale, heightScale);
}

export function calculateRenderGeometry(
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  transform: ImageTransform,
): RenderGeometry {
  const baseScale = calculateFitScale(
    imageWidth,
    imageHeight,
    canvasWidth,
    canvasHeight,
    transform.fitMode,
  );
  const effectiveScale = baseScale * transform.scale;
  return {
    baseScale,
    effectiveScale,
    renderedWidth: imageWidth * effectiveScale,
    renderedHeight: imageHeight * effectiveScale,
    centerX: canvasWidth * (0.5 + transform.translateX),
    centerY: canvasHeight * (0.5 + transform.translateY),
  };
}

export function calculateCropPercent(
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  transform: ImageTransform,
) {
  const geometry = calculateRenderGeometry(
    imageWidth,
    imageHeight,
    canvasWidth,
    canvasHeight,
    transform,
  );
  const renderedArea = geometry.renderedWidth * geometry.renderedHeight;
  const visibleArea = Math.min(renderedArea, canvasWidth * canvasHeight);
  return Math.max(0, Math.min(100, (1 - visibleArea / renderedArea) * 100));
}

export function clampTransform(transform: ImageTransform): ImageTransform {
  return {
    ...transform,
    scale: Math.min(4, Math.max(0.25, transform.scale)),
    translateX: Math.min(1, Math.max(-1, transform.translateX)),
    translateY: Math.min(1, Math.max(-1, transform.translateY)),
    rotationDeg: Math.min(180, Math.max(-180, transform.rotationDeg)),
  };
}

export function calculatePinchScale(
  startScale: number,
  startDistance: number,
  currentDistance: number,
) {
  if (startDistance <= 0 || currentDistance <= 0) return startScale;
  return Math.min(4, Math.max(0.25, startScale * (currentDistance / startDistance)));
}
