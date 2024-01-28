/*
This is the GolferItem component that is called from ../pages/MyTrips.jsx
*/
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

const GolferItem = ({ golferRef }) => {
  const [golfer, setGolfer] = useState(null);

  useEffect(() => {
    const fetchGolfer = async () => {
      try {
        const docRef = doc(db, 'golfers', golferRef);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setGolfer(docSnap.data());
        } else {
       
          console.log('No such document!');
        }
      } catch (error) {
        console.error("Error fetching golfer data: ", error);
      }
    };

    fetchGolfer();
  }, [golferRef]);

  if (!golfer) {
    return <div className="text-center">Loading golfer information...</div>;
  }

  return (
    <div className="bg-blue-100 text-yellow-100 p-4 rounded-lg text-center">
      <h1 className="text-md font-bold text-center">{golfer.name}</h1>
   
      <p className='text-md mt-2 text-center'>
        <span className="text-green-100">Golf Link No:</span> {golfer.golfLinkNo}
      </p>
      <p className='text-md mt-2 text-center'>
        <span className="text-green-100">GA Handicap:</span> {golfer.handicapGA}
      </p>
      <Link to="/profile"
        className="text-pink-100 text-md mt-2
        hover:text-yellow-100
        transition duration-200
        ease-in-out
        ml-1">Update your profile</Link>
    </div>
  );
};

export default GolferItem;
