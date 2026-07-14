import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { deviceProfiles, getDeviceProfile } from "../data/devices";
import { generateFilename } from "../core/export";
import { decodeBundledImage } from "../core/image-decoder";
import { orientDevice } from "../core/transforms";
import { useI18n } from "../i18n/i18n";
import type { DeviceProfile, Orientation, OrientedDevice } from "../types/device";
import {
  DEFAULT_OVERLAYS,
  DEFAULT_TRANSFORM,
  type BackgroundMode,
  type ExportSettings,
  type ImageAsset,
  type ImageTransform,
  type OverlaySettings,
  type PreviewMode,
} from "../types/editor";

export type MobileTab = "image" | "device" | "adjust" | "overlays" | "export";

type EditorContextValue = {
  profiles: DeviceProfile[];
  profile: DeviceProfile;
  orientedDevice: OrientedDevice;
  deviceId: string;
  setDeviceId: (id: string) => void;
  orientation: Orientation;
  setOrientation: (orientation: Orientation) => void;
  image: ImageAsset | null;
  setImage: Dispatch<SetStateAction<ImageAsset | null>>;
  transform: ImageTransform;
  setTransform: (update: SetStateAction<ImageTransform>) => void;
  resetTransform: () => void;
  centerTransform: () => void;
  previewMode: PreviewMode;
  setPreviewMode: Dispatch<SetStateAction<PreviewMode>>;
  frameVisible: boolean;
  setFrameVisible: Dispatch<SetStateAction<boolean>>;
  backgroundMode: BackgroundMode;
  setBackgroundMode: Dispatch<SetStateAction<BackgroundMode>>;
  backgroundColor: string;
  setBackgroundColor: Dispatch<SetStateAction<string>>;
  overlays: OverlaySettings;
  setOverlays: Dispatch<SetStateAction<OverlaySettings>>;
  exportSettings: ExportSettings;
  setExportSettings: Dispatch<SetStateAction<ExportSettings>>;
  mobileTab: MobileTab;
  setMobileTab: Dispatch<SetStateAction<MobileTab>>;
  announcement: string;
  setAnnouncement: Dispatch<SetStateAction<string>>;
  recentDeviceIds: string[];
};

const EditorContext = createContext<EditorContextValue | null>(null);

