const express = require('express');
const { uploadSingle } = require('../middleware/upload.middleware');
const { uploadFile } = require('../controllers/upload.controller');

const router = express.Router();

router.post('/upload', uploadSingle('file'), uploadFile);

module.exports = router;