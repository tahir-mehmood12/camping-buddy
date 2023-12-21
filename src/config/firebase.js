import { initializeApp } from "firebase/app";
import firebase from "firebase/app";
import {
  getAuth,
  EmailAuthProvider,
  linkWithCredential,
  updateEmail,
  deleteUser,
} from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// add firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBjaz_Iv-UB4Po7TEW4Om3ItQ4YmW5GJpk",
  authDomain: "camping-buddy-cc25a.firebaseapp.com",
  databaseURL: "https://camping-buddy-cc25a-default-rtdb.firebaseio.com",
  projectId: "camping-buddy-cc25a",
  storageBucket: "camping-buddy-cc25a.appspot.com",
  messagingSenderId: "964687962539",
  appId: "1:964687962539:web:2871d4a740ebbd326772ee",
  measurementId: "G-0BVTM2Y05Z",
};

// initialize firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const authEmail = EmailAuthProvider;
export const linkCredential = linkWithCredential;
export const updateFBEmail = updateEmail;
export const deleteAccount = deleteUser;
export const db = getFirestore(app);
