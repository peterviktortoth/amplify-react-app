const AWS = require('aws-sdk');
const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    // Invoke the getCurrentLocation Lambda function to get the user's location
    const locationResponse = await invokeGetLocationLambda();
    
    if (locationResponse.statusCode === 200) {
      const { latitude, longitude } = JSON.parse(locationResponse.body);
      console.log(`Current Location: Latitude ${latitude}, Longitude ${longitude}`);

      const radius = event.queryStringParameters.radius || 1; // Default radius

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

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // Enable CORS for all domains
          "Access-Control-Allow-Headers": "*", // Allow any headers
        },
        body: JSON.stringify(averagePrices),
      };
    } else {
      console.log("Unable to retrieve current location.");
      throw new Error("Unable to retrieve current location.");
    }
  } catch (error) {
    console.error(`Error: ${error}`);
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

// Function to invoke the getCurrentLocation Lambda function
const invokeGetLocationLambda = async () => {
  const lambda = new AWS.Lambda();
  
  const params = {
    FunctionName: 'Your-GetCurrentLocation-Lambda-FunctionName', // Replace with the actual Lambda function name
    InvocationType: 'RequestResponse',
  };

  return await lambda.invoke(params).promise();
};
