const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shortid = require('shortid');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection with enhanced options
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      ssl: true,
      sslValidate: true,
      retryWrites: true,
      w: 'majority',
      retryReads: true,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 120000,
      connectTimeoutMS: 10000,
    });
    console.log('MongoDB Connected Successfully');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // Log the full error in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Full error:', err);
    }
    // Retry connection after a delay
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Initial connection
connectDB();

// Handle connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB Connection Error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB Disconnected. Attempting to reconnect...');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB Connected');
});

// URL Schema
const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Url = mongoose.model('Url', urlSchema);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Routes
app.post('/api/shorten', async (req, res) => {
  const { url } = req.body;
  try {
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const shortUrl = shortid.generate();
    const newUrl = new Url({
      originalUrl: url,
      shortUrl: shortUrl,
    });
    await newUrl.save();
    res.json(newUrl);
  } catch (err) {
    console.error('Error in /api/shorten:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/urls', async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.json(urls);
  } catch (err) {
    console.error('Error in /api/urls:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/:shortUrl', async (req, res) => {
  try {
    const url = await Url.findOne({ shortUrl: req.params.shortUrl });
    if (url) {
      url.clicks++;
      await url.save();
      res.redirect(url.originalUrl);
    } else {
      res.status(404).json({ error: 'URL not found' });
    }
  } catch (err) {
    console.error('Error in /:shortUrl:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});

// Handle server shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Performing graceful shutdown...');
  server.close(() => {
    console.log('Server closed. Disconnecting from MongoDB...');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
