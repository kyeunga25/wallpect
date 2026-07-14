export type FitMode = "cover" | "contain";
export type BackgroundMode = "solid" | "transparent" | "blur";
export type PreviewMode = "clean" | "lock" | "safe";
export type ExportFormat = "png" | "jpeg" | "webp";

export interface ImageTransform {
  scale: number;
  translateX: number;
  translateY: number;
  rotationDeg: number;
  fitMode: FitMode;
}

export interface ImageAsset {
  source: CanvasImageSource;
  width: number;
  height: number;
  name: string;
  size: number;
  objectUrl?: string;
  isDemo?: boolean;
}

export interface OverlaySettings {
  enabled: boolean;
  safeArea: boolean;
  cutout: boolean;
  statusBar: boolean;
  clock: boolean;
  bottomActions: boolean;
  homeIndicator: boolean;
  grid: boolean;
  centerGuides: boolean;
  menuBar: boolean;
  dock: boolean;
}

export interface ExportSettings {
  format: ExportFormat;
  quality: number;
  filename: string;
  includeGuides: boolean;
}

export const DEFAULT_TRANSFORM: ImageTransform = {
  scale: 1,
  translateX: 0,
  translateY: 0,
  rotationDeg: 0,
  fitMode: "cover",
};

export const DEFAULT_OVERLAYS: OverlaySettings = {
  enabled: true,
  safeArea: true,
  cutout: true,
  statusBar: true,
  clock: true,
  bottomActions: true,
  homeIndicator: true,
  grid: false,
  centerGuides: false,
  menuBar: true,
  dock: true,
};
