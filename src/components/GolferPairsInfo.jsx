import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

const GolferPairsInfo = ({ tripId, dayDate, pairsDocId, dayDocId }) => {
  const [pairDetails, setPairDetails] = useState([]);

  useEffect(() => {
    if (pairsDocId && dayDocId) {
      // Subscribe to the specific pairs document using onSnapshot
      const pairsDocRef = doc(db, `golfTrips/${tripId}/Days/${dayDocId}/Pairs`, pairsDocId);
      const unsubscribe = onSnapshot(pairsDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const pairData = docSnapshot.data().golfers;
          // Create an async function to fetch golfer details
          const fetchGolferDetails = async () => {
            const golferNames = await Promise.all(pairData.map(async (golfer) => {
              const golferDocRef = doc(db, `golfTrips/${tripId}/golfers`, golfer.id);
              const golferDocSnap = await getDoc(golferDocRef);
              if (golferDocSnap.exists()) {
                return {
                  id: golfer.id,
                  name: golferDocSnap.data().golferName,
                  totalPoints: golfer.totalPoints,
                  totalScore: golfer.totalScore,
                };
              }
              return null; // Handle the case where a golfer might not be found
            }));
            return golferNames.filter(Boolean); // Filter out any null results
          };

          // Call the async function and update the state
          fetchGolferDetails().then((golferNames) => {
            setPairDetails(golferNames);
          });
        } else {
          console.log('Pairs document not found with ID:', pairsDocId);
        }
      });

      // Clean up the listener when the component unmounts
      return () => unsubscribe();
    }
  }, [tripId, dayDate, pairsDocId, dayDocId]);

  return (
<div>
  <div className="mb-1 bg-bground-100 shadow overflow-hidden rounded-lg">
    <div className="grid grid-cols-3 gap-4 px-5 py-3 bg-blue-100 text-yellow-100 text-xs font-semibold tracking-wider">
      <div>Name</div>
      <div>Points</div>
      <div>Strokes</div>
    </div>
    {pairDetails.map((golfer, index) => (
      <div key={index} className="grid grid-cols-3 gap-4 px-5 py-3 bg-white text-black text-xs font-semibold tracking-wider">
        <div>{golfer.name}</div>
        <div>{golfer.totalPoints}</div>
        <div>{golfer.totalScore}</div>
      </div>
    ))}
  </div>
</div>
  );
};

export default GolferPairsInfo;