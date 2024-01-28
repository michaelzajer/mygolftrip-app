/*
This page is called from ./pages/SendInvite.jsx it is the join trip url sent to a golfer

*/

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const JoinTrip = () => {
  const [tripId, setTripId] = useState('');
  const [tripDetails, setTripDetails] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  useEffect(() => {
    // Check if the URL has a tripId query parameter
    const queryParams = new URLSearchParams(location.search);
    const tripIdParam = queryParams.get('id');
    if (tripIdParam) {
      setTripId(tripIdParam);
      fetchTripDetails(tripIdParam); // Fetch trip details based on tripId
    }
  }, [location]);

  // Fetch trip details based on trip ID
  const fetchTripDetails = async (id) => {
    try {
      const tripRef = doc(db, 'golfTrips', id);
      const tripSnap = await getDoc(tripRef);
      if (tripSnap.exists()) {
        setTripDetails(tripSnap.data());
      } else {
        setStatus("Trip does not exist.");
      }
    } catch (error) {
      setStatus("Failed to fetch trip details.");
    }
  };

  const handleJoinTrip = async () => {
    if (!tripId.trim()) {
        setStatus("Please enter a valid trip ID.");
        return;
    }

    setLoading(true);
    setStatus('');

    try {
        const golfer = auth.currentUser;
        if (!golfer) {
            setStatus("You must be logged in to join a trip.");
            setLoading(false);
            navigate('/login');
            return;
        }

        // Fetch the trip to check if it exists
        const tripRef = doc(db, 'golfTrips', tripId);
        const tripSnap = await getDoc(tripRef);
        if (!tripSnap.exists()) {
            setStatus("Trip does not exist.");
            setLoading(false);
            return;
        }

        // Add golfer to the golfers subcollection of the trip
        const golferRef = doc(db, `golfTrips/${tripId}/golfers`, golfer.uid);
        await setDoc(golferRef, {
            golferName: golfer.displayName || '',
            golferRef: golfer.uid
        });

        setStatus("Successfully joined the trip.");
        navigate('/mytrips');
    } catch (error) {
        setStatus(`Error joining the trip: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div>
      {tripDetails && (
        <>
          <h1>Join Golf Trip: {tripDetails.golfTripName}</h1>
          <p>Welcome, {auth.currentUser?.displayName || ''}</p>
        </>
      )}
      <input
        type="text"
        value={tripId}
        onChange={(e) => setTripId(e.target.value)}
        placeholder="Enter Golf Trip ID"
      />
      <button onClick={handleJoinTrip} disabled={loading}>
        {loading ? "Joining..." : "Join Trip"}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default JoinTrip;