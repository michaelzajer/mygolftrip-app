// LeaderboardOverall.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import moment from 'moment';

const LeaderboardOverall = () => {
  const [golfers, setGolfers] = useState([]);

  useEffect(() => {
    const fetchGolfersWithLeaderboard = async () => {
      const tripsCollectionRef = collection(db, 'golfTrips');
      const tripsSnapshot = await getDocs(tripsCollectionRef);
      let allGolfers = [];
  
      for (let tripDoc of tripsSnapshot.docs) {
        const groupsCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups`);
        const groupsSnapshot = await getDocs(groupsCollectionRef);
        
        for (let groupDoc of groupsSnapshot.docs) {
          const golfersCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups/${groupDoc.id}/golfers`);
          const golfersSnapshot = await getDocs(golfersCollectionRef);

          for (let golferDoc of golfersSnapshot.docs) {
            let golferData = {
              golferName: golferDoc.data().golferName,
              groupName: groupDoc.data().groupName,
              groupDate: '-', // Initialize with an empty string
              totalPoints: 0,
              totalScore: 0,
              dailyHandicap: 0,
              gaHandicap: 0,
              golferId: golferDoc.id,
            };

            // Check if leaderboard exists for the golfer
            const leaderboardDocRef = doc(db, `golfTrips/${tripDoc.id}/groups/${groupDoc.id}/leaderboard/${golferDoc.id}`);
            const leaderboardDocSnap = await getDoc(leaderboardDocRef);

            if (leaderboardDocSnap.exists()) {
              const leaderboardData = leaderboardDocSnap.data();
              golferData = {
                ...golferData,
                groupDate: leaderboardData.groupDate ? moment(leaderboardData.groupDate, 'YYYY-MM-DD').format('DD-MM-YYYY') : '',
                totalPoints: leaderboardData.totalPoints || 0,
                totalScore: leaderboardData.totalScore || 0,
                dailyHandicap: leaderboardData.dailyHandicap || 0,
                gaHandicap: leaderboardData.gaHandicap || 0,
              };
            }

            allGolfers.push(golferData);
          }
        }
      }

      allGolfers.sort((a, b) => b.totalPoints - a.totalPoints); // Sort by total points
      setGolfers(allGolfers);
    };

    fetchGolfersWithLeaderboard();
  }, []);

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-4 bg-white shadow overflow-hidden rounded-lg">
        <div className="bg-blue-100 text-yellow-100 flex flex-wrap justify-between text-sm font-medium text-center p-2">
          <div className="flex-1 text-center p-2 md:w-1/6">Date</div>
          <div className="flex-1 text-center p-2 md:w-1/4">Golfer Name</div>
          <div className="flex-1 text-center p-2 md:w-1/4">Group Name</div>
          <div className="flex-1 text-center p-2 md:w-1/6">GA Hcp</div>
          <div className="flex-1 text-center p-2 md:w-1/6">Daily Hcp</div>
          <div className="flex-1 text-center p-2 md:w-1/6">Total Points</div>
          <div className="flex-1 text-center p-2 md:w-1/6">Total Strokes</div>
        </div>
        {golfers.map(golfer => (
          <div key={golfer.golferId} className="flex flex-wrap items-center text-center border-b text-sm">
            <div className="flex-1 p-2 md:w-1/6">{golfer.groupDate}</div>
            <div className="flex-1 p-2 md:w-1/4">{golfer.golferName}</div>
            <div className="flex-1 p-2 md:w-1/4">{golfer.groupName}</div>
            <div className="flex-1 p-2 md:w-1/6">{golfer.gaHandicap}</div>
            <div className="flex-1 p-2 md:w-1/6">{golfer.dailyHandicap}</div>
            <div className="flex-1 p-2 md:w-1/6">{golfer.totalPoints}</div>
            <div className="flex-1 p-2 md:w-1/6">{golfer.totalScore}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardOverall;
