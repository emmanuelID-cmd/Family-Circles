const REEL_COUNT = 10;

function hashIdentity(identity) {
  let hash = 2166136261;
  for (const character of identity) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getProfileReels(profileId) {
  const identity = String(profileId || "").trim();
  if (!identity) return [];

  let seed = hashIdentity(identity);
  const order = Array.from({ length: REEL_COUNT }, (_, index) => index + 1);

  for (let index = order.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const swapIndex = seed % (index + 1);
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }

  return order.map((number) => {
    const id = String(number).padStart(2, "0");
    return {
      id: `reel-${id}`,
      title: `Video ${number}`,
      src: `/assets/reel-${id}.mp4`,
    };
  });
}
