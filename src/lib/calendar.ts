import { wedding } from '../config/wedding';
import { eventEnd, eventStart } from './date';
import { stripBrackets } from './text';

const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

function details() {
  const v = wedding.event.venue;
  return {
    title: stripBrackets(`${wedding.meta.title.km} · ${wedding.meta.title.en}`),
    location: stripBrackets(`${v.name.en}, ${v.address.en}`),
    description: stripBrackets(wedding.invitation.message.en) + (typeof location !== 'undefined' ? `\n${location.origin}${location.pathname}` : ''),
  };
}

export function googleCalendarUrl() {
  const d = details();
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: d.title,
    dates: `${icsDate(eventStart())}/${icsDate(eventEnd())}`,
    details: d.description,
    location: d.location,
    ctz: wedding.event.timeZone,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export function downloadIcs() {
  const d = details();
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Khmer Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${icsDate(eventStart())}-wedding@invitation`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(eventStart())}`,
    `DTEND:${icsDate(eventEnd())}`,
    `SUMMARY:${esc(d.title)}`,
    `LOCATION:${esc(d.location)}`,
    `DESCRIPTION:${esc(d.description)}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'wedding-invitation.ics' });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
