// Best-effort in-memory rate limiting for the Gumi chat API.
//
// State is per serverless instance: it resets on cold starts and is not shared
// across concurrent instances, so treat these as spam brakes, not hard billing
// guarantees — the hard guarantee is the spend limit set in the OpenAI
// dashboard. Within one warm instance (the common case for a small site) the
// caps below hold.

type Window = { count: number; resetAt: number };

const MINUTE = 60_000;
const DAY = 24 * 60 * 60 * 1000;

// Per-IP: short window stops bursts, daily window stops slow drips.
const IP_PER_MINUTE = 6;
const IP_PER_DAY = 40;
// Global backstop across all visitors of this instance.
const GLOBAL_PER_DAY = 500;

const perIpMinute = new Map<string, Window>();
const perIpDay = new Map<string, Window>();
let globalDay: Window = { count: 0, resetAt: Date.now() + DAY };

function hit(map: Map<string, Window>, key: string, limit: number, span: number) {
  const now = Date.now();
  const win = map.get(key);
  if (!win || now >= win.resetAt) {
    map.set(key, { count: 1, resetAt: now + span });
    return true;
  }
  if (win.count >= limit) return false;
  win.count += 1;
  return true;
}

// Keep the maps from growing unboundedly under many unique IPs.
function prune(map: Map<string, Window>) {
  if (map.size < 5000) return;
  const now = Date.now();
  for (const [key, win] of map) {
    if (now >= win.resetAt) map.delete(key);
  }
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; scope: "burst" | "daily" | "global" };

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  if (now >= globalDay.resetAt) {
    globalDay = { count: 0, resetAt: now + DAY };
  }
  if (globalDay.count >= GLOBAL_PER_DAY) return { ok: false, scope: "global" };

  prune(perIpMinute);
  prune(perIpDay);

  if (!hit(perIpMinute, ip, IP_PER_MINUTE, MINUTE)) {
    return { ok: false, scope: "burst" };
  }
  if (!hit(perIpDay, ip, IP_PER_DAY, DAY)) {
    return { ok: false, scope: "daily" };
  }
  globalDay.count += 1;
  return { ok: true };
}

export function clientIp(req: Request): string {
  // Vercel sets x-forwarded-for; first entry is the client.
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
