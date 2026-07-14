import type { DeviceProfile, Rect } from "../../../types/device";

const VERIFIED = "2026-07-13";
const PHONE_SOURCE = "https://support.apple.com/specs/iphone";
const IPAD_SOURCE = "https://support.apple.com/specs/ipad";
const MAC_SOURCE = "https://support.apple.com/specs/mac";
const DISPLAY_SOURCE = "https://support.apple.com/displays";

function rect(x: number, y: number, width: number, height: number): Rect {
  return { x, y, width, height };
}

type PhoneInput = {
  id: string;
  model: string;
  slug: string;
  year: number;
  width: number;
  height: number;
  logicalWidth: number;
  logicalHeight: number;
  diagonal: number;
  bodyWidth: number;
  bodyHeight: number;
  corner: number;
  cutout: DeviceProfile["cutout"]["type"];
  cutoutBounds?: Rect;
  safeTop: number;
  safeBottom: number;
};

function phone(input: PhoneInput): DeviceProfile {
  const isClassic = input.cutout === "none";
  return {
    id: `apple-${input.id}`,
    brand: "Apple",
    platform: "iOS",
    category: "iphone",
    family: "iPhone",
    model: input.model,
    slug: input.slug,
    releaseYear: input.year,
    supportedOrientations: ["portrait", "landscape"],
    chassis: {
      physicalWidthMm: input.bodyWidth,
      physicalHeightMm: input.bodyHeight,
      screenDiagonalInches: input.diagonal,
      bezelStyle: isClassic ? "classic" : "edge-to-edge",
    },
    display: {
      physicalWidthPx: input.width,
      physicalHeightPx: input.height,
      logicalWidthPt: input.logicalWidth,
      logicalHeightPt: input.logicalHeight,
      devicePixelRatio: input.width / input.logicalWidth,
      aspectRatio: input.width / input.height,
      orientation: "portrait",
      cornerRadiusPx: input.corner,
    },
    cutout: { type: input.cutout, boundsPx: input.cutoutBounds },
    safeArea: {
      insetsPx: { top: input.safeTop, right: 48, bottom: input.safeBottom, left: 48 },
      source: "derived",
    },
    overlays: {
      statusBar: rect(0, 0, input.width, input.safeTop),
      lockScreenClock: rect(
        input.width * 0.16,
        input.height * 0.11,
        input.width * 0.68,
        input.height * 0.16,
      ),
      homeIndicator: rect(
        input.width * 0.34,
        input.height - Math.max(42, input.safeBottom * 0.45),
        input.width * 0.32,
        15,
      ),
      bottomActions: [
        rect(input.width * 0.1, input.height * 0.87, input.width * 0.13, input.width * 0.13),
        rect(input.width * 0.77, input.height * 0.87, input.width * 0.13, input.width * 0.13),
      ],
    },
    wallpaperBehavior: {
      systemMayZoom: true,
      systemMayExtend: !isClassic,
      notes: ["System wallpaper placement can vary by iOS version and user settings."],
    },
    metadata: {
      sourceUrls: [PHONE_SOURCE],
      lastVerified: VERIFIED,
      accuracy: "high",
      notes: [
        "Display resolution is published; overlay and corner geometry are derived approximations.",
      ],
    },
  };
}

