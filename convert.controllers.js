const fs = require('fs');
const path = require('path');
const imageService = require('../services/image.service');
const { registerConversion } = require('../utils/registry.utils');

class AppError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

const convertJpgToPng = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('INVALID_REQUEST', 'No file uploaded.', 400);
    }

    const inputPath = req.file.path;
    const outputDir = path.join(__dirname, '../../outputs');

    // Proses konversi
    const result = await imageService.convertJpgToPng(inputPath, outputDir);

    // Hapus file temporary setelah berhasil dikonversi
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }

    // Register ke registry untuk download yang aman
    const downloadId = path.basename(result.fileName, '.png');
    const ttlMinutes = parseInt(process.env.FILE_TTL_MINUTES, 10) || 30;
    
    registerConversion(downloadId, result.path, req.file.originalname.replace(/\.[^/.]+$/, '.png'), ttlMinutes);

    res.status(200).json({
      success: true,
      conversion: 'jpg-to-png',
      input: {
        originalName: req.file.originalname,
        size: req.file.size,
      },
      output: {
        fileName: result.fileName,
        size: result.size,
      },
      downloadUrl: `/api/download/${downloadId}`,
    });
  } catch (error) {
    // Cleanup file input jika gagal
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error.message.startsWith('CONVERSION_FAILED')) {
      return next(new AppError('CONVERSION_FAILED', error.message.replace('CONVERSION_FAILED: ', ''), 500));
    }
    next(error);
  }
};

module.exports = {
  convertJpgToPng,
};