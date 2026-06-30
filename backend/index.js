const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const google = require('googlethis');

// Image search route using googlethis
app.get('/api/product-image', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const images = await google.image(query + ' clothing', { safe: true });
    
    if (images && images.length > 0) {
      return res.json({ imageUrl: images[0].url });
    } else {
      return res.status(404).json({ error: 'Image not found', imageUrl: null });
    }
  } catch (error) {
    console.error('Image Search Error:', error.message);
    res.status(500).json({ error: 'Internal server error', imageUrl: null });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`StyleSpeak Backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
