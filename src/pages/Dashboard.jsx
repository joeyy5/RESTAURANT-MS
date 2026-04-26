import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { format, subDays, startOfDay, isAfter } from 'date-fns';

export default function Dashboard({ onNav }) {
  const { orders, menu, tables, staff, settings, reservations } = useApp();

  const today = startOfDay(new Date());
  const todayOrders = orders.filter(o => isAfter(new Date(o.createdAt), today) && o.paymentStatus === 'paid');
  const todaySales = todayOrders.reduce((s, o) => s + o.total, 0);
  const todayTax = todayOrders.reduce((s, o) => s + o.tax, 0);

  const weekData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(new Date(), 6 - i);
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const dayOrders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= dayStart && d < dayEnd && o.paymentStatus === 'paid';
      });
      return { day: format(day, 'EEE'), sales: dayOrders.reduce((s, o) => s + o.total, 0), orders: dayOrders.length };
    });
  }, [orders]);

  const categoryData = useMemo(() => {
    const cats = {};
    orders.filter(o => o.paymentStatus === 'paid').forEach(o => {
      o.items.forEach(item => {
        const mi = menu.find(m => m.id === item.id);
        const cat = mi?.category || item.category || 'Other';
        cats[cat] = (cats[cat] || 0) + item.price * item.qty;
      });
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [orders, menu]);

  const occupied = tables.filter(t => t.status === 'occupied').length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
  const todayReservations = reservations.filter(r => r.date === format(new Date(), 'yyyy-MM-dd') && r.status === 'confirmed').length;
  const activeStaff = staff.filter(s => s.active).length;

  const COLORS = ['#f5a623', '#2ecc71', '#3498db', '#9b59b6', '#e74c3c', '#1abc9c'];

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  return (
    <div className="fade-in" style={{ padding: 28, overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
        </div>
        <button className="btn btn-outline" onClick={() => onNav('pos')}>+ New Order</button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Today's Sales", value: `${settings.currency}${todaySales.toLocaleString()}`, icon: '💰', color: 'var(--accent-gold)', sub: `${todayOrders.length} orders` },
          { label: 'Tables Occupied', value: `${occupied}/${tables.length}`, icon: '🪑', color: 'var(--accent-blue)', sub: `${Math.round(occupied / tables.length * 100)}% occupancy` },
          { label: 'Pending Orders', value: pendingOrders, icon: '⏳', color: pendingOrders > 5 ? 'var(--accent-red)' : 'var(--accent-green)', sub: 'in kitchen queue' },
          { label: "Today's Tax", value: `${settings.currency}${todayTax.toLocaleString()}`, icon: '🏛️', color: 'var(--accent-purple)', sub: `${settings.taxRate}% GST` },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="label">{s.icon} {s.label}</div>
            <div className="value" style={{ color: s.color, fontSize: 24 }}>{s.value}</div>
            <div className="change" style={{ color: 'var(--text-muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Weekly sales chart */}
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 16 }}>Weekly Sales</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#666e82', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666e82', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#16213e', border: '1px solid #2a3550', borderRadius: 8, color: '#f0f0f0', fontSize: 13 }} formatter={(v) => [`₹${v}`, 'Sales']} />
              <Bar dataKey="sales" fill="#f5a623" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 16 }}>Sales by Category</div>
          {categoryData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <PieChart width={140} height={140}>
                <Pie data={categoryData} dataKey="value" cx={65} cy={65} innerRadius={40} outerRadius={65} paddingAngle={3}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#16213e', border: '1px solid #2a3550', borderRadius: 8, color: '#f0f0f0', fontSize: 12 }} formatter={(v) => [`₹${v.toLocaleString()}`]} />
              </PieChart>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {categoryData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{d.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>₹{d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>No sales data yet</div>
          )}
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28 }}>📅</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600, margin: '8px 0', color: 'var(--accent-blue)' }}>{todayReservations}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Today's Reservations</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28 }}>👥</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600, margin: '8px 0', color: 'var(--accent-green)' }}>{activeStaff}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Active Staff</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28 }}>🍽️</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600, margin: '8px 0', color: 'var(--accent-purple)' }}>{menu.filter(m => m.available).length}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Menu Items Available</div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontWeight: 500 }}>Recent Orders</div>
          <button className="btn btn-ghost" onClick={() => onNav('pos')} style={{ fontSize: 13, padding: '6px 14px' }}>View All</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th><th>Table</th><th>Type</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No orders yet. Start taking orders from POS.</td></tr>
              ) : recentOrders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{o.orderNumber}</td>
                  <td>{o.tableId || '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{o.type}</td>
                  <td>{o.items.length} items</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>₹{o.total}</td>
                  <td>
                    <span className={`badge ${o.status === 'completed' ? 'badge-green' : o.status === 'cancelled' ? 'badge-red' : o.status === 'preparing' ? 'badge-gold' : 'badge-blue'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{format(new Date(o.createdAt), 'hh:mm a')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
