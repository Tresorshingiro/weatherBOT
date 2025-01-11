import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import config from './config';

const WeatherBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add initial greeting when component mounts
  useEffect(() => {
    setMessages([
      {
        text: "Hello! I'm your Weather Bot. Please enter a city name to get the current weather.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  const fetchWeatherData = async (city) => {
    try {
      const response = await fetch(
        `${config.API_URL}/api/weather?city=${encodeURIComponent(city)}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch weather data');
      }

      return `In ${city}, it's currently ${data.temperature}°C with ${data.description}. 
              The humidity is ${data.humidity}%.`;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const weatherResponse = await fetchWeatherData(input);
      
      const botMessage = {
        text: weatherResponse,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        text: error.message,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        isError: true,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <div className="weather-bot-container">
      <div className="chat-header">
        <h2>Weather Bot</h2>
      </div>
      
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.sender}-message ${message.isError ? 'error-message' : ''}`}
          >
            <div className="message-content">{message.text}</div>
            <div className="message-timestamp">{message.timestamp}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot-message loading-message">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a city name..."
          className="chat-input"
          disabled={isLoading}
        />
        <button type="submit" className="send-button" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default WeatherBot;