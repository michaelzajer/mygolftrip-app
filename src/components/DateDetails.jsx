import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import moment from 'moment';

const DateDetails = ({ selectedDate }) => {
  const [dateDetails, setDateDetails] = useState([]);
  const [editState, setEditState] = useState({});
  const auth = getAuth();
  const golferId = auth.currentUser?.uid; // Get the currently logged in golfer's ID

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

  const handleEditClick = (tripId, groupId, golfer) => {
    setEditState({
      ...editState,
      [golfer.golferId]: golfer // Set the golfer data into edit state
    });
  };

  const handleScoreChange = (golferId, value) => {
    setEditState({
      ...editState,
      [golferId]: {
        ...editState[golferId],
        score: value // Update the score in the edit state
      }
    });
  };

  const handleHcpChange = (golferId, value) => {
    setEditState({
      ...editState,
      [golferId]: {
        ...editState[golferId],
        dailyHcp: value // Update the daily handicap in the edit state
      }
    });
  };

  const handleSave = async (tripId, groupId, golfer) => {
    const updatedData = editState[golfer.golferId];
    // Use tripId and groupId to construct the Firestore document path
    const golferDocRef = doc(db, `golfTrips/${tripId}/groups/${groupId}/golfers`, golfer.golferId);

    // Save updated data to Firestore
    await updateDoc(golferDocRef, updatedData);

    // Clear the edit state for this golfer
    setEditState(prevState => {
      const newState = { ...prevState };
      delete newState[golfer.golferId]; // Remove the golfer from the edit state
      return newState;
    });

    // Update local state to reflect the saved changes
    setDateDetails(currentDetails =>
      currentDetails.map(d => {
        if (d.groupId === groupId) {
          return {
            ...d,
            golfers: d.golfers.map(g => {
              if (g.golferId === golfer.golferId) {
                return { ...g, ...updatedData };
              }
              return g;
            })
          };
        }
        return d;
      })
    );
  };

  return (
    <div>
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
                <div className="col-span-4">Golfer Name</div> {/* Adjusted the span to 5 */}
                <div className="col-span-2">Daily Hcp</div> {/* Adjusted the span to 3 */}
                <div className="col-span-2">Score</div> {/* Adjusted the span to 3 */}
                <div className="col-span-1">Actions</div> {/* Adjusted the span to 1 */}
              </div>
              {detail.golfers.map(golfer => {
                const isEditing = !!editState[golfer.golferId];
                return (
                  <div key={golfer.golferId} className="grid grid-cols-12 gap-2 p-2 border-b">
                    <div className="col-span-4">{golfer.golferName}</div>
                    <div className="col-span-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editState[golfer.golferId].dailyHcp}
                          onChange={(e) => handleHcpChange(golfer.golferId, e.target.value)}
                          className="border rounded px-2 py-1 text-sm w-full"
                        />
                      ) : (
                        <span>{golfer.dailyHcp}</span>
                      )}
                    </div>
                    <div className="col-span-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editState[golfer.golferId].score}
                          onChange={(e) => handleScoreChange(golfer.golferId, e.target.value)}
                          className="border rounded px-2 py-1 text-sm w-full"
                        />
                      ) : (
                        <span>{golfer.score}</span>
                      )}
                    </div>
                    <div className="col-span-1 flex justify-center items-center"> {/* Centered the button */}
                      {golfer.golferId === golferId && (
                        isEditing ? (
                          <button
                            onClick={() => handleSave(detail.tripId, detail.groupId, golfer)}
                            className="bg-green-500 hover:bg-green-700 text-white py-1 px-3 rounded text-xs"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEditClick(detail.tripId, detail.groupId, golfer)}
                            className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs"
                          >
                            Edit
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <p>No details available for this date.</p>
      )}
    </div>
  );
  
  
  
  
};

export default DateDetails;
