import { CircleAlert, ExternalLink } from "lucide-react";
import { calculateCropPercent } from "../../core/fit";
import { useI18n } from "../../i18n/i18n";
import { useEditor } from "../../state/editor-context";
import { PanelSection } from "../ui";

export function DeviceInformation() {
  const { t } = useI18n();
  const { profile, orientedDevice, image, transform } = useEditor();
  const crop = image
    ? calculateCropPercent(
        image.width,
        image.height,
        orientedDevice.outputWidth,
        orientedDevice.outputHeight,
        transform,
      )
    : 0;
  const insets = orientedDevice.safeInsets;
  return (
    <PanelSection title={t("Device information")} className="device-information">
      <dl>
        <div>
          <dt>{t("Model")}</dt>
          <dd>{profile.model}</dd>
        </div>
        <div>
          <dt>{t("Physical resolution")}</dt>
          <dd>
            {orientedDevice.outputWidth} × {orientedDevice.outputHeight} px
          </dd>
        </div>
        <div>
          <dt>{t("Logical viewport")}</dt>
          <dd>
            {orientedDevice.logicalWidth} × {orientedDevice.logicalHeight} pt
          </dd>
        </div>
        <div>
          <dt>{t("Pixel density")}</dt>
          <dd>
            {profile.display.devicePixelRatio.toFixed(profile.display.devicePixelRatio % 1 ? 2 : 0)}
            × DPR
          </dd>
        </div>
        <div>
          <dt>{t("Aspect ratio")}</dt>
          <dd>{(orientedDevice.outputWidth / orientedDevice.outputHeight).toFixed(4)}</dd>
        </div>
        <div>
          <dt>{t("Estimated crop")}</dt>
          <dd>{crop.toFixed(1)}%</dd>
        </div>
        <div>
          <dt>{t("Safe-area insets")}</dt>
          <dd>
            T {insets.top} · R {insets.right} · B {insets.bottom} · L {insets.left}
          </dd>
        </div>
        <div>
          <dt>{t("Accuracy")}</dt>
          <dd>
            <span className={`accuracy ${profile.metadata.accuracy}`}>
              {t(profile.metadata.accuracy[0].toUpperCase() + profile.metadata.accuracy.slice(1))}
            </span>
          </dd>
        </div>
        <div>
          <dt>{t("Last reviewed")}</dt>
          <dd>{profile.metadata.lastVerified}</dd>
        </div>
      </dl>
      <details className="accuracy-note">
        <summary>
          <CircleAlert size={15} /> {t("Accuracy notes")}
        </summary>
        <p>{profile.metadata.notes.map((note) => t(note)).join(" ")}</p>
        <p>
          {t("Lock Screen and desktop UI are approximate and not an official system rendering.")}
        </p>
        {profile.metadata.sourceUrls.map((url) => (
          <a key={url} href={url} target="_blank" rel="noreferrer">
            {t("Source reference")} <ExternalLink size={13} />
          </a>
        ))}
      </details>
    </PanelSection>
  );
}
