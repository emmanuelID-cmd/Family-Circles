import { supabase } from "./supabase.js";

const colors = ["#d77658", "#5d7c78", "#756595", "#ce9b43", "#b55c7d", "#4d7bb5"];

function unwrap(result) {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

function toPerson(row, index, membershipRows) {
  return {
    id: row.id,
    name: row.display_name,
    handle: `@${row.username}`,
    username: row.username,
    avatarUrl: row.avatar_url,
    circles: membershipRows.filter((membership) => membership.person_id === row.id).map((membership) => membership.circle_id),
    color: colors[index % colors.length],
    followsHost: row.follows_host,
    hostFollows: row.host_follows,
    followedByHost: row.followed_by_host,
    followedHost: row.followed_host,
    followers: row.follower_count.toLocaleString(),
    posts: row.post_count.toLocaleString(),
  };
}

export async function loadFamilyData() {
  const [peopleResult, circlesResult, membershipsResult] = await Promise.all([
    supabase.from("people").select("*").order("created_at", { ascending: true }),
    supabase.from("circles").select("*").order("created_at", { ascending: true }),
    supabase.from("circle_members").select("circle_id, person_id"),
  ]);

  const peopleRows = unwrap(peopleResult);
  const circleRows = unwrap(circlesResult);
  const membershipRows = unwrap(membershipsResult);

  return {
    people: peopleRows.map((row, index) => toPerson(row, index, membershipRows)),
    circles: circleRows.map(({ id, name }) => ({ id, name })),
  };
}

export async function createCircle(rawName) {
  const name = rawName.trim();
  if (!name || name.length > 40) throw new Error("Circle names must be between 1 and 40 characters.");
  unwrap(await supabase.from("circles").insert({ name }).select("id").single());
}

export async function createPerson({ username: rawUsername, displayName: rawDisplayName }) {
  const username = rawUsername.trim().replace(/^@/, "").toLowerCase();
  const displayName = rawDisplayName.trim();
  if (!/^[a-z0-9._]{1,30}$/.test(username)) throw new Error("Use 1–30 letters, numbers, periods, or underscores for the username.");
  if (!displayName || displayName.length > 80) throw new Error("Display names must be between 1 and 80 characters.");

  unwrap(await supabase.from("people").insert({ username, display_name: displayName }).select("id").single());
}

export async function updateFollowing(ids, value) {
  if (!ids.length) return;
  if (!value) {
    unwrap(await supabase.from("circle_members").delete().in("person_id", ids).select("person_id"));
  }
  const updates = { host_follows: value };
  if (value) updates.followed_by_host = new Date().toISOString();
  else updates.followed_by_host = null;
  unwrap(await supabase.from("people").update(updates).in("id", ids).select("id"));
}

export async function replaceCircleMemberships(ids, draft, people) {
  const changes = ids.map((personId) => {
    const current = new Set(people.find((person) => person.id === personId)?.circles || []);
    const next = new Set(draft[personId] || []);
    return {
      personId,
      removed: [...current].filter((circleId) => !next.has(circleId)),
      added: [...next].filter((circleId) => !current.has(circleId)),
    };
  });

  for (const { personId, removed } of changes) {
    if (removed.length) {
      unwrap(await supabase.from("circle_members").delete().eq("person_id", personId).in("circle_id", removed).select("person_id"));
    }
  }
  for (const { personId, added } of changes) {
    if (added.length) {
      unwrap(await supabase.from("circle_members").insert(added.map((circleId) => ({ circle_id: circleId, person_id: personId }))));
    }
  }
}
