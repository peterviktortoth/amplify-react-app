// App.js

import React, { useState, useEffect } from 'react';
import './styles.css'; // Import your CSS file

function App() {
  const [radius, setRadius] = useState('0.1');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const getCurrentLocation = async (apiKey) => {
    try {
      const position = await getCurrentPosition();

      if (position) {
        const { latitude, longitude } = position.coords;

        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${latitude}+${longitude}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
          console.log('Location details:', data.results[0]);
          return [latitude, longitude];
        } else {
          throw new Error('Location not found in OpenCage response');
        }
      } else {
        throw new Error('Failed to retrieve geolocation');
      }
    } catch (error) {
      console.error(`Error getting location: ${error.message}`);
      return null;
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error)
      );
    });
  };

  const getRentalPrices = async (radius) => {
    setLoading(true);

    try {
      const coordinates = await getCurrentLocation("7cc33eaee3bf43c480474df135a0b6b8");

      if (coordinates) {
        const [latitude, longitude] = coordinates;
        console.log(`Current Location: Latitude ${latitude}, Longitude ${longitude}`);

        const url = `https://api.rentcast.io/v1/listings/rental/long-term?latitude=${latitude}&longitude=${longitude}&radius=${radius}&status=Active&limit=500`;

        const headers = {
          "accept": "application/json",
          "X-Api-Key": "5fe60f24d1c04d22a89cc5e1583a119f",
        };

        const response = await fetch(url, { headers });
        const data = await response.json();

        const rentalPrices = {};
        data.forEach(property => {
          const bedrooms = property.bedrooms || "Unknown";
          const price = property.price || 0;

          if (!rentalPrices[bedrooms]) {
            rentalPrices[bedrooms] = [price];
          } else {
            rentalPrices[bedrooms].push(price);
          }
        });

        const averagePrices = Object.entries(rentalPrices).map(([bedrooms, prices]) => {
          const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
          return { bedrooms, average_price: averagePrice };
        });

        setResults(averagePrices);

      } else {
        console.log("Unable to retrieve current location.");
        setError("Unable to retrieve current location.");
      }

    } catch (error) {
      console.error(`Error: ${error}`);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateRentalPrices = () => {
    if (isNaN(radius) || radius <= 0) {
      setError('Please enter a valid positive number for the radius.');
      setResults([]);
      return;
    } else {
      setError('');
    }
  
    // Call getRentalPrices only when the button is clicked
    getRentalPrices(parseFloat(radius));
  };
  


  return (
    <div className="container">
      <h1 className="title">Can I Afford to Live Here?</h1>
      <form className="form">
        <label htmlFor="radius" className="form-label">
          Enter Radius (in miles):
        </label>
        <input
          type="number"
          id="radius"
          name="radius"
          required
          step="0.1"
          placeholder="e.g., 1.5"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          className="form-input"
        />
        <button type="button" onClick={calculateRentalPrices} className="form-button">
          Calculate
        </button>
      </form>
      {loading ? (
        <div className="loading-message">Fetching prices...</div>
      ) : (
        <div>
          {error && <div className="error-message">{error}</div>}
          <ul className="results-list">
  {results.map((item) => (
    <li key={item.bedrooms} className="result-item">
      Average {item.bedrooms === 'Unknown' ? (
        <span className="studio-label">Studio</span>
      ) : (
        `${item.bedrooms} bedroom`
      )} rental price - ${item.average_price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
    </li>
  ))}
</ul>
        </div>
      )}
    </div>
  );
}

export default App;