/*
This page is ./pages/Footer.jsx the footer for the site

*/

import React from 'react';

function Footer({ co2Total }) {

  function CO2EmissionsDisplay({ co2Total }) {
    return (
      <div className="text-sm text-gray-600">
        Estimated CO2 emissions for this session: {co2Total.toFixed(2)} grams
      </div>
    );
  }

  return (
    <footer className="fixed bottom-0 w-full bg-gray-100 text-gray-700 text-center py-2">
      <CO2EmissionsDisplay co2Total={co2Total} />
      {/* You can add more footer content here */}
    </footer>
  );
}

export default Footer;

