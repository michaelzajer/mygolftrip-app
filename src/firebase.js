// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqWQMWHeLvQGTcZvFbl5ehJSoZqjzhItE",
  authDomain: "mygolf-trip.firebaseapp.com",
  projectId: "mygolf-trip",
  storageBucket: "mygolf-trip.appspot.com",
  messagingSenderId: "100417030096",
  appId: "1:100417030096:web:cb6150180b967462e99bd5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Firestore with new cache settings
initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true,
});

export const db = getFirestore(app);