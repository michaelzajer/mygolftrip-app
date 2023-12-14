import { useState } from "react";
import {AiFillEyeInvisible, AiFillEye} from "react-icons/ai"
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const {email, password} = formData;
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
      if (userCredential.user) {
        const golferRef = doc(db, 'golfers', userCredential.user.uid);
        const golferSnap = await getDoc(golferRef);
  
        console.log('Golfer id', userCredential.user.uid);
        if (golferSnap.exists()) {
          const golferData = golferSnap.data();
          if (!golferData.golfLinkNo || golferData.golfLinkNo === 0 || !golferData.handicapGA || golferData.handicapGA === 0) {
            toast.warn("Please update your Golf Link number and GA Handicap in your profile.");
          }
  
          const tripsRef = collection(db, 'golfTrips');
          const tripsSnapshot = await getDocs(tripsRef);
          let isPartOfTrip = false;
  
          for (const tripDoc of tripsSnapshot.docs) {
            const golfersRef = collection(db, `golfTrips/${tripDoc.id}/golfers`);
            const golferInTripSnap = await getDocs(golfersRef);
  
            if (golferInTripSnap.docs.some(doc => doc.id === userCredential.user.uid)) {
              isPartOfTrip = true;
              break;
            }
          }
  
          navigate(isPartOfTrip ? '/mytrips' : '/join-trip');
        }
      }
    } catch (error) {
      toast.error("Bad user credentials");
    }
  }

  function onChange(e) {
    setFormData((prevState)=>({
      ...prevState, 
      [e.target.id]: e.target.value,
    }));
  }

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold  text-blue-100">
        Sign In
      </h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-1 md:mb-6">
          <img src="/mygolftrip_logo2.svg" 
          alt="logo"
          className="w-full rounded-2xl bg-blue-100"/>
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form
          onSubmit={onSubmit}>
            <input
              type="email"
              id="email" 
              value={email} 
              onChange={onChange}
              placeholder="Email address"
              className="mb-6 w-full px-4 py-2 text-xl
              text-gray-700 bg-bground-100 border-gray-300 first-letter
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
              text-gray-700 bg-bground-100 border-gray-300 first-letter
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
                Don't have an account?
                <Link to="/sign-up"
                className="text-green-100
                hover:text-bground-100
                transition duration-200
                ease-in-out
                ml-1">Register</Link>
              </p>
              <p>
                <Link to="/forgotpassword"
                 className="text-green-100
                 hover:text-bground-100
                 transition duration-200
                 ease-in-out
                 ml-1">Forgot 
                Password?</Link>
              </p>
            </div>
            <button className="w-full bg-blue-100
          text-green-100 px-7 py-3
          text-sm font-medium uppercase
          rounded shadow-md hover:bg-green-100
          hover:text-blue-100
          transition duration-150 ease-in-out
          hover:shadow-lg active:bg-blue-100"
           type="submit"
           >Sign In
           </button>
           <div className="flex
           items-center my-4 
           before:border-t before:flex-1
           before:border-gray-100
           after:border-t after:flex-1
           after:border-gray-100
           ">
            <p className="text-center
            font-semibold mx-4">OR</p>
           </div>
           <OAuth/>
          </form>
        </div>
      </div>
    </section>
  )
}
