const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Vercel is read-only — use /tmp which is writable on serverless
const isVercel = process.env.VERCEL || process.env.NOW_REGION;
const uploadsDir = isVercel ? '/tmp/uploads' : path.join(__dirname, '../uploads');

// Create dir only in non-Vercel environments (local dev)
if (!isVercel) {
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (e) {
    console.warn('Could not create uploads dir:', e.message);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // On Vercel, create /tmp/uploads on the fly
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    } catch (e) {}
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const unique = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only images and PDFs are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;