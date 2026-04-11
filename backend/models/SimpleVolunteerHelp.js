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
  
  // Delivery details
  deliveryType: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true,
    default: 'pickup'
  },
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    required: function() {
      return this.deliveryType === 'pickup';
    }
  },
  pickupNotes: {
    type: String,
    default: ''
  },
  userNotes: {
    type: String,
    default: ''
  },
  
  // Location details
  locationCoordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0] // [longitude, latitude]
    }
  },
  
  // Status and metadata
  status: {
    type: String,
    enum: ['pending', 'center_assigned', 'assigned', 'completed', 'cancelled', 'accepted'],
    default: 'pending'
  },
  assignedCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center'
  },
  assignedVolunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer'
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
