import { useEffect, useState } from "react"
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import GolferItem from "../components/GolferItem";

export default function MyTrips() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [golfers, setGolfers] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGolferListings() {
      const golferRef = collection(db, "golfers");
      const q = query(
        golferRef,
        where("golferRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);
      let golfers = [];
      querySnap.forEach((doc) => {
        return golfers.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setGolfers(golfers);
      setLoading(false);
      console.log(golfers)
      
    }
    fetchGolferListings();
  }, [auth.currentUser.uid]);

  return (
    <section>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6 bg-blue-100">
                {golfers?.map((golfer) => (
                <GolferItem
                 key={golfer.id} 
                 id={golfer.id} 
                 golfer={golfer.data}
                 />
              ))}
            <div className="sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              
            </div>
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form>
            <input
              type="email"
              id="email" 
              value={''} 
              placeholder=''
              className="mb-6 w-full px-4 py-2 text-xl
              text-gray-700 bg-white border-gray-300 first-letter
              rounded transition ease-in-out"  
            />
            <div className="relative mb-6">
            <input
              type={'' }
              id="password" 
              value={''} 
            
              placeholder="Password"
              className="w-full px-4 py-2 text-xl
              text-gray-700 bg-white border-gray-300 first-letter
              rounded transition ease-in-out"  
            />
            
            </div>
            <div className="flex justify-between 
            whitespace-nowrap text-sm 
            sm:text-lg">
              <p className="mb-6">
                Don't have an account?
                <Link to="/sign-up"
                className="text-green-200
                hover:text-white
                transition duration-200
                ease-in-out
                ml-1">Register</Link>
              </p>
              <p>
                <Link to="/forgotpassword"
                 className="text-green-200
                 hover:text-white
                 transition duration-200
                 ease-in-out
                 ml-1">Forgot 
                Password?</Link>
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
           >Sign In
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
          </form>
        </div>
      </div>
    </section>
  )
  }
