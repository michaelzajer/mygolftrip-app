/*
This page is called from ./pages/Leaderboards.jsx it displays the leaderboard by date
*/
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const PRIZE_MONEY = { 
  1: 50, // 1st position prize
  2: 20  // 2nd position prize
};

const LeaderboardDate = () => {
  const [datesWithGolfers, setDatesWithGolfers] = useState([]);
  const [cttpWinners, setCttpWinners] = useState({}); // { holeNumber: golferId }

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
        scoresByDate[date].sort((a, b) => Number(b.totalPoints) - Number(a.totalPoints));
      }

      setDatesWithGolfers(scoresByDate);
    };

    fetchTrips();
  }, []);

  const handleCttpChange = (date, golferId) =>
  {
    setCttpWinners(prevCttpWinners => {
    const newCttpWinners = { ...prevCttpWinners };
    newCttpWinners[date] = golferId;
    return newCttpWinners;
    });
    };

    const getPrizeMoney = (golfer, position, date) => {
      let prize = PRIZE_MONEY[position] || 0;
      if (cttpWinners[date] === golfer.golferId) {
        prize += 10; // Add $10 for CTTP winner
      }
      return prize > 0 ? `$${prize}` : '-';
    };

  return (
    <div className="container mx-auto max-w-6xl">
      {Object.entries(datesWithGolfers)?.sort().map(([date, golfers]) => (
        <div key={date} className="mb-1 bg-bground-100 shadow overflow-hidden rounded-lg">
          <h2 className="text-sm font-semibold px-2 text-pink-100">{date}</h2>
          <div className="grid grid-cols-10 text-xs sm:text-sm">
            <div className="col-span-2 bg-blue-100 text-yellow-100 py-1 px-4">Golfer Name</div>
            <div className="col-span-1 bg-blue-100 text-yellow-100 py-1 px-4">Prize Money</div>
            <div className="col-span-1 bg-blue-100 text-yellow-100 py-1 px-4">GA Hcp</div>
            <div className="col-span-1 bg-blue-100 text-yellow-100 py-1 px-4">CTTP</div>
            <div className="col-span-1 bg-blue-100 text-yellow-100 py-1 px-4">Daily Hcp</div>
            <div className="col-span-2 bg-blue-100 text-yellow-100 py-1 px-4">Points</div>
            <div className="col-span-2 bg-blue-100 text-yellow-100 py-1 px-4">Score</div>
          </div>
          {golfers.map((golfer, index) => (
            <div key={golfer.golferId} className="grid grid-cols-10 gap-4 bg-white text-xs sm:text-sm">
              <p className="col-span-2 py-2 px-4">{golfer.golferName}</p>
              <p className="col-span-1 py-2 px-4">{getPrizeMoney(golfer, index + 1, date)}</p>
              <p className="col-span-1 py-2 px-4">{golfer.gaHandicap}</p>
              <input
              type="checkbox"
              className="col-span-1"
              checked={cttpWinners[date] === golfer.golferId}
              onChange={() => handleCttpChange(date, golfer.golferId)}
            />
              <p className="col-span-1 py-2 px-4">{golfer.dailyHandicap}</p>
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
