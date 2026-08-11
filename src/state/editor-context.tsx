import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  defaultDeviceProfileId,
  deviceProfiles,
  getDeviceProfile,
  getKnownDeviceProfileIds,
  normalizeDeviceProfileId,
} from "../data/devices";
import { generateFilename } from "../core/export";
import { decodeBundledImage } from "../core/image-decoder";
import { loadRecentDeviceIds, saveRecentDeviceIds } from "../core/preferences";
import { orientDevice } from "../core/transforms";
import { useI18n } from "../i18n/i18n";
import {
  getTransformTimeline,
  transformHistoryReducer,
  transformsAreEqual,
  type TransformHistoryState,
} from "./transform-history";
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
  setImage: (image: ImageAsset | null) => boolean;
  transform: ImageTransform;
  setTransform: (update: SetStateAction<ImageTransform>) => void;
  beginTransformEdit: () => void;
  commitTransformEdit: () => void;
  canUndoTransform: boolean;
  canRedoTransform: boolean;
  undoTransform: () => void;
  redoTransform: () => void;
  resetTransform: () => void;
  centerTransform: () => void;
  showOriginalComposition: boolean;
  setShowOriginalComposition: (show: boolean) => void;
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
const validDeviceIds = new Set(deviceProfiles.map((profile) => profile.id));
const knownDeviceIds = getKnownDeviceProfileIds();

function loadCanonicalRecentDeviceIds() {
  const loaded = loadRecentDeviceIds(localStorage, knownDeviceIds);
  const canonical = loaded
    .map(normalizeDeviceProfileId)
    .filter((id, index, values) => validDeviceIds.has(id) && values.indexOf(id) === index);
  return saveRecentDeviceIds(localStorage, canonical, validDeviceIds);
}

function transformKey(deviceId: string, orientation: Orientation) {
  return `${deviceId}:${orientation}`;
}

function isTextEditingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target.closest("textarea, select, [contenteditable='true']")) {
    return true;
  }
  if (!(target instanceof HTMLInputElement)) return false;
  return !["button", "checkbox", "color", "radio", "range"].includes(target.type);
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [deviceId, setDeviceIdState] = useState(defaultDeviceProfileId);
  const profile = useMemo(() => getDeviceProfile(deviceId), [deviceId]);
  const [orientation, setOrientationState] = useState<Orientation>(profile.display.orientation);
  const [image, setImageState] = useState<ImageAsset | null>(null);
  const imageRef = useRef<ImageAsset | null>(null);
  const [transformHistories, dispatchTransformHistory] = useReducer(
    transformHistoryReducer,
    {} as TransformHistoryState,
  );
  const transformHistoryRef = useRef(transformHistories);
  const activeTransformEditRef = useRef<{ key: string; before: ImageTransform } | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("lock");
  const [showOriginalComposition, setShowOriginalCompositionState] = useState(false);
  const [frameVisible, setFrameVisible] = useState(true);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("solid");
  const [backgroundColor, setBackgroundColor] = useState("#0b0f14");
  const [overlays, setOverlays] = useState(DEFAULT_OVERLAYS);
  const [mobileTab, setMobileTab] = useState<MobileTab>("adjust");
  const [announcement, setAnnouncement] = useState("");
  const [recentDeviceIds, setRecentDeviceIds] = useState<string[]>(loadCanonicalRecentDeviceIds);
  const setImage = useCallback((nextImage: ImageAsset | null) => {
    const replacing = imageRef.current !== null;
    setShowOriginalCompositionState(false);
    if (replacing) {
      activeTransformEditRef.current = null;
      transformHistoryRef.current = {};
      dispatchTransformHistory({ type: "reset" });
    }
    imageRef.current = nextImage;
    setImageState(nextImage);
    return replacing;
  }, []);
  const orientedDevice = useMemo(() => orientDevice(profile, orientation), [orientation, profile]);
  const key = transformKey(deviceId, orientation);
  const transformTimeline = getTransformTimeline(transformHistories, key);
  const transform = transformTimeline.present;
  const canUndoTransform = transformTimeline.past.length > 0;
  const canRedoTransform = transformTimeline.future.length > 0;
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
        if (active && !imageRef.current) setImage(asset);
      })
      .catch(() =>
        setAnnouncement(
          t("The sample image could not be loaded. Upload your own PNG, JPEG, or WebP image."),
        ),
      );
    return () => {
      active = false;
    };
  }, [setImage, t]);

  useEffect(() => {
    return () => {
      if (image?.objectUrl) URL.revokeObjectURL(image.objectUrl);
    };
  }, [image]);

  useEffect(() => {
    transformHistoryRef.current = transformHistories;
  }, [transformHistories]);

  const commitTransformEdit = useCallback(() => {
    const active = activeTransformEditRef.current;
    if (!active) return;
    activeTransformEditRef.current = null;
    dispatchTransformHistory({ type: "commit", key: active.key, before: active.before });
  }, []);

  const beginTransformEdit = useCallback(() => {
    const active = activeTransformEditRef.current;
    if (active?.key === key) return;
    if (active) {
      dispatchTransformHistory({ type: "commit", key: active.key, before: active.before });
    }
    activeTransformEditRef.current = {
      key,
      before: getTransformTimeline(transformHistoryRef.current, key).present,
    };
  }, [key]);

  const setTransform = useCallback(
    (update: SetStateAction<ImageTransform>) => {
      setShowOriginalCompositionState(false);
      dispatchTransformHistory({
        type: "set",
        key,
        update,
        record: activeTransformEditRef.current?.key !== key,
      });
    },
    [key],
  );

  const undoTransform = useCallback(() => {
    setShowOriginalCompositionState(false);
    const active = activeTransformEditRef.current;
    const timeline = getTransformTimeline(transformHistoryRef.current, key);
    const hasActiveChange = Boolean(
      active?.key === key &&
      !transformsAreEqual(
        active.before,
        getTransformTimeline(transformHistoryRef.current, active.key).present,
      ),
    );
    if (active) commitTransformEdit();
    if (!timeline.past.length && !hasActiveChange) return;
    dispatchTransformHistory({ type: "undo", key });
    setAnnouncement(t("Last composition change undone."));
  }, [commitTransformEdit, key, t]);

  const redoTransform = useCallback(() => {
    setShowOriginalCompositionState(false);
    const active = activeTransformEditRef.current;
    const activeChanged = Boolean(
      active?.key === key &&
      !transformsAreEqual(
        active.before,
        getTransformTimeline(transformHistoryRef.current, active.key).present,
      ),
    );
    if (active) commitTransformEdit();
    if (activeChanged) return;
    const timeline = getTransformTimeline(transformHistoryRef.current, key);
    if (!timeline.future.length) return;
    dispatchTransformHistory({ type: "redo", key });
    setAnnouncement(t("Composition change redone."));
  }, [commitTransformEdit, key, t]);

  useEffect(() => {
    const handleHistoryShortcut = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || !(event.metaKey || event.ctrlKey)) return;
      if (isTextEditingTarget(event.target)) return;
      const shortcut = event.key.toLowerCase();
      const undo = shortcut === "z" && !event.shiftKey;
      const redo = (shortcut === "z" && event.shiftKey) || shortcut === "y";
      if (!undo && !redo) return;
      event.preventDefault();
      if (undo) undoTransform();
      else redoTransform();
    };
    window.addEventListener("keydown", handleHistoryShortcut);
    return () => window.removeEventListener("keydown", handleHistoryShortcut);
  }, [redoTransform, undoTransform]);

  const setDeviceId = useCallback(
    (id: string) => {
      commitTransformEdit();
      setShowOriginalCompositionState(false);
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
        return saveRecentDeviceIds(localStorage, updated, validDeviceIds);
      });
    },
    [commitTransformEdit, t],
  );

  const setOrientation = useCallback(
    (next: Orientation) => {
      if (profile.supportedOrientations.includes(next)) {
        commitTransformEdit();
        setShowOriginalCompositionState(false);
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
    [commitTransformEdit, profile, t],
  );

  const resetTransform = useCallback(() => {
    setTransform(DEFAULT_TRANSFORM);
    setAnnouncement(t("Image composition reset."));
  }, [setTransform, t]);

  const centerTransform = useCallback(() => {
    setTransform((current) => ({ ...current, translateX: 0, translateY: 0 }));
    setAnnouncement(t("Image centered."));
  }, [setTransform, t]);

  const setShowOriginalComposition = useCallback(
    (show: boolean) => {
      setShowOriginalCompositionState(show);
      setAnnouncement(
        t(show ? "Original composition comparison shown." : "Edited composition restored."),
      );
    },
    [t],
  );

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
      beginTransformEdit,
      commitTransformEdit,
      canUndoTransform,
      canRedoTransform,
      undoTransform,
      redoTransform,
      resetTransform,
      centerTransform,
      showOriginalComposition,
      setShowOriginalComposition,
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
      beginTransformEdit,
      canRedoTransform,
      canUndoTransform,
      centerTransform,
      commitTransformEdit,
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
      redoTransform,
      resetTransform,
      setDeviceId,
      setImage,
      setOrientation,
      setShowOriginalComposition,
      setTransform,
      showOriginalComposition,
      transform,
      undoTransform,
    ],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor must be used within EditorProvider");
  return context;
}
