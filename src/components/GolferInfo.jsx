import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Replace with your actual import
import moment from 'moment';

const GolferInfo = ({ golferRef, tripDate }) => {
  const [golfer, setGolfer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch golfer information from Firestore
  useEffect(() => {
    const getGolferInfo = async () => {
      const docRef = doc(db, 'golfers', golferRef);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setGolfer(docSnap.data());
      } else {
        console.log("No such document!");
      }
      setLoading(false);
    };

    getGolferInfo();
  }, [golferRef]);

  // Calculate the countdown to the trip
  const getCountdown = () => {
    return moment(tripDate).diff(moment(), 'days');
  }

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="bg-blue-600 text-white p-4 rounded-lg shadow-md">
      {golfer && (
        <>
          <h2 className="text-2xl font-semibold">{golfer.name}</h2>
          <p className="text-md mt-2">Golf Link No: {golfer.golfLinkNo}</p>
          <p className="text-md">GA Handicap: {golfer.handicap}</p>
          <a href="/update-profile" className="text-white underline mt-4 block">update your profile</a>
          <p className="mt-4">Barnbougle is only {getCountdown()} days away</p>
        </>
      )}
    </div>
  );
};

export default GolferInfo;
