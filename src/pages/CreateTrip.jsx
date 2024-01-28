/*
This page is called from ./pages/Admin.jsx it creates a golf trip.

./pages/EditTrip.jsx is called from here.

*/

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    setDoc
} from 'firebase/firestore';
import { Link } from 'react-router-dom';


const CreateTrip = () => {
    const [user, setUser] = useState(null);
    const [golfTripName, setGolfTripName] = useState('');
    const [tripStartDate, setTripStartDate] = useState('');
    const [tripEndDate, setTripEndDate] = useState('');
    const [golfers, setGolfers] = useState([]);
    const [selectedGolfers, setSelectedGolfers] = useState([]);
    const [groups, setGroups] = useState([{ groupName: '', groupDate: '', golfers: [] }]);
    const [step, setStep] = useState(1);
    const [tripId, setTripId] = useState(null); // Add tripId to state

    const auth = getAuth();

    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
    }, [auth]);

    const fetchTripGolfers = async () => {
        if (tripId) {
            const tripGolfersSnapshot = await getDocs(collection(db, `golfTrips/${tripId}/golfers`));
            setGolfers(tripGolfersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
    };

    useEffect(() => {
        fetchTripGolfers();
    }, [tripId]);

    const generateJoinCode = () => {
        // Simple random string generator
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const handleCreateTrip = async () => {
        if (!user) {
            alert('You must be logged in to create a trip.');
            return;
        }

        try {
            const joinCode = generateJoinCode(); // Generate a unique join code

            const tripRef = await addDoc(collection(db, 'golfTrips'), {
                golfTripName,
                tripStartDate,
                tripEndDate,
                creatorId: user.uid,
                joinCode
            });
            setTripId(tripRef.id); // Set the tripId for the newly created trip

            // Automatically add the creator to the golfTrips/golfers subcollection
            const creatorRef = doc(db, `golfTrips/${tripRef.id}/golfers`, user.uid);
            await setDoc(creatorRef, {
                golferName: user.displayName,
                golferRef: user.uid,
                dailyHcp: 0,
                score: 0
            });

            setStep(2); // Move to the next step
        } catch (error) {
            console.error("Error creating trip: ", error);
            alert("There was an error creating the trip.");
        }
    };

    const handleGolferCheckboxChange = (golferId) => {
        if (selectedGolfers.includes(golferId)) {
            setSelectedGolfers(selectedGolfers.filter(id => id !== golferId));
        } else {
            setSelectedGolfers([...selectedGolfers, golferId]);
        }
    };

    const handleAddGolfersToTrip = async () => {
        if (!tripId) {
            console.error("Trip ID is not set");
            return;
        }
    
        // Ensure that all selected golfer IDs have corresponding golfer data
        const validSelectedGolfers = selectedGolfers.filter(golferId =>
            golfers.some(golfer => golfer.id === golferId)
        );
    
        const golferPromises = validSelectedGolfers.map(golferId => {
            // Ensure the golfer's name is defined
            const golfer = golfers.find(g => g.id === golferId);
            if (!golfer || !golfer.golferName) {
                console.error(`Golfer data is missing or golferName is undefined for ID: ${golferId}`);
                return Promise.resolve(); // Resolve the promise immediately to avoid blocking other operations
            }
    
            const golferRef = doc(db, `golfTrips/${tripId}/golfers`, golferId);
            return setDoc(golferRef, {
                golferName: golfer.golferName,
                golferRef: golferId
            });
        });
    
        try {
            await Promise.all(golferPromises);
            setStep(3); // Proceed to next step after adding golfers
        } catch (error) {
            console.error("Error adding golfers to trip: ", error);
            alert("There was an error adding golfers to the trip.");
        }
    };

    const handleAddGroup = () => {
        setGroups([...groups, { groupName: '', groupDate: '', golfers: [] }]);
    };

    const handleGroupChange = (index, field, value) => {
        const updatedGroups = groups.map((group, idx) => {
            if (idx === index) {
                return { ...group, [field]: value };
            }
            return group;
        });
        setGroups(updatedGroups);
    };

    const handleGroupGolferSelection = (groupIndex, golferId) => {
        setGroups(groups.map((group, idx) => {
            if (idx === groupIndex) {
                const newGolfers = group.golfers.includes(golferId)
                    ? group.golfers.filter(id => id !== golferId)
                    : [...group.golfers, golferId];
                return { ...group, golfers: newGolfers };
            }
            return group;
        }));
    };
    
    const handleCreateGroups = async () => {
        if (!tripId) {
            console.error("Trip ID is not set");
            return;
        }
    
        const tripGroupsRef = collection(db, `golfTrips/${tripId}/groups`);
    
        for (const group of groups) {
            let groupRef;
            if (group.id && !group.id.startsWith('temp-')) {
                // Existing group, update it
                groupRef = doc(tripGroupsRef, group.id);
            } else {
                // New group, create it
                const newGroupRef = await addDoc(tripGroupsRef, {
                    groupName: group.groupName,
                    groupDate: group.groupDate
                });
                group.id = newGroupRef.id;
                groupRef = newGroupRef;
            }
    
            for (const golferId of group.golfers) {
                // Find the golfer's name in the array
                const golfer = golfers.find(g => g.id === golferId);
                if (!golfer) {
                    console.error(`Golfer not found with ID: ${golferId}`);
                    continue; // Skip this golfer and continue with the next one
                }
    
                const golferRef = doc(db, `golfTrips/${tripId}/groups/${groupRef.id}/golfers`, golferId);
                await setDoc(golferRef, {
                    golferName: golfer.golferName, // Use golferName from the golfer object
                    golferRef: golferId,
                    dailyHcp: 0,
                    score: 0
                });
            }
        }
    
        alert('Groups created/updated successfully!');
        setStep(4); // Proceed to the trip summary step
    };

    return (
        <div className="p-6 bg-background-100 min-h-screen">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
                {step === 1 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-blue-500">Create Trip</h2>
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
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={handleCreateTrip}
                        >
                            Create Trip
                        </button>
                        {/* Add a Link to EditTrip here */}
                        <Link 
                            to="/admin/edit-trip" // Use the tripId state here
                            className="ml-4 text-blue-500 hover:text-blue-700"
                        >
                            Edit Trip
                         </Link>
                    </div>
                )}
    
    {step === 2 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-blue-500">Add Golfers to Trip</h2>
                        <p>Golf Trip Name: {golfTripName}</p>
                        <p>Start Date: {tripStartDate}</p>
                        <p>End Date: {tripEndDate}</p>
                        <div className="mb-4">
                            <label className="block text-grey-700 text-sm font-bold mb-2">
                                Select Golfers
                            </label>
                            <div>
                                {golfers.map(golfer => (
                                    <div key={golfer.id}>
                                        <input
                                            type="checkbox"
                                            id={`golfer-${golfer.id}`}
                                            checked={selectedGolfers.includes(golfer.id)}
                                            onChange={() => handleGolferCheckboxChange(golfer.id)}
                                        />
                                        <label htmlFor={`golfer-${golfer.id}`}>{golfer.golferName}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => handleAddGolfersToTrip()}
                        >
                            Add Golfers
                        </button>
                    </div>
                )}
    
                {step === 3 && (
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-blue-500">Create/Edit Groups</h2>
                    {groups.map((group, index) => (
                        <div key={index} className="mb-4">
                            <label className="block text-grey-700 text-sm font-bold mb-2">
                                Group Name
                            </label>
                            <input
                                type="text"
                                placeholder="Group Name"
                                value={group.groupName}
                                onChange={(e) => handleGroupChange(index, 'groupName', e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                            <label className="block text-grey-700 text-sm font-bold mb-2 mt-3">
                                Group Date
                            </label>
                            <input
                                type="date"
                                value={group.groupDate}
                                onChange={(e) => handleGroupChange(index, 'groupDate', e.target.value)}
                                className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                            />
                            <label className="block text-grey-700 text-sm font-bold mb-2 mt-3">
                                Select Golfers
                            </label>
                            <div>
                                {selectedGolfers.map(golferId => {
                                    const golfer = golfers.find(g => g.id === golferId);
                                    return (
                                        <div key={golferId}>
                                            <input
                                                type="checkbox"
                                                id={`group-${index}-golfer-${golferId}`}
                                                checked={group.golfers.includes(golferId)}
                                                onChange={() => handleGroupGolferSelection(index, golferId)}
                                            />
                                            <label htmlFor={`group-${index}-golfer-${golferId}`}>{golfer.golferName}</label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    <button 
                        onClick={handleAddGroup} 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
                    >
                        Add Another Group
                    </button>
                    <button 
                        onClick={handleCreateGroups} 
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
                    >
                        Finish and View Summary
                    </button>
                </div>
            )}

                {step === 4 && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-6 text-blue-500">Trip Summary</h2>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold">Golf Trip Details:</h3>
                                        <p>Name: {golfTripName}</p>
                                        <p>Start Date: {tripStartDate}</p>
                                        <p>End Date: {tripEndDate}</p>
                                    </div>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold">Golfers in Trip:</h3>
                                        <ul>
                                            {selectedGolfers.map(golferId => {
                                                const golfer = golfers.find(g => g.id === golferId);
                                                return <li key={golferId}>{golfer.name}</li>;
                                            })}
                                        </ul>
                                    </div>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold">Groups:</h3>
                                        {groups.map((group, index) => (
                                            <div key={index} className="mb-3">
                                                <p>Group Name: {group.groupName}</p>
                                                <p>Group Date: {group.groupDate}</p>
                                                <p>Golfers in Group:</p>
                                                <ul>
                                                    {group.golfers.map(golferId => {
                                                        const golfer = golfers.find(g => g.id === golferId);
                                                        return <li key={golferId}>{golfer.golferName}</li>;
                                                    })}
                                                </ul>
                                            </div>
                                        ))}
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