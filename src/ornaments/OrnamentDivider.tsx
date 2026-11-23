import { useMemo } from 'react';
import { snailSpiral } from './geometry/kbach';
import { KbachLeafGroup } from './KbachLeaf';
import { RosetteGroup } from './LotusRosette';
import { Gilt, INCISE, OrnamentSvg, useIds, type Tone } from './Ornament';

/**
 * Section divider assembled only from registered motifs:
 * lotus rosette (KH-LOT-02) flanked by snail spirals (KH-KB-02) and
 * Bodhi-leaf figures (KH-KB-01) turned outward, on fine gilt rules.
 * Lines and spirals stroke-draw when the parent is revealed.
 */
export function OrnamentDivider({ tone = 'gold', className, width = 280 }: { tone?: Tone; className?: string; width?: number }) {
  const ids = useIds('g', 'half');
  const W = 280;
  const H = 40;
  const spiral = useMemo(() => snailSpiral(W / 2 + 26, H / 2 + 1, 7, -1, Math.PI), []);
  const fill = `url(#${ids.g})`;
  const stroke = INCISE[tone];
  return (
    <OrnamentSvg motifs={['KH-LOT-02', 'KH-KB-01', 'KH-KB-02']} viewBox={`0 0 ${W} ${H}`} width={width} height={(width * H) / W} className={className} style={{ overflow: 'visible' }}>
      <defs>
        <Gilt id={ids.g} tone={tone} horizontal />
        <g id={ids.half}>
          <path d={`M${W / 2 + 38} ${H / 2}H${W - 30}`} stroke={fill} strokeWidth="0.9" pathLength={1} className="draw-path" />
          <path d={`M${W / 2 + 46} ${H / 2 + 4}H${W - 54}`} stroke={stroke} strokeWidth="0.5" strokeOpacity="0.5" pathLength={1} className="draw-path" />
          <path d={spiral} fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round" pathLength={1} className="draw-path" />
          <g transform={`translate(${W - 26} ${H / 2}) rotate(90)`}>
            <KbachLeafGroup w={13} h={20} fill={fill} stroke={stroke} />
          </g>
        </g>
      </defs>
      <use href={`#${ids.half}`} />
      <use href={`#${ids.half}`} transform={`translate(${W} 0) scale(-1 1)`} />
      <g transform={`translate(${W / 2} ${H / 2})`}>
        <RosetteGroup r={14} fill={fill} stroke={stroke} />
      </g>
    </OrnamentSvg>
  );
}
