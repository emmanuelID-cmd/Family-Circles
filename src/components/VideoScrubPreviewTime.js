export function formatPreviewTime(seconds) {
  const wholeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(wholeSeconds / 60);
  return `${minutes}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

export function clampPreviewTime(time, duration) {
  if (!Number.isFinite(duration) || duration <= 0) return null;
  const requested = Number(time);
  return Math.min(duration, Math.max(0, Number.isFinite(requested) ? requested : 0));
}
