/* 
MyTrips landing page.
The ../components/GolferItem is called to show the Golfers name, handicap, ga details and a link to update their profile.
The ../components/GolferTripItem to show the trips that the golfer is registered in.
The ../components/DateDetails takes the selected date of the trip and displays the groups that the golfer is in on the right hand render   
*/
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import GolferItem from "../components/GolferItem";
import GolferTripItem from "../components/GolferTripItem";
import DateDetails from '../components/DateDetails';

const MyTrips = () => {
  const [selectedDateInfo, setSelectedDateInfo] = useState({ date: null, golfTripId: null });
  const [myTrips, setMyTrips] = useState([]);
  const [showLeftComponent, setShowLeftComponent] = useState(true); // New state for sidebar visibility
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
 
  const golferId = auth.currentUser?.uid;

 
  useEffect(() => {
    const fetchMyTrips = async () => {
      if (!golferId) {
        return;
      }
  
      const myTripsData = [];
      const tripsSnapshot = await getDocs(collection(db, "golfTrips"));
  
      for (const tripDoc of tripsSnapshot.docs) {
        const golferRef = doc(db, "golfTrips", tripDoc.id, "golfers", golferId);
        const golferSnap = await getDoc(golferRef);
  
        if (golferSnap.exists()) {
          const groupsSnapshot = await getDocs(collection(db, `golfTrips/${tripDoc.id}/groups`));
          const groupsData = groupsSnapshot.docs.map(groupDoc => ({
            ...groupDoc.data(),
            id: groupDoc.id
          }));
  
          myTripsData.push({
            ...tripDoc.data(),
            id: tripDoc.id,
            groups: groupsData,
          });
        }
      }
  
      myTripsData.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      setMyTrips(myTripsData);
  
      // Inside fetchMyTrips, after you have fetched the trips...
      if (myTripsData.length > 0) {
        const firstTripId = myTripsData[0].id;
        await fetchTeams(firstTripId);
      }
    };
  
    fetchMyTrips();
  }, [golferId]);

  const fetchTeams = async (tripId) => {
    setLoading(true);
    try {
      // Get the snapshot of the Teams collection within a specific golf trip
      const teamsSnapshot = await getDocs(collection(db, `golfTrips/${tripId}/Teams`));
      let teamsData = [];
  
      // Loop through each team document
      for (const teamDoc of teamsSnapshot.docs) {
        // Extract team data
        const teamData = { ...teamDoc.data(), id: teamDoc.id, members: [] };
  
        // Check if teamMembers is an array and proceed
        if (Array.isArray(teamData.teamMembers)) {
          // Resolve all member document references concurrently
          const memberDocsPromises = teamData.teamMembers.map(memberRef => {
            // No need to convert, memberRef is already a DocumentReference
            return getDoc(memberRef);
          });
  
          // Wait for all member documents to be fetched
          const memberDocs = await Promise.all(memberDocsPromises);
          
          // Filter out any non-existent documents and extract data
          const memberDetails = memberDocs
            .filter(docSnapshot => docSnapshot.exists())
            .map(docSnapshot => ({
              id: docSnapshot.id,
              ...docSnapshot.data()
            }));
  
          // Add the member details to the teamData object
          teamData.members = memberDetails;
        }
  
        // Add the complete team data to the teamsData array
        teamsData.push(teamData);
      }
  
      // Update the state with the fetched team data
      setTeams(teamsData);
    } catch (error) {
      // Handle any errors that occur during the fetch
      console.error('Error fetching teams and member details:', error);
    } finally {
      // Ensure loading state is updated whether the fetch succeeds or fails
      setLoading(false);
    }
  };


    // Define the callback function to handle date selection
    const handleDateSelect = (date, golfTripId) => {
      setSelectedDateInfo({ date, golfTripId }); // Update the selected date, trip ID, and group ID
    };

    // Callback function to hide the Left Component
  const handleHideLeftComponent = () => {
    setShowLeftComponent(false);
  };

  // Callback function to show the Left Component
  const handleShowLeftComponent = () => {
    setShowLeftComponent(true);
  };
  
    return (
      <div className="flex justify-center px-6 py-12 bg-bground-100">
        <div className="max-w-7xl w-full mx-auto">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            {/* Left Components - Conditionally render the left component based on left component state */}
              {showLeftComponent && (
                <div className="flex-shrink-0 w-full md:w-1/3 shadow-md">
                  <GolferItem golferRef={golferId} />
                  <GolferTripItem onDateSelect={handleDateSelect} />
                </div>
              )}

            {/* Right Components */}
            <div className="w-full">

            <div className="container mx-auto p-4">
              <div className="flex justify-center items-center gap-8">
                {/* First Team Container */}
                {teams.length > 0 && (
                  <div className="w-full md:w-1/2">
                    <div className="mt-4 bg-bground-100 shadow-lg rounded-lg">
                      <div className="flex items-center justify-between bg-blue-100 text-yellow-100 py-2 px-4 rounded-t-lg">
                        <h3 className="text-sm sm:text-m lg:text-m font-semibold">{teams[0].teamName}</h3>
                      </div>
                      <div className="text-sm sm:text-sm lg:text-m font-medium text-center border-b">
                        {teams[0].members.map((member, index) => (
                          <div key={index} className="flex items-center justify-between border-b p-2">
                            <div className="w-full text-center">{member.golferName}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* VS Separator */}
                <div className="text-2xl sm:text-3xl font-bold px-4">
                  VS
                </div>

                {/* Second Team Container */}
                {teams.length > 1 && (
                  <div className="w-full md:w-1/2">
                    <div className="mt-4 bg-bground-100 shadow-lg rounded-lg">
                      <div className="flex items-center justify-between bg-blue-100 text-yellow-100 py-2 px-4 rounded-t-lg">
                        <h3 className="text-sm sm:text-m lg:text-m font-semibold">{teams[1].teamName}</h3>
                      </div>
                      <div className="text-sm sm:text-sm lg:text-m font-medium text-center border-b">
                        {teams[1].members.map((member, index) => (
                          <div key={index} className="flex items-center justify-between border-b p-2">
                            <div className="w-full text-center">{member.golferName}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

              {/* Render DateDetails if a date is selected */}
              {selectedDateInfo.date && (
                <DateDetails
                  selectedDate={selectedDateInfo.date}
                  golferId={golferId}
                  onHideLeftComponent={handleHideLeftComponent}
                  onShowLeftComponent={handleShowLeftComponent}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default MyTrips;