import React from 'react';
import { color, radius } from '../design/tokens';

const VARIANTS = {
  primary: {
    background: color.primary,
    color: '#FFFFFF',
    border: `1px solid ${color.primary}`,
  },
  secondary: {
    background: color.bgRaised,
    color: color.ink,
    border: `1px solid ${color.border}`,
  },
  ghost: {
    background: 'transparent',
    color: color.inkMuted,
    border: '1px solid transparent',
  },
};

export function Button({ variant = 'primary', children, style, ...props }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <button
      {...props}
      style={{
        ...v,
        padding: '9px 16px',
        borderRadius: radius.sm,
        fontSize: 14,
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'opacity 0.15s ease, transform 0.05s ease',
        ...style,
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {children}
    </button>
  );
}
