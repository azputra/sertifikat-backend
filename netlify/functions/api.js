const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Buat instance Express baru khusus untuk serverless
// Daripada mengimpor dari server.js
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'https://sertifikat-frontend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Import routes
const authRoutes = require('../../routes/authRoutes');
const certificateRoutes = require('../../routes/certificateRoutes');

// Connect database conditionaly
const connectDB = require('../../config/db');
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Routes
app.use('/auth', authRoutes);
app.use('/certificates', certificateRoutes);

// Root route untuk testing
app.get('/', (req, res) => {
  res.json({ message: 'API is running...' });
});

// Export handler
module.exports.handler = serverless(app);