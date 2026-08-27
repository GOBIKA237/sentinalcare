import React from 'react';
import { color, radius, shadow } from '../design/tokens';

export function Card({ children, style, padded = true, ...props }) {
  return (
    <div
      {...props}
      style={{
        background: color.bgRaised,
        border: `1px solid ${color.border}`,
        borderRadius: radius.md,
        boxShadow: shadow.card,
        padding: padded ? 20 : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, right }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 14,
      }}
    >
      <div>
        <h3 style={{ margin: 0, fontSize: 17, color: color.ink }}>{title}</h3>
        {subtitle && (
          <p style={{ margin: '4px 0 0', fontSize: 13, color: color.inkMuted }}>
            {subtitle}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}
