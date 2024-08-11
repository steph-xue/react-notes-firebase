import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAY8yfU2rFAEb1QACVDdLYVPDOIJ-Ck11I",
  authDomain: "react-notes-firebase-d7aab.firebaseapp.com",
  projectId: "react-notes-firebase-d7aab",
  storageBucket: "react-notes-firebase-d7aab.appspot.com",
  messagingSenderId: "1078125510583",
  appId: "1:1078125510583:web:e1835283df7f8d183ef232",
  measurementId: "G-LNKNZ0DHH5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const notesCollection = collection(db, "notes")