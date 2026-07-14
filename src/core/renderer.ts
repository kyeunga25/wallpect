import { calculateFitScale, calculateRenderGeometry } from "./fit";
import type { BackgroundMode, ImageAsset, ImageTransform } from "../types/editor";

export interface RenderOptions {
  width: number;
  height: number;
  image: ImageAsset;
  transform: ImageTransform;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
}

function drawCenteredImage(
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  options: RenderOptions,
) {
  const { image, transform, width, height } = options;
  const geometry = calculateRenderGeometry(image.width, image.height, width, height, transform);
  context.save();
  context.translate(geometry.centerX, geometry.centerY);
  context.rotate((transform.rotationDeg * Math.PI) / 180);
  context.drawImage(
    image.source,
    -geometry.renderedWidth / 2,
    -geometry.renderedHeight / 2,
    geometry.renderedWidth,
    geometry.renderedHeight,
  );
  context.restore();
}

function drawBlurredBackground(
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  options: RenderOptions,
) {
  const { image, width, height } = options;
  const scale = calculateFitScale(image.width, image.height, width, height, "cover") * 1.08;
  const renderedWidth = image.width * scale;
  const renderedHeight = image.height * scale;
  context.save();
  context.filter = `blur(${Math.max(20, Math.round(Math.min(width, height) * 0.035))}px) brightness(0.74)`;
  context.drawImage(
    image.source,
    (width - renderedWidth) / 2,
    (height - renderedHeight) / 2,
    renderedWidth,
    renderedHeight,
  );
  context.restore();
}

export function renderWallpaper(
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  options: RenderOptions,
) {
  const { width, height, backgroundMode, backgroundColor } = options;
  context.clearRect(0, 0, width, height);
  if (backgroundMode === "solid") {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  } else if (backgroundMode === "blur") {
    drawBlurredBackground(context, options);
  }
  drawCenteredImage(context, options);
}

export function renderGuides(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  safeInsets: { top: number; right: number; bottom: number; left: number },
) {
  context.save();
  context.strokeStyle = "#9eff00";
  context.lineWidth = Math.max(2, width / 600);
  context.setLineDash([width / 80, width / 120]);
  context.strokeRect(
    safeInsets.left,
    safeInsets.top,
    width - safeInsets.left - safeInsets.right,
    height - safeInsets.top - safeInsets.bottom,
  );
  context.restore();
}
