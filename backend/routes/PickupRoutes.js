const express = require("express");
const router = express.Router();
const {
  createPickup,
  getAllPickups,
  getPickupById,
  updatePickupStatus,
  deletePickup,
} = require("../controllers/PickupController");

// POST   /api/pickups            → Create new pickup or center booking
router.post("/", createPickup);

// GET    /api/pickups            → Get all bookings (?method=pickup&status=pending)
router.get("/", getAllPickups);

// GET    /api/pickups/:id        → Get single booking by ID
router.get("/:id", getPickupById);

// PUT    /api/pickups/:id/status → Update booking status
router.put("/:id/status", updatePickupStatus);

// DELETE /api/pickups/:id        → Delete a booking
router.delete("/:id", deletePickup);

module.exports = router;