const iphones: DeviceProfile[] = [
  phone({
    id: "iphone-se-2",
    model: "iPhone SE (2nd gen)",
    slug: "iphone-se-2",
    year: 2020,
    width: 750,
    height: 1334,
    logicalWidth: 375,
    logicalHeight: 667,
    diagonal: 4.7,
    bodyWidth: 67.3,
    bodyHeight: 138.4,
    corner: 0,
    cutout: "none",
    safeTop: 40,
    safeBottom: 0,
  }),
  phone({
    id: "iphone-12-mini",
    model: "iPhone 12 mini",
    slug: "iphone-12-mini",
    year: 2020,
    width: 1080,
    height: 2340,
    logicalWidth: 360,
    logicalHeight: 780,
    diagonal: 5.4,
    bodyWidth: 64.2,
    bodyHeight: 131.5,
    corner: 118,
    cutout: "notch",
    cutoutBounds: rect(314, 0, 452, 102),
    safeTop: 150,
    safeBottom: 102,
  }),
  phone({
    id: "iphone-12",
    model: "iPhone 12",
    slug: "iphone-12",
    year: 2020,
    width: 1170,
    height: 2532,
    logicalWidth: 390,
    logicalHeight: 844,
    diagonal: 6.1,
    bodyWidth: 71.5,
    bodyHeight: 146.7,
    corner: 132,
    cutout: "notch",
    cutoutBounds: rect(340, 0, 490, 108),
    safeTop: 141,
    safeBottom: 102,
  }),
  phone({
    id: "iphone-12-pro-max",
    model: "iPhone 12 Pro Max",
    slug: "iphone-12-pro-max",
    year: 2020,
    width: 1284,
    height: 2778,
    logicalWidth: 428,
    logicalHeight: 926,
    diagonal: 6.7,
    bodyWidth: 78.1,
    bodyHeight: 160.8,
    corner: 144,
    cutout: "notch",
    cutoutBounds: rect(374, 0, 536, 118),
    safeTop: 141,
    safeBottom: 102,
  }),
  phone({
    id: "iphone-13-mini",
    model: "iPhone 13 mini",
    slug: "iphone-13-mini",
    year: 2021,
    width: 1080,
    height: 2340,
    logicalWidth: 375,
    logicalHeight: 812,
    diagonal: 5.4,
    bodyWidth: 64.2,
    bodyHeight: 131.5,
    corner: 118,
    cutout: "notch",
    cutoutBounds: rect(350, 0, 380, 102),
    safeTop: 150,
    safeBottom: 102,
  }),
  phone({
    id: "iphone-13",
    model: "iPhone 13",
    slug: "iphone-13",
    year: 2021,
    width: 1170,
    height: 2532,
    logicalWidth: 390,
    logicalHeight: 844,
    diagonal: 6.1,
    bodyWidth: 71.5,
    bodyHeight: 146.7,
    corner: 132,
    cutout: "notch",
    cutoutBounds: rect(380, 0, 410, 108),
    safeTop: 141,
    safeBottom: 102,
  }),
  phone({
    id: "iphone-14-pro",
    model: "iPhone 14 Pro",
    slug: "iphone-14-pro",
    year: 2022,
    width: 1179,
    height: 2556,
    logicalWidth: 393,
    logicalHeight: 852,
    diagonal: 6.1,
    bodyWidth: 71.5,
    bodyHeight: 147.5,
    corner: 138,
    cutout: "dynamic-island",
    cutoutBounds: rect(466, 33, 247, 90),
    safeTop: 177,
    safeBottom: 102,
  }),
  phone({
    id: "iphone-14-pro-max",
    model: "iPhone 14 Pro Max",
    slug: "iphone-14-pro-max",
    year: 2022,
    width: 1290,
    height: 2796,
    logicalWidth: 430,
    logicalHeight: 932,
    diagonal: 6.7,
    bodyWidth: 77.6,
    bodyHeight: 160.7,
    corner: 150,
    cutout: "dynamic-island",
    cutoutBounds: rect(521, 36, 248, 90),
    safeTop: 177,
    safeBottom: 102,
  }),
  phone({
    id: "iphone-15",
    model: "iPhone 15",
    slug: "iphone-15",
    year: 2023,
    width: 1179,
    height: 2556,
    logicalWidth: 393,
    logicalHeight: 852,
    diagonal: 6.1,
    bodyWidth: 71.6,
    bodyHeight: 147.6,
    corner: 138,
    cutout: "dynamic-island",
    cutoutBounds: rect(466, 33, 247, 90),
    safeTop: 177,
    safeBottom: 102,
  }),
  phone({
    id: "iphone-15-pro",
    model: "iPhone 15 Pro",
    slug: "iphone-15-pro",
    year: 2023,
    width: 1179,
    height: 2556,
    logicalWidth: 393,
    logicalHeight: 852,
    diagonal: 6.1,
    bodyWidth: 70.6,
    bodyHeight: 146.6,
    corner: 138,
    cutout: "dynamic-island",
    cutoutBounds: rect(466, 33, 247, 90),
    safeTop: 177,
    safeBottom: 102,
  }),
  phone({
    id: "iphone-15-plus",
    model: "iPhone 15 Plus",
    slug: "iphone-15-plus",
    year: 2023,
    width: 1290,
    height: 2796,
    logicalWidth: 430,
    logicalHeight: 932,
    diagonal: 6.7,
    bodyWidth: 77.8,
    bodyHeight: 160.9,
    corner: 150,
    cutout: "dynamic-island",
    cutoutBounds: rect(521, 36, 248, 90),
    safeTop: 177,
    safeBottom: 102,
  }),
  phone({
    id: "iphone-15-pro-max",
    model: "iPhone 15 Pro Max",
    slug: "iphone-15-pro-max",
    year: 2023,
    width: 1290,
    height: 2796,
    logicalWidth: 430,
    logicalHeight: 932,
    diagonal: 6.7,
    bodyWidth: 76.7,
    bodyHeight: 159.9,
    corner: 150,
    cutout: "dynamic-island",
    cutoutBounds: rect(521, 36, 248, 90),
    safeTop: 177,
    safeBottom: 102,
  }),
];

