const router = require('express').Router()
const Controller = require('../Controllers/Center.controller')
const { verifyAccessToken } = require('../Helpers/jwt_helper')

router.post('/', Controller.create)

router.get('/count', Controller.count)

router.get('/:id', Controller.get)

router.get('/title/:title', Controller.getByTitle)

router.get('/slug/:slug', Controller.getBySlug)

router.get('/', Controller.list)

router.put('/:id', Controller.update)

router.put('/title/:title', Controller.updateByTitle)

router.delete('/:id', Controller.delete)

router.put('/:id/restore', Controller.restore)

module.exports = router
