/**
 * MEDIA PIPELINE: npm run media
 *
 * Turns the original photographs and clips into web-ready assets:
 *  - photos → responsive WebP (480/960/1440/2048 w), EXIF-rotated, plus a
 *    tiny blurred placeholder (LQIP) embedded in the manifest;
 *  - clips  → H.264 MP4 (plays everywhere; the originals are HEVC .MOV),
 *    muted, 1280 px, fast-start, plus a WebP poster frame;
 *  - music  → 128 kbps stereo MP3 (plays everywhere), cover art and tags removed.
 * Writes public/media/** and src/config/media.generated.ts.
 * Originals are never modified. Re-running skips outputs newer than their source.
 *
 * To add or re-crop media, edit SOURCES below and re-run.
 */
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const IMG = join(root, 'src/image');
const VID = join(root, 'src/video');
const MUS = join(root, 'src/music');
const OUT_P = join(root, 'public/media/photos');
const OUT_V = join(root, 'public/media/video');
mkdirSync(OUT_P, { recursive: true });
mkdirSync(OUT_V, { recursive: true });
const OUT_A = join(root, 'public/media/music');
mkdirSync(OUT_A, { recursive: true });

/** id → source file, optional crop in original pixels ({left, top, width, height}). */
const SOURCES = {
  photos: {
    AP3I6331: { file: 'AP3I6331.jpg' },
    AP3I6335: { file: 'AP3I6335.jpg' },
    AP3I6341: { file: 'AP3I6341.jpg' },
    AP3I6346: { file: 'AP3I6346.jpg' },
    AP3I6355: { file: 'AP3I6355.jpg' },
    AP3I6379: { file: 'AP3I6379.jpg' },
    AP3I6387: { file: 'AP3I6387.jpg' },
    AP3I6395: { file: 'AP3I6395.jpg' },
    // Solo portraits cropped from the full-length couple portrait (no solo shots were supplied).
    'groom-crop': { file: 'AP3I6331.jpg', crop: { left: 861, top: 1370, width: 1190, height: 1488 } },
    'bride-crop': { file: 'AP3I6331.jpg', crop: { left: 1900, top: 1879, width: 1120, height: 1400 } },
  },
  videos: {
    // Behind-the-scenes clips (phone footage, ~7 s). Audio removed: they play as silent loops.
    'bts-traditional': { file: 'IMG_6659.MOV', vf: 'scale=1280:-2' },
    // Cropped to the left half so the crew member filming on the right is out of frame.
    'bts-western': { file: 'IMG_6694.MOV', vf: 'crop=trunc(iw*0.48/2)*2:ih:trunc(iw*0.04/2)*2:0,scale=720:-2' },
    // White-wedding portraits on the flower stairs (4K portrait). One frame catches the photographer's flash; kept as is.
    'bts-stairs': { file: 'IMG_6699.MOV', vf: 'scale=720:-2' },
  },
  audio: {
    // Background song (supplied by the couple): ភូមាចាប់កង្កែប, sung by ហុី ភារុណ.
    'wedding-song': { file: 'បទ៖_ភូមាចាប់កង្កែប_ហុី_ភារុណ_256k.mp3' },
  },
};

const WIDTHS = [480, 960, 1440, 2048];
const fresh = (out, src) => existsSync(out) && statSync(out).mtimeMs > statSync(src).mtimeMs;
const manifest = { photos: {}, videos: {}, audio: {} };

