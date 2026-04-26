import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from 'firebase/auth';

// ── Your Firebase config ──────────────────────────────────────────────────────
// Replace these values with your actual Firebase project config.
// Get them from: Firebase Console → Project Settings → Your apps → Web app
const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY             || "YOUR_API_KEY",
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN         || "YOUR_AUTH_DOMAIN",
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID          || "YOUR_PROJECT_ID",
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET      || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId:             process.env.REACT_APP_FIREBASE_APP_ID              || "YOUR_APP_ID",
};

// ── Initialize ────────────────────────────────────────────────────────────────
const app            = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const provider = new GoogleAuthProvider();

// Always show Google account picker
provider.setCustomParameters({ prompt: 'select_account' });

// ── Sign in with Redirect (no popup — never blocked by browser) ───────────────
export async function signInWithGoogle() {
  try {
    await signInWithRedirect(auth, provider);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || 'Google sign-in failed.' };
  }
}

// ── Check redirect result after returning from Google ─────────────────────────
// Called once on app mount — returns the signed-in user if coming back
// from a Google redirect, otherwise returns null.
export async function checkRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return { ok: true, user: result.user };
    }
    return { ok: false, user: null };
  } catch (err) {
    console.error('Redirect result error:', err);
    return { ok: false, user: null, error: err.message };
  }
}

// ── Sign Out ──────────────────────────────────────────────────────────────────
export async function firebaseSignOut() {
  try {
    await signOut(auth);
  } catch (e) {
    console.error('Sign out error:', e);
  }
}
