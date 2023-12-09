import React, { useState } from 'react';

function App() {
  const [radius, setRadius] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const calculateRentalPrices = () => {
    // Validate input
    if (isNaN(radius) || radius <= 0) {
      setError('Please enter a valid positive number for the radius.');
      setResults([]); // Clear previous results
      return;
    } else {
      setError(''); // Clear error message
    }

    // Make an AJAX request to your Python script
    fetch(`http://localhost:5004/get_rental_prices?radius=${radius}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error fetching data. Please try again later.');
        }
        return response.json();
      })
      .then((responseData) => {
        // Replace "Unknown" with "Studio"
        responseData.forEach((item) => {
          if (item.bedrooms === 'Unknown') {
            item.bedrooms = 'Studio';
          }
        });

        // Sort the results: Studio first, then by bedroom count
        responseData.sort((a, b) => {
          if (a.bedrooms === 'Studio') return -1;
          if (b.bedrooms === 'Studio') return 1;
          return parseInt(a.bedrooms) - parseInt(b.bedrooms);
        });

        setResults(responseData);
      })
      .catch((error) => {
        setResults([]); // Clear previous results
        setError(error.message);
      });
  };

  return (
    <div>
      <h1>Rentals Near Me</h1>
      <form>
        <label htmlFor="radius">Enter Radius (in miles): </label>
        <input
          type="number"
          id="radius"
          name="radius"
          required
          step="0.1"
          placeholder="e.g., 1.5"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
        />
        <button type="button" onClick={calculateRentalPrices}>
          Calculate
        </button>
      </form>
      {error && <div id="error" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      <div id="results">
        <ul>
          {results.map((item) => (
            <li key={item.bedrooms}>
              {item.bedrooms}: ${item.average_price.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
