// Cache simple en memoria con TTL.
const store = new Map();

async function cached(key, ttlMs, loader) {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value;
  const value = await loader();
  store.set(key, { value, at: Date.now() });
  return value;
}

module.exports = { cached };
