import React, { useState, useEffect } from 'react';
import './styles.css';

const API_ENDPOINT = 'https://paddsg8yeh.execute-api.us-east-2.amazonaws.com/test'; // Replace with your actual API Gateway endpoint
const OPENCAGE_API_KEY = '7cc33eaee3bf43c480474df135a0b6b8'; // Replace with your Opencage API key

function App() {
  const [radius, setRadius] = useState('0.1');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async () => {
    try {
      const position = await getCurrentPosition();

      if (position) {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?key=${OPENCAGE_API_KEY}&q=${latitude}+${longitude}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
          console.log('Location details:', data.results[0]);
          return { latitude, longitude };
        } else {
          throw new Error('Location not found in OpenCage response');
        }
      } else {
        throw new Error('Failed to retrieve geolocation');
      }
    } catch (error) {
      console.error(`Error getting location: ${error.message}`);
      throw error;
    }
  };

  const calculateRentalPrices = async () => {
    if (isNaN(radius) || radius <= 0) {
      setError('Please enter a valid positive number for the radius.');
      setResults([]);
      return;
    } else {
      setError('');
    }

    setLoading(true);

    try {
      const coordinates = await getCurrentLocation();

      if (coordinates) {
        const response = await fetch(`${API_ENDPOINT}/getRentalPrices?radius=${radius}`, {
          method: 'POST',
          body: JSON.stringify({ coordinates }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(`Failed to fetch rental prices: ${data.error}`);
        }

        setResults(data);
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

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error)
      );
    });
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
