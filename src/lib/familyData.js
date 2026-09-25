import { supabase } from "./supabase.js";

const colors = ["#d77658", "#5d7c78", "#756595", "#ce9b43", "#b55c7d", "#4d7bb5"];
const firstNames = ["Maya", "Jon", "Sofia", "Andre", "Nia", "Leo", "Avery", "Noor", "Mateo", "Ivy", "Riley", "Zoe"];
const lastNames = ["Chen", "Bell", "Reyes", "Lewis", "Patel", "Martin", "Brooks", "Davis", "Rivera", "Nguyen", "James"];
const notificationDefaults = { posts: "all", stories: "off", reels: "off", liveVideos: "off" };

function unwrap(result) {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

function numberInBand(index, bands) {
  const [low, high] = bands[index % bands.length];
  return low + ((index * 137 + 41) % (high - low + 1));
}

const syntheticPeople = Array.from({ length: 132 }, (_, index) => {
  const first = firstNames[index % firstNames.length];
  const last = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  const username = `${first}.${last}.${String(index + 1).padStart(3, "0")}`.toLowerCase();
  return {
    username,
    display_name: `${first} ${last}`,
    host_follows: index < 70,
    follows_host: index % 3 === 0 && index < 90,
    followed_by_host: index < 70 ? new Date(Date.UTC(2026, 0, 1 + index)).toISOString() : null,
    followed_host: index % 3 === 0 && index < 90 ? new Date(Date.UTC(2025, 8, 1 + index)).toISOString() : null,
    follower_count: numberInBand(index, [[10, 100], [101, 500], [501, 2000], [2000, 10000], [10000, 100000]]),
    following_count: numberInBand(index + 3, [[10, 100], [101, 500], [501, 2000]]),
    post_count: 4 + ((index * 19) % 286),
    is_verified: index < 46,
    pending_follow_request: index >= 90 && index < 102,
  };
});

function toPerson(row, index, membershipRows, followingRows = []) {
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
    following: row.following_count.toLocaleString(),
    posts: row.post_count.toLocaleString(),
    verified: row.is_verified,
    favorite: row.is_favorite,
    blocked: row.is_blocked,
    pendingRequest: row.pending_follow_request,
    dismissedAt: row.suggestion_dismissed_at,
    notifications: { ...notificationDefaults, ...(row.notification_settings || {}) },
    follows: followingRows.filter((following) => following.person_id === row.id).map((following) => following.followed_person_id),
  };
}

async function ensureSyntheticPeople() {
  const existing = unwrap(await supabase.from("people").select("id, username"));
  const existingUsernames = new Set(existing.map((person) => person.username));
  const missing = syntheticPeople.filter((person) => !existingUsernames.has(person.username));
  if (missing.length) unwrap(await supabase.from("people").insert(missing).select("id, username"));

  const allPeople = missing.length
    ? unwrap(await supabase.from("people").select("id, username").order("created_at", { ascending: true }))
    : existing;
  const seeded = allPeople.filter((person) => person.username.match(/\.\d{3}$/));
  const existingEdges = unwrap(await supabase.from("person_followings").select("person_id, followed_person_id").limit(1));
  if (!existingEdges.length && seeded.length >= 3) {
    const edges = seeded.flatMap((person, index) => [1, 7].map((offset) => ({ person_id: person.id, followed_person_id: seeded[(index + offset) % seeded.length].id })));
    unwrap(await supabase.from("person_followings").insert(edges));
  }
}

export async function loadFamilyData() {
  await ensureSyntheticPeople();
  const [peopleResult, circlesResult, membershipsResult, followingResult] = await Promise.all([
    supabase.from("people").select("*").order("created_at", { ascending: true }),
    supabase.from("circles").select("*").order("created_at", { ascending: true }),
    supabase.from("circle_members").select("circle_id, person_id"),
    supabase.from("person_followings").select("person_id, followed_person_id"),
  ]);
  const peopleRows = unwrap(peopleResult);
  const circleRows = unwrap(circlesResult);
  const membershipRows = unwrap(membershipsResult);
  const followingRows = unwrap(followingResult);
  return {
    people: peopleRows.map((row, index) => toPerson(row, index, membershipRows, followingRows)),
    circles: circleRows.map(({ id, name }) => ({ id, name })),
  };
}

