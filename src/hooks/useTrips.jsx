import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path based on your project structure
import { getAuth } from "firebase/auth";

export const useTrips = () => {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();
  const golferId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchMyTrips = async () => {
      if (!golferId) {
        setIsLoading(false);
        return;
      }
  
      const myTripsData = [];
      const tripsSnapshot = await getDocs(collection(db, "golfTrips"));
  
      for (const tripDoc of tripsSnapshot.docs) {
        const golferRef = doc(db, "golfTrips", tripDoc.id, "golfers", golferId);
        const golferSnap = await getDoc(golferRef);
  
        if (golferSnap.exists()) {
          // Assuming that you want to gather some specific fields from each trip document
          const tripData = tripDoc.data();
          myTripsData.push({
            id: tripDoc.id,
            name: tripData.golfTripName, // Replace 'name' with the actual field name for the trip's name
            startDate: tripData.tripStartDate, // Replace 'startDate' with the actual field name
            endDate: tripData.tripEndDate, // Replace 'startDate' with the actual field name
            // Add any other relevant trip details you need
          });
        }
      }
  
      setTrips(myTripsData);
      setIsLoading(false);
    };
  
    fetchMyTrips();
  }, [golferId]);

  return { trips, isLoading };
};