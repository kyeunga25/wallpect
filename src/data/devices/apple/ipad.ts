import {
  REVIEWED_ON,
  compatibleModel,
  createProfileGroup,
  rect,
  type GroupIdentity,
  type ProfileGroup,
} from "./catalog";

const IPAD_SOURCE = "https://support.apple.com/108043";

type TabletGroupInput = Omit<GroupIdentity, "sourceUrls"> & {
  sourceUrls?: string[];
  width: number;
  height: number;
  logicalWidth: number;
  logicalHeight: number;
  dpr: number;
  bodyWidth: number;
  bodyHeight: number;
  corner?: number;
  classic?: boolean;
};

function tablet(input: TabletGroupInput): ProfileGroup {
  const representative = input.compatibleModels[0];
  const safeTop = input.classic ? Math.round(20 * input.dpr) : 72;
  const safeSide = input.classic ? 0 : 54;
  const safeBottom = input.classic ? 0 : 60;

  return createProfileGroup(
    {
      id: input.id,
      model: input.model,
      compatibleModels: input.compatibleModels,
      previousIds: input.previousIds,
      sourceUrls: [IPAD_SOURCE, ...(input.sourceUrls ?? [])],
    },
    {
      brand: "Apple",
      platform: "iPadOS",
      category: "ipad",
      family: "iPad",
      supportedOrientations: ["portrait", "landscape"],
      chassis: {
        physicalWidthMm: input.bodyWidth,
        physicalHeightMm: input.bodyHeight,
        screenDiagonalInches: representative.screenDiagonalInches,
        bezelStyle: input.classic ? "classic" : "edge-to-edge",
      },
      display: {
        physicalWidthPx: input.width,
        physicalHeightPx: input.height,
        logicalWidthPt: input.logicalWidth,
        logicalHeightPt: input.logicalHeight,
        devicePixelRatio: input.dpr,
        aspectRatio: input.width / input.height,
        orientation: "portrait",
        cornerRadiusPx: input.classic ? 0 : (input.corner ?? 52),
      },
      cutout: { type: "none" },
      safeArea: {
        insetsPx: { top: safeTop, right: safeSide, bottom: safeBottom, left: safeSide },
        source: "derived",
      },
      overlays: {
        statusBar: rect(0, 0, input.width, safeTop),
        homeIndicator: input.classic
          ? undefined
          : rect(input.width * 0.41, input.height - 34, input.width * 0.18, 12),
      },
      wallpaperBehavior: {
        systemMayZoom: true,
        systemMayExtend: true,
        notes: ["Portrait and landscape compositions are stored independently in this editor."],
      },
      metadata: {
        lastVerified: REVIEWED_ON,
        accuracy: "high",
        notes: [
          "Published resolution with derived safe-area geometry.",
          "Grouped options share the same wallpaper canvas and obstruction geometry.",
        ],
      },
    },
  );
}

