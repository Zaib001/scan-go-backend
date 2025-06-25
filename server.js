const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dashboardRoutes = require('./routes/dashboardRoutes');
require('dotenv').config();

const app = express();



const ttsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many TTS requests. Please try again after a minute.'
  }
});
// Environment Variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));


// API Routes
app.use('/api/demos', require('./routes/demoRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/curator', require('./routes/curatorRoutes'));
app.use('/api/tts', ttsLimiter, require('./routes/ttsRoute'));
app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/dashboard', dashboardRoutes);
// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Start Server
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

startServer();
