import { Code2, Languages, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { useI18n, type Locale } from "../../i18n/i18n";
import { BrandMark } from "../preview/BrandMark";

export type InfoView = "about" | "devices" | "privacy" | null;

export function Header({ onOpenInfo }: { onOpenInfo: (view: Exclude<InfoView, null>) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { locale, setLocale, t } = useI18n();
  return (
    <header className="app-header">
      <button
        className="brand"
        type="button"
        onClick={() => onOpenInfo("about")}
        aria-label={t("About Wallpect")}
      >
        <BrandMark />
        <span>Wallpect</span>
        <em>{t("Beta")}</em>
      </button>
      <nav className={menuOpen ? "is-open" : ""} aria-label={t("Primary navigation")}>
        <button type="button" onClick={() => onOpenInfo("about")}>
          {t("About")}
        </button>
        <button type="button" onClick={() => onOpenInfo("devices")}>
          {t("Device data")}
        </button>
        <button type="button" onClick={() => onOpenInfo("privacy")}>
          {t("Privacy")}
        </button>
        <a href="https://github.com/" target="_blank" rel="noreferrer">
          GitHub <Code2 size={15} />
        </a>
      </nav>
      <div className="local-status">
        <ShieldCheck size={17} />
        <span>{t("Processed locally in your browser")}</span>
        <i />
      </div>
      <label className="language-switcher">
        <Languages size={16} aria-hidden="true" />
        <span className="visually-hidden">{t("Language")}</span>
        <select
          aria-label={t("Language")}
          value={locale}
          onChange={(event) => setLocale(event.target.value as Locale)}
        >
          <option value="zh-Hant">繁中</option>
          <option value="zh-Hans">简中</option>
          <option value="en">EN</option>
        </select>
      </label>
      <button
        type="button"
        className="menu-button"
        aria-label={menuOpen ? t("Close menu") : t("Open menu")}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>
    </header>
  );
}
