const { sources } = require('../config');

// fetch con timeout (Node 18+ trae fetch nativo).
async function getJson(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(sources.timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.json();
}

module.exports = { getJson };
