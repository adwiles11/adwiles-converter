const fs = require('fs');
const path = require('path');
const { unregisterConversion } = require('./registry.utils');

const cleanupDirectory = (dirPath, ttlMinutes) => {
  if (!fs.existsSync(dirPath)) return;

  const now = Date.now();
  const ttlMs = ttlMinutes * 60 * 1000;

  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    try {
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > ttlMs) {
        fs.unlinkSync(filePath);
        // Jika file ada di outputs, hapus juga dari registry
        if (dirPath.includes('outputs')) {
          // Cari key di registry yang cocok dengan filePath ini (simplified cleanup)
          // Dalam implementasi nyata, registry bisa di-scan atau di-pass down
        }
      }
    } catch (err) {
      console.error(`[Cleanup] Error deleting ${filePath}:`, err.message);
    }
  });
};

const cleanupRegistry = () => {
  // Hapus file fisik yang sudah expired di registry
  // (Opsional: bisa digabung dengan cleanupDirectory jika registry menyimpan path)
};

module.exports = {
  cleanupDirectory,
  cleanupRegistry,
};