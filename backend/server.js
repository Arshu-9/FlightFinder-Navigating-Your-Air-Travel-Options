require('dotenv').config(); // Load .env file

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const createDefaultAdmin = require('./utils/createDefaultAdmin'); // Import the utility

const app = express();

// ✅ MongoDB Connection and Server Start with Admin Creation
mongoose.connect('mongodb://127.0.0.1:27017/flightfinder', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB Connected');

  // Create default admin if none exists
  await createDefaultAdmin();

  // Start server after DB connected and admin created
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log('🚀 Server is running on port ${PORT}'));
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// ✅ Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// ✅ Application Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/flights', require('./routes/flights'));
app.use('/api/users', require('./routes/users'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/operator', require('./routes/operator'));
app.use('/api/admin', require('./routes/admin'));