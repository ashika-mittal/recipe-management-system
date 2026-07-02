# Zayka Project Report

## 1. Project Overview

- **Project name:** Zayka
- **Description:** A recipe management system built with React and Firebase that allows users to browse recipes, submit new recipes, bookmark favorites, and let admins review and approve contributions.
- **Platform:** Web
- **Primary audience:** Home cooks, food lovers, and community recipe contributors.

## 2. Technology Stack

- **Frontend:** React 19
- **Bundler:** Vite
- **Routing:** React Router v7
- **Styling:** Tailwind CSS
- **Backend / Database:** Firebase
  - Authentication: `firebase/auth`
  - Database: `firebase/firestore`
  - Storage: `firebase/storage`
- **Icons:** `react-icons`
- **Linting:** ESLint

## 3. Architecture

### Core Application

- `src/main.jsx`
  - Bootstraps the React application and renders `<App />`.

- `src/App.jsx`
  - Wraps the app with `BrowserRouter` and `AuthProvider`.
  - Defines public, protected, and admin routes.
  - Renders navigation and footer components.
  - Calls `autoSeedIfEmpty()` to populate Firestore if empty.

### Authentication

- `src/contexts/AuthContext.jsx`
  - Uses Firebase `onAuthStateChanged` to track auth state.
  - Loads Firestore user profile data.
  - Provides authentication state, admin role info, and refresh functionality.

- `src/firebase/auth.js`
  - Sign up, login, logout helpers.
  - Creates Firestore user documents with role and bookmarks.
  - Provides `getUserData(uid)`.

### Route Protection

- `src/components/common/ProtectedRoute.jsx`
  - Redirects unauthenticated users to `/login`.
  - Blocks non-admin users from `/admin`.
  - Shows a loading indicator while auth state initializes.

## 4. Key Features

### Public & Protected Areas

- Public pages:
  - `/login`
  - `/signup`

- Protected user pages:
  - `/`
  - `/dishes/:category`
  - `/dish/:dishId`
  - `/recipe/:recipeId`
  - `/submit-recipe`
  - `/search`
  - `/profile/:userId`

- Admin-only page:
  - `/admin`

- Catch-all page for unknown routes.

### Recipe Workflow

- Browse and search approved recipes.
- Submit recipes for review.
- Admin approval workflow for recipe publishing.
- Rate, like, comment, and bookmark recipes.

### Recipe Submission

- Users can submit recipes for existing dishes or propose new dishes.
- Dynamic ingredient and instruction fields.
- Validation for required recipe details.
- Submissions are stored with `pending` status.

### Admin Dashboard

- Review pending recipes.
- Approve, reject, or delete recipes.
- View published recipes and submission counts.

### Data Seeding

- `src/data/seedRunner.js`
  - Automatically seeds Firestore when the `dishes` collection is empty.
  - Clears existing test data and populates dishes + recipes.

## 5. Firebase Data Model

### Collections

- `users`
  - `uid`, `displayName`, `email`, `avatarUrl`
  - `role` (`user` / `admin`)
  - `bookmarks`

- `dishes`
  - metadata for dish categories, cuisine, description, image, recipe count

- `recipes`
  - recipe details, ingredients, instructions
  - author metadata
  - status: `pending`, `approved`, `rejected`
  - engagement counts: likes, rating, comments

- `likes`
  - one document per user-recipe like

- `ratings`
  - one document per user-recipe rating

- `comments`
  - recipe comments with optional parent comment support

## 6. Important Files

- `src/App.jsx`
- `src/main.jsx`
- `src/contexts/AuthContext.jsx`
- `src/components/common/ProtectedRoute.jsx`
- `src/firebase/config.js`
- `src/firebase/auth.js`
- `src/firebase/firestore.js`
- `src/data/seedRunner.js`
- `src/utils/helpers.js`
- `src/utils/constants.js`

## 7. System Strengths

- Clean file and feature structure.
- Modular Firebase helper functions.
- Clear auth and role-based access handling.
- Admin review workflow for recipe moderation.
- Good use of reusable UI components and pages.

## 8. Improvement Opportunities

- Add Firestore security rules for server-side role enforcement.
- Improve pagination and query efficiency for larger recipe datasets.
- Add unit tests for key logic and UI flows.
- Consider adding TypeScript for better type safety.
- Add explicit error handling and loading states across all pages.

## 9. Summary

Zayka is a polished recipe management application with a strong Firebase integration and a clear community recipe workflow. It supports user-generated content with admin moderation, and it is structured well for future expansion.
