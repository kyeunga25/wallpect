import { CheckCircle2, CircleAlert, Maximize2 } from "lucide-react";
import { calculateCropPercent } from "../../core/fit";
import {
  calculateImageEnlargement,
  formatImageEnlargement,
  getImageResolutionSummary,
  type ImageResolutionTone,
} from "../../core/image-quality";
import { useI18n } from "../../i18n/i18n";
import { useEditor } from "../../state/editor-context";

type CompositionTone = ImageResolutionTone;

interface CompositionSummary {
  label: string;
  message: string;
  tone: CompositionTone;
}

interface CompositionFeedbackProps {
  onShowWholeImage: () => void;
}

const TONE_RANK: Record<CompositionTone, number> = { good: 0, caution: 1, warning: 2 };

function getCompositionSummary(crop: number, fitMode: "cover" | "contain"): CompositionSummary {
  if (crop <= 1) {
    return {
      label: "Whole image visible",
      message:
        fitMode === "contain"
          ? "The whole image is visible; choose Solid, Transparent, or Blur below for uncovered areas."
          : "The image fills the wallpaper while keeping nearly all of its content visible.",
      tone: "good",
    };
  }
  if (crop <= 15) {
    return {
      label: "Light crop",
      message: "Only a small part sits outside the wallpaper; fine positioning may be enough.",
      tone: "good",
    };
  }
  if (crop <= 40) {
    return {
      label: "Noticeable crop",
      message: "Some content sits outside the wallpaper; reposition the subject or use Fit.",
      tone: "caution",
    };
  }
  return {
    label: "Heavy crop",
    message: "A large part sits outside the wallpaper; use Fit if important content is missing.",
    tone: "warning",
  };
}

export function CompositionFeedback({ onShowWholeImage }: CompositionFeedbackProps) {
  const { t } = useI18n();
  const { image, orientedDevice, transform, setTransform, setAnnouncement } = useEditor();
  if (!image || image.width <= 0 || image.height <= 0) return null;
  const crop = calculateCropPercent(
    image.width,
    image.height,
    orientedDevice.outputWidth,
    orientedDevice.outputHeight,
    transform,
  );
  const enlargement = calculateImageEnlargement(
    image.width,
    image.height,
    orientedDevice.outputWidth,
    orientedDevice.outputHeight,
    transform,
  );
  const cropSummary = getCompositionSummary(crop, transform.fitMode);
  const resolutionSummary = getImageResolutionSummary(enlargement);
  const tone =
    TONE_RANK[resolutionSummary.tone] > TONE_RANK[cropSummary.tone]
      ? resolutionSummary.tone
      : cropSummary.tone;
  const CropIcon = cropSummary.tone === "warning" ? CircleAlert : CheckCircle2;
  const ResolutionIcon = resolutionSummary.tone === "good" ? CheckCircle2 : CircleAlert;
  const formattedEnlargement = formatImageEnlargement(enlargement);
  const shouldOfferWholeImage = crop > 15;

  function showWholeImage() {
    setTransform((current) => ({
      ...current,
      fitMode: "contain",
      scale: 1,
      translateX: 0,
      translateY: 0,
      rotationDeg: 0,
    }));
    setAnnouncement(t("The whole image is now visible."));
    window.requestAnimationFrame(onShowWholeImage);
  }

  return (
    <section className={`composition-feedback is-${tone}`} aria-label={t("Composition check")}>
      <div className="composition-feedback-heading">
        <span>
          <CropIcon aria-hidden="true" />
          {t("Composition check")}
        </span>
        <span className="composition-feedback-result">
          <strong>{t(cropSummary.label)}</strong>
          <output aria-label={t("Estimated crop")}>{crop.toFixed(1)}%</output>
        </span>
      </div>
      <p>{t(cropSummary.message)}</p>
      {shouldOfferWholeImage ? (
        <>
          <p>{t("Resets zoom, position, and rotation. You can undo this.")}</p>
          <button
            type="button"
            className="secondary-button composition-feedback-action"
            title={t("Reset zoom, position, and rotation to show the whole image.")}
            onClick={showWholeImage}
          >
            <Maximize2 aria-hidden="true" />
            {t("Show whole image")}
          </button>
        </>
      ) : null}
      <div className="composition-feedback-heading">
        <span>
          <ResolutionIcon aria-hidden="true" />
          {t("Image resolution")}
        </span>
        <span className="composition-feedback-result">
          <strong>{t(resolutionSummary.label)}</strong>
          <output aria-label={t("Estimated enlargement")}>
            {formattedEnlargement ?? t("No enlargement")}
          </output>
        </span>
      </div>
      <p>{t(resolutionSummary.message)}</p>
    </section>
  );
}
