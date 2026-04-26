import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { auth, firebaseSignOut, checkRedirectResult } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AppContext = createContext(null);

// ── SUPER ADMIN CONFIG ────────────────────────────────────────────────────────
// If you fork this project, update these values to your own details.
// You can also use environment variables (add to .env.local):
//   REACT_APP_ADMIN_NAME, REACT_APP_ADMIN_EMAIL, REACT_APP_ADMIN_PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
const SUPER_ADMIN = {
  id:           'superadmin-jayesh-001',
  name:         process.env.REACT_APP_ADMIN_NAME     || 'Jayesh Shashikant Koli',
  email:        process.env.REACT_APP_ADMIN_EMAIL    || 'jay2k5r@gmail.com',
  password:     process.env.REACT_APP_ADMIN_PASSWORD || '@Jay0612RJk',
  role:         'admin',
  phone:        '',
  active:       true,
  joinDate:     '2024-01-01T00:00:00.000Z',
  isSuperAdmin: true,
  authType:     'password',
};

const DEFAULT_MENU = [
  { id: uuidv4(), name: 'Margherita Pizza',    category: 'Pizza',     price: 280, cost: 90,  available: true, description: 'Classic tomato & mozzarella' },
  { id: uuidv4(), name: 'Pepperoni Pizza',     category: 'Pizza',     price: 340, cost: 110, available: true, description: 'Loaded with pepperoni' },
  { id: uuidv4(), name: 'Pasta Carbonara',     category: 'Pasta',     price: 220, cost: 65,  available: true, description: 'Creamy egg & pancetta' },
  { id: uuidv4(), name: 'Chicken Tikka',       category: 'Starters',  price: 180, cost: 55,  available: true, description: 'Marinated grilled chicken' },
  { id: uuidv4(), name: 'Veg Burger',          category: 'Burgers',   price: 150, cost: 45,  available: true, description: 'Crispy veggie patty' },
  { id: uuidv4(), name: 'Chicken Burger',      category: 'Burgers',   price: 190, cost: 60,  available: true, description: 'Juicy grilled chicken' },
  { id: uuidv4(), name: 'Caesar Salad',        category: 'Salads',    price: 160, cost: 50,  available: true, description: 'Romaine, croutons & dressing' },
  { id: uuidv4(), name: 'Masala Dosa',         category: 'Breakfast', price: 90,  cost: 28,  available: true, description: 'Crispy South Indian crepe' },
  { id: uuidv4(), name: 'Cold Coffee',         category: 'Beverages', price: 80,  cost: 25,  available: true, description: 'Chilled blended coffee' },
  { id: uuidv4(), name: 'Fresh Lime Soda',     category: 'Beverages', price: 60,  cost: 15,  available: true, description: 'Sweet or salted' },
  { id: uuidv4(), name: 'Chocolate Lava Cake', category: 'Desserts',  price: 120, cost: 38,  available: true, description: 'Warm with vanilla ice cream' },
  { id: uuidv4(), name: 'Garlic Bread',        category: 'Starters',  price: 90,  cost: 25,  available: true, description: 'Toasted with herb butter' },
];

const DEFAULT_TABLES = Array.from({ length: 12 }, (_, i) => ({
  id: `T${i + 1}`, number: i + 1,
  capacity: i < 4 ? 2 : i < 8 ? 4 : 6,
  status: 'available', currentOrder: null,
  section: i < 4 ? 'Indoor' : i < 8 ? 'Outdoor' : 'Private',
}));

const DEFAULT_STAFF = [
  { id: uuidv4(), name: 'Rahul Sharma', email: 'manager@restaurant.com', password: 'manager123', role: 'manager', phone: '9999000002', active: true, joinDate: new Date().toISOString(), authType: 'password' },
  { id: uuidv4(), name: 'Priya Singh',  email: 'waiter@restaurant.com',  password: 'waiter123',  role: 'waiter',  phone: '9999000003', active: true, joinDate: new Date().toISOString(), authType: 'password' },
  { id: uuidv4(), name: 'Amit Kumar',   email: 'kitchen@restaurant.com', password: 'kitchen123', role: 'kitchen', phone: '9999000004', active: true, joinDate: new Date().toISOString(), authType: 'password' },
];

