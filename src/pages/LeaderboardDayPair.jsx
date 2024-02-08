import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const LeaderboardPairsByDay = () => {
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [golferNames, setGolferNames] = useState({});
  const PRIZE_MONEY = { 1: 30, 2: 20 }; // Prize money for 1st and 2nd per pair
  

  useEffect(() => {
    const fetchGolferNames = async (golferIds) => {
      const names = {};
      for (const id of golferIds) {
        const golferRef = doc(db, 'golfers', id);
        const golferSnap = await getDoc(golferRef);
        if (golferSnap.exists()) {
          names[id] = golferSnap.data().name;
        } else {
          names[id] = 'Unknown Golfer';
        }
      }
      setGolferNames(names);
    };

    const fetchLeaderboardData = async () => {
      const golfTripsRef = collection(db, 'golfTrips');
      const golfTripsSnapshot = await getDocs(golfTripsRef);
      let allGolferIds = new Set();
      let tempLeaderboardData = [];
      let newLeaderboardData = []; // Temporarily hold new data here


      for (const tripDoc of golfTripsSnapshot.docs) {
        const daysRef = collection(db, `golfTrips/${tripDoc.id}/Days`);
        const daysSnapshot = await getDocs(daysRef);

        for (const dayDoc of daysSnapshot.docs) {
          const pairsRef = collection(db, `golfTrips/${tripDoc.id}/Days/${dayDoc.id}/Pairs`);
          const pairsSnapshot = await getDocs(pairsRef);
          let dayPairs = [];

          pairsSnapshot.forEach(pairDoc => {
            const pairData = pairDoc.data();
            pairData.golfers.forEach(golfer => allGolferIds.add(golfer.id));

            const pairsByTeam = pairData.golfers.reduce((acc, golfer) => {
              const team = acc[golfer.teamName] || {
                teamName: golfer.teamName,
                golfers: [],
                totalPoints: 0
              };
              team.golfers.push(golfer);
              team.totalPoints += golfer.totalPoints;
              acc[golfer.teamName] = team;
              return acc;
            }, {});

            dayPairs.push(...Object.values(pairsByTeam));
          });


          
          dayPairs.sort((a, b) => b.totalPoints - a.totalPoints);
          tempLeaderboardData.push({
            date: dayDoc.data().date,
            dayNo: dayDoc.data().dayNo,
            pairs: dayPairs
          });

          newLeaderboardData.push({
            date: dayDoc.data().date,
            dayNo: dayDoc.data().dayNo,
            pairs: dayPairs
          });
    
        }
      }



      setLeaderboardData(newLeaderboardData);
      await fetchGolferNames([...allGolferIds]);
      setLoading(false);
    };

    fetchLeaderboardData();
  }, []);

  const getPrizeMoney = (rank) => {
    return PRIZE_MONEY[rank] ? `$${PRIZE_MONEY[rank]}` : '$0';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-6xl">
      {leaderboardData.map((day, index) => (
        <div key={index} className="mb-1 bg-bground-100 shadow overflow-hidden rounded-lg">
          <div className="text-sm font-semibold px-2 text-pink-100">
            Day {day.dayNo} Pairs - {day.date}
          </div>
          <div className="min-w-full leading-normal">
            <div className="grid grid-cols-5 gap-4 px-5 py-3  bg-blue-100 text-yellow-100 text-xs font-semibold uppercase tracking-wider">
              <p>Rank</p>
              <p>Team</p>
              <p>Pair</p>
              <p>Total Points</p>
              <p>Prize Money</p>
            </div>
            {day.pairs.map((pair, pairIndex) => (
              <div key={pair.golfers.map(golfer => golfer.id).join('-')} className="grid grid-cols-5 gap-4 bg-white px-5 py-5 border-b border-gray-200 text-sm">
                <p>{pairIndex + 1}</p>
                <p>{pair.teamName}</p>
                <p>{pair.golfers.map(golfer => golferNames[golfer.id] || 'Unknown').join(' & ')}</p>
                <p>{pair.totalPoints}</p>
                <p>{getPrizeMoney(pairIndex + 1)}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaderboardPairsByDay;