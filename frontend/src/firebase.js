/*
  SETUP STEPS FOR THE DEVELOPER:
  1. Go to https://console.firebase.google.com
  2. Create a project named VentureLens
  3. Go to Project Settings > General > Your Apps > Add Web App
  4. Copy the firebaseConfig object values into frontend .env
  5. Go to Authentication > Sign-in method > Enable Email/Password
  6. Go to Authentication > Sign-in method > Enable Google
  7. Go to Project Settings > Service Accounts > Generate New Private Key
  8. Copy those values into backend .env
*/

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
