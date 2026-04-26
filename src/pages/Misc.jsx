import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// ─── INVENTORY ───────────────────────────────────────────────────────────────
export function Inventory() {
  const { inventory, setInventory, addNotification } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Produce', unit: 'kg', quantity: '', minStock: '', cost: '' });

  const add = () => {
    if (!form.name || !form.quantity) return;
    setInventory(i => [...i, { ...form, id: uuidv4(), quantity: +form.quantity, minStock: +form.minStock || 0, cost: +form.cost || 0, updatedAt: new Date().toISOString() }]);
    setModal(false);
    setForm({ name: '', category: 'Produce', unit: 'kg', quantity: '', minStock: '', cost: '' });
    addNotification('Inventory item added', 'success');
  };

  const updateQty = (id, delta) => {
    setInventory(i => i.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta), updatedAt: new Date().toISOString() } : item));
  };

  const remove = (id) => setInventory(i => i.filter(item => item.id !== id));
  const lowStock = inventory.filter(i => i.quantity <= i.minStock && i.minStock > 0);

  return (
    <div className="fade-in" style={{ padding: 28, overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 4 }}>Inventory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{inventory.length} items tracked · {lowStock.length} low stock</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add Item</button>
      </div>

      {lowStock.length > 0 && (
        <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 10, padding: 14, marginBottom: 20 }}>
          <div style={{ color: 'var(--accent-red)', fontWeight: 500, marginBottom: 8 }}>⚠️ Low Stock Alert ({lowStock.length} items)</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {lowStock.map(item => (
              <span key={item.id} style={{ background: 'rgba(231,76,60,0.15)', color: 'var(--accent-red)', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>
                {item.name}: {item.quantity} {item.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr><th>Item</th><th>Category</th><th>Quantity</th><th>Min Stock</th><th>Unit Cost</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No inventory items. Add items to track stock.</td></tr>
            ) : inventory.map(item => {
              const isLow = item.minStock > 0 && item.quantity <= item.minStock;
              return (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.name}</td>
                  <td><span className="badge badge-blue">{item.category}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => updateQty(item.id, -1)} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontFamily: 'var(--font-mono)', minWidth: 40, textAlign: 'center' }}>{item.quantity} {item.unit}</span>
                      <button onClick={() => updateQty(item.id, 1)} style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{item.minStock} {item.unit}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>₹{item.cost || '—'}</td>
                  <td><span className={`badge ${isLow ? 'badge-red' : 'badge-green'}`}>{isLow ? 'Low Stock' : 'In Stock'}</span></td>
                  <td><button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => remove(item.id)}>✕ Remove</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div className="modal-title">Add Inventory Item</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2">
                <div className="form-group"><label>Item Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Tomatoes" /></div>
                <div className="form-group"><label>Category</label>
                  <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {['Produce', 'Meat', 'Dairy', 'Beverages', 'Spices', 'Grains', 'Packaging', 'Cleaning'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Current Quantity *</label><input className="input" type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="50" /></div>
                <div className="form-group"><label>Unit</label>
                  <select className="input" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                    {['kg', 'g', 'L', 'ml', 'pcs', 'box', 'dozen', 'bottle'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Min Stock Alert</label><input className="input" type="number" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))} placeholder="10" /></div>
                <div className="form-group"><label>Unit Cost (₹)</label><input className="input" type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="50" /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button className="btn btn-primary" onClick={add} style={{ flex: 1, justifyContent: 'center' }}>Add Item</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EXPENSES ─────────────────────────────────────────────────────────────────
export function Expenses() {
  const { expenses, addExpense } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Food & Beverage', amount: '', notes: '', date: format(new Date(), 'yyyy-MM-dd') });

  const add = () => {
    if (!form.title || !form.amount) return;
    addExpense({ ...form, amount: +form.amount });
    setModal(false);
    setForm({ title: '', category: 'Food & Beverage', amount: '', notes: '', date: format(new Date(), 'yyyy-MM-dd') });
  };

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const thisMonth = expenses.filter(e => new Date(e.createdAt).getMonth() === new Date().getMonth()).reduce((s, e) => s + e.amount, 0);

  return (
    <div className="fade-in" style={{ padding: 28, overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 4 }}>Expenses</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Total: ₹{totalExpenses.toLocaleString()} · This month: ₹{thisMonth.toLocaleString()}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add Expense</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Notes</th></tr></thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No expenses recorded yet</td></tr>
            ) : [...expenses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(e => (
              <tr key={e.id}>
                <td style={{ fontWeight: 500 }}>{e.title}</td>
                <td><span className="badge badge-purple">{e.category}</span></td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-red)' }}>₹{e.amount.toLocaleString()}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{format(new Date(e.createdAt), 'dd MMM yyyy')}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{e.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div className="modal-title">Record Expense</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group"><label>Title *</label><input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Vegetable purchase" /></div>
              <div className="grid-2">
                <div className="form-group"><label>Category</label>
                  <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {['Food & Beverage', 'Utilities', 'Staff Salary', 'Rent', 'Marketing', 'Maintenance', 'Equipment', 'Miscellaneous'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Amount (₹) *</label><input className="input" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="500" /></div>
              </div>
              <div className="form-group"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div className="form-group"><label>Notes</label><input className="input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" /></div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button className="btn btn-primary" onClick={add} style={{ flex: 1, justifyContent: 'center' }}>Save Expense</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RESERVATIONS ─────────────────────────────────────────────────────────────
export function Reservations() {
  const { reservations, addReservation, updateReservation, tables } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ guestName: '', phone: '', date: format(new Date(), 'yyyy-MM-dd'), time: '19:00', guests: 2, tableId: '', notes: '' });

  const add = () => {
    if (!form.guestName || !form.date || !form.time) return;
    addReservation(form);
    setModal(false);
    setForm({ guestName: '', phone: '', date: format(new Date(), 'yyyy-MM-dd'), time: '19:00', guests: 2, tableId: '', notes: '' });
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayRes = reservations.filter(r => r.date === today);
  const upcoming = [...reservations].filter(r => r.date >= today && r.status !== 'cancelled').sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  return (
    <div className="fade-in" style={{ padding: 28, overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 4 }}>Reservations</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{todayRes.length} today · {upcoming.length} upcoming</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ New Reservation</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {upcoming.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 60 }}>No upcoming reservations</div>
        ) : upcoming.map(r => (
          <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, borderLeft: `3px solid ${r.status === 'confirmed' ? 'var(--accent-green)' : r.status === 'seated' ? 'var(--accent-blue)' : 'var(--accent-red)'}` }}>
            <div style={{ textAlign: 'center', minWidth: 60 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--accent-gold)' }}>{r.date.split('-')[2]}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(r.date), 'MMM')}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{r.time}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 16 }}>{r.guestName}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                {r.guests} guests · {r.phone}
                {r.tableId && ` · Table ${r.tableId}`}
              </div>
              {r.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>📝 {r.notes}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className={`badge ${r.status === 'confirmed' ? 'badge-green' : r.status === 'seated' ? 'badge-blue' : r.status === 'cancelled' ? 'badge-red' : 'badge-gold'}`} style={{ textTransform: 'capitalize' }}>{r.status}</span>
              {r.status === 'confirmed' && <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => updateReservation(r.id, { status: 'seated' })}>→ Seat</button>}
              {r.status !== 'cancelled' && r.status !== 'seated' && <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12, color: 'var(--accent-red)' }} onClick={() => updateReservation(r.id, { status: 'cancelled' })}>Cancel</button>}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">New Reservation</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2">
                <div className="form-group"><label>Guest Name *</label><input className="input" value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))} placeholder="John Smith" /></div>
                <div className="form-group"><label>Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" /></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Date *</label><input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
                <div className="form-group"><label>Time *</label><input className="input" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Number of Guests</label><input className="input" type="number" min="1" max="20" value={form.guests} onChange={e => setForm(f => ({ ...f, guests: +e.target.value }))} /></div>
                <div className="form-group"><label>Preferred Table</label>
                  <select className="input" value={form.tableId} onChange={e => setForm(f => ({ ...f, tableId: e.target.value }))}>
                    <option value="">Any available</option>
                    {tables.map(t => <option key={t.id} value={t.id}>Table {t.number} (Seats {t.capacity})</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Special Requests</label><input className="input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Allergies, occasion, preferences..." /></div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button className="btn btn-primary" onClick={add} style={{ flex: 1, justifyContent: 'center' }}>Confirm Reservation</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
export function Settings() {
  const { settings, setSettings, addNotification } = useApp();
  const [form, setForm] = useState(settings);

  const save = () => { setSettings(form); addNotification('Settings saved', 'success'); };

  return (
    <div className="fade-in" style={{ padding: 28, overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>Settings</h1>
        <button className="btn btn-primary" onClick={save}>💾 Save Settings</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 700 }}>
        {/* Restaurant info */}
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 16, fontSize: 15 }}>Restaurant Information</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group"><label>Restaurant Name</label><input className="input" value={form.restaurantName} onChange={e => setForm(f => ({ ...f, restaurantName: e.target.value }))} /></div>
            <div className="form-group"><label>Address</label><input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="grid-2">
              <div className="form-group"><label>Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="form-group"><label>Email</label><input className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
            <div className="form-group"><label>GST Number</label><input className="input" value={form.gstNumber} onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))} /></div>
          </div>
        </div>

        {/* Billing settings */}
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 16, fontSize: 15 }}>Billing & Tax</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div className="form-group"><label>GST Rate (%)</label><input className="input" type="number" value={form.taxRate} onChange={e => setForm(f => ({ ...f, taxRate: +e.target.value }))} /></div>
            <div className="form-group"><label>Service Charge (%)</label><input className="input" type="number" value={form.serviceCharge} onChange={e => setForm(f => ({ ...f, serviceCharge: +e.target.value }))} /></div>
            <div className="form-group"><label>Currency Symbol</label><input className="input" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} /></div>
          </div>
        </div>

        {/* Operations */}
        <div className="card">
          <div style={{ fontWeight: 500, marginBottom: 16, fontSize: 15 }}>Operations</div>
          <div className="grid-2">
            <div className="form-group"><label>Opening Time</label><input className="input" type="time" value={form.openingTime} onChange={e => setForm(f => ({ ...f, openingTime: e.target.value }))} /></div>
            <div className="form-group"><label>Closing Time</label><input className="input" type="time" value={form.closingTime} onChange={e => setForm(f => ({ ...f, closingTime: e.target.value }))} /></div>
          </div>
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: 13, background: 'var(--bg-card)', borderRadius: 8, padding: 14, border: '1px solid var(--border)' }}>
          💾 All data is stored locally in your browser using localStorage. To deploy this app online, build with <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: 4 }}>npm run build</code> and host on Vercel, Netlify, or any static hosting.
        </div>
      </div>
    </div>
  );
}
