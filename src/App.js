import React, { useState, useEffect } from 'react';

function App() {
  const [radius, setRadius] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const getRentalPrices = async (radius) => {
    try {
      // Get current location coordinates
      const coordinates = await getCurrentLocation();

      if (coordinates) {
        const [latitude, longitude] = coordinates;
        console.log(`Current Location: Latitude ${latitude}, Longitude ${longitude}`);

        // Use the obtained coordinates in the RentCast API request
        const url = `https://api.rentcast.io/v1/listings/rental/long-term?latitude=${latitude}&longitude=${longitude}&radius=${radius}&status=Active&limit=500`;

        const headers = {
          "accept": "application/json",
          // Include your RentCast API key here
          "X-Api-Key": "5fe60f24d1c04d22a89cc5e1583a119f",
        };

        const response = await fetch(url, { headers });
        const data = await response.json();

        // Extract rental prices and bedroom counts from the properties
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

        // Display average rental prices for each bedroom count
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
    }
  };

  const getCurrentLocation = async () => {
    try {
      const response = await fetch('https://ipinfo.io');
      const data = await response.json();
      return data.loc.split(',');
    } catch (error) {
      console.error(`Error getting location: ${error}`);
      return null;
    }
  };

  const calculateRentalPrices = () => {
    // Validate input
    if (isNaN(radius) || radius <= 0) {
      setError('Please enter a valid positive number for the radius.');
      setResults([]); // Clear previous results
      return;
    } else {
      setError(''); // Clear error message
    }

    // Call the JavaScript function equivalent to the Python logic
    getRentalPrices(parseFloat(radius));
  };

  useEffect(() => {
    // Call the API when the component mounts
    calculateRentalPrices();
  }, []); // Empty dependency array ensures the effect runs once on mount

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
