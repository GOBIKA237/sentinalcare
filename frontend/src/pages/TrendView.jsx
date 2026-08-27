import React, { useEffect, useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { color, riskMeta, MIN_COHORT_SIZE } from '../design/tokens';
import { Card, CardHeader } from '../components/Card';
import { PrivacyBanner } from '../components/PrivacyBanner';
import { RiskCapsule } from '../components/RiskCapsule';
import { api } from '../api/client';

/**
 * Unit-level, fully anonymized risk-band trend: count of personnel in
 * low/moderate/high per week. No names, no individual identifiers.
 *
 * Anonymization safeguard: a week is only rendered with its band
 * breakdown if the unit's cohort size that week is >= MIN_COHORT_SIZE.
 * Below that threshold a small cohort's band counts could effectively
 * identify an individual (e.g. "1 of 3 people is high risk"), so those
 * weeks are shown as suppressed rather than plotted.
 */
export function TrendView({ unitId }) {
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrend = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUnitRiskTrend(unitId);
      setWeeks(data.weeks || []);
    } catch (err) {
      setError('Could not load the trend view.');
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    fetchTrend();
  }, [fetchTrend]);

  const suppressedCount = weeks.filter((w) => w.cohort_size < MIN_COHORT_SIZE).length;

  const chartData = weeks.map((w) => {
    const suppressed = w.cohort_size < MIN_COHORT_SIZE;
    return {
      week: formatWeek(w.week_start),
      cohort_size: w.cohort_size,
      suppressed,
      low: suppressed ? null : w.bands.low,
      moderate: suppressed ? null : w.bands.moderate,
      high: suppressed ? null : w.bands.high,
    };
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
      <h2 className="sc-display" style={{ fontSize: 26, margin: '0 0 4px' }}>
        Unit risk trend
      </h2>
      <p style={{ margin: '0 0 18px', fontSize: 14, color: color.inkMuted }}>
        Weekly personnel counts by risk band — aggregated and anonymized.
      </p>

      <PrivacyBanner>
        This chart shows counts only, never names. Weeks where the unit has fewer
        than {MIN_COHORT_SIZE} people are shown as suppressed, since a breakdown that
        small could otherwise be used to infer an individual's status.
      </PrivacyBanner>

      <Card>
        <CardHeader
          title="Personnel by risk band, per week"
          right={
            <div style={{ display: 'flex', gap: 14 }}>
              {['low', 'moderate', 'high'].map((b) => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: riskMeta[b].color,
                    }}
                  />
                  <span style={{ fontSize: 12, color: color.inkMuted }}>{riskMeta[b].label}</span>
                </div>
              ))}
            </div>
          }
        />

        {loading && <div style={{ padding: '40px 0', textAlign: 'center', color: color.inkMuted }}>Loading…</div>}
        {error && <div style={{ color: color.riskHigh }}>{error}</div>}

        {!loading && !error && (
          <>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke={color.border} vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 12, fill: color.inkMuted }}
                    axisLine={{ stroke: color.border }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: color.inkMuted }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<TrendTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="low"
                    stackId="risk"
                    stroke={riskMeta.low.color}
                    fill={riskMeta.low.soft}
                    connectNulls={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="moderate"
                    stackId="risk"
                    stroke={riskMeta.moderate.color}
                    fill={riskMeta.moderate.soft}
                    connectNulls={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="high"
                    stackId="risk"
                    stroke={riskMeta.high.color}
                    fill={riskMeta.high.soft}
                    connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {suppressedCount > 0 && (
              <p style={{ marginTop: 10, fontSize: 12.5, color: color.inkFaint }}>
                {suppressedCount} {suppressedCount === 1 ? 'week is' : 'weeks are'} not shown
                because the unit's cohort size was below the {MIN_COHORT_SIZE}-person threshold
                for anonymized reporting.
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;

  if (point?.suppressed) {
    return (
      <div style={tooltipStyle}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div style={{ color: color.inkFaint }}>
          Suppressed — cohort of {point.cohort_size} is below the anonymity threshold.
        </div>
      </div>
    );
  }

  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {['low', 'moderate', 'high'].map((b) => (
        <div key={b} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13 }}>
          <span style={{ color: riskMeta[b].color }}>{riskMeta[b].label}</span>
          <span className="sc-mono">{point[b]}</span>
        </div>
      ))}
      <div style={{ marginTop: 6, fontSize: 11, color: color.inkFaint }}>
        Cohort: {point.cohort_size}
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: color.bgRaised,
  border: `1px solid ${color.border}`,
  borderRadius: 10,
  padding: '10px 12px',
  boxShadow: '0 4px 16px rgba(42,59,54,0.12)',
  fontSize: 13,
};

function formatWeek(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
