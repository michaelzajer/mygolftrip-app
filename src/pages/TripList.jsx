import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { getAuth } from "firebase/auth";
import { collection, getDocs, doc, deleteDoc, setDoc, query, where } from 'firebase/firestore';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [golfers, setGolfers] = useState([]);
  const [selectedGolfer, setSelectedGolfer] = useState('');
  const [editGroupTripId, setEditGroupTripId] = useState(null);
  const [editGroupId, setEditGroupId] = useState(null);
  const [viewDetailsTripId, setViewDetailsTripId] = useState(null);


  useEffect(() => {
    const fetchGolfers = async () => {
      const golfersSnapshot = await getDocs(collection(db, 'golfers'));
      setGolfers(golfersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchTrips = async () => {
      const auth = getAuth();
      const currentUserId = auth.currentUser.uid;

      const tripsQuery = query(collection(db, 'golfTrips'), where('creatorId', '==', currentUserId));
      const tripsSnapshot = await getDocs(tripsQuery);

     // const tripsSnapshot = await getDocs(collection(db, 'golfTrips'));
      const tripsData = await Promise.all(
        tripsSnapshot.docs.map(async (tripDoc) => {
          const groupsSnapshot = await getDocs(collection(db, `golfTrips/${tripDoc.id}/groups`));
          const groupsData = groupsSnapshot.docs.map(groupDoc => {
            const groupData = groupDoc.data();
            return {
              id: groupDoc.id,
              ...groupData,
              groupDate: groupData.groupDate ? new Date(groupData.groupDate) : null,
            };
          }).sort((a, b) => a.groupDate - b.groupDate);

          const groupsWithGolfers = await Promise.all(groupsData.map(async (group) => {
            const golfersSnapshot = await getDocs(collection(db, `golfTrips/${tripDoc.id}/groups/${group.id}/golfers`));
            const golfersData = golfersSnapshot.docs.map(golferDoc => golferDoc.data());
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

    fetchGolfers();
    fetchTrips();
  }, []);

    const handleEditGroup = async (tripId, groupId) => {
        setEditGroupTripId(tripId);
        setEditGroupId(groupId);
        // Fetch the golfers from the selected trip's golfers subcollection
        const golfersSnapshot = await getDocs(collection(db, `golfTrips/${tripId}/golfers`));
        setGolfers(golfersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleAddGolferToGroup = async () => {
        if (!editGroupTripId || !editGroupId || !selectedGolfer) {
            alert('You must select a golfer to add.');
            return;
        }

        const golferToAdd = golfers.find(golfer => golfer.id === selectedGolfer);

        if (!golferToAdd) {
            alert('Selected golfer not found.');
            return;
        }

        const groupGolfersRef = doc(db, `golfTrips/${editGroupTripId}/groups/${editGroupId}/golfers`, golferToAdd.id);

        try {
            await setDoc(groupGolfersRef, {
                golferName: golferToAdd.golferName,
                golferRef: golferToAdd.id,
                score: null,
                dailyHcp: null,
            });

            alert('Golfer added to group successfully!');
            setSelectedGolfer('');
        } catch (error) {
            console.error('Error adding golfer to group: ', error);
            alert('There was an error adding the golfer to the group.');
        }
    };

    const handleRemoveGolferFromGroup = async (tripId, groupId, golferId) => {
        try {
            await deleteDoc(doc(db, `golfTrips/${tripId}/groups/${groupId}/golfers`, golferId));
            alert('Golfer removed from group successfully!');
        } catch (error) {
            console.error('Error removing golfer from group: ', error);
            alert('There was an error removing the golfer from the group.');
        }
    };

    const handleToggleDetails = (tripId) => {
      if (viewDetailsTripId === tripId) {
        // If the details for this trip are already visible, hide them
        setViewDetailsTripId(null);
      } else {
        // Show the details for the clicked trip
        setViewDetailsTripId(tripId);
      }
    };

    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Trip List</h2>
          {trips.map((trip) => (
            <div key={trip.id} className="mb-4">
              <div
                onClick={() => handleToggleDetails(trip.id)}
                className="flex justify-between items-center p-4 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50"
              >
                <h3 className="text-xl font-semibold text-gray-700">{trip.golfTripName}</h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {viewDetailsTripId === trip.id ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  )}
                </svg>
              </div>
              {viewDetailsTripId === trip.id && (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  {trip.groups.map((group, index) => (
                    <div key={index} className="mb-4 space-y-2">
                      <div className="font-bold flex justify-between items-center">
                        {group.groupName} - {group.groupDate ? group.groupDate.toLocaleDateString() : 'No date'}
                        <button
                          onClick={() => handleEditGroup(trip.id, group.id)}
                          className="text-sm bg-blue-100 hover:bg-blue-300 text-white py-1 px-2 rounded focus:outline-none"
                        >
                          Edit
                        </button>
                      </div>
                      <ul className="list-disc list-inside space-y-1">
                        {group.golfers.map((golfer, golferIndex) => (
                          <li key={golferIndex} className="flex justify-between items-center">
                            {golfer.golferName}
                            <button
                              onClick={() => handleRemoveGolferFromGroup(trip.id, group.id, golfer.golferRef)}
                              className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded focus:outline-none"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {editGroupTripId && editGroupId && (
                    <div className="mt-4 p-4 bg-white border rounded-lg">
                      <h3 className="text-xl font-semibold mb-4">Edit Group</h3>
                      <div className="mb-4">
                        <select
                          value={selectedGolfer}
                          onChange={(e) => setSelectedGolfer(e.target.value)}
                          className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                        >
                          <option value="">Select a Golfer</option>
                          {golfers.map((golfer) => (
                            <option key={golfer.id} value={golfer.id}>{golfer.golferName}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={handleAddGolferToGroup}
                        className="bg-green-100 hover:bg-green-300 text-white py-2 px-4 rounded focus:outline-none"
                      >
                        Add Golfer to Group
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
};

export default TripList;