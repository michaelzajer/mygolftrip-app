import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const DaysPairs = () => {
  const [loading, setLoading] = useState(true);
  const [daysPairs, setDaysPairs] = useState([]);
  const [golferNames, setGolferNames] = useState({});

  useEffect(() => {
    const auth = getAuth();
    const golferId = auth.currentUser?.uid;

    const fetchGolferNames = async (golferIds) => {
      const names = {};
      for (const id of golferIds) {
        const golferRef = doc(db, 'golfers', id);
        const golferSnap = await getDoc(golferRef);
        names[id] = golferSnap.exists() ? golferSnap.data().name : 'Unknown Golfer';
      }
      return names;
    };

    const fetchDaysPairs = async () => {
      if (!golferId) {
        console.error('Golfer ID not found');
        setLoading(false);
        return;
      }

      try {
        const tripsSnapshot = await getDocs(collection(db, 'golfTrips'));
        let found = false;

        for (const tripDoc of tripsSnapshot.docs) {
          const golferRef = doc(db, 'golfTrips', tripDoc.id, 'golfers', golferId);
          const golferSnap = await getDoc(golferRef);

          if (golferSnap.exists()) {
            found = true;
            const golfTripId = tripDoc.id;
            const daysCollectionRef = collection(db, `golfTrips/${golfTripId}/Days`);
            const daysSnapshot = await getDocs(daysCollectionRef);

            let allGolferIds = [];
            const daysPairsData = await Promise.all(daysSnapshot.docs.map(async (dayDoc) => {
              const pairsCollectionRef = collection(db, `golfTrips/${golfTripId}/Days/${dayDoc.id}/Pairs`);
              const pairsSnapshot = await getDocs(pairsCollectionRef);
              const pairsData = [];

              for (const pairDoc of pairsSnapshot.docs) {
                const pairData = pairDoc.data();
                const golferTeams = pairData.golfers.reduce((acc, golfer) => {
                  // Use golfer.teamName as key for accumulator
                  const teamKey = golfer.teamName;
                  if (!acc[teamKey]) {
                    acc[teamKey] = {
                      golfers: [],
                      totalPoints: 0,
                      totalScore: 0
                    };
                  }
                  acc[teamKey].golfers.push({
                    id: golfer.id,
                    totalPoints: golfer.totalPoints,
                    totalScore: golfer.totalScore
                  });
                  acc[teamKey].totalPoints += golfer.totalPoints;
                  acc[teamKey].totalScore += golfer.totalScore;
                  allGolferIds.push(golfer.id); // Collect all golfer IDs
                  return acc;
                }, {});
                
                const teamsArray = Object.keys(golferTeams).map(teamKey => ({
                  teamName: teamKey,
                  golfers: golferTeams[teamKey].golfers,
                  totalPoints: golferTeams[teamKey].totalPoints,
                  totalScore: golferTeams[teamKey].totalScore
                }));

                pairsData.push({
                  dayId: dayDoc.id,
                  pairs: teamsArray,
                });
              }

              const dayData = dayDoc.data();
              const dayDateObject = new Date(dayData.date);
              const formattedDate = dayDateObject.toLocaleDateString('en-AU');

              return {
                day: formattedDate,
                dayNo: dayData.dayNo,
                pairsData: pairsData
              };
            }));

            setDaysPairs(daysPairsData);
            const uniqueGolferIds = [...new Set(allGolferIds)]; // Remove duplicates
            const names = await fetchGolferNames(uniqueGolferIds); // Fetch golfer names in bulk
            setGolferNames(names);
            break; // Found the golfer's trip, exit the loop
          }
        }

        if (!found) {
          console.error('Golfer trip not found for golfer ID:', golferId);
        }
      } catch (error) {
        console.error('Error fetching days and pairs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDaysPairs();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center px-6 py-12 bg-background-100">
      <div className="w-full max-w-7xl">
        {daysPairs.map((dayPair, dayIndex) => (
          <div key={dayIndex} className="mb-8">
            <div className="bg-blue-500 text-white py-2 px-4 rounded-t-lg shadow-md">
              <h2 className="text-xl font-semibold text-center">Day {dayPair.dayNo} - {dayPair.day}</h2>
            </div>
            {dayPair.pairsData.map((pairData, pairIndex) => {
              // Determine which team has higher points
              const teamPoints = pairData.pairs.map(team => team.totalPoints);
              const maxPoints = Math.max(...teamPoints);
              
              return (
                <div key={pairIndex} className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pairData.pairs.map((team, teamIndex) => {
                      // Apply green background if this team has the higher points
                      const bgColor = team.totalPoints === maxPoints ? 'bg-green-500' : 'bg-white';
                      
                      return (
                        <div key={teamIndex} className={`shadow-md rounded-lg p-4 ${bgColor}`}>
                          <h3 className="text-lg font-semibold text-center mb-2 border-b pb-2">{team.teamName}</h3>
                          <div className="overflow-x-auto mt-2">
                            <table className="min-w-full leading-normal">
                              <thead>
                                <tr>
                                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Golfer
                                  </th>
                                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Points
                                  </th>
                                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Score
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {team.golfers.map((golfer, index) => (
                                  <tr key={index}>
                                    <td className="px-5 py-2 border-b border-gray-200 text-sm">
                                      {golferNames[golfer.id]}
                                    </td>
                                    <td className="px-5 py-2 border-b border-gray-200 text-sm">
                                      {golfer.totalPoints}
                                    </td>
                                    <td className="px-5 py-2 border-b border-gray-200 text-sm">
                                      {golfer.totalScore}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <p className="text-sm text-gray-600 text-center mt-3">Team Total - Points: {team.totalPoints}, Score: {team.totalScore}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DaysPairs;