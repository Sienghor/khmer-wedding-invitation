import { createContext } from 'react';

/**
 * True once the guest has passed through the opening. In-page 3D scenes wait
 * for it, so they never render behind the gate in a second WebGL context.
 */
export const OpenedContext = createContext(true);

/**
 * How the first view (Hero) makes its entrance:
 *  - 'gated':   still behind the opening; nothing has played yet.
 *  - 'enter':   play the entrance now (returning visitor on load, or the wash
 *               has just cleared without a view transition).
 *  - 'carried': the names are gliding from the doorway in a view transition;
 *               the hero names do not animate themselves.
 *  - 'landed':  the view transition has finished; the light sweep plays.
 */
export type Entrance = 'gated' | 'enter' | 'carried' | 'landed';
export const EntranceContext = createContext<Entrance>('enter');

/** Attribute on <html> while the names are carried through the doorway. */
export const CARRY_ATTR = 'data-carry';

type DocVT = Document & { startViewTransition?: unknown };
/**
 * Whether the names can be carried from the doorway into the hero with a
 * same-document view transition. Not with reduced motion: then the hero simply appears.
 */
export const canCarry = () =>
  typeof document !== 'undefined' &&
  typeof (document as DocVT).startViewTransition === 'function' &&
  typeof CSS !== 'undefined' &&
  CSS.supports('view-transition-name: none') &&
  !(typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
