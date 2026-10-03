export const AVATAR_OUTPUT_SIZE = 256;
export const MAX_AVATAR_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_AVATAR_DIMENSION = 12_000;
const MAX_AVATAR_PIXELS = 50_000_000;

export function validateAvatarFile(file) {
  if (!file || !file.type?.startsWith("image/")) {
    return "Choose an image file to use as your avatar.";
  }
  if (file.size > MAX_AVATAR_UPLOAD_BYTES) {
    return "Choose an image smaller than 10 MB.";
  }
  return "";
}

export function validateAvatarDimensions(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return "The selected image has invalid dimensions.";
  }
  if (width > MAX_AVATAR_DIMENSION || height > MAX_AVATAR_DIMENSION || width * height > MAX_AVATAR_PIXELS) {
    return "This image is too large to crop. Choose an image under 50 megapixels.";
  }
  return "";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function getAvatarCropBounds(width, height, zoom = 1, positionX = 50, positionY = 50) {
  const validationError = validateAvatarDimensions(width, height);
  if (validationError) throw new Error(validationError);
  const safeZoom = clamp(Number(zoom) || 1, 1, 3);
  const size = Math.min(width, height) / safeZoom;
  return {
    x: (width - size) * clamp(Number(positionX) || 0, 0, 100) / 100,
    y: (height - size) * clamp(Number(positionY) || 0, 0, 100) / 100,
    size,
  };
}

export function createAvatarDataUrl(image, bounds) {
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not prepare this image.");
  context.drawImage(image, bounds.x, bounds.y, bounds.size, bounds.size, 0, 0, AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE);
  return canvas.toDataURL("image/webp", 0.86);
}
