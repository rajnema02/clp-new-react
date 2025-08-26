const router = require('express').Router()
const Controller = require('../Controllers/ExamReport.controller')
const { verifyAccessToken } = require('../Helpers/jwt_helper')

router.get('/getPassedList/',verifyAccessToken,  Controller.passedList)
router.get('/getFailedList/',verifyAccessToken,  Controller.failedList)
router.get('/getResultList/',verifyAccessToken,  Controller.getResultList)
router.get('/getExamReport/',verifyAccessToken,  Controller.getExamReport)
router.get('/getFinalExamReport/',verifyAccessToken,  Controller.getFinalExamReport)
router.get('/getStudentCertificates/',verifyAccessToken,  Controller.getStudentsCertificates);
router.get('/download-certificatePDF/',verifyAccessToken,  Controller.downloadCertificatePDF)



module.exports = router
