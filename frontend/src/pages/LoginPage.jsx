import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [serviceNumber, setServiceNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(serviceNumber, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-8"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h1
          className="text-2xl mb-1 text-center"
          style={{ fontFamily: "'Fraunces', serif", color: "var(--ink)", fontWeight: 500 }}
        >
          SentinelCare
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: "var(--ink-soft)" }}>
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
              Service number
            </label>
            <input
              type="text"
              value={serviceNumber}
              onChange={(e) => setServiceNumber(e.target.value)}
              placeholder="e.g. soldier1"
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
              required
            />
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--ink)" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--ink)" }}
              required
            />
          </div>

          {error && (
            <p className="text-sm mb-4" style={{ color: "#B25757" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-3 text-sm font-medium transition-transform hover:scale-[1.01] disabled:opacity-60"
            style={{ background: "var(--sage-deep)", color: "white" }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-center mt-6" style={{ color: "var(--ink-soft)" }}>
          Demo accounts (after running <code>npm run seed</code> on the backend):
          <br />
          soldier1 / welfare1 / admin1 — password: Password123!
        </p>
      </div>
    </div>
  );
}
