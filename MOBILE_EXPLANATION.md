# KidTasker Mobile (Expo/React Native)

This is the mobile version of KidTasker. 

## Structure
- `src/App.tsx`: Main navigation entry using `@react-navigation/stack`.
- `index.js`: Root registration for Expo.
- `src/firebase.ts`: Firebase initialization with React Native persistence.
- `src/pages/`: React Native screens using `View`, `Text`, `TouchableOpacity`, and `StyleSheet`.

## Key Differences from Web
- **Layouts**: Uses Flexbox via `StyleSheet` instead of Tailwind utility classes.
- **Components**: Replaces `div` with `View`, `button` with `TouchableOpacity`, and `h1/p` with `Text`.
- **Navigation**: Switched from `react-router-dom` to `@react-navigation/native`.
- **Auth Persistence**: Integrated `@react-native-async-storage/async-storage` for login sessions.

## How to Run locally
1. Install Expo CLI: `npm install -g expo-cli`
2. Install dependencies: `npm install`
3. Start the project: `npm start`
4. Open on a physical device using the **Expo Go** app or an emulator.

## Backend Admin API (Modular Production Structure)
The project includes a production-ready Express backend organized in the `/backend` folder:
- **Base URL**: `APP_URL/api/admin`
- **Security**: 
    - Verified via `backend/middleware/auth.ts` using Firebase ID Tokens.
    - Role-based access control (RBAC) enforced via Firestore `role` property.
    - Authorization Header format: `Bearer [ID_TOKEN]`

### Modular File Structure:
- `backend/config/`: Firebase Admin SDK configuration.
- `backend/controllers/`: Logic for stats, user management, and roles.
- `backend/middleware/`: Security layers including token verification.
- `backend/routes/`: Route definitions for the Admin API.

### Production Admin Endpoints:
- `GET /api/admin/stats`: Returns system-wide totals (Firestore count queries).
- `GET /api/admin/users`: Returns recent user registrations.
- `POST /api/admin/set-role`: Allows an admin to change user roles (Admin only).
- `POST /api/admin/broadcast`: Simulates a system-wide notice.

### Mobile App Focus
The React Native app is now exclusively focused on **Kids** and **Parents** to keep the bundle size small and the UX clean. Admin screens have been removed from the mobile UI as those features have been migrated to the Backend API.

To start the backend locally: `npm run dev`

