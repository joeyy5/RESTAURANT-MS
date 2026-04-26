import React from 'react';
import { useApp } from '../context/AppContext';

const TYPE_STYLE = {
  success: { bg: 'rgba(46,204,113,0.15)', border: 'rgba(46,204,113,0.4)', color: 'var(--accent-green)', icon: '✓' },
  error: { bg: 'rgba(231,76,60,0.15)', border: 'rgba(231,76,60,0.4)', color: 'var(--accent-red)', icon: '⚠' },
  info: { bg: 'rgba(52,152,219,0.15)', border: 'rgba(52,152,219,0.4)', color: 'var(--accent-blue)', icon: 'ℹ' },
};

export default function Notifications() {
  const { notifications } = useApp();
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 9999 }}>
      {notifications.map(n => {
        const s = TYPE_STYLE[n.type] || TYPE_STYLE.info;
        return (
          <div key={n.id} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, minWidth: 240, maxWidth: 340, animation: 'slideIn 0.2s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
            <span style={{ color: s.color, fontSize: 16 }}>{s.icon}</span>
            <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{n.msg}</span>
          </div>
        );
      })}
    </div>
  );
}
