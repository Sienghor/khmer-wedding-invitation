import { useEffect, type ReactNode } from 'react';
import { HERITAGE_MOTIFS, RESEARCHED_NOT_USED } from './registry';
import { Lintel } from '../ornaments/Lintel';
import { LotusPetalBand } from '../ornaments/LotusPetalBand';
import { LotusRosette } from '../ornaments/LotusRosette';
import { NagaFan } from '../ornaments/NagaFan';
import { NagaBalustrade } from '../ornaments/NagaBalustrade';
import { Colonnette } from '../ornaments/Colonnette';
import { TowerQuincunx } from '../ornaments/TowerQuincunx';
import { KbachLeaf } from '../ornaments/KbachLeaf';
import { OrnamentDivider } from '../ornaments/OrnamentDivider';
import { Pediment } from '../ornaments/Pediment';
import { VineBand } from '../ornaments/VineBand';
import { WallTapestry } from '../ornaments/WallTapestry';
import { BayonTower } from '../ornaments/BayonTower';
import s from './HeritageLab.module.css';

/**
 * Heritage registry viewer (open with ?heritage).
 * Shows every registered motif as rendered by code, beside its provenance,
 * so designers and reviewers can check each ornament against its source.
 */
const SPECIMENS: Record<string, ReactNode> = {
  'KH-LIN-01': <Lintel relief />,
  'KH-LOT-01': <LotusPetalBand height={28} />,
  'KH-LOT-02': <LotusRosette size={120} />,
  'KH-NAG-01': <NagaFan size={180} />,
  'KH-NAG-02': <NagaBalustrade />,
  'KH-COL-01': <Colonnette style={{ height: 320, width: 'auto' }} />,
  'KH-TWR-01': <TowerQuincunx />,
  'KH-KB-01': <KbachLeaf size={120} />,
  'KH-KB-02': <OrnamentDivider width={320} />,
  'KH-PED-01': <Pediment width={360} tiers={2} />,
  'KH-VIN-01': (
    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 16, height: 240, width: 360 }}>
      <VineBand orientation="vertical" size={40} />
      <div style={{ display: 'grid', alignContent: 'center' }}>
        <VineBand size={36} />
      </div>
    </div>
  ),
  'KH-WAL-01': (
    <div style={{ position: 'relative', width: 360, height: 240 }}>
      <WallTapestry opacity={0.6} />
    </div>
  ),
  'KH-BAY-01': <BayonTower width={260} dark={false} />,
};

export default function HeritageLab() {
  useEffect(() => {
    document.title = 'Heritage Reference Registry';
    document.body.style.background = 'var(--c-ivory)';
  }, []);
  return (
    <main className={s.lab} lang="en">
      <header className={s.head}>
        <p className="eyebrow">Heritage Reference Registry</p>
        <h1>Every ornament, with its source</h1>
        <p>
          Each specimen below is drawn entirely in code from <code>src/ornaments/geometry</code>. Provenance is recorded in{' '}
          <code>src/heritage/registry.ts</code>. On the invitation, every ornament carries a <code>data-motif</code> attribute naming its entry.
        </p>
      </header>
      {HERITAGE_MOTIFS.map((m) => (
        <article key={m.id} className={s.card} id={m.id}>
          <div className={s.specimen} data-reveal-off>
            {SPECIMENS[m.id]}
          </div>
          <div className={s.meta}>
            <p className={s.id}>
              {m.id} · <span data-status={m.status}>{m.status}</span>
            </p>
            <h2>{m.englishName}</h2>
            {m.khmerName ? <p lang="km">{m.khmerName}</p> : m.khmerNameNote && <p className={s.note}>{m.khmerNameNote}</p>}
            <dl>
              <dt>Source</dt>
              <dd>{m.heritageSource}</dd>
              <dt>Temple / artifact</dt>
              <dd>{m.templeOrArtifact}</dd>
              <dt>Period / style</dt>
              <dd>{m.period ?? 'Not established by the cited sources'}</dd>
            </dl>
            <h3>Documented characteristics</h3>
            <ul>
              {m.characteristics.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <h3>Evidence</h3>
            <ul className={s.refs}>
              {m.references.map((r, i) => (
                <li key={i}>
                  {r.quote && <q>{r.quote}</q>}{' '}
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
            <h3>Adaptation notes</h3>
            <ul>
              {m.adaptationNotes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className={s.files}>{m.implementation.join(' · ')}</p>
          </div>
        </article>
      ))}
      <section className={s.excluded}>
        <h2>Researched, not used</h2>
        <ul>
          {RESEARCHED_NOT_USED.map((r) => (
            <li key={r.source}>
              <strong>{r.source}.</strong> {r.reason}{' '}
              <a href={r.url} target="_blank" rel="noreferrer">
                Source
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
