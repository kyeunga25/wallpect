import { Database, ExternalLink, Scale, ShieldCheck, Target, X } from "lucide-react";
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
  legal: {
    icon: Scale,
    title: "Legal, privacy, and data use.",
    intro: "Plain-language terms, limitations, and source rules for using Wallpect.",
  },
} as const;

type Translate = (key: string, values?: Record<string, string | number>) => string;

function PrivacyContent({ t }: { t: Translate }) {
  return (
    <div className="dialog-body legal-sections">
      <section>
        <h3>{t("What remains local")}</h3>
        <ul>
          <li>{t("Image pixels and canvas data")}</li>
          <li>{t("Image filename and file path")}</li>
          <li>{t("Transform and export operations")}</li>
        </ul>
      </section>
      <section>
        <h3>{t("Stored preferences")}</h3>
        <p>
          {t(
            "Wallpect stores only your selected language and up to four recent device identifiers in this browser. Uploaded images are held in memory, are never written to localStorage, and are cleared when replaced, refreshed, or closed.",
          )}
        </p>
      </section>
      <section>
        <h3>{t("Cookies, analytics, and cache")}</h3>
        <p>
          {t(
            "The Wallpect app does not set advertising cookies, load client-side analytics, create accounts, or send image data to a server. Public app assets may be cached by the browser for reliability; this cache does not contain your selected images.",
          )}
        </p>
      </section>
      <section>
        <h3>{t("Hosting network data")}</h3>
        <p>
          {t(
            "Wallpect is hosted on Cloudflare. Requests for public site files pass through Cloudflare, which may process IP addresses, routing data, system configuration, and request metadata under its privacy policy. Selected image bytes are not part of those requests.",
          )}
        </p>
      </section>
      <section>
        <h3>{t("External links")}</h3>
        <p>
          {t(
            "External links leave Wallpect and are governed by the destination site's own terms and privacy practices.",
          )}
        </p>
      </section>
    </div>
  );
}

function DeviceContent({ count, t }: { count: number; t: Translate }) {
  return (
    <div className="dialog-body">
      <div className="data-count">
        <strong>{count}</strong>
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
  );
}

function LegalContent({ t }: { t: Translate }) {
  return (
    <div className="dialog-body legal-sections">
      <p className="legal-effective">{t("Effective date: 25 July 2026")}</p>
      <section>
        <h3>{t("Terms of use")}</h3>
        <p>
          {t(
            "By using Wallpect, you agree to use it lawfully and not to disrupt, bypass security controls, overload, or misuse the service. If you do not agree, do not use the service.",
          )}
        </p>
      </section>
      <section>
        <h3>{t("Your images and rights")}</h3>
        <p>
          {t(
            "Your images remain under your control and are processed only in your browser. You are responsible for having permission to use, edit, and export any image you select.",
          )}
        </p>
      </section>
      <section>
        <h3>{t("Accuracy and no warranty")}</h3>
        <p>
          {t(
            "Wallpect is a beta composition aid, provided as is and as available. Device profiles, safe areas, overlays, and export previews may be incomplete, approximate, outdated, or affected by operating-system settings. Check important output on the target device before relying on it.",
          )}
        </p>
      </section>
      <section>
        <h3>{t("Liability")}</h3>
        <p>
          {t(
            "To the fullest extent permitted by applicable law, Wallpect's maintainers are not responsible for indirect, incidental, or consequential loss arising from use of, inability to use, or reliance on the service or linked information.",
          )}
        </p>
        <p>
          {t(
            "Nothing in these terms excludes rights or liabilities that applicable law does not allow to be excluded or limited.",
          )}
        </p>
      </section>
      <section>
        <h3>{t("Data sources and methodology")}</h3>
        <p>
          {t(
            "Device names and hardware resolutions are manually curated from linked public manufacturer specification and support pages. Wallpect records a review date and accuracy level for each profile; safe areas, corner radii, cutouts, and system overlays may be measured, derived, or estimated rather than official.",
          )}
        </p>
        <p>
          {t(
            "Wallpect does not use an Apple or third-party device-data API at runtime, and it does not reproduce Apple website text, product images, logos, or interface assets. Source links are references, not endorsements.",
          )}
        </p>
      </section>
      <section>
        <h3>{t("Trademarks and independence")}</h3>
        <p>
          {t(
            "Apple, iPhone, iPad, Mac, MacBook, iMac, and related names are trademarks of Apple Inc. They are used only to identify compatible device profiles. Wallpect is independent and is not authorized, sponsored, or endorsed by Apple Inc.",
          )}
        </p>
      </section>
      <section>
        <h3>{t("Third-party sites and changes")}</h3>
        <p>
          {t(
            "Linked sources may change or become unavailable and remain subject to their owners' terms. Wallpect's features, profiles, and notices may be updated; the effective date above identifies this version.",
          )}
        </p>
      </section>
      <section className="legal-links" aria-label={t("Official reference links")}>
        <h3>{t("Official reference links")}</h3>
        <a href="https://support.apple.com/specs" target="_blank" rel="noreferrer">
          {t("Apple technical specifications")} <ExternalLink />
        </a>
        <a
          href="https://www.apple.com/hk/legal/internet-services/terms/site.html"
          target="_blank"
          rel="noreferrer"
        >
          {t("Apple website terms")} <ExternalLink />
        </a>
        <a
          href="https://www.apple.com/hk/legal/intellectual-property/guidelinesfor3rdparties.html"
          target="_blank"
          rel="noreferrer"
        >
          {t("Apple trademark guidelines")} <ExternalLink />
        </a>
        <a
          href="https://www.pcpd.org.hk/tc_chi/resources_centre/publications/files/GN_picspps_c.pdf"
          target="_blank"
          rel="noreferrer"
        >
          {t("Hong Kong privacy guidance")} <ExternalLink />
        </a>
        <a href="https://www.cloudflare.com/policies/privacy/" target="_blank" rel="noreferrer">
          {t("Cloudflare privacy policy")} <ExternalLink />
        </a>
        <a href="https://github.com/kyeunga25/wallpect/issues" target="_blank" rel="noreferrer">
          {t("Report a problem on GitHub")} <ExternalLink />
        </a>
      </section>
      <p className="legal-advice">
        {t(
          "This notice explains the current beta implementation and is general information, not legal advice.",
        )}
      </p>
    </div>
  );
}

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
      {view === "privacy" ? <PrivacyContent t={t} /> : null}
      {view === "devices" ? <DeviceContent count={profiles.length} t={t} /> : null}
      {view === "legal" ? <LegalContent t={t} /> : null}
      <p className="legal-note">
        {t("Wallpect is independent and is not affiliated with or endorsed by Apple Inc.")}
      </p>
    </dialog>
  );
}
