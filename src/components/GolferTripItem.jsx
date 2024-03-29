/*
This is the GolferTripItem that is called from ../pages/MyTrips.jsx
*/

import React, { useState, useEffect } from 'react';
import { getDocs, collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import moment from 'moment';
import { getAuth } from "firebase/auth";

const formatDate = (dateString) => {
    return moment(dateString).format('ddd DD-MM-YY');
  };
  
  const getDateRange = (start, end) => {
    const startDate = moment(start);
    const endDate = moment(end);
    const dateRange = [];
  
    while (startDate.isSameOrBefore(endDate)) {
      dateRange.push(startDate.format('ddd, DD-MM-YY'));
      startDate.add(1, 'days');
    }
  
    return dateRange;
  };

const GolferTripItem = (props) => {
  const [trips, setTrips] = useState([]);
  const auth = getAuth();
  const golferId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchTrips = async () => {
      if (!golferId) return; 

      const tripsSnapshot = await getDocs(collection(db, 'golfTrips'));
      const tripsData = [];

      for (const tripDoc of tripsSnapshot.docs) {
        // Check if the golfer is part of the golfers subcollection for the trip
        const golferRef = doc(db, 'golfTrips', tripDoc.id, 'golfers', golferId);
        const golferSnap = await getDoc(golferRef);

        if (golferSnap.exists()) {
          // If the golfer is part of the trip, include it in the tripsData array
          const data = tripDoc.data();
          tripsData.push({
            id: tripDoc.id,
            golfTripName: data.golfTripName,
            tripStartDate: data.tripStartDate ? formatDate(data.tripStartDate) : 'N/A',
            tripEndDate: data.tripEndDate ? formatDate(data.tripEndDate) : 'N/A',
            dateRange: data.tripStartDate && data.tripEndDate ? getDateRange(data.tripStartDate, data.tripEndDate) : [],
          });
        }
      }

      setTrips(tripsData); // Set the filtered trips to state
    };

    fetchTrips();
  }, [golferId]); // Rerun the effect if golferId changes

  return (
    <>
      {trips.map(trip => (
        <div key={trip.id} className="border border-blue-100 bg-bground-100 p-4 rounded-lg text-center pt-3">
          <h1 className="text-md font-bold text-center text-blue-100">{trip.golfTripName}</h1>
          <p className='text-md mt-2 text-center text-pink-100'>
            <span className="text-blue-100">Start Date:</span> {trip.tripStartDate}
          </p>
          <p className='text-md mt-2 text-center text-pink-100'>
            <span className="text-blue-100">End Date:</span> {trip.tripEndDate}
          </p>
          <div className="flex justify-center space-x-1 mt-2">
            {trip.dateRange.map((date, index) => (
              <button key={date} 
                  className="bg-blue-100 hover:bg-yellow-100 hover:text-blue-100 
                    text-white text-xs py-1 px-1 rounded border border-pink-100 
                      flex flex-col items-center"
                  onClick={() => props.onDateSelect(date, trip.id)}>
                <span className="font-semibold">{`Day ${index + 1}`}</span>
                <span>{date}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default GolferTripItem;
