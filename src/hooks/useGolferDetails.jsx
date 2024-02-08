import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure this path is correct for your project
import { getAuth } from "firebase/auth";

export const useGolferDetails = () => {
  const [golferDetails, setGolferDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();
  const golferId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchGolferDetails = async () => {
      if (!golferId) {
        setIsLoading(false);
        return;
      }

      try {
        const golferRef = doc(db, 'golfers', golferId);
        const golferSnap = await getDoc(golferRef);

        if (golferSnap.exists()) {
          setGolferDetails({
            id: golferId,
            ...golferSnap.data()
          });
        } else {
          console.log('No such document for golfer details!');
        }
      } catch (error) {
        console.error("Error fetching golfer details:", error);
        // Optionally, you can handle the error state here
      }

      setIsLoading(false);
    };

    fetchGolferDetails();
  }, [golferId]);

  return { golferDetails, isLoading };
};