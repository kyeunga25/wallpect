import { Image, Layers3, SlidersHorizontal, Smartphone, Upload } from "lucide-react";
import { useEditor, type MobileTab } from "../../state/editor-context";
import { useI18n } from "../../i18n/i18n";

const tabs: { id: MobileTab; label: string; icon: typeof Image }[] = [
  { id: "image", label: "Image", icon: Image },
  { id: "device", label: "Device", icon: Smartphone },
  { id: "adjust", label: "Adjust", icon: SlidersHorizontal },
  { id: "overlays", label: "Overlays", icon: Layers3 },
  { id: "export", label: "Export", icon: Upload },
];

export function MobileTabs() {
  const { t } = useI18n();
  const { mobileTab, setMobileTab } = useEditor();
  return (
    <nav className="mobile-tabs" aria-label={t("Editor panels")}>
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={mobileTab === id ? "is-selected" : ""}
          aria-current={mobileTab === id ? "page" : undefined}
          onClick={() => setMobileTab(id)}
        >
          <Icon />
          <span>{t(label)}</span>
        </button>
      ))}
    </nav>
  );
}
