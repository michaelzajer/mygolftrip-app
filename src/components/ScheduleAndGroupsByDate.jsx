import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import moment from 'moment';
import { Link } from 'react-router-dom';

const ScheduleAndGroupsByDate = ({ selectedDate, golfTripId }) => {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    const fetchSchedule = async () => {
        // Use the correct date format for the query, matching Firestore's stored format
        const formattedDate = moment(selectedDate, 'ddd DD-MM-YY').format('YYYY-MM-DD');
      
        // Reference the collection for schedules within the specific golf trip
        const scheduleRef = collection(db, `golfTrips/${golfTripId}/schedule`);
        // Create a query to get only the schedule for the selected date
        const q = query(scheduleRef, where("arrivalDate", "==", formattedDate));
      
        const querySnapshot = await getDocs(q);
        const schedulesForDate = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      
        setSchedule(schedulesForDate);
      };
      
    if (selectedDate && golfTripId) {
      fetchSchedule();
    }
  }, [selectedDate, golfTripId]); // Dependencies array includes selectedDate and golfTripId

  // Render the schedule for the selected date
  return (
    <div>
      {schedule.length > 0 ? (
        schedule.map((item, index) => (
          <div key={index}>
            
          </div>
        ))
      ) : (
        <>
        <p>No schedule available for this date.</p>
        
        </>
      )}
    </div>
  );
};

export default ScheduleAndGroupsByDate;
