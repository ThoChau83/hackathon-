// =========================================
// ReCity - Firebase Configuration (v9 Modular)
// =========================================
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Read from .env so each environment (local / staging / production) can point
// at its own Firebase project without editing code. See .env.example.
//
// These values are public by design: Vite inlines them into the shipped
// bundle, so anyone can read them in DevTools. What actually protects the
// project is firestore.rules, the API key's HTTP referrer restriction, and
// the Auth authorized-domains list.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Fail loudly at start-up. Without this, a missing variable in production
// surfaces much later as a confusing API_KEY_INVALID from Google.
const missing = Object.keys(firebaseConfig)
  .filter(key => key !== 'measurementId' && !firebaseConfig[key]);

if (missing.length > 0) {
  throw new Error(
    `Firebase config is incomplete. Missing: ${missing.join(', ')}. ` +
    `Copy .env.example to .env and fill in the values from the Firebase console.`
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
