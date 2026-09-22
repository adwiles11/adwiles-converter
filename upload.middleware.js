const multer = require('multer');
const path = require('path');
const { generateUniqueFilename } = require('../utils/file.utils');

class AppError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../temp'));
  },
  filename: (req, file, cb) => {
    cb(null, generateUniqueFilename(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg'];
  const allowedExts = ['.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('INVALID_FILE', 'File format is not supported. Only .jpg and .jpeg are allowed.', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB, 10) * 1024 * 1024,
  },
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('FILE_TOO_LARGE', `File size exceeds the maximum limit of ${process.env.MAX_FILE_SIZE_MB} MB.`, 413));
    }
    return next(new AppError('INVALID_REQUEST', err.message, 400));
  }
  if (err instanceof AppError) {
    return next(err);
  }
  next(err);
};

module.exports = {
  uploadSingle: (fieldName) => (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      handleMulterError(err, req, res, next);
    });
  },
};