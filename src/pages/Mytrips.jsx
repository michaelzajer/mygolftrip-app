import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import GolferItem from "../components/GolferItem";
import GolferTripItem from "../components/GolferTripItem";
import DateDetails from '../components/DateDetails';
import ScheduleAndGroupsByDate from '../components/ScheduleAndGroupsByDate';

const MyTrips = () => {
  const [selectedDateInfo, setSelectedDateInfo] = useState({ date: null, golfTripId: null });
  const [myTrips, setMyTrips] = useState([]);
  const [showLeftComponent, setShowLeftComponent] = useState(true); // New state for sidebar visibility

  const auth = getAuth();
  const golferId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchMyTrips = async () => {
      if (!golferId) return;
  
      const myTripsData = [];
      const tripsSnapshot = await getDocs(collection(db, "golfTrips"));
  
      for (const tripDoc of tripsSnapshot.docs) {
        // New path to check if the golfer is in the golfers subcollection of the golfTrip
        const golferRef = doc(db, "golfTrips", tripDoc.id, "golfers", golferId);
        const golferSnap = await getDoc(golferRef);
  
        if (golferSnap.exists()) {
          // If the golfer is part of this trip, then fetch the groups
          const groupsSnapshot = await getDocs(collection(db, `golfTrips/${tripDoc.id}/groups`));
          const groupsData = groupsSnapshot.docs.map(groupDoc => ({
            ...groupDoc.data(),
            id: groupDoc.id
          }));
  
          // Add this trip to the myTripsData array
          myTripsData.push({
            ...tripDoc.data(),
            id: tripDoc.id,
            groups: groupsData,
          });
        }
      }
  
      // Sort the trips by date
      myTripsData.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      setMyTrips(myTripsData);
    };
  
    fetchMyTrips();
  }, [golferId]);

    // Define the callback function to handle date selection
    const handleDateSelect = (date, golfTripId) => {
      setSelectedDateInfo({ date, golfTripId }); // Update the selected date, trip ID, and group ID
    };

    // Callback function to hide the Left Component
  const handleHideLeftComponent = () => {
    setShowLeftComponent(false);
  };

  // Callback function to show the Left Component
  const handleShowLeftComponent = () => {
    setShowLeftComponent(true);
  };
  
    return (
      <div className="flex justify-center px-6 py-12 bg-bground-100">
        <div className="max-w-7xl w-full mx-auto">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            {/* Left Components - Conditionally render the left component based on left component state */}
              {showLeftComponent && (
                <div className="flex-shrink-0 w-full md:w-1/3 shadow-md">
                  <GolferItem golferRef={golferId} />
                  <GolferTripItem onDateSelect={handleDateSelect} />
                </div>
              )}

            {/* Right Components */}
            <div className="w-full">


              {/* Render DateDetails if a date is selected */}
              {selectedDateInfo.date && (
                <DateDetails
                  selectedDate={selectedDateInfo.date}
                  golferId={golferId}
                  onHideLeftComponent={handleHideLeftComponent}
                  onShowLeftComponent={handleShowLeftComponent}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default MyTrips;