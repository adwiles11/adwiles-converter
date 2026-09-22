const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class ImageService {
  async convertJpgToPng(inputPath, outputDir) {
    try {
      const outputFileName = `${uuidv4()}.png`;
      const outputPath = path.join(outputDir, outputFileName);

      await sharp(inputPath)
        .png({ quality: 90 })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);

      return {
        fileName: outputFileName,
        size: stats.size,
        path: outputPath,
      };
    } catch (error) {
      throw new Error(`CONVERSION_FAILED: ${error.message}`);
    }
  }
}

module.exports = new ImageService();