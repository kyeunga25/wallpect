import type { FitMode, ImageTransform } from "../types/editor";

export interface RenderGeometry {
  baseScale: number;
  effectiveScale: number;
  renderedWidth: number;
  renderedHeight: number;
  centerX: number;
  centerY: number;
}

export type ImageAlignment = "start" | "center" | "end";
export type ImageAlignmentAxis = "horizontal" | "vertical";

export interface ImageAlignmentOffsets {
  start: number;
  center: number;
  end: number;
}

export interface ImageAlignmentMap {
  horizontal: ImageAlignmentOffsets;
  vertical: ImageAlignmentOffsets;
}

interface Point {
  x: number;
  y: number;
}

function clipPolygon(
  polygon: Point[],
  isInside: (point: Point) => boolean,
  intersection: (start: Point, end: Point) => Point,
) {
  if (!polygon.length) return [];
  const clipped: Point[] = [];
  let start = polygon.at(-1)!;
  let startInside = isInside(start);

  for (const end of polygon) {
    const endInside = isInside(end);
    if (endInside !== startInside) clipped.push(intersection(start, end));
    if (endInside) clipped.push(end);
    start = end;
    startInside = endInside;
  }

  return clipped;
}

function polygonArea(polygon: Point[]) {
  if (polygon.length < 3) return 0;
  return (
    Math.abs(
      polygon.reduce((sum, point, index) => {
        const next = polygon[(index + 1) % polygon.length];
        return sum + point.x * next.y - next.x * point.y;
      }, 0),
    ) / 2
  );
}

function imageCorners(geometry: RenderGeometry, rotationDeg: number) {
  const halfWidth = geometry.renderedWidth / 2;
  const halfHeight = geometry.renderedHeight / 2;
  const radians = (rotationDeg * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);

  return [
    { x: -halfWidth, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: halfHeight },
    { x: -halfWidth, y: halfHeight },
  ].map(({ x, y }) => ({
    x: geometry.centerX + x * cosine - y * sine,
    y: geometry.centerY + x * sine + y * cosine,
  }));
}

function visibleImageArea(
  geometry: RenderGeometry,
  canvasWidth: number,
  canvasHeight: number,
  rotationDeg: number,
) {
  let polygon = imageCorners(geometry, rotationDeg);
  polygon = clipPolygon(
    polygon,
    ({ x }) => x >= 0,
    (start, end) => {
      const amount = (0 - start.x) / (end.x - start.x);
      return { x: 0, y: start.y + amount * (end.y - start.y) };
    },
  );
  polygon = clipPolygon(
    polygon,
    ({ x }) => x <= canvasWidth,
    (start, end) => {
      const amount = (canvasWidth - start.x) / (end.x - start.x);
      return { x: canvasWidth, y: start.y + amount * (end.y - start.y) };
    },
  );
  polygon = clipPolygon(
    polygon,
    ({ y }) => y >= 0,
    (start, end) => {
      const amount = (0 - start.y) / (end.y - start.y);
      return { x: start.x + amount * (end.x - start.x), y: 0 };
    },
  );
  polygon = clipPolygon(
    polygon,
    ({ y }) => y <= canvasHeight,
    (start, end) => {
      const amount = (canvasHeight - start.y) / (end.y - start.y);
      return { x: start.x + amount * (end.x - start.x), y: canvasHeight };
    },
  );
  return polygonArea(polygon);
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

function rotatedBounds(geometry: RenderGeometry, rotationDeg: number) {
  const radians = (rotationDeg * Math.PI) / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  return {
    width: geometry.renderedWidth * cosine + geometry.renderedHeight * sine,
    height: geometry.renderedWidth * sine + geometry.renderedHeight * cosine,
  };
}

function alignmentOffsets(renderedSize: number, canvasSize: number): ImageAlignmentOffsets {
  const start = renderedSize / (2 * canvasSize) - 0.5;
  return { start, center: 0, end: -start };
}

export function calculateImageAlignmentOffsets(
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  transform: ImageTransform,
): ImageAlignmentMap {
  const geometry = calculateRenderGeometry(
    imageWidth,
    imageHeight,
    canvasWidth,
    canvasHeight,
    transform,
  );
  const bounds = rotatedBounds(geometry, transform.rotationDeg);
  return {
    horizontal: alignmentOffsets(bounds.width, canvasWidth),
    vertical: alignmentOffsets(bounds.height, canvasHeight),
  };
}

export function alignImageToCanvas(
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  transform: ImageTransform,
  axis: ImageAlignmentAxis,
  alignment: ImageAlignment,
): ImageTransform {
  const offsets = calculateImageAlignmentOffsets(
    imageWidth,
    imageHeight,
    canvasWidth,
    canvasHeight,
    transform,
  );
  return axis === "horizontal"
    ? { ...transform, translateX: offsets.horizontal[alignment] }
    : { ...transform, translateY: offsets.vertical[alignment] };
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
  if (!Number.isFinite(renderedArea) || renderedArea <= 0) return 100;
  const visibleArea = visibleImageArea(geometry, canvasWidth, canvasHeight, transform.rotationDeg);
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

export function clampTransformForImage(
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  transform: ImageTransform,
): ImageTransform {
  const clamped = clampTransform({ ...transform, translateX: 0, translateY: 0 });
  const offsets = calculateImageAlignmentOffsets(
    imageWidth,
    imageHeight,
    canvasWidth,
    canvasHeight,
    clamped,
  );
  const horizontalLimit = Math.max(
    1,
    Math.abs(offsets.horizontal.start),
    Math.abs(offsets.horizontal.end),
  );
  const verticalLimit = Math.max(
    1,
    Math.abs(offsets.vertical.start),
    Math.abs(offsets.vertical.end),
  );
  return {
    ...clamped,
    translateX: Math.min(horizontalLimit, Math.max(-horizontalLimit, transform.translateX)),
    translateY: Math.min(verticalLimit, Math.max(-verticalLimit, transform.translateY)),
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
