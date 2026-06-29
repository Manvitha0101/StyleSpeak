const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Image search route using a custom lightweight scraper
app.get('/api/product-image', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    // Make a request to Bing Images
    const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query + ' fashion clothing outfit product')}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });

    // Extract high-quality image URL from the DOM (strictly jpg/png to avoid icons/maps)
    const matches = response.data.match(/murl&quot;:&quot;(http.*?(?:jpg|jpeg|png))&quot;/i);
    
    if (matches && matches[1]) {
      return res.json({ imageUrl: matches[1] });
    } else {
      return res.status(404).json({ error: 'Image not found', imageUrl: null });
    }
  } catch (error) {
    console.error('Image Search Error:', error.message);
    res.status(500).json({ error: 'Internal server error', imageUrl: null });
  }
});

app.listen(PORT, () => {
  console.log(`StyleSpeak Backend server running on http://localhost:${PORT}`);
});
