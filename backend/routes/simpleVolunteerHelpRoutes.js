import express from 'express';
import {
  createVolunteerHelp,
  getAllVolunteerHelpRequests,
  getVolunteerHelpByUser,
  assignRequestToCenter,
  acceptRequest,
  cancelRequest,
  getRequestsByCenter,
  getRequestsByVolunteer,
  updateRequestStatus
} from '../controllers/simpleVolunteerHelpController.js';

const router = express.Router();

// IMPORTANT: Specific named routes MUST come before /:id param routes
// to prevent Express matching "user" or "center" as an ID

// Create a new volunteer help request
router.post('/', createVolunteerHelp);

// Get all volunteer help requests (for admin dashboard)
router.get('/', getAllVolunteerHelpRequests);

// Get volunteer help requests for the logged-in user
router.get('/user', getVolunteerHelpByUser);

// Get requests assigned to a specific center (volunteer dashboard)
router.get('/center/:centerId', getRequestsByCenter);

// Get requests accepted by a specific volunteer (for activity tab)
router.get('/volunteer/:volunteerId', getRequestsByVolunteer);

// Assign a request to a center (must be after specific routes)
router.put('/:id/assign-center', assignRequestToCenter);

// Accept a request (by volunteer)
router.put('/:id/accept', acceptRequest);

// Cancel a request (by volunteer)
router.put('/:id/cancel', cancelRequest);

// Update status (e.g. center_received)
router.put('/:id/status', updateRequestStatus);

export default router;
