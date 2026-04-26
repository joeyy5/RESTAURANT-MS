import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { signInWithGoogle } from '../firebase';

export default function AuthPage() {
  const { login } = useApp();
  const [tab,     setTab]     = useState('google');
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // ── Google Sign-In (redirect — no popup, never blocked) ───────────────────
  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    // This navigates the page to Google's sign-in screen.
    // After the user signs in, Google redirects back to this site.
    // AppContext picks up the result via checkRedirectResult() on mount.
    await signInWithGoogle();
    // Code here won't run — page has redirected away.
    // setLoading(false) not needed but kept for safety if redirect is cancelled
    setLoading(false);
  };

  // ── Email / Password login ────────────────────────────────────────────────
  const handlePassword = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 350));
    const result = login(form.email.trim(), form.password);
    if (!result.ok) setError(result.error);
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg-primary)', overflow: 'hidden', position: 'relative',
    }}>
      {/* Ambient background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse at 15% 50%, rgba(245,166,35,0.07) 0%, transparent 55%),
          radial-gradient(ellipse at 85% 20%, rgba(52,152,219,0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 90%, rgba(155,89,182,0.04) 0%, transparent 50%)`,
      }} />

      {/* ── LEFT: Auth panel ────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 48px',
        background: 'linear-gradient(150deg, var(--bg-secondary) 0%, var(--bg-card) 100%)',
        borderRight: '1px solid var(--border)',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ maxWidth: 400, width: '100%' }}>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 44 }}>
            <div style={{
              width: 48, height: 48,
              background: 'linear-gradient(135deg, var(--accent-gold), #e8940f)',
              borderRadius: 12, fontSize: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(245,166,35,0.3)',
            }}>🍽️</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>RestaurantOS</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Management System</div>
            </div>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 6, lineHeight: 1.2 }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 15 }}>
            Sign in to access the dashboard
          </p>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.35)',
              borderRadius: 8, padding: '11px 14px', marginBottom: 20,
              fontSize: 14, color: '#e74c3c', display: 'flex', gap: 8, alignItems: 'center',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: 'var(--bg-surface)',
            borderRadius: 10, padding: 4, marginBottom: 24,
            border: '1px solid var(--border)',
          }}>
            {[
              { key: 'google',   label: '🔵 Google Sign-In' },
              { key: 'password', label: '🔑 Staff / Admin' },
            ].map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setError(''); }}
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: 8, border: 'none',
                  background: tab === t.key ? 'var(--bg-card)' : 'transparent',
                  color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer', fontSize: 13,
                  fontWeight: tab === t.key ? 500 : 400,
                  boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                  transition: 'all 0.15s',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── GOOGLE TAB ─────────────────────────────────────────────────── */}
          {tab === 'google' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Redirect notice */}
              <div style={{
                background: 'rgba(52,152,219,0.08)',
                border: '1px solid rgba(52,152,219,0.25)',
                borderRadius: 8, padding: '10px 14px',
                fontSize: 13, color: 'var(--accent-blue)',
                display: 'flex', gap: 8, alignItems: 'flex-start', lineHeight: 1.5,
              }}>
                <span style={{ flexShrink: 0 }}>ℹ️</span>
                <span>
                  Clicking the button below will take you to Google's sign-in page.
                  You'll be brought back automatically after signing in —{' '}
                  <strong>no popup needed.</strong>
                </span>
              </div>

              {/* Google button */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                style={{
                  width: '100%', padding: '14px 20px', borderRadius: 10,
                  border: '1px solid #dadce0',
                  background: loading ? '#f5f5f5' : '#ffffff',
                  color: '#3c4043', cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 15, fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  transition: 'all 0.18s', fontFamily: 'var(--font-body)',
                  boxShadow: loading ? 'none' : '0 2px 8px rgba(0,0,0,0.12)',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)'; e.currentTarget.style.background = '#f8f8f8'; } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = loading ? 'none' : '0 2px 8px rgba(0,0,0,0.12)'; e.currentTarget.style.background = loading ? '#f5f5f5' : '#ffffff'; }}
              >
                {loading ? (
                  <>
                    <span style={{ fontSize: 18 }}>⏳</span>
                    Redirecting to Google...
                  </>
                ) : (
                  <>
                    {/* Real Google G logo */}
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              {/* Info */}
              <div style={{
                background: 'var(--bg-surface)', borderRadius: 8, padding: 14,
                fontSize: 13, color: 'var(--text-muted)', border: '1px solid var(--border)',
                lineHeight: 1.65,
              }}>
                <div style={{ marginBottom: 6, color: 'var(--text-secondary)', fontWeight: 500 }}>How it works:</div>
                <div>✅ Any Google account can sign in</div>
                <div>🎭 New users get <strong>Waiter</strong> role by default</div>
                <div>👑 Admin can upgrade roles in the Staff page</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 12 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                staff with email & password
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <button className="btn btn-ghost" onClick={() => setTab('password')}
                style={{ justifyContent: 'center', fontSize: 14 }}>
                🔑 Sign in with email & password
              </button>
            </div>
          )}

          {/* ── PASSWORD TAB ───────────────────────────────────────────────── */}
          {tab === 'password' && (
            <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Email Address</label>
                <input className="input" name="email" type="email"
                  value={form.email} onChange={handle}
                  placeholder="staff@restaurant.com"
                  autoComplete="email" required />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" name="password"
                    type={showPw ? 'text' : 'password'}
                    value={form.password} onChange={handle}
                    placeholder="••••••••"
                    autoComplete="current-password" required
                    style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: 16,
                      color: 'var(--text-muted)', padding: 0,
                    }}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button className="btn btn-primary" type="submit" disabled={loading}
                style={{ padding: '13px 20px', fontSize: 15, justifyContent: 'center', width: '100%', marginTop: 4 }}>
                {loading ? '⏳ Signing in...' : '→ Sign In'}
              </button>

              {/* Demo creds */}
              <div style={{
                background: 'var(--bg-surface)', borderRadius: 8, padding: 12,
                fontSize: 12, color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)', border: '1px solid var(--border)',
              }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Demo staff credentials:
                </div>
                <div>manager@restaurant.com / manager123</div>
                <div>waiter@restaurant.com / waiter123</div>
                <div>kitchen@restaurant.com / kitchen123</div>
              </div>

              <button className="btn btn-ghost" type="button" onClick={() => setTab('google')}
                style={{ justifyContent: 'center', fontSize: 13 }}>
                ← Back to Google Sign-In
              </button>
            </form>
          )}

        </div>
      </div>

      {/* ── RIGHT: Info panel ──────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 48px',
      }}>
        <div style={{ maxWidth: 420, width: '100%' }}>

          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 38,
            lineHeight: 1.25, marginBottom: 36,
          }}>
            Run your restaurant<br />
            <em style={{ color: 'var(--accent-gold)' }}>smarter, faster.</em>
          </div>

          {/* Role cards */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Role-Based Access
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { role: 'Admin',   color: 'var(--accent-red)',    icon: '👑', desc: 'Full access — all features, reports, settings' },
                { role: 'Manager', color: 'var(--accent-purple)', icon: '💼', desc: 'POS, kitchen, menu, inventory, reports' },
                { role: 'Waiter',  color: 'var(--accent-blue)',   icon: '🧑‍🍳', desc: 'POS, live orders, tables, reservations' },
                { role: 'Kitchen', color: 'var(--accent-gold)',   icon: '🍳', desc: 'Kitchen display system only' },
              ].map(r => (
                <div key={r.role} style={{
                  display: 'flex', gap: 12, alignItems: 'center',
                  padding: '10px 14px',
                  background: 'var(--bg-card)', borderRadius: 8,
                  border: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: r.color }}>{r.role}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '🧾', title: 'POS & Billing',        desc: 'Fast orders, auto receipt, silent print' },
              { icon: '📊', title: 'Reports',               desc: 'Daily / Monthly / Yearly — printable' },
              { icon: '🍳', title: 'Kitchen Display',       desc: 'Live queue with urgency timer' },
              { icon: '📦', title: 'Inventory & Expenses',  desc: 'Stock alerts & expense tracking' },
              { icon: '📅', title: 'Reservations',          desc: 'Table booking & guest management' },
            ].map(f => (
              <div key={f.icon} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32, background: 'var(--bg-surface)',
                  borderRadius: 7, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, border: '1px solid var(--border)',
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 1 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 36, paddingTop: 18,
            borderTop: '1px solid var(--border)',
            fontSize: 12, color: 'var(--text-muted)',
          }}>
            Built &amp; managed by{' '}
            <strong style={{ color: 'var(--text-secondary)' }}>Jayesh Shashikant Koli</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