function transformKey(deviceId: string, orientation: Orientation) {
  return `${deviceId}:${orientation}`;
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [deviceId, setDeviceIdState] = useState("apple-iphone-15-pro");
  const profile = useMemo(() => getDeviceProfile(deviceId), [deviceId]);
  const [orientation, setOrientationState] = useState<Orientation>(profile.display.orientation);
  const [image, setImage] = useState<ImageAsset | null>(null);
  const [transforms, setTransforms] = useState<Record<string, ImageTransform>>({});
  const [previewMode, setPreviewMode] = useState<PreviewMode>("lock");
  const [frameVisible, setFrameVisible] = useState(true);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("solid");
  const [backgroundColor, setBackgroundColor] = useState("#0b0f14");
  const [overlays, setOverlays] = useState(DEFAULT_OVERLAYS);
  const [mobileTab, setMobileTab] = useState<MobileTab>("adjust");
  const [announcement, setAnnouncement] = useState("");
  const [recentDeviceIds, setRecentDeviceIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("wallpect:recent-devices") ?? "[]") as string[];
    } catch {
      return [];
    }
  });
  const orientedDevice = useMemo(() => orientDevice(profile, orientation), [orientation, profile]);
  const key = transformKey(deviceId, orientation);
  const transform = transforms[key] ?? DEFAULT_TRANSFORM;
  const [exportSettings, setExportSettings] = useState<ExportSettings>(() => ({
    format: "png",
    quality: 0.92,
    filename: generateFilename(
      profile.slug,
      orientation,
      orientedDevice.outputWidth,
      orientedDevice.outputHeight,
      "png",
    ),
    includeGuides: false,
  }));

  useEffect(() => {
    let active = true;
    decodeBundledImage("/assets/sample-aurora-wallpaper.png")
      .then((asset) => {
        if (active) setImage(asset);
      })
      .catch(() =>
        setAnnouncement(
          t("The sample image could not be loaded. Upload your own PNG, JPEG, or WebP image."),
        ),
      );
    return () => {
      active = false;
    };
  }, [t]);

  useEffect(() => {
    return () => {
      if (image?.objectUrl) URL.revokeObjectURL(image.objectUrl);
    };
  }, [image]);

  const setDeviceId = useCallback(
    (id: string) => {
      const next = getDeviceProfile(id);
      const nextDevice = orientDevice(next, next.display.orientation);
      setDeviceIdState(next.id);
      setOrientationState(next.display.orientation);
      setExportSettings((current) => ({
        ...current,
        filename: generateFilename(
          next.slug,
          next.display.orientation,
          nextDevice.outputWidth,
          nextDevice.outputHeight,
          current.format,
        ),
      }));
      setAnnouncement(t("{model} selected.", { model: next.model }));
      setRecentDeviceIds((current) => {
        const updated = [next.id, ...current.filter((item) => item !== next.id)].slice(0, 4);
        try {
          localStorage.setItem("wallpect:recent-devices", JSON.stringify(updated));
        } catch {
          // Local storage is optional; editor behavior does not depend on it.
        }
        return updated;
      });
    },
    [t],
  );

  const setOrientation = useCallback(
    (next: Orientation) => {
      if (profile.supportedOrientations.includes(next)) {
        const nextDevice = orientDevice(profile, next);
        setOrientationState(next);
        setExportSettings((current) => ({
          ...current,
          filename: generateFilename(
            profile.slug,
            next,
            nextDevice.outputWidth,
            nextDevice.outputHeight,
            current.format,
          ),
        }));
        setAnnouncement(
          t("{orientation} orientation selected.", {
            orientation: t(next === "portrait" ? "Portrait" : "Landscape"),
          }),
        );
      }
    },
    [profile, t],
  );

  const setTransform = useCallback(
    (update: SetStateAction<ImageTransform>) => {
      setTransforms((current) => {
        const previous = current[key] ?? DEFAULT_TRANSFORM;
        const next = typeof update === "function" ? update(previous) : update;
        return { ...current, [key]: next };
      });
    },
    [key],
  );

  const resetTransform = useCallback(() => {
    setTransform(DEFAULT_TRANSFORM);
    setAnnouncement(t("Image composition reset."));
  }, [setTransform, t]);

  const centerTransform = useCallback(() => {
    setTransform((current) => ({ ...current, translateX: 0, translateY: 0 }));
    setAnnouncement(t("Image centered."));
  }, [setTransform, t]);

  const value = useMemo<EditorContextValue>(
    () => ({
      profiles: deviceProfiles,
      profile,
      orientedDevice,
      deviceId,
      setDeviceId,
      orientation,
      setOrientation,
      image,
      setImage,
      transform,
      setTransform,
      resetTransform,
      centerTransform,
      previewMode,
      setPreviewMode,
      frameVisible,
      setFrameVisible,
      backgroundMode,
      setBackgroundMode,
      backgroundColor,
      setBackgroundColor,
      overlays,
      setOverlays,
      exportSettings,
      setExportSettings,
      mobileTab,
      setMobileTab,
      announcement,
      setAnnouncement,
      recentDeviceIds,
    }),
    [
      announcement,
      backgroundColor,
      backgroundMode,
      centerTransform,
      deviceId,
      exportSettings,
      frameVisible,
      image,
      mobileTab,
      orientation,
      orientedDevice,
      overlays,
      previewMode,
      profile,
      recentDeviceIds,
      resetTransform,
      setDeviceId,
      setOrientation,
      setTransform,
      transform,
    ],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor must be used within EditorProvider");
  return context;
}
