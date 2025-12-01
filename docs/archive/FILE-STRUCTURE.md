# 📂 Pizza POS - Complete File Structure

## Project Files (41 files created)

```
pizza-pos/
│
├── 📄 package.json                          # Root package with workspace config
├── 📄 electron-builder.json                 # Electron packaging configuration
├── 📄 .gitignore                            # Git ignore patterns
│
├── 📚 Documentation (7 files)
│   ├── 📄 README.md                         # Main documentation & setup guide
│   ├── 📄 QUICKSTART.md                     # Quick reference commands
│   ├── 📄 INSTALLATION.md                   # Installation & testing guide
│   ├── 📄 PROJECT-SUMMARY.md                # Complete project overview
│   ├── 📄 WORKFLOW-GUIDE.md                 # Visual workflow & UI guide
│   ├── docs/
│   │   ├── 📄 AUTO-START.md                 # Windows auto-start configuration
│   │   └── 📄 KIOSK-SETUP.md                # Full kiosk mode setup guide
│
├── 🖥️ Client Application (24 files)
│   ├── client/
│   │   ├── 📄 package.json                  # Client dependencies
│   │   ├── 📄 tsconfig.json                 # TypeScript configuration
│   │   ├── 📄 tsconfig.node.json            # TypeScript node config
│   │   ├── 📄 vite.config.ts                # Vite build configuration
│   │   ├── 📄 tailwind.config.js            # Tailwind CSS customization
│   │   ├── 📄 postcss.config.js             # PostCSS configuration
│   │   ├── 📄 index.html                    # HTML entry point
│   │   │
│   │   ├── public/
│   │   │   └── 🎨 pizza-icon.svg            # Application icon
│   │   │
│   │   └── src/
│   │       ├── 📄 main.tsx                  # React entry point
│   │       ├── 📄 App.tsx                   # Main app component with routing
│   │       ├── 📄 index.css                 # Global styles & Tailwind
│   │       ├── 📄 vite-env.d.ts             # Vite type declarations
│   │       │
│   │       ├── components/                  # Reusable UI Components
│   │       │   ├── 📄 TouchButton.tsx       # 60-80px touch-optimized button
│   │       │   ├── 📄 PizzaPreview.tsx      # Visual pizza with topping preview
│   │       │   ├── 📄 OrderItemCard.tsx     # Cart item with quantity controls
│   │       │   └── 📄 KitchenOrderCard.tsx  # Kitchen display order card
│   │       │
│   │       ├── pages/                       # Main Application Screens
│   │       │   ├── 📄 HomePage.tsx          # Home screen (3 main buttons)
│   │       │   ├── 📄 NewOrderPage.tsx      # Pizza or Sides/Drinks choice
│   │       │   ├── 📄 PizzaBuilderPage.tsx  # 3-step pizza builder
│   │       │   ├── 📄 SidesAndDrinksPage.tsx# Quick-select grid
│   │       │   ├── 📄 CheckoutPage.tsx      # Order summary & payment
│   │       │   └── 📄 KitchenViewPage.tsx   # Real-time kitchen display
│   │       │
│   │       ├── stores/                      # Zustand State Management
│   │       │   ├── 📄 cartStore.ts          # Shopping cart state & logic
│   │       │   └── 📄 pizzaBuilderStore.ts  # Pizza customization state
│   │       │
│   │       ├── contexts/                    # React Context Providers
│   │       │   └── 📄 MenuContext.tsx       # Menu data provider & API
│   │       │
│   │       └── hooks/                       # Custom React Hooks
│   │           └── 📄 useSocket.ts          # WebSocket connection hook
│
├── 🔧 Server Application (8 files)
│   ├── server/
│   │   ├── 📄 package.json                  # Server dependencies
│   │   ├── 📄 tsconfig.json                 # TypeScript configuration
│   │   │
│   │   ├── data/                            # Database Storage
│   │   │   └── 💾 pos.db                    # SQLite database (auto-created)
│   │   │
│   │   └── src/
│   │       ├── 📄 index.ts                  # Express server + Socket.io
│   │       │
│   │       ├── db/
│   │       │   └── 📄 database.ts           # SQLite setup & seed data
│   │       │
│   │       ├── routes/                      # API Endpoints
│   │       │   ├── 📄 menu.ts               # GET /api/menu
│   │       │   └── 📄 orders.ts             # Order CRUD endpoints
│   │       │
│   │       └── services/                    # Business Logic
│   │           ├── 📄 MenuService.ts        # Menu data operations
│   │           └── 📄 OrderService.ts       # Order management logic
│
├── 🔗 Shared Types (1 file)
│   └── shared/
│       └── types/
│           └── 📄 index.ts                  # TypeScript type definitions
│
├── 💻 Electron Wrapper (2 files)
│   └── electron/
│       ├── 📄 main.js                       # Electron main process
│       └── 📄 preload.js                    # Preload script for security
│
└── 🚀 Deployment Scripts (2 files)
    └── scripts/
        ├── 📄 start-kiosk.ps1               # Chrome kiosk mode (PowerShell)
        └── 📄 start-dev.ps1                 # Development startup script

```

