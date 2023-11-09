import React from 'react';
import { useTable, useSortBy } from 'react-table';
import { doc, updateDoc } from "firebase/firestore";


export function MyTripsDisplay({ tripsData }) {

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

    const handleHcpChange = (event, tripId, groupName, golferRef) => {
        // Logic to update state or context with the new handicap
      };

      const handleScoreChange = (event, tripId, groupName, golferRef) => {
        // Logic to update state or context with the new score
      };

      const saveUpdates = async (tripId, groupName, golferRef, newHcp, newScore) => {
        const golferDocRef = doc(db, "golftrips", tripId, "tripconstruct", groupName, "golfers", golferRef);
      
        await updateDoc(golferDocRef, {
          dailyHcp: newHcp,
          golferGroupScore: newScore,
        });
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
                                {group.golfers.map(golfer => (
                                    <div key={golfer.golferRef} className="grid grid-cols-3 pl-4 text-sm text-gray-600 gap-x-4">
                                        <div>{golfer.golferName}</div>
                                        <input
                                            type="number"
                                            placeholder="Daily Hcp"
                                            value={golfer.dailyHcp}
                                            onChange={(e) => handleHcpChange(e, trip.id, group.groupName, golfer.golferRef)}
                                            />
                                        {/* <div>{golfer.dailyHcp ?? 'N/A'}</div> {/* Replace 'N/A' with your placeholder if handicap is not available */} 
                                        <div>
                                        <input
                                            type="number"
                                            placeholder="Score"
                                            value={golfer.golferGroupScore}
                                            onChange={(e) => handleScoreChange(e, trip.id, group.groupName, golfer.golferRef)}
                                            />{golfer.golferGroupScore ?? 'N/A'}
                                        </div> {/* Replace 'N/A' with your placeholder if score is not available */}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
