import { getAuth, updateProfile } from "firebase/auth";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { FaHome } from 'react-icons/fa';
import { Link } from "react-router-dom";

export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [changeDetail, setChangeDetail] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
    golflinkNo: '',
  });
  const { name, email, golflinkNo } = formData
  function onLogout(){
    auth.signOut();
    navigate('/');
  }
  function onChange(e){
    setFormData((prevState)=>({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  } 
  async function onSubmit(){
    try {
      if(auth.currentUser.displayName !== name){
        //update display name in firebase authentication
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
        
        //update name in the firestore

        const docRef = doc(db, "golfers", auth.currentUser.uid, golflinkNo)
        await updateDoc(docRef, {
          name: name,
          golflinkNo: golflinkNo,
        });
      }
      toast.success('Profile Details Updated')
    } catch (error) {
      toast.error("Could not update the profile details")
    }
  }
  return (
    <>
      <section className="max-w-6xl mx-auto flex
      justify-center items-center flex-col">
        <h1 className="text-3xl text-center mt-6 
        font-bold">My Profile</h1>
        <div className="w-full md:w-[50%] mt-6 px-3">
          <form>
            {/* Name input */}

            <input type="text" 
            id="name"  
            value={name} 
            disabled={!changeDetail}
            onChange={onChange}
            className={`mb-6 w-full px-4 py-2 text-xl 
            text-gray-700 bg-white border border-gray-300
            rounded transition ease-in-out"${changeDetail && 
            "bg-red-200 focus:bg-red-200"}`} />

            {/* Email input */}

            <input type="text" 
            id="email" 
            value={email} disabled
            className="mb-6 w-full px-4 py-2 text-xl 
            text-gray-700 bg-white border border-gray-300
            rounded transition ease-in-out" />

            {/* Name input */}

            <input type="text" 
            id="golflinkno"  
            value={golflinkNo} 
            disabled={!changeDetail}
            onChange={onChange}
            placeholder="GolfLinkNo"
            className={`mb-6 w-full px-4 py-2 text-xl 
            text-gray-700 bg-white border border-gray-300
            rounded transition ease-in-out"${changeDetail && 
            "bg-red-200 focus:bg-red-200"}`} />

            <div className="flex justify-between 
            whitespace-nowrap text-sm sm:text-lg mb-6">
              <p className="flex items-center ">
                Click to Update Details?
                <span
                onClick={() => {
                  changeDetail && onSubmit()
                  setChangeDetail((prevState) => !prevState);
                }}
                className="text-green-100 
                hover:text-green-300 transition ease-in-out
                duration-200 ml-1 cursor-pointer"
                >
                  {changeDetail ? "Apply Change" : "Edit"}
                  </span>
              </p>
              <p onClick={onLogout}
              className="text-green-100 
              hover:text-green-300 transition duration-200 ease-in-out
              cursor-pointer">Sign out</p>
            </div> <button type="submit" 
          className="w-full bg-blue-600
          text-white uppercase px-7 py-3 text-sm font-medium
          rounded shadow-md hover:bg-blue-700
          transition duration-150 ease-in-out hover:shadow-lg
          active:bg-blue-800">
            <Link to="/create-listing"
            className="flex justify-center items-center">
              <FaHome className="mr-2 text-3xl bg-red-200
              rounded-full p-1 border-2"/>
                 Sell or Rent your home
            </Link>
          </button>

          </form>

        </div>
      </section>
    </>
  )
}
