import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, orderBy } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import GolferItem from "../components/GolferItem";
import GolferTripItem from "../components/GolferTripItem";
import DateDetails from '../components/DateDetails';

const MyTrips = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [myTrips, setMyTrips] = useState([]);
  const auth = getAuth();
  const golferId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchMyTrips = async () => {
      if (!golferId) return;

      let tripsData = [];
      const tripsSnapshot = await getDocs(collection(db, "golfTrips"));
      
      for (const tripDoc of tripsSnapshot.docs) {
        const groupsSnapshot = await getDocs(collection(db, `golfTrips/${tripDoc.id}/groups`));
        
        for (const groupDoc of groupsSnapshot.docs) {
          const golfersSnapshot = await getDocs(collection(db, `golfTrips/${tripDoc.id}/groups/${groupDoc.id}/golfers`), orderBy('score', 'desc'));
          const golfers = golfersSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));

          const isGolferInGroup = golfers.some(golfer => golfer.golferRef === golferId);
          
          if (isGolferInGroup) {
            tripsData.push({
              ...tripDoc.data(),
              id: tripDoc.id,
              groups: {
                ...groupDoc.data(),
                id: groupDoc.id,
                golfers
              }
            });
          }
        }
      }

      // Sort the trips by date (ensure your dates are in a format that can be sorted)
      tripsData.sort((a, b) => new Date(a.groups.groupDate) - new Date(b.groups.groupDate));

      setMyTrips(tripsData);
    };

    fetchMyTrips();
  }, [golferId]);

  // Define the callback function to handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date); // Update the selected date
  };

  return (
    <div className="flex justify-center px-6 py-12">
      <div className="max-w-7xl w-full mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Left Component */}
          <div className="flex-shrink-0 w-full md:w-1/3">
            <GolferItem golferRef={golferId} />
            <GolferTripItem onDateSelect={handleDateSelect} />
          </div>
  
          {/* My Trips Groups */}
          <div className="w-full">
            {selectedDate && <DateDetails selectedDate={selectedDate} golferId={golferId} />}
          </div>
  
          {/* Add additional components or content here if necessary */}
        </div>
      </div>
    </div>
  );
};

export default MyTrips;
