import test from "node:test";
import assert from "node:assert/strict";
import { getAvatarCropBounds, MAX_AVATAR_UPLOAD_BYTES, validateAvatarDimensions, validateAvatarFile } from "./avatarImage.js";

test("validates image uploads and rejects unsupported input sizes", () => {
  assert.equal(validateAvatarFile({ type: "image/jpeg", size: 1024 }), "");
  assert.match(validateAvatarFile({ type: "text/plain", size: 10 }), /image file/);
  assert.match(validateAvatarFile({ type: "image/png", size: MAX_AVATAR_UPLOAD_BYTES + 1 }), /smaller than 10 MB/);
});

test("makes a centered square crop for a wide image", () => {
  assert.deepEqual(getAvatarCropBounds(1200, 800), { x: 200, y: 0, size: 800 });
});

test("supports zoom and moving the square crop within the source image", () => {
  assert.deepEqual(getAvatarCropBounds(1200, 800, 2, 100, 50), { x: 800, y: 200, size: 400 });
});

test("rejects invalid image dimensions", () => {
  assert.throws(() => getAvatarCropBounds(0, 800), /invalid dimensions/);
  assert.match(validateAvatarDimensions(10_000, 6_000), /too large to crop/);
});
