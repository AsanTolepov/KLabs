// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDAz0JFeY5ksQfFjR8NKnIYjRnidgjrBv8",
    authDomain: "atomix-academy.firebaseapp.com",
    projectId: "atomix-academy",
    // DIQQAT! Pastdagi qatorni o'zgartiring:
    storageBucket: "atomix-academy.appspot.com", 
    messagingSenderId: "691159032490",
    appId: "1:691159032490:web:0be64c32a8890c556326d3",
    measurementId: "G-5GR6K7M475"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});