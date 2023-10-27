import { getAuth, updateProfile } from "firebase/auth";
import { db } from "../firebase";
import { 
  doc, 
  updateDoc, 
  setDoc, 
  query, 
  where,
  orderBy,
  getDocs,
  collection,
 } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { FaHome } from 'react-icons/fa';
import { Link } from "react-router-dom";
import ListingItem from "../components/ListingItem";

export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState(null)
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
    async function fetchUserListings() {
      const listingRef = collection(db, "golfers");
      const q = query(
        listingRef,
        where("golferRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );

      const querySnap = await getDocs(q);
      let listings = [];
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setListings(listings);
      setLoading(false);
      console.log(listings)
    }
    fetchUserListings();
  }, [auth.currentUser.uid]);
  return (
    <>
      <section className="max-w-6xl mx-auto flex
      justify-center items-center flex-col">
        <h1 className="text-3xl text-center mt-6 
        font-bold">My Profile</h1>
        <div className="w-full md:w-[50%] mt-6 px-3">
          <form>
            {/* Name input */}

            <input 
            type="text" 
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

            {/* GolfLink input */}

            <input 
              type="text" 
              id="golfLinkNo"  
              value={golfLinkNo} 
              disabled={!changeDetail}
              onChange={onChange}
              placeholder="GolfLinkNo"
              className={`mb-6 w-full px-4 py-2 text-xl 
              text-gray-700 bg-white border border-gray-300
              rounded transition ease-in-out"${changeDetail && 
              "bg-red-200 focus:bg-red-200"}`} 
            />

            {/* HandicapGA input */}

            <input 
              type="text" 
              id="handicapGA"  
              value={handicapGA} 
              disabled={!changeDetail}
              onChange={onChange}
              placeholder="GA handicap"
              className={`mb-6 w-full px-4 py-2 text-xl 
              text-gray-700 bg-white border border-gray-300
              rounded transition ease-in-out"${changeDetail && 
              "bg-red-200 focus:bg-red-200"}`} 
            />

            <div 
              className="flex justify-between 
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
              <p 
                onClick={onLogout}
                className="text-green-100 
                hover:text-green-300 transition duration-200 ease-in-out
                cursor-pointer"
                >
                Sign out
              </p>
            </div> 
            <button 
            type="submit" 
              className="w-full bg-blue-600
              text-white uppercase px-7 py-3 text-sm font-medium
              rounded shadow-md hover:bg-blue-700
              transition duration-150 ease-in-out hover:shadow-lg
              active:bg-blue-800">
                <Link to="/mytrips"
                    className="flex justify-center items-center">
                  <FaHome className="mr-2 text-3xl bg-red-200
                  rounded-full p-1 border-2"/>
                  Sell or Rent your home
                </Link>
            </button>
            <p>{}</p>
          </form>
        </div>
      </section>
      <div className="max-w-6xl px-3 mt-6 mx-auto">
       {!loading && listings.length > 0 && (  
       
          <>
            <h2
            className="text-2xl text-center font-semibold mb-6">
              My Listings
            </h2>
            <ul className="sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {listings.map((listing) => (
                <ListingItem
                 key={listing.id} 
                 id={listing.id} 
                 listing={listing.data}
                 />
              ))}
            </ul>
          </>
          )}
      </div>
    </>
  )
}
