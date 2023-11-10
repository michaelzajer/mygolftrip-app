import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Adjust this path to point to your firebase configuration
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [golfers, setGolfers] = useState([]);
  const [selectedGolfer, setSelectedGolfer] = useState('');
  const [editGroupTripId, setEditGroupTripId] = useState(null);
  const [editGroupId, setEditGroupId] = useState(null);

  useEffect(() => {
    // Fetch the list of golfers
    const fetchGolfers = async () => {
      const golfersSnapshot = await getDocs(collection(db, 'golfers'));
      setGolfers(golfersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchGolfers();

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
    
          // Fetch golfers for each group
          const groupsWithGolfers = await Promise.all(groupsData.map(async (group) => {
            const golfersCollectionRef = collection(db, `golfTrips/${tripDoc.id}/groups/${group.id}/golfers`);
            const golfersSnapshot = await getDocs(golfersCollectionRef);
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
    
    fetchTrips();
    
  }, []);

  const handleEditGroup = (tripId, groupId) => {
    setEditGroupTripId(tripId);
    setEditGroupId(groupId);
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
          golferName: golferToAdd.name,
          golferRef: golferToAdd.id,
          score: null,
          dailyHcp: null,
          // Add other golfer details here if necessary
      });
      
      alert('Golfer added to group successfully!');
      // Clear the selected golfer and close the edit form
      setSelectedGolfer('');
      // Refresh the list to show the updated group
      // (You might need to implement this depending on how you manage state)
    } catch (error) {
      console.error('Error adding golfer to group: ', error);
      alert('There was an error adding the golfer to the group.');
    }
  };

  const handleRemoveGolferFromGroup = async (tripId, groupId, golferId) => {
    console.log("Removing golfer with ID:", golferId, "from group:", groupId, "in trip:", tripId);
    
    // Create a reference to the golfer's document
    const golferDocRef = doc(db, `golfTrips/${tripId}/groups/${groupId}/golfers`, golferId);
  
    try {
      // Delete the golfer's document
      await deleteDoc(golferDocRef);
  
      alert('Golfer removed from group successfully!');
      // Refresh the list to show the updated group
      // You will likely need to fetch the trip data again or remove the golfer from the state
    } catch (error) {
      console.error('Error removing golfer from group: ', error);
      alert('There was an error removing the golfer from the group.');
    }
  };
  

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="py-3 px-6">
              Trip Name
            </th>
            <th scope="col" className="py-3 px-6">
              Start Date
            </th>
            <th scope="col" className="py-3 px-6">
              End Date
            </th>
            <th scope="col" className="py-3 px-6">
              Group Details
            </th>
          </tr>
        </thead>
        <tbody>
          {trips?.map((trip) => (
            <tr key={trip.id} className="bg-white border-b">
              <td className="py-4 px-6">
                {trip.golfTripName}
              </td>
              <td className="py-4 px-6">
                {trip.tripStartDate}
              </td>
              <td className="py-4 px-6">
                {trip.tripEndDate}
              </td>
              <td className="py-4 px-6">
                {trip.groups?.map((group, index) => (
                  <div key={index} className="mb-4">
                    <div className="font-bold">
                      {group.groupName} - {group.groupDate ? group.groupDate.toLocaleDateString() : 'No date'}
                      <button
                        onClick={() => handleEditGroup(trip.id, group.id)}
                        className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Edit
                      </button>
                    </div>
                    <ul className="list-disc list-inside">
                {group.golfers?.map((golfer, golferIndex) => (
                  <li key={golferIndex} className="flex justify-between items-center">
                    {golfer.golferName}
                    <button
                      onClick={() => handleRemoveGolferFromGroup(trip.id, group.id, golfer.golferRef)}
                      className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Group Form */}
      {editGroupTripId && editGroupId && (
        <div>
          <h3>Edit Group</h3>
          <select value={selectedGolfer} onChange={(e) => setSelectedGolfer(e.target.value)}>
            <option value="">Select a Golfer</option>
            {golfers?.map((golfer) => (
              <option key={golfer.id} value={golfer.id}>
                {golfer.name}
              </option>
            ))}
          </select>
          <button onClick={handleAddGolferToGroup} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Add Golfer to Group
          </button>
        </div>
      )}
    </div>
  );
};

export default TripList;
