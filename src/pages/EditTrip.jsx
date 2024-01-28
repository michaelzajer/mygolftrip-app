/*
This page is called from ./pages/CreateTrip.jsx it edits a golf trip.
*/

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, getDocs, setDoc, deleteDoc, addDoc, query, where } from 'firebase/firestore';

const EditTrip = ({ tripId }) => {
    const [tripDetails, setTripDetails] = useState({ golfTripName: '', tripStartDate: '', tripEndDate: '' });
    const [golfers, setGolfers] = useState([]); // All available golfers
    const [tripGolfers, setTripGolfers] = useState([]); // Golfers in the trip
    const [groups, setGroups] = useState([]); // Groups in the trip
    const [allTrips, setAllTrips] = useState([]); // Array to hold all trips
    const [selectedTripId, setSelectedTripId] = useState(null); // Holds the ID of the selected trip

    useEffect(() => {
        const fetchAllTrips = async () => {
            const auth = getAuth();
            const currentUserId = auth.currentUser.uid;
            const tripsQuery = query(collection(db, 'golfTrips'), where('creatorId', '==', currentUserId));
            const querySnapshot = await getDocs(tripsQuery);
            setAllTrips(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
    
        fetchAllTrips();
    }, []);

    useEffect(() => {
        const fetchGolfers = async () => {
            const querySnapshot = await getDocs(collection(db, 'golfers'));
            setGolfers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
    
        const fetchTripDetails = async () => {
            if (!selectedTripId) {
                setTripDetails({ golfTripName: '', tripStartDate: '', tripEndDate: '' });
                setTripGolfers([]);
                setGroups([]);
                return;
            }
    
            const tripRef = doc(db, 'golfTrips', selectedTripId);
            const tripSnap = await getDoc(tripRef);
            if (tripSnap.exists()) {
                setTripDetails(tripSnap.data());
            }
    
            const tripGolfersRef = collection(db, `golfTrips/${selectedTripId}/golfers`);
            const tripGolfersSnap = await getDocs(tripGolfersRef);
            setTripGolfers(tripGolfersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    
            const groupsRef = collection(db, `golfTrips/${selectedTripId}/groups`);
            const groupsSnap = await getDocs(groupsRef);
            const groupsData = await Promise.all(groupsSnap.docs.map(async groupDoc => {
                const groupData = groupDoc.data();
                const golfersSnap = await getDocs(collection(db, `golfTrips/${selectedTripId}/groups/${groupDoc.id}/golfers`));
                const groupGolfers = golfersSnap.docs.map(golferDoc => golferDoc.data().golferRef);
                return { id: groupDoc.id, ...groupData, golfers: groupGolfers };
            }));
            setGroups(groupsData);
        };
    
        fetchGolfers();
        fetchTripDetails();
    }, [selectedTripId]);

    const handleTripDetailsChange = (field, value) => {
        setTripDetails({ ...tripDetails, [field]: value });
    };

    const handleGroupChange = (index, field, value) => {
        const updatedGroups = groups.map((group, idx) => idx === index ? { ...group, [field]: value } : group);
        setGroups(updatedGroups);
    };

    const handleTripGolferCheckboxChange = (golferId, isChecked) => {
        const updatedTripGolfers = isChecked 
            ? [...tripGolfers, golfers.find(g => g.id === golferId)]
            : tripGolfers.filter(golfer => golfer.id !== golferId);
        setTripGolfers(updatedTripGolfers);
    };

    const handleGroupGolferCheckboxChange = (groupIndex, golferId, isChecked) => {
        const updatedGroups = groups.map((group, idx) => {
            if (idx === groupIndex) {
                const updatedGolfers = isChecked 
                    ? [...group.golfers, golferId] 
                    : group.golfers.filter(id => id !== golferId);
                return { ...group, golfers: updatedGolfers };
            }
            return group;
        });
        setGroups(updatedGroups);
    };
    const updateTripGolfers = async () => {
        if (!selectedTripId) {
            throw new Error("No trip selected for updating golfers.");
        }
    
        const currentGolfersRef = collection(db, `golfTrips/${selectedTripId}/golfers`);
        const snapshot = await getDocs(currentGolfersRef);
        const currentGolfers = snapshot.docs.map(doc => doc.id);
    
        // Add new golfers to the trip
        const golfersToAdd = tripGolfers.filter(golfer => !currentGolfers.includes(golfer.id));
        const addGolferPromises = golfersToAdd.map(golfer => {
            if (!golfer.name) {
                throw new Error(`Golfer name is undefined for ID: ${golfer.id}`);
            }
    
            const golferRef = doc(db, `golfTrips/${selectedTripId}/golfers`, golfer.id);
            return setDoc(golferRef, { golferName: golfer.name, golferRef: golfer.id });

        });
    
        // Remove golfers no longer in the trip
        const golfersToRemove = currentGolfers.filter(golferId => !tripGolfers.map(g => g.id).includes(golferId));
        const removeGolferPromises = golfersToRemove.map(golferId => {
            const golferRef = doc(db, `golfTrips/${selectedTripId}/golfers`, golferId);
            return deleteDoc(golferRef);
        });
    
        await Promise.all([...addGolferPromises, ...removeGolferPromises]);
    };

    const updateGroups = async () => {
        if (!selectedTripId) {
            throw new Error("No trip selected for updating groups.");
        }
    
        const groupsRef = collection(db, `golfTrips/${selectedTripId}/groups`);
        
        const updateGroupPromises = groups.map(async (group) => {
            if (group.id && !group.id.startsWith('temp-')) {
                // Update existing group
                const groupRef = doc(db, `golfTrips/${selectedTripId}/groups`, group.id);
                await updateDoc(groupRef, { groupName: group.groupName, groupDate: group.groupDate });
            } else {
                // This is a new group, add it to Firestore
                const groupRef = await addDoc(groupsRef, { groupName: group.groupName, groupDate: group.groupDate });
                // Update the temporary ID with the new Firestore ID
                group.id = groupRef.id;
            }
            
            // Update or add golfers to the group
            const groupGolfersRef = collection(db, `golfTrips/${selectedTripId}/groups/${group.id}/golfers`);
            const golfersToAdd = group.golfers;
            const golferPromises = golfersToAdd.map(golferId => {
            const golferRef = doc(groupGolfersRef, golferId);
                return setDoc(golferRef, { 
                    golferName: golfers.find(g => g.id === golferId).name, 
                    golferRef: golferId, 
                    dailyHcp: 0, // Assuming default value of 0 for daily handicap
                    score: 0 // Assuming default value of 0 for score
                });
            });
    
            return Promise.all(golferPromises);
        });
    
        // Wait for all group updates to complete
        await Promise.all(updateGroupPromises);
    };

    const handleTripUpdate = async () => {
        try {
            if (!selectedTripId) {
                throw new Error("No trip selected for updating.");
            }
    
            await updateDoc(doc(db, 'golfTrips', selectedTripId), tripDetails);
            await updateTripGolfers();
            await updateGroups();
    
            alert('Trip updated successfully!');
        } catch (error) {
            console.error("Error updating the trip: ", error);
            alert(`There was an error updating the trip: ${error.message}`);
        }
    };

    const handleAddGroup = () => {
        const newGroup = {
            id: `temp-${Date.now()}`, // Temporary ID prefixed to indicate it's not a Firestore ID
            groupName: '',
            groupDate: '',
            golfers: [] // Initially empty
        };
        setGroups([...groups, newGroup]);
    };

    const handleDeleteGroup = async (groupId) => {
        if (!selectedTripId) {
            console.error("No trip selected for deleting a group.");
            return;
        }
    
        try {
            const groupRef = doc(db, `golfTrips/${selectedTripId}/groups`, groupId);
            await deleteDoc(groupRef);
    
            // Remove the group from the local state as well
            const updatedGroups = groups.filter(group => group.id !== groupId);
            setGroups(updatedGroups);
    
            alert('Group deleted successfully!');
        } catch (error) {
            console.error("Error deleting the group: ", error);
            alert(`There was an error deleting the group: ${error.message}`);
        }
    };

    return (
        <div className="p-6 bg-background-100 min-h-screen">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
                {/* Dropdown for selecting existing trips to edit */}
                <div className="mb-4">
                    <label htmlFor="trip-select" className="block text-grey-700 text-sm font-bold mb-2">
                        Select a Trip to Edit:
                    </label>
                    <select
                        id="trip-select"
                        className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                        value={selectedTripId}
                        onChange={(e) => setSelectedTripId(e.target.value)}
                    >
                        <option value="">Select a Trip</option>
                        {allTrips.map((trip) => (
                            <option key={trip.id} value={trip.id}>{trip.golfTripName}</option>
                        ))}
                    </select>
                </div>
    
                {/* Trip Details Editing */}
                <div className="mb-4">
                    <label htmlFor="golfTripName" className="block text-grey-700 text-sm font-bold mb-2">
                        Golf Trip Name:
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                        id="golfTripName"
                        type="text"
                        placeholder="Enter trip name"
                        value={tripDetails.golfTripName}
                        onChange={(e) => handleTripDetailsChange('golfTripName', e.target.value)}
                    />

                    <div className="mb-4 flex -mx-2">
                        <div className="flex-1 mx-2">
                            <label htmlFor="tripStartDate" className="block text-grey-700 text-sm font-bold mb-2">
                                Start Date:
                            </label>
                            <input
                                className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                                id="tripStartDate"
                                type="date"
                                value={tripDetails.tripStartDate}
                                onChange={(e) => handleTripDetailsChange('tripStartDate', e.target.value)}
                            />
                        </div>
    
                        <div className="flex-1 mx-2">
                            <label htmlFor="tripEndDate" className="block text-grey-700 text-sm font-bold mb-2">
                                End Date:
                            </label>
                            <input
                                className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                                id="tripEndDate"
                                type="date"
                                value={tripDetails.tripEndDate}
                                onChange={(e) => handleTripDetailsChange('tripEndDate', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
    
                {/* Golfer selection for the trip */}
                <div className="mb-4">
                    <label htmlFor="golfers-in-trip" className="block text-grey-700 text-sm font-bold mb-2">
                        Golfers in Trip:
                    </label>
                    <div>
                        {tripGolfers.map(golfer => (
                            <div key={golfer.id}>
                                <input
                                    type="checkbox"
                                    id={`golfer-${golfer.id}`}
                                    checked={tripGolfers.some(tripGolfer => tripGolfer.id === golfer.id)}
                                    onChange={(e) => handleTripGolferCheckboxChange(golfer.id, e.target.checked)}
                                />
                                <label htmlFor={`golfer-${golfer.id}`}>{golfer.golferName}</label>
                            </div>
                        ))}
                    </div>
                </div>
    
                {/* Groups and Golfers with Checkboxes */}
                {groups.map((group, index) => (
                    <div key={group.id} className="mb-6 bg-gray-100 p-4 rounded-md">
                        <div className="mb-4">
                            <label htmlFor={`group-name-${index}`} className="block text-grey-700 text-sm font-bold mb-2">
                                Group Name:
                            </label>
                            <input
                                id={`group-name-${index}`}
                                type="text"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                                value={group.groupName}
                                onChange={(e) => handleGroupChange(index, 'groupName', e.target.value)}
                            />
                        </div>
    
                        <div className="mb-4">
                            <label htmlFor={`group-date-${index}`} className="block text-grey-700 text-sm font-bold mb-2">
                                Group Date:
                            </label>
                            <input
                                id={`group-date-${index}`}
                                type="date"
                                className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                                value={group.groupDate}
                                onChange={(e) => handleGroupChange(index, 'groupDate', e.target.value)}
                            />
                        </div>
    
                        <div className="mb-4">
                            <label className="block text-grey-700 text-sm font-bold mb-2">
                                Golfers in Group:
                            </label>
                            <div>
                                {tripGolfers.map(golfer => (
                                    <div key={golfer.id}>
                                        <input
                                            type="checkbox"
                                            id={`group-${index}-golfer-${golfer.id}`}
                                            checked={group.golfers.includes(golfer.id)}
                                            onChange={(e) => handleGroupGolferCheckboxChange(index, golfer.id, e.target.checked)}
                                        />
                                        <label htmlFor={`group-${index}-golfer-${golfer.id}`}>{golfer.golferName}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
    
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleDeleteGroup(group.id)}
                                className="bg-red-400 hover:bg-red-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Delete Group
                            </button>
                        </div>
                    </div>
                ))}
    
                {/* UI elements for adding new group and saving changes */}
                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleAddGroup}
                        className="bg-blue-100 hover:bg-blue-200 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Add New Group
                    </button>
                </div>
    
                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleTripUpdate}
                        className="bg-green-400 hover:bg-green-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditTrip;