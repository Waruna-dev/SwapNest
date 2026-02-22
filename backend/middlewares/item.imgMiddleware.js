import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { files: 5, fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

const uploadToCloudinary = (buffer, folder = "swapnest/items") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      },
    );
    stream.end(buffer);
  });

export const uploadImages = [
  upload.array("images", 5),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) return next();

      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        return res.status(500).json({
          message:
            "Cloudinary env vars are missing (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)",
        });
      }

      const uploads = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer)),
      );

      // Keep controller contract: req.files[].path should be URL.
      req.files = uploads.map((u) => ({
        path: u.secure_url,
        public_id: u.public_id,
      }));

      next();
    } catch (error) {
      next(error);
    }
  },
];

export default uploadImages;
