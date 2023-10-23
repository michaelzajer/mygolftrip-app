// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
initializeApp(firebaseConfig);
export const db = getFirestore()