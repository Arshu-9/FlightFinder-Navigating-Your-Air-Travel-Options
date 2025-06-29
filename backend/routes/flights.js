/**
 * Express router for handling flight-related API endpoints.
 * This file includes routes for searching, creating, and retrieving flights.
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth'); // Middleware to protect routes
const Flight = require('../models/Flight');   // Mongoose Flight model

// =================================================================
// PUBLIC ROUTES (Accessible to everyone)
// =================================================================

/**
 * @route   GET /api/flights/latest
 * @desc    Get the 5 most recently created flights for the homepage
 * @access  Public
 */
router.get('/latest', async (req, res) => {
  try {
    const latestFlights = await Flight.find()
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .limit(5);               // Limit to 5 results
    res.json(latestFlights);
  } catch (err) {
    console.error('Error fetching latest flights:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/flights/search
 * @desc    Search for flights based on departure city, arrival city, and date
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ message: 'Please provide all search criteria: from, to, and date.' });
    }

    const query = {
      'departure.city': from,
      'arrival.city': to,
    };

    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    query['departure.date'] = {
      $gte: startDate,
      $lt: endDate,
    };

    const flights = await Flight.find(query);
    res.json(flights);
  } catch (err) {
    console.error('Error searching flights:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/flights/:id
 * @desc    Get a single flight by its unique ID for the booking page
 * @access  Public
 * IMPORTANT: This dynamic route must be placed AFTER specific routes like '/latest' and '/search'.
 */
router.get('/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json(flight);
  } catch (err) {
    console.error('Error fetching flight by ID:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.status(500).send('Server Error');
  }
});

// =================================================================
// PRIVATE ROUTES (Requires login and specific roles)
// =================================================================

/**
 * @route   POST /api/flights
 * @desc    Create a new flight
 * @access  Private (Operator only)
 */
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'operator') {
    return res.status(403).json({ message: 'Access denied. Operator privileges required.' });
  }

  try {
    const newFlightData = {
      ...req.body,
      createdBy: req.user._id, // FIX: Adds the logged-in operator's ID
    };

    const flight = new Flight(newFlightData);
    await flight.save();

    res.status(201).json({ message: 'Flight created successfully!', flight });
  } catch (err) {
    console.error('Error creating flight:', err.message);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;