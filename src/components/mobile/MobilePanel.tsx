import { ChevronsDown, ChevronsUp, Download } from "lucide-react";
import { useId } from "react";
import { useEditor } from "../../state/editor-context";
import { useI18n } from "../../i18n/i18n";
import { AdjustmentControls } from "../editor-controls/AdjustmentControls";
import { DeviceSelector } from "../device-selector/DeviceSelector";
import { ExportPanel } from "../export/ExportPanel";
import { OverlayPanel } from "../overlays/OverlayPanel";
import { UploadPanel } from "../upload/UploadPanel";

const titles = {
  image: "Image",
  device: "Device",
  adjust: "Adjust",
  overlays: "Overlays",
  export: "Export",
} as const;

export function MobilePanel({
  expanded,
  onExpandedChange,
}: {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}) {
  const { t } = useI18n();
  const { mobileTab, orientedDevice, profile, setMobileTab } = useEditor();
  const headingId = useId();
  const contentId = useId();
  return (
    <section
      className={`mobile-panel${expanded ? " is-expanded" : ""}`}
      aria-labelledby={headingId}
      data-panel-size={expanded ? "expanded" : "balanced"}
    >
      <header>
        <div className="mobile-panel-title">
          <h2 id={headingId}>{t(titles[mobileTab])}</h2>
          <span>
            {profile.model} · {orientedDevice.outputWidth} × {orientedDevice.outputHeight}
          </span>
        </div>
        <div className="mobile-panel-actions">
          <button
            type="button"
            className="panel-size-button compact-button"
            aria-controls={contentId}
            aria-expanded={expanded}
            aria-label={t(expanded ? "More preview" : "More controls")}
            title={t(
              expanded
                ? "Restore the balanced preview and controls layout."
                : "Give editing controls more room.",
            )}
            onClick={() => onExpandedChange(!expanded)}
          >
            {expanded ? <ChevronsDown /> : <ChevronsUp />}
            <span>{t(expanded ? "More preview" : "More controls")}</span>
          </button>
          {mobileTab !== "export" ? (
            <button
              className="primary-button compact"
              type="button"
              onClick={() => setMobileTab("export")}
            >
              {t("Download")} <Download />
            </button>
          ) : null}
        </div>
      </header>
      <div id={contentId} key={mobileTab} className="mobile-panel-scroll">
        {mobileTab === "image" ? <UploadPanel /> : null}
        {mobileTab === "device" ? <DeviceSelector /> : null}
        {mobileTab === "adjust" ? <AdjustmentControls /> : null}
        {mobileTab === "overlays" ? <OverlayPanel /> : null}
        {mobileTab === "export" ? <ExportPanel compact /> : null}
      </div>
    </section>
  );
}
