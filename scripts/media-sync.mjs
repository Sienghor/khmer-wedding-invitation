/**
 * MEDIA STORAGE (Google Drive, via rclone): npm run media:push · npm run media:pull
 *
 * Photos, videos and music are not kept in git. They live in a private Google
 * Drive folder; `media.lock.json` (in git) records which version of each file
 * belongs to this commit, by SHA-256.
 *
 *   push              upload new or changed files, then update media.lock.json
 *                     - web-ready media:  public/media/**
 *                     - originals backup: src/image, src/video, src/music (when present on this computer)
 *   pull              download missing web-ready media into public/media (run by `npm run deploy`)
 *   pull --originals  also download the originals into src/image, src/video, src/music
 *   pull --force      overwrite local files that differ from media.lock.json, delete ones not in it
 *   pull --soft       for local preview (npm run dev): only fetch missing files; local changes and
 *                     problems (offline, not signed in) are warnings, never errors
 *   push --all        upload everything again (repair)
 *
 * Files are stored under content-addressed names (path + hash), so uploads never
 * overwrite an older version and any earlier commit can still be rebuilt.
 *
 * One-time setup per computer: `brew install rclone`, then `npm run media:login`
 * (creates the rclone remote "gdrive" and signs in to Google in the browser).
 * Override the location with MEDIA_REMOTE=<remote>:<folder>.
 */
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, createReadStream, existsSync, linkSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REMOTE = process.env.MEDIA_REMOTE ?? 'gdrive:khmer-wedding-media';
const root = fileURLToPath(new URL('..', import.meta.url));
const LOCK = join(root, 'media.lock.json');

/** Folders synced with Drive. `site` media is needed to build; originals are a backup. */
const GROUPS = [
  { dir: 'public/media', site: true },
  { dir: 'src/image', site: false },
  { dir: 'src/video', site: false },
  { dir: 'src/music', site: false },
];

const [cmd, ...flags] = process.argv.slice(2);
const has = (f) => flags.includes(f);

const toPosix = (p) => p.split(sep).join('/');
const keyFor = (path, hash) => `${posix.dirname(path)}/${hash.slice(0, 16)}-${posix.basename(path)}`;
const groupOf = (path) => GROUPS.find((g) => path.startsWith(g.dir + '/'));
/** Live progress in a terminal; a short line every 10 s otherwise (logs, CI). */
const PROGRESS = process.stdout.isTTY ? ['--progress', '--stats-one-line'] : ['--stats', '10s', '--stats-one-line', '--stats-log-level', 'NOTICE'];
const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;

