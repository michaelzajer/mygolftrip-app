import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const LeaderboardTeam = () => {
  const [loading, setLoading] = useState(true);
  const [dailyWinners, setDailyWinners] = useState([]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      const golfTripsRef = collection(db, 'golfTrips');
      const golfTripsSnapshot = await getDocs(golfTripsRef);

      let dailyResults = [];

      for (const tripDoc of golfTripsSnapshot.docs) {
        const daysRef = collection(db, `golfTrips/${tripDoc.id}/Days`);
        const daysSnapshot = await getDocs(daysRef);

        for (const dayDoc of daysSnapshot.docs) {
          let teamPointsMap = new Map();
          const pairsRef = collection(db, `golfTrips/${tripDoc.id}/Days/${dayDoc.id}/Pairs`);
          const pairsSnapshot = await getDocs(pairsRef);

          pairsSnapshot.forEach(pairDoc => {
            const pairData = pairDoc.data();
            pairData.golfers.forEach(golfer => {
              const currentPoints = teamPointsMap.get(golfer.teamName) || 0;
              teamPointsMap.set(golfer.teamName, currentPoints + golfer.totalPoints);
            });
          });

          // Convert the Map to an array and sort by total points
          const teamsArray = Array.from(teamPointsMap, ([teamName, totalPoints]) => ({
            teamName,
            totalPoints
          })).sort((a, b) => b.totalPoints - a.totalPoints);

          // Determine the winning team for the day
          if (teamsArray.length > 0) {
            teamsArray[0].prizeMoney = '$30'; // Daily winner prize
          }

          dailyResults.push({
            date: dayDoc.data().date,
            dayNo: dayDoc.data().dayNo,
            teams: teamsArray,
          });
        }
      }

      setDailyWinners(dailyResults);
      setLoading(false);
    };

    fetchLeaderboardData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-6xl">
      {dailyWinners.map((day, index) => (
        <div key={index} className="mb-1 bg-bground-100 shadow overflow-hidden rounded-lg">
          <h3 className="text-sm font-semibold px-2 text-pink-100">Day {day.dayNo} - {day.date}</h3>
          <div className="min-w-full leading-normal">
            <div className="grid grid-cols-5 gap-4 px-5 py-3  bg-blue-100 text-yellow-100 text-xs font-semibold uppercase tracking-wider">
                <p>Rank</p>
                <p>Team</p>
                <p>Total Points</p>
                <p>Prize Money</p>
            </div>
              {day.teams.map((team, teamIndex) => (
                <div key={teamIndex} className="grid grid-cols-5 gap-4 bg-white px-5 py-5 border-b border-gray-200 text-sm">
                  <p>{teamIndex + 1}</p>
                  <p>{team.teamName}</p>
                  <p>{team.totalPoints}</p>
                  <p>{teamIndex === 0 ? team.prizeMoney : '$0'}</p>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaderboardTeam;