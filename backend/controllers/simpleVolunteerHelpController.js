import SimpleVolunteerHelp from '../models/SimpleVolunteerHelp.js';
import jwt from 'jsonwebtoken';

// Create a new volunteer help request
const createVolunteerHelp = async (req, res) => {
  try {
    console.log('=== Simple Volunteer Help Request ===');
    
    // Get user ID from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const userId = decoded.id;

    console.log('User ID:', userId);
    console.log('Request body:', req.body);

    // Extract data from request
    const {
      itemId,
      itemTitle,
      itemCategory,
      userName,
      userEmail,
      userPhone,
      userAddress,
      userCity,
      userDistrict,
      centerId,
      pickupNotes,
      userNotes
    } = req.body;

    // Validate required fields
    if (!itemId || !itemTitle || !itemCategory || !userName || !userEmail || 
        !userPhone || !userAddress || !userCity || !userDistrict || !centerId) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Create volunteer help request
    const volunteerHelp = new SimpleVolunteerHelp({
      itemId,
      itemTitle,
      itemCategory,
      userName,
      userEmail,
      userPhone,
      userAddress,
      userCity,
      userDistrict,
      centerId,
      pickupNotes: pickupNotes || '',
      userNotes: userNotes || '',
      userId
    });

    // Save to database
    await volunteerHelp.save();

    console.log('Volunteer help request created successfully');

    res.status(201).json({
      success: true,
      message: 'Volunteer help request created successfully',
      data: volunteerHelp
    });

  } catch (error) {
    console.error('Error creating volunteer help request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get volunteer help requests by user
const getVolunteerHelpByUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const userId = decoded.id;

    const requests = await SimpleVolunteerHelp.find({ userId })
      .populate('centerId', 'centerName city district')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error fetching volunteer help requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export {
  createVolunteerHelp,
  getVolunteerHelpByUser
};
