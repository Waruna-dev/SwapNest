import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String },
    contact: { type: String },
    ownerId: { type: String, required: true },

    mode: {
      type: String,
      enum: ["SELL", "SWAP", "DONATE"],
      default: "SELL",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

itemSchema.index({ location: "2dsphere" });

const Item = mongoose.model("Item", itemSchema);
export default Item;
