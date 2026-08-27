import React, { useState } from 'react';
import './design/global.css';
import { color } from './design/tokens';
import { LoginScreen } from './pages/LoginScreen';
import { AlertsPage } from './pages/AlertsPage';
import { TrendView } from './pages/TrendView';
import { Button } from './components/Button';

export default function App() {
  const [authed, setAuthed] = useState(() => !!localStorage.getItem('sc_auth_token'));
  const [tab, setTab] = useState('alerts'); // 'alerts' | 'trend'

  if (!authed) {
    return <LoginScreen onLoggedIn={() => setAuthed(true)} />;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px',
          borderBottom: `1px solid ${color.border}`,
          background: color.bgRaised,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <span className="sc-display" style={{ fontSize: 18 }}>SentinelCare</span>
          <nav style={{ display: 'flex', gap: 4 }}>
            <TabButton active={tab === 'alerts'} onClick={() => setTab('alerts')}>
              Alerts
            </TabButton>
            <TabButton active={tab === 'trend'} onClick={() => setTab('trend')}>
              Unit trend
            </TabButton>
          </nav>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            localStorage.removeItem('sc_auth_token');
            setAuthed(false);
          }}
        >
          Sign out
        </Button>
      </header>

      {tab === 'alerts' ? <AlertsPage /> : <TrendView unitId="current" />}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: 'none',
        background: active ? color.primarySoft : 'transparent',
        color: active ? color.primary : color.inkMuted,
        fontWeight: 600,
        fontSize: 14,
        padding: '7px 14px',
        borderRadius: 999,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}
