const router = require('express').Router()
const Controller = require('../Controllers/AuditExam.controller')
const { verifyAccessToken } = require('../Helpers/jwt_helper')


router.post('/reScheduleExam', verifyAccessToken, Controller.reScheduleExam)

router.post('/syncAnswer', verifyAccessToken, Controller.syncAnswer)

router.post('/syncAdminSuggestion', verifyAccessToken, Controller.syncAdminSuggestion)

router.post('/', verifyAccessToken, Controller.create)

router.get('/finalExamSubmit', verifyAccessToken, Controller.finalExammSubmit)

router.get('/checkIfAlreadyRescheduled', verifyAccessToken, Controller.checkIfAlreadyReScheduled)

router.get('/checkIfExamIsLastAttempt', verifyAccessToken, Controller.checkIfExamIsLastAttempt)

router.get('/getList', verifyAccessToken, Controller.list)

router.get('/getRescheduledExams/:id', verifyAccessToken, Controller.getRescheduledExams)

router.get('/getStudentExams/:id', verifyAccessToken, Controller.getStudentsExams)

router.get('/count', verifyAccessToken, Controller.count)

router.get('/getDemoQuestions',verifyAccessToken, Controller.getDemoExamQuestions);

router.get('/getQuestions', verifyAccessToken, Controller.getQuestions)

router.get('/getAnswerSheet', verifyAccessToken, Controller.getAnswerSheet)

router.get('/:id', verifyAccessToken, Controller.get)

router.post('/getExamSubmittedStatus', verifyAccessToken, Controller.getExamSubmittedStatus);

router.get('/title/:title', verifyAccessToken, Controller.getByTitle)

router.get('/slug/:slug', verifyAccessToken, Controller.getBySlug)

router.get('/', verifyAccessToken, Controller.getQuestions1)

router.post('/saveQuestions', verifyAccessToken, Controller.saveQuestionsInitially);

// router.get('/',  Controller.getQuestions)

router.put('/:id', verifyAccessToken, Controller.update)

router.put('/title/:title', verifyAccessToken, Controller.updateByTitle)

router.delete('/:id', verifyAccessToken, Controller.delete)

router.put('/:id/restore', verifyAccessToken, Controller.restore)

module.exports = router
