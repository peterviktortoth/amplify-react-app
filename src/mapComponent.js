import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import './styles.css';

mapboxgl.accessToken = 'pk.eyJ1IjoicGV0ZXJ2aWt0b3J0b3RoIiwiYSI6ImNscWN5bWM1ZzA3b3kyanBhMndyZW44eTMifQ.4le2l0XBKj7DKKYzu_LgyQ';

const MapComponent = ({ coordinates, radius }) => {
  const mapContainerRef = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  // Convert radius from miles to meters
  const getRadiusInMeters = (miles) => miles * 1609.34;

  useEffect(() => {
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) return;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [coordinates.longitude, coordinates.latitude],
        zoom: 13,
        scrollZoom: false,
        doubleClickZoom: false,
        touchZoomRotate: false,
        dragRotate: false,
        keyboard: false
      });

      marker.current = new mapboxgl.Marker()
        .setLngLat([coordinates.longitude, coordinates.latitude])
        .addTo(map.current);

      map.current.on('load', () => {
        map.current.addLayer({
          id: 'circle-radius',
          type: 'circle',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [coordinates.longitude, coordinates.latitude]
              }
            }
          },
          paint: {
            'circle-radius': getRadiusInMeters(radius),
            'circle-color': 'blue',
            'circle-opacity': 0.5
          }
        });
      });
    }
  }, [coordinates, radius]);

  // Update the circle radius when the radius prop changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !map.current.getLayer('circle-radius')) return;

    map.current.setPaintProperty('circle-radius', 'circle-radius', getRadiusInMeters(radius));
  }, [radius]);

  return (
    <div className="map-container">
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
};

export default MapComponent;
