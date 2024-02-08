import React, { useState} from 'react';
import { getAuth } from 'firebase/auth';
import moment from 'moment';
import GolferProfile from '../components/GolferProfile';
import GolferTeam from '../components/GolferTeam';
import ScoreCardDisplay from '../components/ScoreCardDisplay';
import { db } from '../firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useGolferTripsAndTeams } from '../hooks/useGoflerTripsAndTeams';

const MyTrips = () => {
    const auth = getAuth();
    const golferId = auth.currentUser?.uid;
    const { golferDetails, trips, isLoading } = useGolferTripsAndTeams(golferId);
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [scorecardData, setScorecardData] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [selectedScorecardId, setSelectedScorecardId] = useState(null);
    const [isScorecardVisible, setIsScorecardVisible] = useState(false);

     // Helper function to generate date range buttons
    const generateDateButtons = (startDate, endDate, tripId) => {
      const start = moment(startDate);
      const end = moment(endDate);
      let dates = [];

      while (start.diff(end) <= 0) {
          dates.push(start.clone());
          start.add(1, 'days');
      }

        return (
            <div className="flex justify-center space-x-1 mt-2">
                {dates.map((date, index) => (
                    <button
                        key={date.format('YYYY-MM-DD')}
                        className="bg-blue-100 hover:bg-yellow-100 hover:text-blue-100 
                        text-white text-xs py-1 px-1 rounded border border-pink-100 
                        flex flex-col items-center"
                        onClick={() => handleDateClick(date.format('YYYY-MM-DD'), tripId)}
                    >
                        <span className="font-semibold">{`Day ${index + 1}`}</span>
                        {date.format('ddd, DD - MM')}
                    </button>
                ))}
            </div>
        );
    };

    async function fetchScorecardDataForDate(date, golferId, tripId) {
      const groupRef = collection(db, `golfTrips/${tripId}/groups`);
      const q = query(groupRef, where("groupDate", "==", date));
      let scorecardsDataWithGroupIds = [];
  
      try {
          const groupSnapshot = await getDocs(q);
          for (const groupDoc of groupSnapshot.docs) {
              const golferRef = doc(db, `golfTrips/${tripId}/groups/${groupDoc.id}/golfers`, golferId);
              const golferDoc = await getDoc(golferRef);
              if (golferDoc.exists()) {
                  const scorecardRef = collection(golferRef, "scorecards");
                  const scorecardQuery = query(scorecardRef, where("groupDate", "==", date));
                  const scorecardSnapshot = await getDocs(scorecardQuery);
                  const scorecardDoc = scorecardSnapshot.docs[0];
                  if (scorecardDoc) {
                      scorecardsDataWithGroupIds.push({
                          scorecardData: scorecardDoc.data(),
                          groupId: groupDoc.id,
                          scorecardId: scorecardDoc.id // Include the scorecard ID here
                      });
                  }
              }
          }
          return scorecardsDataWithGroupIds;
      } catch (error) {
          console.error("Error fetching scorecard:", error);
          return [];
      }
  }
    
  const handleDateClick = async (date, tripId) => {
    // Keep the original variable name as per your code structure
    const scorecardsData = await fetchScorecardDataForDate(date, golferId, tripId);
    
    console.log("Date clicked:", date);
    console.log("Trip ID:", tripId);
    console.log("Scorecards Data:", scorecardsData);

    if (scorecardsData && scorecardsData.length > 0) {
        const groupId = scorecardsData[0].groupId;
        const scorecardId = scorecardsData[0].scorecardId; // Correctly extract scorecardId here
    
        setScorecardData(scorecardsData[0].scorecardData);
        setSelectedGroupId(groupId);
        setSelectedTripId(tripId);
        setSelectedScorecardId(scorecardId); // Use the extracted scorecardId
        setIsScorecardVisible(true);
    } else {
        console.log("No scorecard data found for the selected date.");
    }
};

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const closeScorecard = () => {
        setIsScorecardVisible(false);
      };

    return (
        <div className="container mx-auto p-4">
            {isScorecardVisible ? (
                <ScoreCardDisplay
                    scorecardData={scorecardData}
                    tripId={selectedTripId}
                    groupId={selectedGroupId}
                    golferId={golferId}
                    scorecardId={selectedScorecardId}
                    onClose={closeScorecard}
                />
            ) : (
                <>
                    <GolferProfile golferDetails={golferDetails} isLoading={isLoading} />
                    {trips.map(trip => {
                        const dateButtons = generateDateButtons(trip.tripStartDate, trip.tripEndDate, trip.id);
                        const tripTeam = trip.teamData;
                        return (
                            <div key={trip.id} className="border border-blue-100 bg-bground-100 p-4 rounded-lg text-center pt-3">
                                <h3 className="text-md font-bold text-center text-blue-100">{trip.golfTripName}</h3>
                                <p className='text-md mt-2 text-center text-pink-100'>
                                    {trip.tripStartDate} to {trip.tripEndDate}
                                </p>
                                {tripTeam && <GolferTeam teamName={tripTeam.teamName} teamMembers={tripTeam.teamMembers} />}
                                <div className="flex flex-wrap gap-2 mt-4 justify-center">{dateButtons}</div>
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );
};

export default MyTrips;