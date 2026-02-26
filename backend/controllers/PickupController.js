const Pickup = require("../models/PickupModel");

// @desc    Create a new pickup / center booking
// @route   POST /api/pickups
// @access  Public
const createPickup = async (req, res) => {
  try {
    const { name, phone, method, address, center, date, notes } = req.body;

    const pickup = await Pickup.create({
      name,
      phone,
      method,
      address,
      center,
      date,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Pickup booking created successfully",
      data: pickup,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

// @desc    Get all pickups
// @route   GET /api/pickups
// @access  Private (Admin)
const getAllPickups = async (req, res) => {
  try {
    const { method, status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (method) filter.method = method;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pickups = await Pickup.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Pickup.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: pickups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

// @desc    Get a single pickup by ID
// @route   GET /api/pickups/:id
// @access  Public
const getPickupById = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: pickup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

// @desc    Update pickup status
// @route   PUT /api/pickups/:id/status
// @access  Private (Admin)
const updatePickupStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const pickup = await Pickup.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Pickup status updated to "${status}"`,
      data: pickup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

// @desc    Delete a pickup booking
// @route   DELETE /api/pickups/:id
// @access  Private (Admin)
const deletePickup = async (req, res) => {
  try {
    const pickup = await Pickup.findByIdAndDelete(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: "Pickup booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pickup booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

module.exports = {
  createPickup,
  getAllPickups,
  getPickupById,
  updatePickupStatus,
  deletePickup,
};