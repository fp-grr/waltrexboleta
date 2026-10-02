/**
 * Live USD -> local FX, isolated behind fetchRates() so the provider can be swapped.
 * Provider: ExchangeRate-API open endpoint (no key, attribution required in the UI).
 */

export type LocalCurrency = "MXN" | "COP";
export type RateSource = "live" | "fallback";

export interface RateSnapshot {
  rates: Record<LocalCurrency, number>;
  source: RateSource;
  fetchedAt: number;
}

/** Used when the provider is down or rate limited. Shown to the user as "indicative". */
export const FALLBACK_RATES: Record<LocalCurrency, number> = { MXN: 17.4, COP: 4150 };

const URL = "https://open.er-api.com/v6/latest/USD";
const CACHE_TTL_MS = 30 * 60 * 1000;
/** After a failure, don't hit the provider again for a minute (avoids hammering a 429). */
const FAILURE_BACKOFF_MS = 60 * 1000;
const STORAGE_KEY = "wx.rates.v1";
const FETCH_TIMEOUT_MS = 6000;

let memory: RateSnapshot | null = null;
let inflight: Promise<RateSnapshot> | null = null;

const fallbackSnapshot = (): RateSnapshot => ({ rates: { ...FALLBACK_RATES }, source: "fallback", fetchedAt: Date.now() });

const fresh = (s: RateSnapshot | null): s is RateSnapshot => {
  if (!s) return false;
  const ttl = s.source === "live" ? CACHE_TTL_MS : FAILURE_BACKOFF_MS;
  return Date.now() - s.fetchedAt < ttl;
};

const readStorage = (): RateSnapshot | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as RateSnapshot;
    return s?.source === "live" && Number.isFinite(s.rates?.MXN) && Number.isFinite(s.rates?.COP) ? s : null;
  } catch {
    return null;
  }
};

const writeStorage = (s: RateSnapshot) => {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
};

/** Latest snapshot already in memory (or storage), however old. Never triggers a request. */
export const getCachedRates = (): RateSnapshot | null => {
  if (!memory) memory = readStorage();
  return memory;
};

/** Cached when fresh (30 min), otherwise one network request. Concurrent callers share it. */
export const fetchRates = async (): Promise<RateSnapshot> => {
  if (!memory) memory = readStorage();
  if (fresh(memory)) return memory;
  if (inflight) return inflight;

  inflight = (async () => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(URL, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`rates ${res.status}`); // includes 429
      const data = await res.json();
      const mxn = Number(data?.rates?.MXN);
      const cop = Number(data?.rates?.COP);
      if (!(mxn > 0) || !(cop > 0)) throw new Error("rates payload missing MXN/COP");
      const snap: RateSnapshot = { rates: { MXN: mxn, COP: cop }, source: "live", fetchedAt: Date.now() };
      memory = snap;
      writeStorage(snap);
      return snap;
    } catch {
      // Keep serving an older live snapshot if we have one; otherwise fall back.
      const snap = memory?.source === "live" ? memory : fallbackSnapshot();
      if (snap.source === "fallback") memory = snap;
      return snap;
    } finally {
      clearTimeout(timer);
      inflight = null;
    }
  })();
  return inflight;
};
