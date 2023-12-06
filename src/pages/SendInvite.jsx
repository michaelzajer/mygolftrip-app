// Import necessary hooks and Firebase methods
import { useEffect, useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const SendInvite = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch users and trips similar to how you fetch trips currently
    // Assume users are stored in a Firestore collection named 'users'
    const fetchUsersAndTrips = async () => {
      const usersSnapshot = await getDocs(collection(db, 'golfers'));
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const tripsSnapshot = await getDocs(collection(db, 'golfTrips'));
      setTrips(tripsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchUsersAndTrips();
  }, []);

  // Function to send invite
  const sendInvite = async () => {
    setMessage('');
    try {
      const trip = trips.find(trip => trip.id === selectedTripId);
      if (!trip) {
        setMessage("Trip not found.");
        return;
      }
      const user = users.find(user => user.id === selectedUserId);
      if (!user) {
        setMessage("User not found.");
        return;
      }
  
      // Construct the URL for the join-trip page
      const joinTripUrl = `${window.location.origin}/join-trip?code=${trip.joinCode}`;
  
      await addDoc(collection(db, 'emailRequests'), {
        to: user.email, // Use user.email or user.displayName based on available data
        message: {
          subject: "Join Our Golf Trip",
          html: `<p>You have been invited to join the golf trip: <strong>${trip.golfTripName}</strong>.</p>
                 <p>Please <a href="${joinTripUrl}">click here</a> to join with your code: <strong>${trip.joinCode}</strong></p>`
          // Using HTML content to include a hyperlink
        },
      });
  
      setMessage('Invite sent successfully.');
    } catch (error) {
      setMessage('Error sending invite: ' + error.message);
    }
  };

  return (
    <div>
      {/* User Selection */}
      <select onChange={(e) => setSelectedUserId(e.target.value)}>
        <option value="">Select a Golfer</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>{user.displayName || user.email}</option>
        ))}
      </select>

      {/* Trip Selection */}
      <select onChange={(e) => setSelectedTripId(e.target.value)}>
        <option value="">Select a Golf Trip</option>
        {trips.map(trip => (
          <option key={trip.id} value={trip.id}>{trip.golfTripName}</option>
        ))}
      </select>

      <button onClick={sendInvite}>Send Invite</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SendInvite;