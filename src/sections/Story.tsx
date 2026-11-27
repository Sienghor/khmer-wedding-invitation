import { wedding } from '../config/wedding';
import { Bi } from '../components/Bi';
import { SectionHeader } from '../components/SectionHeader';
import { Gallery } from '../gallery/Gallery';
import { LoopFilm } from '../gallery/LoopFilm';
import { mediaVideos } from '../config/media.generated';
import { Reveal } from '../motion/Reveal';
import { EN } from '../lib/lang';
import { WallTapestry } from '../ornaments/WallTapestry';
import s from './Story.module.css';

/** 04 · Photo album: the photo gallery and behind-the-scenes films. */
export function Story() {
  const { story } = wedding;
  return (
    <section className={s.section} aria-labelledby="story-title" id="story">
      <div className="wall-tapestry">
        <WallTapestry />
      </div>
      <SectionHeader km="កម្រងរូបភាព" en="Photo Album" id="story-title" rhythm="together" />
      <Gallery />

      <div className={s.filmsHead}>
        {EN && (
          <Reveal as="p" variant="fade" className="eyebrow">
            {story.films.heading.en}
          </Reveal>
        )}
        <Reveal as="h3" variant="mask" at={0.5} lang="km" className={`km-display ${s.galleryTitle}`}>
          {story.films.heading.km}
        </Reveal>
      </div>
      <div className={s.films} style={filmColumns(story.films.clips.map((c) => c.media))}>
        {story.films.clips.map((c, i) => (
          <Reveal as="figure" key={c.media} variant="image" i={i} className={s.filmItem} data-wide={(mediaVideos[c.media]?.aspect ?? 1) > 1 || undefined}>
            <LoopFilm media={c.media} label={c.label.km} />
            <Bi value={c.label} as="figcaption" className={s.caption} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/**
 * Column widths proportional to each clip's aspect ratio, so every clip in a
 * row ends up the same height. Desktop: all clips in one row. Phones: landscape
 * clips span the full width and the portrait clips share a row.
 */
function filmColumns(keys: string[]): React.CSSProperties {
  const aspects = keys.map((k) => mediaVideos[k]?.aspect ?? 1);
  const fr = (a: number[]) => (a.length ? a.map((x) => `${x}fr`).join(' ') : '1fr');
  return { '--film-cols': fr(aspects), '--film-cols-narrow': fr(aspects.filter((a) => a <= 1)) } as React.CSSProperties;
}
