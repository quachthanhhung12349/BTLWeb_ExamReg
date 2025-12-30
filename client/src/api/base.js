// Resolve API base URL at runtime, preferring env override then known local ports.
const candidates = (
  import.meta.env.VITE_API_BASE
    ? [import.meta.env.VITE_API_BASE, 'http://localhost:5001', 'http://localhost:5000']
    : ['http://localhost:5001', 'http://localhost:5000']
).map((url) => url.replace(/\/$/, ''));

let resolvedBase = null;

async function probe(base) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    const res = await fetch(`${base}/api/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch (_) {
    return false;
  }
}

export async function getApiBase() {
  if (resolvedBase) return resolvedBase;

  for (const base of candidates) {
    if (await probe(base)) {
      resolvedBase = base;
      return base;
    }
  }

  // Fallback to the first candidate even if probes fail to avoid blocking calls.
  resolvedBase = candidates[0];
  return resolvedBase;
}
