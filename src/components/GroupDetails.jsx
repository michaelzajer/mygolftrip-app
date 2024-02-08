import React from 'react';
import PropTypes from 'prop-types';

const GroupDetails = ({ groupDetails, isLoading }) => {
    if (isLoading) return <div>Loading group details...</div>;
  
    if (!groupDetails || groupDetails.length === 0) return <div>No group details available.</div>;
  
    return (
      <div className="group-details">
        {groupDetails.map((group, index) => (
          <div key={index}>
            <h3>{group.groupName}</h3> {/* Changed from group.name to group.groupName */}
            {/* ... other group details ... */}
          </div>
        ))}
      </div>
    );
  };
  
  GroupDetails.propTypes = {
    groupDetails: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      groupName: PropTypes.string.isRequired,
      groupDate: PropTypes.string.isRequired,
      // ... other propTypes ...
    })).isRequired,
    isLoading: PropTypes.bool.isRequired
  };
  
  export default GroupDetails;