import React from 'react';
import { color, riskMeta } from '../design/tokens';

/**
 * The dashboard's signature element: a soft three-segment capsule
 * (low → moderate → high) with a marker on current position and a
 * gentle "breathing" ring instead of a hard traffic-light indicator.
 * Used on alert cards (compact) and as the trend view legend (labeled).
 */
export function RiskCapsule({ band, compact = false }) {
  const order = ['low', 'moderate', 'high'];
  const idx = order.indexOf(band);
  const markerLeft = `${(idx + 0.5) * (100 / order.length)}%`;
  const meta = riskMeta[band] || riskMeta.low;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          position: 'relative',
          width: compact ? 72 : 140,
          height: 10,
          borderRadius: 999,
          overflow: 'visible',
          display: 'flex',
        }}
        role="img"
        aria-label={`Risk band: ${meta.label}`}
      >
        {order.map((band) => (
          <div
            key={band}
            style={{
              flex: 1,
              background: riskMeta[band].soft,
              borderRadius:
                band === 'low' ? '999px 0 0 999px' : band === 'high' ? '0 999px 999px 0' : 0,
            }}
          />
        ))}
        <span
          style={{
            position: 'absolute',
            top: '50%',
            left: markerLeft,
            transform: 'translate(-50%, -50%)',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: meta.color,
            border: '2px solid white',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.05)',
          }}
        >
          <span
            className="sc-breathe-ring"
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              background: meta.color,
            }}
          />
        </span>
      </div>
      {!compact && (
        <span style={{ fontSize: 13, fontWeight: 600, color: meta.color }}>{meta.label}</span>
      )}
    </div>
  );
}
