import assert from "node:assert/strict";
import test from "node:test";
import { validateCircleNames } from "./circleNames.js";

test("trims and accepts multiple circle names", () => {
  assert.deepEqual(validateCircleNames(" Family, Friends ", [], 10), {
    names: ["Family", "Friends"],
    error: "",
  });
});

test("rejects blank comma-separated entries", () => {
  assert.match(validateCircleNames("Family,,Friends", [], 10).error, /empty entries/);
});

test("rejects repeated names without regard to case", () => {
  assert.match(validateCircleNames("Family,family", [], 10).error, /unique/);
});

test("rejects a name that already exists without regard to case", () => {
  assert.match(validateCircleNames("family", ["Family"], 10).error, /unique/);
});

test("rejects names longer than 40 characters", () => {
  assert.match(validateCircleNames("x".repeat(41), [], 10).error, /40 characters/);
});

test("rejects a batch that exceeds the remaining free-circle slots", () => {
  assert.match(validateCircleNames("Family,Friends", ["Work"], 1).error, /add 1 more circle/);
});

test("accepts exactly the remaining free-circle slots", () => {
  assert.deepEqual(validateCircleNames("Family,Friends", ["Work"], 2), {
    names: ["Family", "Friends"],
    error: "",
  });
});
