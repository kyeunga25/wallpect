import { Focus, RotateCcw } from "lucide-react";
import { pixelsToNormalized, normalizedToPixels } from "../../core/transforms";
import { useI18n } from "../../i18n/i18n";
import { useEditor } from "../../state/editor-context";
import type { BackgroundMode, FitMode } from "../../types/editor";
import { PanelSection, RangeControl, Segmented } from "../ui";

export function AdjustmentControls() {
  const { t } = useI18n();
  const {
    transform,
    setTransform,
    orientedDevice,
    backgroundMode,
    setBackgroundMode,
    backgroundColor,
    setBackgroundColor,
    resetTransform,
    centerTransform,
  } = useEditor();
  const xPixels = normalizedToPixels(transform.translateX, orientedDevice.outputWidth);
  const yPixels = normalizedToPixels(transform.translateY, orientedDevice.outputHeight);
  return (
    <PanelSection title={t("Adjust")} className="adjust-section">
      <Segmented<FitMode>
        value={transform.fitMode}
        onChange={(fitMode) => setTransform((current) => ({ ...current, fitMode }))}
        label={t("Wallpaper fit mode")}
        options={[
          { value: "cover", label: t("Fill") },
          { value: "contain", label: t("Fit") },
        ]}
      />
      <RangeControl
        label={t("Zoom")}
        value={transform.scale * 100}
        min={25}
        max={400}
        step={1}
        unit="%"
        onChange={(value) => setTransform((current) => ({ ...current, scale: value / 100 }))}
      />
      <div className="position-control">
        <strong>{t("Position")}</strong>
        <label>
          X{" "}
          <span>
            <input
              type="number"
              value={xPixels}
              step={1}
              onChange={(event) =>
                setTransform((current) => ({
                  ...current,
                  translateX: pixelsToNormalized(
                    Number(event.target.value),
                    orientedDevice.outputWidth,
                  ),
                }))
              }
            />
            <i>px</i>
          </span>
        </label>
        <label>
          Y{" "}
          <span>
            <input
              type="number"
              value={yPixels}
              step={1}
              onChange={(event) =>
                setTransform((current) => ({
                  ...current,
                  translateY: pixelsToNormalized(
                    Number(event.target.value),
                    orientedDevice.outputHeight,
                  ),
                }))
              }
            />
            <i>px</i>
          </span>
        </label>
      </div>
      <RangeControl
        label={t("Rotate")}
        value={transform.rotationDeg}
        min={-180}
        max={180}
        step={1}
        unit="°"
        onChange={(rotationDeg) => setTransform((current) => ({ ...current, rotationDeg }))}
      />
      <fieldset className="background-control">
        <legend>{t("Background")}</legend>
        <Segmented<BackgroundMode>
          value={backgroundMode}
          onChange={setBackgroundMode}
          label={t("Canvas background")}
          options={[
            { value: "solid", label: t("Solid") },
            { value: "transparent", label: t("Transparent") },
            { value: "blur", label: t("Blur") },
          ]}
        />
        {backgroundMode === "solid" ? (
          <label className="color-field">
            <input
              type="color"
              value={backgroundColor}
              onChange={(event) => setBackgroundColor(event.target.value)}
            />
            <span>{backgroundColor.toUpperCase()}</span>
          </label>
        ) : (
          <p className="control-help">
            {t(
              backgroundMode === "blur"
                ? "A softened full-bleed copy fills uncovered areas."
                : "Transparency is preserved in PNG and WebP exports.",
            )}
          </p>
        )}
      </fieldset>
      <div className="button-pair">
        <button type="button" className="secondary-button" onClick={resetTransform}>
          <RotateCcw size={16} /> {t("Reset")}
        </button>
        <button type="button" className="secondary-button" onClick={centerTransform}>
          <Focus size={16} /> {t("Center")}
        </button>
      </div>
    </PanelSection>
  );
}
