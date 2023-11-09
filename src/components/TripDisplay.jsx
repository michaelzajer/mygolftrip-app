import React from 'react';
import { useTable, useSortBy } from 'react-table';
import { useContext } from 'react';
import GroupedDataContext from "./GroupedDataContext";

export function TripDisplay({ groupedResults = {} }) { // set default value

    const groupedData = useContext(GroupedDataContext);

    // Flatten data for table structure
    const data = React.useMemo(() => {
        const flattenedData = [];
        Object.entries(groupedResults).forEach(([date, groups]) => {
            groups.forEach(group => {
                if (group && group.golfers) {
                    group.golfers.forEach(golfer => {
                        if (golfer) {
                            flattenedData.push({
                                date: date,
                                groupName: group.groupName,
                                golferName: golfer.golferName
                            });
                        }
                    });
                }
            });
        });
        return flattenedData;
    }, [groupedResults]);

    // Define columns
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

    return (
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps(column.getSortByToggleProps())} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {column.render('Header')}
                                <span>
                                    {column.isSorted
                                        ? column.isSortedDesc
                                            ? ' 🔽'
                                            : ' 🔼'
                                        : ''}
                                </span>
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
                {rows.map(row => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => (
                                <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap">{cell.render('Cell')}</td>
                            ))}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
