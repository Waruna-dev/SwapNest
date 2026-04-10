import mongoose from 'mongoose';

const simpleVolunteerHelpSchema = new mongoose.Schema({
  // Item details
  itemId: {
    type: String,
    required: true
  },
  itemTitle: {
    type: String,
    required: true
  },
  itemCategory: {
    type: String,
    required: true
  },
  
  // User details
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    required: true
  },
  userAddress: {
    type: String,
    required: true
  },
  userCity: {
    type: String,
    required: true
  },
  userDistrict: {
    type: String,
    required: true
  },
  
  // Pickup details
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    required: true
  },
  pickupNotes: {
    type: String,
    default: ''
  },
  userNotes: {
    type: String,
    default: ''
  },
  
  // Status and metadata
  status: {
    type: String,
    enum: ['pending', 'assigned', 'completed', 'cancelled'],
    default: 'pending'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('SimpleVolunteerHelp', simpleVolunteerHelpSchema);
