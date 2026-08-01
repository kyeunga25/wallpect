import type { Buffer } from "node:buffer";

export type ImageDimensions = { width: number; height: number };

function jpegDimensions(bytes: Buffer): ImageDimensions {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error("Invalid JPEG signature");
  let offset = 2;
  const startOfFrameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);

  while (offset + 8 < bytes.length) {
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 1 >= bytes.length) break;
    const segmentLength = bytes.readUInt16BE(offset);
    if (startOfFrameMarkers.has(marker)) {
      return { height: bytes.readUInt16BE(offset + 3), width: bytes.readUInt16BE(offset + 5) };
    }
    if (segmentLength < 2) break;
    offset += segmentLength;
  }
  throw new Error("JPEG dimensions were not found");
}

function webpDimensions(bytes: Buffer): ImageDimensions {
  if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP")
    throw new Error("Invalid WebP signature");

  const chunk = bytes.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    return {
      width: bytes.readUIntLE(24, 3) + 1,
      height: bytes.readUIntLE(27, 3) + 1,
    };
  }
  if (chunk === "VP8L") {
    if (bytes[20] !== 0x2f) throw new Error("Invalid lossless WebP header");
    const dimensions = bytes.readUInt32LE(21);
    return {
      width: (dimensions & 0x3fff) + 1,
      height: ((dimensions >>> 14) & 0x3fff) + 1,
    };
  }
  if (chunk === "VP8 ") {
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a)
      throw new Error("Invalid lossy WebP header");
    return {
      width: bytes.readUInt16LE(26) & 0x3fff,
      height: bytes.readUInt16LE(28) & 0x3fff,
    };
  }
  throw new Error(`Unsupported WebP chunk: ${chunk}`);
}

export function imageDimensions(bytes: Buffer, format: "png" | "jpeg" | "webp") {
  if (format === "png") {
    if (bytes.toString("ascii", 1, 4) !== "PNG") throw new Error("Invalid PNG signature");
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  return format === "jpeg" ? jpegDimensions(bytes) : webpDimensions(bytes);
}
