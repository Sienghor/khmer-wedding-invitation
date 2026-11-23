import { wedding } from '../config/wedding';
import { hasPlaceholder } from './text';

/** Google Maps directions link from a full URL or a free-text query. */
export function mapsUrl(): string | null {
  const m = wedding.event.venue.maps;
  if (hasPlaceholder(m)) return null;
  if (/^https?:\/\//.test(m)) return m;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(m)}`;
}
