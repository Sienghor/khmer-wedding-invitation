/**
 * THEME CONFIGURATION
 * ---------------------------------------------------------------------------
 * Pick a preset with ACTIVE_THEME, or edit a preset's values. Everything (CSS,
 * SVG ornaments and the 3D scenes) reads these through CSS custom properties.
 * Preview any preset without editing code: add ?theme=burgundy (or ?theme=olive) to the URL.
 *
 * What a palette change does NOT touch: the heritage layer. Ornament *forms*
 * (lintel, naga, lotus, towers) and their provenance are independent of colour.
 * Gold (gilt) and sandstone are material colours of the carvings themselves
 * (Banteay Srei is "built largely of red sandstone"), so both presets keep them.
 */
export interface Palette {
  /** Main light ground */
  ivory: string;
  /** Gilt highlight */
  champagne: string;
  /** Gilt body */
  gold: string;
  /** Ceremonial accent: section bands, Khmer headings, active nav */
  accent: string;
  /** Text and dark grounds */
  charcoal: string;
  /** Deepest ground: opening and closing scenes */
  night: string;
  /** 3D stone */
  sandstone: string;
}

export const THEMES = {
  /** Royal burgundy: the original direction. Warm, ceremonial, high contrast with gold. */
  burgundy: {
    ivory: '#F6F0E5',
    champagne: '#D5B77A',
    gold: '#A77B42',
    accent: '#632E32',
    charcoal: '#24201C',
    night: '#1B1714',
    sandstone: '#B48474',
  },
  /**
   * Olive: a deep, slightly warm olive that sits with the sage walls and greenery
   * of the white-wedding photo set and with gilt. Ivory is nudged a touch cooler.
   */
  olive: {
    ivory: '#F4F1E6',
    champagne: '#D5B77A',
    gold: '#A2793F',
    accent: '#4B5230',
    charcoal: '#22231B',
    night: '#181912',
    sandstone: '#B48474',
  },
} satisfies Record<string, Palette>;

export type ThemeName = keyof typeof THEMES;

/** ← Choose the published palette here. */
export const ACTIVE_THEME: ThemeName = 'olive';

export const fonts = {
  khmerDisplay: '"Moul", "Battambang", serif',
  khmerBody: '"Battambang", "Kantumruy Pro", sans-serif',
  latinDisplay: '"Cormorant Garamond", "Times New Roman", serif',
  ui: '"Kantumruy Pro", system-ui, sans-serif',
};

export function resolveTheme(): { name: ThemeName; palette: Palette } {
  const q = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('theme') : null;
  const name = q && q in THEMES ? (q as ThemeName) : ACTIVE_THEME;
  return { name, palette: THEMES[name] };
}

export function applyTheme(root: HTMLElement = document.documentElement) {
  const { name, palette: p } = resolveTheme();
  const set = (k: string, v: string) => root.style.setProperty(k, v);
  set('--c-ivory', p.ivory);
  set('--c-champagne', p.champagne);
  set('--c-gold', p.gold);
  set('--c-accent', p.accent);
  set('--c-charcoal', p.charcoal);
  set('--c-night', p.night);
  set('--c-sandstone', p.sandstone);
  set('--f-km-display', fonts.khmerDisplay);
  set('--f-km-body', fonts.khmerBody);
  set('--f-latin', fonts.latinDisplay);
  set('--f-ui', fonts.ui);
  root.dataset.theme = name;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', p.night);
}
