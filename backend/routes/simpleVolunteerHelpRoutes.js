import express from 'express';
import { createVolunteerHelp, getVolunteerHelpByUser } from '../controllers/simpleVolunteerHelpController.js';

const router = express.Router();

// Create a new volunteer help request
router.post('/', createVolunteerHelp);

// Get volunteer help requests for the logged-in user
router.get('/user', getVolunteerHelpByUser);

export default router;
