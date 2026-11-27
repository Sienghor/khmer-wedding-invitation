import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Opening } from './sections/Opening';
import { Hero } from './sections/Hero';
import { Invitation } from './sections/Invitation';
import { Details } from './sections/Details';
import { Story } from './sections/Story';
import { Schedule } from './sections/Schedule';
import { Blessings } from './sections/Blessings';
import { Closing } from './sections/Closing';
import { Nav } from './components/Nav';
import { DevBanner } from './components/DevBanner';
import { MusicToggle } from './components/MusicToggle';
import { wedding } from './config/wedding';
import { stripBrackets } from './lib/text';
import { CARRY_ATTR, canCarry, EntranceContext, OpenedContext, type Entrance } from './three/openedContext';

const SEEN = 'kwi.opened';
const seen = () => {
  try {
    return sessionStorage.getItem(SEEN) === '1';
  } catch {
    return false;
  }
};

type Transition = { ready: Promise<void>; finished: Promise<void> };
type DocVT = Document & { startViewTransition?: (update: () => void) => Transition };

/**
 * Page composition. Each section is self-contained and reads its content from
 * src/config; reorder or remove sections here without touching their internals.
 */
export function App() {
  // Returning within the same session (e.g. after following the map link) skips the opening.
  const [opened, setOpened] = useState(() => seen() || new URLSearchParams(location.search).has('skip'));
  // Behind the gate the hero waits; a returning visitor gets its (short) entrance on load.
  const [entrance, setEntrance] = useState<Entrance>(() => (opened ? 'enter' : 'gated'));
  // In-page 3D scenes wait until the names have landed and the light has crossed
  // them, so WebGL start-up never stutters the view transition or the sweep.
  const [scenesHeld, setScenesHeld] = useState(false);

  useEffect(() => {
    document.title = `${wedding.meta.title.km} · ${stripBrackets(wedding.meta.title.en)}`;
  }, []);

  // Layout effect: when the gate closes inside a view transition (flushSync), the
  // scroll lock and page colour must already be released for the new snapshot.
  useLayoutEffect(() => {
    document.body.style.background = opened ? '' : 'var(--c-night)';
    document.documentElement.style.background = opened ? 'var(--c-ivory)' : 'var(--c-night)';
    // The welcome screen is a fixed layer over the (inert) invitation: lock page
    // scrolling until the guest opens it, so the page underneath can't scroll or bounce.
    const lock = opened ? '' : 'hidden';
    document.documentElement.style.overflow = lock;
    document.body.style.overflow = lock;
  }, [opened]);

  const onOpened = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN, '1');
    } catch {
      /* private mode */
    }
    const land = (how: Entrance) => {
      flushSync(() => {
        setOpened(true);
        setEntrance(how);
        setScenesHeld(how === 'carried');
      });
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    // Called once the camera has passed through the door and the ivory wash is
    // full, so the old snapshot is the wash with the names resting on it. The 3D
    // doorway is disposed inside the update callback, after that capture.
    if (!canCarry()) return land('enter');
    const root = document.documentElement;
    root.setAttribute(CARRY_ATTR, '');
    let vt: Transition;
    try {
      vt = (document as DocVT).startViewTransition!(() => land('carried'));
    } catch {
      root.removeAttribute(CARRY_ATTR);
      return land('enter');
    }
    let skipped = false;
    vt.ready.catch(() => {
      // No morph happened (e.g. tab hidden): let the hero play its own entrance.
      skipped = true;
      setEntrance('enter');
    });
    vt.finished
      .catch(() => undefined)
      .then(() => {
        root.removeAttribute(CARRY_ATTR);
        if (!skipped) setEntrance('landed');
        setTimeout(() => setScenesHeld(false), skipped ? 0 : 1800);
      });
  }, []);

  const replay = useCallback(() => {
    try {
      sessionStorage.removeItem(SEEN);
    } catch {
      /* ignore */
    }
    setOpened(false);
    setEntrance('gated');
  }, []);

  return (
    <>
      <a className="skip-link" href="#invitation">
        Skip to invitation
      </a>
      {!opened && <Opening onOpened={onOpened} />}
      <OpenedContext.Provider value={opened && !scenesHeld}>
      <EntranceContext.Provider value={entrance}>
      <main inert={!opened} aria-hidden={!opened || undefined}>
        <h1 className="visually-hidden">
          {wedding.meta.title.km}: {stripBrackets(wedding.meta.title.en)}
        </h1>
        <Hero />
        <Invitation />
        <Details />
        <Story />
        <Schedule />
        <Blessings />
        <Closing onReplay={replay} />
      </main>
      </EntranceContext.Provider>
      </OpenedContext.Provider>
      {opened && <Nav />}
      {opened && <MusicToggle />}
      {import.meta.env.DEV && opened && <DevBanner />}
    </>
  );
}
