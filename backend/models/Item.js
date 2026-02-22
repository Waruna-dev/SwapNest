import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    // Store up to 5 Cloudinary URLs.
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "Maximum 5 images allowed",
      },
    },
    // Backward compatibility for older clients expecting a single image.
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

itemSchema.pre("save", function syncPrimaryImage() {
  if (Array.isArray(this.images) && this.images.length > 0) {
    this.image = this.images[0];
  } else {
    this.image = undefined;
  }
});

const Item = mongoose.model("Item", itemSchema);
export default Item;
