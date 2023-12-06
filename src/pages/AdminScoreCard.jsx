import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';

const AdminScoreCard = () => {
  const [golfTrips, setGolfTrips] = useState([]);
  const [selectedGolfTripId, setSelectedGolfTripId] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [tees, setTees] = useState([]);
  const [selectedTeeId, setSelectedTeeId] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  useEffect(() => {
    const fetchGolfTrips = async () => {
      const querySnapshot = await getDocs(collection(db, 'golfTrips'));
      setGolfTrips(querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })));
    };
    fetchGolfTrips();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (selectedGolfTripId) {
        const querySnapshot = await getDocs(collection(db, 'golfTrips', selectedGolfTripId, 'courses'));
        setCourses(querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })));
      }
    };
    fetchCourses();
  }, [selectedGolfTripId]);

  useEffect(() => {
    const fetchTees = async () => {
      if (selectedCourseId) {
        const querySnapshot = await getDocs(collection(db, 'golfTrips', selectedGolfTripId, 'courses', selectedCourseId, 'tees'));
        setTees(querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })));
      }
    };
    fetchTees();
  }, [selectedGolfTripId, selectedCourseId]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (selectedGolfTripId) {
        const querySnapshot = await getDocs(collection(db, 'golfTrips', selectedGolfTripId, 'groups'));
        setGroups(querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })));
      }
    };
    fetchGroups();
  }, [selectedGolfTripId]);

  const createScorecardReferencesForGroup = async () => {
    if (!selectedGolfTripId || !selectedCourseId || !selectedTeeId || !selectedGroupId) {
      console.error("Please select a golf trip, course, tee, and group before creating scorecards.");
      return;
    }

    // Fetch golfers in the group
    const golfersCollectionRef = collection(db, 'golfTrips', selectedGolfTripId, 'groups', selectedGroupId, 'golfers');
    const golfersSnapshot = await getDocs(golfersCollectionRef);
    const golfersData = golfersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Write references to the course, tee, and holes to each golfer's scorecard
    const batch = writeBatch(db);

    for (const golferDoc of golfersSnapshot.docs) {
      const golfer = {
        id: golferDoc.id,
        ...golferDoc.data(),
      };
  
      const scorecardRef = doc(collection(db, 'golfTrips', selectedGolfTripId, 'groups', selectedGroupId, 'golfers', golfer.id, 'scorecards'));
      const scorecardData = {
        courseRef: doc(db, 'golfTrips', selectedGolfTripId, 'courses', selectedCourseId).path,
        teeRef: doc(db, 'golfTrips', selectedGolfTripId, 'courses', selectedCourseId, 'tees', selectedTeeId).path,
        holes: [],
        scores: {}
      };
  
      const holesSnapshot = await getDocs(collection(db, 'golfTrips', selectedGolfTripId, 'courses', selectedCourseId, 'tees', selectedTeeId, 'holes'));
      holesSnapshot.forEach(holeDoc => {
        scorecardData.holes.push(holeDoc.ref.path);
        scorecardData.scores[holeDoc.id] = 0;
      });
  
      batch.set(scorecardRef, scorecardData);
    }
  
    await batch.commit();
    alert('Scorecards created successfully');
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-blue-500">Create Scorecards for Golfers</h2>
        
        <div className="mb-4">
          <label className="block text-grey-700 text-sm font-bold mb-2">Golf Trip:</label>
          <select 
            className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight focus:outline-none focus:shadow-outline"
            onChange={e => setSelectedGolfTripId(e.target.value)} 
            value={selectedGolfTripId}
          >
            <option value="">Select a trip</option>
            {golfTrips.map(trip => (
              <option key={trip.id} value={trip.id}>{trip.golfTripName}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-grey-700 text-sm font-bold mb-2">Course:</label>
          <select 
            className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight focus:outline-none focus:shadow-outline"
            onChange={e => setSelectedCourseId(e.target.value)} 
            value={selectedCourseId}
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.courseName}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-grey-700 text-sm font-bold mb-2">Tees:</label>
          <select 
            className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight focus:outline-none focus:shadow-outline"
            onChange={e => setSelectedTeeId(e.target.value)} 
            value={selectedTeeId}
          >
            <option value="">Select tees</option>
            {tees.map(tee => (
              <option key={tee.id} value={tee.id}>{tee.teeName}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-grey-700 text-sm font-bold mb-2">Group:</label>
          <select 
            className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight focus:outline-none focus:shadow-outline"
            onChange={e => setSelectedGroupId(e.target.value)} 
            value={selectedGroupId}
          >
            <option value="">Select a group</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.groupDate}{group.groupName}</option>
            ))}
          </select>
        </div>

        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => createScorecardReferencesForGroup()}
        >
          Create Scorecards
        </button>
      </div>
    </div>
  );
};

export default AdminScoreCard;