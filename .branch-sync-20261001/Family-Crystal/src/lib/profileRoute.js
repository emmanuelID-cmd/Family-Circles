export function getUserProfileRoute(hash) {
  const match = hash.match(/^#\/user\/([^/?]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}
