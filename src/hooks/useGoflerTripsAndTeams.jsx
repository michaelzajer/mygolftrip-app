import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

export const useGolferTripsAndTeams = (golferId) => {
    const [data, setData] = useState({ golferDetails: null, trips: [], isLoading: true });

    useEffect(() => {
        const fetchGolferDetailsAndTrips = async () => {
            if (!golferId) return;

            // Fetch Golfer Details
            const golferDocRef = doc(db, 'golfers', golferId);
            const golferDocSnap = await getDoc(golferDocRef);
            const golferDetails = golferDocSnap.exists() ? golferDocSnap.data() : null;

            console.log('Golfer Details:', golferDetails); // Log Golfer Details

        // Fetch Trips
        const tripsSnapshot = await getDocs(collection(db, 'golfTrips'));
        let tripsData = await Promise.all(tripsSnapshot.docs.map(async (tripDoc) => {
            const tripData = tripDoc.data();

                console.log(`Trip Data for ${tripDoc.id}:`, tripData); // Log Trip Data

                // Fetch Team Details for each Trip
                const teamsSnapshot = await getDocs(collection(db, `golfTrips/${tripDoc.id}/Teams`));
                let teamData = null;

                teamsLoop: for (const teamDoc of teamsSnapshot.docs) {
                    const team = teamDoc.data();
                    for (const memberRef of team.teamMembers) {
                        // Convert the reference path to a document ID
                        const memberId = memberRef.path.split('/').pop();
                        if (memberId === golferId) {
                        // Fetch detailed information for each team member
                        const teamMembersDetailsPromises = team.teamMembers.map(async (memberRef) => {
                            const memberSnap = await getDoc(memberRef);
                            return memberSnap.exists() ? memberSnap.data() : null;
                        });
                        const teamMembersDetails = await Promise.all(teamMembersDetailsPromises);

                        // Now teamData includes detailed information about each member
                        teamData = { ...team, id: teamDoc.id, teamMembers: teamMembersDetails.filter(member => member !== null) };
                        break teamsLoop;
                        }
                    }
                }

                console.log(`Team Data for ${tripDoc.id}:`, teamData); // Log Team Data

                return { ...tripData, id: tripDoc.id, teamData };
            }));

            setData({ golferDetails, trips: tripsData, isLoading: false });
        };

        fetchGolferDetailsAndTrips();
    }, [golferId]);

    return data;
};