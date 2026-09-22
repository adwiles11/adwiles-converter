require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const securityMiddleware = require('./middleware/security.middleware');
const errorHandler = require('./middleware/error.middleware');

const healthRoutes = require('./routes/health.routes');
const uploadRoutes = require('./routes/upload.routes');
const convertRoutes = require('./routes/convert.routes');

const { cleanupDirectory } = require('./utils/cleanup.utils');
const { cleanupExpiredRegistrations } = require('./utils/registry.utils');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Auto-create directories
const dirs = ['uploads', 'outputs', 'temp'];
dirs.forEach((dir) => {
  const dirPath = path.join(__dirname, `../${dir}`);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// 2. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
securityMiddleware(app);

// 3. Routes
app.use('/api', healthRoutes);
app.use('/api', uploadRoutes);
app.use('/api/convert', convertRoutes);

// 4. Error Handling
app.use(errorHandler);

// 5. Automatic Cleanup Interval (setiap 5 menit)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const ttl = parseInt(process.env.FILE_TTL_MINUTES, 10) || 30;
  cleanupDirectory(path.join(__dirname, '../temp'), ttl);
  cleanupDirectory(path.join(__dirname, '../outputs'), ttl);
  cleanupExpiredRegistrations();
  console.log('[Cleanup] Temporary and expired files cleaned up.');
}, CLEANUP_INTERVAL_MS);

// 6. Start Server
app.listen(PORT, () => {
  console.log(`🚀 ADWILES CONVERTER Backend is running on http://localhost:${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;