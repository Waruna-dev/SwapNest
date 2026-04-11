import express from "express"; 
import {
    getVolunteers,
    getVolunteersByCenter,
    getVolunteerById,
    addVolunteer,
    updateVolunteer,
    deleteVolunteer,
    assignVolunteer,
    loginVolunteer, // --- NEW: Imported login function
} from "../controllers/VolunteerController.js";

const router = express.Router();

// Ensure req.body is always an object before any handler
router.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

// Volunteer routes
router.get("/", getVolunteers);
router.get("/center", getVolunteersByCenter);

// --- NEW: Login Route (MUST be above /:id routes to prevent ID resolution errors) ---
router.post("/login", loginVolunteer); 

router.post("/:id/assign", assignVolunteer);
router.get("/:id", getVolunteerById);
router.post("/", addVolunteer);
router.put("/:id", updateVolunteer);
router.delete("/:id", deleteVolunteer);

export default router;