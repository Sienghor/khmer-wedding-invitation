import { useCallback, useEffect, useState } from 'react';
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
import { OpenedContext } from './three/openedContext';

const SEEN = 'kwi.opened';
const seen = () => {
  try {
    return sessionStorage.getItem(SEEN) === '1';
  } catch {
    return false;
  }
};

/**
 * Page composition. Each section is self-contained and reads its content from
 * src/config; reorder or remove sections here without touching their internals.
 */
export function App() {
  // Returning within the same session (e.g. after following the map link) skips the opening.
  const [opened, setOpened] = useState(() => seen() || new URLSearchParams(location.search).has('skip'));

  useEffect(() => {
    document.title = `${wedding.meta.title.km} · ${stripBrackets(wedding.meta.title.en)}`;
  }, []);

  useEffect(() => {
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
    setOpened(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const replay = useCallback(() => {
    try {
      sessionStorage.removeItem(SEEN);
    } catch {
      /* ignore */
    }
    setOpened(false);
  }, []);

  return (
    <>
      <a className="skip-link" href="#invitation">
        Skip to invitation
      </a>
      {!opened && <Opening onOpened={onOpened} />}
      <OpenedContext.Provider value={opened}>
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
      </OpenedContext.Provider>
      {opened && <Nav />}
      {opened && <MusicToggle />}
      {import.meta.env.DEV && opened && <DevBanner />}
    </>
  );
}
