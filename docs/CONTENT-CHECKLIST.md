# Content Checklist: what you can fill in or change yourself

Everything a guest reads lives in **`src/config/wedding.ts`**. Photos are in **`src/config/photos.ts`** and colours in **`src/config/theme.ts`**. You never need to touch a component.

**Placeholder rule:** any text in `[square brackets]` is a placeholder. It shows with a dashed underline on the page, and in development a banner counts how many remain. Replace the brackets *and* their contents.

Legend: ✅ filled · ✏️ yours to fill · 🔍 please review (template wording)

**Language:** every section is bilingual: Khmer first, English smaller underneath (`display.english: true` in `wedding.ts`). Fill in the `en` fields too, including the parents' English names.

---

## 1. Couple: `wedding.couple`

| Field | Khmer | English | Status |
|---|---|---|---|
| Groom | ចិន សៀងហ័រ | Chen Sienghor | ✅ |
| Bride | ណាំ ស៊ាំង | Nam Saing | ✅ (see note) |

> **Spelling note (bride):** the name was supplied as `ស៊ំាង`, with the vowel sign ំ typed *before* ា. Unicode requires ា then ំ, as in your correct `ណាំ`. The reversed order renders with a broken dotted circle in many fonts. It is stored as **ស៊ាំង**: the same letters in standard order. If you paste names from elsewhere, check this the same way.

## 2. Parents: `wedding.parents`

| Field | Khmer | English | Status |
|---|---|---|---|
| Groom's father | លោក ជ្រុន ជ្រឿន | `Mr. [Father’s name in English]` | ✅ km · ✏️ en |
| Groom's mother | លោកស្រី អ៊ុល សុខជា | `Mrs. [Mother’s name in English]` | ✅ km · ✏️ en |
| Bride's father | លោក ភោគ សារុន | `Mr. [Father’s name in English]` | ✅ km · ✏️ en |
| Bride's mother | លោកស្រី វ៉ង់ គីមស្រ៊ុន | `Mrs. [Mother’s name in English]` | ✅ km · ✏️ en |

English spellings weren't supplied, and romanising Khmer names has several valid spellings, so the family should choose them. Honorifics (លោក / លោកស្រី, Mr. / Mrs.) can be changed to ឯកឧត្តម, លោកជំទាវ, etc.

## 3. Date & venue: `wedding.event`

| Field | Current | Status |
|---|---|---|
| `start` | `2027-01-08T07:00:00+07:00` | ✅ date (Friday 8 January 2027) · ✏️ **time 07:00 is a placeholder**. Format: `YYYY-MM-DDTHH:MM:00+07:00` |
| `end` | `2027-01-08T21:00:00+07:00` | ✏️ end time (used for calendar invites) |
| `dateIsPlaceholder` | `false` | ✅ |
| `timeIsPlaceholder` | `true` | ✏️ set to `false` once the real start time is in `start` (until then the page shows "[ម៉ោង · Time]" and the countdown counts to 07:00) |
| `venue.name` | `[ឈ្មោះទីកន្លែង]` / `[Venue name]` | ✏️ |
| `venue.address.km` | `[អាសយដ្ឋាន ជាភាសាខ្មែរ]` | ✏️ |
| `venue.address.en` | `NR6, Khum Andoung Pou` | ✅ from your Maps link. Edit if you prefer |
| `venue.maps` | `https://maps.app.goo.gl/GQHrGwEfK48T38uT6` | ✅ ("Directions" button) |
| `dressCode` km / en | olive green | ✅ |
| `notes` (2 items) km / en | placeholders (e.g. parking, arrival) | ✏️ add or remove items freely |

The countdown, Khmer date (ថ្ងៃ… ទី… ខែ… ឆ្នាំ…), calendar links and .ics file all derive from `start` and `end`.

## 4. Programme: `wedding.schedule`

Six traditional rites in a common order: ពិធីហែជំនូន, ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត, ពិធីកាត់សក់បង្កក់សិរី, ពិធីបង្វិលពពិល, ពិធីសំពះផ្ទឹម និងចងដៃ, ពិធីជប់លៀងអាពាហ៍ពិពាហ៍.

