import React from 'react';
import { color, radius } from '../design/tokens';

/**
 * Shared privacy-reassurance banner pattern. Pass `children` to override
 * the default copy for a given surface (e.g. alert queue vs. trend view).
 */
export function PrivacyBanner({ children }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        background: color.primarySoft,
        border: `1px solid ${color.border}`,
        borderRadius: radius.sm,
        padding: '10px 14px',
        fontSize: 13,
        color: color.inkMuted,
        marginBottom: 16,
      }}
    >
      <span aria-hidden="true" style={{ color: color.primary, fontSize: 15, lineHeight: 1.2 }}>
        ⓘ
      </span>
      <div>
        {children || (
          <>
            This view shows aggregated signals used to flag potential support needs.
            It reflects patterns, not conclusions — please follow your unit's welfare
            protocol before acting on any single alert.
          </>
        )}
      </div>
    </div>
  );
}
