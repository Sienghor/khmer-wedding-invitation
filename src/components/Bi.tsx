import type { ElementType } from 'react';
import type { Bi as BiText } from '../config/wedding';
import { Txt } from '../lib/text';
import { useEnglish } from '../lib/lang';

/** Khmer line, with its English counterpart underneath when English is on (wedding.display.english). */
export function Bi({
  value,
  as: As = 'p',
  kmClass,
  enClass,
  className,
}: {
  value: BiText;
  as?: ElementType;
  kmClass?: string;
  enClass?: string;
  className?: string;
}) {
  const en = useEnglish();
  return (
    <As className={className}>
      <span lang="km" className={kmClass} style={{ display: 'block' }}>
        <Txt>{value.km}</Txt>
      </span>
      {en && (
        <span lang="en" className={enClass} style={{ display: 'block' }}>
          <Txt>{value.en}</Txt>
        </span>
      )}
    </As>
  );
}
