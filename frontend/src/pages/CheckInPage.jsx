import React, { useState } from "react";
import { Heart, Check } from "lucide-react";
import Slider from "../components/Slider";
import { submitCheckin } from "../api/checkins";

export default function CheckInPage() {
  const [mood, setMood] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [workload, setWorkload] = useState(3);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      await submitCheckin({ mood, sleep, workload, note });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Couldn't log your check-in. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 md:px-0 pb-20">
      <div className="pt-10 pb-8 text-center">
        <p className="text-sm mb-2" style={{ color: "var(--ink-soft)" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1
          className="text-3xl md:text-4xl mb-3"
          style={{ fontFamily: "'Fraunces', serif", color: "var(--ink)", fontWeight: 500 }}
        >
          How are you doing today?
        </h1>
        <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--ink-soft)" }}>
          Takes less than a minute. This is private — only you see your day-to-day entries.
        </p>
      </div>

      {submitted ? (
        <div
          className="rounded-3xl p-10 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: "var(--sage)" }}
          >
            <Check size={24} color="white" />
          </div>
          <h2 className="text-lg font-medium mb-2" style={{ color: "var(--ink)" }}>
            Logged — thank you
          </h2>
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
            You can check in again tomorrow. Your trend is on the "My wellbeing" tab.
          </p>
        </div>
      ) : (
        <div
          className="rounded-3xl p-8 md:p-10"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <Slider label="Mood" value={mood} onChange={setMood} lowLabel="Heavy" highLabel="Light" />
          <Slider label="Sleep last night" value={sleep} onChange={setSleep} lowLabel="Barely slept" highLabel="Well rested" />
          <Slider label="Workload pressure" value={workload} onChange={setWorkload} lowLabel="Manageable" highLabel="Overwhelming" />

          <div className="mb-8">
            <label className="text-sm font-medium block mb-2" style={{ color: "var(--ink)" }}>
              Anything you want to note? <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Whatever's on your mind..."
              className="w-full rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus-visible:ring-2"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
          </div>

          {error && (
            <p className="text-sm mb-4" style={{ color: "#B25757" }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-full py-3.5 text-sm font-medium transition-transform hover:scale-[1.01] focus:outline-none focus-visible:ring-2 disabled:opacity-60"
            style={{ background: "var(--sage-deep)", color: "white" }}
          >
            {submitting ? "Logging..." : "Log today's check-in"}
          </button>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-8 text-xs" style={{ color: "var(--ink-soft)" }}>
        <Heart size={14} />
        <span>Need to talk to someone? Reach your welfare desk anytime.</span>
      </div>
    </div>
  );
}
