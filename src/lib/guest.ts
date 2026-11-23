import { wedding, type Bi } from '../config/wedding';

/**
 * Personalised guest name from the link: ?to=Name or ?guest=Name.
 * Sent invitations can each carry their own guest name.
 */
export function readGuest(search = typeof location !== 'undefined' ? location.search : ''): Bi & { personalised: boolean } {
  const q = new URLSearchParams(search);
  const raw = (q.get('to') ?? q.get('guest') ?? '').trim().slice(0, 80);
  if (!raw) return { ...wedding.meta.defaultGuest, personalised: false };
  return { km: raw, en: raw, personalised: true };
}
