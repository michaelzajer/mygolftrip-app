/*
This page is called from ./pages/Admin.jsx it creates the daily handicaps for a tee block
*/

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
    <div className="p-6 bg-background-100 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-blue-500">Upload Daily Hcp Conversions</h2>
  
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Golf Trip:</label>
          <select
            onChange={e => setSelectedGolfTripId(e.target.value)}
            value={selectedGolfTripId}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select a trip</option>
            {golfTrips.map(trip => (
              <option key={trip.id} value={trip.id}>{trip.golfTripName}</option>
            ))}
          </select>
        </div>
  
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Course:</label>
          <select
            onChange={e => setSelectedCourseId(e.target.value)}
            value={selectedCourseId}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.courseName}</option>
            ))}
          </select>
        </div>
  
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Tees:</label>
          <select
            onChange={e => setSelectedTeeId(e.target.value)}
            value={selectedTeeId}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select tees</option>
            {tees.map(tee => (
              <option key={tee.id} value={tee.id}>{tee.teeName}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Upload CSV File:</label>
        <input 
          type="file" 
          onChange={handleFileChange} 
          accept=".csv" 
          className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="flex justify-center">
        <button 
          onClick={handleFileUpload} 
          disabled={!file}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          Upload
        </button>
      </div>
    </div>
  </div>
);
};

export default AdminDailyHcp;
