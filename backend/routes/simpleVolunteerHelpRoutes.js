import express from 'express';
import { createVolunteerHelp, getAllVolunteerHelpRequests, getVolunteerHelpByUser } from '../controllers/simpleVolunteerHelpController.js';

const router = express.Router();

// Create a new volunteer help request
router.post('/', createVolunteerHelp);

// Get all volunteer help requests (for admin/volunteer dashboard)
router.get('/', getAllVolunteerHelpRequests);

// Get volunteer help requests for the logged-in user
router.get('/user', getVolunteerHelpByUser);

export default router;
