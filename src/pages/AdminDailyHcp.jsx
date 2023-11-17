import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import Papa from 'papaparse';

const AdminDailyHcp = () => {
  const [golfTrips, setGolfTrips] = useState([]);
  const [selectedGolfTripId, setSelectedGolfTripId] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [tees, setTees] = useState([]);
  const [selectedTeeId, setSelectedTeeId] = useState('');
  const [file, setFile] = useState(null);

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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    // Additional validation checks can be added here
    if (!selectedGolfTripId || !selectedCourseId || !selectedTeeId || !file) {
      alert("Please select a golf trip, course, tee, and file before uploading.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const batch = writeBatch(db);

        results.data.forEach((row) => {
          const hcpRef = doc(collection(db, 'golfTrips', selectedGolfTripId, 'courses', selectedCourseId, 'tees', selectedTeeId, 'teeDailyHcps'));
          batch.set(hcpRef, {
            gaHcpLower: parseFloat(row.gaHcpLower),
            gaHcpUpper: parseFloat(row.gaHcpUpper),
            dailyHcp: parseInt(row.dailyHcp, 10)
          });
        });

        await batch.commit();
        alert('Handicap conversions uploaded successfully.');
      },
      error: (error) => {
        console.error('Error parsing CSV: ', error);
        alert('Error parsing CSV file.');
      }
    });
  };

  return (
    <div>
      <h2>Upload Daily Hcp Conversions</h2>
      <div>
        <label>Golf Trip:</label>
        <select onChange={e => setSelectedGolfTripId(e.target.value)} value={selectedGolfTripId}>
          <option value="">Select a trip</option>
          {golfTrips.map(trip => (
            <option key={trip.id} value={trip.id}>{trip.golfTripName}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Course:</label>
        <select onChange={e => setSelectedCourseId(e.target.value)} value={selectedCourseId}>
          <option value="">Select a course</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.courseName}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Tees:</label>
        <select onChange={e => setSelectedTeeId(e.target.value)} value={selectedTeeId}>
          <option value="">Select tees</option>
          {tees.map(tee => (
            <option key={tee.id} value={tee.id}>{tee.teeName}</option>
          ))}
        </select>
      </div>
      <div>
        <input type="file" onChange={handleFileChange} accept=".csv" />
        <button onClick={handleFileUpload} disabled={!file}>Upload</button>
      </div>
    </div>
  );
};

export default AdminDailyHcp;
