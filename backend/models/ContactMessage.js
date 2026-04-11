import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    inquiryType: {
      type: String,
      required: true,
      enum: [
        "general",
        "support",
        "partnership",
        "listing",
        "report",
        "other",
      ],
      default: "general",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    attachment: {
      originalName: {
        type: String,
        default: "",
      },
      filename: {
        type: String,
        default: "",
      },
      mimeType: {
        type: String,
        default: "",
      },
      path: {
        type: String,
        default: "",
      },
      size: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

export default ContactMessage;
