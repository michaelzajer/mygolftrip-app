import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  getDoc,
  doc
} from 'firebase/firestore';

const CreateDaysPairs = () => {
  const [golfTrips, setGolfTrips] = useState([]);
  const [selectedGolfTripId, setSelectedGolfTripId] = useState('');
  const [dayDate, setDayDate] = useState('');
  const [dayNo, setDayNo] = useState('');
  const [teams, setTeams] = useState([]);
  const [teamAPair, setTeamAPair] = useState([]);
  const [teamBPair, setTeamBPair] = useState([]);
  const [loading, setLoading] = useState(false);
  const [golfers, setGolfers] = useState([]); // Add a new state for golfers
  const [selectedTeamAId, setSelectedTeamAId] = useState('');
  const [selectedTeamBId, setSelectedTeamBId] = useState('');
  const [golfersTeamA, setGolfersTeamA] = useState([]);
  const [golfersTeamB, setGolfersTeamB] = useState([]);

  useEffect(() => {
    const fetchGolfTrips = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'golfTrips'));
        const trips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGolfTrips(trips);
      } catch (error) {
        console.error('Error fetching golf trips:', error);
      }
      setLoading(false);
    };
  
    fetchGolfTrips();
  }, []);
  // When a golf trip is selected, fetch the golfers for that trip
  useEffect(() => {
    const fetchGolfers = async () => {
      if (!selectedGolfTripId) return;
      setLoading(true);
      try {
        const golfersQuery = query(collection(db, `golfTrips/${selectedGolfTripId}/golfers`));
        const querySnapshot = await getDocs(golfersQuery);
        setGolfers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching golfers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGolfers();
  }, [selectedGolfTripId]);

  // Fetch the list of teams when the selectedGolfTripId changes
  useEffect(() => {
    const fetchTeams = async () => {
      if (!selectedGolfTripId) return;
      setLoading(true);
      try {
        const teamsQuery = query(collection(db, `golfTrips/${selectedGolfTripId}/Teams`));
        const querySnapshot = await getDocs(teamsQuery);
        setTeams(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [selectedGolfTripId]);

  // Fetch golfers when a team is selected
  useEffect(() => {
    const fetchGolfersForTeam = async (teamId, setGolfers) => {
        if (!teamId) return;
        try {
          const teamRef = doc(db, `golfTrips/${selectedGolfTripId}/Teams`, teamId);
          const teamSnap = await getDoc(teamRef);
          if (!teamSnap.exists()) {
            throw new Error('Team not found');
          }
          const teamData = teamSnap.data();
          // Check if the team has members and if it's an array
          if (teamData.teamMembers && Array.isArray(teamData.teamMembers)) {
            const golferRefs = teamData.teamMembers;
            const golferPromises = golferRefs.map((golferRef) => getDoc(golferRef));
            const golferDocs = await Promise.all(golferPromises);
            const golfers = golferDocs.map((doc) => doc.exists() ? { id: doc.id, ...doc.data() } : null).filter(Boolean);
            setGolfers(golfers);
          } else {
            // If members are not set or not an array, set an empty array
            setGolfers([]);
          }
        } catch (error) {
          console.error('Error fetching golfers for team:', error);
        }
      };

    // Fetch golfers for selected Team A
    fetchGolfersForTeam(selectedTeamAId, setGolfersTeamA);
    // Fetch golfers for selected Team B
    fetchGolfersForTeam(selectedTeamBId, setGolfersTeamB);
  }, [selectedTeamAId, selectedTeamBId, selectedGolfTripId]);

  const createDayAndPairs = async () => {
    if (!dayDate || !dayNo || teamAPair.length === 0 || teamBPair.length === 0) {
      alert('Please fill in all the fields');
      return;
    }
  
    setLoading(true);
    try {
      // Check if the day already exists
      const daysQuery = query(collection(db, `golfTrips/${selectedGolfTripId}/Days`), where('date', '==', dayDate));
      const daysSnapshot = await getDocs(daysQuery);
      let dayRef;
  
      if (daysSnapshot.empty) {
        // Add a new Day document if it doesn't exist
        dayRef = await addDoc(collection(db, `golfTrips/${selectedGolfTripId}/Days`), {
          date: dayDate,
          dayNo,
        });
      } else {
        // Use the existing Day document reference
        dayRef = daysSnapshot.docs[0].ref;
      }
  
      // Find the selected teams' names using their IDs
      const teamA = teams.find(team => team.id === selectedTeamAId);
      const teamB = teams.find(team => team.id === selectedTeamBId);
      if (!teamA || !teamB) {
        alert('Selected teams not found');
        return;
      }
  
      // Construct the golfer objects for Team A and Team B
      const golfersInPair = [...teamAPair, ...teamBPair].map(golferId => ({
        id: golferId,
        teamName: teamAPair.includes(golferId) ? teamA.teamName : teamB.teamName,
        totalPoints: 0, // Initialize total points
        totalScore: 0,  // Initialize total score
      }));
  
      // Add new Pairs document for this day with golfer references
      await addDoc(collection(db, `golfTrips/${selectedGolfTripId}/Days/${dayRef.id}/Pairs`), {
        golfers: golfersInPair,
        dayNo, // Include the day number
        date: dayDate, // Include the date

      });
  
      alert('Day and pairs created successfully!');
    } catch (error) {
      console.error('Error creating day and pairs:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... include UI for input fields and a submit button to call createDayAndPairs ...

  return (
    <div className="container mx-auto p-4">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex flex-col space-y-4">
          {/* Golf Trip Select */}
          <div>
            <label htmlFor="golfTripSelect" className="block text-sm font-medium text-gray-700">
              Select Golf Trip
            </label>
            <select
              id="golfTripSelect"
              value={selectedGolfTripId}
              onChange={(e) => setSelectedGolfTripId(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            >
              <option value="">Select a golf trip</option>
              {golfTrips.map((trip) => (
                <option key={trip.id} value={trip.id}>{trip.golfTripName}</option>
              ))}
            </select>
          </div>

          {/* Day Date Input */}
          <div>
            <label htmlFor="dayDate" className="block text-sm font-medium text-gray-700">
              Day Date
            </label>
            <input
              type="date"
              id="dayDate"
              value={dayDate}
              onChange={(e) => setDayDate(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Day Number Input */}
          <div>
            <label htmlFor="dayNo" className="block text-sm font-medium text-gray-700">
              Day Number
            </label>
            <input
              type="number"
              id="dayNo"
              value={dayNo}
              onChange={(e) => setDayNo(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
            {/* Select Team A */}
            <div>
                <label htmlFor="teamASelect" className="block text-sm font-medium text-gray-700">
                Select Team A
                </label>
                <select
                id="teamASelect"
                value={selectedTeamAId}
                onChange={(e) => setSelectedTeamAId(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                <option value="">Select Team A</option>
                {teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.teamName}</option>
                ))}
            </select>
          </div>
 {/* Select Team B */}
 <div>
            <label htmlFor="teamBSelect" className="block text-sm font-medium text-gray-700">
              Select Team B
            </label>
            <select
              id="teamBSelect"
              value={selectedTeamBId}
              onChange={(e) => setSelectedTeamBId(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              >
              <option value="">Select Team B</option>
              {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.teamName}</option>
              ))}
              </select>
              </div>

        {/* Select golfers for Team A Pair */}
      <div>
        <label htmlFor="teamAPair" className="block text-sm font-medium text-gray-700">
          Team A Pair
        </label>
        <select
          id="teamAPair"
          multiple
          value={teamAPair}
          onChange={(e) => setTeamAPair([...e.target.selectedOptions].map((o) => o.value))}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        >
          {golfersTeamA.map((golfer) => (
            <option key={golfer.id} value={golfer.id}>
              {golfer.golferName}
            </option>
          ))}
        </select>
      </div>

      {/* Select golfers for Team B Pair */}
      <div>
        <label htmlFor="teamBPair" className="block text-sm font-medium text-gray-700">
          Team B Pair
        </label>
        <select
          id="teamBPair"
          multiple
          value={teamBPair}
          onChange={(e) => setTeamBPair([...e.target.selectedOptions].map((o) => o.value))}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        >
          {golfersTeamB.map((golfer) => (
            <option key={golfer.id} value={golfer.id}>
              {golfer.golferName}
            </option>
          ))}
        </select>
      </div>

  {/* Submit Button */}
  <button
          onClick={createDayAndPairs}
          disabled={loading || !selectedGolfTripId || teamAPair.length === 0 || teamBPair.length === 0}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Day and Pairs
        </button>
      </div>
    )}
  </div>
);
};

export default CreateDaysPairs;