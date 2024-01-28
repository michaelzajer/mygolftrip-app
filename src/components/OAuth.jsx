/*
This page is called from 
./pages/SignIn.jsx and
./pages/SignUp.jsx
*/

import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { useNavigate } from "react-router";

export default function OAuth() {
  const navigate = useNavigate()
 async function onGoogleClick(){
    try {
      const auth = getAuth()
      const provider = new 
      GoogleAuthProvider()
      const result = await signInWithPopup(
        auth, provider)
        const user = result.user

        // check user exists?

        const docRef = doc(db, "golfers", user.uid);
        const docSnap = await getDoc(docRef)

        if(!docSnap.exists()){
          await setDoc(docRef, {
            name: user.displayName,
            email: user.email,
            timeStamp: serverTimestamp(),
          })
        }
        navigate('/profile')

    } catch (error) {
      toast.error("could not authorise with google")
    }
  }
  return (
    <button
    type="button"
    onClick={onGoogleClick}
    className="flex items-center
    justify-center 
    w-full bg-red-700
    text-white
    px-7 py-3 uppercase
    text-sm font-medium
    hover:bg-red-800 
    active:bg-red-900
    shadow-md hover:shadow-lg
    active:shadow-lg
    transition duration-150 ease-in-out
    rounded">
        <FcGoogle 
        className="text-2xl
        bg-white rounded-full mr-2
        "/>
        Continue with 
        Google
    </button>
  )
}
