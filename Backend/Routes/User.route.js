const router = require('express').Router()
const Controller = require('../Controllers/User.controller')
const { verifyAccessToken } = require('../Helpers/jwt_helper')

router.post('/usersignup', Controller.reg)

router.post('/userlogin', Controller.userLogin)

router.post('/verify', Controller.create)

router.put('/batch/:id', verifyAccessToken, Controller.updateBatch)

router.put('/removeBatch/:id', verifyAccessToken, Controller.removeBatch)

router.put('/updateReject/:id', verifyAccessToken, Controller.updateReject)

router.get('/verifyById/:id', Controller.get)

router.get('/count', verifyAccessToken, Controller.count)

router.get('/batchAllotmentList', verifyAccessToken, Controller.batchAllotmentList)

router.get('/verify', Controller.list)

router.get('/:id', verifyAccessToken, Controller.get)

router.get('/', verifyAccessToken, Controller.list)

router.put('/:id', verifyAccessToken, Controller.update)

router.delete('/:id', verifyAccessToken, Controller.delete)

router.put('/:id/restore', verifyAccessToken, Controller.restore)

module.exports = router
