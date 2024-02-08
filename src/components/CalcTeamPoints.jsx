import { collection, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the path based on your project structure

export const CalculateAndUpdateTeamPoints = async (dayId, tripId) => {
    console.log('from calc team points:',dayId, tripId)
    // Points allocation for each day
    const pointsPerDay = {
        '1': 1,
        '2': 2,
        '3': 2,
        '4': 3,
    };

    const pairsRef = collection(db, `golfTrips/${tripId}/Days/${dayId}/Pairs`);
    const snapshot = await getDocs(pairsRef);
    if (!snapshot.empty) {
        snapshot.forEach(async (docSnapshot) => {
            const pairData = docSnapshot.data();
            // Determine the winning condition based on your specific rules.
            // This could involve comparing totalScores within the pair or against other pairs.
            // For simplicity, let's say you already have a function that determines if they win.

            // Example: Assume `determineWinningPair` returns { isWinner: true, multiplier: 1 } if winning
            const winningCondition = determineWinningCondition(pairData); 
            if (winningCondition && winningCondition.isWinner) {
                const pointsForTheDay = pointsPerDay[dayId] * winningCondition.multiplier;
                const updatedTotalPoints = (pairData.totalPoints || 0) + pointsForTheDay;
                await updateDoc(docSnapshot.ref, { totalPoints: updatedTotalPoints });
            }
        });
    }
};

const determineWinningCondition = (pairData) => {
    // Implement your logic here to determine if this pair wins
    // For example, compare this pair's totalScore with others'
    return { isWinner: true, multiplier: 1 }; // Placeholder return value
};