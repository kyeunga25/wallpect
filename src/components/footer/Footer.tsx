import { CheckCircle2, Keyboard } from "lucide-react";
import { useI18n } from "../../i18n/i18n";
import type { InfoView } from "../header/Header";

export function Footer({ onOpenInfo }: { onOpenInfo: (view: Exclude<InfoView, null>) => void }) {
  const { t } = useI18n();
  return (
    <footer className="app-footer">
      <span className="local-foot">
        <CheckCircle2 /> {t("All changes are local and never uploaded.")}
      </span>
      <span className="shortcuts">
        <Keyboard /> <kbd>←↑→↓</kbd> {t("Move")} <kbd>+/−</kbd> {t("Zoom")} <kbd>R</kbd>{" "}
        {t("Reset")} <kbd>0</kbd> {t("Center")}
      </span>
      <span className="footer-meta">
        <span className="footer-legal">
          <button type="button" onClick={() => onOpenInfo("privacy")}>
            {t("Privacy")}
          </button>
          <button type="button" onClick={() => onOpenInfo("legal")}>
            {t("Legal & data")}
          </button>
        </span>
        <span className="footer-disclaimer">
          {t("Wallpect is independent and is not affiliated with or endorsed by Apple Inc.")}
        </span>
      </span>
    </footer>
  );
}
