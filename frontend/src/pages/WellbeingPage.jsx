import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Moon, Sun, ChevronRight } from "lucide-react";
import BreathingOrb from "../components/BreathingOrb";
import { MOOD_LABELS } from "../theme/tokens";
import { fetchMyCheckins } from "../api/checkins";

function formatForChart(history) {
  // history comes back newest-first; chart wants oldest-first, left to right.
  return [...history]
    .reverse()
    .map((c) => ({
      day: new Date(c.created_at).toLocaleDateString("en-US", { weekday: "short" }),
      mood: c.mood,
      sleep: c.sleep,
      workload: c.workload,
    }));
}

export default function WellbeingPage() {
  const [history, setHistory] = useState([]);
  const [latestRiskScore, setLatestRiskScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyCheckins()
      .then((data) => {
        setHistory(data.history);
        setLatestRiskScore(data.latestRiskScore);
      })
      .catch((err) => setError(err.message || "Couldn't load your wellbeing data."))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => formatForChart(history), [history]);

  const avgMood = useMemo(() => {
    if (history.length === 0) return 3;
    return history.reduce((s, d) => s + d.mood, 0) / history.length;
  }, [history]);

  const avgSleep = useMemo(() => {
    if (history.length === 0) return 0;
    return history.reduce((s, d) => s + d.sleep, 0) / history.length;
  }, [history]);

  const avgWorkload = useMemo(() => {
    if (history.length === 0) return 0;
    return history.reduce((s, d) => s + d.workload, 0) / history.length;
  }, [history]);

  const label = MOOD_LABELS[Math.round(avgMood) - 1] || "Okay";

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 md:px-0 pt-16 text-center" style={{ color: "var(--ink-soft)" }}>
        Loading your wellbeing trends…
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 md:px-0 pt-16 text-center" style={{ color: "var(--ink-soft)" }}>
        No check-ins yet. Log your first one from the "Check in" tab to see your trend here.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-0 pb-20">
      <div className="pt-10 pb-2 flex flex-col items-center text-center">
        <BreathingOrb avgMood={avgMood} />
        <p className="text-sm mt-4" style={{ color: "var(--ink-soft)" }}>
          Recently you've mostly felt
        </p>
        <h1
          className="text-2xl mb-1"
          style={{ fontFamily: "'Fraunces', serif", color: "var(--ink)", fontWeight: 500 }}
        >
          {label}
        </h1>
        {latestRiskScore && (
          <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
            Latest risk band: <strong>{latestRiskScore.risk_band}</strong> ({latestRiskScore.score}/100)
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-center mb-4" style={{ color: "#B25757" }}>
          {error}
        </p>
      )}

      <div
        className="rounded-3xl p-6 md:p-8 mt-8"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
            Recent trend
          </span>
          <div className="flex gap-4 text-xs" style={{ color: "var(--ink-soft)" }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--sage)" }} /> mood
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--mist-deep)" }} /> sleep
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13 }} />
            <Line type="monotone" dataKey="mood" stroke="var(--sage)" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="sleep" stroke="var(--mist-deep)" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <Moon size={16} style={{ color: "var(--mist-deep)" }} />
          <p className="text-xs mt-2" style={{ color: "var(--ink-soft)" }}>Avg. sleep</p>
          <p className="text-lg font-medium" style={{ color: "var(--ink)" }}>{avgSleep.toFixed(1)}/5</p>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <Sun size={16} style={{ color: "var(--clay)" }} />
          <p className="text-xs mt-2" style={{ color: "var(--ink-soft)" }}>Avg. workload</p>
          <p className="text-lg font-medium" style={{ color: "var(--ink)" }}>{avgWorkload.toFixed(1)}/5</p>
        </div>
      </div>

      <div
        className="mt-4 rounded-2xl p-5 flex items-center justify-between"
        style={{ background: "var(--surface-soft)" }}
      >
        <p className="text-sm" style={{ color: "var(--ink)" }}>
          Only you see this. Your unit sees anonymized trends, never your entries.
        </p>
        <ChevronRight size={16} style={{ color: "var(--ink-soft)" }} />
      </div>
    </div>
  );
}
