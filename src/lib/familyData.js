import { supabase } from "./supabase.js";
import { parseAccountSearch } from "./search.js";
import { isNameChangeExpired, planManagedAccountNameChange } from "./nameChange.js";

const colors = ["#d77658", "#5d7c78", "#756595", "#ce9b43", "#b55c7d", "#4d7bb5"];
const firstNames = ["Maya", "Jon", "Sofia", "Andre", "Nia", "Leo", "Avery", "Noor", "Mateo", "Ivy", "Riley", "Zoe"];
const lastNames = ["Chen", "Bell", "Reyes", "Lewis", "Patel", "Martin", "Brooks", "Davis", "Rivera", "Nguyen", "James"];
const notificationDefaults = { posts: "all", stories: "off", reels: "off", liveVideos: "off" };
const managedAccountFields = "id, username, display_name, pronouns, avatar_url, is_default, temp_user_name, temp_screen_name, name_changed_at";

const avatarPalettes = ["#f4a261", "#a8dadc", "#cdb4db", "#ffd166", "#90be6d", "#f28482", "#84a59d", "#bde0fe", "#e9c46a", "#ffafcc", "#a3b18a", "#b8c0ff"];
const avatarKinds = ["face", "face", "face", "face", "face", "face", "cat", "flower", "planet", "fox", "cactus", "sun"];

function fictionalAvatar(seed) {
  const hash = [...String(seed || "new-user")].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);
  const kind = avatarKinds[hash % avatarKinds.length];
  const background = avatarPalettes[hash % avatarPalettes.length];
  const skin = ["#f1c7a5", "#8d5524", "#d8a47f", "#f2d3b3", "#b87352"][Math.floor(hash / 13) % 5];
  const hair = ["#34251f", "#171717", "#b86f3d", "#3d405b", "#583f2e"][Math.floor(hash / 29) % 5];
  const face = kind === "face";
  const faceStyle = Math.floor(hash / 7) % 4;
  const faceAccent = [
    `<path fill="${hair}" d="M29 36q3-19 21-20 17 1 21 18-11-8-22-7-11 0-20 9z"/>`,
    `<path fill="${hair}" d="M27 35q3-22 23-22 19 0 23 21l-5 37q-7 13-13 13l2-39q-12-8-27-1z"/>`,
    `<g fill="${hair}"><circle cx="34" cy="24" r="10"/><circle cx="48" cy="17" r="11"/><circle cx="63" cy="23" r="10"/><circle cx="72" cy="34" r="8"/></g>`,
    `<path fill="${hair}" d="M28 33q7-19 22-19t22 19v8q-22-11-44 0z"/><path d="M29 34q21 9 42 0" fill="none" stroke="#f4a261" stroke-width="4"/>`,
  ][faceStyle];
  const art = face
    ? `<path fill="${hair}" d="M25 37c0-18 10-29 25-29s25 11 25 29v11H25z"/><ellipse cx="50" cy="48" rx="20" ry="25" fill="${skin}"/><path fill="${hair}" d="M29 36c3-17 13-24 25-23 8 1 14 6 17 15-9-5-19-7-29-2-4 2-8 5-13 10z"/><circle cx="43" cy="48" r="2" fill="#29201e"/><circle cx="58" cy="48" r="2" fill="#29201e"/><path d="M45 59q5 4 10 0" fill="none" stroke="#9b4d48" stroke-width="2" stroke-linecap="round"/><path d="M28 100c2-20 11-31 22-31s20 11 22 31" fill="${hair}"/>`
    : kind === "cat" ? `<path fill="#f4f1de" d="M22 41 18 17l20 12q12-5 24 0l20-12-4 24q9 22-3 37-10 13-25 13T25 78q-12-15-3-37z"/><circle cx="40" cy="53" r="3" fill="#242424"/><circle cx="60" cy="53" r="3" fill="#242424"/><path d="m46 62 4 4 4-4m-4 4q-5 7-10 1m10-1q5 7 10 1" fill="none" stroke="#e76f51" stroke-width="2"/>`
    : kind === "flower" ? `<path d="M50 57v37m0-20q-20-15-26 1 12 13 26 3m0-9q20-15 26 1-12 13-26 3" fill="none" stroke="#386641" stroke-width="6" stroke-linecap="round"/><g fill="#e76f51"><ellipse cx="50" cy="29" rx="10" ry="18"/><ellipse cx="50" cy="29" rx="10" ry="18" transform="rotate(60 50 40)"/><ellipse cx="50" cy="29" rx="10" ry="18" transform="rotate(120 50 40)"/></g><circle cx="50" cy="40" r="9" fill="#ffd166"/>`
    : kind === "planet" ? `<circle cx="50" cy="50" r="24" fill="#6c63ff"/><path d="M13 58q37-38 74-13-22 34-74 13z" fill="none" stroke="#ffd166" stroke-width="7"/><circle cx="42" cy="44" r="3" fill="#fff"/><circle cx="59" cy="57" r="3" fill="#fff"/>`
    : kind === "fox" ? `<path fill="#e76f51" d="m20 40 8-24 18 12q5-2 9 0l19-12 6 26q3 34-30 48-33-14-30-50z"/><path fill="#fff1e6" d="M32 55q18-14 36 0l-5 21q-13 10-26 0z"/><circle cx="41" cy="49" r="3" fill="#29201e"/><circle cx="59" cy="49" r="3" fill="#29201e"/><path d="m47 59 3 3 3-3" fill="#29201e"/>`
    : kind === "cactus" ? `<path d="M49 91V35q0-12 11-12t11 12v11m-22 8H37V43q0-10-9-10t-9 10v17q0 10 10 10h20" fill="none" stroke="#438a5e" stroke-width="12" stroke-linecap="round"/><circle cx="44" cy="51" r="2" fill="#fff"/><circle cx="57" cy="51" r="2" fill="#fff"/>`
    : `<circle cx="50" cy="50" r="28" fill="#ff9f1c"/><path d="M50 5v12m0 66v12M5 50h12m66 0h12M18 18l9 9m46 46 9 9m0-64-9 9m-46 46-9 9" stroke="#ffbf69" stroke-width="7" stroke-linecap="round"/><circle cx="42" cy="47" r="2" fill="#5d4037"/><circle cx="58" cy="47" r="2" fill="#5d4037"/><path d="M43 59q7 6 14 0" fill="none" stroke="#5d4037" stroke-width="2"/>`;
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="${background}"/>${art}${face ? faceAccent : ""}</svg>`)}`;
}

