import React from "react";

export default function BreathingOrb({ avgMood }) {
  const color = avgMood >= 3.5 ? "var(--sage)" : avgMood >= 2.5 ? "var(--mist)" : "var(--clay)";
  return (
    <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
      <style>{`
        @keyframes breathe { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.12); opacity: 1; } }
        .orb { animation: breathe 5.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .orb { animation: none; } }
      `}</style>
      <div
        className="orb absolute rounded-full"
        style={{ width: 100, height: 100, background: color, opacity: 0.35, filter: "blur(6px)" }}
      />
      <div
        className="orb absolute rounded-full"
        style={{ width: 64, height: 64, background: color, opacity: 0.7 }}
      />
    </div>
  );
}
