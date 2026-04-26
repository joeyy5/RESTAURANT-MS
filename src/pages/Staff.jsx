import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

const ROLES = ['admin', 'manager', 'waiter', 'kitchen', 'cashier'];
const BLANK = { name: '', email: '', password: '', phone: '', role: 'waiter', active: true };

export default function Staff() {
  const { staff, addStaff, updateStaff, user } = useApp();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = staff.filter(s => filter === 'all' || s.role === filter);

  const openAdd = () => { setForm(BLANK); setModal('add'); };
  const openEdit = (s) => { setForm(s); setEditId(s.id); setModal('edit'); };
  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (modal === 'add') addStaff(form);
    else updateStaff(editId, form);
    setModal(null);
  };

  const ROLE_COLORS = { admin: 'badge-red', manager: 'badge-purple', waiter: 'badge-blue', kitchen: 'badge-gold', cashier: 'badge-green' };

  return (
    <div className="fade-in" style={{ padding: 28, overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 4 }}>Staff Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{staff.filter(s => s.active).length} active · {staff.length} total</p>
        </div>
        {user?.role === 'admin' && <button className="btn btn-primary" onClick={openAdd}>+ Add Staff</button>}
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {ROLES.slice(0, 4).map(role => (
          <div key={role} className="stat-card" style={{ padding: 14 }}>
            <div className="label" style={{ textTransform: 'capitalize' }}>{role}s</div>
            <div className="value" style={{ fontSize: 22, color: 'var(--accent-gold)' }}>{staff.filter(s => s.role === role && s.active).length}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', ...ROLES].map(r => (
          <button key={r} onClick={() => setFilter(r)} className={`btn ${filter === r ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '6px 14px', fontSize: 12, textTransform: 'capitalize' }}>{r}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Contact</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(member => (
              <tr key={member.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14, color: 'var(--accent-gold)', flexShrink: 0 }}>
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{member.name}</div>
                      {member.id === user?.id && <div style={{ fontSize: 11, color: 'var(--accent-gold)' }}>You</div>}
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: 13 }}>{member.email}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{member.phone}</div>
                </td>
                <td><span className={`badge ${ROLE_COLORS[member.role] || 'badge-blue'}`} style={{ textTransform: 'capitalize' }}>{member.role}</span></td>
                <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{member.joinDate ? format(new Date(member.joinDate), 'dd MMM yyyy') : '—'}</td>
                <td>
                  <span className={`badge ${member.active ? 'badge-green' : 'badge-red'}`}>{member.active ? 'Active' : 'Inactive'}</span>
                </td>
                <td>
                  {user?.role === 'admin' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => openEdit(member)}>✏️ Edit</button>
                      <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 12, color: member.active ? 'var(--accent-red)' : 'var(--accent-green)' }}
                        onClick={() => updateStaff(member.id, { active: !member.active })}>
                        {member.active ? '⛔ Deactivate' : '✓ Activate'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{modal === 'add' ? 'Add Staff Member' : 'Edit Staff'}</div>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Rahul Sharma" />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="staff@restaurant.com" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
              </div>
              {modal === 'add' && (
                <div className="form-group">
                  <label>Password *</label>
                  <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Minimum 6 characters" />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="active" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                <label htmlFor="active" style={{ cursor: 'pointer', fontSize: 14 }}>Active (can login)</label>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={() => setModal(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1, justifyContent: 'center' }}>
                  {modal === 'add' ? 'Add Staff' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
