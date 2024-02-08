import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const LeaderboardTeamPoints = () => {
  const [teamPoints, setTeamPoints] = useState([]);

  const getPointsForDay = (dayNo) => {
    const pointsMap = { '1': 1, '2': 2, '3': 2, '4': 3 };
    return pointsMap[dayNo] || 0;
  };

  useEffect(() => {
    const fetchAndCalculateTeamPoints = async () => {
      const golfTripsRef = collection(db, 'golfTrips');
      const snapshot = await getDocs(golfTripsRef);
      let allDaysResults = [];

      for (const tripDoc of snapshot.docs) {
        const daysRef = collection(db, `golfTrips/${tripDoc.id}/Days`);
        const daysSnapshot = await getDocs(daysRef);

        for (const dayDoc of daysSnapshot.docs) {
          let dailyResults = {}; // Store daily results for each team

          const pairsRef = collection(db, `golfTrips/${tripDoc.id}/Days/${dayDoc.id}/Pairs`);
          const pairsSnapshot = await getDocs(pairsRef);

          pairsSnapshot.forEach(pairDoc => {
            const pairData = pairDoc.data();
            // Find the team with the highest score in this pair
            const winningTeam = pairData.golfers.reduce((acc, golfer) => {
              return (!acc || golfer.totalPoints > acc.totalPoints) ? golfer : acc;
            }, null);
            
            // If we have a winning team, add the points to their daily results
            if (winningTeam) {
              const points = getPointsForDay(dayDoc.data().dayNo);
              dailyResults[winningTeam.teamName] = (dailyResults[winningTeam.teamName] || 0) + points;
            }
          });

          // Push the day's results to the allDaysResults array
          allDaysResults.push({
            dayNo: dayDoc.data().dayNo,
            date: dayDoc.data().date,
            teams: Object.entries(dailyResults).map(([teamName, points]) => ({
              teamName,
              points
            }))
          });
        }
      }

      // Sort by day number
      allDaysResults.sort((a, b) => a.dayNo - b.dayNo);
      setTeamPoints(allDaysResults);
    };

    fetchAndCalculateTeamPoints();
  }, []);

  return (
    <div className="container mx-auto max-w-6xl">
      {teamPoints.map((dayResult, index) => (
        <div key={index} className="mb-6 shadow-lg rounded-lg overflow-hidden">
          <div className="text-sm font-semibold px-2 text-pink-100">
            Day {dayResult.dayNo} ({dayResult.date})
          </div>
          <div className="grid grid-cols-2 text-xs sm:text-sm font-semibold px-2 py-2 bg-blue-100 text-yellow-100 tracking-wider">
            <div>Team</div>
            <div>Points Awarded</div>
          </div>
          {dayResult.teams.map((team, teamIndex) => (
            <div key={teamIndex} className="grid grid-cols-2 text-sm px-2 py-2 bg-white">
              <div>{team.teamName}</div>
              <div>{team.points}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default LeaderboardTeamPoints;