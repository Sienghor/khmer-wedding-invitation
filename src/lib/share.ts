import { wedding } from '../config/wedding';
import { stripBrackets } from './text';

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export async function shareInvitation(): Promise<ShareResult> {
  // Share the base link without the personal ?to= parameter.
  const url = `${location.origin}${location.pathname}`;
  const data = { title: stripBrackets(wedding.meta.title.en), text: stripBrackets(wedding.meta.title.km), url };
  if (navigator.share) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
}
