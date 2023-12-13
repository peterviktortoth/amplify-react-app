const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const position = await getCurrentPosition();

    if (position) {
      const { latitude, longitude } = position.coords;

      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?key=${process.env.OPENCAGE_API_KEY}&q=${latitude}+${longitude}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        console.log('Location details:', data.results[0]);
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*", // Enable CORS for all domains
            "Access-Control-Allow-Headers": "*", // Allow any headers
          },
          body: JSON.stringify({ latitude, longitude, locationDetails: data.results[0] }),
        };
      } else {
        throw new Error('Location not found in OpenCage response');
      }
    } else {
      throw new Error('Failed to retrieve geolocation');
    }
  } catch (error) {
    console.error(`Error getting location: ${error.message}`);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // Enable CORS for all domains
        "Access-Control-Allow-Headers": "*", // Allow any headers
      },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
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
