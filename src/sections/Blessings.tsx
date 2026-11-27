import { useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent, type Ref } from 'react';
import { wedding } from '../config/wedding';
import { SectionHeader } from '../components/SectionHeader';
import { Glass } from '../glass/Glass';
import { Reveal } from '../motion/Reveal';
import { RomdoulFlower } from '../ornaments/RomdoulFlower';
import { readGuest } from '../lib/guest';
import { blessingMode, sendBlessing } from '../lib/blessings';
import { downloadIcs, googleCalendarUrl } from '../lib/calendar';
import { shareInvitation, type ShareResult } from '../lib/share';
import { EN } from '../lib/lang';
import s from './Blessings.module.css';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  /** Sent: the button's thread closes and the form folds away before the thanks appear. */
  | { kind: 'sealing'; demo: boolean }
  | { kind: 'done'; demo: boolean }
  | { kind: 'error'; message: string };

const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** How long the button thread takes to close and the form to fold before the thanks view mounts. */
const SEAL_MS = 460;

/**
 * 06 · Blessings (ផ្ញើពរជ័យ). Khmer weddings do not ask guests to confirm
 * attendance, so guests may simply leave a blessing for the couple. Also:
 * add to calendar, share.
 *
 * Each blessing sent is shown as one antique-gold thread tied around a lotus
 * rosette (after the wrist-tying blessing in the programme, where guests tie a
 * thread while speaking their wishes). The thread's colour is the site gold:
 * the colour of the cord used by the families is not depicted.
 */
