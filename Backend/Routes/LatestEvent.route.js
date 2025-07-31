const router = require('express').Router()
const Controller = require('../Controllers/LatestEvent.controller')
const { verfiyAccessToken } = require('../Helpers/jwt_helper')

router.post('/', Controller.create)

router.get('/', Controller.get)

module.exports = router;