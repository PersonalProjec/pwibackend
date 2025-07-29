const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// Connect Database
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
); // Allow CORS for client
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Fallback
app.get('/', (req, res) => {
  res.send('🌍 Property Wey API running');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
