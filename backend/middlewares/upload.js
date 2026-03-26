import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/swaps';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (r, f, cb) => cb(null, uploadDir),
  filename: (r, f, cb) => cb(null, 'swap-' + Date.now() + '-' + Math.round(Math.random()*1E9) + path.extname(f.originalname))
});

const fileFilter = (r, f, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  cb(null, allowed.test(path.extname(f.originalname).toLowerCase()) && allowed.test(f.mimetype));
};

const upload = multer({ 
  storage, 
  limits: { fileSize: 5*1024*1024, files: 5 },
  fileFilter  
});

export const uploadSwapPhotos= (req, res, next) => {
  upload.array('photos', 5)(req, res, err => {
    if (!err) return next();
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Max 5MB' :
                err.code === 'LIMIT_FILE_COUNT' ? 'Max 5 files' : err.message;
    res.status(400).json({ success: false, message: msg });
  });
};