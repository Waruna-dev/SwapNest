import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/swapCloudinary.js"; 

// Set up the storage engine for SWAP photos
const swapStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "swapnest/swaps", // Your own folder name
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 800, height: 800, crop: "limit" },
      { quality: "auto" }
    ],
  },
});

// Configure multer for swap photos
const upload = multer({
  storage: swapStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5, // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, GIF, and WEBP images are allowed"), false);
    }
  },
});

// Middleware for handling multiple photos
export const uploadSwapPhotos = (req, res, next) => {
  upload.array("photos", 5)(req, res, (err) => {
    if (err) {
      let message = "File upload error";
      if (err.code === "LIMIT_FILE_SIZE") {
        message = "Each photo must be less than 5MB";
      } else if (err.code === "LIMIT_FILE_COUNT") {
        message = "Maximum 5 photos allowed";
      } else if (err.message) {
        message = err.message;
      }
      return res.status(400).json({ success: false, message });
    }

    // Log uploaded files for debugging
    if (req.files && req.files.length > 0) {
      console.log(`📸 Uploaded ${req.files.length} swap photos to Cloudinary`);
      req.files.forEach((file) => {
        console.log(`   - ${file.filename} -> ${file.path}`);
      });
    }

    next();
  });
};

// Helper to delete swap photos from Cloudinary
export const deleteSwapPhoto = async (publicId) => {
  if (!publicId) return { success: false, error: "No publicId provided" };
  
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️ Deleted from Cloudinary: ${publicId}`);
    return { success: true, result };
  } catch (error) {
    console.error(`❌ Failed to delete ${publicId}:`, error);
    return { success: false, error };
  }
};