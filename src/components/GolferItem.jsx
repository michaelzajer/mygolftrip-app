import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure you import your actual firebase config
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
          // doc.data() will be undefined in this case
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
    <div className="bg-blue-600 text-white p-4 rounded-lg text-center">
      <h1 className="text-md font-bold text-center">{golfer.name}</h1>
      {/* Wrap the label in a span and apply text color */}
      <p className='text-md mt-2 text-center'>
        <span className="text-green-300">Golf Link No:</span> {golfer.golfLinkNo}
      </p>
      <p className='text-md mt-2 text-center'>
        <span className="text-green-300">GA Handicap:</span> {golfer.handicapGA}
      </p>
      <Link to="/profile"
        className="text-white text-md mt-2
        hover:text-green-300
        transition duration-200
        ease-in-out
        ml-1">Update your profile</Link>
    </div>
  );
};

export default GolferItem;
