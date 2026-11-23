import { SRALAO_ASPECT } from '../ornaments/geometry/lintel';
import { pedimentBox } from '../ornaments/geometry/pediment';

/** Units of the fronton geometry (pediment(W = 300)), scaled into world space by PED_K. */
export const PED_UNITS = 300;
export const PED_TIERS = 2 as const;

/** World-space dimensions of the doorway, shared with the CSS layout (Opening.tsx). */
export const DOOR = {
  lintelW: 4.4,
  lintelH: 4.4 / SRALAO_ASPECT,
  columnH: 4.4,
  columnR: 0.15,
  columnX: 1.86,
  threshold: 0.18,
  /** Banteay Srei superposed fronton (KH-PED-01) above the lintel: base width in world units. */
  pedimentW: 2.9,
};
export const PED_K = DOOR.pedimentW / PED_UNITS;
const box = pedimentBox(PED_UNITS, PED_TIERS);
/** The fronton's on-screen box (world units), from its base line upward. */
export const PED_BOX = { w: box.w * PED_K, top: -box.y * PED_K, below: (box.h + box.y) * PED_K };
export const DOOR_TOTAL_H = DOOR.threshold + DOOR.columnH + DOOR.lintelH + PED_BOX.top;
export const DOOR_ASPECT = DOOR.lintelW / DOOR_TOTAL_H;
/** Height of the lintel's top edge above the ground. */
export const LINTEL_TOP = DOOR.threshold + DOOR.columnH + DOOR.lintelH;
