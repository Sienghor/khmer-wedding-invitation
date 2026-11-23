/**
 * BACKGROUND MUSIC: one shared <audio> element, created on first use.
 *
 * Browsers only allow sound after a guest gesture, so the song starts when
 * the guest taps "open invitation" (see Opening.tsx). Guests who skip the
 * opening (?skip, or returning in the same session) start it with the music
 * button, or with their first tap if they had not turned it off before.
 *
 * - A guest's "off" choice is remembered on this device.
 * - The song pauses while the tab is hidden and resumes on return.
 * - Volume fades in and out instead of cutting.
 */
import { useSyncExternalStore } from 'react';
import { wedding } from '../config/wedding';

const PREF = 'kwi.music';
const VOLUME = 0.55;

let audio: HTMLAudioElement | null = null;
let playing = false;
let wanted = false; // the guest wants music (survives tab hide)
let fadeRaf = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const prefOff = () => {
  try {
    return localStorage.getItem(PREF) === 'off';
  } catch {
    return false;
  }
};
const savePref = (on: boolean) => {
  try {
    if (on) localStorage.removeItem(PREF);
    else localStorage.setItem(PREF, 'off');
  } catch {
    /* private mode */
  }
};

function el(): HTMLAudioElement | null {
  if (!wedding.music.src) return null;
  if (audio) return audio;
  audio = new Audio(wedding.music.src);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0;
  audio.addEventListener('play', () => {
    playing = true;
    emit();
  });
  audio.addEventListener('pause', () => {
    playing = false;
    emit();
  });
  if ('mediaSession' in navigator && typeof MediaMetadata !== 'undefined') {
    navigator.mediaSession.metadata = new MediaMetadata({ title: wedding.music.title, artist: wedding.music.artist, album: wedding.meta.title.km });
  }
  document.addEventListener('visibilitychange', () => {
    if (!audio) return;
    if (document.hidden) audio.pause();
    else if (wanted) void play();
  });
  return audio;
}

function fadeTo(target: number, ms: number, done?: () => void) {
  const a = audio;
  if (!a) return;
  cancelAnimationFrame(fadeRaf);
  const from = a.volume;
  const t0 = performance.now();
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / ms);
    // Clamp: floating-point error can land a hair outside [0, 1], which throws.
    a.volume = Math.min(1, Math.max(0, from + (target - from) * k));
    if (k < 1) fadeRaf = requestAnimationFrame(step);
    else done?.();
  };
  fadeRaf = requestAnimationFrame(step);
}

async function play() {
  const a = el();
  if (!a) return;
  try {
    await a.play();
    fadeTo(VOLUME, 1800);
  } catch {
    // Blocked (no gesture yet) or failed to load: leave the button showing "play".
    playing = false;
    emit();
  }
}

function pause() {
  if (!audio || audio.paused) return;
  fadeTo(0, 450, () => audio?.pause());
}

export const music = {
  available: () => !!wedding.music.src,

  /** Called from the "open invitation" tap: starts the song unless the guest turned it off before. */
  startFromGesture() {
    if (!wedding.music.src || prefOff()) return;
    wanted = true;
    void play();
  },

  /**
   * For guests who skipped the opening: start on their first tap or key press
   * anywhere, unless they turned the music off before.
   */
  armFirstInteraction() {
    if (!wedding.music.src || prefOff()) return () => {};
    const go = (e: Event) => {
      // The music button handles its own tap.
      if ((e.target as Element | null)?.closest?.('[data-music-toggle]')) return off();
      off();
      if (!wanted && !playing) {
        wanted = true;
        void play();
      }
    };
    const off = () => {
      window.removeEventListener('pointerdown', go, true);
      window.removeEventListener('keydown', go, true);
    };
    window.addEventListener('pointerdown', go, true);
    window.addEventListener('keydown', go, true);
    return off;
  },

  toggle() {
    if (playing || wanted) {
      wanted = false;
      savePref(false);
      pause();
      emit();
    } else {
      wanted = true;
      savePref(true);
      void play();
    }
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** True while the song is audible (or fading in). */
export const useMusicPlaying = () => useSyncExternalStore(subscribe, () => playing, () => false);
