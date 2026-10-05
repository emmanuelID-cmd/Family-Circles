import assert from "node:assert/strict";
import test from "node:test";
import {
  changeSavedVideoSpeed,
  DEFAULT_VIDEO_SPEED,
  getEffectiveVideoSpeed,
  isValidVideoSpeed,
  readPersistedVideoSpeed,
  VIDEO_SPEED_OPTIONS,
  writePersistedVideoSpeed,
} from "./videoSpeed.js";

test("exposes exactly the approved speed choices and default", () => {
  assert.deepEqual(VIDEO_SPEED_OPTIONS, [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3]);
  assert.equal(DEFAULT_VIDEO_SPEED, 1);
  for (const speed of VIDEO_SPEED_OPTIONS) assert.equal(isValidVideoSpeed(speed), true);
  for (const speed of [0, 0.3, 4, "1", NaN, Infinity, null]) assert.equal(isValidVideoSpeed(speed), false);
});

test("reads and writes a valid speed using only caller-provided storage and key", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };

  assert.equal(readPersistedVideoSpeed(storage, "chosen-key"), 1);
  assert.equal(writePersistedVideoSpeed(storage, "chosen-key", 1.75), true);
  assert.equal(values.get("chosen-key"), "1.75");
  assert.equal(readPersistedVideoSpeed(storage, "chosen-key"), 1.75);
  assert.equal(values.size, 1);
});

test("falls back safely for invalid stored values, unsupported storage, and storage failures", () => {
  const invalid = { getItem: () => "not-a-speed", setItem: () => {} };
  const failing = {
    getItem: () => { throw new Error("unavailable"); },
    setItem: () => { throw new Error("unavailable"); },
  };

  assert.equal(readPersistedVideoSpeed(invalid, "speed"), 1);
  assert.equal(readPersistedVideoSpeed(failing, "speed"), 1);
  assert.equal(readPersistedVideoSpeed(null, "speed"), 1);
  assert.equal(readPersistedVideoSpeed(invalid, ""), 1);
  assert.equal(writePersistedVideoSpeed(failing, "speed", 2), false);
  assert.equal(writePersistedVideoSpeed(null, "speed", 2), false);
  assert.equal(writePersistedVideoSpeed(invalid, "", 2), false);
  assert.equal(writePersistedVideoSpeed(invalid, "speed", 2.5), false);
});

test("playing right-hold is temporary 2x and release restores even a saved 3x", () => {
  assert.equal(getEffectiveVideoSpeed(3, { isPlaying: true }), 3);
  assert.equal(getEffectiveVideoSpeed(3, { isPlaying: true, rightHold: true }), 2);
  assert.equal(getEffectiveVideoSpeed(3, { isPlaying: true, rightHold: false }), 3);
  assert.equal(getEffectiveVideoSpeed(3, { isPlaying: false, rightHold: true }), 3);
  assert.equal(getEffectiveVideoSpeed(999, { isPlaying: true }), 1);
});

test("changing saved speed preserves playback state, including pause", () => {
  const paused = { isPlaying: false, savedSpeed: 1, currentTime: 8 };
  const changed = changeSavedVideoSpeed(paused, 1.5);
  assert.deepEqual(changed, { isPlaying: false, savedSpeed: 1.5, currentTime: 8 });
  assert.deepEqual(paused, { isPlaying: false, savedSpeed: 1, currentTime: 8 });
  assert.equal(changeSavedVideoSpeed(changed, 2.5), changed);
});
