import multer from "multer";

const storage = multer.memoryStorage();

// no file filtering; accept any file type
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB each
});

export default upload;