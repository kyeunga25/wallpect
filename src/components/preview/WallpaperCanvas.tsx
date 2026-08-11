import { useEffect, useRef, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import { calculatePinchScale, clampTransform, clampTransformForImage } from "../../core/fit";
import { renderWallpaper } from "../../core/renderer";
import { useI18n } from "../../i18n/i18n";
import { useEditor } from "../../state/editor-context";
import { DEFAULT_TRANSFORM } from "../../types/editor";

type DragState = { pointerId: number; x: number; y: number } | null;
type PinchState = { distance: number; scale: number } | null;

function pointerDistance(points: { x: number; y: number }[]) {
  if (points.length < 2) return 0;
  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
}

export function WallpaperCanvas() {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<PinchState>(null);
  const wheelCommitTimerRef = useRef<number | null>(null);
  const {
    image,
    transform,
    showOriginalComposition,
    setTransform,
    beginTransformEdit,
    commitTransformEdit,
    backgroundMode,
    backgroundColor,
    orientedDevice,
    resetTransform,
    centerTransform,
  } = useEditor();
  const previewTransform = showOriginalComposition ? DEFAULT_TRANSFORM : transform;
  const clampForCurrentImage = (next: typeof transform) =>
    image && image.width > 0 && image.height > 0
      ? clampTransformForImage(
          image.width,
          image.height,
          orientedDevice.outputWidth,
          orientedDevice.outputHeight,
          next,
        )
      : clampTransform(next);

  useEffect(
    () => () => {
      if (wheelCommitTimerRef.current !== null) {
        window.clearTimeout(wheelCommitTimerRef.current);
      }
      commitTransformEdit();
    },
    [commitTransformEdit],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !image) return;
    const draw = () => {
      const bounds = wrap.getBoundingClientRect();
      const density = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.max(1, Math.round(bounds.width * density));
      const height = Math.max(1, Math.round(bounds.height * density));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const context = canvas.getContext("2d");
      if (context)
        renderWallpaper(context, {
          width,
          height,
          image,
          transform: previewTransform,
          backgroundMode,
          backgroundColor,
        });
    };
    const observer = new ResizeObserver(draw);
    observer.observe(wrap);
    draw();
    return () => observer.disconnect();
  }, [backgroundColor, backgroundMode, image, previewTransform]);

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (wheelCommitTimerRef.current !== null) {
      window.clearTimeout(wheelCommitTimerRef.current);
      wheelCommitTimerRef.current = null;
    }
    if (pointersRef.current.size === 0) beginTransformEdit();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    if (pointersRef.current.size === 2) {
      pinchRef.current = {
        distance: pointerDistance([...pointersRef.current.values()]),
        scale: transform.scale,
      };
    }
  }

  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const previous = dragRef.current;
    const wrap = wrapRef.current;
    if (!wrap || !pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const distance = pointerDistance([...pointersRef.current.values()]);
      const nextScale = calculatePinchScale(
        pinchRef.current.scale,
        pinchRef.current.distance,
        distance,
      );
      setTransform((current) => clampForCurrentImage({ ...current, scale: nextScale }));
      return;
    }
    if (!previous || previous.pointerId !== event.pointerId) return;
    const bounds = wrap.getBoundingClientRect();
    const deltaX = (event.clientX - previous.x) / bounds.width;
    const deltaY = (event.clientY - previous.y) / bounds.height;
    dragRef.current = { ...previous, x: event.clientX, y: event.clientY };
    setTransform((current) =>
      clampForCurrentImage({
        ...current,
        translateX: current.translateX + deltaX,
        translateY: current.translateY + deltaY,
      }),
    );
  }

  function pointerEnd(event: PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId);
    pinchRef.current = null;
    const remaining = [...pointersRef.current.entries()][0];
    dragRef.current = remaining ? { pointerId: remaining[0], ...remaining[1] } : null;
    if (!remaining) commitTransformEdit();
  }

  function wheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    beginTransformEdit();
    const factor = Math.exp(-event.deltaY * 0.0015);
    setTransform((current) => clampForCurrentImage({ ...current, scale: current.scale * factor }));
    if (wheelCommitTimerRef.current !== null) {
      window.clearTimeout(wheelCommitTimerRef.current);
    }
    if (pointersRef.current.size === 0) {
      wheelCommitTimerRef.current = window.setTimeout(() => {
        wheelCommitTimerRef.current = null;
        commitTransformEdit();
      }, 180);
    }
  }

  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 0.025 : 0.008;
    if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "-", "=", "r", "R", "0"].includes(
        event.key,
      )
    )
      event.preventDefault();
    if (event.key === "ArrowLeft")
      setTransform((current) =>
        clampForCurrentImage({ ...current, translateX: current.translateX - step }),
      );
    if (event.key === "ArrowRight")
      setTransform((current) =>
        clampForCurrentImage({ ...current, translateX: current.translateX + step }),
      );
    if (event.key === "ArrowUp")
      setTransform((current) =>
        clampForCurrentImage({ ...current, translateY: current.translateY - step }),
      );
    if (event.key === "ArrowDown")
      setTransform((current) =>
        clampForCurrentImage({ ...current, translateY: current.translateY + step }),
      );
    if (["+", "="].includes(event.key))
      setTransform((current) => clampForCurrentImage({ ...current, scale: current.scale * 1.05 }));
    if (event.key === "-")
      setTransform((current) => clampForCurrentImage({ ...current, scale: current.scale / 1.05 }));
    if (["r", "R"].includes(event.key)) resetTransform();
    if (event.key === "0") centerTransform();
  }

  return (
    <div
      ref={wrapRef}
      className="wallpaper-canvas-wrap"
      tabIndex={0}
      role="application"
      data-composition-view={showOriginalComposition ? "original" : "edited"}
      aria-label={t(
        showOriginalComposition
          ? "Original composition preview. Start editing to return to your edited composition."
          : "Wallpaper canvas. Drag to reposition, scroll to zoom, use arrow keys to move.",
      )}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerEnd}
      onPointerCancel={pointerEnd}
      onWheel={wheel}
      onDoubleClick={resetTransform}
      onKeyDown={keyDown}
    >
      {image ? (
        <canvas ref={canvasRef} />
      ) : (
        <div className="canvas-empty">
          <strong>{t("Choose an image")}</strong>
          <span>PNG, JPEG, or WebP</span>
        </div>
      )}
    </div>
  );
}
