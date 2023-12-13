import React, { useEffect } from 'react';

function Map() {
  useEffect(() => {
    // Initialize the map here
    const map = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: 0, lng: 0 },
      zoom: 10,
    });

    // Add additional map-related logic here
  }, []); // Empty dependency array ensures useEffect runs once after initial render

  return <div id="map" style={{ height: '400px' }}></div>;
}

export default Map;
