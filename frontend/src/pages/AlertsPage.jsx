import React, { useEffect, useState, useCallback } from 'react';
import { color, radius } from '../design/tokens';
import { Card, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { PrivacyBanner } from '../components/PrivacyBanner';
import { RiskCapsule } from '../components/RiskCapsule';
import { SignalBadgeRow } from '../components/Badge';
import { api } from '../api/client';

/**
 * Welfare officer / commander alert queue.
 *
 * Each alert's `factors` array now looks like:
 *   [{ factor: string, contribution: number, signal_type:
 *      "organizational" | "survey" | "behavioral" | "chat" }]
 *
 * The card shows one small badge per distinct signal_type present, so an
 * officer can tell at a glance whether an alert is workload-driven,
 * self-reported, behavioral, or chat-derived, without opening the detail
 * panel.
 */
export function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAlerts({ status: 'open' });
      setAlerts(data.alerts || data);
    } catch (err) {
      setError('Could not load alerts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  async function handleAcknowledge(id) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledging: true } : a)));
    try {
      await api.acknowledgeAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledging: false } : a)));
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px' }}>
      <h2 className="sc-display" style={{ fontSize: 26, margin: '0 0 4px' }}>
        Alert queue
      </h2>
      <p style={{ margin: '0 0 18px', fontSize: 14, color: color.inkMuted }}>
        {alerts.length} open {alerts.length === 1 ? 'alert' : 'alerts'}
      </p>

      <PrivacyBanner>
        Alerts summarize aggregated signal patterns for a person, not raw messages
        or survey text. Chat-derived badges reflect check-in patterns, never message
        content.
      </PrivacyBanner>

      {loading && <Card>Loading alerts…</Card>}
      {error && (
        <Card style={{ color: color.riskHigh }}>
          {error}{' '}
          <button onClick={fetchAlerts} style={{ marginLeft: 6 }}>
            Retry
          </button>
        </Card>
      )}

      {!loading && !error && alerts.length === 0 && (
        <Card style={{ textAlign: 'center', color: color.inkMuted }}>
          No open alerts right now.
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {alerts.map((alert) => {
          const expanded = expandedId === alert.id;
          return (
            <Card key={alert.id} style={{ padding: 18 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 16,
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedId(expanded ? null : alert.id)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{alert.personnel_label}</span>
                    <span className="sc-mono" style={{ fontSize: 12, color: color.inkFaint }}>
                      {alert.unit_label}
                    </span>
                  </div>

                  <SignalBadgeRow factors={alert.factors} />
                </div>

                <RiskCapsule band={alert.risk_band} compact />
              </div>

              {expanded && (
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: `1px solid ${color.border}`,
                  }}
                >
                  <h4 style={{ margin: '0 0 10px', fontSize: 13, color: color.inkMuted }}>
                    Contributing factors
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {alert.factors.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 13,
                          gap: 12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <SignalBadgeRow factors={[f]} size="sm" />
                          <span>{f.factor}</span>
                        </div>
                        <span className="sc-mono" style={{ color: color.inkMuted }}>
                          {Math.round(f.contribution * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                    <Button
                      variant="primary"
                      disabled={alert.acknowledging}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcknowledge(alert.id);
                      }}
                    >
                      {alert.acknowledging ? 'Acknowledging…' : 'Acknowledge'}
                    </Button>
                    <Button variant="secondary" onClick={(e) => e.stopPropagation()}>
                      View welfare protocol
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
