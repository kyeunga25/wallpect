import type { DeviceProfile, Insets, Orientation, OrientedDevice, Rect } from "../types/device";

function rotateInsets(insets: Insets): Insets {
  return { top: insets.left, right: insets.top, bottom: insets.right, left: insets.bottom };
}

export function orientRect(
  rect: Rect | undefined,
  width: number,
  height: number,
  orientation: Orientation,
  nativeOrientation: Orientation = "portrait",
): Rect | undefined {
  if (!rect || orientation === nativeOrientation) return rect;
  return { x: height - rect.y - rect.height, y: rect.x, width: rect.height, height: rect.width };
}

export function orientDevice(profile: DeviceProfile, orientation: Orientation): OrientedDevice {
  const nativePortrait = profile.display.orientation === "portrait";
  const shouldSwap = (orientation === "landscape") === nativePortrait;
  const outputWidth = shouldSwap
    ? profile.display.physicalHeightPx
    : profile.display.physicalWidthPx;
  const outputHeight = shouldSwap
    ? profile.display.physicalWidthPx
    : profile.display.physicalHeightPx;
  const logicalWidth = shouldSwap
    ? profile.display.logicalHeightPt
    : profile.display.logicalWidthPt;
  const logicalHeight = shouldSwap
    ? profile.display.logicalWidthPt
    : profile.display.logicalHeightPt;
  return {
    ...profile,
    activeOrientation: orientation,
    outputWidth,
    outputHeight,
    logicalWidth,
    logicalHeight,
    safeInsets: shouldSwap ? rotateInsets(profile.safeArea.insetsPx) : profile.safeArea.insetsPx,
  };
}

export function normalizedToPixels(value: number, dimension: number) {
  return Math.round(value * dimension);
}

export function pixelsToNormalized(value: number, dimension: number) {
  return dimension ? value / dimension : 0;
}
