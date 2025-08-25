const router = require('express').Router();
const Controller = require('../Controllers/ExamReport.controller');
const { verifyAccessToken } = require('../Helpers/jwt_helper');

// Get all exam results with counts
router.get('/getExamReport/', verifyAccessToken, Controller.getExamReport);

// Get passed students list
router.get('/getPassedList/', verifyAccessToken, Controller.passedList);

// Get failed students list  
router.get('/getFailedList/', verifyAccessToken, Controller.failedList);

// Legacy route for backward compatibility
router.get('/getResultList/', verifyAccessToken, Controller.getResultList);

// Get final exam report with batch data
router.get('/getFinalExamReport/', verifyAccessToken, Controller.getFinalExamReport);

// Get student certificates
router.get('/getStudentCertificates/', verifyAccessToken, Controller.getStudentsCertificates);

// Download certificate PDF
router.get('/download-certificatePDF/', verifyAccessToken, Controller.downloadCertificatePDF);

module.exports = router;