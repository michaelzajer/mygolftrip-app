import React, { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';
import moment from 'moment';

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
          <p className='text-md mt-2 text-center text-white'>
            <span className="text-blue-500">Start Date:</span> {trip.tripStartDate}
          </p>
          <p className='text-md mt-2 text-center text-white'>
            <span className="text-blue-500">End Date:</span> {trip.tripEndDate}
          </p>
          <div className="flex justify-center space-x-2 mt-4">
            {trip.dateRange.map(date => (
              <button key={date} className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-1 px-1 rounded"
              onClick={() => props.onDateSelect(date, trip.id)}>
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
