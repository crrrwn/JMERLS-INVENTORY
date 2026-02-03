# JMERLS Inventory Management System

Full-stack inventory system with **React**, **Tailwind CSS**, and **Firebase** (Auth + Firestore).

## Features

- **Product Management** – SKU, name, category, size, color, cost/selling price, quantity
- **Live Stock** – Stock in/out logs, record sales, auto-deduct quantity
- **Smart status** – In Stock / Low Stock (≤5) / Out of Stock
- **Search & Filter** – By category, size, color, availability
- **Sales & Analytics** – Revenue, profit, best seller, history
- **System Logs** – Audit trail of actions
- **User roles** – Admin (full access), User
- **Auth** – Login, Register, Forgot password (Firebase Auth)
- **Responsive** – Works on desktop, tablet, and iOS/mobile

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Firebase

- Your Firebase config is in `src/lib/firebase.js`.
- Deploy Firestore rules: Firebase Console → your project → Firestore → Rules → paste contents of `firestore.rules` → Publish.
- **First admin:** After registering, in Firestore → `users` → your user document → set field `role` = `admin`.

### 3. Run the app

```bash
npm run dev
```

Open http://localhost:3000

## Build for production

```bash
npm run build
```

Serve the `dist` folder with any static host.

## Icons

Icons from [Iconify](https://icon-sets.iconify.design/) via `@iconify/react`.

## Logo

`public/JMERLSLOGO.png`