---

## File Categories & Purposes

### 📚 Documentation (7 files)
Essential guides for installation, deployment, and usage.

| File | Purpose | Audience |
|------|---------|----------|
| README.md | Complete setup & deployment guide | All users |
| QUICKSTART.md | Quick command reference | Developers |
| INSTALLATION.md | Step-by-step installation | New users |
| PROJECT-SUMMARY.md | Project overview & specs | Stakeholders |
| WORKFLOW-GUIDE.md | Visual workflow & UI patterns | Designers/Devs |
| AUTO-START.md | Windows auto-start config | Deployers |
| KIOSK-SETUP.md | Full kiosk mode setup | IT/Admins |

### 🖥️ Frontend Files (24 files)
React application with TypeScript, Tailwind CSS, and Zustand.

**Configuration Files (7):**
- `package.json` - Dependencies (React, Vite, Tailwind, etc.)
- `tsconfig.json` - TypeScript compiler settings
- `vite.config.ts` - Vite build & dev server config
- `tailwind.config.js` - Custom colors & spacing
- `postcss.config.js` - CSS processing
- `index.html` - HTML entry point
- `vite-env.d.ts` - Environment type definitions

**Core Application (3):**
- `main.tsx` - React initialization
- `App.tsx` - Routing & layout
- `index.css` - Global styles & Tailwind

**Components (4):**
- `TouchButton.tsx` - 60-80px buttons with feedback
- `PizzaPreview.tsx` - Visual pizza builder preview
- `OrderItemCard.tsx` - Cart items with controls
- `KitchenOrderCard.tsx` - Kitchen order display

**Pages (6):**
- `HomePage.tsx` - Main menu with 3 buttons
- `NewOrderPage.tsx` - Choose pizza or sides
- `PizzaBuilderPage.tsx` - 3-step builder (size/crust/toppings)
- `SidesAndDrinksPage.tsx` - Quick-select grid
- `CheckoutPage.tsx` - Review & payment
- `KitchenViewPage.tsx` - Real-time order display

**State Management (2):**
- `cartStore.ts` - Shopping cart with Zustand
- `pizzaBuilderStore.ts` - Pizza customization state

**Context & Hooks (2):**
- `MenuContext.tsx` - Menu data provider
- `useSocket.ts` - WebSocket connection

### 🔧 Backend Files (8 files)
Express API with Socket.io and SQLite.

**Configuration (2):**
- `package.json` - Server dependencies
- `tsconfig.json` - TypeScript config

**Core Server (1):**
- `index.ts` - Express app + Socket.io server

**Database (1):**
- `database.ts` - Schema, seed data, initialization

**API Routes (2):**
- `menu.ts` - Menu endpoints
- `orders.ts` - Order CRUD operations

**Services (2):**
- `MenuService.ts` - Menu business logic
- `OrderService.ts` - Order management

### 🔗 Shared Types (1 file)
TypeScript interfaces shared between client and server.

- `index.ts` - Order, Pizza, Menu, Payment types

### 💻 Electron (2 files)
Desktop wrapper for kiosk deployment.

- `main.js` - Main process (window management)
- `preload.js` - Security context bridge

### 🚀 Scripts (2 files)
PowerShell scripts for Windows deployment.

- `start-kiosk.ps1` - Chrome kiosk mode launcher
- `start-dev.ps1` - Development environment starter

---

## Key File Details

### Most Important Files