function readLock() {
  if (!existsSync(LOCK)) return { files: {} };
  return JSON.parse(readFileSync(LOCK, 'utf8'));
}
function writeLock(lock) {
  const files = Object.fromEntries(Object.entries(lock.files).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(LOCK, JSON.stringify({ storage: 'Google Drive folder khmer-wedding-media (scripts/media-sync.mjs)', files }, null, 2) + '\n');
}

function walk(dir) {
  const abs = join(root, dir);
  if (!existsSync(abs)) return null;
  const out = [];
  for (const name of readdirSync(abs)) {
    if (name.startsWith('.') || name.endsWith('.part')) continue;
    const p = join(abs, name);
    if (statSync(p).isDirectory()) out.push(...walk(toPosix(relative(root, p))));
    else out.push(toPosix(relative(root, p)));
  }
  return out;
}

const sha256 = (abs) =>
  new Promise((res, rej) => {
    const h = createHash('sha256');
    createReadStream(abs)
      .on('data', (d) => h.update(d))
      .on('end', () => res(h.digest('hex')))
      .on('error', rej);
  });

function rclone(args, { quiet = false } = {}) {
  return new Promise((res, rej) => {
    const child = spawn('rclone', args, { cwd: root, stdio: quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit' });
    let log = '';
    child.stdout?.on('data', (d) => (log += d));
    child.stderr?.on('data', (d) => (log += d));
    child.on('error', (e) => rej(e.code === 'ENOENT' ? new Error('rclone is not installed. Run: brew install rclone, then npm run media:login') : e));
    child.on('close', (code) => (code === 0 ? res(log) : rej(new Error(`rclone ${args[0]} failed${log ? ':\n' + log.trim() : ''}`))));
  });
}

async function checkRemote() {
  const name = REMOTE.split(':')[0] + ':';
  const remotes = await rclone(['listremotes'], { quiet: true });
  if (!remotes.split('\n').includes(name)) throw new Error(`Google Drive is not connected on this computer. Run: npm run media:login`);
}

/** A temporary folder (inside the project, so files can be moved, not copied) laid out with the storage names. */
function staging() {
  mkdirSync(join(root, '.media-staging'), { recursive: true });
  const dir = mkdtempSync(join(root, '.media-staging', 'run-'));
  return { dir, done: () => rmSync(dir, { recursive: true, force: true }) };
}

async function push() {
  await checkRemote();
  const lock = readLock();
  const uploads = [];
  for (const g of GROUPS) {
    const files = walk(g.dir);
    if (!files) {
      console.log(`· ${g.dir}: not on this computer, keeping its entries in media.lock.json`);
      continue;
    }
    const local = new Set(files);
    for (const path of Object.keys(lock.files)) if (groupOf(path) === g && !local.has(path)) delete lock.files[path];
    for (const path of files) {
      const hash = await sha256(join(root, path));
      if (has('--all') || lock.files[path] !== hash) uploads.push({ path, hash });
      else lock.files[path] = hash;
    }
  }
  if (!uploads.length) {
    writeLock(lock);
    return console.log('✓ Google Drive already has every file. media.lock.json is up to date.');
  }
  const total = uploads.reduce((n, u) => n + statSync(join(root, u.path)).size, 0);
  console.log(`Uploading ${uploads.length} file(s), ${mb(total)}, to ${REMOTE}…`);
  const stage = staging();
  try {
    for (const { path, hash } of uploads) {
      const to = join(stage.dir, keyFor(path, hash));
      mkdirSync(dirname(to), { recursive: true });
      try {
        linkSync(join(root, path), to);
      } catch {
        copyFileSync(join(root, path), to);
      }
    }
    // Names include the content hash, so a file already in Drive is identical: skip it.
    await rclone(['copy', stage.dir, REMOTE, '--ignore-existing', '--transfers', '4', ...PROGRESS]);
    for (const { path, hash } of uploads) lock.files[path] = hash;
  } finally {
    stage.done();
    writeLock(lock);
  }
  console.log('✓ Uploaded. Commit media.lock.json so the next deploy uses these files.');
}

async function pull() {
  const lock = readLock();
  const wantOriginals = has('--originals');
  const force = has('--force');
  const soft = has('--soft');
  const entries = Object.entries(lock.files).filter(([p]) => {
    const g = groupOf(p);
    return g && (g.site || wantOriginals);
  });
  if (!entries.length) throw new Error('media.lock.json lists no media. Run `npm run media:push` on the computer that has the files.');

  const downloads = [];
  const conflicts = [];
  for (const [path, hash] of entries) {
    const abs = join(root, path);
    if (!existsSync(abs)) downloads.push({ path, hash });
    else if ((await sha256(abs)) !== hash) (force ? downloads : conflicts).push({ path, hash });
  }
  // Files in public/media that the lock does not know would be deployed without being stored in Drive.
  const known = new Set(Object.keys(lock.files));
  const extras = (walk('public/media') ?? []).filter((p) => !known.has(p));

  if (soft && (conflicts.length || extras.length)) {
    console.warn(`⚠ ${conflicts.length + extras.length} media file(s) changed here but not uploaded yet (fine for preview; run npm run media:push before deploying).`);
  } else if (!force && (conflicts.length || extras.length)) {
    for (const c of conflicts) console.error(`  changed here, not uploaded: ${c.path}`);
    for (const p of extras) console.error(`  new here, not uploaded:     ${p}`);
    throw new Error(
      'Local media differs from media.lock.json.\n  Upload it with `npm run media:push` (then commit media.lock.json),\n  or discard the local changes with `npm run media:pull -- --force`.',
    );
  }
  if (force)
    for (const p of extras) {
      rmSync(join(root, p));
      console.log(`  ✗ removed ${p}`);
    }

  if (!downloads.length) return console.log(`✓ Media is up to date (${entries.length} files).`);
  await checkRemote();
  console.log(`Downloading ${downloads.length} file(s) from ${REMOTE}…`);
  const stage = staging();
  try {
    const list = join(stage.dir, '.files');
    writeFileSync(list, downloads.map((d) => keyFor(d.path, d.hash)).join('\n') + '\n');
    const into = join(stage.dir, 'in');
    await rclone(['copy', REMOTE, into, '--files-from-raw', list, '--transfers', '4', ...PROGRESS]);
    for (const { path, hash } of downloads) {
      const got = join(into, keyFor(path, hash));
      if (!existsSync(got)) throw new Error(`${path} is missing from Google Drive. On the computer that has it, run: npm run media:push -- --all`);
      if ((await sha256(got)) !== hash) throw new Error(`Downloaded ${path} does not match media.lock.json`);
      const abs = join(root, path);
      mkdirSync(dirname(abs), { recursive: true });
      renameSync(got, abs);
    }
  } finally {
    stage.done();
  }
  console.log(`✓ Downloaded ${downloads.length} file(s).`);
}

/** One-time Google sign-in: creates the rclone remote. Access is limited to files rclone itself creates. */
async function login() {
  const name = REMOTE.split(':')[0];
  const remotes = await rclone(['listremotes'], { quiet: true });
  if (remotes.split('\n').includes(name + ':')) return console.log(`✓ Already connected ("${name}"). To sign in again: rclone config reconnect ${name}:`);
  console.log('A browser window opens: sign in with your Google account and click Allow.');
  // Quiet: rclone prints the new config (including the sign-in token) when it finishes.
  await rclone(['config', 'create', name, 'drive', 'scope=drive.file'], { quiet: true });
  await rclone(['mkdir', REMOTE], { quiet: true });
  console.log(`✓ Connected. Media is stored in the Google Drive folder "${REMOTE.split(':')[1]}".`);
}

const run = { push, pull, login }[cmd];
if (!run) {
  console.error('Usage: node scripts/media-sync.mjs login | push [--all] | pull [--originals] [--force]');
  process.exit(2);
}
run().catch((e) => {
  if (has('--soft')) {
    // Local preview still starts; missing media just shows as empty frames.
    console.warn(`⚠ Media not synced: ${e.message.split('\n')[0]}`);
    return;
  }
  console.error(`\n✘ ${e.message}`);
  process.exit(1);
});
