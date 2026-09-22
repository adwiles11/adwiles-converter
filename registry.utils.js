// In-memory registry untuk melacak file hasil konversi yang valid
// Mencegah arbitrary file download tanpa database
const conversionRegistry = new Map();

const registerConversion = (id, filePath, originalName, ttlMinutes) => {
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  conversionRegistry.set(id, { filePath, originalName, expiresAt });
};

const getConversionInfo = (id) => {
  const info = conversionRegistry.get(id);
  if (!info) return null;
  
  if (Date.now() > info.expiresAt) {
    conversionRegistry.delete(id);
    return null;
  }
  return info;
};

const unregisterConversion = (id) => {
  conversionRegistry.delete(id);
};

const cleanupExpiredRegistrations = () => {
  const now = Date.now();
  for (const [id, info] of conversionRegistry.entries()) {
    if (now > info.expiresAt) {
      conversionRegistry.delete(id);
    }
  }
};

module.exports = {
  registerConversion,
  getConversionInfo,
  unregisterConversion,
  cleanupExpiredRegistrations,
};