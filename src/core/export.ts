import { renderGuides, renderWallpaper } from "./renderer";
import type { BackgroundMode, ExportFormat, ImageAsset, ImageTransform } from "../types/editor";
import type { Insets } from "../types/device";

export function extensionForFormat(format: ExportFormat) {
  return format === "jpeg" ? "jpg" : format;
}

export function generateFilename(
  slug: string,
  orientation: string,
  width: number,
  height: number,
  format: ExportFormat,
) {
  return `wallpect-${slug}-${orientation}-${width}x${height}.${extensionForFormat(format)}`;
}

function stripUnsafeFilenameCharacters(value: string) {
  return [...value]
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return !(
        codePoint <= 0x1f ||
        (codePoint >= 0x7f && codePoint <= 0x9f) ||
        (codePoint >= 0x202a && codePoint <= 0x202e) ||
        (codePoint >= 0x2066 && codePoint <= 0x2069)
      );
    })
    .join("");
}

export function ensureFilenameExtension(filename: string, format: ExportFormat) {
  const clean = stripUnsafeFilenameCharacters(
    filename
      .trim()
      .replace(/\.(png|jpe?g|webp)$/i, "")
      .replace(/[\\/]/g, "-"),
  ).slice(0, 180);
  return `${clean || "wallpect-wallpaper"}.${extensionForFormat(format)}`;
}

type ExportOptions = {
  width: number;
  height: number;
  image: ImageAsset;
  transform: ImageTransform;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  format: ExportFormat;
  quality: number;
  includeGuides: boolean;
  safeInsets: Insets;
};

export async function exportWallpaper(options: ExportOptions): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = options.width;
  canvas.height = options.height;
  const context = canvas.getContext("2d", { alpha: options.format !== "jpeg" });
  if (!context) throw new Error("Your browser could not create an export canvas.");
  renderWallpaper(context, options);
  if (options.includeGuides)
    renderGuides(context, options.width, options.height, options.safeInsets);
  const mime = `image/${options.format}`;
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, options.quality),
  );
  canvas.width = 1;
  canvas.height = 1;
  if (!blob)
    throw new Error(
      `Your browser could not export ${options.format.toUpperCase()}. Try PNG instead.`,
    );
  return blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
