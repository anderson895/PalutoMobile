# 🍳 Paluto Mobile — Customer App

React Native / Expo mobile client for the Paluto Filipino Food Ordering System.
Connects to the **same Firebase project** as the Paluto web app.

## Tech Stack
- **Framework**: React Native + Expo (SDK 54) + Expo Router v6
- **Language**: TypeScript
- **Backend**: Firebase (Firestore + Auth) — shared with web
- **State**: React Context (auth + cart)
- **Navigation**: Expo Router (file-based)

## Screens

### Tabs
| Tab | Screen | Description |
|-----|--------|-------------|
| 🏠 | Home | Hero banner, categories, best sellers, features |
| 🍽️ | Menu | Full menu, search, category filter, sort |
| 🛒 | Cart | Cart items, qty controls, order summary |
| 👤 | Account | Profile, login/logout, nav links |

### Stack Screens
| Screen | Path | Description |
|--------|------|-------------|
| Product Detail | `/product/[id]` | Full product info, qty picker, add to cart |
| Checkout | `/checkout` | Delivery form, payment method, place order |
| My Orders | `/orders` | Order history with status badges |
| Edit Profile | `/profile` | Update name & phone |
| Login | `/auth/login` | Firebase email/password login |
| Register | `/auth/register` | Create new customer account |

## Project Structure
```
PalutoMobile/
├── app/
│   ├── _layout.tsx          # Root layout with providers
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab bar config with cart badge
│   │   ├── index.tsx        # Home screen
│   │   ├── menu.tsx         # Menu screen
│   │   ├── cart.tsx         # Cart screen
│   │   └── account.tsx      # Account screen
│   ├── product/[id].tsx     # Product detail
│   ├── checkout/index.tsx   # Checkout
│   ├── orders/index.tsx     # Order history
│   ├── profile/index.tsx    # Edit profile
│   └── auth/
│       ├── login.tsx        # Login
│       └── register.tsx     # Register
├── store/
│   ├── auth.tsx             # Auth context (Firebase Auth)
│   └── cart.tsx             # Cart context (in-memory)
├── lib/
│   └── firebase.ts          # Firebase config (paluto-app project)
└── constants/
    └── theme.ts             # Brand colors & status maps
```

## Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Start dev server
```bash
npx expo start
```

Then scan the QR code with **Expo Go** on your phone, or press:
- `a` for Android emulator
- `i` for iOS simulator
- `w` for web browser

## Firebase Notes
- Uses the same `paluto-app` Firebase project as the web app
- Firebase config is already embedded in `lib/firebase.ts`
- Firestore rules must allow customer reads/writes (see web app README)
- Users created in the mobile app appear in the web admin panel

## Features
- ✅ Browse menu with search, category filter, sort
- ✅ Product detail with quantity picker
- ✅ Cart with free delivery threshold (₱500)
- ✅ Firebase Auth (register / login / logout)
- ✅ Checkout with COD / GCash / Bank Transfer options
- ✅ Order history with real-time status badges
- ✅ Profile editing (name & phone)
- ✅ Dark theme matching Paluto brand (red #E8462A + dark bg)
- ✅ Pull-to-refresh on home & orders
- ✅ Cart badge on tab bar