function unwrap(result) {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

function numberInBand(index, bands) {
  const [low, high] = bands[index % bands.length];
  return low + ((index * 137 + 41) % (high - low + 1));
}

export const syntheticPeople = Array.from({ length: 132 }, (_, index) => {
  const first = firstNames[index % firstNames.length];
  const last = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  const username = `${first}.${last}.${String(index + 1).padStart(3, "0")}`.toLowerCase();
  return {
    username,
    display_name: `${first} ${last}`,
    avatar_url: fictionalAvatar(username),
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

// Fixed, synthetic examples for testing the private previous-name cue. Nothing is written to people.
const demoNameChangedAt = "2026-10-03T12:00:00.000Z";
const demoOrder = Array.from({ length: syntheticPeople.length }, (_, index) => index);
let demoSeed = 38261;
for (let index = demoOrder.length - 1; index > 0; index -= 1) {
  demoSeed = (Math.imul(demoSeed, 1664525) + 1013904223) >>> 0;
  const swapIndex = demoSeed % (index + 1);
  [demoOrder[index], demoOrder[swapIndex]] = [demoOrder[swapIndex], demoOrder[index]];
}
const demoNameChanges = new Map(demoOrder.slice(0, 38).map((personIndex, order) => {
  const person = syntheticPeople[personIndex];
  const [first, last] = person.display_name.split(" ");
  return [person.username, {
    currentDisplayName: person.display_name,
    previousUsername: order % 3 === 0 ? null : person.username.replace(`.${last.toLowerCase()}.`, `.${last[0].toLowerCase()}.`),
    previousDisplayName: order % 3 === 1 ? null : `${first} ${last[0]}.`,
    nameChangedAt: demoNameChangedAt,
  }];
}));

export function getSyntheticNameChangeCue(row, now = new Date()) {
  const cue = demoNameChanges.get(row.username);
  if (!cue || row.display_name !== cue.currentDisplayName || isNameChangeExpired(cue.nameChangedAt, now)) return null;
  return cue;
}

export function toPerson(row, index, membershipRows, followingRows = [], accountState = null, useLegacyState = false) {
  const state = accountState || (useLegacyState ? {
    account_follows_person: row.host_follows,
    person_follows_account: row.follows_host,
    followed_by_account_at: row.followed_by_host,
    followed_account_at: row.followed_host,
    is_favorite: row.is_favorite,
    is_blocked: row.is_blocked,
    pending_follow_request: row.pending_follow_request,
    suggestion_dismissed_at: row.suggestion_dismissed_at,
    notification_settings: row.notification_settings,
  } : {});
  const nameCue = getSyntheticNameChangeCue(row);
  return {
    id: row.id,
    name: row.display_name,
    handle: `@${row.username}`,
    username: row.username,
    previousUsername: nameCue?.previousUsername || null,
    previousDisplayName: nameCue?.previousDisplayName || null,
    nameChangedAt: nameCue?.nameChangedAt || null,
    avatarUrl: row.avatar_url,
    circles: membershipRows.filter((membership) => membership.person_id === row.id).map((membership) => membership.circle_id),
    color: colors[index % colors.length],
    followsHost: state.person_follows_account || false,
    hostFollows: state.account_follows_person || false,
    followedByHost: state.followed_by_account_at || null,
    followedHost: state.followed_account_at || null,
    followers: row.follower_count.toLocaleString(),
    following: row.following_count.toLocaleString(),
    posts: row.post_count.toLocaleString(),
    verified: row.is_verified,
    favorite: state.is_favorite || false,
    blocked: state.is_blocked || false,
    pendingRequest: state.pending_follow_request || false,
    dismissedAt: state.suggestion_dismissed_at || null,
    notifications: { ...notificationDefaults, ...(state.notification_settings || {}) },
    follows: followingRows.filter((following) => following.person_id === row.id).map((following) => following.followed_person_id),
  };
}

async function ensureSyntheticPeople() {
  const existing = unwrap(await supabase.from("people").select("id, username, avatar_url"));
  const existingUsernames = new Set(existing.map((person) => person.username));
  const missing = syntheticPeople.filter((person) => !existingUsernames.has(person.username));
  if (missing.length) unwrap(await supabase.from("people").insert(missing).select("id, username"));
  for (const person of existing.filter((item) => !item.avatar_url)) {
    unwrap(await supabase.from("people").update({ avatar_url: fictionalAvatar(person.username) }).eq("id", person.id).select("id").single());
  }

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

async function lazilyExpireManagedAccount(account) {
  const plan = planManagedAccountNameChange({ current: account, next: { username: account.username, displayName: account.display_name } });
  if (plan.status !== "cleanup") return account;

  const cleared = await supabase.from("managed_accounts")
    .update(plan.updates)
    .eq("id", account.id)
    .eq("name_changed_at", account.name_changed_at)
    .select(managedAccountFields)
    .single();
  if (cleared.error) throw cleared.error;
  if (!cleared.data) throw new Error("Could not clear expired managed-account name metadata.");
  return cleared.data;
}

async function loadManagedAccount(accountId) {
  const account = unwrap(await supabase.from("managed_accounts").select(managedAccountFields).eq("id", accountId).single());
  return lazilyExpireManagedAccount(account);
}

export async function loadManagedAccounts() {
  const accounts = unwrap(await supabase.from("managed_accounts").select(managedAccountFields).order("created_at", { ascending: true }));
  return Promise.all(accounts.map(lazilyExpireManagedAccount));
}

export async function createManagedAccount({ displayName: rawDisplayName, username: rawUsername }) {
  const display_name = rawDisplayName.trim();
  const cleanedUsername = rawUsername.trim().replace(/^@/, "").toLowerCase();
  if (!display_name || display_name.length > 80) throw new Error("Enter a display name between 1 and 80 characters.");
  if (cleanedUsername && !/^[a-z0-9._]{1,30}$/.test(cleanedUsername)) throw new Error("Use 1–30 letters, numbers, periods, or underscores for the username.");
  const id = crypto.randomUUID();
  return unwrap(await supabase.from("managed_accounts").insert({
    id,
    display_name,
    username: cleanedUsername || null,
    avatar_url: fictionalAvatar(id),
  }).select("id, username, display_name, pronouns, avatar_url, is_default").single());
}

export async function loadFamilyData(accountId) {
  if (!accountId) throw new Error("Choose an account profile to load.");
  await ensureSyntheticPeople();
  const [peopleResult, circlesResult, membershipsResult, followingResult] = await Promise.all([
    supabase.from("people").select("*").order("created_at", { ascending: true }),
    supabase.from("circles").select("*").eq("account_id", accountId).order("created_at", { ascending: true }),
    supabase.from("circle_members").select("circle_id, person_id").eq("account_id", accountId),
    supabase.from("person_followings").select("person_id, followed_person_id"),
  ]);
  const peopleRows = unwrap(peopleResult);
  const circleRows = unwrap(circlesResult);
  const membershipRows = unwrap(membershipsResult);
  const followingRows = unwrap(followingResult);
  const accountRows = unwrap(await supabase.from("account_people").select("*").eq("account_id", accountId));
  const accountByPerson = new Map(accountRows.map((row) => [row.person_id, row]));
  const account = await loadManagedAccount(accountId);
  return {
    people: peopleRows.map((row, index) => toPerson(row, index, membershipRows, followingRows, accountByPerson.get(row.id), account.is_default)),
    circles: circleRows.map(({ id, name }) => ({ id, name })),
    profile: account,
  };
}

export async function ensureProfileAvatar(userId) {
  const profile = unwrap(await supabase.from("profiles").select("avatar_url").eq("id", userId).single());
  if (profile.avatar_url) return profile.avatar_url;
  const avatar_url = fictionalAvatar(userId);
  unwrap(await supabase.from("profiles").update({ avatar_url }).eq("id", userId).select("id").single());
  return avatar_url;
}

export async function updateProfile(accountId, updates) {
  unwrap(await supabase.from("managed_accounts").update(updates).eq("id", accountId).select("id").single());
}

export async function updateManagedAccountNames(accountId, nextNames) {
  const current = await loadManagedAccount(accountId);
  const plan = planManagedAccountNameChange({ current, next: nextNames });

  if (plan.status === "blocked") {
    throw new Error(`Managed account names can be changed again after ${plan.nextEligibleAt.toLocaleDateString()}.`);
  }
  if (plan.status === "noop" || plan.status === "cleanup") return current;

  return unwrap(await supabase.from("managed_accounts")
    .update(plan.updates)
    .eq("id", accountId)
    .select(managedAccountFields)
    .single());
}

export async function loadSuggestionsPage({ accountId, query = "", from = 0, size = 50 }) {
  const { personTerms, hasCircleTerms } = parseAccountSearch(query, []);
  if (hasCircleTerms) return { rows: [], total: 0 };
  let request = supabase.from("people").select("*", { count: "exact" }).order("created_at", { ascending: true }).range(0, 999);
  const terms = personTerms.map((term) => {
    const exactHandle = term.startsWith("@");
    const value = term.replace(/^@/, "").toLowerCase().replace(/[^a-z0-9._ -]/g, "").slice(0, 80);
    if (!value) return [];
    if (exactHandle) return [`username.eq.${value}`];
    const escaped = value.replace(/[%_]/g, "\\$&");
    return [`username.ilike.%${escaped}%`, `display_name.ilike.%${escaped}%`];
  }).flat();
  if (terms.length) request = request.or(terms.join(","));
  const result = await request;
  if (result.error) throw new Error(result.error.message);
  const peopleRows = result.data || [];
  if (!peopleRows.length) return { rows: [], total: 0 };
  const states = unwrap(await supabase.from("account_people").select("*").eq("account_id", accountId).in("person_id", peopleRows.map((row) => row.id)));
  const stateByPerson = new Map(states.map((row) => [row.person_id, row]));
  const candidates = peopleRows.filter((row) => {
    const state = stateByPerson.get(row.id);
    return !state?.account_follows_person && !state?.person_follows_account && !state?.is_blocked && !state?.pending_follow_request && !state?.suggestion_dismissed_at;
  });
  return { rows: candidates.slice(from, from + size).map((row, index) => toPerson(row, from + index, [], [], stateByPerson.get(row.id))), total: candidates.length };
}

export async function createCircles(accountId, rawNames) {
  if (!Array.isArray(rawNames) || !rawNames.length) throw new Error("Enter at least one circle name.");
  const names = rawNames.map((rawName) => String(rawName).trim());
  if (names.some((name) => !name || name.length > 40)) {
    throw new Error("Each circle name must be between 1 and 40 characters.");
  }
  if (new Set(names.map((name) => name.toLowerCase())).size !== names.length) {
    throw new Error("Circle names must be unique. Remove any names that repeat.");
  }
  const result = await supabase.from("circles").insert(names.map((name) => ({ account_id: accountId, name }))).select("id");
  if (result.error?.code === "23505") {
    throw new Error("One or more circle names already exist. Check the list and try again.");
  }
  unwrap(result);
}

export async function deleteCircles(accountId, ids) {
  if (!ids.length) return;
  unwrap(await supabase.from("circles").delete().eq("account_id", accountId).in("id", ids).select("id"));
}

export async function createPerson({ username: rawUsername, displayName: rawDisplayName }) {
  const username = rawUsername.trim().replace(/^@/, "").toLowerCase();
  const displayName = rawDisplayName.trim();
  if (!/^[a-z0-9._]{1,30}$/.test(username)) throw new Error("Use 1–30 letters, numbers, periods, or underscores for the username.");
  if (!displayName || displayName.length > 80) throw new Error("Display names must be between 1 and 80 characters.");
  unwrap(await supabase.from("people").insert({ username, display_name: displayName, avatar_url: fictionalAvatar(username), is_verified: true }).select("id").single());
}

async function updateAccountPeople(accountId, ids, updates) {
  if (!ids.length) return;
  const existing = unwrap(await supabase.from("account_people").update(updates).eq("account_id", accountId).in("person_id", ids).select("person_id"));
  const found = new Set(existing.map((row) => row.person_id));
  const missing = ids.filter((id) => !found.has(id));
  if (missing.length) unwrap(await supabase.from("account_people").insert(missing.map((person_id) => ({ account_id: accountId, person_id, ...updates }))));
}

export async function updateFollowing(accountId, ids, value) {
  if (!ids.length) return;
  if (!value) unwrap(await supabase.from("circle_members").delete().eq("account_id", accountId).in("person_id", ids).select("person_id"));
  await updateAccountPeople(accountId, ids, { account_follows_person: value, followed_by_account_at: value ? new Date().toISOString() : null, ...(value ? {} : { is_favorite: false }) });
}

export async function setFavorites(accountId, ids, value) {
  if (!ids.length) return;
  const updates = value
    ? { is_favorite: true, account_follows_person: true, followed_by_account_at: new Date().toISOString() }
    : { is_favorite: false };
  await updateAccountPeople(accountId, ids, updates);
}

export async function updatePeople(accountId, ids, updates) {
  if (!ids.length) return;
  await updateAccountPeople(accountId, ids, updates);
}

export async function blockPeople(accountId, ids) {
  if (!ids.length) return;
  unwrap(await supabase.from("circle_members").delete().eq("account_id", accountId).in("person_id", ids).select("person_id"));
  await updatePeople(accountId, ids, { is_blocked: true, is_favorite: false, account_follows_person: false, followed_by_account_at: null, pending_follow_request: false });
}

export async function replaceCircleMemberships(accountId, ids, draft, people) {
  const changes = ids.map((personId) => {
    const current = new Set(people.find((person) => person.id === personId)?.circles || []);
    const next = new Set(draft[personId] ?? current);
    return { personId, removed: [...current].filter((circleId) => !next.has(circleId)), added: [...next].filter((circleId) => !current.has(circleId)) };
  });
  for (const { personId, removed } of changes) if (removed.length) unwrap(await supabase.from("circle_members").delete().eq("account_id", accountId).eq("person_id", personId).in("circle_id", removed).select("person_id"));
  for (const { personId, added } of changes) if (added.length) unwrap(await supabase.from("circle_members").insert(added.map((circleId) => ({ account_id: accountId, circle_id: circleId, person_id: personId }))));
}

export async function loadMessages(accountId, personId) {
  return unwrap(await supabase.from("messages").select("id, body, created_at").eq("account_id", accountId).eq("person_id", personId).order("created_at", { ascending: true }));
}

export async function sendMessage(accountId, personId, rawBody) {
  const body = rawBody.trim();
  if (!body || body.length > 2000) throw new Error("Messages must contain 1–2,000 characters.");
  return unwrap(await supabase.from("messages").insert({ account_id: accountId, person_id: personId, body }).select("id, body, created_at").single());
}
