/*
This page is the ./pages/SignUp.jsx page.  It calls the ../components/OAuth.jsx component.

*/

import { useState } from "react";
import {AiFillEyeInvisible, AiFillEye} from "react-icons/ai"
import { Link } from "react-router-dom";
import OAuth from "../components/OAuth";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { db } from "../firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    golfLinkNo: "",
  });
  const {name, email, password, golfLinkNo} = formData;
  const navigate = useNavigate()
  function onChange(e) {
    setFormData((prevState)=>({
      ...prevState, 
      [e.target.id]: e.target.value,
    }));
  }
  async function onSubmit(e){
    e.preventDefault()

    try {
      const auth = getAuth()
      const userCredential = await 
      createUserWithEmailAndPassword(
        auth, 
        email, 
        password
        );

        updateProfile(auth.currentUser, {
          displayName: name
        })

        const user = userCredential.user
        const formDataCopy = {...formData}
        delete formDataCopy.password
        formDataCopy.timestamp = serverTimestamp();
        formDataCopy.golferRef = user.uid;
        formDataCopy.isAdmin = false; // Add this line to set isAdmin as false


        await setDoc(doc(db, "golfers", 
        user.uid), formDataCopy)
        navigate('/profile');
    } catch (error) {
        toast.error("something went wrong with sign up")
      }
    }
  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">
        Sign Up
      </h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6">
        <img src="/mygolftrip_logo2.png" 
          alt="logo"
          className="w-full rounded-2xl"/>
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={onSubmit}>
          <input
              type="text"
              id="name" 
              value={name} 
              onChange={onChange}
              placeholder="Full Name"
              className="mb-6 w-full px-4 py-2 text-xl
              text-gray-700 bg-white border-gray-300 first-letter
              rounded transition ease-in-out"  
            />
            <input
              type="email"
              id="email" 
              value={email} 
              onChange={onChange}
              placeholder="Email address"
              className="mb-6 w-full px-4 py-2 text-xl
              text-gray-700 bg-white border-gray-300 first-letter
              rounded transition ease-in-out"  
            />
            <input
              type="golfLinkNo"
              id="golfLinkNo" 
              value={golfLinkNo} 
              onChange={onChange}
              placeholder="GolfLinkNo"
              className="mb-6 w-full px-4 py-2 text-xl
              text-gray-700 bg-white border-gray-300 first-letter
              rounded transition ease-in-out"  
            />
            <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "Password" }
              id="password" 
              value={password} 
              onChange={onChange}
              placeholder="Password"
              className="w-full px-4 py-2 text-xl
              text-gray-700 bg-white border-gray-300 first-letter
              rounded transition ease-in-out"  
            />
            {showPassword ? (
              <AiFillEyeInvisible className="absolute right-3 
              top-3 text-xl cursor-pointer" 
              onClick={()=>setShowPassword
                ((prevState) => !prevState)}/>
            ): (<AiFillEye className="absolute right-3 
            top-3 text-xl cursor-pointer"
              onClick={()=>setShowPassword
                ((prevState) => !prevState)} />
            )}
            </div>
            <div className="flex justify-between 
            whitespace-nowrap text-sm 
            sm:text-lg">
              <p className="mb-6">
                Have an account?
                <Link to="/sign-in"
                className="text-green-200
                hover:text-blue-300
                transition duration-200
                ease-in-out
                ml-1"
                >
                  Sign In
                </Link>
              </p>
              <p>
                <Link to="/forgot-password"
                 className="text-blue-500
                 hover:text-green-300
                 transition duration-200
                 ease-in-out
                 ml-1"
                 >
                  Forgot Password?
                </Link>
              </p>
            </div>
            <button className="w-full bg-blue-100
          text-green-200 px-7 py-3
          text-sm font-medium uppercase
          rounded shadow-md hover:bg-green-200
          hover:text-blue-200
          transition duration-150 ease-in-out
          hover:shadow-lg active:bg-blue-200"
           type="submit"
           >Sign Up
           </button>
           <div className="flex
           items-center my-4 
           before:border-t before:flex-1
           before:border-gray-300
           after:border-t after:flex-1
           after:border-gray-300
           ">
            <p className="text-center
            font-semibold mx-4">OR</p>
           </div>
           <OAuth />
          </form>
        </div>
      </div>
    </section>
  )
}
