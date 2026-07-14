import { Camera, Flashlight, Frame, Hand, Maximize, Monitor, Move, ZoomIn } from "lucide-react";
import type { CSSProperties } from "react";
import { orientRect } from "../../core/transforms";
import { useI18n } from "../../i18n/i18n";
import { useEditor } from "../../state/editor-context";
import { Segmented } from "../ui";
import { WallpaperCanvas } from "./WallpaperCanvas";

function pct(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

function Cutout() {
  const { t } = useI18n();
  const { profile, orientedDevice, orientation, overlays } = useEditor();
  if (!overlays.enabled || !overlays.cutout || profile.cutout.type === "none") return null;
  const bounds = orientRect(
    profile.cutout.boundsPx,
    profile.display.physicalWidthPx,
    profile.display.physicalHeightPx,
    orientation,
  );
  if (!bounds) return null;
  const style = {
    left: pct(bounds.x, orientedDevice.outputWidth),
    top: pct(bounds.y, orientedDevice.outputHeight),
    width: pct(bounds.width, orientedDevice.outputWidth),
    height: pct(bounds.height, orientedDevice.outputHeight),
  };
  const label = t(
    profile.cutout.type === "dynamic-island"
      ? "Dynamic Island area"
      : profile.cutout.type === "notch"
        ? "Notch area"
        : "Cutout area",
  );
  return (
    <div
      className={`device-cutout ${profile.cutout.type}`}
      style={style}
      aria-label={label}
      title={label}
    />
  );
}

function SafeAreaOverlay() {
  const { t } = useI18n();
  const { orientedDevice, overlays, previewMode } = useEditor();
  if (!overlays.enabled || previewMode !== "safe" || !overlays.safeArea) return null;
  const { safeInsets, outputWidth, outputHeight } = orientedDevice;
  return (
    <div
      className="safe-area-overlay"
      style={{
        top: pct(safeInsets.top, outputHeight),
        right: pct(safeInsets.right, outputWidth),
        bottom: pct(safeInsets.bottom, outputHeight),
        left: pct(safeInsets.left, outputWidth),
      }}
    >
      {previewMode === "safe" ? <span>{t("SAFE AREA")}</span> : null}
    </div>
  );
}

function GridOverlay() {
  const { t } = useI18n();
  const { overlays, previewMode } = useEditor();
  if (!overlays.enabled || (!overlays.grid && previewMode !== "safe")) return null;
  return (
    <div className="grid-overlay" aria-label={t("Composition grid")}>
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

function PhoneLockOverlay() {
  const { t } = useI18n();
  const { previewMode, overlays, orientedDevice } = useEditor();
  if (!overlays.enabled || previewMode !== "lock") return null;
  return (
    <div className="lock-overlay" aria-label={t("Approximate lock screen overlay")}>
      {overlays.statusBar ? (
        <div className="status-bar">
          <span>9:41</span>
          <span>● ◒ ▰</span>
        </div>
      ) : null}
      {overlays.clock ? (
        <div className="lock-clock">
          <span>{t("Monday, July 13")}</span>
          <strong>{orientedDevice.activeOrientation === "portrait" ? "9:41" : "09:41"}</strong>
        </div>
      ) : null}
      {overlays.bottomActions ? (
        <div className="bottom-actions">
          <span>
            <Flashlight />
          </span>
          <span>
            <Camera />
          </span>
        </div>
      ) : null}
      {overlays.homeIndicator ? <div className="home-indicator" /> : null}
    </div>
  );
}

function MacOverlay() {
  const { t } = useI18n();
  const { profile, previewMode, overlays } = useEditor();
  if (profile.platform !== "macOS" || !overlays.enabled || previewMode === "clean") return null;
  return (
    <div className="mac-overlay">
      {overlays.menuBar ? (
        <div className="menu-bar">
          <strong>Wallpect</strong>
          <span>
            {t("File")}&nbsp;&nbsp; {t("Edit")}&nbsp;&nbsp; {t("View")}
          </span>
          <i>● ◒ ▰&nbsp;&nbsp;9:41</i>
        </div>
      ) : null}
      {overlays.dock ? (
        <div className="dock">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      ) : null}
    </div>
  );
}

export function DevicePreview() {
  const { t } = useI18n();
  const { profile, orientedDevice, previewMode, setPreviewMode, frameVisible, setFrameVisible } =
    useEditor();
  const isMac = profile.platform === "macOS";
  const ratio = orientedDevice.outputWidth / orientedDevice.outputHeight;
  return (
    <main className="preview-stage">
      <div className="stage-toolbar">
        <Segmented
          value={previewMode}
          onChange={setPreviewMode}
          label={t("Preview mode")}
          options={[
            { value: "clean", label: t("Clean") },
            { value: "lock", label: t(isMac ? "Desktop" : "Lock Screen") },
            { value: "safe", label: t("Safe area") },
          ]}
        />
        <Segmented
          value={frameVisible ? "frame" : "screen"}
          onChange={(value) => setFrameVisible(value === "frame")}
          label={t("Device frame visibility")}
          options={[
            { value: "frame", label: t("Frame") },
            { value: "screen", label: t("Screen only") },
          ]}
        />
      </div>
      <div
        className={`device-scaler ${isMac ? "is-mac" : profile.category === "ipad" ? "is-ipad" : "is-phone"} is-${orientedDevice.activeOrientation} ${frameVisible ? "has-frame" : "screen-only"}`}
        style={{ "--screen-ratio": ratio } as CSSProperties}
      >
        <div className="device-shell">
          <div className="screen-bezel">
            <div className="device-screen">
              <WallpaperCanvas />
              <GridOverlay />
              <SafeAreaOverlay />
              {isMac ? <MacOverlay /> : <PhoneLockOverlay />}
              <Cutout />
            </div>
          </div>
          {isMac && frameVisible ? (
            <div className="computer-chin">
              <span>
                <Monitor size={14} />
              </span>
            </div>
          ) : null}
          {isMac && frameVisible ? (
            <div className="computer-stand">
              <i />
            </div>
          ) : null}
          {!isMac && frameVisible ? (
            <>
              <i className="side-button left" />
              <i className="side-button right" />
            </>
          ) : null}
        </div>
      </div>
      <div className="stage-hint">
        <Hand size={17} />
        <span>{t("Drag to reposition")}</span>
        <ZoomIn size={17} />
        <span>{t("Scroll or pinch to zoom")}</span>
        <Move size={17} />
        <span>{t("Arrow keys to nudge")}</span>
      </div>
      <div className="mobile-stage-tools" aria-hidden="true">
        <button>
          <Move />
        </button>
        <button>
          <ZoomIn />
        </button>
        <button>
          <Maximize />
        </button>
        <button>
          <Frame />
        </button>
      </div>
    </main>
  );
}
