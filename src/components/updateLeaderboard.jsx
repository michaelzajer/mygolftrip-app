import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const updateLeaderboard = async ({
  tripId, groupId, golferId, totalScore, totalPoints,
  handicapGA, dailyHandicap, groupName, golferName
}) => {
  const leaderboardRef = doc(db, `golfTrips/${tripId}/groups/${groupId}/leaderboard/${golferId}`);
  const leaderboardUpdate = {
    totalScore: totalScore,
    totalPoints: totalPoints,
    handicapGA: handicapGA,
    dailyHandicap: dailyHandicap,
    groupName: groupName,
    golferName: golferName,
    // Remove groupDate if it's not used in your current context or ensure it's passed correctly if needed
  };
console.log(tripId, groupId, totalPoints, totalScore, handicapGA, dailyHandicap, golferName)
  try {
    await setDoc(leaderboardRef, leaderboardUpdate, { merge: true });
    console.log("Leaderboard updated successfully");
  } catch (error) {
    console.error("Error updating leaderboard: ", error);
  }
};