const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const securityMiddleware = (app) => {
  app.use(helmet({
    contentSecurityPolicy: false, // Disable untuk API REST sederhana
  }));

  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests, please try again later.'
      }
    }
  });
  app.use('/api/', limiter);
};

module.exports = securityMiddleware;