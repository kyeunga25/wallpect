import { CheckCircle2, Download, FileImage, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";
import {
  downloadBlob,
  ensureFilenameExtension,
  exportWallpaper,
  generateFilename,
} from "../../core/export";
import { useI18n } from "../../i18n/i18n";
import { useEditor } from "../../state/editor-context";
import type { ExportFormat } from "../../types/editor";
import { PanelSection, RangeControl, Segmented } from "../ui";

function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function ExportPanel({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const {
    profile,
    orientedDevice,
    orientation,
    image,
    transform,
    backgroundMode,
    backgroundColor,
    exportSettings,
    setExportSettings,
    setAnnouncement,
  } = useEditor();
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");
  const [result, setResult] = useState("");
  const defaultFilename = useMemo(
    () =>
      generateFilename(
        profile.slug,
        orientation,
        orientedDevice.outputWidth,
        orientedDevice.outputHeight,
        exportSettings.format,
      ),
    [
      exportSettings.format,
      orientation,
      orientedDevice.outputHeight,
      orientedDevice.outputWidth,
      profile.slug,
    ],
  );

  function setFormat(format: ExportFormat) {
    setExportSettings((current) => ({
      ...current,
      format,
      filename: ensureFilenameExtension(current.filename || defaultFilename, format),
    }));
  }

  async function download() {
    if (!image) return;
    setState("working");
    setResult("");
    try {
      const blob = await exportWallpaper({
        width: orientedDevice.outputWidth,
        height: orientedDevice.outputHeight,
        image,
        transform,
        backgroundMode:
          exportSettings.format === "jpeg" && backgroundMode === "transparent"
            ? "solid"
            : backgroundMode,
        backgroundColor:
          exportSettings.format === "jpeg" && backgroundMode === "transparent"
            ? "#ffffff"
            : backgroundColor,
        format: exportSettings.format,
        quality: exportSettings.quality,
        includeGuides: exportSettings.includeGuides,
        safeInsets: orientedDevice.safeInsets,
      });
      const filename = ensureFilenameExtension(
        exportSettings.filename || defaultFilename,
        exportSettings.format,
      );
      downloadBlob(blob, filename);
      const message = t("{filename} exported at {width} × {height} ({size}).", {
        filename,
        width: orientedDevice.outputWidth,
        height: orientedDevice.outputHeight,
        size: formatBytes(blob.size),
      });
      setResult(message);
      setState("done");
      setAnnouncement(message);
    } catch (reason) {
      const message = t(
        reason instanceof Error ? reason.message : "The wallpaper could not be exported.",
      );
      setResult(message);
      setState("error");
    }
  }

  const content = (
    <>
      <Segmented<ExportFormat>
        value={exportSettings.format}
        onChange={setFormat}
        label={t("Export format")}
        options={[
          { value: "png", label: "PNG" },
          { value: "jpeg", label: "JPEG" },
          { value: "webp", label: "WebP" },
        ]}
      />
      {exportSettings.format !== "png" ? (
        <RangeControl
          label={t("Quality")}
          value={exportSettings.quality * 100}
          min={40}
          max={100}
          step={1}
          unit="%"
          onChange={(quality) =>
            setExportSettings((current) => ({ ...current, quality: quality / 100 }))
          }
        />
      ) : null}
      <label className="text-field">
        <span>{t("Filename")}</span>
        <input
          value={exportSettings.filename}
          onChange={(event) =>
            setExportSettings((current) => ({ ...current, filename: event.target.value }))
          }
          onBlur={() =>
            setExportSettings((current) => ({
              ...current,
              filename: ensureFilenameExtension(current.filename, current.format),
            }))
          }
        />
      </label>
      <div className="export-resolution">
        <FileImage />
        <span>
          <small>{t("Exact output")}</small>
          <strong>
            {orientedDevice.outputWidth} × {orientedDevice.outputHeight} px
          </strong>
        </span>
      </div>
      <label className="guide-checkbox">
        <input
          type="checkbox"
          checked={exportSettings.includeGuides}
          onChange={(event) =>
            setExportSettings((current) => ({ ...current, includeGuides: event.target.checked }))
          }
        />
        <span>{t("Export preview with safe-area guides")}</span>
      </label>
      <button
        type="button"
        className="primary-button"
        disabled={!image || state === "working"}
        onClick={() => void download()}
      >
        {state === "working" ? <LoaderCircle className="spin" /> : <Download />}{" "}
        {t(state === "working" ? "Preparing…" : "Download wallpaper")}
      </button>
      {result ? (
        <p className={`export-result ${state}`} role="status">
          {state === "done" ? <CheckCircle2 /> : null}
          {result}
        </p>
      ) : null}
      <p className="export-tip">
        {t(
          profile.platform === "macOS"
            ? "After downloading, choose it in System Settings → Wallpaper."
            : "After downloading, choose it in Photos or Settings → Wallpaper. The system may still apply Extend or Perspective effects.",
        )}
      </p>
    </>
  );

  return compact ? (
    <div className="export-panel compact">{content}</div>
  ) : (
    <PanelSection title={t("Export")} className="export-panel">
      {content}
    </PanelSection>
  );
}
