import { wedding } from '../config/wedding';

export interface BlessingPayload {
  name: string;
  message: string;
  submittedAt: string;
  /** Honeypot: hidden from people; bots that fill it are ignored by the Worker. */
  website?: string;
}

export type BlessingMode = 'remote' | 'demo';

export const blessingMode = (): BlessingMode => (wedding.blessings.endpoint ? 'remote' : 'demo');

const STORE = 'kwi.blessings';

/**
 * Send a blessing to the configured endpoint. With no endpoint (demo mode),
 * it is kept in this browser only so the flow can be reviewed end to end.
 */
export async function sendBlessing(p: BlessingPayload): Promise<{ ok: true; mode: BlessingMode } | { ok: false; error: string }> {
  const endpoint = wedding.blessings.endpoint;
  if (!endpoint) {
    try {
      const prev = JSON.parse(localStorage.getItem(STORE) ?? '[]') as BlessingPayload[];
      localStorage.setItem(STORE, JSON.stringify([...prev, p]));
    } catch {
      /* storage unavailable (private mode): demo still succeeds */
    }
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true, mode: 'demo' };
  }
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(p),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true, mode: 'remote' };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
