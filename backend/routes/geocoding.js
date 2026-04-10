import express from 'express';
const router = express.Router();

// Proxy for OpenStreetMap Nominatim reverse geocoding
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lon, format = 'jsonv2' } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and longitude are required' 
      });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=${format}&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'SwapNest Volunteer Management System'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`OpenStreetMap API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Geocoding reverse error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reverse geocode coordinates' 
    });
  }
});

// Proxy for OpenStreetMap Nominatim search geocoding
router.get('/search', async (req, res) => {
  try {
    const { q, format = 'jsonv2', limit = 1 } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=${format}&q=${encodeURIComponent(q)}&limit=${limit}`,
      {
        headers: {
          'User-Agent': 'SwapNest Volunteer Management System'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`OpenStreetMap API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Geocoding search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search location' 
    });
  }
});

export default router;
