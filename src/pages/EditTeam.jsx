import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, getDoc, query, where, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const EditTeam = () => {
  const [golfTrips, setGolfTrips] = useState([]);
  const [selectedGolfTripId, setSelectedGolfTripId] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableGolfers, setAvailableGolfers] = useState([]);
  const [selectedGolfer, setSelectedGolfer] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGolfTrips = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'golfTrips'));
        setGolfTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching golf trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGolfTrips();
  }, []);

  useEffect(() => {
    const fetchTeamsAndGolfers = async () => {
      if (selectedGolfTripId) {
        setLoading(true);
        try {
          const teamsSnapshot = await getDocs(collection(db, `golfTrips/${selectedGolfTripId}/Teams`));
          setTeams(teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          const golfersSnapshot = await getDocs(collection(db, `golfTrips/${selectedGolfTripId}/golfers`));
          setAvailableGolfers(golfersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error('Error fetching teams or golfers:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTeamsAndGolfers();
  }, [selectedGolfTripId]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (selectedTeamId) {
        setLoading(true);
        try {
          const teamRef = doc(db, `golfTrips/${selectedGolfTripId}/Teams`, selectedTeamId);
          const teamSnapshot = await getDoc(teamRef);
          if (teamSnapshot.exists()) {
            const members = teamSnapshot.data().teamMembers || [];
            setTeamMembers(members.map(memberRef => memberRef.id)); // Assuming teamMembers is an array of references
          }
        } catch (error) {
          console.error('Error fetching team members:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTeamMembers();
  }, [selectedTeamId, selectedGolfTripId]);

  const handleAddGolfer = async () => {
    if (selectedGolfer) {
      setLoading(true);
      try {
        const teamRef = doc(db, `golfTrips/${selectedGolfTripId}/Teams`, selectedTeamId);
        await updateDoc(teamRef, {
          teamMembers: arrayUnion(doc(db, `golfTrips/${selectedGolfTripId}/golfers`, selectedGolfer))
        });
        setTeamMembers(prevMembers => [...prevMembers, selectedGolfer]);
        setSelectedGolfer('');
      } catch (error) {
        console.error('Error adding golfer to team:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveGolfer = async (golferId) => {
    setLoading(true);
    try {
      const teamRef = doc(db, `golfTrips/${selectedGolfTripId}/Teams`, selectedTeamId);
      await updateDoc(teamRef, {
      teamMembers: arrayRemove(doc(db, `golfTrips/${selectedGolfTripId}/golfers`, golferId))
      });
      setTeamMembers(prevMembers => prevMembers.filter(member => member !== golferId));
} catch (error) {
console.error('Error removing golfer from team:', error);
} finally {
setLoading(false);
}
};

return (
<div className="edit-team-container">
<h2>Edit Team</h2>
{loading && <p>Loading...</p>}
<div>
<label htmlFor="golfTripSelect">Select Golf Trip:</label>
<select
id="golfTripSelect"
value={selectedGolfTripId}
onChange={(e) => setSelectedGolfTripId(e.target.value)}
disabled={loading}
>
<option value="">--Please choose a golf trip--</option>
{golfTrips.map((trip) => (
<option key={trip.id} value={trip.id}>{trip.golfTripName}</option>
))}
</select>
</div>
{selectedGolfTripId && (
<div>
<label htmlFor="teamSelect">Select Team:</label>
<select
id="teamSelect"
value={selectedTeamId}
onChange={(e) => setSelectedTeamId(e.target.value)}
disabled={loading}
>
<option value="">--Please choose a team--</option>
{teams.map((team) => (
<option key={team.id} value={team.id}>{team.teamName}</option>
))}
</select>
</div>
)}
{selectedTeamId && (
<>
<div>
<h3>Add Golfer to Team:</h3>
<select
value={selectedGolfer}
onChange={(e) => setSelectedGolfer(e.target.value)}
disabled={loading}
>
<option value="">--Please choose a golfer--</option>
{availableGolfers.map((golfer) => (
<option key={golfer.id} value={golfer.id}>{golfer.golferName}</option>
))}
</select>
<button onClick={handleAddGolfer} disabled={!selectedGolfer || loading}>Add Golfer</button>
</div>
<div>
<h3>Current Golfers:</h3>
<ul>
{teamMembers.map((golferId) => {
const golfer = availableGolfers.find(g => g.id === golferId);
return (
<li key={golferId}>
{golfer ? golfer.golferName : 'Golfer not found'}
<button onClick={() => handleRemoveGolfer(golferId)} disabled={loading}>Remove</button>
</li>
);
})}
</ul>
</div>
</>
)}
</div>
);
};

export default EditTeam;