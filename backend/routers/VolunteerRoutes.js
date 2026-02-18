const express = require("express");
const router = express.Router();
const VolunteerController = require("../controllers/VolunteerController");

// Routes
router.post("/", VolunteerController.addVolunteer);
router.get("/", VolunteerController.getVolunteers);
router.get("/:id", VolunteerController.getVolunteerById);
router.put("/:id", VolunteerController.updateVolunteer);
router.delete("/:id", VolunteerController.deleteVolunteer);

module.exports = router;