| Per item | Status |
|---|---|
| `time` (e.g. `07:00`) | ✏️ ×6 |
| `description` km / en | ✏️ ×6 (optional; can be short) |
| `title` | 🔍 confirm names and order with the families; add, remove or reorder freely |

## 5. Photo album: `wedding.story`

Section 04 is **កម្រងរូបភាព** (photo album): the photo gallery and the behind-the-scenes clips. The written story chapters were removed (a Western template, rare in Khmer invitations), so there's no story text to write.

| Field | Status |
|---|---|
| `films.heading` | ✅ "ក្រោយឆាកថតរូប / Behind the Scenes" |
| `films.clips[].label` | ✅ editable |

## 6. Blessings: `wedding.blessings`

Khmer weddings don't ask guests to confirm attendance, so section 06 lets guests leave a blessing instead (no RSVP, no headcount).

| Field | Status |
|---|---|
| `endpoint` | ✅ `/api/blessings` on the live site (Cloudflare Worker + D1, see docs/DEPLOY.md). Read blessings at `/admin`. In `npm run dev` it falls back to demo mode. |
| `suggestions` | 🔍 three one-tap blessings (the four blessings អាយុ វណ្ណៈ សុខៈ ពលៈ; love until your hair turns white; a harmonious family). Template wording: edit freely. |

Each blessing sends `{ name, message, submittedAt }`.

## 7. Wording to review: 🔍

| Field | Note |
|---|---|
| `invitation.message` (km / en) | Standard formal Khmer invitation formula. Check honorifics and wording with the families. |
| `closing.message` (km / en) | Thank-you text |
| `closing.signature` | ✅ ចិន សៀងហ័រ និង ណាំ ស៊ាំង / Sienghor & Saing |
| `meta.title` | ✅ "The Wedding of Chen Sienghor & Nam Saing" (browser tab, share text, calendar) |

## 8. Photos & video: `src/config/photos.ts`

Your originals in `src/image` and `src/video` were processed by `npm run media` into `public/media/` (WebP, 4 sizes each, with blur-up previews; videos as silent H.264 MP4). The originals are untouched.

| Slot | Photo | Why |
|---|---|---|
| Hero (first view after the doorway) | AP3I6335 | Intimate traditional pose; gold silk against dark wood suits the lintel above |
| Groom portrait | crop of AP3I6331 | No solo shots were supplied; cropped waist-up from the full-length portrait |
| Bride portrait | crop of AP3I6331 | Same source, so both portraits match in light and outfit |
| Gallery (8) | all eight, alternating the traditional and white-wedding sets | |
| Behind the scenes | IMG_6659 (traditional) · IMG_6694 and IMG_6699 (white wedding) | Phone clips, silent loops. **6694 is cropped to remove the crew member filming on the right.** |

**To swap a photo:** change the media key on that slot's line (e.g. `'AP3I6335'` → `'AP3I6346'`).
**To add new photos or clips:** put them in `src/image` / `src/video`, add them to `SOURCES` in `scripts/process-media.mjs`, run `npm run media`, then reference the key in `photos.ts`.
**Alt text** (read by screen readers) is the third argument of each slot. Edit freely.

## 9. Look & feel: `src/config/theme.ts`

| Setting | Options |
|---|---|
| `ACTIVE_THEME` | `'olive'` (current) or `'burgundy'`. Preview the other without editing: add `?theme=burgundy` to the URL. |
| Palette values | Each preset's colours can be edited. Gold and sandstone are the carvings' material colours; keep them if you want the ornaments to stay authentic-looking. |

## 10. Optional

| Field | Purpose |
|---|---|
| `wedding.music` | ✅ ភូមាចាប់កង្កែប · ហុី ភារុណ (from `src/music`, processed by `npm run media` to a 128 kbps MP3). It starts when the guest taps "open"; a button at the top right pauses it, and that choice is remembered. Set `src: null` to remove the music. |
| Guest links | Send each guest `https://<your-site>/?to=Guest%20Name`. The opening greets them by name and pre-fills the blessing form. |

---

**After editing:** run `npm run verify` (type check, heritage check, build). Fix anything it reports before publishing.
