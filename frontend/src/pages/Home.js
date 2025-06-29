// frontend/src/pages/Home.js
// MODIFIED - Displaying date and time together for flights.

import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Select from 'react-select';
import { indianCities } from '../data/cities'; 
import './Home.css';

// Helper function to format date strings
const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const Home = () => {
  const [searchCriteria, setSearchCriteria] = useState({ from: '', to: '', date: '' });
  const [flights, setFlights] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cityOptions = indianCities.map(city => ({ value: city, label: city }));

  useEffect(() => {
    const fetchLatestFlights = async () => {
      setLoading(true);
      try {
        const response = await api.get('/flights/latest');
        setFlights(response.data);
      } catch (err) {
        console.error('Could not fetch latest flights:', err);
        setError('Could not load recent flights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchLatestFlights();
  }, []);

  const handleCityChange = (selectedOption, actionMeta) => {
    setSearchCriteria(prev => ({ ...prev, [actionMeta.name]: selectedOption ? selectedOption.value : '' }));
  };
  
  const handleDateChange = (e) => setSearchCriteria({ ...searchCriteria, [e.target.name]: e.target.value });

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!searchCriteria.from || !searchCriteria.to || !searchCriteria.date) {
        setError('Please fill in all search fields.');
        setLoading(false);
        return;
      }
      const params = new URLSearchParams(searchCriteria);
      const response = await api.get(`/flights/search?${params}`);
      setFlights(response.data);
      setSearched(true);
    } catch (err) {
      setError('Failed to fetch flights.');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="homepage-design">
      <section className="hero-section">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}><h1 className="hero-title">Sky Mate 🐣</h1><p className="hero-subtitle"><strong>A Trusted Wingman 👻</strong></p></Col>
          </Row>
          <Row className="justify-content-center">
            <Col lg={10} xl={9}>
              <div className="search-card">
                <Form onSubmit={handleSearch}>
                  <Row className="align-items-end g-3">
                    <Col md>
                      <Form.Label>Departure City</Form.Label>
                      <Select
                        name="from"
                        options={cityOptions}
                        onChange={handleCityChange}
                        placeholder="Select Departure"
                        isClearable
                      />
                    </Col>
                    <Col md>
                      <Form.Label>Destination City</Form.Label>
                      <Select
                        name="to"
                        options={cityOptions}
                        onChange={handleCityChange}
                        placeholder="Select Destination"
                        isClearable
                      />
                    </Col>
                    <Col md><Form.Label>Journey date</Form.Label><Form.Control type="date" name="date" onChange={handleDateChange} /></Col>
                    <Col md="auto"><Button className="search-btn" type="submit" disabled={loading}>{loading && searched ? '...' : 'Search'}</Button></Col>
                  </Row>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <div className="results-wrapper">
        <Container className="results-section">
          <h2 className="results-title">{searched ? 'Search Results' : 'Recently Added Flights'}</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading && <p className="text-center">Loading...</p>}
          {!loading && flights.length === 0 && (
            <Alert variant="info" className="text-center">
              {searched ? 'No flights found matching your criteria.' : 'No recent flights available.'}
            </Alert>
          )}
          <div className="d-flex flex-column gap-3">
            {flights.map((flight) => (
              <div key={flight._id} className="flight-result-item">
                <div><strong>{flight.airline}</strong><small className="d-block text-muted">Flight: {flight.flightNumber}</small></div>
                {/* --- FIX: Display Date & Time --- */}
                <div><strong>Start: {flight.departure.city}</strong><small className="d-block text-muted">{formatDate(flight.departure.date)} - {flight.departure.time}</small></div>
                {/* --- FIX: Display Date & Time --- */}
                <div><strong>Destination: {flight.arrival.city}</strong><small className="d-block text-muted">{formatDate(flight.arrival.date)} - {flight.arrival.time}</small></div>
                <div><strong>Starting Price: ${flight.price.economy}</strong><small className="d-block text-muted">Seats: {flight.seats.economy.available}</small></div>
                <Link to={`/book/${flight._id}`}><Button className="book-btn">Book Now</Button></Link>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <section className="about-us-section">
        <Container>
            <h2 className="about-us-title">🪶 About Us – SKY MATE</h2>
            <Row className="justify-content-center">
                <Col lg={8}>
                    <p className="about-us-text">
                        Welcome to Sky Mate – your reliable partner in finding the perfect flight, every time.

                    </p>
                    <p className="about-us-text">
                       At Sky Mate, we make it easy to explore, compare, and book flights from anywhere in the world. Whether you're planning a dream vacation, a quick getaway, or a business trip, our goal is to help you find the best routes at the best prices — all in just a few taps.

                    </p>
                    <p className="about-us-text">
                        
We believe travel should be stress-free. That’s why Sky Mate is designed to be simple, fast, and user-friendly. With real-time flight data and smart search tools, your journey starts with confidence.

                    </p>
                    <p className="about-us-text">
                        <strong>Let Sky Mate be your co-pilot — because every great trip begins with the right flight..💕
</strong>
                    </p>
                </Col>
            </Row>
        </Container>
      </section>

    </div>
  );
};

export default Home;