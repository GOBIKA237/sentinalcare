import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { fetchAlerts } from "../api/checkins";

const BAND_COLOR = {
  high: "#B25757",
  moderate: "var(--clay)",
  low: "var(--sage)",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAlerts()
      .then((data) => setAlerts(data.alerts))
      .catch((err) => setError(err.message || "Couldn't load alerts."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-0 pb-20">
      <div className="pt-10 pb-6">
        <h1
          className="text-2xl mb-1"
          style={{ fontFamily: "'Fraunces', serif", color: "var(--ink)", fontWeight: 500 }}
        >
          Welfare alert queue
        </h1>
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
          Anonymized risk scores and trend factors — never raw check-in text. Sorted by severity.
        </p>
      </div>

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading…</p>}
      {error && <p style={{ color: "#B25757" }}>{error}</p>}

      {!loading && !error && alerts.length === 0 && (
        <div
          className="rounded-3xl p-10 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p style={{ color: "var(--ink-soft)" }}>No moderate or high risk alerts right now.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {alerts.map((a) => (
          <div
            key={a.user_id}
            className="rounded-2xl p-5 flex items-center justify-between"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: BAND_COLOR[a.risk_band] + "22" }}
              >
                <AlertTriangle size={18} style={{ color: BAND_COLOR[a.risk_band] }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                  {a.display_name}
                </p>
                <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                  {a.unit || "Unassigned unit"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p
                className="text-sm font-medium capitalize"
                style={{ color: BAND_COLOR[a.risk_band] }}
              >
                {a.risk_band} · {a.score}/100
              </p>
              <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
                {new Date(a.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
