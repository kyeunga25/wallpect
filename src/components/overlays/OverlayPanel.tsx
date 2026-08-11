import {
  Aperture,
  Clock3,
  Grid3X3,
  Menu,
  ScanLine,
  Shield,
  Smartphone,
  SquareDashedBottom,
} from "lucide-react";
import { useI18n } from "../../i18n/i18n";
import { useEditor } from "../../state/editor-context";
import type { OverlaySettings } from "../../types/editor";
import { PanelSection, Toggle } from "../ui";

const items = [
  ["safeArea", "Safe area", "Recommended content boundary", Shield],
  ["cutout", "Cutout", "Notch or Dynamic Island", Aperture],
  ["statusBar", "Status bar", "Approximate system status region", ScanLine],
  ["clock", "Clock", "Approximate lock-screen clock", Clock3],
  ["bottomActions", "Bottom actions", "Lock-screen shortcuts", Smartphone],
  ["homeIndicator", "Home indicator", "Bottom gesture area", SquareDashedBottom],
  ["grid", "Composition grid", "Rule-of-thirds guide", Grid3X3],
] as const;

const LOCK_PREVIEW_OVERLAYS = new Set<keyof OverlaySettings>([
  "statusBar",
  "clock",
  "bottomActions",
  "homeIndicator",
  "menuBar",
  "dock",
]);

function matchingPreviewMode(key: keyof OverlaySettings): "lock" | "safe" | null {
  if (key === "safeArea") return "safe";
  return LOCK_PREVIEW_OVERLAYS.has(key) ? "lock" : null;
}

export function OverlayPanel() {
  const { t } = useI18n();
  const { profile, overlays, setOverlays, previewMode, setPreviewMode, setAnnouncement } =
    useEditor();
  const visibleItems =
    profile.platform === "macOS"
      ? ([
          ["safeArea", "Desktop safe area", "Clear of menu bar and Dock", Shield],
          ["cutout", "Display notch", "Built-in camera housing", Aperture],
          ["menuBar", "Menu bar", "Approximate macOS menu bar", Menu],
          ["dock", "Dock", "Approximate desktop Dock", SquareDashedBottom],
          ["grid", "Composition grid", "Rule-of-thirds guide", Grid3X3],
        ] as const)
      : items;
  const changeOverlay = (key: keyof OverlaySettings, checked: boolean) => {
    setOverlays((current) => ({ ...current, [key]: checked }));
    const nextPreviewMode = matchingPreviewMode(key);
    if (!nextPreviewMode || previewMode === nextPreviewMode) return;
    setPreviewMode(nextPreviewMode);
    const modeLabel = t(
      nextPreviewMode === "safe"
        ? "Safe area"
        : profile.platform === "macOS"
          ? "Desktop"
          : "Lock Screen",
    );
    setAnnouncement(
      t("Opened {mode} preview so this guide change is visible.", { mode: modeLabel }),
    );
  };
  return (
    <PanelSection
      title={t("Overlays")}
      action={
        <label className="master-toggle">
          <span className="visually-hidden">{t("Toggle all overlays")}</span>
          <input
            type="checkbox"
            checked={overlays.enabled}
            onChange={(event) =>
              setOverlays((current) => ({ ...current, enabled: event.target.checked }))
            }
          />
          <span className="switch" />
        </label>
      }
    >
      <div className={`overlay-list ${overlays.enabled ? "" : "is-disabled"}`}>
        {visibleItems.map(([key, label, description, Icon]) => (
          <div className="overlay-item" key={key}>
            <Icon />
            <Toggle
              checked={overlays[key]}
              onChange={(checked) => changeOverlay(key, checked)}
              label={t(label)}
              description={t(description)}
            />
          </div>
        ))}
      </div>
      <p className="control-help">
        {t(
          "Guide changes open the matching preview mode so the result is visible. They affect preview only unless “Export preview with guides” is enabled.",
        )}
      </p>
    </PanelSection>
  );
}
