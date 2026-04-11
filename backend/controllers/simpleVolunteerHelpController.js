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
      userNotes,
      deliveryType,
      locationCoordinates
    } = req.body;

    // Validate required fields
    if (!itemId || !itemTitle || !itemCategory || !userName || !userEmail || 
        !userPhone || !userAddress || !userCity || !userDistrict || !deliveryType) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided including delivery type'
      });
    }

    // Validate center requirement for pickup
    if (deliveryType === 'pickup' && !centerId) {
      return res.status(400).json({
        success: false,
        message: 'Center ID is required for pickup requests'
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
      deliveryType: deliveryType || 'pickup',
      centerId: deliveryType === 'pickup' ? centerId : null,
      pickupNotes: pickupNotes || '',
      userNotes: userNotes || '',
      locationCoordinates: locationCoordinates || { type: 'Point', coordinates: [0, 0] },
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

// Get all volunteer help requests (for admin/volunteer dashboard)
const getAllVolunteerHelpRequests = async (req, res) => {
  try {
    const requests = await SimpleVolunteerHelp.find({})
      .populate('centerId', 'name city district')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error fetching all volunteer help requests:', error);
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

const assignRequestToCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const { centerId } = req.body;
    
    if (!centerId) {
      return res.status(400).json({ success: false, message: 'Center ID is required' });
    }

    const request = await SimpleVolunteerHelp.findByIdAndUpdate(
      id,
      { assignedCenterId: centerId, status: 'center_assigned' },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({ success: true, data: request, message: 'Assigned to center successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { volunteerId } = req.body;

    if (!volunteerId) {
      return res.status(400).json({ success: false, message: 'Volunteer ID is required' });
    }

    const request = await SimpleVolunteerHelp.findByIdAndUpdate(
      id,
      { assignedVolunteerId: volunteerId, status: 'accepted' },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({ success: true, data: request, message: 'Request accepted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getRequestsByCenter = async (req, res) => {
  try {
    const { centerId } = req.params;
    
    const requests = await SimpleVolunteerHelp.find({ assignedCenterId: centerId })
      .populate('assignedVolunteerId', 'firstName lastName')
      .populate('centerId', 'centerName city district')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const getRequestsByVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    
    const requests = await SimpleVolunteerHelp.find({ 
      assignedVolunteerId: volunteerId,
      status: 'accepted' 
    })
      .populate('assignedVolunteerId', 'firstName lastName')
      .populate('centerId', 'centerName city district')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export {
  createVolunteerHelp,
  getAllVolunteerHelpRequests,
  getVolunteerHelpByUser,
  assignRequestToCenter,
  acceptRequest,
  getRequestsByCenter,
  getRequestsByVolunteer
};
