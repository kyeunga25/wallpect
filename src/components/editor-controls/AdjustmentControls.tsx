import { useRef } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Focus,
  Redo2,
  RotateCcw,
  Undo2,
} from "lucide-react";
import { clampTransform, clampTransformForImage } from "../../core/fit";
import { pixelsToNormalized, normalizedToPixels } from "../../core/transforms";
import { useI18n } from "../../i18n/i18n";
import { useEditor } from "../../state/editor-context";
import type { BackgroundMode, FitMode, ImageTransform } from "../../types/editor";
import { IconButton, PanelSection, RangeControl, Segmented } from "../ui";
import { CompositionFeedback } from "./CompositionFeedback";
import { ContentPositionControls } from "./ContentPositionControls";

export function AdjustmentControls() {
  const { t } = useI18n();
  const {
    image,
    transform,
    setTransform,
    beginTransformEdit,
    commitTransformEdit,
    canUndoTransform,
    canRedoTransform,
    undoTransform,
    redoTransform,
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
  const backgroundControlRef = useRef<HTMLFieldSetElement>(null);
  const clampForCurrentImage = (next: ImageTransform) =>
    image && image.width > 0 && image.height > 0
      ? clampTransformForImage(
          image.width,
          image.height,
          orientedDevice.outputWidth,
          orientedDevice.outputHeight,
          next,
        )
      : clampTransform(next);
  const revealBackgroundControl = () => {
    backgroundControlRef.current?.scrollIntoView?.({ block: "nearest" });
  };
  const nudgePosition = (axis: "x" | "y", pixels: number) => {
    const dimension = axis === "x" ? orientedDevice.outputWidth : orientedDevice.outputHeight;
    setTransform((current) =>
      clampForCurrentImage({
        ...current,
        [axis === "x" ? "translateX" : "translateY"]:
          current[axis === "x" ? "translateX" : "translateY"] +
          pixelsToNormalized(pixels, dimension),
      }),
    );
  };
  return (
    <PanelSection title={t("Adjust")} className="adjust-section">
      <CompositionFeedback onShowWholeImage={revealBackgroundControl} />
      <Segmented<FitMode>
        value={transform.fitMode}
        onChange={(fitMode) => setTransform((current) => ({ ...current, fitMode }))}
        label={t("Wallpaper fit mode")}
        options={[
          { value: "cover", label: t("Fill") },
          { value: "contain", label: t("Fit") },
        ]}
      />
      <ContentPositionControls />
      <fieldset ref={backgroundControlRef} className="background-control">
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
      <div className="nudge-control quick-position-control">
        <div className="nudge-heading">
          <strong>{t("Quick position")}</strong>
          <span>{t("10% per tap")}</span>
        </div>
        <div
          className="nudge-buttons quick-position-buttons"
          role="group"
          aria-label={t("Quick position")}
          style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}
        >
          <button
            type="button"
            className="secondary-button"
            disabled={!image}
            aria-label={t("Center image")}
            title={t("Center image")}
            onClick={centerTransform}
          >
            <span>{t("Center")}</span>
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={!image}
            aria-label={t("Move image up 10%")}
            title={t("Move image up 10%")}
            onClick={() => nudgePosition("y", orientedDevice.outputHeight * -0.1)}
          >
            <span>{t("Up")}</span>
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={!image}
            aria-label={t("Move image down 10%")}
            title={t("Move image down 10%")}
            onClick={() => nudgePosition("y", orientedDevice.outputHeight * 0.1)}
          >
            <span>{t("Down")}</span>
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={!image}
            aria-label={t("Move image left 10%")}
            title={t("Move image left 10%")}
            onClick={() => nudgePosition("x", orientedDevice.outputWidth * -0.1)}
          >
            <span>{t("Left")}</span>
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={!image}
            aria-label={t("Move image right 10%")}
            title={t("Move image right 10%")}
            onClick={() => nudgePosition("x", orientedDevice.outputWidth * 0.1)}
          >
            <span>{t("Right")}</span>
          </button>
        </div>
      </div>
      <RangeControl
        label={t("Zoom")}
        value={transform.scale * 100}
        min={25}
        max={400}
        step={1}
        unit="%"
        onChange={(value) => setTransform((current) => ({ ...current, scale: value / 100 }))}
        onInteractionStart={beginTransformEdit}
        onInteractionEnd={commitTransformEdit}
      />
      <div className="button-pair">
        <button type="button" className="secondary-button" onClick={resetTransform}>
          <RotateCcw size={16} /> {t("Reset")}
        </button>
        <button type="button" className="secondary-button" onClick={centerTransform}>
          <Focus size={16} /> {t("Center")}
        </button>
      </div>
      <div
        className="history-controls"
        role="group"
        aria-label={t("Composition history")}
        style={{ marginTop: 10 }}
      >
        <button
          type="button"
          disabled={!canUndoTransform}
          aria-label={t("Undo last composition change")}
          aria-keyshortcuts="Control+Z Meta+Z"
          title={t("Undo last composition change")}
          onClick={undoTransform}
        >
          <Undo2 />
          <span>{t("Undo")}</span>
          <kbd aria-hidden="true">⌘Z</kbd>
        </button>
        <button
          type="button"
          disabled={!canRedoTransform}
          aria-label={t("Redo last composition change")}
          aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z Control+Y"
          title={t("Redo last composition change")}
          onClick={redoTransform}
        >
          <Redo2 />
          <span>{t("Redo")}</span>
          <kbd aria-hidden="true">⇧⌘Z</kbd>
        </button>
      </div>
      <p className="history-help">
        {t("Fit, zoom, position, and rotation history is kept for this device and orientation.")}
      </p>
      <details className="disclosure precision-controls">
        <summary style={{ minHeight: 44 }}>
          <strong>{t("Precise controls")}</strong>
          <small>{t("Exact X/Y, one-pixel nudging, and rotation")}</small>
          <output
            aria-label={t("Current precise values")}
            style={{
              display: "block",
              margin: "4px 0 0 5px",
              color: "var(--muted)",
              fontSize: 10,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            X {xPixels} · Y {yPixels} · {transform.rotationDeg}°
          </output>
        </summary>
        <div className="disclosure-body precision-controls-body">
          <div className="position-control">
            <strong>{t("Position")}</strong>
            <label>
              X{" "}
              <span>
                <input
                  type="number"
                  value={xPixels}
                  step={1}
                  onFocus={beginTransformEdit}
                  onBlur={commitTransformEdit}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                  }}
                  onChange={(event) =>
                    setTransform((current) =>
                      clampForCurrentImage({
                        ...current,
                        translateX: pixelsToNormalized(
                          Number(event.target.value),
                          orientedDevice.outputWidth,
                        ),
                      }),
                    )
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
                  onFocus={beginTransformEdit}
                  onBlur={commitTransformEdit}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                  }}
                  onChange={(event) =>
                    setTransform((current) =>
                      clampForCurrentImage({
                        ...current,
                        translateY: pixelsToNormalized(
                          Number(event.target.value),
                          orientedDevice.outputHeight,
                        ),
                      }),
                    )
                  }
                />
                <i>px</i>
              </span>
            </label>
          </div>
          <div className="nudge-control">
            <div className="nudge-heading">
              <strong>{t("Fine position")}</strong>
              <span>{t("1 px per tap")}</span>
            </div>
            <div className="nudge-buttons" role="group" aria-label={t("Fine position")}>
              <IconButton label={t("Move left 1 px")} onClick={() => nudgePosition("x", -1)}>
                <ArrowLeft />
              </IconButton>
              <IconButton label={t("Move up 1 px")} onClick={() => nudgePosition("y", -1)}>
                <ArrowUp />
              </IconButton>
              <IconButton label={t("Move down 1 px")} onClick={() => nudgePosition("y", 1)}>
                <ArrowDown />
              </IconButton>
              <IconButton label={t("Move right 1 px")} onClick={() => nudgePosition("x", 1)}>
                <ArrowRight />
              </IconButton>
            </div>
          </div>
          <RangeControl
            label={t("Rotate")}
            value={transform.rotationDeg}
            min={-180}
            max={180}
            step={1}
            unit="°"
            onChange={(rotationDeg) => setTransform((current) => ({ ...current, rotationDeg }))}
            onInteractionStart={beginTransformEdit}
            onInteractionEnd={commitTransformEdit}
          />
        </div>
      </details>
    </PanelSection>
  );
}
