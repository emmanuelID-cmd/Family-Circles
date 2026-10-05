import assert from "node:assert/strict";
import test from "node:test";
import { getProfileReels } from "./profileReels.js";

test("returns a stable clip assignment for the same profile ID", () => {
  assert.deepEqual(getProfileReels("profile-123"), getProfileReels("profile-123"));
});

test("returns all ten unique local clips for each profile", () => {
  const clips = getProfileReels("profile-456");

  assert.equal(clips.length, 10);
  assert.equal(new Set(clips.map((clip) => clip.id)).size, 10);
  for (const clip of clips) {
    assert.match(clip.id, /^reel-(0[1-9]|10)$/);
    assert.match(clip.src, /^\/assets\/reel-(0[1-9]|10)\.mp4$/);
  }
});

test("returns no clips when no stable profile ID is provided", () => {
  assert.deepEqual(getProfileReels(""), []);
  assert.deepEqual(getProfileReels(null), []);
});
