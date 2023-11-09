import React, { useState } from 'react';

import { useTable, useSortBy } from 'react-table';
import { doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

export function MyTripsDisplay({ tripsData }) {
    const auth = getAuth();
    const [changes, setChanges] = useState({});
    const [editingRow, setEditingRow] = useState(null);

    // Function to toggle the editing state
    const toggleEditing = (tripId, groupName, golferRef) => {
        const key = `${tripId}-${groupName}-${golferRef}`;
        setEditingRow(editingRow === key ? null : key);
    };

// Function to save changes for an individual row
const saveRowChanges = async (tripId, groupName, golferRef) => {
    const key = `${tripId}-${groupName}-${golferRef}`;
    const golferChanges = changes[tripId]?.[groupName]?.[golferRef];
  
    // Check if there are changes for the current row
    if (golferChanges) {
      try {
        // Construct the document reference
        const golferDocRef = tripsData
       
        console.log(golferDocRef);
        // Update the document with changes
        await updateDoc(golferDocRef, golferChanges);
  
        console.log('Changes saved for golfer:', golferRef);
  
        // Clear changes for this golfer in the state after successful update
        setChanges(prevChanges => {
          // Clone the current changes
          const updatedChanges = { ...prevChanges };
  
          // Remove the golfer's changes from the cloned object
          delete updatedChanges[tripId][groupName][golferRef];
  
          // If the group is now empty, remove the group
          if (Object.keys(updatedChanges[tripId][groupName]).length === 0) {
            delete updatedChanges[tripId][groupName];
          }
  
          // If the trip is now empty, remove the trip
          if (Object.keys(updatedChanges[tripId]).length === 0) {
            delete updatedChanges[tripId];
          }
  
          return updatedChanges;
        });
      } catch (error) {
        console.error('Error saving changes for golfer:', golferRef, error);
        // Handle the error state properly in the UI
      }
    } else {
      console.log('No changes to save for golfer:', golferRef);
    }
  
    // Toggle off the editing for this row regardless of save success
    toggleEditing(tripId, groupName, golferRef);
  };


    // Flatten data for table structure
    const data = React.useMemo(() => {
        const flattenedData = [];
        tripsData.forEach(trip => {
            const { date, groups } = trip.data;
            groups.forEach(group => {
                group.golfers.forEach(golfer => {
                    flattenedData.push({
                        date: date,
                        groupName: group.groupName,
                        golferName: golfer.golferName,
                        golferGroupScore: golfer.golferGroupScore, // Assuming `score` is now part of your golfer data
                        dailyHcp: golfer.dailyHcp // Assuming `handicap` is now part of your golfer data
                    });
                });
            });
        });
        return flattenedData;
    }, [tripsData]);

    // Define columns for MyTripsDisplay
    const columns = React.useMemo(
        () => [
            {
                Header: 'Date',
                accessor: 'date',
            },
            {
                Header: 'Group',
                accessor: 'groupName',
            },
            {
                Header: 'Golfer Name',
                accessor: 'golferName',
            },
            {
                Header: 'Score',
                accessor: 'golferGroupScore',
            },
            {
                Header: 'Daily Hcp',
                accessor: 'dailyHcp',
            },
        ],
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data }, useSortBy);

    const handleHcpChange = (e, tripId, groupName, golferRef) => {
        const updatedValue = e.target.value;
        setChanges(prevChanges => ({
          ...prevChanges,
          [tripId]: {
            ...(prevChanges[tripId] || {}),
            [groupName]: {
              ...(prevChanges[tripId]?.[groupName] || {}),
              [golferRef]: {
                ...(prevChanges[tripId]?.[groupName]?.[golferRef] || {}),
                dailyHcp: updatedValue,
              },
            },
          },
        }));
      };
    
      const handleScoreChange = (e, tripId, groupName, golferRef) => {
        const updatedValue = e.target.value;
        setChanges(prevChanges => ({
          ...prevChanges,
          [tripId]: {
            ...(prevChanges[tripId] || {}),
            [groupName]: {
              ...(prevChanges[tripId]?.[groupName] || {}),
              [golferRef]: {
                ...(prevChanges[tripId]?.[groupName]?.[golferRef] || {}),
                golferGroupScore: updatedValue,
              },
            },
          },
        }));
      };
    
      const handleSaveChanges = async () => {
        try {
          // If there are no changes, you might want to early exit or handle accordingly
          if (Object.keys(changes).length === 0) {
            console.log('No changes to save');
            return;
          }
      
          // Start a batch
          const batch = writeBatch(db);
      
          for (const [tripId, groupChanges] of Object.entries(changes)) {
            for (const [groupName, golferChanges] of Object.entries(groupChanges)) {
              for (const [golferRef, golferData] of Object.entries(golferChanges)) {
                // Construct the document reference
                const golferDocRef = doc(db, "golftrips", tripId, "tripconstruct", groupName, "golfers", golferRef);
      
                // Update the document
                batch.update(golferDocRef, golferData);
              }
            }
          }
      
          // Commit the batch
          await batch.commit();
          console.log('All changes saved successfully');
      
          // Clear the changes after successful update
          setChanges({});
        } catch (error) {
          console.error("Error saving changes: ", error);
          // Handle the error state properly in the UI
        }
      };

    return (
        <div className="space-y-4">
            {tripsData.map(trip => (
                <div key={trip.id} className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                    {trip.data.groups.map((group, index) => (
                        <div key={index} className={`border-t pt-2 ${index !== 0 ? 'mt-4' : ''}`}>
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-sm font-semibold text-gray-500">{trip.data.date}</span>
                                <span className="text-sm font-semibold text-gray-700">Daily Hcp</span>
                                <span className="text-sm font-semibold text-gray-700">Score</span>
                                <span className="text-sm font-semibold text-gray-700">{group.groupName}</span>
                            </div>
                            <div className="space-y-1">
                            {group.golfers.map(golfer => {
                                    const isCurrentUser = golfer.golferRef === auth.currentUser.uid;
                                    const isEditing = editingRow === `${trip.id}-${group.groupName}-${golfer.golferRef}`;
                                    return (
                                        <div key={golfer.golferRef} className="grid grid-cols-4 pl-4 text-sm text-gray-600 gap-x-4 items-center">
                                            <div>{golfer.golferName}</div>
                                            {isCurrentUser && isEditing ? (
                                                // Input fields to edit Hcp and Score for the current user
                                                <>
                                                    <input
                                                        type="number"
                                                        placeholder="Daily Hcp"
                                                        value={changes[trip.id]?.[group.groupName]?.[golfer.golferRef]?.dailyHcp ?? golfer.dailyHcp}
                                                        onChange={(e) => handleHcpChange(e, trip.id, group.groupName, golfer.golferRef)}
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Score"
                                                        value={changes[trip.id]?.[group.groupName]?.[golfer.golferRef]?.golferGroupScore ?? golfer.golferGroupScore}
                                                        onChange={(e) => handleScoreChange(e, trip.id, group.groupName, golfer.golferRef)}
                                                    />
                                                    <button onClick={() => saveRowChanges(trip.id, group.groupName, golfer.golferRef)}>Save</button>
                                                </>
                                            ) : (
                                                // Display data, if current user show Edit button
                                                <>
                                                    <div>{golfer.dailyHcp ?? 'N/A'}</div>
                                                    <div>{golfer.golferGroupScore ?? 'N/A'}</div>
                                                    {isCurrentUser && (
                                                        <button onClick={() => toggleEditing(trip.id, group.groupName, golfer.golferRef)}>
                                                            {isEditing ? 'Cancel' : 'Edit'}
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
