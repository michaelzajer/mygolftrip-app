import React, { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const getDateRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dateRange = [];

  while (startDate <= endDate) {
    dateRange.push(new Date(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }

  return dateRange.map(formatDate);
};

const GolferTripItem = () => {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const tripsSnapshot = await getDocs(collection(db, 'golfTrips'));
      setTrips(tripsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          golfTripName: data.golfTripName,
          tripStartDate: data.tripStartDate ? formatDate(data.tripStartDate) : 'N/A',
          tripEndDate: data.tripEndDate ? formatDate(data.tripEndDate) : 'N/A',
          dateRange: data.tripStartDate && data.tripEndDate ? getDateRange(data.tripStartDate, data.tripEndDate) : []
        };
      }));
    };
    
    fetchTrips();
  }, []);

  return (
    <>
      {trips.map(trip => (
        <div key={trip.id} className="bg-green-400 text-white p-4 rounded-lg text-center pt-3">
          <h1 className="text-md font-bold text-center text-blue-500">{trip.golfTripName}</h1>
          <p className='text-md mt-2 text-center text-blue-200'>
            <span className="text-blue-500">Start Date:</span> {trip.tripStartDate}
          </p>
          <p className='text-md mt-2 text-center text-blue-200'>
            <span className="text-blue-500">End Date:</span> {trip.tripEndDate}
          </p>
          <div className="flex justify-center space-x-2 mt-4">
            {trip.dateRange.map(date => (
              <button key={date} className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-1 rounded">
                {date}
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default GolferTripItem;