const DEFAULT_SETTINGS = {
  restaurantName: 'RestaurantOS',
  address: '123 Food Street, Pune, Maharashtra 411001',
  phone: '+91 98765 43210',
  email: 'jay2k5r@gmail.com',
  gstNumber: '27AABCU9603R1ZX',
  currency: '₹',
  taxRate: 5,
  serviceCharge: 10,
  tableCount: 12,
  openingTime: '10:00',
  closingTime: '23:00',
};

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.error(e); }
}
function mergeWithSuperAdmin(list) {
  return [SUPER_ADMIN, ...list.filter(s => s.id !== SUPER_ADMIN.id)];
}

// Shared helper — resolves a Firebase user object into an app user record
function resolveFirebaseUser(firebaseUser, currentStaffRaw, setStaffRaw) {
  const isSuperAdmin = firebaseUser.email?.toLowerCase() === SUPER_ADMIN.email.toLowerCase();
  if (isSuperAdmin) {
    return { resolved: { ...SUPER_ADMIN, photoURL: firebaseUser.photoURL }, isNew: false };
  }

  const existing = currentStaffRaw.find(
    s => s.googleUid === firebaseUser.uid || s.email === firebaseUser.email
  );

  if (existing) {
    if (!existing.active) return { resolved: null, isNew: false, deactivated: true };
    const updated = { ...existing, googleUid: firebaseUser.uid, photoURL: firebaseUser.photoURL };
    setStaffRaw(s => s.map(m => m.id === updated.id ? updated : m));
    return { resolved: updated, isNew: false };
  }

  // Brand new Google user
  const newMember = {
    id:        uuidv4(),
    name:      firebaseUser.displayName || 'New Staff',
    email:     firebaseUser.email,
    googleUid: firebaseUser.uid,
    photoURL:  firebaseUser.photoURL || '',
    role:      'waiter',
    phone:     '',
    active:    true,
    joinDate:  new Date().toISOString(),
    authType:  'google',
    password:  '',
  };
  setStaffRaw(s => {
    const updated = [...s.filter(m => m.googleUid !== firebaseUser.uid), newMember];
    save('rms_staff', updated);
    return updated;
  });
  return { resolved: newMember, isNew: true };
}

