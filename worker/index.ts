/**
 * CLOUDFLARE WORKER: serves the invitation and stores guests' blessings.
 *
 *   POST /api/blessings   guest sends a blessing (stored in D1)
 *   GET  /api/blessings   list blessings (needs the ADMIN_KEY secret)
 *   GET  /admin           private page for the couple to read blessings
 *   everything else       the built site (dist/, via the ASSETS binding)
 *
 * Secrets: ADMIN_KEY (npx wrangler secret put ADMIN_KEY).
 */
import { ADMIN_HTML } from './admin';

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  ADMIN_KEY?: string;
}

const MAX_NAME = 120;
const MAX_MESSAGE = 1000;
/** Per-visitor limit: at most this many blessings in RATE_WINDOW_MIN minutes. */
const RATE_LIMIT = 5;
const RATE_WINDOW_MIN = 10;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time comparison of the admin key. */
function sameKey(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function authorised(req: Request, env: Env): boolean {
  const key = env.ADMIN_KEY;
  if (!key) return false;
  const header = req.headers.get('authorization') ?? '';
  const given = header.startsWith('Bearer ') ? header.slice(7) : '';
  return sameKey(given, key);
}

async function postBlessing(req: Request, env: Env): Promise<Response> {
  if (!(req.headers.get('content-type') ?? '').includes('application/json')) return json({ error: 'Expected JSON' }, 415);
  let body: { name?: unknown; message?: unknown; website?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  // Honeypot: real guests never see or fill this field.
  if (typeof body.website === 'string' && body.website.trim()) return json({ ok: true });

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!name || !message) return json({ error: 'Name and blessing are required' }, 400);
  if (name.length > MAX_NAME || message.length > MAX_MESSAGE) return json({ error: 'Too long' }, 413);

  // Only a hash of the visitor's IP is kept, for rate limiting.
  const ip = req.headers.get('cf-connecting-ip') ?? 'unknown';
  const ipHash = (await sha256(`kwi:${ip}`)).slice(0, 32);
  const recent = await env.DB.prepare(`SELECT COUNT(*) AS n FROM blessings WHERE ip_hash = ? AND created_at > datetime('now', ?)`)
    .bind(ipHash, `-${RATE_WINDOW_MIN} minutes`)
    .first<{ n: number }>();
  if ((recent?.n ?? 0) >= RATE_LIMIT) return json({ error: 'Too many blessings, please try again later' }, 429);

  const country = (req as Request & { cf?: { country?: string } }).cf?.country ?? null;
  await env.DB.prepare(`INSERT INTO blessings (name, message, country, ip_hash) VALUES (?, ?, ?, ?)`).bind(name, message, country, ipHash).run();
  return json({ ok: true }, 201);
}

async function listBlessings(req: Request, env: Env): Promise<Response> {
  if (!authorised(req, env)) return json({ error: 'Unauthorised' }, 401);
  const { results } = await env.DB.prepare(`SELECT id, name, message, country, created_at FROM blessings ORDER BY created_at DESC LIMIT 2000`).all();
  return json({ blessings: results });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/api/blessings') {
      if (req.method === 'POST') return postBlessing(req, env);
      if (req.method === 'GET') return listBlessings(req, env);
      return json({ error: 'Method not allowed' }, 405);
    }
    if (url.pathname === '/admin' || url.pathname === '/admin/') {
      return new Response(ADMIN_HTML, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store',
          'x-robots-tag': 'noindex',
          'content-security-policy': "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'",
        },
      });
    }
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
