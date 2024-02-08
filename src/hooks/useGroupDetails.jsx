import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure this path is correct for your project

export const useGroupDetails = (trips) => {
  const [groupDetails, setGroupDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      setIsLoading(true);
      const allGroupDetails = [];

      for (const trip of trips) {
        const groupsCollectionRef = collection(db, `golfTrips/${trip.id}/groups`);
        try {
          const groupsSnapshot = await getDocs(groupsCollectionRef);
          const groupsData = groupsSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            tripId: trip.id // Including tripId for reference
          }));
          allGroupDetails.push(...groupsData);
        } catch (error) {
          console.error("Error fetching group details:", error);
          // Optionally, handle the error state here
        }
      }

      setGroupDetails(allGroupDetails);
      setIsLoading(false);
    };

    if (trips.length > 0) {
      fetchGroupDetails();
    } else {
      setIsLoading(false);
    }
  }, [trips]);

  return { groupDetails, isLoading };
};