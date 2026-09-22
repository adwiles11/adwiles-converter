const express = require('express');
const { uploadSingle } = require('../middleware/upload.middleware');
const { convertJpgToPng } = require('../controllers/convert.controller');
const { getConversionInfo, unregisterConversion } = require('../utils/registry.utils');
const path = require('path');
const fs = require('fs');

class AppError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

const router = express.Router();

// JPG to PNG Conversion
router.post('/jpg-to-png', uploadSingle('file'), convertJpgToPng);

// Download Endpoint
router.get('/download/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const info = getConversionInfo(id);

    if (!info) {
      throw new AppError('DOWNLOAD_NOT_FOUND', 'File not found or has expired.', 404);
    }

    // Security: Pastikan path berada di dalam direktori outputs
    const outputsDir = path.resolve(__dirname, '../../outputs');
    const filePath = path.resolve(info.filePath);

    if (!filePath.startsWith(outputsDir)) {
      throw new AppError('INTERNAL_ERROR', 'Invalid file path.', 500);
    }

    if (!fs.existsSync(filePath)) {
      unregisterConversion(id);
      throw new AppError('FILE_NOT_FOUND', 'File was deleted from server.', 404);
    }

    res.download(filePath, info.originalName, (err) => {
      if (err) {
        next(new AppError('INTERNAL_ERROR', 'Error downloading file.', 500));
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;