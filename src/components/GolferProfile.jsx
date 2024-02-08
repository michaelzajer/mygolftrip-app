import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const GolferProfile = ({ golferDetails, isLoading }) => {
  if (isLoading) return <div>Loading...</div>;

  if (!golferDetails) return <div>No golfer details available.</div>;

  return (
    <div className="bg-blue-100 text-yellow-100 p-4 rounded-lg text-center">
    <h1 className="text-md font-bold text-center">{golferDetails.name}</h1>
 
    <p className='text-md mt-2 text-center'>
      <span className="text-green-100">Golf Link No:</span> {golferDetails.golfLinkNo}
    </p>
    <p className='text-md mt-2 text-center'>
      <span className="text-green-100">GA Handicap:</span> {golferDetails.handicapGA}
    </p>
    <Link to="/profile"
      className="text-pink-100 text-md mt-2
      hover:text-yellow-100
      transition duration-200
      ease-in-out
      ml-1">Update your profile</Link>
  </div>
  );
};

GolferProfile.propTypes = {
  golferDetails: PropTypes.shape({
    name: PropTypes.string.isRequired,
    handicap: PropTypes.number,
    gaDetails: PropTypes.string
  }),
  isLoading: PropTypes.bool.isRequired
};

export default GolferProfile;