export const IPAD_PROFILE_GROUPS: ProfileGroup[] = [
  tablet({
    id: "ipad-classic",
    model: "iPad (1st–2nd gen) / iPad mini (1st gen)",
    compatibleModels: [
      compatibleModel("iPad (1st gen)", 2010, 9.7),
      compatibleModel("iPad 2", 2011, 9.7),
      compatibleModel("iPad mini (1st gen)", 2012, 7.9),
    ],
    width: 768,
    height: 1024,
    logicalWidth: 768,
    logicalHeight: 1024,
    dpr: 1,
    bodyWidth: 189.7,
    bodyHeight: 242.8,
    classic: true,
  }),
  tablet({
    id: "ipad-retina-classic",
    model: "iPad 3–6 / Air 1–2 / mini 2–5 / Pro 9.7-inch",
    compatibleModels: [
      compatibleModel("iPad (3rd gen)", 2012, 9.7),
      compatibleModel("iPad (4th gen)", 2012, 9.7),
      compatibleModel("iPad Air (1st gen)", 2013, 9.7),
      compatibleModel("iPad Air 2", 2014, 9.7),
      compatibleModel("iPad (5th gen)", 2017, 9.7),
      compatibleModel("iPad (6th gen)", 2018, 9.7),
      compatibleModel("iPad mini 2", 2013, 7.9),
      compatibleModel("iPad mini 3", 2014, 7.9),
      compatibleModel("iPad mini 4", 2015, 7.9),
      compatibleModel("iPad mini (5th gen)", 2019, 7.9),
      compatibleModel("iPad Pro 9.7-inch", 2016, 9.7),
    ],
    width: 1536,
    height: 2048,
    logicalWidth: 768,
    logicalHeight: 1024,
    dpr: 2,
    bodyWidth: 169.5,
    bodyHeight: 240,
    classic: true,
  }),
  tablet({
    id: "ipad-9",
    model: "iPad (7th–9th gen)",
    compatibleModels: [
      compatibleModel("iPad (7th gen)", 2019, 10.2),
      compatibleModel("iPad (8th gen)", 2020, 10.2),
      compatibleModel("iPad (9th gen)", 2021, 10.2),
    ],
    width: 1620,
    height: 2160,
    logicalWidth: 810,
    logicalHeight: 1080,
    dpr: 2,
    bodyWidth: 174.1,
    bodyHeight: 250.6,
    classic: true,
  }),
  tablet({
    id: "ipad-10-5-classic",
    model: "iPad Pro 10.5-inch / iPad Air (3rd gen)",
    compatibleModels: [
      compatibleModel("iPad Pro 10.5-inch", 2017, 10.5),
      compatibleModel("iPad Air (3rd gen)", 2019, 10.5),
    ],
    sourceUrls: ["https://support.apple.com/111927"],
    width: 1668,
    height: 2224,
    logicalWidth: 834,
    logicalHeight: 1112,
    dpr: 2,
    bodyWidth: 174.1,
    bodyHeight: 250.6,
    classic: true,
  }),
  tablet({
    id: "ipad-mini-6",
    model: "iPad mini (6th gen / A17 Pro)",
    compatibleModels: [
      compatibleModel("iPad mini (6th gen)", 2021, 8.3),
      compatibleModel("iPad mini (A17 Pro)", 2024, 8.3),
    ],
    previousIds: ["ipad-mini-a17-pro"],
    width: 1488,
    height: 2266,
    logicalWidth: 744,
    logicalHeight: 1133,
    dpr: 2,
    bodyWidth: 134.8,
    bodyHeight: 195.4,
    corner: 54,
  }),
  tablet({
    id: "ipad-air-11-m2",
    model: "iPad 10 / A16 / Air 4–5 / Air 11-inch (M2–M4)",
    compatibleModels: [
      compatibleModel("iPad Air (4th gen)", 2020, 10.9),
      compatibleModel("iPad Air (5th gen)", 2022, 10.9),
      compatibleModel("iPad (10th gen)", 2022, 10.9),
      compatibleModel("iPad Air 11-inch (M2)", 2024, 11),
      compatibleModel("iPad (A16)", 2025, 11),
      compatibleModel("iPad Air 11-inch (M3)", 2025, 11),
      compatibleModel("iPad Air 11-inch (M4)", 2026, 11),
    ],
    previousIds: ["ipad-air-5", "ipad-10", "ipad-a16", "ipad-air-11-m3", "ipad-air-11-m4"],
    sourceUrls: ["https://support.apple.com/126471"],
    width: 1640,
    height: 2360,
    logicalWidth: 820,
    logicalHeight: 1180,
    dpr: 2,
    bodyWidth: 178.5,
    bodyHeight: 247.6,
  }),
  tablet({
    id: "ipad-pro-11-3",
    model: "iPad Pro 11-inch (1st–4th gen)",
    compatibleModels: [
      compatibleModel("iPad Pro 11-inch (1st gen)", 2018, 11),
      compatibleModel("iPad Pro 11-inch (2nd gen)", 2020, 11),
      compatibleModel("iPad Pro 11-inch (3rd gen)", 2021, 11),
      compatibleModel("iPad Pro 11-inch (4th gen)", 2022, 11),
    ],
    previousIds: ["ipad-pro-11-4"],
    width: 1668,
    height: 2388,
    logicalWidth: 834,
    logicalHeight: 1194,
    dpr: 2,
    bodyWidth: 178.5,
    bodyHeight: 247.6,
  }),
  tablet({
    id: "ipad-pro-12-9-classic",
    model: "iPad Pro 12.9-inch (1st–2nd gen)",
    compatibleModels: [
      compatibleModel("iPad Pro 12.9-inch (1st gen)", 2015, 12.9),
      compatibleModel("iPad Pro 12.9-inch (2nd gen)", 2017, 12.9),
    ],
    width: 2048,
    height: 2732,
    logicalWidth: 1024,
    logicalHeight: 1366,
    dpr: 2,
    bodyWidth: 220.6,
    bodyHeight: 305.7,
    classic: true,
  }),
  tablet({
    id: "ipad-pro-12-9-5",
    model: "iPad Pro 12.9-inch (3rd–6th gen) / Air 13-inch (M2–M4)",
    compatibleModels: [
      compatibleModel("iPad Pro 12.9-inch (3rd gen)", 2018, 12.9),
      compatibleModel("iPad Pro 12.9-inch (4th gen)", 2020, 12.9),
      compatibleModel("iPad Pro 12.9-inch (5th gen)", 2021, 12.9),
      compatibleModel("iPad Pro 12.9-inch (6th gen)", 2022, 12.9),
      compatibleModel("iPad Air 13-inch (M2)", 2024, 13),
      compatibleModel("iPad Air 13-inch (M3)", 2025, 13),
      compatibleModel("iPad Air 13-inch (M4)", 2026, 13),
    ],
    previousIds: ["ipad-pro-12-9-6", "ipad-air-13-m2", "ipad-air-13-m3", "ipad-air-13-m4"],
    width: 2048,
    height: 2732,
    logicalWidth: 1024,
    logicalHeight: 1366,
    dpr: 2,
    bodyWidth: 214.9,
    bodyHeight: 280.6,
  }),
  tablet({
    id: "ipad-pro-11-m4",
    model: "iPad Pro 11-inch (M4 / M5)",
    compatibleModels: [
      compatibleModel("iPad Pro 11-inch (M4)", 2024, 11),
      compatibleModel("iPad Pro 11-inch (M5)", 2025, 11),
    ],
    previousIds: ["ipad-pro-11-m5"],
    sourceUrls: ["https://support.apple.com/119892", "https://support.apple.com/125406"],
    width: 1668,
    height: 2420,
    logicalWidth: 834,
    logicalHeight: 1210,
    dpr: 2,
    bodyWidth: 177.5,
    bodyHeight: 249.7,
    corner: 48,
  }),
  tablet({
    id: "ipad-pro-13-m4",
    model: "iPad Pro 13-inch (M4 / M5)",
    compatibleModels: [
      compatibleModel("iPad Pro 13-inch (M4)", 2024, 13),
      compatibleModel("iPad Pro 13-inch (M5)", 2025, 13),
    ],
    previousIds: ["ipad-pro-13-m5"],
    sourceUrls: ["https://support.apple.com/119891", "https://support.apple.com/125407"],
    width: 2064,
    height: 2752,
    logicalWidth: 1032,
    logicalHeight: 1376,
    dpr: 2,
    bodyWidth: 215.5,
    bodyHeight: 281.6,
    corner: 48,
  }),
];
