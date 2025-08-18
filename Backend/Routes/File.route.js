const express = require('express');
const router = express.Router();
const fileController = require('../Controllers/Files.controller');
const upload = require('../Helpers/multer'); // Your multer configuration

// File upload routes
router.post('/upload', upload.single('file'), fileController.uploadFile);
router.post('/uploadDocument/:studentId', upload.single('file'), fileController.uploadDocument);
router.post('/uploadS3File', upload.single('file'), fileController.uploadS3File);
router.get('/list/:userId', fileController.listFiles);

module.exports = router;