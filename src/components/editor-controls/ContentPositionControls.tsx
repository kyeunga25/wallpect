import {
  alignImageToCanvas,
  calculateImageAlignmentOffsets,
  type ImageAlignment,
  type ImageAlignmentAxis,
  type ImageAlignmentOffsets,
} from "../../core/fit";
import { useI18n } from "../../i18n/i18n";
import { useEditor } from "../../state/editor-context";
import { Segmented } from "../ui";

type AlignmentValue = ImageAlignment | "custom";

const MIN_ALIGNMENT_TRAVEL_PX = 4;
const ALIGNMENTS: ImageAlignment[] = ["start", "center", "end"];
const HORIZONTAL_LABELS = ["Left side", "Center", "Right side"] as const;
const VERTICAL_LABELS = ["Top", "Middle", "Bottom"] as const;

function hasUsefulTravel(offsets: ImageAlignmentOffsets, dimension: number) {
  return Math.abs(offsets.start - offsets.end) * dimension >= MIN_ALIGNMENT_TRAVEL_PX;
}

function activeAlignment(
  value: number,
  offsets: ImageAlignmentOffsets,
  dimension: number,
): AlignmentValue {
  const tolerance = Math.max(0.5 / dimension, Number.EPSILON);
  return (
    ALIGNMENTS.find((alignment) => Math.abs(value - offsets[alignment]) <= tolerance) ?? "custom"
  );
}

export function ContentPositionControls() {
  const { t } = useI18n();
  const { image, orientedDevice, transform, setTransform, setAnnouncement } = useEditor();
  if (!image || image.width <= 0 || image.height <= 0) return null;

  const offsets = calculateImageAlignmentOffsets(
    image.width,
    image.height,
    orientedDevice.outputWidth,
    orientedDevice.outputHeight,
    transform,
  );
  const horizontalAvailable = hasUsefulTravel(offsets.horizontal, orientedDevice.outputWidth);
  const verticalAvailable = hasUsefulTravel(offsets.vertical, orientedDevice.outputHeight);
  if (!horizontalAvailable && !verticalAvailable) return null;

  function positionImage(axis: ImageAlignmentAxis, alignment: ImageAlignment, label: string) {
    setTransform((current) =>
      alignImageToCanvas(
        image!.width,
        image!.height,
        orientedDevice.outputWidth,
        orientedDevice.outputHeight,
        current,
        axis,
        alignment,
      ),
    );
    setAnnouncement(t("Image positioned to show the {position}.", { position: t(label) }));
  }

  return (
    <section className="nudge-control content-position-control" aria-label={t("Content position")}>
      <div className="nudge-heading">
        <strong>{t("Content position")}</strong>
        <span>{t("Snap into view")}</span>
      </div>
      <p className="control-help">
        {t("Bring an important person, logo, or text into view without repeated dragging.")}
      </p>
      {horizontalAvailable ? (
        <div className="orientation-row content-position-axis">
          <span>{t("Horizontal")}</span>
          <Segmented<AlignmentValue>
            value={activeAlignment(
              transform.translateX,
              offsets.horizontal,
              orientedDevice.outputWidth,
            )}
            onChange={(alignment) => {
              if (alignment === "custom") return;
              const index = ALIGNMENTS.indexOf(alignment);
              positionImage("horizontal", alignment, HORIZONTAL_LABELS[index]);
            }}
            label={t("Horizontal content position")}
            options={ALIGNMENTS.map((value, index) => ({
              value,
              label: t(HORIZONTAL_LABELS[index]),
            }))}
          />
        </div>
      ) : null}
      {verticalAvailable ? (
        <div className="orientation-row content-position-axis">
          <span>{t("Vertical")}</span>
          <Segmented<AlignmentValue>
            value={activeAlignment(
              transform.translateY,
              offsets.vertical,
              orientedDevice.outputHeight,
            )}
            onChange={(alignment) => {
              if (alignment === "custom") return;
              const index = ALIGNMENTS.indexOf(alignment);
              positionImage("vertical", alignment, VERTICAL_LABELS[index]);
            }}
            label={t("Vertical content position")}
            options={ALIGNMENTS.map((value, index) => ({
              value,
              label: t(VERTICAL_LABELS[index]),
            }))}
          />
        </div>
      ) : null}
      <p className="control-help">
        {t("You can still drag the preview or use precise controls for a custom position.")}
      </p>
    </section>
  );
}
