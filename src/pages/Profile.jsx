/*
This is the ./pages/Profile.jsx page.  It allows a golfer to change their profile and they can also set themselves as a trip admin.
*/

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
import Switch from "react-switch";

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
  const [isAdmin, setIsAdmin] = useState(false); // State for admin status
  const [isAdminToggleChecked, setIsAdminToggleChecked] = useState(false);

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
          setIsAdmin(docSnap.data().isAdmin || false); // Set admin status
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
      setLoading(false);
    };
  
    fetchUserProfile();
  }, [auth.currentUser.uid]);

  useEffect(() => {
    // Fetch and set the isAdmin flag when the component mounts
    const fetchIsAdminFlag = async () => {
      const golferRef = doc(db, 'golfers', auth.currentUser.uid);
      const golferSnap = await getDoc(golferRef);
      if (golferSnap.exists() && golferSnap.data().isAdmin) {
        setIsAdminToggleChecked(golferSnap.data().isAdmin);
      }
    };
    fetchIsAdminFlag();
  }, [auth.currentUser.uid]);

  const handleAdminToggleChange = (checked) => {
    setIsAdminToggleChecked(checked);
    // Update isAdmin field in Firestore
    const golferRef = doc(db, 'golfers', auth.currentUser.uid);
    updateDoc(golferRef, { isAdmin: checked });
  };

  async function saveProfileChanges() {
    try {
      // Update golfer's profile in Firestore
      const golferRef = doc(db, 'golfers', auth.currentUser.uid);
      await updateDoc(golferRef, {
        golfLinkNo: golfLinkNo,
        handicapGA: handicapGA,
      });
      toast.success('Profile details updated');
    } catch (error) {
      toast.error('Could not update profile details');
    }
  }

  const handleAdminChange = async (checked) => {
    setIsAdmin(checked);
    try {
      const golferRef = doc(db, 'golfers', auth.currentUser.uid);
      await updateDoc(golferRef, { isAdmin: checked });
      toast.success('Admin status updated');
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Failed to update admin status');
    }
  };


  return (
    <>
      <section className="max-w-6xl mx-auto flex justify-center items-center flex-col ">
        <h1 className="text-3xl text-center mt-6 font-bold text-primary-100 text-blue-100">My Profile</h1>
        <div className="w-full md:w-[50%] mt-6 px-3 py-3 text-accent-100 border bg-blue-100 border-primary-100 rounded">
          <form>
            {/* Name input */}
            <input 
            type="text" 
            id="name"  
            value={name} 
            onBlur={saveProfileChanges}
            onChange={onChange}
            className={`mb-6 w-full px-4 py-2 text-m text-blue-100 bg-green-100 border border-primary-100 rounded transition ease-in-out"${changeDetail && "focus:text-blue-100 text-blue-100 bg-pink-100 focus:bg-yellow-100"}`} />
            {/* Email input */}
            <input type="text" 
            id="email" 
            value={email} disabled
            className="mb-6 w-full px-4 py-2 text-m text-blue-100 bg-green-100 border border-primary-100 rounded transition ease-in-out" />
            {/* GolfLink input */}
            <input 
              type="text" 
              id="golfLinkNo"  
              value={golfLinkNo} 
              onBlur={saveProfileChanges}
              onChange={onChange}
              placeholder="GolfLinkNo"
              className={`mb-6 w-full px-4 py-2 text-m text-blue-100 bg-green-100 border border-primary-100 rounded transition ease-in-out"${changeDetail && "focus:text-blue-100 text-blue-100 bg-pink-100 focus:bg-yellow-100"}`} 
            />
            {/* HandicapGA input */}
            <input 
              type="text" 
              id="handicapGA"  
              value={handicapGA} 
              onBlur={saveProfileChanges}
              onChange={onChange}
              placeholder="GA handicap"
              className={`mb-6 w-full px-4 py-2 text-m text-blue-100 bg-green-100 border border-primary-100 rounded transition ease-in-out"${changeDetail && "focus:text-blue-100 text-blue-100 bg-pink-100 focus:bg-yellow-100"}`} 
            />
            <div 
              className="flex justify-between whitespace-nowrap text-m sm:text-m mb-6">
              <p 
                onClick={onLogout}
                className="text-accent-100 text-green-100 hover:text-pink-100 transition duration-200 ease-in-out cursor-pointer text-m">
                Sign out
              </p>
            </div> 

            <div>
        <label className='text-green-100' htmlFor="admin-toggle">Admin:</label>
        <Switch
          id="admin-toggle"
          checked={isAdminToggleChecked}
          onChange={handleAdminToggleChange}
        />
         {isAdminToggleChecked ? (
          <Link to="/admin" className="ml-4 text-green-100">
            Go to Admin Page
          </Link>
        ) : (
          <p>Do you want to create a golf trip to share with friends?</p>
        )}
      </div>
            <div className="my-4">
            <button 
            type="submit" 
              className="w-full  uppercase px-7 py-3 text-m font-medium rounded shadow-md bg-blue-100 hover:bg-yellow-100 hover:text-blue-100 border border-yellow-100 text-green-100
               transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-100 active:text-white">
                <Link to="/mytrips"
                    className="flex justify-center items-center ">
                  <LiaGolfBallSolid className="mr-2 text-m bg-blue-100 hover:bg-yellow-100 hover:text-blue-100 border border-yellow-100 text-pink-100 rounded-full p-1 border-2 "/>
                  Click to go to your Golf Trip
                </Link>
            </button>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}
