const router = require('express').Router()
const Controller = require('../Controllers/StudyMaterial.controller')
const { verifyAccessToken } = require('../Helpers/jwt_helper')

router.post('/',verifyAccessToken,  Controller.create)

router.get('/count', verifyAccessToken, Controller.count)

router.get('/:id', verifyAccessToken, Controller.get)

router.get('/title/:title', verifyAccessToken, Controller.getByTitle)

router.get('/slug/:slug', verifyAccessToken, Controller.getBySlug)

router.get('/', verifyAccessToken, Controller.list)

router.put('/:id',verifyAccessToken, Controller.update)

router.put('/title/:title', verifyAccessToken, Controller.updateByTitle)

router.delete('/:id', verifyAccessToken, Controller.delete)

router.put('/:id/restore', verifyAccessToken, Controller.restore)

module.exports = router