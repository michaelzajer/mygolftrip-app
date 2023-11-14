// LeaderboardsIndex.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Adjust this path to point to your firebase configuration
import { collection, getDocs} from 'firebase/firestore';
import LeaderBoardGroups from './LeaderboardGroups';
import LeaderboardDate from './LeaderboardDate';
import LeaderboardOverall from './LeaderboardOverall';

const Leaderboards = () => {
const [trips, setTrips] = useState([]);
  const [activeLeaderboard, setActiveLeaderboard] = useState('');

  useEffect(() => {
    // Fetch the list of golfers
    const fetchTrips = async () => {
      const tripsSnapshot = await getDocs(collection(db, 'golfTrips'));
      setTrips(tripsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    
    fetchTrips();

  }, []);

  const renderLeaderboard = () => {
    switch (activeLeaderboard) {
      case 'groups':
        return <LeaderBoardGroups />;
      case 'date':
        return <LeaderboardDate />;
        case 'overall':
            return <LeaderboardOverall />;
      default:
        return null; // or a welcome message, or anything you want as the default state
    }
  };

  return (
    <div className="container mx-auto p-4">
      <header className="max-w-6xl mx-auto border-b rounded-lg bg-blue-500">
        {trips?.map(trip => (
          <div key={trip.id} className="mb-2 bg-blue-500 shadow overflow-hidden rounded-lg">
            <div className="px-4 sm:px-6 border-b">
              <div className="flex flex-col items-left  bg-blue-500 text-white">
              <h2 className="text-2xl font-bold p-4 text-left">Leaderboards</h2>
                <div className="flex justify-left">
                <h2 className="text-sm font-bold  mr-4 text-white">{trip.golfTripName}</h2>
                <p className="text-sm text-white mb-1">
                {`Start Date: ${trip.tripStartDate} - End Date: ${trip.tripEndDate}`}
                </p>
              </div>
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-left space-x-10 px-6 pb-1 bg-green-400 text-white">
        <button
            onClick={() => setActiveLeaderboard('overall')}
            className="text-blue-500 hover:text-blue-100 font-semibold"
          >
            Overall
          </button>
          <button
            onClick={() => setActiveLeaderboard('date')}
            className="text-blue-500 hover:text-blue-100 font-semibold"
          >
            Date
          </button>
          <button
            onClick={() => setActiveLeaderboard('groups')}
            className="text-blue-500 hover:text-blue-100 font-semibold"
          >
            Group
          </button>
          {/* Add additional leaderboard links/buttons here */}
        </div>
      </header>
      {renderLeaderboard()}
    </div>
  );
};

export default Leaderboards;