export async function loadSuggestionsPage({ query = "", from = 0, size = 50 }) {
  const term = query.trim().toLowerCase().replace(/[^a-z0-9._ -]/g, "").slice(0, 80);
  const escaped = term.replace(/[,.()]/g, "\\$&").replace(/[%_]/g, "\\$&");
  let request = supabase.from("people").select("*", { count: "exact" }).eq("host_follows", false).eq("is_blocked", false).is("suggestion_dismissed_at", null).eq("pending_follow_request", false).order("created_at", { ascending: true }).range(from, from + size - 1);
  if (escaped) request = request.or(`username.ilike.%${escaped}%,display_name.ilike.%${escaped}%`);
  const result = await request;
  if (result.error) throw new Error(result.error.message);
  return { rows: result.data.map((row, index) => toPerson(row, from + index, [], [])), total: result.count || 0 };
}

export async function createCircle(rawName) {
  const name = rawName.trim();
  if (!name || name.length > 40) throw new Error("Circle names must be between 1 and 40 characters.");
  unwrap(await supabase.from("circles").insert({ name }).select("id").single());
}

export async function deleteCircles(ids) {
  if (!ids.length) return;
  unwrap(await supabase.from("circles").delete().in("id", ids).select("id"));
}

export async function createPerson({ username: rawUsername, displayName: rawDisplayName }) {
  const username = rawUsername.trim().replace(/^@/, "").toLowerCase();
  const displayName = rawDisplayName.trim();
  if (!/^[a-z0-9._]{1,30}$/.test(username)) throw new Error("Use 1–30 letters, numbers, periods, or underscores for the username.");
  if (!displayName || displayName.length > 80) throw new Error("Display names must be between 1 and 80 characters.");
  unwrap(await supabase.from("people").insert({ username, display_name: displayName, is_verified: true }).select("id").single());
}

export async function updateFollowing(ids, value) {
  if (!ids.length) return;
  if (!value) unwrap(await supabase.from("circle_members").delete().in("person_id", ids).select("person_id"));
  unwrap(await supabase.from("people").update({ host_follows: value, followed_by_host: value ? new Date().toISOString() : null, ...(value ? {} : { is_favorite: false }) }).in("id", ids).select("id"));
}

export async function setFavorites(ids, value) {
  if (!ids.length) return;
  const updates = value
    ? { is_favorite: true, host_follows: true, followed_by_host: new Date().toISOString() }
    : { is_favorite: false };
  unwrap(await supabase.from("people").update(updates).in("id", ids).select("id"));
}

export async function updatePeople(ids, updates) {
  if (!ids.length) return;
  unwrap(await supabase.from("people").update(updates).in("id", ids).select("id"));
}

export async function blockPeople(ids) {
  if (!ids.length) return;
  unwrap(await supabase.from("circle_members").delete().in("person_id", ids).select("person_id"));
  await updatePeople(ids, { is_blocked: true, is_favorite: false, host_follows: false, followed_by_host: null, pending_follow_request: false });
}

export async function replaceCircleMemberships(ids, draft, people) {
  const changes = ids.map((personId) => {
    const current = new Set(people.find((person) => person.id === personId)?.circles || []);
    const next = new Set(draft[personId] || []);
    return { personId, removed: [...current].filter((circleId) => !next.has(circleId)), added: [...next].filter((circleId) => !current.has(circleId)) };
  });
  for (const { personId, removed } of changes) if (removed.length) unwrap(await supabase.from("circle_members").delete().eq("person_id", personId).in("circle_id", removed).select("person_id"));
  for (const { personId, added } of changes) if (added.length) unwrap(await supabase.from("circle_members").insert(added.map((circleId) => ({ circle_id: circleId, person_id: personId }))));
}

export async function loadMessages(personId) {
  return unwrap(await supabase.from("messages").select("id, body, created_at").eq("person_id", personId).order("created_at", { ascending: true }));
}

export async function sendMessage(personId, rawBody) {
  const body = rawBody.trim();
  if (!body || body.length > 2000) throw new Error("Messages must contain 1–2,000 characters.");
  return unwrap(await supabase.from("messages").insert({ person_id: personId, body }).select("id, body, created_at").single());
}
