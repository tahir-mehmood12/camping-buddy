import { initializeApp } from 'firebase/app';
import firebase from "firebase/app";
import { getAuth, EmailAuthProvider, linkWithCredential, updateEmail, deleteUser } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';




// add firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBOkHyM-UfWtjYPXYJKSlew7hOutyMRAU4",
  authDomain: "camping-buddy-ff446.firebaseapp.com",
  projectId: "camping-buddy-ff446",
  storageBucket: "camping-buddy-ff446.appspot.com",
  messagingSenderId: "423683483550",
  appId: "1:423683483550:web:1067425c9d4ea94b9bd88f",
  measurementId: "G-ECRFVYVFGK"
};

// initialize firebase
const app = initializeApp(firebaseConfig);



export const auth = getAuth();
export const authEmail = EmailAuthProvider;
export const linkCredential =  linkWithCredential;
export const updateFBEmail =  updateEmail;
export const deleteAccount =  deleteUser;
export const db = getFirestore(app);
