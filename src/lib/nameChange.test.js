import assert from "node:assert/strict";
import test from "node:test";
import {
  getNameChangeExpiry,
  isNameChangeExpired,
  normalizeManagedAccountNames,
  planManagedAccountNameChange,
} from "./nameChange.js";

const now = new Date("2026-09-30T12:00:00.000Z");

function account(overrides = {}) {
  return {
    username: "old.user",
    display_name: "Old User",
    temp_user_name: null,
    temp_screen_name: null,
    name_changed_at: null,
    ...overrides,
  };
}

test("normalizes and validates managed-account names", () => {
  assert.deepEqual(normalizeManagedAccountNames({ username: "@New.User", displayName: " New User " }), {
    username: "new.user",
    displayName: "New User",
  });
  assert.throws(() => normalizeManagedAccountNames({ username: "bad name", displayName: "New User" }), /letters/);
  assert.throws(() => normalizeManagedAccountNames({ username: "new.user", displayName: " " }), /display name/);
});

test("treats an unchanged save as a no-op without cooldown metadata", () => {
  const plan = planManagedAccountNameChange({ current: account(), next: { username: "old.user", displayName: "Old User" }, now });
  assert.equal(plan.status, "noop");
  assert.deepEqual(plan.updates, {});
});

test("stores only changed previous values and one shared timestamp", () => {
  const plan = planManagedAccountNameChange({ current: account(), next: { username: "new.user", displayName: "New User" }, now });
  assert.equal(plan.status, "change");
  assert.deepEqual(plan.updates, { username: "new.user", display_name: "New User" });
  assert.equal(plan.changedUsername, true);
  assert.equal(plan.changedDisplayName, true);
  assert.deepEqual(plan.previousValues, { temp_user_name: "old.user", temp_screen_name: "Old User" });
  assert.equal(plan.nextEligibleAt.toISOString(), "2026-10-30T12:00:00.000Z");
});

test("recognizes a shared cooldown after either field changes", () => {
  const changedAt = "2026-09-20T12:00:00.000Z";
  const plan = planManagedAccountNameChange({ current: account({ name_changed_at: changedAt }), next: { username: "new.user", displayName: "Old User" }, now });
  assert.equal(plan.status, "blocked");
  assert.equal(plan.nextEligibleAt.toISOString(), "2026-10-20T12:00:00.000Z");
});

test("expires and lazily clears temporary metadata without extending cooldown", () => {
  const changedAt = "2026-08-31T12:00:00.000Z";
  const plan = planManagedAccountNameChange({
    current: account({ temp_user_name: "Old User", temp_screen_name: "Old Screen", name_changed_at: changedAt }),
    next: { username: "old.user", displayName: "Old User" },
    now,
  });
  assert.equal(isNameChangeExpired(changedAt, now), true);
  assert.equal(getNameChangeExpiry(changedAt, now).toISOString(), "2026-09-30T12:00:00.000Z");
  assert.equal(plan.status, "cleanup");
  assert.deepEqual(plan.updates, { temp_user_name: null, temp_screen_name: null, name_changed_at: null });
});

test("a changed username does not expose an unchanged display-name value", () => {
  const plan = planManagedAccountNameChange({ current: account(), next: { username: "new.user", displayName: "Old User" }, now });
  assert.equal(plan.status, "change");
  assert.equal(plan.changedUsername, true);
  assert.equal(plan.changedDisplayName, false);
  assert.deepEqual(plan.previousValues, { temp_user_name: "old.user", temp_screen_name: null });
});
