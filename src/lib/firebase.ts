import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD71Ltfc2Ly2GytlIn_NJ3GOfpPzBuS-Rk",
  authDomain: "ecommerce-saul.firebaseapp.com",
  databaseURL: "https://ecommerce-saul-default-rtdb.firebaseio.com",
  projectId: "ecommerce-saul",
  storageBucket: "ecommerce-saul.firebasestorage.app",
  messagingSenderId: "477595766259",
  appId: "1:477595766259:web:0af2d05f52f3ad25915686",
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);