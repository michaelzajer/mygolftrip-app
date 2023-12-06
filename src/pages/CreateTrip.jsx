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
    where,
    query
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

        const fetchGolfers = async () => {
            const querySnapshot = await getDocs(collection(db, 'golfers'));
            setGolfers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        fetchGolfers();
    }, []);

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
            setStep(2); // Move to the next step
        } catch (error) {
            console.error("Error creating trip: ", error);
            alert("There was an error creating the trip.");
        }
    };

    const handleGolferSelectionChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        setSelectedGolfers(selectedOptions);
    };

    const handleAddGolfersToTrip = async () => {
        const tripRef = doc(db, 'golfTrips', tripId);
        const golferPromises = selectedGolfers.map(golferId => {
            const golferRef = doc(db, `golfTrips/${tripId}/golfers`, golferId);
            return setDoc(golferRef, {
                golferName: golfers.find(g => g.id === golferId).name,
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

    const handleGroupGolferSelection = (groupIndex, selectedGolferIds) => {
        const updatedGroups = groups.map((group, idx) => {
            if (idx === groupIndex) {
                return { ...group, golfers: selectedGolferIds };
            }
            return group;
        });
        setGroups(updatedGroups);
    };

    const handleCreateGroups = async () => {
        const tripGroupsRef = collection(db, `golfTrips/${tripId}/groups`);
    
        const groupPromises = groups.map(async (group) => {
            // Check if a group with the same name and date already exists
            const q = query(tripGroupsRef, where("groupName", "==", group.groupName), where("groupDate", "==", group.groupDate));
            const querySnapshot = await getDocs(q);
    
            let groupRef;
            if (querySnapshot.empty) {
                // If no such group exists, create a new one
                groupRef = await addDoc(tripGroupsRef, {
                    groupName: group.groupName,
                    groupDate: group.groupDate
                });
            } else {
                // If such a group exists, update it
                const existingGroupDoc = querySnapshot.docs[0];
                groupRef = doc(db, `golfTrips/${tripId}/groups`, existingGroupDoc.id);
                await updateDoc(groupRef, {
                    groupName: group.groupName,
                    groupDate: group.groupDate
                });
            }
    
            // Add or update golfers in the group
            const golferPromises = group.golfers.map(golferId => {
                const golferGroupRef = doc(db, `golfTrips/${tripId}/groups/${groupRef.id}/golfers`, golferId);
                return setDoc(golferGroupRef, {
                    golferName: golfers.find(g => g.id === golferId).name,
                    golferRef: golferId,
                    dailyHcp: 0,
                    score: 0
                });
            });
    
            return Promise.all(golferPromises);
        });
    
        try {
            await Promise.all(groupPromises);
            alert('Groups created/updated successfully!');
            setStep(4); // Proceed to the trip summary step
        } catch (error) {
            console.error("Error creating/updating groups: ", error);
            alert("There was an error creating/updating the groups.");
        }
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
                            <select
                                multiple
                                className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                                value={selectedGolfers}
                                onChange={handleGolferSelectionChange}
                            >
                                {golfers.map(golfer => (
                                    <option key={golfer.id} value={golfer.id}>{golfer.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => handleAddGolfersToTrip(tripId)}
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
                            <select
                                multiple
                                value={group.golfers}
                                onChange={(e) => handleGroupGolferSelection(index, Array.from(e.target.selectedOptions, option => option.value))}
                                className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                            >
                                {selectedGolfers.map(golferId => {
                                    const golfer = golfers.find(g => g.id === golferId);
                                    return <option key={golferId} value={golferId}>{golfer.name}</option>;
                                })}
                            </select>
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
                                                        return <li key={golferId}>{golfer.name}</li>;
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