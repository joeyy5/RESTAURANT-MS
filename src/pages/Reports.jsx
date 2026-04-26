import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Reports() {
  const { orders, expenses, menu, staff, settings } = useApp();
  const [period, setPeriod] = useState('daily');
  const [customStart, setCustomStart] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const printRef = useRef();

  const { start, end } = useMemo(() => {
    const now = new Date();
    if (period === 'daily') return { start: startOfDay(now), end: endOfDay(now) };
    if (period === 'monthly') return { start: startOfMonth(now), end: endOfMonth(now) };
    if (period === 'yearly') return { start: startOfYear(now), end: endOfYear(now) };
    return { start: new Date(customStart), end: endOfDay(new Date(customEnd)) };
  }, [period, customStart, customEnd]);

  const filteredOrders = useMemo(() =>
    orders.filter(o => o.paymentStatus === 'paid' && isWithinInterval(new Date(o.createdAt), { start, end })),
    [orders, start, end]);

  const filteredExpenses = useMemo(() =>
    expenses.filter(e => isWithinInterval(new Date(e.createdAt), { start, end })),
    [expenses, start, end]);

  const totalRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);
  const totalTax = filteredOrders.reduce((s, o) => s + o.tax, 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const avgOrderVal = filteredOrders.length ? Math.round(totalRevenue / filteredOrders.length) : 0;
  const totalOrders = filteredOrders.length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled' && isWithinInterval(new Date(o.createdAt), { start, end })).length;

  // Category breakdown
  const categoryRevenue = useMemo(() => {
    const cats = {};
    filteredOrders.forEach(o => o.items.forEach(item => {
      const mi = menu.find(m => m.id === item.id);
      const cat = mi?.category || 'Other';
      cats[cat] = (cats[cat] || 0) + item.price * item.qty;
    }));
    return Object.entries(cats).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, menu]);

  // Top items
  const topItems = useMemo(() => {
    const items = {};
    filteredOrders.forEach(o => o.items.forEach(item => {
      if (!items[item.name]) items[item.name] = { name: item.name, qty: 0, revenue: 0 };
      items[item.name].qty += item.qty;
      items[item.name].revenue += item.price * item.qty;
    }));
    return Object.values(items).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [filteredOrders]);

  // Payment methods
  const paymentMethods = useMemo(() => {
    const pm = {};
    filteredOrders.forEach(o => { pm[o.paymentMethod] = (pm[o.paymentMethod] || 0) + o.total; });
    return Object.entries(pm).map(([method, amount]) => ({ method: method || 'unknown', amount }));
  }, [filteredOrders]);

  // Daily trend (for longer periods)
  const dailyTrend = useMemo(() => {
    const days = {};
    filteredOrders.forEach(o => {
      const d = format(new Date(o.createdAt), 'MM/dd');
      days[d] = (days[d] || 0) + o.total;
    });
    return Object.entries(days).map(([day, revenue]) => ({ day, revenue })).slice(-14);
  }, [filteredOrders]);

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=900,height=700');
    const periodLabel = period === 'daily' ? `Today (${format(new Date(), 'dd MMM yyyy')})` :
      period === 'monthly' ? `${format(new Date(), 'MMMM yyyy')}` :
      period === 'yearly' ? `Year ${format(new Date(), 'yyyy')}` :
      `${customStart} to ${customEnd}`;

    win.document.write(`<!DOCTYPE html><html><head><title>Sales Report - ${periodLabel}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 13px; padding: 30px; color: #111; }
      h1 { font-size: 22px; margin-bottom: 4px; } h2 { font-size: 16px; margin: 20px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
      .header { display: flex; justify-content: space-between; margin-bottom: 24px; }
      .grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }
      .stat { border: 1px solid #ddd; border-radius: 6px; padding: 12px; }
      .stat-label { font-size: 11px; color: #888; text-transform: uppercase; }
      .stat-value { font-size: 20px; font-weight: bold; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: #f5f5f5; padding: 8px; text-align: left; border: 1px solid #ddd; }
      td { padding: 7px 8px; border: 1px solid #ddd; }
      .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #888; }
    </style></head><body>
    <div class="header">
      <div><h1>${settings.restaurantName}</h1><div>${settings.address}</div><div>${settings.phone} | GST: ${settings.gstNumber}</div></div>
      <div style="text-align:right"><h2>Sales Report</h2><div>${periodLabel}</div><div>Printed: ${format(new Date(), 'dd/MM/yyyy hh:mm a')}</div></div>
    </div>
    <div class="grid">
      <div class="stat"><div class="stat-label">Total Revenue</div><div class="stat-value">₹${totalRevenue.toLocaleString()}</div></div>
      <div class="stat"><div class="stat-label">Total Orders</div><div class="stat-value">${totalOrders}</div></div>
      <div class="stat"><div class="stat-label">Tax Collected</div><div class="stat-value">₹${totalTax.toLocaleString()}</div></div>
      <div class="stat"><div class="stat-label">Net Profit</div><div class="stat-value" style="color:${netProfit >= 0 ? 'green' : 'red'}">₹${netProfit.toLocaleString()}</div></div>
    </div>
    <h2>Top Selling Items</h2>
    <table><tr><th>#</th><th>Item</th><th>Qty Sold</th><th>Revenue</th></tr>
    ${topItems.map((item, i) => `<tr><td>${i + 1}</td><td>${item.name}</td><td>${item.qty}</td><td>₹${item.revenue.toLocaleString()}</td></tr>`).join('')}
    </table>
    <h2>Category Breakdown</h2>
    <table><tr><th>Category</th><th>Revenue</th><th>Share</th></tr>
    ${categoryRevenue.map(c => `<tr><td>${c.name}</td><td>₹${c.revenue.toLocaleString()}</td><td>${totalRevenue ? Math.round(c.revenue/totalRevenue*100) : 0}%</td></tr>`).join('')}
    </table>
    <h2>Payment Methods</h2>
    <table><tr><th>Method</th><th>Amount</th></tr>
    ${paymentMethods.map(p => `<tr><td style="text-transform:uppercase">${p.method}</td><td>₹${p.amount.toLocaleString()}</td></tr>`).join('')}
    </table>
    <h2>Order Summary</h2>
    <table><tr><th>Metric</th><th>Value</th></tr>
    <tr><td>Total Orders</td><td>${totalOrders}</td></tr>
    <tr><td>Cancelled Orders</td><td>${cancelledOrders}</td></tr>
    <tr><td>Average Order Value</td><td>₹${avgOrderVal}</td></tr>
    <tr><td>Total Tax (GST)</td><td>₹${totalTax.toLocaleString()}</td></tr>
    <tr><td>Total Expenses</td><td>₹${totalExpenses.toLocaleString()}</td></tr>
    <tr><td>Net Profit</td><td>₹${netProfit.toLocaleString()}</td></tr>
    </table>
    <div class="footer">This is a computer generated report — ${settings.restaurantName} · ${format(new Date(), 'dd MMM yyyy')}</div>
    </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="fade-in" style={{ padding: 28, overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 4 }}>Reports & Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Business performance overview</p>
        </div>
        <button className="btn btn-primary" onClick={handlePrint}>🖨️ Print Report</button>
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        {['daily', 'monthly', 'yearly', 'custom'].map(p => (
          <button key={p} onClick={() => setPeriod(p)} className={`btn ${period === p ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '7px 18px', fontSize: 13, textTransform: 'capitalize' }}>{p}</button>
        ))}
        {period === 'custom' && (
          <>
            <input className="input" type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ width: 160 }} />
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <input className="input" type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ width: 160 }} />
          </>
        )}
      </div>

      {/* Key metrics */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'var(--accent-gold)' },
          { label: 'Total Orders', value: totalOrders, color: 'var(--accent-blue)' },
          { label: 'Avg Order Value', value: `₹${avgOrderVal}`, color: 'var(--accent-purple)' },
          { label: 'Net Profit', value: `₹${netProfit.toLocaleString()}`, color: netProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="label">{s.label}</div>
            <div className="value" style={{ color: s.color, fontSize: 22 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: 'Tax Collected', value: `₹${totalTax.toLocaleString()}`, sub: `${settings.taxRate}% GST` },
          { label: 'Total Expenses', value: `₹${totalExpenses.toLocaleString()}`, sub: `${filteredExpenses.length} entries` },
          { label: 'Cancelled Orders', value: cancelledOrders, sub: `${totalOrders > 0 ? Math.round(cancelledOrders / (totalOrders + cancelledOrders) * 100) : 0}% rate` },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="label">{s.label}</div>
            <div className="value" style={{ fontSize: 20 }}>{s.value}</div>
            <div className="change" style={{ color: 'var(--text-muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {dailyTrend.length > 1 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 500, marginBottom: 16 }}>Revenue Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyTrend} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#666e82', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666e82', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#16213e', border: '1px solid #2a3550', borderRadius: 8, color: '#f0f0f0', fontSize: 13 }} formatter={v => [`₹${v}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#f5a623" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Top items table */}
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 14 }}>Top Selling Items</div>
          {topItems.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: 20 }}>No data for this period</div>
          ) : (
            <table className="table">
              <thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Revenue</th></tr></thead>
              <tbody>
                {topItems.map((item, i) => (
                  <tr key={item.name}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{item.qty}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>₹{item.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Category chart */}
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 14 }}>Revenue by Category</div>
          {categoryRevenue.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: 20 }}>No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryRevenue} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#666e82', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#a0a8b8', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: '#16213e', border: '1px solid #2a3550', borderRadius: 8, color: '#f0f0f0', fontSize: 13 }} formatter={v => [`₹${v}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#f5a623" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Payment methods */}
      {paymentMethods.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 14 }}>Payment Methods</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {paymentMethods.map(pm => (
              <div key={pm.method} style={{ flex: 1, minWidth: 120, background: 'var(--bg-surface)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{pm.method === 'cash' ? '💵' : pm.method === 'card' ? '💳' : pm.method === 'upi' ? '📱' : '👛'}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: 'var(--accent-gold)' }}>₹{pm.amount.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>{pm.method}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
