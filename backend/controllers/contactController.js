import asyncHandler from "express-async-handler";
import ContactMessage from "../models/ContactMessage.js";

const createContactMessage = asyncHandler(async (req, res) => {
  const { fullName, email, phoneNumber, subject, inquiryType, message } =
    req.body;

  if (!fullName || !email || !subject || !inquiryType || !message) {
    res.status(400);
    throw new Error("Please fill in all required contact form fields.");
  }

  const contactMessage = await ContactMessage.create({
    fullName,
    email,
    phoneNumber: phoneNumber || "",
    subject,
    inquiryType,
    message,
    attachment: req.file
      ? {
          originalName: req.file.originalname,
          filename: req.file.filename,
          mimeType: req.file.mimetype,
          path: req.file.path,
          size: req.file.size,
        }
      : undefined,
  });

  res.status(201).json({
    message: "Your message has been received.",
    submission: contactMessage,
  });
});

export { createContactMessage };
