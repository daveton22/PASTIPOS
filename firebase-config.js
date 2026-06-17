// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import {
  getMessaging,
  getToken,
  onMessage,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyANro9J6TQtvQsqHYIpgaO6RdVFbbkzXFM",
  authDomain: "pastipos-e9e1c.firebaseapp.com",
  projectId: "pastipos-e9e1c",
  storageBucket: "pastipos-e9e1c.firebasestorage.app",
  messagingSenderId: "11282146268",
  appId: "1:11282146268:web:8ca6086573c3f398fce519",
  measurementId: "G-G2QR1FNWY1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

// Export fungsi Firestore agar bisa dipakai di app.js
export {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getToken,
  onMessage,
};
