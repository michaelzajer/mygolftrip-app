import React from 'react';
import { useTable } from 'react-table';

// GolfersTable Component
const GolfersTable = ({
    columns,
    data,
    currentUser,
    editTripId,
    editGolferIndex,
    editValues,
    handleEditChange,
    handleEditClick,
    handleEditSave
  }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
    <tbody {...getTableBodyProps()}>
      {rows.map((row, rowIndex) => {
        prepareRow(row);
        const isCurrentUser = currentUser && row.original.golferId === currentUser.uid;
        const isEditing = isCurrentUser && editTripId === row.original.tripId && editGolferIndex === rowIndex;
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell, cellIndex) => {
                // Check if this cell is in editing mode
                const isEditing = editTripId === row.original.tripId && editGolferIndex === rowIndex;
                return (
                  <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap">
                    {isEditing && cell.column.id === 'dailyHcp' ? (
                      <input
                        name="dailyHcp"
                        value={editValues.dailyHcp}
                        onChange={handleEditChange}
                      />
                    ) : isEditing && cell.column.id === 'golferGroupScore' ? (
                      <input
                        name="golferGroupScore"
                        value={editValues.golferGroupScore}
                        onChange={handleEditChange}
                      />
                    ) : (
                      cell.render('Cell')
                    )}
            {isEditing && (
            <button onClick={() => handleEditSave(row.original.tripId, row.original.groupIndex, rowIndex)}>
              Save
            </button>
          )}

          {isCurrentUser && !isEditing && (
            <button onClick={() => handleEditClick(row.original.tripId, row.original.groupIndex, rowIndex, row.original)}>
              Edit
            </button>
          )}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default GolfersTable;
