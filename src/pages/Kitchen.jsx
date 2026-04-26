import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format, differenceInMinutes } from 'date-fns';

const STATUS_ORDER = { pending: 0, preparing: 1, ready: 2 };

export default function Kitchen() {
  const { orders, updateOrderStatus, settings } = useApp();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const activeOrders = orders
    .filter(o => ['pending', 'preparing', 'ready'].includes(o.status))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const getUrgency = (createdAt) => {
    const mins = differenceInMinutes(now, new Date(createdAt));
    if (mins >= 20) return 'critical';
    if (mins >= 10) return 'warning';
    return 'normal';
  };

  const URGENCY_COLOR = { normal: 'var(--accent-green)', warning: 'var(--accent-gold)', critical: 'var(--accent-red)' };

  const columns = [
    { key: 'pending', label: '📋 New Orders', color: 'var(--accent-blue)', bg: 'rgba(52,152,219,0.1)' },
    { key: 'preparing', label: '🔥 Preparing', color: 'var(--accent-gold)', bg: 'rgba(245,166,35,0.1)' },
    { key: 'ready', label: '✅ Ready to Serve', color: 'var(--accent-green)', bg: 'rgba(46,204,113,0.1)' },
  ];

  return (
    <div className="fade-in" style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>Kitchen Display</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>{format(now, 'hh:mm:ss a')}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{activeOrders.length} active orders</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, flex: 1, overflow: 'hidden' }}>
        {columns.map(col => (
          <div key={col.key} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', background: col.bg, borderRadius: '10px 10px 0 0', border: `1px solid ${col.color}40`, borderBottom: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 500, color: col.color }}>{col.label}</span>
              <span style={{ background: col.color, color: '#0f0f1a', borderRadius: 20, padding: '1px 9px', fontSize: 12, fontWeight: 600 }}>
                {activeOrders.filter(o => o.status === col.key).length}
              </span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-secondary)', border: `1px solid ${col.color}30`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeOrders.filter(o => o.status === col.key).map(order => {
                const urgency = getUrgency(order.createdAt);
                const mins = differenceInMinutes(now, new Date(order.createdAt));
                return (
                  <div key={order.id} style={{ background: 'var(--bg-card)', border: `1px solid ${URGENCY_COLOR[urgency]}50`, borderLeft: `3px solid ${URGENCY_COLOR[urgency]}`, borderRadius: 8, padding: 14, animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: col.color }}>{order.orderNumber}</div>
                      <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: URGENCY_COLOR[urgency], background: `${URGENCY_COLOR[urgency]}20`, padding: '2px 8px', borderRadius: 20 }}>
                        {mins}m ago
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>{order.tableId ? `Table ${order.tableId}` : 'Takeaway'}</span>
                      <span>•</span>
                      <span style={{ textTransform: 'capitalize' }}>{order.type}</span>
                      {order.customerName && <><span>•</span><span>{order.customerName}</span></>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                      {order.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--bg-surface)', borderRadius: 6 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 15, color: 'var(--accent-gold)', minWidth: 28 }}>×{item.qty}</span>
                          <span style={{ fontSize: 14 }}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                    {order.notes && <div style={{ fontSize: 12, color: 'var(--accent-gold)', background: 'rgba(245,166,35,0.08)', padding: '4px 10px', borderRadius: 6, marginBottom: 10 }}>📝 {order.notes}</div>}
                    <div style={{ display: 'flex', gap: 8 }}>
                      {order.status === 'pending' && (
                        <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '7px' }} onClick={() => updateOrderStatus(order.id, 'preparing')}>
                          🔥 Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button className="btn btn-success" style={{ flex: 1, justifyContent: 'center', padding: '7px' }} onClick={() => updateOrderStatus(order.id, 'ready')}>
                          ✅ Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '7px', color: 'var(--accent-green)', borderColor: 'var(--accent-green)' }} onClick={() => updateOrderStatus(order.id, 'served')}>
                          🍽️ Served
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {activeOrders.filter(o => o.status === col.key).length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px', fontSize: 14 }}>
                  No orders here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
