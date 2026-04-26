import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = {
  admin: [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'pos', icon: '🧾', label: 'POS / Orders' },
    { id: 'tables', icon: '🪑', label: 'Tables' },
    { id: 'kitchen', icon: '🍳', label: 'Kitchen' },
    { id: 'menu', icon: '🍽️', label: 'Menu' },
    { id: 'reservations', icon: '📅', label: 'Reservations' },
    { id: 'inventory', icon: '📦', label: 'Inventory' },
    { id: 'staff', icon: '👥', label: 'Staff' },
    { id: 'expenses', icon: '💸', label: 'Expenses' },
    { id: 'reports', icon: '📈', label: 'Reports' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ],
  manager: [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'pos', icon: '🧾', label: 'POS / Orders' },
    { id: 'tables', icon: '🪑', label: 'Tables' },
    { id: 'kitchen', icon: '🍳', label: 'Kitchen' },
    { id: 'menu', icon: '🍽️', label: 'Menu' },
    { id: 'reservations', icon: '📅', label: 'Reservations' },
    { id: 'inventory', icon: '📦', label: 'Inventory' },
    { id: 'staff', icon: '👥', label: 'Staff' },
    { id: 'expenses', icon: '💸', label: 'Expenses' },
    { id: 'reports', icon: '📈', label: 'Reports' },
  ],
  waiter: [
    { id: 'pos', icon: '🧾', label: 'POS / Orders' },
    { id: 'tables', icon: '🪑', label: 'Tables' },
    { id: 'reservations', icon: '📅', label: 'Reservations' },
  ],
  kitchen: [
    { id: 'kitchen', icon: '🍳', label: 'Kitchen Display' },
  ],
};

export default function Sidebar({ active, onNav }) {
  const { user, logout, settings, orders } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = NAV_ITEMS[user?.role] || NAV_ITEMS.waiter;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;

  return (
    <aside style={{
      width: collapsed ? 64 : 220,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.2s ease',
      flexShrink: 0,
      position: 'relative', zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 14px' : '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
        <div style={{ width: 36, height: 36, background: 'var(--accent-gold)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🍽️</div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{settings.restaurantName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>POS v2.0</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => onNav(item.id)}
            title={collapsed ? item.label : ''}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '10px 10px' : '10px 12px',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              background: active === item.id ? 'rgba(245,166,35,0.12)' : 'transparent',
              color: active === item.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontSize: 14, fontWeight: active === item.id ? 500 : 400,
              transition: 'all 0.15s', marginBottom: 2,
              justifyContent: collapsed ? 'center' : 'flex-start',
              position: 'relative',
            }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            {!collapsed && item.id === 'kitchen' && pendingOrders > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--accent-red)', color: '#fff', borderRadius: 20, fontSize: 11, padding: '1px 7px', fontWeight: 600 }}>{pendingOrders}</span>
            )}
            {collapsed && item.id === 'kitchen' && pendingOrders > 0 && (
              <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: 'var(--accent-red)', borderRadius: '50%' }} />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)' }}>
        <button onClick={() => setCollapsed(c => !c)}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 10, marginBottom: 4 }}>
          {collapsed ? '→' : '← Collapse'}
        </button>
        {!collapsed && (
          <div style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        )}
        <button onClick={logout} title={collapsed ? 'Logout' : ''} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(231,76,60,0.2)', background: 'transparent', color: 'var(--accent-red)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 8 }}>
          🚪 {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
