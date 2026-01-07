import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCwLqgY-gvHPqrqp9F46KTIBR1Njm9xpew",
  authDomain: "osinachi-c17bd.firebaseapp.com",
  projectId: "osinachi-c17bd",
  storageBucket: "osinachi-c17bd.firebasestorage.app",
  messagingSenderId: "376758838484",
  appId: "1:376758838484:web:01a402f8acdbcd246c0741",
  measurementId: "G-YZGFJE1WR9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 