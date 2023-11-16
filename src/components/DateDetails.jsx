import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import moment from 'moment';
import ScoreCard from './ScoreCard';
import ViewRound from './ViewRound';

const DateDetails = ({ selectedDate }) => {
  const [dateDetails, setDateDetails] = useState([]);
  const auth = getAuth();
  const golferId = auth.currentUser?.uid;
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [activeScorecardInfo, setActiveScorecardInfo] = useState({ groupId: null, golferId: null, golfTripId: null });
  const [viewRoundOpen, setViewRoundOpen] = useState(false);

  useEffect(() => {
    const fetchDateDetails = async () => {
      if (!selectedDate) return;

      // Format the selected date once, so it can be used in the loop and in rendering
      const formattedDate = moment(selectedDate, 'ddd, DD-MM-YY').format('ddd - DD-MM-YY');
      const tripsSnapshot = await getDocs(collection(db, 'golfTrips'));
      let details = [];

      for (const tripDoc of tripsSnapshot.docs) {
        const groupsCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups`);
        const groupsSnapshot = await getDocs(groupsCollectionRef);

        for (const groupDoc of groupsSnapshot.docs) {
          const groupData = groupDoc.data();
          // Convert the group date to the same format as formattedDate before comparing
          const groupFormattedDate = moment(groupData.groupDate).format('ddd - DD-MM-YY');

          if (groupFormattedDate === formattedDate) {
            const golfersCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups/${groupDoc.id}/golfers`);
            const golfersSnapshot = await getDocs(golfersCollectionRef);

            const golfers = golfersSnapshot.docs.map(golferDoc => ({
              ...golferDoc.data(),
              golferId: golferDoc.id,
            }));

            details.push({
              tripId: tripDoc.id, // Store the trip ID
              groupId: groupDoc.id, // Store the group ID
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
  };

  const handleOpenViewRound = (golfTripId, groupId, golferId, onClose) => {
    setActiveScorecardInfo({ groupId, golferId, golfTripId });
    setViewRoundOpen(true); // Set this to true to indicate that ViewRound should be opened
  };

  const handleCloseScoreCard = () => {
    setShowScoreCard(false);
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
                <div className="mt-4 bg-white shadow-lg rounded-lg">
                  <div className="flex justify-between bg-blue-500 text-white text-center py-2 rounded-t-lg">
                    <h3 className="text-m font-semibold mb-2 px-2 self-center">
                      {detail.groupDate}
                    </h3>
                    <h3 className="text-m font-semibold mb-2 flex-grow text-center">
                      {detail.groupName}
                    </h3>
                  </div>
                  <div className="grid grid-cols-12 gap-2 p-2 font-medium text-m border-b">
                    <div className="col-span-4">Golfer Name</div>
                    <div className="col-span-2">Daily Hcp</div>
                    <div className="col-span-2">Score</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                  {detail.golfers.map(golfer => (
                    <div key={golfer.golferId} className="grid grid-cols-12 gap-2 p-2 border-b">
                      <div className="col-span-4">{golfer.golferName}</div>
                      <div className="col-span-2">
                        <span>{golfer.dailyHcp}</span>
                      </div>
                      <div className="col-span-2">
                        <span>{golfer.score}</span>
                      </div>
                      <div className="col-span-1 flex justify-center items-center">
                        {golfer.golferId === golferId && (
                          <button
                            onClick={() => handleOpenScoreCard(detail.tripId, detail.groupId, golfer.golferId)}
                            className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs"
                          >
                            ScoreCard
                          </button>
                        )}
                      </div>
                      <div className="col-span-2 text-center">
                        {golfer.golferId === golferId && (
                          <button
                            onClick={() => handleOpenViewRound(detail.tripId, detail.groupId, golfer.golferId)}
                            className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs ml-2"
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