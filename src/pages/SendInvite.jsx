/*
This page is called from ./pages/SendInvite.jsx it sends an invite for a trip.

*/

import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const SendInvite = () => {
  const [email, setEmail] = useState('');
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, 'golfTrips'), where('creatorId', '==', user.uid));
        const tripsSnapshot = await getDocs(q);
        setTrips(tripsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };

    fetchTrips();
  }, []);

  const sendInvite = async () => {
    setMessage('');
    try {
      const trip = trips.find(trip => trip.id === selectedTripId);
      if (!trip) {
        setMessage("Trip not found.");
        return;
      }
  
      const joinTripUrl = `${window.location.origin}/join-trip?id=${selectedTripId}`;
  
      await addDoc(collection(db, 'emailRequests'), {
        to: email,
        message: {
          subject: "Join Our Golf Trip",
          html: `<p>You have been invited to join the golf trip: <strong>${trip.golfTripName}</strong>.</p>
                 <p>Please <a href="${joinTripUrl}">click here</a> to join with your code: <strong>${trip.selectedTripId}</strong></p>`
        },
      });
  
      setMessage('Invite sent successfully.');
    } catch (error) {
      setMessage('Error sending invite: ' + error.message);
    }
  };

  return (
    <div>
      {/* Email Input */}
      <input
        type="email"
        placeholder="Enter golfer's email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* Trip Selection */}
      <select value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)}>
        <option value="">Select a Golf Trip</option>
        {trips.map(trip => (
          <option key={trip.id} value={trip.id}>{trip.golfTripName}</option>
        ))}
      </select>

      <button onClick={sendInvite} disabled={!email || !selectedTripId}>Send Invite</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SendInvite;