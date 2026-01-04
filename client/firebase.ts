import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  type User,
} from "firebase/auth";

function requireEnv(name: string): string {
  const env = import.meta.env;
  if (!env || !(name in env)) {
    throw new Error(`Missing ${name}. Set it in your .env (Vite requires VITE_ prefix).`);
  }
  const value = env[name];
  if (typeof value !== 'string') {
    throw new Error(`${name} must be a string. Please check your .env file.`);
  }
  // Allow empty strings during development but warn
  if (!value) {
    console.warn(`Warning: ${name} is empty. This may cause Firebase initialization to fail.`);
  }
  return value;
}

const firebaseConfig = {
  apiKey: requireEnv("VITE_FIREBASE_API_KEY"),
  authDomain: requireEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: requireEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: requireEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requireEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requireEnv("VITE_FIREBASE_APP_ID"),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};

export const app: FirebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Analytics only works in browser contexts and only if supported.
export async function initAnalytics() {
  try {
    if (typeof window === "undefined") return null;
    const ok = await isSupported();
    if (!ok) return null;
    return getAnalytics(app);
  } catch (error) {
    console.error("Failed to initialize analytics:", error);
    return null;
  }
}

export async function signUp(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function login(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return await signOut(auth);
}

export function onAuthStateChanged(cb: (user: User | null) => void) {
  return fbOnAuthStateChanged(auth, cb);
}