type TabletInput = {
  model: string;
  slug: string;
  year: number;
  width: number;
  height: number;
  logicalWidth: number;
  logicalHeight: number;
  dpr: number;
  diagonal: number;
  bodyWidth: number;
  bodyHeight: number;
};

function tablet(input: TabletInput): DeviceProfile {
  return {
    id: `apple-${input.slug}`,
    brand: "Apple",
    platform: "iPadOS",
    category: "ipad",
    family: "iPad",
    model: input.model,
    slug: input.slug,
    releaseYear: input.year,
    supportedOrientations: ["portrait", "landscape"],
    chassis: {
      physicalWidthMm: input.bodyWidth,
      physicalHeightMm: input.bodyHeight,
      screenDiagonalInches: input.diagonal,
      bezelStyle: "edge-to-edge",
    },
    display: {
      physicalWidthPx: input.width,
      physicalHeightPx: input.height,
      logicalWidthPt: input.logicalWidth,
      logicalHeightPt: input.logicalHeight,
      devicePixelRatio: input.dpr,
      aspectRatio: input.width / input.height,
      orientation: "portrait",
      cornerRadiusPx: 52,
    },
    cutout: { type: "none" },
    safeArea: { insetsPx: { top: 72, right: 54, bottom: 60, left: 54 }, source: "derived" },
    overlays: {
      statusBar: rect(0, 0, input.width, 72),
      homeIndicator: rect(input.width * 0.41, input.height - 34, input.width * 0.18, 12),
    },
    wallpaperBehavior: {
      systemMayZoom: true,
      systemMayExtend: true,
      notes: ["Portrait and landscape compositions are stored independently in this editor."],
    },
    metadata: {
      sourceUrls: [IPAD_SOURCE],
      lastVerified: VERIFIED,
      accuracy: "high",
      notes: ["Published resolution with derived safe-area geometry."],
    },
  };
}

const ipads: DeviceProfile[] = [
  tablet({
    model: "iPad mini (6th gen)",
    slug: "ipad-mini-6",
    year: 2021,
    width: 1488,
    height: 2266,
    logicalWidth: 744,
    logicalHeight: 1133,
    dpr: 2,
    diagonal: 8.3,
    bodyWidth: 134.8,
    bodyHeight: 195.4,
  }),
  tablet({
    model: "iPad (10th gen)",
    slug: "ipad-10",
    year: 2022,
    width: 1640,
    height: 2360,
    logicalWidth: 820,
    logicalHeight: 1180,
    dpr: 2,
    diagonal: 10.9,
    bodyWidth: 179.5,
    bodyHeight: 248.6,
  }),
  tablet({
    model: "iPad Air 11-inch (M2)",
    slug: "ipad-air-11-m2",
    year: 2024,
    width: 1640,
    height: 2360,
    logicalWidth: 820,
    logicalHeight: 1180,
    dpr: 2,
    diagonal: 11,
    bodyWidth: 178.5,
    bodyHeight: 247.6,
  }),
  tablet({
    model: "iPad Pro 11-inch (M4)",
    slug: "ipad-pro-11-m4",
    year: 2024,
    width: 1668,
    height: 2420,
    logicalWidth: 834,
    logicalHeight: 1210,
    dpr: 2,
    diagonal: 11,
    bodyWidth: 177.5,
    bodyHeight: 249.7,
  }),
  tablet({
    model: "iPad Pro 13-inch (M4)",
    slug: "ipad-pro-13-m4",
    year: 2024,
    width: 2064,
    height: 2752,
    logicalWidth: 1032,
    logicalHeight: 1376,
    dpr: 2,
    diagonal: 13,
    bodyWidth: 215.5,
    bodyHeight: 281.6,
  }),
];

