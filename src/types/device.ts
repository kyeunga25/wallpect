export type DeviceAccuracy = "verified" | "high" | "estimated" | "legacy";
export type DeviceCategory = "iphone" | "ipad" | "macbook" | "imac" | "display";
export type Orientation = "portrait" | "landscape";

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DeviceProfile {
  id: string;
  brand: "Apple";
  platform: "iOS" | "iPadOS" | "macOS";
  category: DeviceCategory;
  family: string;
  model: string;
  slug: string;
  releaseYear: number;
  supportedOrientations: Orientation[];
  chassis: {
    physicalWidthMm: number;
    physicalHeightMm: number;
    screenDiagonalInches: number;
    bezelStyle: "edge-to-edge" | "classic" | "laptop" | "desktop-display";
  };
  display: {
    physicalWidthPx: number;
    physicalHeightPx: number;
    logicalWidthPt: number;
    logicalHeightPt: number;
    devicePixelRatio: number;
    aspectRatio: number;
    orientation: Orientation;
    cornerRadiusPx: number;
  };
  cutout: {
    type: "none" | "notch" | "dynamic-island" | "camera-hole" | "custom";
    boundsPx?: Rect;
  };
  safeArea: {
    insetsPx: Insets;
    source: "official" | "measured" | "derived" | "estimated";
  };
  overlays: {
    statusBar?: Rect;
    lockScreenClock?: Rect;
    homeIndicator?: Rect;
    bottomActions?: Rect[];
    menuBar?: Rect;
    dock?: Rect;
  };
  wallpaperBehavior: {
    systemMayZoom: boolean;
    systemMayExtend: boolean;
    notes: string[];
  };
  metadata: {
    sourceUrls: string[];
    lastVerified: string;
    accuracy: DeviceAccuracy;
    notes: string[];
  };
}

export interface OrientedDevice extends DeviceProfile {
  activeOrientation: Orientation;
  outputWidth: number;
  outputHeight: number;
  logicalWidth: number;
  logicalHeight: number;
  safeInsets: Insets;
}
