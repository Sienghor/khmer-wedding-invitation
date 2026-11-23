import { useId, useRef, useState, type FormEvent } from 'react';
import { wedding } from '../config/wedding';
import { SectionHeader } from '../components/SectionHeader';
import { Glass } from '../glass/Glass';
import { Reveal } from '../motion/Reveal';
import { readGuest } from '../lib/guest';
import { blessingMode, sendBlessing } from '../lib/blessings';
import { downloadIcs, googleCalendarUrl } from '../lib/calendar';
import { shareInvitation, type ShareResult } from '../lib/share';
import { EN } from '../lib/lang';
import s from './Blessings.module.css';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'done'; demo: boolean } | { kind: 'error'; message: string };

/**
 * 06 · Blessings (ផ្ញើពរជ័យ). Khmer weddings do not ask guests to confirm
 * attendance, so guests may simply leave a blessing for the couple. Also:
 * add to calendar, share.
 */
export function Blessings() {
  const guest = readGuest();
  const id = useId();
  const message = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [share, setShare] = useState<ShareResult | null>(null);
  const { suggestions } = wedding.blessings;

  function addSuggestion(text: string) {
    const el = message.current;
    if (!el) return;
    el.value = el.value.trim() ? `${el.value.trim()} ${text}` : text;
    el.focus();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') ?? '').trim();
    const text = String(fd.get('message') ?? '').trim();
    if (!name || !text) return;
    setStatus({ kind: 'sending' });
    const res = await sendBlessing({ name, message: text.slice(0, 1000), submittedAt: new Date().toISOString(), website: String(fd.get('website') ?? '') });
    setStatus(res.ok ? { kind: 'done', demo: res.mode === 'demo' } : { kind: 'error', message: res.error });
  }

  return (
    <section className={s.section} aria-labelledby="blessings-title" id="blessings">
      <div className={s.inner}>
        <SectionHeader km="ផ្ញើពរជ័យ" en="Blessings for the Couple" tone="light" id="blessings-title" />
        <Reveal as="p" className={s.intro}>
          <span lang="km">សូមផ្ញើពរជ័យ និងពាក្យជូនពរដល់គូស្វាមីភរិយា</span>
          {EN && <span lang="en">Leave a few words of blessing for the couple</span>}
        </Reveal>

        <Reveal variant="scale" i={1}>
          <Glass className={s.card}>
            {status.kind === 'done' ? (
              <div className={s.thanks} role="status">
                <p lang="km" className={s.thanksKm}>
                  សូមអរគុណចំពោះពរជ័យដ៏ថ្លៃថ្លារបស់លោកអ្នក។
                </p>
                {EN && (
                  <p lang="en" className={s.thanksEn}>
                    Thank you for your blessing.
                  </p>
                )}
                {status.demo && import.meta.env.DEV && <p className={s.demo}>Demo mode: no blessings endpoint is configured, so this blessing was saved in this browser only.</p>}
                <button type="button" className={s.linkBtn} onClick={() => setStatus({ kind: 'idle' })}>
                  <span lang="km">ផ្ញើពរជ័យម្ដងទៀត</span>
                  {EN && ' · Send another'}
                </button>
              </div>
            ) : (
              <form className={s.form} onSubmit={onSubmit} aria-describedby={blessingMode() === 'demo' && import.meta.env.DEV ? `${id}-demo` : undefined}>
                <label className={s.field}>
                  <span className={s.label}>
                    <span lang="km">ឈ្មោះ</span>
                    {EN && ' · Name'}
                  </span>
                  <input name="name" required autoComplete="name" defaultValue={guest.personalised ? guest.en : ''} maxLength={120} className={s.input} />
                </label>

                <div className={s.field}>
                  <label className={s.label} htmlFor={`${id}-msg`}>
                    <span lang="km">ពាក្យជូនពរ</span>
                    {EN && ' · Your blessing'}
                  </label>
                  <div className={s.chips} role="group" aria-label="ពាក្យជូនពរគំរូ (ចុចដើម្បីបន្ថែម)">
                    {suggestions.map((b) => (
                      <button key={b.label} type="button" className={s.chip} onClick={() => addSuggestion(b.km)} title={b.en}>
                        <span lang="km">{b.label}</span>
                      </button>
                    ))}
                  </div>
                  <textarea ref={message} id={`${id}-msg`} name="message" required rows={4} maxLength={1000} className={s.input} />
                </div>

                {/* Spam trap: invisible to guests and screen readers. */}
                <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className={s.trap} />

                <button type="submit" className={s.submit} disabled={status.kind === 'sending'}>
                  {status.kind === 'sending' ? (
                    <span lang="km">កំពុងផ្ញើ…</span>
                  ) : (
                    <>
                      <span lang="km">ផ្ញើពរជ័យ</span>
                      {EN && ' · Send blessing'}
                    </>
                  )}
                </button>
                {status.kind === 'error' && (
                  <p className={s.error} role="alert">
                    <span lang="km">សូមអភ័យទោស មិនអាចផ្ញើពរជ័យបានទេ។ សូមព្យាយាមម្ដងទៀត។</span>
                    {EN && ` Sorry, the blessing could not be sent (${status.message}). Please try again.`}
                  </p>
                )}
                {blessingMode() === 'demo' && import.meta.env.DEV && (
                  <p className={s.demo} id={`${id}-demo`}>
                    Demo mode: set <code>blessings.endpoint</code> in the wedding config to receive blessings.
                  </p>
                )}
              </form>
            )}
          </Glass>
        </Reveal>

        <Reveal className={s.extras} i={2}>
          <a className={s.pill} href={googleCalendarUrl()} target="_blank" rel="noreferrer">
            Google Calendar
          </a>
          <button type="button" className={s.pill} onClick={downloadIcs}>
            <span lang="km">ប្រតិទិន</span> · .ics
          </button>
          <button type="button" className={s.pill} onClick={async () => setShare(await shareInvitation())}>
            <span lang="km">ចែករំលែក</span>
            {EN && ' · Share'}
          </button>
          <span className={s.shareStatus} role="status">
            {share === 'copied' ? (EN ? 'បានចម្លងតំណ · Link copied' : 'បានចម្លងតំណ') : share === 'failed' ? (EN ? 'មិនអាចចែករំលែកបានទេ · Copy the address bar link instead.' : 'មិនអាចចែករំលែកបានទេ។ សូមចម្លងតំណពីរបារអាសយដ្ឋាន។') : ''}
          </span>
        </Reveal>
      </div>
    </section>
  );
}
