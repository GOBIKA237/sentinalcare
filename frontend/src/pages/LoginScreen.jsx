import React, { useState } from 'react';
import { color, radius, shadow } from '../design/tokens';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api, ApiError } from '../api/client';

export function LoginScreen({ onLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await api.login(username, password);
      localStorage.setItem('sc_auth_token', token);
      onLoggedIn?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in. Try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: radius.sm,
    border: `1px solid ${color.border}`,
    background: color.bgSunken,
    fontSize: 14,
    fontFamily: 'inherit',
    color: color.ink,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: color.bg,
        padding: 20,
      }}
    >
      <Card style={{ width: 360, boxShadow: shadow.raised }}>
        <h1 className="sc-display" style={{ fontSize: 24, margin: '4px 0 6px' }}>
          SentinelCare
        </h1>
        <p style={{ margin: '0 0 22px', fontSize: 13, color: color.inkMuted }}>
          Welfare and commander dashboard
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ fontSize: 13, color: color.inkMuted }}>
            Username
            <input
              style={{ ...inputStyle, marginTop: 6 }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label style={{ fontSize: 13, color: color.inkMuted }}>
            Password
            <input
              type="password"
              style={{ ...inputStyle, marginTop: 6 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <div style={{ fontSize: 13, color: color.riskHigh }}>{error}</div>
          )}

          <Button type="submit" disabled={loading} style={{ marginTop: 6 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
