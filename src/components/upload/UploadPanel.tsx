import { ImagePlus, LockKeyhole, Replace, Trash2, UploadCloud } from "lucide-react";
import { useId, useRef, useState, type DragEvent } from "react";
import { decodeImageFile } from "../../core/image-decoder";
import { useI18n } from "../../i18n/i18n";
import { useEditor } from "../../state/editor-context";
import { PanelSection } from "../ui";

function formatBytes(bytes: number, bundledDemo: string) {
  if (!bytes) return bundledDemo;
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

export function UploadPanel() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();
  const { image, setImage, setAnnouncement } = useEditor();
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  async function load(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      const asset = await decodeImageFile(file);
      setImage(asset);
      setAnnouncement(t("{name} loaded locally.", { name: file.name }));
    } catch (reason) {
      setError(t(reason instanceof Error ? reason.message : "The image could not be loaded."));
    }
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void load(event.dataTransfer.files[0]);
  }

  return (
    <PanelSection title={t("Image")} className="upload-section">
      <input
        ref={inputRef}
        id={inputId}
        className="visually-hidden"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => void load(event.target.files?.[0])}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {image ? (
        <div className="image-summary">
          <div className="image-thumb" aria-hidden="true">
            <ImagePlus />
          </div>
          <div className="image-meta">
            <strong title={image.name}>{image.name}</strong>
            <span>
              {image.width} × {image.height}
            </span>
            <span>
              {formatBytes(image.size, t("Bundled demo"))}
              {image.isDemo ? ` · ${t("Try the demo")}` : ""}
            </span>
          </div>
          <button
            className="compact-button"
            type="button"
            onClick={() => inputRef.current?.click()}
          >
            <Replace size={15} /> {t("Replace")}
          </button>
          <button
            className="icon-button danger"
            type="button"
            aria-label={t("Remove image")}
            title={t("Remove image")}
            onClick={() => setImage(null)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`drop-zone ${dragging ? "is-dragging" : ""}`}
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={drop}
        >
          <UploadCloud />
          <strong>{t("Drop an image here")}</strong>
          <span>{t("PNG, JPEG, or WebP · up to 30 MB")}</span>
          <button type="button" onClick={() => inputRef.current?.click()}>
            {t("Browse files")}
          </button>
        </div>
      )}
      {error ? (
        <p className="field-error" id={`${inputId}-error`} role="alert">
          {error}
        </p>
      ) : null}
      <p className="privacy-note">
        <LockKeyhole size={14} /> {t("Your image never leaves this browser.")}
      </p>
    </PanelSection>
  );
}
