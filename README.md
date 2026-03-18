# PalutoMobile

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

| Tab     | Screen  | Description                                     |
| ------- | ------- | ----------------------------------------------- |
| Home    | Home    | Hero banner, categories, best sellers, features |
| Menu    | Menu    | Full menu, search, category filter, sort        |
| Cart    | Cart    | Cart items, qty controls, order summary         |
| Account | Account | Profile, login/logout, nav links                |

### Stack Screens

| Screen         | Path             | Description                                |
| -------------- | ---------------- | ------------------------------------------ |
| Product Detail | `/product/[id]`  | Full product info, qty picker, add to cart |
| Checkout       | `/checkout`      | Delivery form, payment method, place order |
| My Orders      | `/orders`        | Order history with status badges           |
| Edit Profile   | `/profile`       | Update name & phone                        |
| Login          | `/auth/login`    | Firebase email/password login              |
| Register       | `/auth/register` | Create new customer account                |

## Project Structure

```
PalutoMobile/
├── app/
│   ├── _layout.tsx           # Root layout with providers
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab bar config with cart badge
│   │   ├── index.tsx         # Home screen
│   │   ├── menu.tsx          # Menu screen
│   │   ├── cart.tsx          # Cart screen
│   │   └── account.tsx       # Account screen
│   ├── product/[id].tsx      # Product detail
│   ├── checkout/index.tsx    # Checkout
│   ├── orders/index.tsx      # Order history
│   ├── profile/index.tsx     # Edit profile
│   └── auth/
│       ├── login.tsx         # Login
│       └── register.tsx      # Register
├── store/
│   ├── auth.tsx              # Auth context (Firebase Auth)
│   └── cart.tsx              # Cart context (in-memory)
├── lib/
│   └── firebase.ts           # Firebase config (paluto-app project)
└── constants/
    └── theme.ts              # Brand colors & status maps
```

## Setup & Run

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your Firebase values:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Then open `.env` and replace the placeholders with your actual Firebase config values.
You can find these in the Firebase Console under **Project Settings > Your apps**.

### 3. Start dev server

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press:

- `a` — Android emulator
- `i` — iOS simulator
- `w` — Web browser

## Environment Variables

This project uses a `.env` file for Firebase configuration. See `.env.example` for the required variables.

| Variable                                   | Description             |
| ------------------------------------------ | ----------------------- |
| `EXPO_PUBLIC_FIREBASE_API_KEY`             | Firebase API key        |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain    |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase project ID     |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID      |
| `EXPO_PUBLIC_FIREBASE_APP_ID`              | Firebase app ID         |

> Never commit your `.env` file to GitHub. It is already listed in `.gitignore`.

## Firebase Notes

- Uses the same `paluto-app` Firebase project as the web app
- Firebase config is loaded from `.env` via `lib/firebase.ts`
- Firestore rules must allow customer reads/writes (see web app README)
- Users created in the mobile app appear in the web admin panel

## Features

- Browse menu with search, category filter, and sort
- Product detail with quantity picker
- Cart with free delivery threshold (P500)
- Firebase Auth — register, login, logout
- Checkout with COD, GCash, and Bank Transfer options
- Order history with real-time status badges
- Profile editing — name and phone
- Dark theme matching Paluto brand (red #E8462A + dark background)
- Pull-to-refresh on home and orders screens
- Cart badge on tab bar

## LINK

https://expo.dev/accounts/padillajoshuaanderson.pdm/projects/PalutoMobile/builds/f8f7e383-544b-411a-aa97-86ef656f193d

# BUILD

npm install -g eas-cli
eas login
eas build:configure
npx eas build -p android --profile preview

eas env:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "????" --visibility sensitive --environment preview

eas env:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "????" --visibility sensitive --environment preview

eas env:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "????" --visibility sensitive --environment preview

eas env:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "????" --visibility sensitive --environment preview

eas env:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "????" --visibility sensitive --environment preview

eas env:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --value "????" --visibility sensitive --environment preview

https://drive.google.com/file/d/1yR2MoVaCLHzKfiIwxhrDGvzjSy16W0HK/view?usp=sharing
