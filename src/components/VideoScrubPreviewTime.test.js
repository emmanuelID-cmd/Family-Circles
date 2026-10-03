import assert from "node:assert/strict";
import test from "node:test";
import { clampPreviewTime, formatPreviewTime } from "./VideoScrubPreviewTime.js";

test("preview clock formats finite and invalid times", () => {
  assert.equal(formatPreviewTime(0), "0:00");
  assert.equal(formatPreviewTime(61.9), "1:01");
  assert.equal(formatPreviewTime(-8), "0:00");
  assert.equal(formatPreviewTime(Number.NaN), "0:00");
});

test("preview time stays inside valid media duration", () => {
  assert.equal(clampPreviewTime(17, 30), 17);
  assert.equal(clampPreviewTime(-5, 30), 0);
  assert.equal(clampPreviewTime(45, 30), 30);
  assert.equal(clampPreviewTime(Number.NaN, 30), 0);
  assert.equal(clampPreviewTime(5, 0), null);
  assert.equal(clampPreviewTime(5, Number.POSITIVE_INFINITY), null);
});
