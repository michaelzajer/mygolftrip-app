import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    query,
    where,
    getDoc
} from 'firebase/firestore';

const CreateTrip = () => {
    const [user, setUser] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [golfTripName, setGolfTripName] = useState('');
    const [tripStartDate, setTripStartDate] = useState('');
    const [tripEndDate, setTripEndDate] = useState('');
    const [tripId, setTripId] = useState(null);
    const [golfers, setGolfers] = useState([]);
    const [selectedGolfers, setSelectedGolfers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [step, setStep] = useState(1);
    const [existingTrips, setExistingTrips] = useState([]);

    const auth = getAuth();

    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        const fetchGolfers = async () => {
            const querySnapshot = await getDocs(collection(db, 'golfers'));
            setGolfers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        fetchGolfers();
    }, []);

    useEffect(() => {
        const fetchTrips = async () => {
            const querySnapshot = await getDocs(collection(db, 'golfTrips'));
            setExistingTrips(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        fetchTrips();
    }, []);

    const goToNextStep = () => {
      if (step < 3) {
          setStep(step + 1);
      }
  };

  const goToPrevStep = () => {
      if (step > 1) {
          setStep(step - 1);
      }
  };

    const handleTripSelection = async (event) => {
      const selectedTripId = event.target.value;
      setIsEditMode(true);
      const tripRef = doc(db, 'golfTrips', selectedTripId);
      const tripSnapshot = await getDoc(tripRef);
  
      if (tripSnapshot.exists()) {
          const tripData = tripSnapshot.data();
          setGolfTripName(tripData.golfTripName);
          setTripStartDate(tripData.tripStartDate);
          setTripEndDate(tripData.tripEndDate);
          setTripId(selectedTripId);
          // Fetch groups for the selected trip
          const groupSnapshot = await getDocs(collection(db, `golfTrips/${selectedTripId}/groups`));
          const fetchedGroups = [];
          for (const groupDoc of groupSnapshot.docs) {
              const groupData = groupDoc.data();
              // Fetch golfers for each group
              const golferInGroupSnapshot = await getDocs(collection(db, `golfTrips/${selectedTripId}/groups/${groupDoc.id}/golfers`));
              const golfersInGroup = golferInGroupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              fetchedGroups.push({
                  id: groupDoc.id,
                  groupName: groupData.groupName,
                  groupDate: groupData.groupDate,
                  golfers: golfersInGroup
              });
          }
          setGroups(fetchedGroups);
          setStep(2); // Proceed to the step of adding/editing groups
      } else {
          alert("Selected trip does not exist.");
      }
  };

    const handleCreateOrUpdateTrip = async () => {
        if (!user) {
            alert('You must be logged in to create or update a trip.');
            return;
        }

        if (isEditMode && tripId) {
            const tripRef = doc(db, 'golfTrips', tripId);
            await updateDoc(tripRef, {
                golfTripName,
                tripStartDate,
                tripEndDate,
                // Any other fields to update
            });
        } else {
            const tripRef = await addDoc(collection(db, 'golfTrips'), {
                golfTripName,
                tripStartDate,
                tripEndDate,
                creatorId: user.uid,
                // Any other fields to add
            });
            setTripId(tripRef.id);
        }

        setStep(2); // Move to the next step
    };

    const handleGolferTripSelection = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedGolfers(selectedOptions);
    };

  const handleAddGolfersToTrip = async () => {
    const golferPromises = selectedGolfers.map(async golferId => {

      const golfer = golfers.find(g => g.id === golferId);
          if (!golfer) {
              console.error(`Golfer with ID ${golferId} not found.`);
              return Promise.resolve(); // Skip adding this golfer
          }
        const golferRef = doc(db, `golfTrips/${tripId}/golfers`, golferId);
        const golferDoc = await getDoc(golferRef);

        if (golferDoc.exists()) {
            // If the golfer already exists in the trip, update the record
            return updateDoc(golferRef, { golferRef: golferId, golferName: golfer.name });
        } else {
            // If the golfer does not exist, add a new record
            return setDoc(golferRef, { golferRef: golferId, golferName: golfer.name });
        }
    });

    try {
        await Promise.all(golferPromises);
        setStep(3); // Proceed to next step after adding/updating golfers
    } catch (error) {
        console.error("Error adding/updating golfers to trip: ", error);
        alert("There was an error adding/updating the golfers.");
    }
};

  const handleAddGroup = () => {
    setGroups([...groups, { groupName: '', groupDate: '', golfers: [] }]);
  };

  const handleGroupChange = (index, field, value) => {
    const newGroups = [...groups];
    newGroups[index][field] = value;
    setGroups(newGroups);
  };

  const handleGolferSelection = (groupIndex, golferId) => {
    const newGroups = [...groups];
    const currentSelection = newGroups[groupIndex].golfers;

    if (currentSelection.includes(golferId)) {
      newGroups[groupIndex].golfers = currentSelection.filter(id => id !== golferId);
    } else {
      newGroups[groupIndex].golfers.push(golferId);
    }

    setGroups(newGroups);
  };

    const handleCreateGroups = async () => {
      const groupPromises = groups.map(async (group, index) => {
        let groupRef;
        if (group.id) {
            // Use the existing group ID to get the document reference
            groupRef = doc(db, `golfTrips/${tripId}/groups/${group.id}`);
            await updateDoc(groupRef, {
                groupName: group.groupName,
                groupDate: group.groupDate,
            });
        } else {
            // Create a new group document and get its reference
            const newGroupRef = await addDoc(collection(db, `golfTrips/${tripId}/groups`), {
                groupName: group.groupName,
                groupDate: group.groupDate,
            });
            groupRef = newGroupRef;
        }

          // Add or update golfer documents in the golfers subcollection of the group
          const golferPromises = group.golfers.map(async golferId => {
              const golferDocRef = doc(db, `golfTrips/${tripId}/groups/${groupRef.id}/golfers`, golferId);
              const golferSnapshot = await getDoc(golferDocRef);
              const golferDetails = golfers.find(g => g.id === golferId);

              if (golferSnapshot.exists()) {
                  // Update golfer if already exists in the group
                  return updateDoc(golferDocRef, {
                      golferName: golferDetails.name,
                      golferRef: golferId,
                      dailyHcp: 0, // Placeholder for daily handicap
                      score: 0, // Placeholder for score
                  });
              } else {
                  // Add new golfer to the group
                  return setDoc(golferDocRef, {
                      golferName: golferDetails.name,
                      golferRef: golferId,
                      dailyHcp: 0, // Placeholder for daily handicap
                      score: 0, // Placeholder for score
                  });
              }
          });

          return Promise.all(golferPromises);
      });

      try {
          await Promise.all(groupPromises);
          alert('Groups created/updated successfully!');
      } catch (error) {
          console.error("Error creating/updating groups: ", error);
          alert("There was an error creating/updating the groups.");
      }
  };

  return (
    <div className="p-6 bg-background-100 min-h-screen">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
            {!isEditMode && existingTrips.length > 0 && (
                <div className="mb-4">
                    <label htmlFor="existing-trips" className="block text-gray-700 text-sm font-bold mb-2">
                        Select a Trip to Edit:
                    </label>
                    <select
                        id="existing-trips"
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        onChange={handleTripSelection}
                        value={tripId}
                    >
                        <option value="">Select a Trip</option>
                        {existingTrips.map((trip) => (
                            <option key={trip.id} value={trip.id}>{trip.golfTripName}</option>
                        ))}
                    </select>
                </div>
            )}

            {isEditMode && tripId && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Editing Trip: {golfTripName}</h3>
                    <p>Start Date: {tripStartDate}</p>
                    <p>End Date: {tripEndDate}</p>
                </div>
            )}

            {step === 1 && (
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-blue-500">Create/Edit Trip</h2>
                    <div className="mb-4">
                        <label className="block text-grey-700 text-sm font-bold mb-2" htmlFor="golfTripName">
                            Golf Trip Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="golfTripName"
                            type="text"
                            placeholder="Enter trip name"
                            value={golfTripName}
                            onChange={(e) => setGolfTripName(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-grey-700 text-sm font-bold mb-2" htmlFor="tripStartDate">
                            Start Date
                        </label>
                        <input
                            className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                            id="tripStartDate"
                            type="date"
                            value={tripStartDate}
                            onChange={(e) => setTripStartDate(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-grey-700 text-sm font-bold mb-2" htmlFor="tripEndDate">
                            End Date
                        </label>
                        <input
                            className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                            id="tripEndDate"
                            type="date"
                            value={tripEndDate}
                            onChange={(e) => setTripEndDate(e.target.value)}
                        />
                    </div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={handleCreateOrUpdateTrip}
                    >
                        {tripId ? 'Update Trip Details' : 'Create Trip'}
                    </button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-blue-500">Add Golfers to Trip</h2>
                    <div className="mb-4">
                        <label className="block text-grey-700 text-sm font-bold mb-2">
                            Select Golfers
                        </label>
                        <select
                            multiple
                            className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                            value={selectedGolfers}
                            onChange={handleGolferTripSelection}
                        >
                            {golfers.map((golfer) => (
                                <option key={golfer.id} value={golfer.id}>{golfer.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={handleAddGolfersToTrip}
                    >
                        Add Selected Golfers
                    </button>
                </div>
            )}

            {step === 3 && (
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-blue-500">Create/Edit Groups</h2>
                    {groups.map((group, index) => (
                        <div key={index} className="mb-4 border-b pb-4">
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-700 mb-2 leading-tight focus:outline-none focus:shadow-outline"
                                type="text"
                                placeholder={`Group ${index + 1} Name`}
                                value={group.groupName}
                                onChange={(e) => handleGroupChange(index, 'groupName', e.target.value)}
                            />
                            <input
                                className="shadow border rounded w-full py-2 px-3 text-grey-700 mb-2 leading-tight"
                                type="date"
                                value={group.groupDate}
                                onChange={(e) => handleGroupChange(index, 'groupDate', e.target.value)}
                            />
                            <select
                              multiple
                              className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                              value={group.golfers}
                              onChange={(e) => handleGolferSelection(index, e.target.value)}
                          >
                               {golfers.map(golfer => (
                              <option key={golfer.id} value={golfer.id} selected={group.golfers.includes(golfer.id)}>
                                  {golfer.name}
                              </option>
                              ))}
                          </select>
                        </div>
                    ))}

                    <div className="mt-4">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick={handleAddGroup}
                        >
                            Add Another Group
                        </button>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <button
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick={handleCreateGroups}
                        >
                            Save Groups
                        </button>
                    </div>
                </div>
            )}

            <div className="flex justify-between mt-4">
                {step > 1 && (
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => setStep(step - 1)}
                    >
                        Previous
                    </button>
                )}
                {step < 3 && (
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => setStep(step + 1)}
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    </div>
);
};

export default CreateTrip;