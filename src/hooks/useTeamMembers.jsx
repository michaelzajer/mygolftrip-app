import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const useTeamMembers = (teamMemberRefs) => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoading(true);
      const memberDetailsPromises = teamMemberRefs.map((memberRef) => getDoc(doc(db, memberRef)));
      const memberDetailsSnapshots = await Promise.all(memberDetailsPromises);

      const fetchedMembers = memberDetailsSnapshots.map((snapshot) => ({
        id: snapshot.id,
        ...snapshot.data(),
      }));

      setMembers(fetchedMembers);
      setIsLoading(false);
    };

    if (teamMemberRefs.length > 0) {
      fetchTeamMembers();
    } else {
      setMembers([]);
      setIsLoading(false);
    }
  }, [teamMemberRefs]);

  return { members, isLoading };
};