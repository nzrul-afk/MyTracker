import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAhhDVTWOi22PiHk69plUrg1DedDYhY3ZE",
  authDomain: "mytracker-app-8f485.firebaseapp.com",
  projectId: "mytracker-app-8f485",
  storageBucket: "mytracker-app-8f485.firebasestorage.app",
  messagingSenderId: "957170333657",
  appId: "1:957170333657:web:c095491e0d9bc7f217cbc8",
  measurementId: "G-M44JXLXD5Y"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
