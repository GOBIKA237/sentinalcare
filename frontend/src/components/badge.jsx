import React from 'react';
import { color, radius, signalMeta } from '../design/tokens';

/**
 * Generic pill badge. Prefer <SignalBadge> for signal_type values so the
 * color mapping stays centralized in tokens.js.
 */
export function Badge({ children, bg = color.bgSunken, fg = color.ink, title }) {
  return (
    <span
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: radius.pill,
        background: bg,
        color: fg,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

/**
 * One badge per distinct signal_type present in an alert's factors.
 * `signalType` is one of: organizational | survey | behavioral | chat
 */
export function SignalBadge({ signalType, size = 'md' }) {
  const meta = signalMeta[signalType];
  if (!meta) return null;

  const dotSize = size === 'sm' ? 6 : 7;

  return (
    <Badge bg={meta.soft} fg={meta.color} title={meta.description}>
      <span
        aria-hidden="true"
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          background: meta.color,
          flexShrink: 0,
        }}
      />
      {size === 'sm' ? meta.short : meta.label}
    </Badge>
  );
}

/**
 * Renders one SignalBadge per unique signal_type in a factors array,
 * in a stable order (organizational, survey, behavioral, chat) so the
 * badge row doesn't reflow as new alerts stream in.
 */
const ORDER = ['organizational', 'survey', 'behavioral', 'chat'];

export function SignalBadgeRow({ factors = [], size = 'md' }) {
  const present = new Set(factors.map((f) => f.signal_type));
  const ordered = ORDER.filter((t) => present.has(t));

  if (ordered.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {ordered.map((t) => (
        <SignalBadge key={t} signalType={t} size={size} />
      ))}
    </div>
  );
}
