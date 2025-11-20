// Lightweight fetch wrapper with timeout + JSON parsing
export async function httpGetJson(url, { signal, timeoutMs = 10000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException("Timeout", "AbortError")), timeoutMs);

  try {
    const res = await fetch(url, { signal: mergeSignals(signal, controller.signal) });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function mergeSignals(a, b) {
  if (!a) return b;
  if (!b) return a;
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort(a.aborted ? a.reason : b.reason);
  a.addEventListener("abort", onAbort, { once: true });
  b.addEventListener("abort", onAbort, { once: true });
  return ctrl.signal;
}
