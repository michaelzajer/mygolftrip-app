import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Adjust this path to point to your firebase configuration
import { collection, getDocs} from 'firebase/firestore';

const LeaderBoardGroups = () => {
  const [trips, setTrips] = useState([]);
  const [golfers, setGolfers] = useState([]);

  useEffect(() => {
    // Fetch the list of golfers
    const fetchGolfers = async () => {
      const golfersSnapshot = await getDocs(collection(db, 'golfers'));
      setGolfers(golfersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchGolfers();

    // Fetch the list of trips and groups
   // Fetch the list of trips and groups
  const fetchTrips = async () => {
  const tripsCollectionRef = collection(db, 'golfTrips');
  const tripsSnapshot = await getDocs(tripsCollectionRef);
  const tripsData = await Promise.all(
    tripsSnapshot.docs.map(async (tripDoc) => {
      const groupsCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups`);
      const groupsSnapshot = await getDocs(groupsCollectionRef);

      // Map and sort groups by date
      const groupsData = groupsSnapshot.docs.map(groupDoc => {
        const groupData = groupDoc.data();
        return {
          id: groupDoc.id,
          ...groupData,
          // Parse groupDate as Date object if it exists and is a valid date string
          groupDate: groupData.groupDate ? new Date(groupData.groupDate) : null,
        };
      }).sort((a, b) => {
        // Move items with null groupDate to the end
        if (!a.groupDate) return 1;
        if (!b.groupDate) return -1;
        // Sort by groupDate ascending
        return a.groupDate - b.groupDate;
      });

      // Fetch and sort golfers for each group
      const groupsWithGolfers = await Promise.all(groupsData.map(async (group) => {
        const golfersCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups/${group.id}/golfers`);
        const golfersSnapshot = await getDocs(golfersCollectionRef);
        let golfersData = golfersSnapshot.docs.map(golferDoc => ({ ...golferDoc.data(), id: golferDoc.id }));

        // Sort golfers by score in descending order
        golfersData.sort((a, b) => {
          // Convert scores to numbers since they might be stored as strings
          const scoreA = Number(a.score);
          const scoreB = Number(b.score);

          // Handle null or undefined scores by placing them at the end
          if (scoreA === null || scoreA === undefined) return 1;
          if (scoreB === null || scoreB === undefined) return -1;

          return scoreB - scoreA; // For descending order
        });

        return {
          ...group,
          golfers: golfersData,
        };
      }));

      return {
        id: tripDoc.id,
        ...tripDoc.data(),
        groups: groupsWithGolfers,
      };
    })
  );

  setTrips(tripsData);
};

fetchTrips();

  }, []);

  return (
    <div className="container mx-auto max-w-6xl ">
      {trips.map((trip) => (
        <div key={trip.id} className="mb-8 bg-white shadow overflow-hidden rounded-lg">
          {trip.groups.map(group => (
            <div key={group.id} className="mt-4">
              <div className="mb-2">
                <span className="">{group.groupDate ? group.groupDate.toLocaleDateString() : 'N/A'}</span>
                <span> - {group.groupName}</span>
              </div>
              <div className="grid grid-cols-8 gap-4">
                <div className="col-span-2  bg-blue-500 text-white py-1 px-4">Golfer Name</div>
                <div className="col-span-2  bg-blue-500 text-white py-1 px-4">Group Name</div>
                <div className="col-span-2  bg-blue-500 text-white py-1 px-4">Daily Handicap</div>
                <div className="col-span-2  bg-blue-500 text-white py-1 px-4">Score</div>
              </div>
              {group.golfers.map(golfer => (
                <div key={golfer.id} className="grid grid-cols-8 gap-4 bg-white">
                  <div className="col-span-2 py-1 px-4">{golfer.golferName}</div>
                  <div className="col-span-2 py-1 px-4">{group.groupName}</div>
                  <div className="col-span-2 py-1 px-4">{golfer.dailyHcp}</div>
                  <div className="col-span-2 py-1 px-4">{golfer.score}</div>
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
