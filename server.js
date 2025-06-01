const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shortid = require('shortid');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/urlshortener', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// URL Schema
const urlSchema = new mongoose.Schema({
    originalUrl: String,
    shortUrl: String,
    clicks: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Url = mongoose.model('Url', urlSchema);

// Routes
app.post('/api/shorten', async (req, res) => {
    const { url } = req.body;
    try {
        const shortUrl = shortid.generate();
        const newUrl = new Url({
            originalUrl: url,
            shortUrl: shortUrl
        });
        await newUrl.save();
        res.json(newUrl);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/urls', async (req, res) => {
    try {
        const urls = await Url.find().sort({ createdAt: -1 });
        res.json(urls);
    } catch (err) {
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
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 