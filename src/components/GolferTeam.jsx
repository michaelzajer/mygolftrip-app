import React from 'react';
import PropTypes from 'prop-types';

const GolferTeam = ({ teamName, teamMembers }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <h4 className="bg-blue-100 text-yellow-100 py-2 px-4 rounded-t-lg text-left">{teamName}</h4>
      <div className="text-sm sm:text-sm lg:text-m font-medium text-center">
        {/* Map through teamMembers and display each golferName */}
        {teamMembers?.map((member, index) => (
          // Remove flex and justify-between to stack names vertically
          <div key={index} className="p-2">
            <div className="w-full text-left">{member.golferName}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

GolferTeam.propTypes = {
  teamName: PropTypes.string.isRequired,
  teamMembers: PropTypes.arrayOf(
    PropTypes.shape({
      golferName: PropTypes.string.isRequired // Fixed the prop name based on your mapping
    })
  ).isRequired
};

export default GolferTeam;