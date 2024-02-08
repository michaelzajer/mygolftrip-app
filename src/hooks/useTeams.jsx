import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export const useTeams = (golfTripId, golferId) => {
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
        console.log("useTeams called with golfTripId:", golfTripId, "golferId:", golferId);

      const fetchTeams = async () => {
        if (!golfTripId || !golferId) {
          setIsLoading(false);
          return;
        }
  
        setIsLoading(true);
        try {
          const teamsSnapshot = await getDocs(collection(db, `golfTrips/${golfTripId}/Teams`));
          const teamsData = [];
          for (const teamDoc of teamsSnapshot.docs) {
            const teamData = teamDoc.data();
            if (teamData.teamMembers.includes(golferId)) {
              // Fetch team member details
              const memberDetails = await Promise.all(
                teamData.teamMembers.map(async (memberId) => {
                  const memberDocRef = doc(db, 'golfers', memberId);
                  const memberDocSnap = await getDoc(memberDocRef);
                  return memberDocSnap.exists() ? memberDocSnap.data() : null;
                })
              );
              teamsData.push({
                ...teamData,
                id: teamDoc.id,
                members: memberDetails.filter(Boolean) // Filter out any null values
              });
            }
          }
  
          setTeams(teamsData);
        } catch (error) {
          console.error('Error fetching teams:', error);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchTeams();
    }, [golfTripId, golferId]);
  
    return { teams, isLoading };
  };