type MacInput = {
  model: string;
  slug: string;
  year: number;
  category: "macbook" | "imac" | "display";
  width: number;
  height: number;
  diagonal: number;
  bodyWidth: number;
  bodyHeight: number;
  notch: boolean;
};

function mac(input: MacInput): DeviceProfile {
  const source = input.category === "display" ? DISPLAY_SOURCE : MAC_SOURCE;
  const menuHeight = Math.round(input.height * 0.035);
  const dockHeight = Math.round(input.height * 0.09);
  const notchWidth = Math.round(input.width * 0.085);
  return {
    id: `apple-${input.slug}`,
    brand: "Apple",
    platform: "macOS",
    category: input.category,
    family:
      input.category === "display" ? "Display" : input.category === "imac" ? "iMac" : "MacBook",
    model: input.model,
    slug: input.slug,
    releaseYear: input.year,
    supportedOrientations: ["landscape"],
    chassis: {
      physicalWidthMm: input.bodyWidth,
      physicalHeightMm: input.bodyHeight,
      screenDiagonalInches: input.diagonal,
      bezelStyle: input.category === "macbook" ? "laptop" : "desktop-display",
    },
    display: {
      physicalWidthPx: input.width,
      physicalHeightPx: input.height,
      logicalWidthPt: Math.round(input.width / 2),
      logicalHeightPt: Math.round(input.height / 2),
      devicePixelRatio: 2,
      aspectRatio: input.width / input.height,
      orientation: "landscape",
      cornerRadiusPx: input.notch ? 38 : 12,
    },
    cutout: {
      type: input.notch ? "notch" : "none",
      boundsPx: input.notch
        ? rect((input.width - notchWidth) / 2, 0, notchWidth, menuHeight)
        : undefined,
    },
    safeArea: {
      insetsPx: { top: menuHeight, right: 24, bottom: dockHeight, left: 24 },
      source: "derived",
    },
    overlays: {
      menuBar: rect(0, 0, input.width, menuHeight),
      dock: rect(
        input.width * 0.28,
        input.height - dockHeight,
        input.width * 0.44,
        dockHeight * 0.78,
      ),
    },
    wallpaperBehavior: {
      systemMayZoom: false,
      systemMayExtend: false,
      notes: [
        "macOS Fill, Fit, Stretch, and Center behavior is approximated by the editor fit modes.",
      ],
    },
    metadata: {
      sourceUrls: [source],
      lastVerified: VERIFIED,
      accuracy: "high",
      notes: [
        "Published native display resolution with approximate menu bar, Dock, and notch regions.",
      ],
    },
  };
}

const macs: DeviceProfile[] = [
  mac({
    model: "MacBook Air 13-inch (M3)",
    slug: "macbook-air-13-m3",
    year: 2024,
    category: "macbook",
    width: 2560,
    height: 1664,
    diagonal: 13.6,
    bodyWidth: 304.1,
    bodyHeight: 215,
    notch: true,
  }),
  mac({
    model: "MacBook Air 15-inch (M3)",
    slug: "macbook-air-15-m3",
    year: 2024,
    category: "macbook",
    width: 2880,
    height: 1864,
    diagonal: 15.3,
    bodyWidth: 340.4,
    bodyHeight: 237.6,
    notch: true,
  }),
  mac({
    model: "MacBook Pro 14-inch",
    slug: "macbook-pro-14",
    year: 2023,
    category: "macbook",
    width: 3024,
    height: 1964,
    diagonal: 14.2,
    bodyWidth: 312.6,
    bodyHeight: 221.2,
    notch: true,
  }),
  mac({
    model: "MacBook Pro 16-inch",
    slug: "macbook-pro-16",
    year: 2023,
    category: "macbook",
    width: 3456,
    height: 2234,
    diagonal: 16.2,
    bodyWidth: 355.7,
    bodyHeight: 248.1,
    notch: true,
  }),
  mac({
    model: "iMac 24-inch",
    slug: "imac-24",
    year: 2023,
    category: "imac",
    width: 4480,
    height: 2520,
    diagonal: 23.5,
    bodyWidth: 547,
    bodyHeight: 461,
    notch: false,
  }),
  mac({
    model: "Studio Display",
    slug: "studio-display",
    year: 2022,
    category: "display",
    width: 5120,
    height: 2880,
    diagonal: 27,
    bodyWidth: 623,
    bodyHeight: 478,
    notch: false,
  }),
];

export const APPLE_DEVICE_PROFILES: DeviceProfile[] = [...iphones, ...ipads, ...macs];
