import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import './App.css';

const API_BASE = 'http://localhost:5000/api/buses';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const libraries = [];

function MapComponent({ stops }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
    libraries,
  });

  if (loadError) return <div className="map-error">Error loading map</div>;
  if (!isLoaded) return <div className="map-loading">Loading map...</div>;

  const center = { lat: stops[0].latitude, lng: stops[0].longitude };

  const openInGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={13}>
      {stops.map((stop, idx) => (
        <Marker
          key={idx}
          position={{ lat: stop.latitude, lng: stop.longitude }}
          label={(idx + 1).toString()}
          title={stop.name}
          onClick={() => openInGoogleMaps(stop.latitude, stop.longitude)}
          cursor="pointer"
        />
      ))}
    </GoogleMap>
  );
}

export default function App() {
  const [location, setLocation] = useState('');
  const [busResults, setBusResults] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (location.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const debounce = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_BASE}/search?location=${encodeURIComponent(location.trim())}`);
        setSuggestions(res.data);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [location]);

  const searchBuses = async () => {
    if (!location.trim()) return;
    setLoading(true);
    setError(null);
    setSelectedBus(null);
    try {
      const res = await axios.get(`${API_BASE}/search?location=${encodeURIComponent(location.trim())}`);
      setBusResults(res.data);
      setSuggestions([]);
      if (res.data.length === 0) {
        setError('No buses found for that location.');
      }
    } catch {
      setError('Failed to load buses.');
    }
    setLoading(false);
  };

  const fetchBusDetails = async (busNumber) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/${encodeURIComponent(busNumber)}`);
      setSelectedBus(res.data);
      const el = document.getElementById('mapSection');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } catch {
      setError('Failed to load bus details');
    }
    setLoading(false);
  };

  // Handle back button click: clear search input, bus results, selected bus, errors
  const handleBackToResults = () => {
    setSelectedBus(null);
    setLocation('');
    setBusResults([]);
    setError(null);
    setSuggestions([]);
  };

  return (
    <div className="app-container">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="app-title"
      >
        Bus Route Finder
      </motion.h1>

      {!selectedBus && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5 }} 
          className="search-wrapper"
        >
          <input
            type="text"
            placeholder="Search your location e.g. Mylapore"
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                searchBuses();
                setSuggestions([]);
              }
            }}
            aria-label="Search location"
            autoComplete="off"
            className="search-input"
          />

          {suggestions.length > 0 && (
            <ul 
              className="suggestions-list"
              role="listbox"
              aria-label="Bus suggestions"
            >
              {suggestions.map(bus => (
                <li 
                  key={bus.busNumber}
                  tabIndex={0}
                  onClick={() => {
                    fetchBusDetails(bus.busNumber);
                    setSuggestions([]);
                    setLocation(`${bus.busNumber} - ${bus.routeName}`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      fetchBusDetails(bus.busNumber);
                      setSuggestions([]);
                      setLocation(`${bus.busNumber} - ${bus.routeName}`);
                    }
                  }}
                  role="option"
                  aria-selected="false"
                  className="suggestion-item"
                >
                  <strong>{bus.busNumber}</strong> - {bus.routeName}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}

      {!selectedBus && (
        <button
          onClick={() => {
            searchBuses();
            setSuggestions([]);
          }}
          aria-label="Search buses"
          className="medium-button"
          disabled={loading}
        >
          Search
        </button>
      )}

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="loading-text"
        >
          Loading...
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          role="alert"
          className="error-text"
        >
          {error}
        </motion.div>
      )}

      {!selectedBus && busResults.length > 0 && (
        <AnimatePresence>
          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bus-list"
          >
            {busResults.map(bus => (
              <motion.li
                key={bus.busNumber}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchBusDetails(bus.busNumber)}
                tabIndex={0}
                onKeyDown={(e) => { if(e.key === 'Enter') fetchBusDetails(bus.busNumber); }}
                className="bus-list-item"
                aria-label={`Select bus number ${bus.busNumber} route ${bus.routeName}`}
              >
                <strong>{bus.busNumber}</strong> - {bus.routeName}
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
      )}

      {selectedBus && (
        <motion.div
          id="mapSection"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="map-section"
        >
          <button
            onClick={handleBackToResults}
            aria-label="Back to bus search results"
            className="medium-button back-button"
          >
            ← Back to Search Results
          </button>

          <h2 className="bus-title">
            Bus {selectedBus.busNumber} - {selectedBus.routeName}
          </h2>

          <MapComponent stops={selectedBus.stops} />
          <p className="map-instruction">
            Click a stop marker to open in Google Maps.
          </p>
        </motion.div>
      )}
    </div>
  );
}