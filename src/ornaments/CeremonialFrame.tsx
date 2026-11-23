import type { ReactNode } from 'react';
import { KbachLeaf } from './KbachLeaf';
import { LotusPetalBand } from './LotusPetalBand';
import { Pediment } from './Pediment';
import { VineBand } from './VineBand';
import type { Tone } from './Ornament';
import s from './CeremonialFrame.module.css';

/**
 * Ceremonial frame for the formal invitation card.
 * Composition, after a Banteay Srei doorway: double gilt rule; a fronton
 * (KH-PED-01) crowning the top edge; pilasters of foliated scrolls (KH-VIN-01)
 * down both sides; Bodhi-leaf figures (KH-KB-01) pointing into each corner;
 * and an upward lotus-petal moulding (KH-LOT-01) as the base, which is where
 * the source places it: petals are never inverted along the top edge.
 */
export function CeremonialFrame({ children, tone = 'gold', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <div className={`${s.frame} ${className ?? ''}`} data-tone={tone}>
      <div className={s.rule} aria-hidden="true" />
      {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
        <span key={c} className={`${s.corner} ${s[c]}`} aria-hidden="true">
          <KbachLeaf size={34} tone={tone} />
        </span>
      ))}
      <span className={s.crown} aria-hidden="true">
        <Pediment width="100%" tiers={1} tone={tone} />
      </span>
      {(['pl', 'pr'] as const).map((p) => (
        <span key={p} className={`${s.pilaster} ${s[p]}`} aria-hidden="true">
          <VineBand orientation="vertical" size={16} tone={tone} carved={false} />
        </span>
      ))}
      <div className={s.content}>{children}</div>
      <div className={s.base} aria-hidden="true">
        <LotusPetalBand height={16} tone={tone} />
      </div>
    </div>
  );
}
