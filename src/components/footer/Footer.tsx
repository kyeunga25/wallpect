import { CheckCircle2, Keyboard } from "lucide-react";
import { useI18n } from "../../i18n/i18n";

export function Footer() {
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
      <span>
        {t("Wallpect is independent and is not affiliated with or endorsed by Apple Inc.")}
      </span>
    </footer>
  );
}
