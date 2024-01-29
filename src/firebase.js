// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

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
const db = getFirestore(app);

// Enable Offline Persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled
        // in one tab at a time.
        // ...
    } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence
        // ...
    }
  });

export { db };