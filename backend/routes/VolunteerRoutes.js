import express from "express"; 
import {
    getVolunteers,
    getVolunteersByCenter,
    getVolunteerById,
    addVolunteer,
    updateVolunteer,
    deleteVolunteer,
    assignVolunteer,
} from "../controllers/VolunteerController.js";

const router = express.Router();

// Ensure req.body is always an object before any handler (prevents "Cannot destructure of undefined")
router.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

// Volunteer routes (according to controller + model)
router.get("/", getVolunteers);
router.get("/center", getVolunteersByCenter);
router.post("/:id/assign", assignVolunteer);
router.get("/:id", getVolunteerById);
router.post("/", addVolunteer);
router.put("/:id", updateVolunteer);
router.delete("/:id", deleteVolunteer);



export default router;
