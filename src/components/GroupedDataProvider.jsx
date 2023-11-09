// GroupedDataProvider.jsx
import React, { useState, useEffect } from 'react';
import GroupedDataContext from './GroupedDataContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from "../firebase";

const GroupedDataProvider = ({ children, userId }) => {
    const [groupedData, setGroupedData] = useState(null);
    const t_id = "VlbjNsn7qdkPOGHXYoqM";  // You should determine how to get this value. Maybe from props or another context?

    useEffect(() => {
        async function fetchGroupedData(targetDate) {
            const tripConstructRef = collection(db, `golftrips`, t_id, `tripconstruct`);
            
            let q;
         //   if (targetDate) {
         //       q = query(tripConstructRef, where("date", "==", targetDate));
         //   } else {
         //       q = query(tripConstructRef);
         //   }
         // Add a condition in the query to fetch only data relevant to the userId
            if (targetDate && userId) {
                q = query(tripConstructRef, where("date", "==", targetDate), where("golferRefs", "array-contains", userId));
            } else if (userId) {
                q = query(tripConstructRef, where("golferRefs", "array-contains", userId));
            } else {
                q = query(tripConstructRef);
            }

            const querySnapshot = await getDocs(q);
            console.log("Query returned:", querySnapshot.size, "documents");
            querySnapshot.forEach(documentSnapshot => {
            console.log("Document data:", documentSnapshot.data());
            });
            let results = {};

            if (!querySnapshot.empty) {
                querySnapshot.forEach(documentSnapshot => {
                    const data = documentSnapshot.data();
                    if (!results[data.date]) {
                        results[data.date] = [];
                    }
                    data.groups.forEach(group => {
                        const groupData = {
                            groupName: group.groupName,
                            golfers: []
                        };
                        group.golfers.forEach(golfer => {
                            groupData.golfers.push({
                                golferRef: golfer.golferRef,
                                golferName: golfer.golferName
                            });
                        });
                        results[data.date].push(groupData);
                    });
                });
            } else {
                console.log("No data found.");
            }
            
            setGroupedData(results);
        }
        
        fetchGroupedData();  // If you want to fetch data for a specific date, pass that date as an argument here.
    }, [userId]);

    return (
        <GroupedDataContext.Provider value={groupedData}>
            {children}
        </GroupedDataContext.Provider>
    );
};

export default GroupedDataProvider;
