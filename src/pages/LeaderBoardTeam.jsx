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
    <div>
      <h2 className="text-xl font-semibold">Team Leaderboard</h2>
      {dailyWinners.map((day, index) => (
        <div key={index} className="my-4 p-4 shadow rounded">
          <h3 className="text-lg font-semibold">Leaderboard for Day {day.dayNo} - {day.date}</h3>
          <table className="min-w-full mt-2">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Total Points</th>
                <th>Prize Money</th>
              </tr>
            </thead>
            <tbody>
              {day.teams.map((team, teamIndex) => (
                <tr key={teamIndex}>
                  <td>{teamIndex + 1}</td>
                  <td>{team.teamName}</td>
                  <td>{team.totalPoints}</td>
                  <td>{teamIndex === 0 ? team.prizeMoney : '$0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default LeaderboardTeam;