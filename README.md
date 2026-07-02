# 🍽️ Zayka — Recipe Management System

Zayka is a full-stack recipe management web app built with React and Firebase. Users can browse recipes, submit their own, bookmark favorites, rate and comment — while admins review and moderate all community submissions before they go live.

## ✨ Features

- **Browse & search** approved recipes by category/cuisine
- **Submit recipes** for existing dishes or propose entirely new dishes, with dynamic ingredient/instruction fields and validation
- **Engagement**: like, rate, comment, and bookmark recipes
- **Auth & profiles**: signup/login with Firebase Authentication, per-user profile pages
- **Admin dashboard**: review, approve, reject, or delete pending submissions
- **Role-based route protection**: user vs. admin access enforced on the client
- **Auto-seeding**: Firestore is automatically populated with starter data if empty

## 🛠️ Tech Stack

| Layer          | Technology                     |
|----------------|---------------------------------|
| Frontend       | React 19                       |
| Bundler        | Vite                           |
| Routing        | React Router v7                |
| Styling        | Tailwind CSS                   |
| Backend/DB     | Firebase (Auth, Firestore, Storage) |
| Icons          | react-icons                    |
| Linting        | ESLint                         |

## 📂 Project Structure

```
src/
├── components/common/   # Navbar, Footer, Loader, ProtectedRoute
├── contexts/            # AuthContext (Firebase auth state + user profile)
├── data/                # Seed data + seed runner for Firestore
├── firebase/            # config, auth, firestore, storage helpers
├── pages/               # Home, DishListing, DishDetail, RecipeDetail,
│                         Search, Login, Signup, Profile, SubmitRecipe, Admin
├── utils/                # constants, helpers, validators
├── App.jsx               # Routes + providers
└── main.jsx               # App entry point
```

## 🔑 Routes

| Path                    | Access     |
|--------------------------|------------|
| `/login`, `/signup`      | Public     |
| `/`                      | Protected  |
| `/dishes/:category`      | Protected  |
| `/dish/:dishId`          | Protected  |
| `/recipe/:recipeId`      | Protected  |
| `/submit-recipe`         | Protected  |
| `/search`                | Protected  |
| `/profile/:userId`       | Protected  |
| `/admin`                 | Admin only |

## 🔥 Firebase Data Model

- **`users`** — `uid`, `displayName`, `email`, `avatarUrl`, `role` (`user`/`admin`), `bookmarks`
- **`dishes`** — category metadata: cuisine, description, image, recipe count
- **`recipes`** — recipe details, ingredients, instructions, author metadata, status (`pending`/`approved`/`rejected`), likes/rating/comment counts
- **`likes`** — one document per user–recipe like
- **`ratings`** — one document per user–recipe rating
- **`comments`** — recipe comments, with optional parent comment (for replies)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A Firebase project with **Authentication**, **Firestore**, and **Storage** enabled

### Installation

```bash
git clone https://github.com/ashika-mittal/recipe-management-system.git
cd recipe-management-system
npm install
```

### Firebase Setup

This project currently has Firebase config values inlined in `src/firebase/config.js`. For a fresh setup (or before deploying publicly), it's recommended to move these into environment variables instead:

1. Create a `.env` file in the project root:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

2. Update `src/firebase/config.js` to read from `import.meta.env.VITE_FIREBASE_*` instead of hardcoded values.
3. Make sure `.env` is listed in `.gitignore` (it should be added if not already present).

> **Note:** Firebase web API keys are not secret in the way server-side keys are — the real access boundary is your **Firestore security rules**. Still, using environment variables keeps config flexible across environments and out of your commit history.

### Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Other scripts

```bash
npm run build     # Production build
npm run preview   # Preview the production build locally
npm run lint       # Run ESLint
```

## 🧭 Roadmap / Improvement Ideas

- Enforce role checks via Firestore security rules (not just client-side)
- Pagination / query optimization for larger recipe datasets
- Unit tests for core logic and UI flows
- Migrate to TypeScript for type safety
- More consistent error handling and loading states across pages

## 📄 License

Not currently specified.