export function AppProvider({ children }) {
  const [user,          setUser]          = useState(null);
  const [authLoading,   setAuthLoading]   = useState(true);
  const [staffRaw,      setStaffRaw]      = useState(() => load('rms_staff', DEFAULT_STAFF));
  const [menu,          setMenu]          = useState(() => load('rms_menu', DEFAULT_MENU));
  const [tables,        setTables]        = useState(() => load('rms_tables', DEFAULT_TABLES));
  const [orders,        setOrders]        = useState(() => load('rms_orders', []));
  const [inventory,     setInventory]     = useState(() => load('rms_inventory', []));
  const [expenses,      setExpenses]      = useState(() => load('rms_expenses', []));
  const [reservations,  setReservations]  = useState(() => load('rms_reservations', []));
  const [settings,      setSettings]      = useState(() => load('rms_settings', DEFAULT_SETTINGS));
  const [notifications, setNotifications] = useState([]);

  const staff = mergeWithSuperAdmin(staffRaw);

  useEffect(() => { save('rms_staff',        staffRaw);     }, [staffRaw]);
  useEffect(() => { save('rms_menu',         menu);         }, [menu]);
  useEffect(() => { save('rms_tables',       tables);       }, [tables]);
  useEffect(() => { save('rms_orders',       orders);       }, [orders]);
  useEffect(() => { save('rms_inventory',    inventory);    }, [inventory]);
  useEffect(() => { save('rms_expenses',     expenses);     }, [expenses]);
  useEffect(() => { save('rms_reservations', reservations); }, [reservations]);
  useEffect(() => { save('rms_settings',     settings);     }, [settings]);

  useEffect(() => {
    if (user && user.authType !== 'google') save('rms_user', user);
    else if (!user) localStorage.removeItem('rms_user');
  }, [user]);

  // ── On mount: check for Google redirect result FIRST, then auth state ──────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Step 1: Did we just come back from a Google redirect?
      const redirectRes = await checkRedirectResult();
      if (cancelled) return;

      if (redirectRes.ok && redirectRes.user) {
        // User just finished Google sign-in redirect
        const latestStaff = load('rms_staff', DEFAULT_STAFF);
        const { resolved, deactivated } = resolveFirebaseUser(redirectRes.user, latestStaff, setStaffRaw);
        if (deactivated) {
          await firebaseSignOut();
          setUser(null);
        } else if (resolved) {
          setUser(resolved);
        }
        setAuthLoading(false);
        return;
      }

      // Step 2: No redirect result — listen for existing Firebase session
      const unsub = onAuthStateChanged(auth, (firebaseUser) => {
        if (cancelled) return;

        if (firebaseUser) {
          const latestStaff = load('rms_staff', DEFAULT_STAFF);
          const { resolved, deactivated } = resolveFirebaseUser(firebaseUser, latestStaff, setStaffRaw);
          if (deactivated) {
            firebaseSignOut();
            setUser(null);
          } else if (resolved) {
            setUser(resolved);
          }
        } else {
          // No Firebase session — restore password session if any
          const saved = load('rms_user', null);
          if (saved && saved.authType !== 'google') {
            setUser(saved);
          } else {
            setUser(null);
          }
        }
        setAuthLoading(false);
        unsub(); // only need first emission
      });
    }

    init();
    return () => { cancelled = true; };
  }, []); // runs once on mount

  // ── Notifications ─────────────────────────────────────────────────────────
  const addNotification = useCallback((msg, type = 'info') => {
    const id = uuidv4();
    setNotifications(n => [...n, { id, msg, type }]);
    setTimeout(() => setNotifications(n => n.filter(x => x.id !== id)), 3500);
  }, []);

  // ── Password login ────────────────────────────────────────────────────────
  const login = (email, password) => {
    if (
      email.trim().toLowerCase() === SUPER_ADMIN.email.toLowerCase() &&
      password === SUPER_ADMIN.password
    ) {
      setUser(SUPER_ADMIN);
      return { ok: true };
    }
    const found = staffRaw.find(
      s => s.email?.trim().toLowerCase() === email.trim().toLowerCase() &&
           s.password === password && s.active
    );
    if (found) { setUser(found); return { ok: true }; }
    return { ok: false, error: 'Invalid email or password' };
  };

  // ── loginWithGoogle: called from AuthPage after redirect completes ─────────
  // (In redirect flow this is called by AppContext itself via checkRedirectResult,
  //  but we keep it for manual calling if needed)
  const loginWithGoogle = (firebaseUser) => {
    const latestStaff = load('rms_staff', DEFAULT_STAFF);
    const { resolved, deactivated, isNew } = resolveFirebaseUser(firebaseUser, latestStaff, setStaffRaw);
    if (deactivated) return { ok: false, error: 'Your account is deactivated. Contact admin.' };
    if (!resolved)   return { ok: false, error: 'Could not resolve user.' };
    setUser(resolved);
    if (isNew) addNotification(`Welcome ${resolved.name}! Waiter access granted.`, 'success');
    return { ok: true };
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await firebaseSignOut();
    localStorage.removeItem('rms_user');
    setUser(null);
  };

  // ── Staff ─────────────────────────────────────────────────────────────────
  const addStaff = (member) => {
    const safeRole = member.role === 'admin' && user?.id !== SUPER_ADMIN.id ? 'manager' : member.role;
    setStaffRaw(s => [...s, { ...member, role: safeRole, id: uuidv4(), joinDate: new Date().toISOString(), authType: member.authType || 'password' }]);
    addNotification(`Staff account created for ${member.name}`, 'success');
  };
  const updateStaff = (id, data) => {
    if (id === SUPER_ADMIN.id) return;
    setStaffRaw(s => s.map(m => m.id === id ? { ...m, ...data } : m));
    if (user?.id === id) setUser(u => ({ ...u, ...data }));
  };
  const deleteStaff = (id) => { if (id !== SUPER_ADMIN.id) setStaffRaw(s => s.filter(m => m.id !== id)); };

  // ── Orders ────────────────────────────────────────────────────────────────
  const createOrder = (tableId, items, type = 'dine-in', customerName = '') => {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = Math.round(subtotal * settings.taxRate / 100);
    const sc  = type === 'dine-in' ? Math.round(subtotal * settings.serviceCharge / 100) : 0;
    const order = {
      id: uuidv4(),
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      tableId, items, type, customerName,
      subtotal, tax, serviceCharge: sc, total: subtotal + tax + sc,
      status: 'pending', paymentStatus: 'unpaid', paymentMethod: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      createdBy: user?.id, createdByName: user?.name, notes: '',
    };
    setOrders(o => [order, ...o]);
    if (tableId) setTables(t => t.map(tb => tb.id === tableId ? { ...tb, status: 'occupied', currentOrder: order.id } : tb));
    addNotification(`Order ${order.orderNumber} created`, 'success');
    return order;
  };

  const updateOrderStatus = (orderId, status) =>
    setOrders(o => o.map(ord => ord.id === orderId ? { ...ord, status, updatedAt: new Date().toISOString() } : ord));

  const processPayment = (orderId, method) => {
    setOrders(o => o.map(ord => ord.id === orderId
      ? { ...ord, paymentStatus: 'paid', paymentMethod: method, status: 'completed', paidAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      : ord));
    const order = orders.find(o => o.id === orderId);
    if (order?.tableId) setTables(t => t.map(tb => tb.id === order.tableId ? { ...tb, status: 'available', currentOrder: null } : tb));
    addNotification('Payment processed successfully', 'success');
  };

  const cancelOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    setOrders(o => o.map(ord => ord.id === orderId ? { ...ord, status: 'cancelled', updatedAt: new Date().toISOString() } : ord));
    if (order?.tableId) setTables(t => t.map(tb => tb.id === order.tableId ? { ...tb, status: 'available', currentOrder: null } : tb));
  };

  const addItemToOrder = (orderId, item) => {
    setOrders(o => o.map(ord => {
      if (ord.id !== orderId) return ord;
      const exists = ord.items.find(i => i.id === item.id);
      const items  = exists
        ? ord.items.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...ord.items, { ...item, qty: 1 }];
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const tax = Math.round(subtotal * settings.taxRate / 100);
      const sc  = ord.type === 'dine-in' ? Math.round(subtotal * settings.serviceCharge / 100) : 0;
      return { ...ord, items, subtotal, tax, serviceCharge: sc, total: subtotal + tax + sc, updatedAt: new Date().toISOString() };
    }));
  };

  const addMenuItem    = (item)     => { setMenu(m => [...m, { ...item, id: uuidv4() }]); addNotification(`"${item.name}" added`, 'success'); };
  const updateMenuItem = (id, data) => setMenu(m => m.map(i => i.id === id ? { ...i, ...data } : i));
  const deleteMenuItem = (id)       => setMenu(m => m.filter(i => i.id !== id));

  const addExpense = (expense) => {
    setExpenses(e => [...e, { ...expense, id: uuidv4(), createdAt: new Date().toISOString() }]);
    addNotification('Expense recorded', 'success');
  };

  const addReservation    = (r)        => setReservations(rs => [...rs, { ...r, id: uuidv4(), createdAt: new Date().toISOString(), status: 'confirmed' }]);
  const updateReservation = (id, data) => setReservations(rs => rs.map(r => r.id === id ? { ...r, ...data } : r));

  return (
    <AppContext.Provider value={{
      user, authLoading, login, loginWithGoogle, logout,
      staff, addStaff, updateStaff, deleteStaff,
      menu, addMenuItem, updateMenuItem, deleteMenuItem,
      tables, setTables,
      orders, createOrder, updateOrderStatus, processPayment, cancelOrder, addItemToOrder,
      inventory, setInventory,
      expenses, addExpense,
      reservations, addReservation, updateReservation,
      settings, setSettings,
      notifications, addNotification,
      SUPER_ADMIN_ID: SUPER_ADMIN.id,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
