import test from "node:test";
import assert from "node:assert/strict";
import { getUserProfileRoute } from "./profileRoute.js";

test("reads a username from the profile route", () => {
  assert.equal(getUserProfileRoute("#/user/maya.chen"), "maya.chen");
});

test("decodes an encoded username", () => {
  assert.equal(getUserProfileRoute("#/user/maya%2Echen"), "maya.chen");
});

test("returns null for routes that are not user profiles", () => {
  assert.equal(getUserProfileRoute("#/"), null);
  assert.equal(getUserProfileRoute("#/user/"), null);
});

test("returns null rather than throwing on malformed encoding", () => {
  assert.equal(getUserProfileRoute("#/user/%"), null);
});
