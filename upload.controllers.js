const fs = require('fs');
const path = require('path');

class AppError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

const uploadFile = (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('INVALID_REQUEST', 'No file uploaded.', 400);
    }

    // Hapus file dari temp setelah divalidasi jika hanya ingin menyimpan metadata
    // Tapi untuk tahap ini, kita biarkan di temp sampai cleanup, atau hapus jika tidak dipakai
    // Untuk endpoint /upload murni, kita kembalikan info saja
    
    const response = {
      success: true,
      file: {
        id: path.basename(req.file.filename, path.extname(req.file.filename)),
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    };

    // Opsional: Hapus file temp setelah upload jika tidak langsung diconvert
    // fs.unlinkSync(req.file.path); 

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
};