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
          
          const golfersCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups/${groupDoc.id}/golfers`);
          const golfersSnapshot = await getDocs(golfersCollectionRef);
          
          for (let golferDoc of golfersSnapshot.docs) {
            const golferData = golferDoc.data();
            allGolfers.push({
              ...golferData,
              groupDate: groupDate, // Store the Date object
              golferId: golferDoc.id, // Assuming each golfer has a unique ID
            });
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
        scoresByDate[date].sort((a, b) => Number(b.score) - Number(a.score));
      }

      setDatesWithGolfers(scoresByDate);
    };

    fetchTrips();
  }, []);

  return (
    <div className="container mx-auto max-w-6xl ">
      {Object.entries(datesWithGolfers)?.sort().map(([date, golfers]) => (
        <div key={date} className="mb-1 bg-white shadow overflow-hidden rounded-lg">
          <h2 className="text-sm font-semibold px-2">{date}</h2>
          <div className="grid grid-cols-12">
            <div className="col-span-3 bg-blue-500 text-white py-1 px-4">Golfer Name</div>
            <div className="col-span-2 bg-blue-500 text-white py-1 px-4">Score</div>
          </div>
          {golfers.map(golfer => (
            <div key={golfer.golferId} className="grid grid-cols-12 gap-4 bg-white">
              <p className="col-span-3 py-2 px-4">{golfer.golferName}</p>
              <p className="col-span-2 py-2 px-4">{golfer.score}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default LeaderboardDate;
