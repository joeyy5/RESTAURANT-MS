import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Tables from './pages/Tables';
import Kitchen from './pages/Kitchen';
import MenuPage from './pages/Menu';
import Reports from './pages/Reports';
import Staff from './pages/Staff';
import { Inventory, Expenses, Reservations, Settings } from './pages/Misc';
import Sidebar from './components/Sidebar';
import Notifications from './components/Notifications';
import './styles/global.css';

// ── Loading screen shown while Firebase checks redirect result ────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', gap: 20,
    }}>
      <div style={{
        width: 52, height: 52,
        background: 'linear-gradient(135deg, var(--accent-gold), #e8940f)',
        borderRadius: 13, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 26,
        boxShadow: '0 4px 20px rgba(245,166,35,0.35)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}>🍽️</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-primary)' }}>
        RestaurantOS
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
        Signing you in...
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}

// ── Main app shell ────────────────────────────────────────────────────────────
function AppShell() {
  const { user, authLoading } = useApp();
  const [page, setPage] = useState('dashboard');

  // Show spinner while Firebase resolves redirect / session
  if (authLoading) return <LoadingScreen />;

  // Not signed in → show login page
  if (!user) return <AuthPage />;

  // Kitchen staff go directly to KDS
  const activePage = user.role === 'kitchen' ? 'kitchen' : page;

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <Dashboard onNav={setPage} />;
      case 'pos':          return <POS />;
      case 'tables':       return <Tables onNav={setPage} />;
      case 'kitchen':      return <Kitchen />;
      case 'menu':         return <MenuPage />;
      case 'reports':      return <Reports />;
      case 'staff':        return <Staff />;
      case 'inventory':    return <Inventory />;
      case 'expenses':     return <Expenses />;
      case 'reservations': return <Reservations />;
      case 'settings':     return <Settings />;
      default:             return <Dashboard onNav={setPage} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar active={activePage} onNav={setPage} />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
        {renderPage()}
      </main>
      <Notifications />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
