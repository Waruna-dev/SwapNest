const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    method: {
      type: String,
      enum: ["pickup", "center"],
      required: [true, "Method is required"],
    },
    // Used when method === "pickup"
    address: {
      type: String,
      trim: true,
    },
    // Used when method === "center"
    center: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date and time is required"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Validation: pickup needs address, center needs center name
pickupSchema.pre("validate", function (next) {
  if (this.method === "pickup" && !this.address) {
    this.invalidate("address", "Address is required for pickup method");
  }
  if (this.method === "center" && !this.center) {
    this.invalidate("center", "Center name is required for center method");
  }
  next();
});

module.exports = mongoose.model("Pickup", pickupSchema);