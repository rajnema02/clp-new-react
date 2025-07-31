const router = require('express').Router()
const Controller = require('../Controllers/Anpr.controller')
const { verifyAccessToken } = require('../Helpers/jwt_helper')

router.post('/', verifyAccessToken, Controller.create)

router.get('/count', verifyAccessToken, Controller.count)

router.get('/analyse', verifyAccessToken, Controller.runAnpr)

router.get('/object-detection', verifyAccessToken, Controller.objectDetection)

router.get('/:id', verifyAccessToken, Controller.get)

router.get('/', verifyAccessToken, Controller.list)

router.put('/:id', verifyAccessToken, Controller.update)

router.delete('/:id', verifyAccessToken, Controller.delete)

router.put('/:id/restore', verifyAccessToken, Controller.restore)

module.exports = router
