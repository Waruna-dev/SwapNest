import express from 'express';
const router = express.Router();

// Simple test endpoint to verify server is working
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Test endpoint is working',
    timestamp: new Date().toISOString()
  });
});

// Test POST endpoint to verify request parsing
router.post('/test', (req, res) => {
  try {
    console.log('=== Test POST Request ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    res.status(200).json({
      success: true,
      message: 'Test POST endpoint is working',
      receivedData: req.body,
      headers: req.headers
    });
  } catch (error) {
    console.error('Test POST error:', error);
    res.status(500).json({
      success: false,
      message: 'Test POST failed',
      error: error.message
    });
  }
});

export default router;
