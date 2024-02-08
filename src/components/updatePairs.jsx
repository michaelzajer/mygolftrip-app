import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { CalculateAndUpdateTeamPoints } from './CalcTeamPoints'; // Adjust path as necessary

export const updatePairs = async (tripId, golferId, groupDate, newTotalScore, newTotalStablefordPoints) => {
  console.log(tripId, golferId, groupDate, newTotalScore, newTotalStablefordPoints)
  try {
    const dayRef = collection(db, `golfTrips/${tripId}/Days`);
    const q = query(dayRef, where("date", "==", groupDate));
    const daySnapshot = await getDocs(q);

    if (!daySnapshot.empty) {
      const dayDoc = daySnapshot.docs[0];
      const dayDocId = dayDoc.id; // Get the day document ID
      const pairsRef = collection(db, `golfTrips/${tripId}/Days/${dayDocId}/Pairs`);
      const pairsSnapshot = await getDocs(pairsRef);
      
      let pairsDocId = null; // Initialize the pairsDocId variable

      for (const pairDoc of pairsSnapshot.docs) {
        const pairData = pairDoc.data();
        const golferIndex = pairData.golfers.findIndex(g => g.id === golferId);
        
        if (golferIndex !== -1) {
          const updatedGolfers = [...pairData.golfers];
          updatedGolfers[golferIndex] = {
            ...updatedGolfers[golferIndex],
            totalScore: newTotalScore,
            totalPoints: newTotalStablefordPoints,
          };

          await updateDoc(doc(db, `golfTrips/${tripId}/Days/${dayDocId}/Pairs`, pairDoc.id), {
            golfers: updatedGolfers
          });

          pairsDocId = pairDoc.id; // Set the pairs document ID
          await CalculateAndUpdateTeamPoints(dayDocId, tripId);
          break; // If the golfer is found and updated, break out of the loop
        }
      }
      
      if (pairsDocId) {
        return { dayDocId, pairsDocId }; // Return both IDs
      } else {
        throw new Error('Golfer not found in any pairs');
      }
    } else {
      throw new Error('Day document not found');
    }
  } catch (error) {
    console.error("Error updating pairs: ", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};