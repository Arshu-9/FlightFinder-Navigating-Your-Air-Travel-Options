const express = require('express');
const { auth } = require('../middleware/auth');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');

const router = express.Router();

// @route   GET /api/operator/stats
// @desc    Get dashboard data (flights, bookings) for the logged-in operator
// @access  Private (Operator)
router.get('/stats', auth, async (req, res) => {
  // Ensure the user is an operator
  if (req.user.role !== 'operator') {
    return res.status(403).json({ message: 'Access denied. Operator role required.' });
  }

  try {
    const operatorId = req.user._id;

    // Get all flights created by THIS specific operator
    const flights = await Flight.find({ createdBy: operatorId }).sort({ createdAt: -1 });

    // Find all flight IDs created by this operator
    const flightIds = flights.map(f => f._id);
    
    // Get all bookings made for those specific flights
    const bookings = await Booking.find({ flight: { $in: flightIds } })
      .populate('user', 'firstName lastName email') // Get booker's details
      .populate('flight', 'flightNumber');        // Get flight number

    // Return all data in one clean object
    res.json({
      totalFlights: flights.length,
      totalBookings: bookings.length,
      flights: flights,
      bookings: bookings,
    });
  } catch (err) {
    console.error('Error fetching operator stats:', err);
    res.status(500).json({ message: 'Server Error while fetching stats' });
  }
});

module.exports = router;