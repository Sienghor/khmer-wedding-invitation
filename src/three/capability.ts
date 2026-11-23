import { prefersReducedMotion } from '../motion/useReducedMotion';

/**
 * Decide whether the 3D doorway is worth initialising on this device.
 * Falls back to the SVG doorway (same geometry, same layout) when:
 *  - the visitor prefers reduced motion (the 3D scene is choreography);
 *  - Save-Data is on, or the device reports < 3 GB memory;
 *  - WebGL2 is unavailable;
 *  - ?lite is in the URL (manual override for testing).
 */
export function shouldUse3D(): boolean {
  if (typeof window === 'undefined') return false;
  if (new URLSearchParams(location.search).has('lite')) return false;
  if (prefersReducedMotion()) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 3) return false;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}