export function Blessings() {
  const guest = readGuest();
  const id = useId();
  const message = useRef<HTMLTextAreaElement>(null);
  const card = useRef<HTMLElement | null>(null);
  const submitBtn = useRef<HTMLButtonElement>(null);
  const borderPath = useRef<SVGPathElement>(null);
  const againBtn = useRef<HTMLButtonElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const fromHeight = useRef<number | null>(null);
  const focusAfter = useRef<'thanks' | 'form' | null>(null);
  const progress = useRef<Animation | null>(null);
  const timer = useRef(0);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [strands, setStrands] = useState(0);
  const [btnBox, setBtnBox] = useState<{ w: number; h: number } | null>(null);
  const [share, setShare] = useState<ShareResult | null>(null);
  const [calOpened, setCalOpened] = useState(false);
  const { suggestions } = wedding.blessings;
  const view = status.kind === 'done' ? 'thanks' : 'form';

  useEffect(() => () => clearTimeout(timer.current), []);

  /** FLIP the card's height between the form and the thanks view, then move focus. */
  useLayoutEffect(() => {
    const el = card.current;
    const from = fromHeight.current;
    fromHeight.current = null;
    if (focusAfter.current === 'thanks') againBtn.current?.focus({ preventScroll: true });
    if (focusAfter.current === 'form') nameInput.current?.focus({ preventScroll: true });
    focusAfter.current = null;
    if (!el || from == null || reducedMotion()) return;
    const to = el.getBoundingClientRect().height;
    if (Math.abs(to - from) < 2) return;
    el.style.overflow = 'hidden';
    const a = el.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 560, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    const clear = () => (el.style.overflow = '');
    a.onfinish = clear;
    a.oncancel = clear;
  }, [view]);

  /** While sending, a thread draws itself around the button; on success it closes. */
  useEffect(() => {
    const p = borderPath.current;
    if (!p) return;
    if (status.kind === 'sending') {
      progress.current = p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0.12 }], {
        duration: 3200,
        easing: 'cubic-bezier(0.25, 0.6, 0.3, 1)',
        fill: 'forwards',
      });
    } else if (status.kind === 'sealing') {
      const now = parseFloat(getComputedStyle(p).strokeDashoffset) || 0.12;
      progress.current?.cancel();
      progress.current = p.animate([{ strokeDashoffset: now }, { strokeDashoffset: 0 }], { duration: 260, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' });
    }
  }, [status.kind]);

  function addSuggestion(text: string) {
    const el = message.current;
    if (!el) return;
    el.value = el.value.trim() ? `${el.value.trim()} ${text}` : text;
    el.focus();
    if (!reducedMotion()) {
      el.animate(
        [
          { borderColor: 'rgb(239 223 190)', backgroundColor: 'rgb(213 183 122 / 0.2)', boxShadow: '0 0 0 4px rgb(213 183 122 / 0.45)' },
          { borderColor: 'rgb(213 183 122 / 0.4)', backgroundColor: 'rgb(0 0 0 / 0.28)', boxShadow: '0 0 0 3px rgb(213 183 122 / 0.22)' },
        ],
        { duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
    }
  }

  function showThanks(demo: boolean) {
    fromHeight.current = card.current?.getBoundingClientRect().height ?? null;
    focusAfter.current = 'thanks';
    setStatus({ kind: 'done', demo });
  }

  function sendAnother() {
    fromHeight.current = card.current?.getBoundingClientRect().height ?? null;
    focusAfter.current = 'form';
    setStatus({ kind: 'idle' });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') ?? '').trim();
    const text = String(fd.get('message') ?? '').trim();
    if (!name || !text) return;
    const b = submitBtn.current?.getBoundingClientRect();
    setBtnBox(b && !reducedMotion() ? { w: b.width, h: b.height } : null);
    setStatus({ kind: 'sending' });
    const res = await sendBlessing({ name, message: text.slice(0, 1000), submittedAt: new Date().toISOString(), website: String(fd.get('website') ?? '') });
    if (!res.ok) {
      setStatus({ kind: 'error', message: res.error });
      return;
    }
    const demo = res.mode === 'demo';
    setStrands((n) => n + 1);
    if (reducedMotion()) {
      showThanks(demo);
      return;
    }
    setStatus({ kind: 'sealing', demo });
    timer.current = window.setTimeout(() => showThanks(demo), SEAL_MS);
  }

  const busy = status.kind === 'sending' || status.kind === 'sealing';
  const calLabel = (
    <>
      <span aria-hidden="true">✓ </span>
      <span lang="km">បានបើកប្រតិទិន</span>
      {EN && ' · Calendar opened'}
    </>
  );

  return (
    <section className={s.section} aria-labelledby="blessings-title" id="blessings">
      <div className={s.inner}>
        <SectionHeader km="ផ្ញើពរជ័យ" en="Blessings for the Couple" tone="light" id="blessings-title" />
        <Reveal as="p" className={s.intro}>
          <span lang="km">សូមផ្ញើពរជ័យ និងពាក្យជូនពរដល់គូស្វាមីភរិយា</span>
          {EN && <span lang="en">Leave a few words of blessing for the couple</span>}
        </Reveal>

        <Reveal variant="scale" i={1}>
          <Glass className={s.card} ref={card}>
            {status.kind === 'done' ? (
              <div className={s.thanks} role="status">
                <BlessingThread count={strands} />
                <p lang="km" className={s.thanksKm}>
                  សូមអរគុណចំពោះពរជ័យដ៏ថ្លៃថ្លារបស់លោកអ្នក។
                </p>
                {EN && (
                  <p lang="en" className={s.thanksEn}>
                    Thank you for your blessing.
                  </p>
                )}
                {status.demo && import.meta.env.DEV && <p className={s.demo}>Demo mode: no blessings endpoint is configured, so this blessing was saved in this browser only.</p>}
                <button ref={againBtn} type="button" className={s.linkBtn} onClick={sendAnother}>
                  <span lang="km">ផ្ញើពរជ័យម្ដងទៀត</span>
                  {EN && ' · Send another'}
                </button>
              </div>
            ) : (
              <form
                className={s.form}
                onSubmit={onSubmit}
                data-folding={status.kind === 'sealing' || undefined}
                data-returning={strands > 0 || undefined}
                aria-describedby={blessingMode() === 'demo' && import.meta.env.DEV ? `${id}-demo` : undefined}
              >
                <label className={s.field}>
                  <span className={s.label}>
                    <span lang="km">ឈ្មោះ</span>
                    {EN && ' · Name'}
                  </span>
                  <input ref={nameInput} name="name" required autoComplete="name" defaultValue={guest.personalised ? guest.en : ''} maxLength={120} className={s.input} />
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

                <button ref={submitBtn} type="submit" className={s.submit} disabled={busy} data-busy={busy || undefined}>
                  {busy ? (
                    <span lang="km">កំពុងផ្ញើ…</span>
                  ) : (
                    <>
                      <span lang="km">ផ្ញើពរជ័យ</span>
                      {EN && ' · Send blessing'}
                    </>
                  )}
                  {busy && btnBox && <ButtonThread {...btnBox} pathRef={borderPath} />}
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
          <a className={s.pill} href={googleCalendarUrl()} target="_blank" rel="noreferrer" onClick={() => setCalOpened(true)}>
            {calOpened ? calLabel : 'Google Calendar'}
          </a>
          <button
            type="button"
            className={s.pill}
            onClick={() => {
              downloadIcs();
              setCalOpened(true);
            }}
          >
            {calOpened ? (
              calLabel
            ) : (
              <>
                <span lang="km">ប្រតិទិន</span> · .ics
              </>
            )}
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

/** A pill-shaped path just inside the submit button, drawn as sending progress. */
function ButtonThread({ w, h, pathRef }: { w: number; h: number; pathRef: Ref<SVGPathElement> }) {
  const i = 2;
  const r = h / 2 - i;
  const d = `M${w / 2} ${i} H${w - i - r} A${r} ${r} 0 0 1 ${w - i - r} ${h - i} H${i + r} A${r} ${r} 0 0 1 ${i + r} ${i} Z`;
  return (
    <svg className={s.btnThread} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false">
      <path ref={pathRef} d={d} pathLength={1} />
    </svg>
  );
}

const MAX_STRANDS = 7;
const CX = 200;
const CY = 70;

/** One strand: in from the left, wrapped twice around the rosette, knotted below, out to the right. */
function strandPath(k: number) {
  const off = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 5;
  const y0 = CY + off;
  const R = 34 + k * 2.6;
  const R2 = R + 2.4;
  const kx = CX + 2 * (k % 3) - 2;
  const ky = CY + R2;
  const lift = k % 2 ? 12 : -12;
  return {
    thread: [
      `M6 ${y0}`,
      `C64 ${y0 - lift} 118 ${y0 + lift} ${CX - R} ${CY}`,
      `A${R} ${R} 0 1 1 ${CX + R} ${CY}`,
      `A${R} ${R} 0 1 1 ${CX - R} ${CY}`,
      `A${R2} ${R2} 0 1 1 ${CX + R2} ${CY}`,
      `A${R2} ${R2} 0 0 1 ${kx} ${ky}`,
      `c9 2 10 13 2 14`,
      `c-8 1 -9 -10 -1 -12`,
      `C${CX + 70} ${ky + 10} ${300} ${y0 - lift} 394 ${y0}`,
    ].join(' '),
    tail: `M${kx + 1} ${ky + 12} c-3 7 3 12 -2 19`,
  };
}

/**
 * The tied threads: one strand per blessing sent this session, around a lotus
 * rosette (KH-LOT-02). Earlier strands are already tied; the newest draws itself.
 */
function BlessingThread({ count }: { count: number }) {
  const n = Math.max(1, Math.min(count, MAX_STRANDS));
  const strands = Array.from({ length: n }, (_, k) => strandPath(k));
  return (
    <div className={s.thread} aria-hidden="true">
      <svg className={s.threadSvg} viewBox="0 0 400 140" focusable="false">
        {strands.map((p, k) => {
          const fresh = k === n - 1;
          const cls = fresh ? s.strandNew : s.strand;
          return (
            <g key={k} className={cls}>
              <path className={s.strandBody} d={p.thread} pathLength={1} />
              <path className={s.strandSheen} d={p.thread} pathLength={1} />
              <path className={`${s.strandBody} ${s.strandTail}`} d={p.tail} pathLength={1} />
            </g>
          );
        })}
      </svg>
      <span className={s.threadRosette}>
        <RomdoulFlower size={56} tone="gold" />
      </span>
    </div>
  );
}
