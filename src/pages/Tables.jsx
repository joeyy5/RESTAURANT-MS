import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

const STATUS_COLOR = { available: 'var(--accent-green)', occupied: 'var(--accent-red)', reserved: 'var(--accent-gold)', cleaning: 'var(--accent-blue)' };
const STATUS_BG = { available: 'rgba(46,204,113,0.1)', occupied: 'rgba(231,76,60,0.1)', reserved: 'rgba(245,166,35,0.1)', cleaning: 'rgba(52,152,219,0.1)' };

export default function Tables({ onNav }) {
  const { tables, setTables, orders, settings } = useApp();
  const [addModal, setAddModal] = useState(false);
  const [newTable, setNewTable] = useState({ capacity: 4, section: 'Indoor' });
  const [filter, setFilter] = useState('all');

  const filtered = tables.filter(t => filter === 'all' || t.status === filter);

  const getTableOrder = (tableId) => orders.find(o => o.tableId === tableId && o.status !== 'completed' && o.status !== 'cancelled');

  const changeStatus = (id, status) => setTables(t => t.map(tb => tb.id === id ? { ...tb, status } : tb));

  const addTable = () => {
    const max = tables.reduce((m, t) => Math.max(m, t.number), 0);
    setTables(t => [...t, {
      id: `T${max + 1}`, number: max + 1, capacity: newTable.capacity,
      status: 'available', currentOrder: null, section: newTable.section,
    }]);
    setAddModal(false);
  };

  const sections = [...new Set(tables.map(t => t.section))];

  return (
    <div className="fade-in" style={{ padding: 28, overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 4 }}>Table Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {tables.filter(t => t.status === 'available').length} available · {tables.filter(t => t.status === 'occupied').length} occupied · {tables.length} total
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddModal(true)}>+ Add Table</button>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'available', 'occupied', 'reserved', 'cleaning'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '7px 16px', fontSize: 13, textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_COLOR).map(([s, c]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
            <span style={{ textTransform: 'capitalize' }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Tables by section */}
      {sections.map(section => {
        const sectionTables = filtered.filter(t => t.section === section);
        if (sectionTables.length === 0) return null;
        return (
          <div key={section} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{section}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              {sectionTables.map(table => {
                const order = getTableOrder(table.id);
                return (
                  <div key={table.id} style={{ background: STATUS_BG[table.status] || 'var(--bg-card)', border: `2px solid ${STATUS_COLOR[table.status]}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: STATUS_COLOR[table.status] }}>T{table.number}</div>
                      <span className="badge" style={{ background: STATUS_BG[table.status], color: STATUS_COLOR[table.status], border: `1px solid ${STATUS_COLOR[table.status]}40`, textTransform: 'capitalize' }}>{table.status}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      <div>Seats: <strong>{table.capacity}</strong></div>
                      {order && (
                        <div style={{ marginTop: 6 }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-gold)' }}>{order.orderNumber}</div>
                          <div style={{ fontSize: 12 }}>{order.items.length} items · ₹{order.total}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(order.createdAt), 'hh:mm a')}</div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {table.status !== 'available' && (
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => changeStatus(table.id, 'available')}>✓ Free</button>
                      )}
                      {table.status === 'available' && (
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => changeStatus(table.id, 'cleaning')}>🧹 Clean</button>
                      )}
                      {table.status === 'available' && (
                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => changeStatus(table.id, 'reserved')}>📅 Reserve</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Add Table Modal */}
      {addModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <div className="modal-title">Add New Table</div>
              <button className="modal-close" onClick={() => setAddModal(false)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Seating Capacity</label>
                <select className="input" value={newTable.capacity} onChange={e => setNewTable(n => ({ ...n, capacity: +e.target.value }))}>
                  {[2, 4, 6, 8, 10].map(c => <option key={c} value={c}>{c} persons</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Section</label>
                <input className="input" value={newTable.section} onChange={e => setNewTable(n => ({ ...n, section: e.target.value }))} placeholder="Indoor / Outdoor / Terrace" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setAddModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button className="btn btn-primary" onClick={addTable} style={{ flex: 1, justifyContent: 'center' }}>Add Table</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
