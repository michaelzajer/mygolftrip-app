import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import moment from 'moment';
import ScoreCard from './ScoreCard';
import ViewRound from './ViewRound';

const DateDetails = ({ selectedDate, onHideLeftComponent, onShowLeftComponent }) => {
  const [dateDetails, setDateDetails] = useState([]);
  const auth = getAuth();
  const golferId = auth.currentUser?.uid;
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [activeScorecardInfo, setActiveScorecardInfo] = useState({ groupId: null, golferId: null, golfTripId: null });
  const [viewRoundOpen, setViewRoundOpen] = useState(false);

  useEffect(() => {
    const fetchDateDetails = async () => {
      if (!selectedDate) return;
  
      const formattedDate = moment(selectedDate, 'ddd, DD-MM-YY').format('ddd - DD-MM-YY');
      const tripsSnapshot = await getDocs(collection(db, 'golfTrips'));
      let details = [];
  
      for (const tripDoc of tripsSnapshot.docs) {
        const groupsCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups`);
        const groupsSnapshot = await getDocs(groupsCollectionRef);
  
        for (const groupDoc of groupsSnapshot.docs) {
          const groupData = groupDoc.data();
          const groupFormattedDate = moment(groupData.groupDate).format('ddd - DD-MM-YY');
  
          if (groupFormattedDate === formattedDate) {
            const golfersCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups/${groupDoc.id}/golfers`);
            const golfersSnapshot = await getDocs(golfersCollectionRef);
  
            let golfers = [];
            for (const golferDoc of golfersSnapshot.docs) {
              let golferScore = 0; // Default score
              let golferDailyHcp = 0; // Default handicap
              let golferGaHcp = 0;
              let golferStableFordPoints = 0;
  
              const scorecardsRef = collection(db, `golfTrips/${tripDoc.id}/groups/${groupDoc.id}/golfers/${golferDoc.id}/scorecards`);
              const scorecardsSnapshot = await getDocs(scorecardsRef);
  
              // Find the scorecard with a matching groupDate, assuming that's the identifier for the current round
              const scorecardDoc = scorecardsSnapshot.docs.find(doc => moment(doc.data().groupDate).format('ddd - DD-MM-YY') === formattedDate);
             
              if (scorecardDoc) {
                const scorecardData = scorecardDoc.data();
                golferScore = scorecardData.totalScore || 0;
                golferDailyHcp = scorecardData.dailyHandicap || 0;
                golferGaHcp = scorecardData.gaHandicap || 0;
                golferStableFordPoints = scorecardData.totalPoints || 0;
              }
              golfers.push({
                ...golferDoc.data(),
                golferId: golferDoc.id,
                score: golferScore,
                dailyHcp: golferDailyHcp,
                gaHcp: golferGaHcp,
                stblFdPoints: golferStableFordPoints
               
              });
            }
  
            details.push({
              tripId: tripDoc.id,
              groupId: groupDoc.id,
              tripName: tripDoc.data().golfTripName,
              groupName: groupData.groupName,
              groupDate: groupFormattedDate,
              golfers: golfers,
            });
          }
        }
      }
  
      setDateDetails(details);
    };
  
    fetchDateDetails();
  }, [selectedDate]);


  const handleOpenScoreCard = (tripId, groupId, golferId) => {
    setActiveScorecardInfo({ groupId, golferId, golfTripId: tripId });
    setShowScoreCard(true);
    onHideLeftComponent(); // Hide the left component
  };

  const handleOpenViewRound = (golfTripId, groupId, golferId, onClose) => {
    setActiveScorecardInfo({ groupId, golferId, golfTripId });
    setViewRoundOpen(true); // Set this to true to indicate that ViewRound should be opened
  };

  const handleCloseScoreCard = () => {
    setShowScoreCard(false);
    onShowLeftComponent(); // Show the left component
  };

  const handleCloseViewRound = () => {
    setViewRoundOpen(false); // This will close the ViewRound component
  };

  if (showScoreCard) {
    return (
      <ScoreCard
        dGroupId={activeScorecardInfo.groupId}
        dGolferId={activeScorecardInfo.golferId}
        golfTripId={activeScorecardInfo.golfTripId}
        onClose={handleCloseScoreCard}
      />
    );
  }

  return (
    <div>
       {viewRoundOpen ? (
        <ViewRound
          dGroupId={activeScorecardInfo.groupId}
          dGolferId={activeScorecardInfo.golferId}
          golfTripId={activeScorecardInfo.golfTripId}
          onClose={handleCloseViewRound}
        />
      ) : (
        <>
      {dateDetails.length > 0 ? (
        dateDetails.map((detail, index) => (
          <div key={index} className="mb-4">
            <div className="mt-4 bg-bground-100 shadow-lg rounded-lg">
              <div className="flex flex-wrap items-center justify-between bg-blue-100 text-yellow-100 py-2 px-4 rounded-t-lg">
                <h3 className="text-sm sm:text-m lg:text-m font-semibold">{detail.groupDate}</h3>
                <h3 className="text-sm sm:text-m lg:text-m font-semibold">{detail.groupName}</h3>
              </div>
              <div className="text-sm sm:text-sm lg:text-m font-medium text-center border-b">
                <div className="flex justify-around p-2">
                  <div className="w-2/6 px-1">Golfer Name</div>
                  <div className="w-1/6 px-1">GA Hcp</div>
                  <div className="w-1/6 px-1">Daily Hcp</div>
                  <div className="w-1/6 px-1">Strokes</div>
                  <div className="w-1/6 px-1">Points</div>
                  <div className="w-2/6 px-1">Actions</div>
                </div>
              </div>
              {detail.golfers.map(golfer => (
                <div key={golfer.golferId} className=" text-sm sm:text-sm flex items-center justify-between border-b">
                  <div className="w-2/6 text-center p-2 flex-wrap">{golfer.golferName}</div>
                  <div className="w-1/6 text-center p-2">{golfer.gaHcp}</div>
                  <div className="w-1/6 text-center p-2">{golfer.dailyHcp}</div>
                  <div className="w-1/6 text-center p-2">{golfer.score}</div>
                  <div className="w-1/6 text-center p-2">{golfer.stblFdPoints}</div>
                  <div className="w-2/6 text-center p-2 space-x-1">
                  {golfer.golferId === golferId && (
                    <button
                      onClick={() => handleOpenScoreCard(detail.tripId, detail.groupId, golfer.golferId)}
                      className="bg-blue-100 hover:bg-yellow-100 hover:text-blue-100 text-white py-1 px-2 rounded text-xs sm:px-1"
                    >
                      ScoreCard
                    </button>
                     )}
                     {golfer.golferId === golferId && (
                    <button
                      onClick={() => handleOpenViewRound(detail.tripId, detail.groupId, golfer.golferId)}
                      className="bg-blue-100 hover:bg-yellow-100 hover:text-blue-100 text-white py-1 px-2 rounded text-xs sm:px-1"
                    >
                      View Round
                    </button>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p>No details available for this date.</p>
      )}
      </>
      )}
    </div>
  );
};

export default DateDetails;