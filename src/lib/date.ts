import { wedding } from '../config/wedding';

const tz = wedding.event.timeZone;

export const eventStart = () => new Date(wedding.event.start);
export const eventEnd = () => new Date(wedding.event.end);

function fmt(locale: string, opts: Intl.DateTimeFormatOptions, d: Date) {
  try {
    return new Intl.DateTimeFormat(locale, { timeZone: tz, ...opts }).format(d);
  } catch {
    return new Intl.DateTimeFormat('en-GB', { timeZone: tz, ...opts }).format(d);
  }
}

/*
 * Khmer weekday and Gregorian month names, formatted explicitly: some browsers ship
 * without Khmer calendar data and would print English names with Khmer digits.
 */
const KM_WEEKDAYS = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
const KM_MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];

function khmerDate(d: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(d).map((p) => [p.type, p.value]),
  );
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  return `ថ្ងៃ${KM_WEEKDAYS[wd]} ទី${toKhmerDigits(parts.day)} ខែ${KM_MONTHS[Number(parts.month) - 1]} ឆ្នាំ${toKhmerDigits(parts.year)}`;
}

function khmerTime(d: Date) {
  const [h, m] = fmt('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }, d).split(':').map(Number);
  const period = h < 12 ? 'ព្រឹក' : h === 12 ? 'ថ្ងៃត្រង់' : h < 17 ? 'រសៀល' : h < 19 ? 'ល្ងាច' : 'យប់';
  const h12 = h % 12 || 12;
  return `ម៉ោង ${toKhmerDigits(h12)}:${toKhmerDigits(String(m).padStart(2, '0'))} ${period}`;
}

export function formatEventDate(d = eventStart()) {
  return {
    km: khmerDate(d),
    en: fmt('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }, d),
    time: fmt('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }, d),
    /** e.g. ម៉ោង ៤:០០ រសៀល (formatted by hand: Khmer day-period names vary between browsers). */
    timeKm: khmerTime(d),
    /** e.g. 4:00 PM */
    timeEn: fmt('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }, d),
    short: fmt('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }, d).replace(/\//g, ' · '),
    day: fmt('en-GB', { day: '2-digit' }, d),
    month: fmt('en-GB', { month: 'long' }, d),
    year: fmt('en-GB', { year: 'numeric' }, d),
  };
}

const KHMER_DIGITS = '០១២៣៤៥៦៧៨៩';
export const toKhmerDigits = (s: string | number) => String(s).replace(/\d/g, (c) => KHMER_DIGITS[Number(c)]);
