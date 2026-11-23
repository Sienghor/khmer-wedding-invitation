/**
 * PHOTO CONFIGURATION
 * ---------------------------------------------------------------------------
 * Each slot on the page names one processed photo from media.generated.ts
 * (produced by `npm run media` from the originals in src/image/).
 *
 * To change which photo appears where, change the media key on that line.
 * To add a new photo: add it to SOURCES in scripts/process-media.mjs, run
 * `npm run media`, then reference its key here. A slot with `media: null`
 * shows the elegant skeleton instead.
 *
 * Photography only. Ornaments are never images (see docs/02-heritage-design-spec.md).
 */
import { mediaPhotos } from './media.generated';
import { wedding } from './wedding';

const groom = wedding.couple.groom.name.en;
const bride = wedding.couple.bride.name.en;

export type PhotoShape = 'portrait' | 'landscape' | 'square' | 'tall';

export interface Photo {
  id: string;
  src: string | null;
  srcSet?: string;
  sizes?: string;
  alt: string;
  shape: PhotoShape;
  /** Real width/height ratio of the processed file (overrides `shape`). */
  aspect?: number;
  /** Tiny blurred preview shown while the photo loads. */
  lqip?: string;
  /** CSS object-position, to keep faces in frame when a slot crops. */
  focal?: string;
  caption?: { km: string; en: string };
}

export const ASPECT: Record<PhotoShape, number> = {
  portrait: 4 / 5,
  landscape: 3 / 2,
  square: 1,
  tall: 2 / 3,
};

/** Bind a page slot to a processed photo (or leave it as a skeleton with `null`). */
const slot = (id: string, media: keyof typeof mediaPhotos | null, alt: string, fallbackShape: PhotoShape, focal?: string): Photo => {
  const m = media ? mediaPhotos[media] : undefined;
  if (media && !m) throw new Error(`Unknown media "${media}" in photos.ts. Run npm run media.`);
  return { id, src: m?.src ?? null, srcSet: m?.srcSet, aspect: m?.aspect, lqip: m?.lqip, alt, shape: fallbackShape, focal };
};

export const photos: Photo[] = [
  // Threshold (first view after the doorway): intimate traditional portrait
  slot('hero', 'AP3I6335', `${groom} and ${bride} in traditional Khmer wedding attire`, 'tall', '50% 35%'),
  // Solo portraits, cropped from the full-length couple portrait AP3I6331
  slot('groom', 'groom-crop', `${groom} in a golden Khmer silk jacket`, 'portrait', '50% 25%'),
  slot('bride', 'bride-crop', `${bride} in a golden Khmer silk sbai and sampot`, 'portrait', '50% 25%'),
  // Gallery: alternates the traditional and western sets
  slot('g-01', 'AP3I6331', 'Full-length portrait of the couple in golden Khmer silk', 'tall'),
  slot('g-02', 'AP3I6379', 'The couple in white tuxedo and gown, wearing sunglasses', 'tall'),
  slot('g-03', 'AP3I6355', 'The couple seated beside a traditional parasol', 'landscape'),
  slot('g-04', 'AP3I6387', 'The bride’s gown spread across white marble stairs', 'portrait'),
  slot('g-05', 'AP3I6346', 'The groom pointing out across the wooden pavilion', 'tall'),
  slot('g-06', 'AP3I6395', 'The couple framed by white blossoms', 'tall'),
  slot('g-07', 'AP3I6341', 'Holding hands across a carved wooden staircase', 'portrait'),
  slot('g-08', 'AP3I6335', 'A close moment in traditional attire', 'tall'),
];

export const galleryIds = photos.filter((p) => p.id.startsWith('g-')).map((p) => p.id);

export function getPhoto(id: string): Photo {
  const p = photos.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown photo id "${id}" (src/config/photos.ts)`);
  return p;
}
