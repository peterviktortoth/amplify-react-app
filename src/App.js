import React, { useState, useEffect } from 'react';
import './styles.css';
import MapComponent from './mapComponent';

const API_ENDPOINT = 'https://paddsg8yeh.execute-api.us-east-2.amazonaws.com/test/rentalPrices';

function App() {
  const [radius, setRadius] = useState('0.1');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState({ latitude: null, longitude: null });

  useEffect(() => {
    const getCurrentPosition = () => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
    };

    const fetchCoordinates = async () => {
      try {
        const position = await getCurrentPosition();
        setUserCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting user location:', error);
        setError('Unable to fetch user location.');
      }
    };

    fetchCoordinates();
  }, []);

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
      const response = await fetch(`${API_ENDPOINT}/rentalPrices?latitude=${userCoordinates.latitude}&longitude=${userCoordinates.longitude}&radius=${radius}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch rental prices: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(`Error: ${error}`);
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div>
          {error && <div className="error-message">{error}</div>}
          <ul className="results-list">
            {results.map((item, index) => (
              <li key={index} className="result-item">
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
     <MapComponent coordinates={userCoordinates} radius={parseFloat(radius)} />
    </div>
  );
}

export default App;
