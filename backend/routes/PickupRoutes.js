import express from "express";
import {
  createPickup,
  getAllPickups,
  getPickupById,
  updatePickupStatus,
  deletePickup,
} from "../controllers/PickupController.js";

const router = express.Router();

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

export default router;