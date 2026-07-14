import { Database, ExternalLink, ShieldCheck, Target, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useI18n } from "../../i18n/i18n";
import { useEditor } from "../../state/editor-context";
import type { InfoView } from "../header/Header";

const copy = {
  about: {
    icon: Target,
    title: "Fit every pixel with confidence.",
    intro:
      "Wallpect is a privacy-first wallpaper previewer. Compose your image on a selected device, inspect likely obstructions, then export at the exact target resolution.",
  },
  devices: {
    icon: Database,
    title: "Device data, without false precision.",
    intro:
      "Hardware resolutions come from published technical specifications. Safe areas, corner radii, and system UI overlays may be measured or derived, so every profile declares its accuracy level.",
  },
  privacy: {
    icon: ShieldCheck,
    title: "Your image stays on your device.",
    intro:
      "Wallpect decodes, previews, and exports images inside this browser. There is no image upload endpoint, account, cloud project, or third-party image analysis.",
  },
} as const;

export function InfoDialog({ view, onClose }: { view: InfoView; onClose: () => void }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const { profiles } = useEditor();
  useEffect(() => {
    const dialog = ref.current;
    if (view && dialog && !dialog.open) dialog.showModal();
    if (!view && dialog?.open) dialog.close();
  }, [view]);
  if (!view) return null;
  const item = copy[view];
  const Icon = item.icon;
  return (
    <dialog ref={ref} className="info-dialog" onClose={onClose}>
      <button className="dialog-close" type="button" aria-label={t("Close")} onClick={onClose}>
        <X />
      </button>
      <Icon className="dialog-icon" />
      <h2>{t(item.title)}</h2>
      <p className="dialog-intro">{t(item.intro)}</p>
      {view === "about" ? (
        <div className="dialog-grid">
          <div>
            <strong>{t("Inspect")}</strong>
            <span>{t("Real aspect ratios, cutouts, and safe areas.")}</span>
          </div>
          <div>
            <strong>{t("Compose")}</strong>
            <span>{t("Drag, zoom, rotate, fill, fit, or extend.")}</span>
          </div>
          <div>
            <strong>{t("Export")}</strong>
            <span>{t("PNG, JPEG, or WebP at exact pixels.")}</span>
          </div>
        </div>
      ) : null}
      {view === "privacy" ? (
        <div className="dialog-body">
          <h3>{t("What remains local")}</h3>
          <ul>
            <li>{t("Image pixels and canvas data")}</li>
            <li>{t("Image filename and file path")}</li>
            <li>{t("Transform and export operations")}</li>
          </ul>
          <h3>{t("Stored preferences")}</h3>
          <p>
            {t(
              "Only recent device identifiers may be stored locally. Uploaded images are held in memory and cleared when you leave or refresh.",
            )}
          </p>
        </div>
      ) : null}
      {view === "devices" ? (
        <div className="dialog-body">
          <div className="data-count">
            <strong>{profiles.length}</strong>
            <span>{t("Apple-first profiles included")}</span>
          </div>
          <h3>{t("Accuracy levels")}</h3>
          <dl className="accuracy-list">
            <div>
              <dt>{t("Verified")}</dt>
              <dd>{t("Cross-checked with official specifications and measured data.")}</dd>
            </div>
            <div>
              <dt>{t("High")}</dt>
              <dd>{t("Resolution confirmed; some geometry is derived.")}</dd>
            </div>
            <div>
              <dt>{t("Estimated")}</dt>
              <dd>{t("One or more obstruction measurements are approximate.")}</dd>
            </div>
          </dl>
          <a href="https://support.apple.com/specs" target="_blank" rel="noreferrer">
            {t("Apple technical specifications")} <ExternalLink />
          </a>
        </div>
      ) : null}
      <p className="legal-note">
        {t("Wallpect is independent and is not affiliated with or endorsed by Apple Inc.")}
      </p>
    </dialog>
  );
}
