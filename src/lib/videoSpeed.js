export const VIDEO_SPEED_OPTIONS = Object.freeze([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3]);
export const DEFAULT_VIDEO_SPEED = 1;

export function isValidVideoSpeed(speed) {
  return typeof speed === "number" && VIDEO_SPEED_OPTIONS.includes(speed);
}

export function readPersistedVideoSpeed(storage, key) {
  if (!storage || typeof storage.getItem !== "function" || typeof key !== "string" || !key) {
    return DEFAULT_VIDEO_SPEED;
  }

  try {
    const stored = storage.getItem(key);
    if (stored === null) return DEFAULT_VIDEO_SPEED;
    const speed = Number(stored);
    return isValidVideoSpeed(speed) ? speed : DEFAULT_VIDEO_SPEED;
  } catch {
    return DEFAULT_VIDEO_SPEED;
  }
}

export function writePersistedVideoSpeed(storage, key, speed) {
  if (!storage || typeof storage.setItem !== "function" || typeof key !== "string" || !key || !isValidVideoSpeed(speed)) {
    return false;
  }

  try {
    storage.setItem(key, String(speed));
    return true;
  } catch {
    return false;
  }
}

export function getEffectiveVideoSpeed(savedSpeed, { isPlaying = false, rightHold = false } = {}) {
  const preferredSpeed = isValidVideoSpeed(savedSpeed) ? savedSpeed : DEFAULT_VIDEO_SPEED;
  return isPlaying && rightHold ? 2 : preferredSpeed;
}

export function changeSavedVideoSpeed(playback, nextSpeed) {
  if (!isValidVideoSpeed(nextSpeed)) return playback;
  return { ...playback, savedSpeed: nextSpeed };
}
