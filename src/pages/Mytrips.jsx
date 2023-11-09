import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import GolferItem from "../components/GolferItem";

const MyTrips = () => {
  const [myTrips, setMyTrips] = useState([]);
  const [editState, setEditState] = useState({});
  const auth = getAuth();
  const golferId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchMyTrips = async () => {
      if (!golferId) return;

      let tripsData = [];
      const tripsSnapshot = await getDocs(collection(db, "golfTrips"));
      
      for (const tripDoc of tripsSnapshot.docs) {
        const groupsSnapshot = await getDocs(collection(db, `golfTrips/${tripDoc.id}/groups`));
        
        for (const groupDoc of groupsSnapshot.docs) {
          const golfersSnapshot = await getDocs(collection(db, `golfTrips/${tripDoc.id}/groups/${groupDoc.id}/golfers`));
          const golfers = golfersSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));

          const isGolferInGroup = golfers.some(golfer => golfer.golferRef === golferId);
          
          if (isGolferInGroup) {
            tripsData.push({
              ...tripDoc.data(),
              id: tripDoc.id,
              groups: {
                ...groupDoc.data(),
                id: groupDoc.id,
                golfers
              }
            });
          }
        }
      }

      // Sort the trips by date (ensure your dates are in a format that can be sorted)
      tripsData.sort((a, b) => new Date(a.groups.groupDate) - new Date(b.groups.groupDate));

      setMyTrips(tripsData);
    };

    fetchMyTrips();
  }, [golferId]);

  const handleScoreChange = (tripId, groupId, golferId, value) => {
    setEditState(prevState => ({
      ...prevState,
      [`${tripId}-${groupId}-${golferId}`]: {
        ...prevState[`${tripId}-${groupId}-${golferId}`],
        score: value
      }
    }));
  };

  const handleHcpChange = (tripId, groupId, golferId, value) => {
    setEditState(prevState => ({
      ...prevState,
      [`${tripId}-${groupId}-${golferId}`]: {
        ...prevState[`${tripId}-${groupId}-${golferId}`],
        dailyHcp: value
      }
    }));
  };

  const handleEditClick = (tripId, groupId, golfer) => {
    setEditState({
      ...editState,
      [`${tripId}-${groupId}-${golfer.golferRef}`]: golfer
    });
  };

  const handleSave = async (tripId, groupId, golfer) => {
    const golferRef = golfer.golferRef;
    const updatedData = editState[`${tripId}-${groupId}-${golferRef}`];
  
    // Update the Firestore document
    const golferDocRef = doc(db, `golfTrips/${tripId}/groups/${groupId}/golfers`, golferRef);
    await updateDoc(golferDocRef, updatedData);
  
    // Clear the edit state for this golfer
    const newEditState = {...editState};
    delete newEditState[`${tripId}-${groupId}-${golferRef}`];
    setEditState(newEditState);
  
    // Update local state
    setMyTrips(prevTrips => {
      return prevTrips.map(trip => {
        if (trip.id === tripId) {
          return {
            ...trip,
            groups: trip.groups.id === groupId ? {
              ...trip.groups,
              golfers: trip.groups.golfers.map(g => {
                if (g.golferRef === golferRef) {
                  return {...g, ...updatedData};
                }
                return g;
              })
            } : trip.groups
          };
        }
        return trip;
      });
    });
  };
  

  return (
    <div className="flex justify-center px-6 py-12">
      <div className="max-w-7xl w-full mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Left Component */}
          <div className="flex-shrink-0 w-full md:w-1/3">
            <GolferItem golferRef={golferId} />
          </div>
  
          {/* My Trips Groups */}
          <div className="w-full">
            {myTrips.length > 0 ? (
              myTrips.map((trip) => (
                <div key={trip.id} className="mb-4">
                  {trip.groups && (
                    <div className="mt-4 bg-white shadow-lg rounded-lg">
                      {/* Group Header */}
                      <div className="flex justify-between bg-blue-100 text-white text-center py-2 rounded-t-lg">
                        {/* Group Date on the Left */}
                        <h3 className="text-m font-semibold mb-2 px-2 self-center">
                          {trip.groups.groupDate}
                        </h3>
                        {/* Group Name in the Center */}
                        <h3 className="text-m font-semibold mb-2 flex-grow text-center">
                          {trip.groups.groupName}
                        </h3>
                        <div className="w-1/4"></div> {/* This is to balance the space and keep the group name centered */}
                      </div>
                  <div className="grid grid-cols-4 gap-2 p-2 font-medium text-m border-b">
                    <div>Golfer Name</div>
                    <div>Daily Handicap</div>
                    <div>Score</div>
                    <div>Edit</div>
                  </div>
                  {trip.groups.golfers.map((golfer, index) => {
                    const editKey = `${trip.id}-${trip.groups.id}-${golfer.golferRef}`;
                    const isEditing = !!editState[editKey];
                    return (
                      <div key={golfer.golferRef} className={`grid grid-cols-4 gap-2 items-center p-2 ${index !== trip.groups.golfers.length - 1 ? 'border-b' : ''}`}>
                        <div>{golfer.golferName}</div>
                        <div>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editState[editKey].dailyHcp}
                              onChange={(e) => handleHcpChange(trip.id, trip.groups.id, golfer.golferRef, e.target.value)}
                              className="border rounded px-2 py-1 text-sm w-full"
                            />
                          ) : (
                            <span>{golfer.dailyHcp}</span>
                          )}
                        </div>
                        <div>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editState[editKey].score}
                              onChange={(e) => handleScoreChange(trip.id, trip.groups.id, golfer.golferRef, e.target.value)}
                              className="border rounded px-2 py-1 text-sm w-full"
                            />
                          ) : (
                            <span>{golfer.score}</span>
                          )}
                        </div>
                        <div>
                          {golfer.golferRef === golferId && (
                            <div className="text-justify">
                              {isEditing ? (
                                <button
                                  className="text-blue-200 hover:text-blue-600"
                                  onClick={() => handleSave(trip.id, trip.groups.id, golfer)}
                                >
                                  Save
                                </button>
                              ) : (
                                <button
                                  className="text-blue-200 hover:text-blue-600"
                                  onClick={() => handleEditClick(trip.id, trip.groups.id, golfer)}
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            ))
            ) : (
              <p className="text-gray-500">No trips found or you're not part of any groups.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTrips;
