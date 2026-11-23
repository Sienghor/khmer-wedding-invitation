/**
 * WEDDING CONTENT CONFIGURATION
 * ---------------------------------------------------------------------------
 * Every piece of wedding information lives here and nowhere else.
 *
 * PLACEHOLDER CONVENTION
 *   Any string wrapped in square brackets, e.g. '[Groom’s name]', is a
 *   placeholder. The UI renders it with a dashed "to be confirmed" style, and
 *   the dev-only banner counts how many remain. Replace each one with the
 *   real value. See docs/CONTENT-CHECKLIST.md for the full list.
 *
 * Template text (invitation formula, ceremony names) follows common Khmer
 * wedding usage. It is marked `template: true`: confirm wording, order and
 * honorifics with both families before publishing.
 */

import { mediaAudio } from './media.generated';

export interface Bi {
  km: string;
  en: string;
}

export interface Person {
  name: Bi;
  /** Short line under the name on the invitation, e.g. "Son of …". */
  role: Bi;
}

export interface ScheduleItem {
  time: Bi;
  title: Bi;
  /** Optional short line under the title. */
  description?: Bi;
}

export interface ScheduleDay {
  /** Heading above the day's rites, e.g. ថ្ងៃព្រហស្បតិ៍ ទី៧ ខែមករា ឆ្នាំ២០២៧. */
  date: Bi;
  items: ScheduleItem[];
}

