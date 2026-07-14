import type { ImageAsset } from "../types/editor";

export const MAX_FILE_SIZE = 30 * 1024 * 1024;
export const MAX_LONG_EDGE = 12_000;
export const MAX_PIXEL_AREA = 72_000_000;
export const SUPPORTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export function validateImageFile(file: File) {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type))
    throw new Error("Choose a PNG, JPEG, or WebP image. HEIC is not supported yet.");
  if (file.size > MAX_FILE_SIZE)
    throw new Error("This image is larger than 30 MB. Compress it before using Wallpect.");
}

export async function decodeImageFile(file: File): Promise<ImageAsset> {
  validateImageFile(file);
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = objectUrl;
    await image.decode();
    if (
      Math.max(image.naturalWidth, image.naturalHeight) > MAX_LONG_EDGE ||
      image.naturalWidth * image.naturalHeight > MAX_PIXEL_AREA
    ) {
      throw new Error(
        "This image is too large for your browser to process safely. Resize it below 12,000 px on the longest side and 72 megapixels.",
      );
    }
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      name: file.name,
      size: file.size,
      objectUrl,
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    if (error instanceof Error) throw error;
    throw new Error("The image could not be decoded. Try exporting it again as PNG or JPEG.", {
      cause: error,
    });
  }
}

export async function decodeBundledImage(url: string): Promise<ImageAsset> {
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  await image.decode();
  return {
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    name: "sample-aurora-wallpaper.png",
    size: 0,
    isDemo: true,
  };
}