for (const [id, cfg] of Object.entries(SOURCES.photos)) {
  const src = join(IMG, cfg.file);
  const base = () => {
    let p = sharp(src, { limitInputPixels: false }).rotate();
    if (cfg.crop) p = p.extract(cfg.crop);
    return p;
  };
  const meta = cfg.crop ? { width: cfg.crop.width, height: cfg.crop.height } : await sharp(src).rotate().metadata().then((m) => ({ width: m.autoOrient?.width ?? m.width, height: m.autoOrient?.height ?? m.height }));
  const widths = WIDTHS.filter((w) => w <= meta.width);
  if (!widths.includes(Math.min(meta.width, 2048))) widths.push(Math.min(meta.width, 2048));
  const files = [];
  for (const w of widths) {
    const name = `${id}-${w}.webp`;
    const out = join(OUT_P, name);
    if (!fresh(out, src)) await base().resize({ width: w }).webp({ quality: w <= 480 ? 72 : 78, effort: 5 }).toFile(out);
    files.push({ w, url: `/media/photos/${name}`, bytes: statSync(out).size });
  }
  const lqip = await base().resize({ width: 24 }).blur(0.6).webp({ quality: 40 }).toBuffer();
  manifest.photos[id] = {
    src: files.find((f) => f.w === 960)?.url ?? files.at(-1).url,
    srcSet: files.map((f) => `${f.url} ${f.w}w`).join(', '),
    width: meta.width,
    height: meta.height,
    aspect: +(meta.width / meta.height).toFixed(4),
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
  };
  console.log(`photo ${id.padEnd(12)} ${meta.width}×${meta.height} → ${files.map((f) => `${f.w}w ${Math.round(f.bytes / 1024)}KB`).join(', ')}`);
}

for (const [id, cfg] of Object.entries(SOURCES.videos)) {
  const src = join(VID, cfg.file);
  const out = join(OUT_V, `${id}.mp4`);
  if (!fresh(out, src)) {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-an', '-vf', `${cfg.vf},format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-profile:v', 'high', '-movflags', '+faststart', out]);
  }
  const posterJpg = join(OUT_V, `${id}-poster.jpg`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', '0.4', '-i', out, '-frames:v', '1', '-q:v', '3', posterJpg]);
  const poster = join(OUT_V, `${id}-poster.webp`);
  const pm = await sharp(posterJpg).webp({ quality: 78 }).toFile(poster);
  execFileSync('rm', [posterJpg]);
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', out]).toString());
  const { width, height } = probe.streams[0];
  manifest.videos[id] = { src: `/media/video/${id}.mp4`, poster: `/media/video/${id}-poster.webp`, width, height, aspect: +(width / height).toFixed(4), duration: +(+probe.format.duration).toFixed(2) };
  console.log(`video ${id.padEnd(16)} ${width}×${height} ${probe.format.duration}s → ${Math.round(statSync(out).size / 1024)}KB (poster ${Math.round(pm.size / 1024)}KB)`);
}

for (const [id, cfg] of Object.entries(SOURCES.audio)) {
  const src = join(MUS, cfg.file);
  const out = join(OUT_A, `${id}.mp3`);
  if (!fresh(out, src)) {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-map', '0:a', '-map_metadata', '-1', '-c:a', 'libmp3lame', '-b:a', '128k', '-ar', '44100', out]);
  }
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', out]).toString());
  manifest.audio[id] = { src: `/media/music/${id}.mp3`, duration: +(+probe.format.duration).toFixed(2) };
  console.log(`audio ${id.padEnd(16)} ${probe.format.duration}s → ${Math.round(statSync(out).size / 1024)}KB`);
}

const ts = `/* AUTO-GENERATED by scripts/process-media.mjs. Do not edit; re-run \`npm run media\`. */
export interface MediaPhoto { src: string; srcSet: string; width: number; height: number; aspect: number; lqip: string }
export interface MediaVideo { src: string; poster: string; width: number; height: number; aspect: number; duration: number }
export interface MediaAudio { src: string; duration: number }
export const mediaPhotos: Record<string, MediaPhoto> = ${JSON.stringify(manifest.photos, null, 2)};
export const mediaVideos: Record<string, MediaVideo> = ${JSON.stringify(manifest.videos, null, 2)};
export const mediaAudio: Record<string, MediaAudio> = ${JSON.stringify(manifest.audio, null, 2)};
`;
writeFileSync(join(root, 'src/config/media.generated.ts'), ts);
console.log('✓ wrote src/config/media.generated.ts');
