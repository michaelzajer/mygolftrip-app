import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, orderBy } from 'firebase/firestore';
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
      <div className="flex justify-center px-6 py-12">
        <div className="max-w-7xl w-full mx-auto">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            {/* Left Components - Conditionally render the left component based on left component state */}
              {showLeftComponent && (
                <div className="flex-shrink-0 w-full md:w-1/3">
                  <GolferItem golferRef={golferId} />
                  <GolferTripItem onDateSelect={handleDateSelect} />
                </div>
              )}

            {/* Right Components */}
            <div className="w-full">
              {/* Render ScheduleAndGroupsByDate if a date is selected */}
              {selectedDateInfo.date && (
                <ScheduleAndGroupsByDate
                  selectedDate={selectedDateInfo.date}
                  golfTripId={selectedDateInfo.golfTripId}
                />
              )}
  
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