1. **client/src/App.tsx** - Main routing logic
2. **client/src/pages/PizzaBuilderPage.tsx** - Core pizza building flow
3. **server/src/index.ts** - Backend server & WebSocket
4. **server/src/db/database.ts** - Database schema & seed data
5. **shared/types/index.ts** - Type definitions
6. **README.md** - Complete documentation

### Configuration Files

| File | Configures |
|------|------------|
| `package.json` (root) | Workspaces, scripts, Electron |
| `client/package.json` | React, Vite, Tailwind dependencies |
| `server/package.json` | Express, Socket.io, SQLite |
| `tsconfig.json` (both) | TypeScript compiler options |
| `vite.config.ts` | Vite dev server & build |
| `tailwind.config.js` | Custom colors & utilities |
| `electron-builder.json` | Electron packaging |

### Lines of Code by Category

| Category | Files | Approx. Lines |
|----------|-------|---------------|
| Frontend Components | 10 | ~1,200 |
| Backend API | 6 | ~800 |
| Types & Configs | 8 | ~400 |
| Documentation | 7 | ~1,500 |
| Scripts | 2 | ~100 |
| **Total** | **33** | **~4,000** |

---

## Database Files

### SQLite Database (auto-created)
- **Location**: `server/data/pos.db`
- **Tables**: 6 (sizes, crusts, toppings, menu_items, orders, order_items)
- **Seed Data**: 30+ menu items
- **Size**: ~50KB (initial)

---

## Generated/Auto-Created Files

These files are created automatically during build/runtime:

```
client/dist/              # Built frontend (npm run build)
server/dist/              # Compiled TypeScript (npm run build)
server/data/pos.db        # SQLite database (first run)
node_modules/             # Dependencies (npm install)
*.log                     # Runtime logs
```

---

## File Size Estimates

| Category | Size |
|----------|------|
| Source Code | ~150 KB |
| Documentation | ~100 KB |
| Configuration | ~20 KB |
| Icons/Images | ~5 KB |
| Built Client | ~500 KB |
| Built Server | ~50 KB |
| Database (empty) | ~50 KB |
| Node Modules | ~300 MB |

---

## File Relationships

### Frontend Dependencies
```
main.tsx
  └── App.tsx
       ├── MenuContext.tsx
       └── Routes
            ├── HomePage.tsx
            ├── NewOrderPage.tsx
            │    └── TouchButton.tsx
            ├── PizzaBuilderPage.tsx
            │    ├── TouchButton.tsx
            │    ├── PizzaPreview.tsx
            │    ├── pizzaBuilderStore.ts
            │    └── MenuContext.tsx
            ├── SidesAndDrinksPage.tsx
            │    ├── TouchButton.tsx
            │    ├── cartStore.ts
            │    └── MenuContext.tsx
            ├── CheckoutPage.tsx
            │    ├── TouchButton.tsx
            │    ├── OrderItemCard.tsx
            │    └── cartStore.ts
            └── KitchenViewPage.tsx
                 ├── TouchButton.tsx
                 ├── KitchenOrderCard.tsx
                 └── useSocket.ts
```

### Backend Dependencies
```
index.ts
  ├── database.ts
  ├── routes/
  │    ├── menu.ts → MenuService.ts
  │    └── orders.ts → OrderService.ts
  └── Socket.io events
```

---

## Critical Path Files

For the system to run, these files are essential:

### Minimum Client Files (15):
1. package.json
2. vite.config.ts
3. tsconfig.json
4. index.html
5. main.tsx
6. App.tsx
7. HomePage.tsx
8. CheckoutPage.tsx
9. TouchButton.tsx
10. MenuContext.tsx
11. cartStore.ts
12. index.css
13. tailwind.config.js
14. postcss.config.js
15. shared/types/index.ts

### Minimum Server Files (7):
1. package.json
2. tsconfig.json
3. index.ts
4. database.ts
5. menu.ts
6. orders.ts
7. shared/types/index.ts

---

## File Modification Frequency

### Frequently Modified:
- `database.ts` - Updating menu items & prices
- `tailwind.config.js` - Customizing colors
- Page components - Adding features

### Rarely Modified:
- Configuration files
- Core components (TouchButton, etc.)
- Type definitions
- Documentation

### Never Modified (after initial setup):
- `package.json` dependencies (unless updating)
- TypeScript configs
- Build configs

---

*Complete file structure for Pizza Shop POS System - 41 files total*
