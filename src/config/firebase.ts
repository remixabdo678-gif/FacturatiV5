import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDrNiFLm_jwAS6pRstetAOo3KOWkzmf8y0",
  authDomain: "facture-bc21d.firebaseapp.com",
  projectId: "facture-bc21d",
  storageBucket: "facture-bc21d.firebasestorage.app",
  messagingSenderId: "15503201564",
  appId: "1:15503201564:web:8f61217b6e35dfbd2ad6d9",
  measurementId: "G-581B5HXX2H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;