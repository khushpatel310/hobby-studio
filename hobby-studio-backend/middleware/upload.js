const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==========================================
// Upload Directory
// ==========================================

const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_PATH || 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ==========================================
// Allowed Types
// ==========================================

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif'
];

const crypto = require('crypto');

// ==========================================
// Storage
// ==========================================

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },

  filename(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(16).toString('hex');
    const safeName = `${Date.now()}-${randomHex}${extension}`;
    cb(null, safeName);
  },
});

// ==========================================
// File Filter
// ==========================================

const fileFilter = (req, file, cb) => {
  // Reject path traversal and null bytes
  if (file.originalname.includes('\0') || file.originalname.includes('..')) {
    return cb(new Error('Invalid filename detected.'), false);
  }

  const extension = path.extname(file.originalname).toLowerCase();

  // Prevent multiple dangerous extensions (e.g. evil.php.png)
  const parts = file.originalname.split('.');
  if (parts.length > 2) {
    const forbiddenExts = ['php', 'js', 'sh', 'exe', 'bat', 'cmd', 'py', 'pl', 'cgi', 'html', 'htm', 'phtml'];
    for (let i = 1; i < parts.length - 1; i++) {
      if (forbiddenExts.includes(parts[i].toLowerCase())) {
        return cb(new Error('Dangerous multi-extension detected.'), false);
      }
    }
  }

  const extensionAllowed = allowedExtensions.includes(extension);
  const mimeAllowed = allowedMimeTypes.includes(file.mimetype);

  if (extensionAllowed && mimeAllowed) {
    return cb(null, true);
  }

  return cb(
    new Error('Only standard images (JPG, PNG, WEBP, AVIF) are allowed.'),
    false
  );
};

// ==========================================
// Upload Middleware
// ==========================================

const upload = multer({

  storage,

  fileFilter,

  limits: {

    fileSize:
      Number(process.env.MAX_FILE_SIZE) ||
      5 * 1024 * 1024,

    files: 1,

  },

});

module.exports = upload;