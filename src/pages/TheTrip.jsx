/* 
TheTrip page
The ../components/GolferItem is called to show the Golfers name, handicap, ga details and a link to update their profile.
The ../components/GolferTripItem to show the trips that the golfer is registered in.
The ../components/DateDetails takes the selected date of the trip and displays the groups that the golfer is in on the right hand render   
*/
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const TheTrip = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await firestore.collection('your_collection_name').get();
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(docs);
    };

    fetchData();
  }, []);

  return (
    <div>
      {documents.map(doc => (
        <div key={doc.id}>
          {/* Display your document data here */}
          <p>{doc.someField}</p> {/* Replace 'someField' with your document fields */}
        </div>
      ))}
    </div>
  );
};
  export default TheTrip;