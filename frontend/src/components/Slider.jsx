import React from "react";

export default function Slider({ label, value, onChange, lowLabel, highLabel }) {
  return (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          {label}
        </span>
        <span className="text-sm" style={{ color: "var(--sage-deep)", fontFamily: "'IBM Plex Mono', monospace" }}>
          {value}/5
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-current"
        style={{ accentColor: "var(--sage)" }}
      />
      <div className="flex justify-between mt-1.5 text-xs" style={{ color: "var(--ink-soft)" }}>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
