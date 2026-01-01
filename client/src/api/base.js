// Resolve API base URL at runtime while avoiding localhost probes in production.
const defaultRemote = 'https://btl-web-exam-reg-backend-jfpbivud0.vercel.app';
const localFallbacks = ['http://localhost:5001', 'http://localhost:5000'];

const isLocalHost =
  typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

const candidates = (
  import.meta.env.VITE_API_BASE
    ? [import.meta.env.VITE_API_BASE]
    : isLocalHost
      ? localFallbacks
      : [defaultRemote]
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
