// LeaderboardOverall.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import moment from 'moment';

const LeaderboardOverall = () => {
  const [golfers, setGolfers] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const tripsCollectionRef = collection(db, 'golfTrips');
      const tripsSnapshot = await getDocs(tripsCollectionRef);
      let allGolfers = [];
  
      for (let tripDoc of tripsSnapshot.docs) {
        const groupsCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups`);
        const groupsSnapshot = await getDocs(groupsCollectionRef);
        
        for (let groupDoc of groupsSnapshot.docs) {
          const golfersCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups/${groupDoc.id}/golfers`);
          const golfersSnapshot = await getDocs(golfersCollectionRef);
          
          for (let golferDoc of golfersSnapshot.docs) {
            const golferData = golferDoc.data();
            // Here we use Moment.js to format the date
            const formattedDate = moment(groupDoc.data().groupDate).format('ddd - DD-MM-YY');
            allGolfers.push({
              ...golferData,
              groupName: groupDoc.data().groupName,
              groupDate: formattedDate, // Formatted date is used here
              golferId: golferDoc.id,
            });
          }
        }
      }
  
      allGolfers.sort((a, b) => Number(b.score) - Number(a.score));
      setGolfers(allGolfers);
    };
  
    fetchTrips();
  }, []);

  return (
    <div className="container mx-auto max-w-6xl ">
      <div className="mb-1 bg-white shadow overflow-hidden rounded-lg">
        <div className="grid grid-cols-12 gap-4 bg-blue-500 text-white p-4">
          <p className="col-span-3">Golfer Name</p>
          <p className="col-span-3">Group Name</p>
          <p className="col-span-3">Score</p>
          <p className="col-span-3">Date</p>
          {/* Add any additional headers */}
        </div>
        {golfers.map(golfer => (
          <div key={golfer.golferId} className="grid grid-cols-12 gap-4 bg-white p-4">
            <p className="col-span-3">{golfer.golferName}</p>
            <p className="col-span-3">{golfer.groupName}</p>
            <p className="col-span-3">{golfer.score}</p>
            <p className="col-span-3">{golfer.groupDate}</p>
            {/* Add any additional golfer info */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardOverall;