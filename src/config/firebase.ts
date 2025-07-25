import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABIO6LGK1pUPB-zh0jIM-0XunBlq2GvI0",
  authDomain: "kefir-627a0.firebaseapp.com",
  projectId: "kefir-627a0",
  storageBucket: "kefir-627a0.firebasestorage.app",
  messagingSenderId: "661808265565",
  appId: "1:661808265565:web:cc47b6445aa701a45690b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connect to emulators in development (optional)

export default app;