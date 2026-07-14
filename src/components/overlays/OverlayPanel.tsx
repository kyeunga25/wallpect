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

export function OverlayPanel() {
  const { t } = useI18n();
  const { profile, overlays, setOverlays } = useEditor();
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
              onChange={(checked) => setOverlays((current) => ({ ...current, [key]: checked }))}
              label={t(label)}
              description={t(description)}
            />
          </div>
        ))}
      </div>
      <p className="control-help">
        {t("Guides affect preview only unless “Export preview with guides” is enabled.")}
      </p>
    </PanelSection>
  );
}
