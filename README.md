# 🍽️ RestaurantOS — Open Source Restaurant Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-orange.svg)](https://firebase.google.com/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jayesh-koli/restaurant-ms)

A **free, open source, full-featured Restaurant Management System** built with React.  
Deploy it on your own domain in minutes. No subscription fees. No vendor lock-in.

> **Built by [Jayesh Shashikant Koli](https://github.com/jayesh-koli)**  
> Feel free to use, modify, and contribute!

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🧾 **Point of Sale** | Fast order entry, cart, table selection, billing |
| 🪑 **Table Management** | Live table map — available, occupied, reserved, cleaning |
| 🍳 **Kitchen Display** | Real-time order queue with urgency timer (KDS) |
| 🍽️ **Menu Management** | Full CRUD, categories, pricing, margin calculator |
| 📊 **Reports** | Daily, monthly, yearly sales — printable PDF-ready |
| 👥 **Staff Management** | Role-based access — Admin, Manager, Waiter, Kitchen |
| 📦 **Inventory** | Stock tracking with low-stock alerts |
| 💸 **Expenses** | Record and categorize business expenses |
| 📅 **Reservations** | Table booking and guest management |
| ⚙️ **Settings** | Restaurant info, GST, service charge, hours |
| 🔐 **Auth** | Google Sign-In (redirect, no popup) + email/password |
| 🖨️ **Print Receipts** | Silent iframe print — works on all browsers |

---

## 🚀 Quick Start

### Option 1 — Deploy to Vercel (Fastest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jayesh-koli/restaurant-ms)

Click the button, connect your GitHub, add Firebase env vars, done.

### Option 2 — Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/jayesh-koli/restaurant-ms.git
cd restaurant-ms

# 2. Install dependencies
npm install

# 3. Set up Firebase (see Firebase Setup below)
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# 4. Start the dev server
npm start
# Opens at http://localhost:3000
```

---

## 🔥 Firebase Setup (for Google Sign-In)

Google Sign-In requires a free Firebase project. Takes ~5 minutes.

### Step 1 — Create Firebase Project
1. Go to **https://console.firebase.google.com**
2. Click **Add project** → name it → Create
3. Click **</>** (Web icon) → Register app → **Copy the config**

### Step 2 — Enable Google Auth
1. Firebase Console → **Authentication** → **Get Started**
2. **Sign-in method** → **Google** → Toggle **Enable** → Save

### Step 3 — Add Your Domain
1. Authentication → **Settings** → **Authorized domains**
2. Add your domain (e.g. `your-app.vercel.app`)
3. `localhost` is pre-added for local dev

### Step 4 — Add Config
```bash
cp .env.example .env.local
```
Edit `.env.local`:
```env
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 5 — For Vercel
Vercel Dashboard → Your Project → **Settings** → **Environment Variables**  
Add all 6 `REACT_APP_FIREBASE_*` keys → Redeploy.

> **Note:** If you don't set up Firebase, Google Sign-In won't work,  
> but email/password login still works fine with the demo credentials.

---

## 🎭 Role-Based Access

| Role | Access |
|------|--------|
| **Admin** | Everything — all pages, reports, settings, staff management |
| **Manager** | POS, kitchen, menu, inventory, reports, staff |
| **Waiter** | POS, live orders, tables, reservations |
| **Kitchen** | Kitchen display system only |

### How users get roles:
- **Google Sign-In** → new users get **Waiter** role by default
- Admin can upgrade any user's role from the **Staff** page
- Email/password staff get the role assigned at account creation

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Manager | manager@restaurant.com | manager123 |
| Waiter | waiter@restaurant.com | waiter123 |
| Kitchen | kitchen@restaurant.com | kitchen123 |

> Admin credentials are set by the repo owner. Fork the repo and set your own in `AppContext.jsx`.

---

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Firebase Auth** | Google Sign-In (redirect flow) |
| **Recharts** | Charts & analytics |
| **date-fns** | Date formatting |
| **uuid** | Unique IDs |
| **localStorage** | Data persistence |
| **CSS Variables** | Dark theme design system |

---

## 📁 Project Structure

```
restaurant-ms/
├── public/
│   └── index.html
├── src/
│   ├── firebase.js              # Firebase config & Google auth
│   ├── App.jsx                  # Root component & routing
│   ├── index.js                 # Entry point
│   ├── context/
│   │   └── AppContext.jsx       # Global state + localStorage + auth
│   ├── pages/
│   │   ├── AuthPage.jsx         # Login (Google redirect + email/password)
│   │   ├── Dashboard.jsx        # Overview with live stats & charts
│   │   ├── POS.jsx              # Point of Sale + silent iframe print
│   │   ├── Tables.jsx           # Table layout & status management
│   │   ├── Kitchen.jsx          # Kitchen Display System (KDS)
│   │   ├── Menu.jsx             # Menu CRUD with margin calculator
│   │   ├── Reports.jsx          # Sales reports with print support
│   │   ├── Staff.jsx            # Staff accounts & role management
│   │   └── Misc.jsx             # Inventory, Expenses, Reservations, Settings
│   ├── components/
│   │   ├── Sidebar.jsx          # Collapsible navigation sidebar
│   │   └── Notifications.jsx    # Toast notification system
│   └── styles/
│       └── global.css           # Design tokens & global styles
├── .env.example                 # Firebase config template
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE                      # MIT
└── package.json
```

---

## 🌐 Deployment

### Vercel (Recommended — Free)
```bash
npm run build
npx vercel --prod
```

### Netlify
```bash
npm run build
# Drag the build/ folder to netlify.com/drop
```

### GitHub Pages
```bash
npm install -g gh-pages
# Add to package.json: "homepage": "https://username.github.io/restaurant-ms"
npm run deploy
```

---

## 💾 Data Storage

All data is saved in **browser localStorage**:

| Key | Data |
|-----|------|
| `rms_orders` | All orders & history |
| `rms_menu` | Menu items |
| `rms_staff` | Staff accounts |
| `rms_tables` | Table layout |
| `rms_inventory` | Inventory items |
| `rms_expenses` | Expenses |
| `rms_reservations` | Reservations |
| `rms_settings` | Restaurant settings |

> Data is device-specific. For multi-device sync, upgrade to **Firebase Firestore** — see [CONTRIBUTING.md](CONTRIBUTING.md) for ideas.

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!  
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Fork → Clone → Branch → Code → PR
git checkout -b feature/your-feature
```

### Ideas welcome:
- Multi-language support
- Firebase Firestore sync
- QR code customer menu
- WhatsApp order notifications
- Mobile app (React Native)
- Export to Excel/PDF

---

## 📸 Screenshots

> Add screenshots of your deployment here after forking!
> Replace this section with actual images using:
> `![Dashboard](screenshots/dashboard.png)`

---

## ⭐ Support

If this project helped you, please **star the repo** on GitHub!  
It helps others find it and motivates continued development.

[![GitHub stars](https://img.shields.io/github/stars/jayesh-koli/restaurant-ms?style=social)](https://github.com/jayesh-koli/restaurant-ms)

---

## 📄 License

MIT © [Jayesh Shashikant Koli](https://github.com/jayesh-koli)

Free to use for personal and commercial projects.  
Attribution appreciated but not required.
