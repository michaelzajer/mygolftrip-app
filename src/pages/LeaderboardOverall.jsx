/*
This page is called from ./pages/Leaderboards.jsx it displays the leaderboard by overall
*/
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const PRIZE_MONEY = [220, 120, 70]; // Prize money for 1st, 2nd, and 3rd

const LeaderboardOverall = () => {
  const [golfers, setGolfers] = useState([]);

  useEffect(() => {
    const fetchGolfersWithLeaderboard = async () => {
      const tripsCollectionRef = collection(db, 'golfTrips');
      const tripsSnapshot = await getDocs(tripsCollectionRef);
      let golfersMap = new Map();
  
      for (let tripDoc of tripsSnapshot.docs) {
        const groupsCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups`);
        const groupsSnapshot = await getDocs(groupsCollectionRef);
        
        for (let groupDoc of groupsSnapshot.docs) {
          const groupName = groupDoc.data().groupName;
          const golfersCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups/${groupDoc.id}/golfers`);
          const golfersSnapshot = await getDocs(golfersCollectionRef);

          for (let golferDoc of golfersSnapshot.docs) {
            let golferId = golferDoc.id;
            let golferData = golfersMap.get(golferId) || {
              golferName: golferDoc.data().golferName,
              totalPoints: 0,
              totalScore: 0,
              dailyHandicap: 0,
              gaHandicap: 0,
              golferId: golferId,
              groupName: groupName,
            };

            const leaderboardDocRef = doc(db, `golfTrips/${tripDoc.id}/groups/${groupDoc.id}/leaderboard/${golferId}`);
            const leaderboardDocSnap = await getDoc(leaderboardDocRef);

            if (leaderboardDocSnap.exists()) {
              const leaderboardData = leaderboardDocSnap.data();
              golferData.totalPoints += leaderboardData.totalPoints || 0;
              golferData.totalScore += leaderboardData.totalScore || 0;
              golferData.dailyHandicap = leaderboardData.dailyHandicap || golferData.dailyHandicap;
              golferData.gaHandicap = leaderboardData.gaHandicap || golferData.gaHandicap;
            }

            golfersMap.set(golferId, golferData);
          }
        }
      }

      let allGolfers = Array.from(golfersMap.values());
      allGolfers.sort((a, b) => b.totalPoints - a.totalPoints);
      setGolfers(allGolfers);
    };

    fetchGolfersWithLeaderboard();
  }, []);

  const getPrizeMoney = (position) => {
    return position < PRIZE_MONEY.length ? `$${PRIZE_MONEY[position]}` : '-';
  };

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-4 bg-white shadow overflow-hidden rounded-lg">
        <div className="bg-blue-100 text-yellow-100 flex flex-wrap justify-between text-sm font-medium text-center p-2">
          <div className="flex-1 text-center p-2 md:w-1/4">Golfer Name</div>
          <div className="flex-1 text-center p-2 md:w-1/4">Group Name</div>
          <div className="flex-1 text-center p-2 md:w-1/6">GA Hcp</div>
          <div className="flex-1 text-center p-2 md:w-1/6">Prize Money</div>
          <div className="flex-1 text-center p-2 md:w-1/6">Total StbFd Points</div>
          <div className="flex-1 text-center p-2 md:w-1/6">Total Strokes</div>
        </div>
        {golfers.map((golfer, index) => (
        <div key={golfer.golferId} className="flex flex-wrap items-center text-center border-b text-sm">
          <div className="flex-1 p-2 md:w-1/4">{golfer.golferName}</div>
          <div className="flex-1 p-2 md:w-1/4">{golfer.groupName}</div>
          <div className="flex-1 p-2 md:w-1/6">{golfer.gaHandicap}</div>
          <div className="flex-1 p-2 md:w-1/6">{getPrizeMoney(index)}</div> {/* Now passing index */}
          <div className="flex-1 p-2 md:w-1/6">{golfer.totalPoints}</div>
          <div className="flex-1 p-2 md:w-1/6">{golfer.totalScore}</div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default LeaderboardOverall;