export const wedding = {
  /**
   * Language on the page. Bilingual (true, the couple's choice): English, smaller,
   * under every Khmer line. Khmer-first (false): English appears only for the
   * couple's names, the date, the map button, the welcome page and the
   * sections listed in englishSections. true: every Khmer line also
   * gets its English translation underneath (all `en` fields below are used).
   */
  display: {
    english: true,
    /** Sections that stay bilingual anyway: practical details a non-Khmer reader (friend, driver, hotel) needs. */
    englishSections: ['details'] as string[],
  },

  meta: {
    /** Used for <title>, share text and the calendar event. */
    title: { km: 'សិរីមង្គលអាពាហ៍ពិពាហ៍', en: 'The Wedding of Chen Sienghor & Nam Saing' } as Bi,
    /** Guest name is read from ?to= or ?guest= in the URL; this is the fallback. */
    defaultGuest: { km: 'ភ្ញៀវកិត្តិយស', en: 'Honoured Guest' } as Bi,
  },

  couple: {
    groom: {
      name: { km: 'ចិន សៀងហ័រ', en: 'Chen Sienghor' },
      role: { km: 'កូនកំលោះ', en: 'The Groom' },
    } as Person,
    bride: {
      // Supplied as “ស៊ំាង” with ំ typed before ា; stored in standard Unicode order (ា then ំ) so it renders correctly.
      name: { km: 'ណាំ ស៊ាំង', en: 'Nam Saing' },
      role: { km: 'កូនក្រមុំ', en: 'The Bride' },
    } as Person,
  },

  parents: {
    // English spellings: common romanisations of the Khmer names (2026-11-23). If a parent
    // writes their name differently (ID card, passport), use that spelling.
    groom: {
      label: { km: 'មាតាបិតាខាងកូនកំលោះ', en: 'Parents of the Groom' } as Bi,
      father: { km: 'លោក ជ្រុន ជ្រឿន', en: 'Mr. Chrun Chroeun' } as Bi,
      mother: { km: 'លោកស្រី អ៊ុល សុខជា', en: 'Mrs. Oul Sokchea' } as Bi,
    },
    bride: {
      label: { km: 'មាតាបិតាខាងកូនក្រមុំ', en: 'Parents of the Bride' } as Bi,
      father: { km: 'លោក ភោគ សារុន', en: 'Mr. Phok Sarun' } as Bi,
      mother: { km: 'លោកស្រី វ៉ង់ គីមស្រ៊ុន', en: 'Mrs. Vong Kimsrun' } as Bi,
    },
  },

  invitation: {
    template: true,
    heading: { km: 'សិរីមង្គលអាពាហ៍ពិពាហ៍', en: 'Auspicious Wedding Ceremony' } as Bi,
    message: {
      km: 'យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាង កញ្ញា អញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធិពរជ័យ សិរីសួស្ដី ជ័យមង្គល ក្នុងពិធីអាពាហ៍ពិពាហ៍របស់កូនប្រុស កូនស្រីរបស់យើងខ្ញុំ។',
      en: 'With great honour, we respectfully invite you to join us as our distinguished guest and bestow your blessings upon our son and daughter on the occasion of their wedding.',
    } as Bi,
  },

  event: {
    /**
     * ISO date-time with offset (Cambodia is +07:00). The guests' event is the wedding
     * reception (ពិធីជប់លៀង): Friday 8 January 2027 at 16:00, as in the programme.
     * The Details card, the countdown and "add to calendar" all use these. `end` (21:00)
     * is an estimate, used only for the calendar entry.
     */
    /** What the date and time on the Details card refer to. */
    label: { km: 'ពិធីជប់លៀងអាពាហ៍ពិពាហ៍', en: 'Wedding Reception' } as Bi,
    start: '2027-01-08T16:00:00+07:00',
    end: '2027-01-08T21:00:00+07:00',
    dateIsPlaceholder: false,
    timeIsPlaceholder: false,
    timeZone: 'Asia/Phnom_Penh',
    venue: {
      name: { km: 'គេហដ្ឋានខាងកូនក្រមុំ', en: 'The Bride’s Family Home' } as Bi,
      address: {
        km: 'ភូមិបែកចាន ឃុំអណ្តូងពោធិ៍ ស្រុកតាំងគោក ខេត្តកំពង់ធំ',
        en: 'Baek Chan Village, Andoung Pou Commune, Taing Kouk District, Kampong Thom',
      } as Bi,
      /** Google Maps search text or a full https://maps.google.com/… link. */
      maps: 'https://maps.app.goo.gl/GQHrGwEfK48T38uT6',
    },
    dressCode: {
      km: 'សូមអញ្ជើញស្លៀកពាក់ពណ៌បៃតងអូលីវ',
      en: 'Please wear olive green',
    } as Bi,
  },

  /**
   * Ceremony programme, as given by the families (2026-11-23). Two days: the
   * monks' blessing and ខាន់ស្លា the afternoon before, the rites on the wedding day.
   * Each item may also take a `description: { km, en }`.
   */
  schedule: [
    {
      date: { km: 'ថ្ងៃព្រហស្បតិ៍ ទី៧ ខែមករា ឆ្នាំ២០២៧', en: 'Thursday 7 January 2027' },
      items: [
        { time: { km: 'ម៉ោង ២:០០ រសៀល', en: '2:00 PM' }, title: { km: 'ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត', en: 'Monks’ Blessing' } },
        { time: { km: 'ម៉ោង ៥:០០ ល្ងាច', en: '5:00 PM' }, title: { km: 'ពិធីកាត់ខាន់ស្លា', en: 'Khan Sla Ceremony' } },
      ],
    },
    {
      date: { km: 'ថ្ងៃសុក្រ ទី៨ ខែមករា ឆ្នាំ២០២៧', en: 'Friday 8 January 2027' },
      items: [
        { time: { km: 'ម៉ោង ៧:០០ ព្រឹក', en: '7:00 AM' }, title: { km: 'ពិធីហែជំនូន និងរៀបរាប់ផ្លែឈើ', en: 'Procession of Gifts & Presenting the Fruit' } },
        { time: { km: 'ម៉ោង ៩:០០ ព្រឹក', en: '9:00 AM' }, title: { km: 'ពិធីកាត់សក់បង្កក់សិរី', en: 'Hair-Cutting Ceremony' } },
        { time: { km: 'ម៉ោង ១០:៣០ ព្រឹក', en: '10:30 AM' }, title: { km: 'ពិធីសំពះផ្ទឹម និងសែនចងដៃ', en: 'Sampeah Phtoem & Wrist-Tying Blessing' } },
        { time: { km: 'ម៉ោង ១១:០០ ព្រឹក', en: '11:00 AM' }, title: { km: 'ពិធីបង្វិលពពិល', en: 'Circling of the Candle Flame' } },
        { time: { km: 'ម៉ោង ៤:០០ រសៀល', en: '4:00 PM' }, title: { km: 'ពិធីជប់លៀងអាពាហ៍ពិពាហ៍', en: 'Wedding Reception' } },
      ],
    },
  ] as ScheduleDay[],

  story: {
    /** Behind-the-scenes clips (keys from media.generated.ts). Play as silent loops. */
    films: {
      heading: { km: 'ក្រោយឆាកថតរូប', en: 'Behind the Scenes' } as Bi,
      clips: [
        { media: 'bts-traditional', label: { km: 'ឈុតប្រពៃណីខ្មែរ', en: 'Khmer traditional' } as Bi },
        { media: 'bts-western', label: { km: 'ឈុតអាពាហ៍ពិពាហ៍សម័យ', en: 'White wedding' } as Bi },
        { media: 'bts-stairs', label: { km: 'ឈុតលើជណ្ដើរផ្កា', en: 'On the flower stairs' } as Bi },
      ],
    },
  },

  /**
   * 06 · Blessings (ផ្ញើពរជ័យ). Khmer weddings do not ask guests to confirm
   * attendance, so instead of an RSVP form guests may leave a blessing.
   */
  blessings: {
    /**
     * Where blessings are sent (JSON POST). The Cloudflare Worker in worker/
     * stores them in D1; read them at /admin on the live site. In `npm run dev`
     * there is no Worker, so blessings stay in the browser (demo mode).
     */
    endpoint: (import.meta.env.PROD ? '/api/blessings' : null) as string | null,
    /**
     * One-tap suggestions for guests who prefer not to type (tapping adds the
     * text to the message). Template wording: review and edit freely.
     */
    suggestions: [
      {
        label: 'អាយុ វណ្ណៈ សុខៈ ពលៈ',
        km: 'សូមជូនពរឱ្យគូស្វាមីភរិយា ប្រកបដោយពរទាំងបួនប្រការ គឺ អាយុ វណ្ណៈ សុខៈ ពលៈ។',
        en: 'The four blessings: long life, beauty, happiness and strength.',
      },
      {
        label: 'ស្រឡាញ់គ្នារហូតដល់សក់ស',
        km: 'សូមឱ្យស្រឡាញ់គ្នា និងរស់នៅជាមួយគ្នារហូតដល់សក់ស។',
        en: 'Love each other until your hair turns white.',
      },
      {
        label: 'គ្រួសារសុខដុមរមនា',
        km: 'សូមឱ្យគ្រួសារថ្មីពោរពេញដោយសុភមង្គល និងភាពសុខដុមរមនា។',
        en: 'May your new family be full of happiness and harmony.',
      },
    ],
    template: true,
  },

  closing: {
    heading: { km: 'សូមអរគុណ', en: 'With Gratitude' } as Bi,
    message: {
      km: 'វត្តមាន និងពរជ័យរបស់លោកអ្នក គឺជាកិត្តិយសដ៏ខ្ពង់ខ្ពស់សម្រាប់ក្រុមគ្រួសារយើងខ្ញុំ។',
      en: 'Your presence and blessings are the greatest honour to our families.',
    } as Bi,
    signature: { km: 'ចិន សៀងហ័រ និង ណាំ ស៊ំាង', en: 'Sienghor & Saing' } as Bi,
  },

  /**
   * Background music. The file is processed from src/music by `npm run media`
   * (see scripts/process-media.mjs). Set src to null to remove music and its button.
   */
  music: {
    src: (mediaAudio['wedding-song']?.src ?? null) as string | null,
    title: 'ភូមាចាប់កង្កែប',
    artist: 'ហុី ភារុណ',
  },
};

export type Wedding = typeof wedding;
