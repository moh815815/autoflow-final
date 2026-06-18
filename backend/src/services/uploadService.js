// src/services/uploadService.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directories exist
['images', 'documents', 'imports'].forEach(dir => {
  fs.mkdirSync(path.join(UPLOAD_DIR, dir), { recursive: true });
});

// ===== Storage config =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isDoc = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(file.mimetype);
    const isExcel = ['application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ].includes(file.mimetype);

    let subDir = 'documents';
    if (isImage) subDir = 'images';
    if (isExcel) subDir = 'imports';

    cb(null, path.join(UPLOAD_DIR, subDir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

// ===== File filter =====
const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`نوع الملف غير مدعوم: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ===== Upload route handler =====
const handleUpload = (fieldName) => [
  upload.single(fieldName),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
    const url = `/uploads/${req.file.destination.split('uploads/')[1]}/${req.file.filename}`;
    res.json({ url, filename: req.file.filename, size: req.file.size });
  }
];

module.exports = { upload, handleUpload };
