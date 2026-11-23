# Deployment guide (Cloudflare)

How the invitation is hosted, how to publish changes, how to read and back up guests' blessings, and what to do when something goes wrong.

| | |
|---|---|
| **Live site** | https://sienghor-saing.sienghor.workers.dev |
| **Blessings (private)** | https://sienghor-saing.sienghor.workers.dev/admin (needs the admin key) |
| **Cloudflare account** | `a69a80d7fbb8f3b37beecf3e3ed7d9fa` (Chensienghor@gmail.com's Account) |
| **Publish changes** | `npm run deploy` |

---

## 1. How it works

```
 Guest's phone
      │
      ▼
 sienghor-saing.sienghor.workers.dev ── Cloudflare Worker "sienghor-saing"
      │
      ├── /api/blessings, /admin ──► worker/index.ts ──► D1 database "wedding-blessings"
      │
      └── everything else ─────────► static files from dist/ (page, photos, videos, music)
```

| Piece | Cloudflare product | In this project |
|---|---|---|
| The invitation (HTML, JS, fonts, photos, videos, music) | Worker static assets | `dist/` (built by `npm run build`), configured in `wrangler.jsonc` → `assets` |
| Blessings API | Worker | `worker/index.ts` |
| Private blessings page `/admin` | Worker | `worker/admin.ts` |
| Blessings storage | D1 database `wedding-blessings` (Asia-Pacific) | table defined in `migrations/` |
| Admin key | Worker secret `ADMIN_KEY` | never stored in the project |
| Cache and security headers | Static asset headers | `public/_headers` |

Static files are served directly by Cloudflare. The Worker code only runs for `/api/*` and `/admin`, so photos and videos don't use up Worker requests.

**Blessings API**

| Request | Who | Result |
|---|---|---|
| `POST /api/blessings` with `{ name, message }` | guests (the form) | `201` saved · `400` empty · `413` too long · `429` too many |
| `GET /api/blessings` with header `Authorization: Bearer <ADMIN_KEY>` | you | list of blessings, newest first · `401` without the key |

**Spam protection:** a hidden "honeypot" field that only bots fill in (they get a fake "ok"), at most 5 blessings per visitor per 10 minutes, name ≤ 120 and message ≤ 1000 characters.

**Privacy:** each blessing stores the name, message, country (from Cloudflare) and time. The visitor's IP address is never stored; only a one-way hash of it, used for the rate limit.

---

## 2. Before you start (each computer)

1. **Node.js 22 or newer** and the project's packages: `npm install`. This also installs Wrangler, Cloudflare's command-line tool, inside the project.
2. **Log in to Cloudflare** (opens the browser; click **Allow**):

   ```bash
   npx wrangler login
   npx wrangler whoami      # should show Chensienghor@gmail.com's Account
   ```

3. `ffmpeg` is only needed if you add new photos, videos or music (`brew install ffmpeg`).

---

## 3. Publishing a change (everyday workflow)

The live site never changes by itself. After any change, publish:

```bash
npm run deploy
```

This runs every check first (TypeScript, Worker types, heritage policy, production build) and stops if anything fails, so a broken build is never published. A successful run ends with:

```
Deployed sienghor-saing triggers
  https://sienghor-saing.sienghor.workers.dev
Current Version ID: …
```

Open the site on your phone to confirm. Guests who already had it open see the new version on their next visit.

### Common changes

| You want to… | Edit | Then |
|---|---|---|
| Fill in the time, venue, parents' names, programme, story | `src/config/wedding.ts` (list: `docs/CONTENT-CHECKLIST.md`) | `npm run deploy` |
| Choose which photo goes where | `src/config/photos.ts` | `npm run deploy` |
| Add a new photo, video or song | put the original in `src/image`, `src/video` or `src/music`, add it to `SOURCES` in `scripts/process-media.mjs` | `npm run media`, then `npm run deploy` |
| Change the blessing suggestions | `blessings.suggestions` in `src/config/wedding.ts` | `npm run deploy` |
| Change the colours | `src/config/theme.ts` | `npm run deploy` |

### Try it locally first (optional)

```bash
npm run dev       # fast preview at http://localhost:5173 (blessings stay in the browser: demo mode)
npm run cf:dev    # the real Worker + a local database at http://localhost:8787
```

`cf:dev` uses a local copy of the database (in `.wrangler/`), never the live one. The first time, create its table with `npx wrangler d1 migrations apply wedding-blessings --local`.

---

## 4. Before sharing the link with guests

- [ ] Every placeholder is filled. In `npm run dev`, the dark banner at the top left must show **0** placeholders.
- [ ] `timeIsPlaceholder: false` and the correct `event.start` and `event.end` in `src/config/wedding.ts`.
- [ ] Both families have reviewed the Khmer wording (invitation text, programme, blessing suggestions).
- [ ] `npm run deploy` succeeded after the last change.
- [ ] On your own phone: the opening, music, map link, "add to calendar", and sending a test blessing (then delete it, see §5).
- [ ] A personal link works: `https://sienghor-saing.sienghor.workers.dev/?to=Guest%20Name` greets the guest by name.

Send each guest their own link: `…/?to=` followed by their name (spaces as `%20`).

---

## 5. Guests' blessings

### Reading them

Open **/admin** on the live site and enter the admin key. The page remembers the key on that device; **Forget key** removes it. **Download CSV** saves every blessing as a spreadsheet that opens in Excel or Google Sheets with Khmer text intact.

From the terminal:

```bash
npx wrangler d1 execute wedding-blessings --remote \
  --command "SELECT name, message, created_at FROM blessings ORDER BY created_at DESC"
```

Times are stored in UTC. The /admin page shows them in Phnom Penh time.

### Deleting one (spam or a test)

```bash
# find its id
npx wrangler d1 execute wedding-blessings --remote --command "SELECT id, name, substr(message,1,40) FROM blessings ORDER BY id DESC LIMIT 20"
# delete it
npx wrangler d1 execute wedding-blessings --remote --command "DELETE FROM blessings WHERE id = 12"
```

### Backups

```bash
npm run db:backup     # → backups/blessings-YYYY-MM-DD-HHMM.sql
```

Run it now and then, and certainly after the wedding. The `backups/` folder holds guests' names and messages, so keep it private (it is excluded from git).

D1 also keeps its own history for **30 days** (Time Travel). To undo a mistake, such as deleting the wrong rows:

```bash
npx wrangler d1 time-travel restore wedding-blessings --timestamp 2027-01-08T10:00:00+07:00
```

This replaces the whole database with its state at that moment, so take a `db:backup` first.

---

## 6. Undoing a bad deploy

Every deploy is kept as a version. To go back:

```bash
npx wrangler deployments list           # recent deploys, with version IDs
npx wrangler rollback                   # back to the previous version
npx wrangler rollback <version-id> -m "reason"
```

A rollback changes the site code and files only. Blessings in the database are not touched.

---

## 7. The admin key

- It is stored only as a Cloudflare secret (`ADMIN_KEY`) and in your own records, never in the project files.
- **Lost it, or someone else has it?** Set a new one. The old key stops working immediately:

  ```bash
  npx wrangler secret put ADMIN_KEY      # paste the new key when asked
  ```

  To generate a strong key: `openssl rand -base64 18`.
- For `npm run cf:dev`, the local key lives in `.dev.vars` (`ADMIN_KEY=…`). That file is excluded from git.

---

## 8. Adding a real domain

The free address ends in `workers.dev`. To use your own (e.g. `sienghor-saing.com`):

1. **Get the domain onto Cloudflare**
   - **Buy it in Cloudflare:** Dashboard → Domain Registration → Register Domains (about US$10 a year). It is ready immediately.
   - **Already own it elsewhere:** Dashboard → Add a domain, then change its nameservers at your registrar to the two Cloudflare gives you. Wait until it shows **Active** (minutes to 24 hours).
2. **Connect it.** In `wrangler.jsonc`, add:

   ```jsonc
   "routes": [
     { "pattern": "sienghor-saing.com", "custom_domain": true },
     { "pattern": "www.sienghor-saing.com", "custom_domain": true }
   ]
   ```

3. Run `npm run deploy`. Cloudflare creates the DNS records and the HTTPS certificate automatically, usually within a few minutes.
4. Optional: keep the `workers.dev` address working (default), or turn it off with `"workers_dev": false`. Links you already sent keep working only while it stays on.

---

## 9. Logs and troubleshooting

```bash
npx wrangler tail          # live log of every request to the Worker (Ctrl+C to stop)
```

Logs are also in the Dashboard: Workers & Pages → **sienghor-saing** → Logs.

| Problem | Likely cause | Fix |
|---|---|---|
| `npm run deploy` stops before uploading | a check failed (TypeScript, heritage, build) | read the first error; fix it; deploy again |
| `Not logged in` / `Authentication error` | Wrangler login expired | `npx wrangler login` |
| Site still shows the old version | browser cache | reload; open in a private tab. Photos and media are cached for 1 day, so a replaced file can take up to a day for returning guests (give it a new name in `SOURCES` to update immediately) |
| Guest says "could not be sent" | they sent more than 5 blessings in 10 minutes, or had no connection | wait and retry; check `npx wrangler tail` |
| /admin says "Wrong key" | key typed incorrectly or changed | check the key; reset it (§7) if lost |
| `no such table: blessings` | a new database without its table | `npm run db:migrate` |
| Music doesn't start | browsers only allow sound after a tap | expected; it starts on "open invitation" or the first tap |

---

## 10. Costs

Everything runs on Cloudflare's **free plan**. Limits at the time of writing (check the Workers and D1 pricing pages for current figures):

| Resource | Free allowance | This invitation |
|---|---|---|
| Static files (page, photos, videos, music) | unlimited requests | all page views |
| Worker requests (`/api`, `/admin`) | 100,000 per day | one per blessing sent or admin page load |
| D1 storage | 5 GB | a few kilobytes per blessing |
| D1 writes | 100,000 rows per day | one per blessing |

A wedding's traffic is far below these limits. The only possible cost is a custom domain (about US$10 a year).

---

## 11. Setting it up from scratch

Needed only for a new Cloudflare account or to rebuild everything. The current setup already exists.

```bash
npm install
npx wrangler login

# 1. Database (Asia-Pacific), then copy the printed database_id into wrangler.jsonc → d1_databases
npx wrangler d1 create wedding-blessings --location apac

# 2. Create its table
npm run db:migrate

# 3. Account ID: put yours in wrangler.jsonc → account_id (shown by `npx wrangler whoami`)
#    Free address: open Workers & Pages in the dashboard once, or wrangler asks on first deploy

# 4. Publish, then set the admin key (save the generated key in your password manager first)
npm run deploy
openssl rand -base64 18                 # generates a key; copy it
npx wrangler secret put ADMIN_KEY       # paste it when asked
```

After changing `wrangler.jsonc` bindings, regenerate the Worker types with `npx wrangler types worker/worker-configuration.d.ts`.

---

## 12. Command reference

| Command | What it does |
|---|---|
| `npm run deploy` | check, build and publish |
| `npm run dev` | local preview (no Worker; blessings in demo mode) |
| `npm run cf:dev` | local preview with the real Worker and a local database |
| `npm run media` | process photos, videos and music for the web |
| `npm run qa` | full browser QA against the local Worker: run `npm run cf:dev` first (and once, `npx wrangler d1 migrations apply wedding-blessings --local`). `node scripts/qa.mjs <url>` tests another address; on the live site it sends a "QA Guest" blessing, so delete it after |
| `npm run db:migrate` | apply new `migrations/*.sql` files to the live database |
| `npm run db:backup` | download the live database to `backups/` |
| `npx wrangler tail` | live logs |
| `npx wrangler deployments list` / `npx wrangler rollback` | deploy history / undo a deploy |
| `npx wrangler secret put ADMIN_KEY` | change the admin key |
| `npx wrangler d1 info wedding-blessings` | database size and state |
