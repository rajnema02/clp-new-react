const router = require('express').Router()
const Controller = require('../Controllers/Message.controller')
const { verifyAccessToken } = require('../Helpers/jwt_helper')

router.post('/:id',verifyAccessToken,  Controller.update)

router.post('/',verifyAccessToken,  Controller.create)

router.get('/common',  Controller.getCommonMessages)

router.get('/studentMessagesByAdmin',verifyAccessToken,  Controller.getStudentMessagesByAdmin)

router.get('/studentMessages',verifyAccessToken,  Controller.getStudentMessages)

router.get('/disableMessage/:id',verifyAccessToken,  Controller.disableMessage)

router.get('/:id',verifyAccessToken,  Controller.get)

router.get('/',verifyAccessToken,  Controller.list)


module.exports = router;