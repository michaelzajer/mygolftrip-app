// LeaderboardDate.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const LeaderboardDate = () => {
  const [datesWithGolfers, setDatesWithGolfers] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const tripsCollectionRef = collection(db, 'golfTrips');
      const tripsSnapshot = await getDocs(tripsCollectionRef);
      let allGolfers = [];

      for (let tripDoc of tripsSnapshot.docs) {
        const groupsCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups`);
        const groupsSnapshot = await getDocs(groupsCollectionRef);
        
        for (let groupDoc of groupsSnapshot.docs) {
          const groupData = groupDoc.data();
          const groupDate = groupData.groupDate ? new Date(groupData.groupDate) : new Date(0); // Epoch if no date

          const leaderboardRef = collection(db, `golfTrips/${tripDoc.id}/groups/${groupDoc.id}/leaderboard`);
          const leaderboardSnapshot = await getDocs(leaderboardRef);

          if (!leaderboardSnapshot.empty) {
            allGolfers = allGolfers.concat(leaderboardSnapshot.docs.map(doc => {
              const leaderboardData = doc.data();
              return {
                ...leaderboardData,
                groupDate: leaderboardData.groupDate ? new Date(leaderboardData.groupDate) : groupDate,
              };
            }));
          } else {
            const golfersCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups/${groupDoc.id}/golfers`);
            const golfersSnapshot = await getDocs(golfersCollectionRef);
            allGolfers = allGolfers.concat(golfersSnapshot.docs.map(golferDoc => {
              const golferData = golferDoc.data();
              return {
                ...golferData,
                groupDate: groupDate, // Store the Date object
                golferId: golferDoc.id, // Assuming each golfer has a unique ID
                totalScore: 0, // Default score if no leaderboard data
                gaHandicap: 0,
                dailyHandicap: 0,
                totalPoints: 0,
              };
            }));
          }
        }
      }

      // Sort all golfers by date
      allGolfers.sort((a, b) => a.groupDate - b.groupDate);

      // Then sort by score within each date
      let scoresByDate = allGolfers.reduce((acc, golfer) => {
        const dateStr = golfer.groupDate.toLocaleDateString();
        if (!acc[dateStr]) {
          acc[dateStr] = [];
        }
        acc[dateStr].push(golfer);
        return acc;
      }, {});

      for (const date in scoresByDate) {
        scoresByDate[date].sort((a, b) => Number(b.totalScore) - Number(a.totalScore));
      }

      setDatesWithGolfers(scoresByDate);
    };

    fetchTrips();
  }, []);

  return (
    <div className="container mx-auto max-w-6xl">
      {Object.entries(datesWithGolfers)?.sort().map(([date, golfers]) => (
        <div key={date} className="mb-1 bg-bground-100 shadow overflow-hidden rounded-lg">
          <h2 className="text-sm font-semibold px-2 text-pink-100">{date}</h2>
          <div className="grid grid-cols-12 text-xs sm:text-sm">
            <div className="col-span-2 bg-blue-100 text-yellow-100 py-1 px-4">Golfer Name</div>
            <div className="col-span-2 bg-blue-100 text-yellow-100 py-1 px-4">GA Hcp</div>
            <div className="col-span-2 bg-blue-100 text-yellow-100 py-1 px-4">Daily Hcp</div>
            <div className="col-span-2 bg-blue-100 text-yellow-100 py-1 px-4">Points</div>
            <div className="col-span-2 bg-blue-100 text-yellow-100 py-1 px-4">Score</div>
          </div>
          {golfers.map(golfer => (
            <div key={golfer.golferId} className="grid grid-cols-12 gap-4 bg-white text-xs sm:text-sm">
              <p className="col-span-2 py-2 px-4">{golfer.golferName}</p>
              <p className="col-span-2 py-2 px-4">{golfer.gaHandicap}</p>
              <p className="col-span-2 py-2 px-4">{golfer.dailyHandicap}</p>
              <p className="col-span-2 py-2 px-4">{golfer.totalPoints}</p>
              <p className="col-span-2 py-2 px-4">{golfer.totalScore}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default LeaderboardDate;
