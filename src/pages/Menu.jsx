import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const CATEGORIES = ['Pizza', 'Pasta', 'Burgers', 'Starters', 'Salads', 'Breakfast', 'Beverages', 'Desserts', 'Main Course', 'Soups', 'Sides'];

const BLANK = { name: '', category: 'Pizza', price: '', cost: '', description: '', available: true };

export default function MenuPage() {
  const { menu, addMenuItem, updateMenuItem, deleteMenuItem, settings } = useApp();
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const cats = ['All', ...new Set(menu.map(m => m.category))];
  const filtered = menu.filter(m =>
    (filter === 'All' || m.category === filter) &&
    (search === '' || m.name.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => { setForm(BLANK); setModal('add'); };
  const openEdit = (item) => { setForm(item); setEditId(item.id); setModal('edit'); };
  const handleSave = () => {
    if (!form.name || !form.price) return;
    if (modal === 'add') addMenuItem({ ...form, price: +form.price, cost: +form.cost || 0 });
    else updateMenuItem(editId, { ...form, price: +form.price, cost: +form.cost || 0 });
    setModal(null);
  };

  const totalItems = menu.length;
  const available = menu.filter(m => m.available).length;
  const avgPrice = menu.length ? Math.round(menu.reduce((s, m) => s + m.price, 0) / menu.length) : 0;

  return (
    <div className="fade-in" style={{ padding: 28, overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 4 }}>Menu Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{totalItems} items · {available} available · avg ₹{avgPrice}</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Item</button>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {['Pizza', 'Beverages', 'Starters', 'Desserts'].map(cat => {
          const catItems = menu.filter(m => m.category === cat);
          return (
            <div key={cat} className="stat-card" style={{ padding: 14 }}>
              <div className="label" style={{ fontSize: 11 }}>{cat}</div>
              <div className="value" style={{ fontSize: 20, color: 'var(--accent-gold)' }}>{catItems.length}</div>
              <div className="change" style={{ color: 'var(--text-muted)', fontSize: 11 }}>{catItems.filter(m => m.available).length} available</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search items..." style={{ maxWidth: 240 }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`btn ${filter === c ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '6px 14px', fontSize: 12 }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Item</th><th>Category</th><th>Price</th><th>Cost</th><th>Margin</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const margin = item.cost > 0 ? Math.round((item.price - item.cost) / item.price * 100) : null;
              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                    {item.description && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.description}</div>}
                  </td>
                  <td><span className="badge badge-blue">{item.category}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>₹{item.price}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{item.cost ? `₹${item.cost}` : '—'}</td>
                  <td>
                    {margin !== null ? (
                      <span className={`badge ${margin >= 50 ? 'badge-green' : margin >= 30 ? 'badge-gold' : 'badge-red'}`}>{margin}%</span>
                    ) : '—'}
                  </td>
                  <td>
                    <button onClick={() => updateMenuItem(item.id, { available: !item.available })}
                      style={{ background: item.available ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)', color: item.available ? 'var(--accent-green)' : 'var(--accent-red)', border: 'none', borderRadius: 20, padding: '3px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => openEdit(item)}>✏️ Edit</button>
                      <button className="btn btn-danger" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => deleteMenuItem(item.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No items found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{modal === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}</div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Margherita Pizza" />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Selling Price (₹) *</label>
                  <input className="input" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="280" />
                </div>
                <div className="form-group">
                  <label>Cost Price (₹)</label>
                  <input className="input" type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="90" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the item" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="avail" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} />
                <label htmlFor="avail" style={{ cursor: 'pointer', fontSize: 14 }}>Available for ordering</label>
              </div>
              {form.price && form.cost ? (
                <div style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: 12, fontSize: 13 }}>
                  Gross margin: <strong style={{ color: 'var(--accent-green)' }}>{Math.round((form.price - form.cost) / form.price * 100)}%</strong> (₹{form.price - form.cost} per item)
                </div>
              ) : null}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setModal(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1, justifyContent: 'center' }}>
                  {modal === 'add' ? 'Add to Menu' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
