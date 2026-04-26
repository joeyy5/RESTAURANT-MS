import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

const CATEGORIES = ['All', 'Pizza', 'Pasta', 'Burgers', 'Starters', 'Salads', 'Breakfast', 'Beverages', 'Desserts'];

// ─── RECEIPT GENERATOR ────────────────────────────────────────────────────────
// Uses hidden iframe — NO popup window needed.
// Works on Vercel, Netlify, GitHub Pages, localhost — everywhere.
function generateReceipt(order, settings) {
  const itemRows = order.items
    .map(i => `
      <tr>
        <td style="padding:5px 6px;">${i.name}</td>
        <td style="padding:5px 6px;text-align:center;">${i.qty}</td>
        <td style="padding:5px 6px;text-align:right;">&#8377;${(i.price * i.qty).toLocaleString()}</td>
      </tr>`)
    .join('');

  const receiptHTML = `
    <style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{
        font-family:'Courier New',Courier,monospace;
        font-size:13px;width:300px;
        margin:0 auto;padding:16px 14px;
        color:#111;background:#fff;
      }
      .center{text-align:center;}
      .bold{font-weight:bold;}
      .dashed{border-top:1px dashed #888;margin:9px 0;}
      .solid{border-top:2px solid #111;margin:9px 0;}
      table{width:100%;border-collapse:collapse;}
      th{font-size:11px;text-transform:uppercase;color:#555;padding:4px 6px;
         text-align:left;border-bottom:1px dashed #aaa;}
      .totals td{padding:3px 6px;}
      .grand td{padding:7px 6px;font-weight:bold;font-size:15px;border-top:2px solid #111;}
      .badge{display:inline-block;background:#111;color:#fff;
             padding:2px 8px;border-radius:3px;font-size:11px;}
      .paid{color:green;font-weight:bold;}
      @media print{body{width:100%;margin:0;padding:10px;}}
    </style>

    <div class="center" style="margin-bottom:10px;">
      <div class="bold" style="font-size:17px;letter-spacing:1px;margin-bottom:3px;">
        ${settings.restaurantName}
      </div>
      <div style="font-size:11px;color:#444;line-height:1.6;">
        ${settings.address}<br/>
        Tel: ${settings.phone}<br/>
        GST: ${settings.gstNumber}
      </div>
    </div>

    <div class="dashed"></div>

    <table class="totals" style="margin-bottom:2px;">
      <tr>
        <td class="bold" style="padding:2px 6px;">Order #</td>
        <td style="text-align:right;padding:2px 6px;">${order.orderNumber}</td>
      </tr>
      <tr>
        <td class="bold" style="padding:2px 6px;">Date</td>
        <td style="text-align:right;padding:2px 6px;">
          ${format(new Date(order.createdAt), 'dd/MM/yyyy hh:mm a')}
        </td>
      </tr>
      <tr>
        <td class="bold" style="padding:2px 6px;">Type</td>
        <td style="text-align:right;padding:2px 6px;text-transform:capitalize;">${order.type}</td>
      </tr>
      ${order.tableId ? `<tr>
        <td class="bold" style="padding:2px 6px;">Table</td>
        <td style="text-align:right;padding:2px 6px;">${order.tableId}</td>
      </tr>` : ''}
      ${order.customerName ? `<tr>
        <td class="bold" style="padding:2px 6px;">Customer</td>
        <td style="text-align:right;padding:2px 6px;">${order.customerName}</td>
      </tr>` : ''}
      ${order.createdByName ? `<tr>
        <td class="bold" style="padding:2px 6px;">Staff</td>
        <td style="text-align:right;padding:2px 6px;">${order.createdByName}</td>
      </tr>` : ''}
    </table>

    <div class="dashed"></div>

    <table>
      <thead>
        <tr>
          <th style="text-align:left;">Item</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Amt</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div class="dashed"></div>

    <table class="totals">
      <tr>
        <td>Subtotal</td>
        <td style="text-align:right;">&#8377;${order.subtotal.toLocaleString()}</td>
      </tr>
      <tr>
        <td>GST (${settings.taxRate}%)</td>
        <td style="text-align:right;">&#8377;${order.tax.toLocaleString()}</td>
      </tr>
      ${order.serviceCharge > 0 ? `<tr>
        <td>Service Charge (${settings.serviceCharge}%)</td>
        <td style="text-align:right;">&#8377;${order.serviceCharge.toLocaleString()}</td>
      </tr>` : ''}
    </table>

    <table class="grand">
      <tr>
        <td>TOTAL</td>
        <td style="text-align:right;">&#8377;${order.total.toLocaleString()}</td>
      </tr>
    </table>

    ${order.paymentMethod ? `
    <div class="dashed"></div>
    <table class="totals">
      <tr>
        <td class="bold" style="padding:3px 6px;">Payment</td>
        <td style="text-align:right;padding:3px 6px;">
          <span class="badge">${order.paymentMethod.toUpperCase()}</span>
        </td>
      </tr>
      <tr>
        <td class="bold" style="padding:3px 6px;">Status</td>
        <td style="text-align:right;padding:3px 6px;" class="paid">&#10003; PAID</td>
      </tr>
    </table>` : ''}

    <div class="solid"></div>

    <div class="center" style="font-size:11px;color:#555;line-height:1.7;margin-top:4px;">
      <div>Thank you for dining with us!</div>
      <div>Visit us again &mdash; ${settings.restaurantName}</div>
      <div style="margin-top:6px;font-size:10px;color:#999;">Computer generated receipt</div>
    </div>
  `;

  // Remove any leftover iframe from a previous print call
  const existing = document.getElementById('rms-receipt-iframe');
  if (existing) existing.remove();

  // Create invisible iframe — browser never blocks this, no popup permission needed
  const iframe = document.createElement('iframe');
  iframe.id = 'rms-receipt-iframe';
  iframe.style.cssText = [
    'position:fixed',
    'top:-9999px',
    'left:-9999px',
    'width:400px',
    'height:700px',
    'border:none',
    'visibility:hidden',
    'z-index:-1',
  ].join(';');
  document.body.appendChild(iframe);

  // Write receipt HTML into iframe
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <title>Receipt ${order.orderNumber}</title></head>
    <body>${receiptHTML}</body></html>`);
  doc.close();

  // Wait for iframe content to render, then trigger print dialog
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.error('Receipt print error:', err);
    }
    // Cleanup after print dialog closes
    setTimeout(() => {
      const el = document.getElementById('rms-receipt-iframe');
      if (el) el.remove();
    }, 3000);
  }, 450);
}

// ─── MAIN POS COMPONENT ───────────────────────────────────────────────────────
export default function POS() {
  const {
    menu, tables, createOrder, orders,
    updateOrderStatus, processPayment, cancelOrder,
    addItemToOrder, settings, addNotification,
  } = useApp();

  const [selectedTable, setSelectedTable] = useState('');
  const [orderType, setOrderType]         = useState('dine-in');
  const [cart, setCart]                   = useState([]);
  const [catFilter, setCatFilter]         = useState('All');
  const [search, setSearch]               = useState('');
  const [payModal, setPayModal]           = useState(null);
  const [payMethod, setPayMethod]         = useState('cash');
  const [customerName, setCustomerName]   = useState('');
  const [viewMode, setViewMode]           = useState('pos');

  // ── Menu filter ─────────────────────────────────────────────────────────────
  const filteredMenu = menu.filter(m =>
    m.available &&
    (catFilter === 'All' || m.category === catFilter) &&
    (search === '' || m.name.toLowerCase().includes(search.toLowerCase()))
  );

  // ── Cart helpers ─────────────────────────────────────────────────────────────
  const addToCart = (item) => {
    setCart(c => {
      const ex = c.find(i => i.id === item.id);
      return ex
        ? c.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...c, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(c => c.filter(i => i.id !== id));

  const changeQty = (id, delta) =>
    setCart(c =>
      c.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
       .filter(i => i.qty > 0)
    );

  // ── Totals ───────────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax      = Math.round(subtotal * settings.taxRate / 100);
  const sc       = orderType === 'dine-in' ? Math.round(subtotal * settings.serviceCharge / 100) : 0;
  const total    = subtotal + tax + sc;

  // ── Place order ──────────────────────────────────────────────────────────────
  const handlePlaceOrder = () => {
    if (cart.length === 0)                         { addNotification('Add items to cart first', 'error'); return; }
    if (orderType === 'dine-in' && !selectedTable) { addNotification('Please select a table', 'error'); return; }
    createOrder(selectedTable || null, cart, orderType, customerName);
    setCart([]); setSelectedTable(''); setCustomerName('');
    setViewMode('orders');
  };

  // ── Confirm payment → iframe print ──────────────────────────────────────────
  const handleConfirmPayment = () => {
    if (!payModal) return;
    const paidOrder = {
      ...payModal,
      paymentMethod: payMethod,
      paymentStatus: 'paid',
      status: 'completed',
      paidAt: new Date().toISOString(),
    };
    processPayment(payModal.id, payMethod);   // save to state/localStorage
    setPayModal(null);                         // close modal immediately
    generateReceipt(paidOrder, settings);     // print silently via iframe
  };

  // ── Print existing paid order ────────────────────────────────────────────────
  const handlePrintExisting = (order) => generateReceipt(order, settings);

  // ── Order lists ──────────────────────────────────────────────────────────────
  const liveOrders = [...orders]
    .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const allOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const availTables = tables.filter(t => t.status === 'available');

  const statusColor = (s) => {
    if (s === 'completed') return 'var(--accent-green)';
    if (s === 'cancelled') return 'var(--accent-red)';
    if (s === 'preparing') return 'var(--accent-gold)';
    if (s === 'ready')     return 'var(--accent-purple)';
    return 'var(--accent-blue)';
  };

  const badgeClass = (s) => {
    if (s === 'completed') return 'badge-green';
    if (s === 'cancelled') return 'badge-red';
    if (s === 'preparing') return 'badge-gold';
    return 'badge-blue';
  };

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 20 }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
          <button className={`btn ${viewMode === 'pos' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('pos')}>
            🧾 New Order
          </button>
          <button className={`btn ${viewMode === 'orders' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('orders')}>
            📋 Live Orders
            {liveOrders.length > 0 && (
              <span style={{ background: 'var(--accent-red)', borderRadius: 20, padding: '1px 7px', fontSize: 11, marginLeft: 4 }}>
                {liveOrders.length}
              </span>
            )}
          </button>
          <button className="btn btn-ghost" onClick={() => setViewMode('history')}>
            📂 History
          </button>
        </div>

        {/* POS MODE */}
        {viewMode === 'pos' && (
          <>
            <input
              className="input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search menu items..."
              style={{ marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`btn ${catFilter === c ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '6px 14px', fontSize: 13 }}>
                  {c}
                </button>
              ))}
            </div>
            <div style={{
              flex: 1, overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
              gap: 12, alignContent: 'start',
            }}>
              {filteredMenu.map(item => (
                <button key={item.id} onClick={() => addToCart(item)}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: 14, cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s', display: 'flex', flexDirection: 'column', gap: 4,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.category}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', fontSize: 15, marginTop: 4 }}>
                    ₹{item.price}
                  </div>
                </button>
              ))}
              {filteredMenu.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                  No items found
                </div>
              )}
            </div>
          </>
        )}

        {/* ORDERS / HISTORY MODE */}
        {(viewMode === 'orders' || viewMode === 'history') && (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(viewMode === 'orders' ? liveOrders : allOrders).map(o => (
              <div key={o.id} className="card" style={{ borderLeft: `3px solid ${statusColor(o.status)}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>{o.orderNumber}</span>
                    <span className={`badge ${badgeClass(o.status)}`}>{o.status}</span>
                    <span className={`badge ${o.paymentStatus === 'paid' ? 'badge-green' : 'badge-red'}`}>{o.paymentStatus}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {o.status === 'pending' && (
                      <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => updateOrderStatus(o.id, 'preparing')}>🔥 Preparing</button>
                    )}
                    {o.status === 'preparing' && (
                      <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => updateOrderStatus(o.id, 'ready')}>✅ Ready</button>
                    )}
                    {o.status === 'ready' && (
                      <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => updateOrderStatus(o.id, 'completed')}>🍽️ Served</button>
                    )}
                    {o.paymentStatus === 'unpaid' && o.status !== 'cancelled' && (
                      <button className="btn btn-success" style={{ padding: '4px 12px', fontSize: 12 }}
                        onClick={() => { setPayModal(o); setPayMethod('cash'); }}>
                        💳 Pay &amp; Bill
                      </button>
                    )}
                    {o.paymentStatus === 'paid' && (
                      <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }}
                        onClick={() => handlePrintExisting(o)}>
                        🖨️ Print Bill
                      </button>
                    )}
                    {o.status !== 'completed' && o.status !== 'cancelled' && (
                      <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => cancelOrder(o.id)}>✕ Cancel</button>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, flexWrap: 'wrap' }}>
                  <span>{o.tableId ? `🪑 Table ${o.tableId}` : '📦 Takeaway'}</span>
                  <span style={{ textTransform: 'capitalize' }}>{o.type}</span>
                  {o.customerName && <span>👤 {o.customerName}</span>}
                  <span>🕐 {format(new Date(o.createdAt), 'hh:mm a, dd MMM')}</span>
                  {o.createdByName && <span>Staff: {o.createdByName}</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {o.items.map(i => (
                    <span key={i.id} style={{ background: 'var(--bg-surface)', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>
                      {i.name} ×{i.qty}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', fontSize: 17, fontWeight: 600 }}>
                    ₹{o.total.toLocaleString()}
                  </div>
                  {o.paymentMethod && (
                    <span className="badge badge-green" style={{ textTransform: 'uppercase', fontSize: 11 }}>
                      {o.paymentMethod}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {(viewMode === 'orders' ? liveOrders : allOrders).length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 60 }}>
                {viewMode === 'orders' ? 'No active orders. Go to New Order to start.' : 'No order history yet.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── RIGHT: Cart Panel ──────────────────────────────────────────────── */}
      {viewMode === 'pos' && (
        <div style={{ width: 300, background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>
            🛒 Order
            {cart.length > 0 && (
              <span style={{ background: 'var(--accent-gold)', color: '#0f0f1a', borderRadius: 20, fontSize: 11, padding: '1px 8px', marginLeft: 8, fontWeight: 600 }}>
                {cart.reduce((s, i) => s + i.qty, 0)} items
              </span>
            )}
          </div>

          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <select className="input" value={orderType} onChange={e => setOrderType(e.target.value)} style={{ fontSize: 13 }}>
              <option value="dine-in">🪑 Dine-In</option>
              <option value="takeaway">📦 Takeaway</option>
              <option value="delivery">🛵 Delivery</option>
            </select>
            {orderType === 'dine-in' ? (
              <select className="input" value={selectedTable} onChange={e => setSelectedTable(e.target.value)} style={{ fontSize: 13 }}>
                <option value="">— Select Table —</option>
                {availTables.map(t => (
                  <option key={t.id} value={t.id}>Table {t.number} · {t.section} · {t.capacity} seats</option>
                ))}
              </select>
            ) : (
              <input className="input" placeholder="Customer name (optional)"
                value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ fontSize: 13 }} />
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 14 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🍽️</div>
                Tap any menu item to add it
              </div>
            ) : cart.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, fontSize: 13 }}>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>₹{item.price} each</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button onClick={() => changeQty(item.id, -1)}
                    style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>−</button>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, minWidth: 22, textAlign: 'center', fontWeight: 600 }}>{item.qty}</span>
                  <button onClick={() => changeQty(item.id, 1)}
                    style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>+</button>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, minWidth: 54, textAlign: 'right' }}>
                  ₹{(item.price * item.qty).toLocaleString()}
                </div>
                <button onClick={() => removeFromCart(item.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: 18, padding: '0 2px', lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>

          <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>GST ({settings.taxRate}%)</span><span>₹{tax.toLocaleString()}</span>
              </div>
              {sc > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Service Charge ({settings.serviceCharge}%)</span><span>₹{sc.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 17, paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 4 }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>₹{total.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setCart([])} style={{ flex: 1, justifyContent: 'center' }}>🗑 Clear</button>
              <button className="btn btn-primary" onClick={handlePlaceOrder} style={{ flex: 2, justifyContent: 'center', fontWeight: 600 }}>Place Order →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAYMENT MODAL ──────────────────────────────────────────────────── */}
      {payModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setPayModal(null); }}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">💳 Process Payment</div>
              <button className="modal-close" onClick={() => setPayModal(null)}>×</button>
            </div>

            <div style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: 14, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>Order</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{payModal.orderNumber}</span>
              </div>
              {payModal.tableId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>Table</span><span>{payModal.tableId}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>Items</span><span>{payModal.items.length}</span>
              </div>
              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 10, marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 700 }}>
                <span>Amount Due</span>
                <span style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>₹{payModal.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 22 }}>
              <label style={{ marginBottom: 10 }}>Select Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { key: 'cash',   icon: '💵', label: 'Cash'   },
                  { key: 'card',   icon: '💳', label: 'Card'   },
                  { key: 'upi',    icon: '📱', label: 'UPI'    },
                  { key: 'wallet', icon: '👛', label: 'Wallet' },
                ].map(m => (
                  <button key={m.key} onClick={() => setPayMethod(m.key)}
                    style={{
                      padding: '12px 10px', borderRadius: 10,
                      border: `2px solid ${payMethod === m.key ? 'var(--accent-gold)' : 'var(--border)'}`,
                      background: payMethod === m.key ? 'rgba(245,166,35,0.12)' : 'var(--bg-surface)',
                      color: payMethod === m.key ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: 14, fontWeight: 500,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.15s',
                    }}>
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setPayModal(null)} style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleConfirmPayment}
                style={{ flex: 2, justifyContent: 'center', fontWeight: 600, fontSize: 15 }}>
                ✓ Confirm &amp; Print Bill
              </button>
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              🖨️ Print dialog opens automatically — no popup needed
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
