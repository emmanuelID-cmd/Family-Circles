export const NAME_CHANGE_COOLDOWN_DAYS = 30;
export const NAME_CHANGE_COOLDOWN_MS = NAME_CHANGE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

const USERNAME_PATTERN = /^[a-z0-9._]{1,30}$/;

function asDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function normalizeManagedAccountNames({ username, displayName }) {
  const normalizedUsername = String(username ?? "").trim().replace(/^@/, "").toLowerCase() || null;
  const normalizedDisplayName = String(displayName ?? "").trim();

  if (!normalizedDisplayName || normalizedDisplayName.length > 80) {
    throw new Error("Enter a display name between 1 and 80 characters.");
  }
  if (normalizedUsername && !USERNAME_PATTERN.test(normalizedUsername)) {
    throw new Error("Use 1–30 letters, numbers, periods, or underscores for the username.");
  }

  return { username: normalizedUsername, displayName: normalizedDisplayName };
}

export function getNameChangeExpiry(nameChangedAt, now = new Date()) {
  const changedAt = asDate(nameChangedAt);
  if (!changedAt) return null;
  return new Date(changedAt.getTime() + NAME_CHANGE_COOLDOWN_MS);
}

export function isNameChangeExpired(nameChangedAt, now = new Date()) {
  const expiry = getNameChangeExpiry(nameChangedAt, now);
  const currentTime = asDate(now) || new Date();
  return Boolean(expiry && currentTime.getTime() >= expiry.getTime());
}

function currentNames(account) {
  return {
    username: account?.username || null,
    displayName: String(account?.display_name ?? account?.displayName ?? "").trim(),
  };
}

export function planManagedAccountNameChange({ current, next, now = new Date() }) {
  const currentValues = currentNames(current);
  const nextValues = normalizeManagedAccountNames(next);
  const changedUsername = currentValues.username !== nextValues.username;
  const changedDisplayName = currentValues.displayName !== nextValues.displayName;
  const changed = changedUsername || changedDisplayName;
  const expired = isNameChangeExpired(current?.name_changed_at, now);
  const nextEligibleAt = getNameChangeExpiry(current?.name_changed_at, now);
  const previousValues = {
    temp_user_name: changedUsername ? currentValues.username : null,
    temp_screen_name: changedDisplayName ? currentValues.displayName : null,
  };

  if (!changed) {
    return {
      status: expired ? "cleanup" : "noop",
      current: currentValues,
      next: nextValues,
      changedUsername,
      changedDisplayName,
      nextEligibleAt: expired ? null : nextEligibleAt,
      previousValues,
      updates: expired ? { temp_user_name: null, temp_screen_name: null, name_changed_at: null } : {},
    };
  }

  if (current?.name_changed_at && !expired) {
    return {
      status: "blocked",
      current: currentValues,
      next: nextValues,
      changedUsername,
      changedDisplayName,
      nextEligibleAt,
      previousValues,
      updates: {},
    };
  }

  const changedAt = asDate(now) || new Date();
  return {
    status: "change",
    current: currentValues,
    next: nextValues,
    changedUsername,
    changedDisplayName,
    nextEligibleAt: getNameChangeExpiry(changedAt, changedAt),
    previousValues,
    updates: {
      username: nextValues.username,
      display_name: nextValues.displayName,
    },
  };
}
