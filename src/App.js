import React, { useState, useEffect } from 'react';
import './styles.css';

const API_ENDPOINT = 'YOUR_API_ENDPOINT'; // Replace with your actual API Gateway endpoint

function App() {
  const [radius, setRadius] = useState('0.1');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const locationResponse = await fetch(`${API_ENDPOINT}/getCurrentLocation`);
      const locationData = await locationResponse.json();

      if (!locationResponse.ok) {
        throw new Error(`Failed to fetch location: ${locationData.error}`);
      }

      const coordinates = locationData.coordinates;

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
