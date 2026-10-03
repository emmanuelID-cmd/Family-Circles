import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createServer } from "vite";

// The module is loaded through Vite because its Supabase client uses import.meta.env.
// All data operations below replace the client's query method before invocation.
const previousUrl = process.env.VITE_SUPABASE_URL;
const previousKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
process.env.VITE_SUPABASE_URL = "https://example.supabase.co";
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "test-only-publishable-key";
const server = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false }, appType: "custom" });
const { toPerson, replaceCircleMemberships } = await server.ssrLoadModule("/src/lib/familyData.js");
const { supabase } = await server.ssrLoadModule("/src/lib/supabase.js");
const originalFrom = supabase.from;

after(async () => {
  supabase.from = originalFrom;
  await server.close();
  if (previousUrl === undefined) delete process.env.VITE_SUPABASE_URL;
  else process.env.VITE_SUPABASE_URL = previousUrl;
  if (previousKey === undefined) delete process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  else process.env.VITE_SUPABASE_PUBLISHABLE_KEY = previousKey;
});

function personRow(overrides = {}) {
  return {
    id: "person-a",
    username: "old.name",
    display_name: "Old Name",
    avatar_url: "data:image/svg+xml,avatar-a",
    follower_count: 12,
    following_count: 8,
    post_count: 3,
    is_verified: false,
    ...overrides,
  };
}

function memoryCircleMembers(initialRows) {
  const rows = initialRows.map((row) => ({ ...row }));
  const operations = [];
  return {
    rows,
    operations,
    from(table) {
      assert.equal(table, "circle_members", "Circle edits must not update follow relationships");
      const query = {
        action: null,
        filters: [],
        records: [],
        delete() { this.action = "delete"; return this; },
        insert(records) { this.action = "insert"; this.records = records; return this; },
        eq(column, value) { this.filters.push((row) => row[column] === value); return this; },
        in(column, values) { this.filters.push((row) => values.includes(row[column])); return this; },
        select() { return this; },
        then(resolve, reject) {
          operations.push({ action: this.action, filters: this.filters.length, records: this.records });
          if (this.action === "delete") {
            const removed = [];
            for (let index = rows.length - 1; index >= 0; index--) {
              if (this.filters.every((filter) => filter(rows[index]))) removed.push(...rows.splice(index, 1));
            }
            return Promise.resolve({ data: removed, error: null }).then(resolve, reject);
          }
          if (this.action === "insert") {
            rows.push(...this.records);
            return Promise.resolve({ data: this.records, error: null }).then(resolve, reject);
          }
          return Promise.resolve({ data: [], error: null }).then(resolve, reject);
        },
      };
      return query;
    },
  };
}

test("current labels retain stable avatar and overlapping Circle IDs after a name change", () => {
  const memberships = [
    { circle_id: "family", person_id: "person-a" },
    { circle_id: "friends", person_id: "person-a" },
    { circle_id: "family", person_id: "person-b" },
  ];
  const accountState = { account_follows_person: true };
  const before = toPerson(personRow(), 0, memberships, [], accountState);
  const afterRename = toPerson(personRow({ username: "new.name", display_name: "New Name" }), 0, memberships, [], accountState);

  assert.equal(afterRename.id, before.id);
  assert.equal(afterRename.avatarUrl, before.avatarUrl);
  assert.deepEqual(afterRename.circles, ["family", "friends"]);
  assert.equal(afterRename.name, "New Name");
  assert.equal(afterRename.handle, "@new.name");
  assert.equal(afterRename.hostFollows, true);
});

test("Circle edits change only targeted memberships, preserving follows and other circles", async () => {
  const memory = memoryCircleMembers([
    { account_id: "host-a", person_id: "person-a", circle_id: "family" },
    { account_id: "host-a", person_id: "person-a", circle_id: "friends" },
    { account_id: "host-a", person_id: "person-b", circle_id: "family" },
    { account_id: "host-b", person_id: "person-a", circle_id: "family" },
  ]);
  supabase.from = memory.from;
  try {
    await replaceCircleMemberships("host-a", ["person-a"], { "person-a": ["friends", "work"] }, [
      { id: "person-a", circles: ["family", "friends"], hostFollows: true },
      { id: "person-b", circles: ["family"], hostFollows: true },
    ]);
    assert.deepEqual(memory.rows.filter((row) => row.account_id === "host-a" && row.person_id === "person-a").map((row) => row.circle_id).sort(), ["friends", "work"]);
    assert.deepEqual(memory.rows.filter((row) => row.person_id === "person-b"), [{ account_id: "host-a", person_id: "person-b", circle_id: "family" }]);
    assert.deepEqual(memory.rows.filter((row) => row.account_id === "host-b"), [{ account_id: "host-b", person_id: "person-a", circle_id: "family" }]);
    assert.deepEqual(memory.operations.map((operation) => operation.action), ["delete", "insert"]);
  } finally {
    supabase.from = originalFrom;
  }
});

test("an absent draft entry cannot silently clear a selected person's circles", async () => {
  const memory = memoryCircleMembers([{ account_id: "host-a", person_id: "person-a", circle_id: "family" }]);
  supabase.from = memory.from;
  try {
    await replaceCircleMemberships("host-a", ["person-a"], {}, [{ id: "person-a", circles: ["family"], hostFollows: true }]);
    assert.deepEqual(memory.rows, [{ account_id: "host-a", person_id: "person-a", circle_id: "family" }]);
    assert.deepEqual(memory.operations, []);
  } finally {
    supabase.from = originalFrom;
  }
});

test("explicit Circle removal leaves app-local following untouched", async () => {
  const memory = memoryCircleMembers([{ account_id: "host-a", person_id: "person-a", circle_id: "family" }]);
  supabase.from = memory.from;
  try {
    await replaceCircleMemberships("host-a", ["person-a"], { "person-a": [] }, [{ id: "person-a", circles: ["family"], hostFollows: true }]);
    assert.deepEqual(memory.rows, []);
    assert.deepEqual(memory.operations.map((operation) => operation.action), ["delete"]);
  } finally {
    supabase.from = originalFrom;
  }
});
