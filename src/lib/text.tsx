import { Fragment, type ReactNode } from 'react';

const BRACKET = /(\[[^\]]+\])/g;

export const hasPlaceholder = (s: string) => /\[[^\]]+\]/.test(s);
export const stripBrackets = (s: string) => s.replace(/\[([^\]]+)\]/g, '$1');

/**
 * Renders config text. Bracketed segments ([Groom’s name]) are placeholders
 * and get the dashed "to be confirmed" style plus a title tooltip.
 */
export function Txt({ children }: { children: string }): ReactNode {
  if (!hasPlaceholder(children)) return children;
  return children.split(BRACKET).map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <span key={i} className="ph" title="Placeholder: replace in src/config/wedding.ts">
        {part.slice(1, -1)}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
