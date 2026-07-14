import { Download, GripHorizontal } from "lucide-react";
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

export function MobilePanel() {
  const { t } = useI18n();
  const { mobileTab, orientedDevice, setMobileTab } = useEditor();
  return (
    <section className="mobile-panel">
      <div className="sheet-grabber">
        <GripHorizontal />
      </div>
      <header>
        <div>
          <strong>{t(titles[mobileTab])}</strong>
          <span>
            {orientedDevice.outputWidth} × {orientedDevice.outputHeight}
          </span>
        </div>
        {mobileTab !== "export" ? (
          <button
            className="primary-button compact"
            type="button"
            onClick={() => setMobileTab("export")}
          >
            {t("Download")} <Download />
          </button>
        ) : null}
      </header>
      <div key={mobileTab} className="mobile-panel-scroll">
        {mobileTab === "image" ? <UploadPanel /> : null}
        {mobileTab === "device" ? <DeviceSelector /> : null}
        {mobileTab === "adjust" ? <AdjustmentControls /> : null}
        {mobileTab === "overlays" ? <OverlayPanel /> : null}
        {mobileTab === "export" ? <ExportPanel compact /> : null}
      </div>
    </section>
  );
}
