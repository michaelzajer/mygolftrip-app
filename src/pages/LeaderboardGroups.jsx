import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const LeaderBoardGroups = () => {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const tripsCollectionRef = collection(db, 'golfTrips');
      const tripsSnapshot = await getDocs(tripsCollectionRef);

      const tripsData = await Promise.all(
        tripsSnapshot.docs.map(async (tripDoc) => {
          const groupsCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups`);
          const groupsSnapshot = await getDocs(groupsCollectionRef);

          let groupsData = await Promise.all(
            groupsSnapshot.docs.map(async (groupDoc) => {
              const groupDate = groupDoc.data().groupDate ? new Date(groupDoc.data().groupDate) : new Date(0);

              const groupData = {
                id: groupDoc.id,
                groupName: groupDoc.data().groupName,
                groupDate: groupDate,
                golfers: [],
              };

              const leaderboardRef = collection(db, `golfTrips/${tripDoc.id}/groups/${groupDoc.id}/leaderboard`);
              const leaderboardSnapshot = await getDocs(leaderboardRef);

              if (!leaderboardSnapshot.empty) {
                groupData.golfers = leaderboardSnapshot.docs.map(doc => {
                  const leaderboardData = doc.data();
                  return {
                    ...leaderboardData,
                    groupDate: leaderboardData.groupDate ? new Date(leaderboardData.groupDate) : groupDate,
                  };
                });
              } else {
                const golfersCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups/${groupDoc.id}/golfers`);
                const golfersSnapshot = await getDocs(golfersCollectionRef);
                groupData.golfers = golfersSnapshot.docs.map(golferDoc => ({
                  golferName: golferDoc.data().golferName,
                  dailyHandicap: 0,
                  gaHandicap: 0,
                  totalPoints: 0,
                  totalScore: 0,
                  groupDate: groupDate,
                }));
              }

              return groupData;
            })
          );

          groupsData.sort((a, b) => a.groupDate - b.groupDate);

          return {
            id: tripDoc.id,
            ...tripDoc.data(),
            groups: groupsData,
          };
        })
      );

      setTrips(tripsData);
    };

    fetchTrips();
  }, []);

  return (
    <div className="container mx-auto max-w-6xl">
      {trips.map((trip) => (
        <div key={trip.id} className="mb-8 bg-white shadow overflow-hidden rounded-lg">
          {trip.groups.map(group => (
            <div key={group.id} className="mt-4">
              <div className="mb-1">
                <span className="flex text-pink-100 text-xs sm:text-sm justify-between text-center">{group.groupDate.toLocaleDateString()} - {group.groupName}</span>
              </div>
              <div className="grid grid-cols-12 gap-4 text-xs sm:text-sm">
                <div className="col-span-2 rounded bg-blue-100 text-yellow-100 py-1 px-4">Golfer Name</div>
                <div className="col-span-2 rounded bg-blue-100 text-yellow-100 py-1 px-4">Group Name</div>
                <div className="col-span-2 rounded bg-blue-100 text-yellow-100 py-1 px-4">GA Handicap</div>
                <div className="col-span-2 rounded bg-blue-100 text-yellow-100 py-1 px-4">Daily Handicap</div>
                <div className="col-span-2 rounded bg-blue-100 text-yellow-100 py-1 px-4">Points</div>
                <div className="col-span-2 rounded bg-blue-100 text-yellow-100 py-1 px-4">Score</div>
              </div>
              {group.golfers.map(golfer => (
                <div key={golfer.golferId} className="grid grid-cols-12 gap-4 bg-bground-100 text-xs sm:text-sm">
                  <div className="col-span-2 py-1 px-4">{golfer.golferName}</div>
                  <div className="col-span-2 py-1 px-4">{group.groupName}</div>
                  <div className="col-span-2 py-1 px-4">{golfer.gaHandicap}</div>
                  <div className="col-span-2 py-1 px-4">{golfer.dailyHandicap}</div>
                  <div className="col-span-2 py-1 px-4">{golfer.totalPoints}</div>
                  <div className="col-span-2 py-1 px-4">{golfer.totalScore}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default LeaderBoardGroups;