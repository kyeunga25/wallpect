import { Component, useState, type ErrorInfo, type ReactNode } from "react";
import { AdjustmentControls } from "../components/editor-controls/AdjustmentControls";
import { DeviceSelector } from "../components/device-selector/DeviceSelector";
import { DeviceInformation } from "../components/export/DeviceInformation";
import { ExportPanel } from "../components/export/ExportPanel";
import { Footer } from "../components/footer/Footer";
import { Header, type InfoView } from "../components/header/Header";
import { InfoDialog } from "../components/info/InfoDialog";
import { MobilePanel } from "../components/mobile/MobilePanel";
import { MobileTabs } from "../components/mobile/MobileTabs";
import { OverlayPanel } from "../components/overlays/OverlayPanel";
import { DevicePreview } from "../components/preview/DevicePreview";
import { UploadPanel } from "../components/upload/UploadPanel";
import { useI18n } from "../i18n/i18n";
import { EditorProvider, useEditor } from "../state/editor-context";

class ErrorBoundary extends Component<
  { children: ReactNode; message: string; reload: string },
  { error: string | null }
> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Wallpect editor error", error, info);
  }
  render() {
    if (this.state.error)
      return (
        <main className="fatal-error">
          <strong>{this.props.message}</strong>
          <p>{this.state.error}</p>
          <button type="button" onClick={() => window.location.reload()}>
            {this.props.reload}
          </button>
        </main>
      );
    return this.props.children;
  }
}

function Workspace() {
  const [info, setInfo] = useState<InfoView>(null);
  const { announcement } = useEditor();
  const { t } = useI18n();
  return (
    <div className="app-shell">
      <Header onOpenInfo={setInfo} />
      <div className="workspace">
        <aside className="left-rail" aria-label={t("Image, device, and adjustment controls")}>
          <UploadPanel />
          <DeviceSelector />
          <AdjustmentControls />
        </aside>
        <DevicePreview />
        <aside className="right-rail" aria-label={t("Overlay, device, and export controls")}>
          <OverlayPanel />
          <DeviceInformation />
          <ExportPanel />
        </aside>
      </div>
      <MobileTabs />
      <MobilePanel />
      <Footer />
      <InfoDialog view={info} onClose={() => setInfo(null)} />
      <div className="visually-hidden" aria-live="polite">
        {announcement}
      </div>
    </div>
  );
}

export default function App() {
  const { t } = useI18n();
  return (
    <ErrorBoundary message={t("Wallpect could not start.")} reload={t("Reload editor")}>
      <EditorProvider>
        <Workspace />
      </EditorProvider>
    </ErrorBoundary>
  );
}
