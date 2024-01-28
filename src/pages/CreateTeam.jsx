import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';

const CreateTeam = () => {
  const [golfTrips, setGolfTrips] = useState([]);
  const [selectedGolfTripId, setSelectedGolfTripId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [golfers, setGolfers] = useState([]);
  const [selectedGolfers, setSelectedGolfers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch the list of golf trips when the component mounts
    const fetchGolfTrips = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'golfTrips'));
        const trips = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGolfTrips(trips);
      } catch (error) {
        console.error('Error fetching golf trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGolfTrips();
  }, []);

  useEffect(() => {
    // Fetch the golfers for the selected trip
    const fetchTripGolfers = async () => {
      if (selectedGolfTripId) {
        setLoading(true);
        try {
          const tripGolfersSnapshot = await getDocs(collection(db, `golfTrips/${selectedGolfTripId}/golfers`));
          setGolfers(tripGolfersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error('Error fetching trip golfers:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTripGolfers();
  }, [selectedGolfTripId]);

  const handleCreateTeam = async () => {
    if (!selectedGolfTripId || !teamName || selectedGolfers.length === 0) {
      alert('Please fill in all fields and select at least one golfer.');
      return;
    }
  
    setLoading(true);
  
    try {
      // Create an array of references
      const golferRefs = selectedGolfers.map(golferId =>
        doc(db, `golfTrips/${selectedGolfTripId}/golfers/${golferId}`) // Correct way to get the reference
      );
  
      // Add a new team to the Teams subcollection of the selected golf trip
      const teamRef = await addDoc(collection(db, `golfTrips/${selectedGolfTripId}/Teams`), {
        teamName,
        teamMembers: golferRefs // This will be an array of DocumentReferences
      });
  
      // After creating the team, update each selected golfer's document with the team name
      const teamId = teamRef.id; // Get the new team's ID
      await Promise.all(selectedGolfers.map(golferId => {
        const golferDocRef = doc(db, `golfTrips/${selectedGolfTripId}/golfers/${golferId}`);
        return updateDoc(golferDocRef, {
          teamName: teamName, // Add the teamName field to the golfer's document
          teamId: teamRef // You can also store the team's ID for reference
        });
      }));

      console.log('Team created successfully with golfers.');
      setTeamName(''); // Reset the input field for team name
      setSelectedGolfers([]); // Reset the selected golfers array
    } catch (error) {
      console.error('Error creating team with golfers:', error);
      alert('There was an error creating the team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

return (
<div className="create-team-container">
<h2>Create a New Team</h2>
{/* Golf Trip Selection Dropdown */}
<div className="form-group">
<label htmlFor="golfTripSelect">Select Golf Trip:</label>
<select
id="golfTripSelect"
value={selectedGolfTripId}
onChange={(e) => setSelectedGolfTripId(e.target.value)}
disabled={loading}
>
<option value="">--Please choose a golf trip--</option>
{golfTrips.map(trip => (
<option key={trip.id} value={trip.id}>
{trip.golfTripName}
</option>
))}
</select>
</div>
 {/* Team Name Input */}
 <div className="form-group">
    <label htmlFor="teamName">Team Name:</label>
    <input
      type="text"
      id="teamName"
      value={teamName}
      onChange={(e) => setTeamName(e.target.value)}
      placeholder="Enter team name"
      disabled={loading}
    />
  </div>

  {/* Golfers Multi-Select Dropdown */}
  <div className="form-group">
  <label htmlFor="golfersSelect">Select Golfers:</label>
  <select
    multiple
    id="golfersSelect"
    value={selectedGolfers}
    onChange={(e) => {
      // Create an array from the selected options
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setSelectedGolfers(selectedOptions);
    }}
    disabled={loading}
    size={golfers.length} // Optional: to control how many options are visible without scrolling
  >
    {golfers.map(golfer => (
      <option key={golfer.id} value={golfer.id}>
        {golfer.golferName}
      </option>
    ))}
  </select>
</div>

  {/* Create Team Button */}
  <button onClick={handleCreateTeam} disabled={loading}>
    {loading ? 'Creating...' : 'Create Team'}
  </button>
</div>
);
};

export default CreateTeam;