import React from 'react';
import PropTypes from 'prop-types';

const TripList = ({ trips, isLoading }) => {
  if (isLoading) return <div>Loading trips...</div>;

  if (!trips || trips.length === 0) return <div>No trips available.</div>;

  return (
    <div className="trip-list">
      {trips.map(trip => (
        <div key={trip.id}>
          <h3>{trip.name}</h3>
          {/* Additional trip details here */}
        </div>
      ))}
    </div>
  );
};

TripList.propTypes = {
  trips: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    // Other trip properties
  })),
  isLoading: PropTypes.bool.isRequired
};

export default TripList;