import { getAuth, updateProfile } from "firebase/auth";
import { db } from "../firebase";
import { 
  doc, 
  updateDoc, 
  setDoc, 
getDoc
 } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { LiaGolfBallSolid } from 'react-icons/lia'
import { Link } from "react-router-dom";

export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true)
  const [changeDetail, setChangeDetail] = useState(false);
  const [formData, setFormData] = useState({
    id: auth.currentUser.uid,
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
    golfLinkNo: '',
    handicapGA: '',
  });
  const { name, email, golfLinkNo, handicapGA } = formData
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
          const docRef = doc(db, "golfers", auth.currentUser.uid)
            await updateDoc(docRef, {
              name: name });
      }
        //set golfLinkNo in the firestore
          const golfLink = doc(db, 'golfers', auth.currentUser.uid);
              await setDoc(golfLink, {
                golfLinkNo: golfLinkNo, handicapGA: handicapGA }, {merge: true });

        toast.success('Profile Details Updated')
    } catch (error) {
        toast.error("Could not update the profile details")
    }
  }
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'golfers', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          setFormData((prevState) => ({
            ...prevState,
            golfLinkNo: docSnap.data().golfLinkNo || '',
            handicapGA: docSnap.data().handicapGA || '',
          }));
        } else {
          // Handle the case where the document does not exist.
          console.log('No such document!');
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Handle any errors.
      }
      setLoading(false);
    };
  
    fetchUserProfile();
  }, [auth.currentUser.uid]); // Add additional dependencies as needed.


  return (
    <>
      <section className="max-w-6xl mx-auto flex justify-center items-center flex-col ">
        <h1 className="text-3xl text-center mt-6 font-bold text-blue-600">My Profile</h1>
        <div className="w-full md:w-[50%] mt-6 px-3 py-3 bg-blue-600 border border-green-300 rounded">
          <form>
            {/* Name input */}
            <input 
            type="text" 
            id="name"  
            value={name} 
            disabled={!changeDetail}
            onChange={onChange}
            className={`mb-6 w-full px-4 py-2 text-m text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out"${changeDetail && "bg-red-200 focus:bg-red-200"}`} />
            {/* Email input */}
            <input type="text" 
            id="email" 
            value={email} disabled
            className="mb-6 w-full px-4 py-2 text-m text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out" />
            {/* GolfLink input */}
            <input 
              type="text" 
              id="golfLinkNo"  
              value={golfLinkNo} 
              disabled={!changeDetail}
              onChange={onChange}
              placeholder="GolfLinkNo"
              className={`mb-6 w-full px-4 py-2 text-m text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out"${changeDetail && "bg-red-200 focus:bg-red-200"}`} 
            />
            {/* HandicapGA input */}
            <input 
              type="text" 
              id="handicapGA"  
              value={handicapGA} 
              disabled={!changeDetail}
              onChange={onChange}
              placeholder="GA handicap"
              className={`mb-6 w-full px-4 py-2 text-m text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out"${changeDetail && "bg-red-200 focus:bg-red-200"}`} 
            />
            <div 
              className="flex justify-between whitespace-nowrap text-m sm:text-m mb-6">
              <p className="flex items-center text-white ">
                <span
                onClick={() => {
                  changeDetail && onSubmit()
                  setChangeDetail((prevState) => !prevState);
                }}
                className="text-green-300 hover:text-white transition ease-in-out duration-200 ml-1 cursor-pointer">
                  {changeDetail ? "Apply Change" : "Edit Details"}
                  </span>
              </p>
              <p 
                onClick={onLogout}
                className="text-green-300 hover:text-white transition duration-200 ease-in-out cursor-pointer text-m">
                Sign out
              </p>
            </div> 
            <button 
            type="submit" 
              className="w-full bg-green-300 text-blue-600 uppercase px-7 py-3 text-m font-medium rounded shadow-md hover:bg-blue-600 hover:text-white
               transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-600 active:text-white">
                <Link to="/mytrips"
                    className="flex justify-center items-center ">
                  <LiaGolfBallSolid className="mr-2 text-m bg-green-300 hover:bg-blue-600 rounded-full p-1 border-2 "/>
                  Click to go to your Golf Trip
                </Link>
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
