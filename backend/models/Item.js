import mongoose from "mongoose";
import { randomUUID } from "crypto";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
);

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (coords) =>
          Array.isArray(coords) &&
          coords.length === 2 &&
          Number.isFinite(coords[0]) &&
          Number.isFinite(coords[1]),
        message: "coordinates must be [lng, lat]",
      },
    },
  },
  { _id: false },
);

const itemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      default: () => `itm_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
      index: true,
      unique: true,
      sparse: true,
      immutable: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, default: 0, min: 0 },
    category: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    condition: { type: String, default: "Used", trim: true },
    contact: { type: String, default: "" },
    ownerId: { type: String, required: true, index: true },
    images: { type: [imageSchema], default: [] },
    coverImage: { type: imageSchema, default: null },
    isActive: { type: Boolean, default: true, index: true },
    isHidden: { type: Boolean, default: false, index: true },
    views: { type: Number, default: 0 },
    location: { type: pointSchema, default: undefined },
  },
  { timestamps: true },
);

itemSchema.index({ title: "text", description: "text" });
itemSchema.index({ location: "2dsphere" });

const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);

export default Item;