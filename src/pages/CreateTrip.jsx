import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Adjust the path according to your structure
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    setDoc,
  } from 'firebase/firestore';

  
  const CreateTrip = () => {
   
    const [user, setUser] = useState(null); // State to keep track of the current user
    const [golfTripName, setGolfTripName] = useState('');
    const [tripStartDate, setTripStartDate] = useState('');
    const [tripEndDate, setTripEndDate] = useState('');
    const [groups, setGroups] = useState([{ groupName: '', groupDate: '', golfers: [] }]);
    const [golfers, setGolfers] = useState([]);
  
    const auth = getAuth();
    const userId = auth.currentUser;
    // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // If logged in, currentUser is not null
    });
    return unsubscribe; // Unsubscribe on unmount
  }, []);

    // Load golfers from Firestore on component mount
    useEffect(() => {
      const fetchGolfers = async () => {
        const golfersCollectionRef = collection(db, 'golfers');
        const golfersSnapshot = await getDocs(golfersCollectionRef);
        const golfersList = golfersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGolfers(golfersList);
      };
  
      fetchGolfers();
    }, []);
  
    const handleGroupChange = (index, field, value) => {
      const newGroups = [...groups];
      newGroups[index][field] = value;
      setGroups(newGroups);
    };
  
    const addGroup = () => {
      setGroups([...groups, { groupName: '', groupDate: '', golfers: [] }]);
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
  
    const handleCreateTrip = async () => {
        if (!user) {
            alert('You must be logged in to create a trip.');
            return;
          }

      try {
        const tripRef = await addDoc(collection(db, 'golfTrips'), {
          golfTripName,
          tripStartDate,
          tripEndDate,
          creatorId: userId.uid,
        });
  
        await Promise.all(groups.map(async (group) => {
          const groupRef = await addDoc(collection(db, `golfTrips/${tripRef.id}/groups`), {
            groupName: group.groupName,
            groupDate: group.groupDate || tripStartDate,
          });
  
          await Promise.all(group.golfers.map(async (golferId) => {
            const golfer = golfers.find(g => g.id === golferId);
          if (!golfer) {
            throw new Error(`Golfer with ID ${golferId} not found.`);
          }
            await setDoc(doc(db, `golfTrips/${tripRef.id}/groups/${groupRef.id}/golfers`, golferId), {
              golferRef: golferId,
              golferName: golfer.name,
              score: null,
              dailyHcp: null,
            });
          }));
        }));
  
        alert('Trip and groups created successfully!');
      } catch (error) {
        console.error('Error creating trip: ', error);
        alert('There was an error creating the trip.');
      }
    };
  
    return (
      <div>
        <input
          type="text"
          placeholder="Golf Trip Name"
          value={golfTripName}
          onChange={(e) => setGolfTripName(e.target.value)}
        />
        <input
          type="date"
          value={tripStartDate}
          onChange={(e) => setTripStartDate(e.target.value)}
        />
        <input
          type="date"
          value={tripEndDate}
          onChange={(e) => setTripEndDate(e.target.value)}
        />
        
        {groups.map((group, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder={`Group ${index + 1} Name`}
              value={group.groupName}
              onChange={(e) => handleGroupChange(index, 'groupName', e.target.value)}
            />
            <input
              type="date"
              value={group.groupDate}
              onChange={(e) => handleGroupChange(index, 'groupDate', e.target.value)}
            />
            <select
              multiple
              value={group.golfers}
              onChange={(e) => handleGolferSelection(index, e.target.value)}
            >
              {golfers.map((golfer) => (
                <option key={golfer.id} value={golfer.id}>
                  {golfer.name}
                </option>
              ))}
            </select>
          </div>
        ))}
        <button onClick={addGroup}>Add Group</button>
        <button onClick={handleCreateTrip}>Create Trip</button>
      </div>
    );
  };
  
  export default CreateTrip;