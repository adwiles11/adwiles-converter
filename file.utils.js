const path = require('path');
const { v4: uuidv4 } = require('uuid');

const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  return `${uuidv4()}${ext}`;
};

const getSafeFilePath = (directory, filename) => {
  const safeName = path.basename(filename);
  return path.join(directory, safeName);
};

module.exports = {
  generateUniqueFilename,
  getSafeFilePath,
};