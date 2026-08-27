import React from 'react';
import { color } from '../design/tokens';

export function Slider({ label, min = 0, max = 100, value, onChange, formatValue }) {
  return (
    <label style={{ display: 'block', fontSize: 13, color: color.inkMuted }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span>{label}</span>
        <span className="sc-mono" style={{ color: color.ink }}>
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: color.primary,
        }}
      />
    </label>
  );
}
