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
    <div>
      {leaderboardData.map((day, index) => (
        <div key={index} className="my-4 p-4 shadow rounded">
          <h2 className="text-xl font-semibold">Day {day.dayNo} Pairs - {day.date}</h2>
          <table className="min-w-full mt-2">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Pair</th>
                <th>Total Points</th>
                <th>Prize Money</th>
              </tr>
            </thead>
            <tbody>
              {day.pairs.map((pair, pairIndex) => (
                <tr key={pair.golfers.map(golfer => golfer.id).join('-')}>
                  <td>{pairIndex + 1}</td>
                  <td>{pair.teamName}</td>
                  <td>{pair.golfers.map(golfer => golferNames[golfer.id] || 'Unknown').join(' & ')}</td>
                  <td>{pair.totalPoints}</td>
                  <td>{getPrizeMoney(pairIndex + 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default LeaderboardPairsByDay;