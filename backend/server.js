const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.get('/api/weather', async (req, res) => {
  const { city } = req.query;
  
  if (!city) {
    return res.status(400).json({ message: 'Please provide a city name' });
  }

  try {
    if (!process.env.OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key is not configured');
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;

    console.log('Making request to OpenWeather API...');
    console.log('URL:', url);
    console.log('API Key:', process.env.OPENWEATHER_API_KEY);

    const response = await axios.get(url);

    if (!response.data) {
      throw new Error('No data received from OpenWeather API');
    }

    console.log('Response from OpenWeather:', response.data);

    const weatherData = {
      temperature: Math.round(response.data.main.temp),
      humidity: response.data.main.humidity,
      description: response.data.weather[0].description,
    };

    console.log('Processed weather data:', weatherData);
    res.json(weatherData);
  } catch (error) {
    console.error('Detailed error information:');
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);

    if (error.message === 'OpenWeather API key is not configured') {
      res.status(500).json({ message: "Server configuration error: API key not set" });
    } else if (error.response && error.response.status === 401) {
      res.status(500).json({ message: "Invalid API key. Please check your OpenWeather API key configuration." });
    } else if (error.response && error.response.status === 404) {
      res.status(404).json({ message: "City not found. Please check the spelling and try again." });
    } else {
      res.status(500).json({ 
        message: "Error fetching weather data. Please try again later.",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// Test endpoint to verify server and environment variables
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    apiKeyConfigured: !!process.env.OPENWEATHER_API_KEY,
    apiKeyLength: process.env.OPENWEATHER_API_KEY ? process.env.OPENWEATHER_API_KEY.length : 0
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Environment variables loaded:', {
    PORT: process.env.PORT,
    API_KEY_CONFIGURED: !!process.env.OPENWEATHER_API_KEY,
    API_KEY_LENGTH: process.env.OPENWEATHER_API_KEY ? process.env.OPENWEATHER_API_KEY.length : 0
  });
}); 