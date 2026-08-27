import React from "react";
import { Wind, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Nav({ view, setView, roleView }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items =
    roleView === "officer"
      ? [{ id: "alerts", label: "Welfare alerts" }]
      : [
          { id: "checkin", label: "Check in" },
          { id: "wellbeing", label: "My wellbeing" },
        ];

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="flex items-center justify-between px-6 py-5 md:px-10">
      <div className="flex items-center gap-2">
        <Wind size={20} style={{ color: "var(--sage-deep)" }} />
        <span
          className="text-lg tracking-tight"
          style={{ fontFamily: "'Fraunces', serif", color: "var(--ink)" }}
        >
          SentinelCare
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-1 p-1 rounded-full" style={{ background: "var(--surface-soft)" }}>
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              className="px-4 py-2 rounded-full text-sm transition-colors focus:outline-none focus-visible:ring-2"
              style={{
                background: view === it.id ? "var(--surface)" : "transparent",
                color: view === it.id ? "var(--ink)" : "var(--ink-soft)",
                fontWeight: view === it.id ? 600 : 500,
                boxShadow: view === it.id ? "0 1px 3px rgba(51,65,59,0.12)" : "none",
              }}
            >
              {it.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-sm" style={{ color: "var(--ink-soft)" }}>
          <span className="hidden md:inline">{user?.displayName}</span>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-black/5"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
