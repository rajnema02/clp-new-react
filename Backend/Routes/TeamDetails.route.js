const router = require('express').Router()
const Controller = require('../Controllers/TeamDetails.controller')
const { verifyAccessToken } = require('../Helpers/jwt_helper')

router.post('/', verifyAccessToken, Controller.create)

module.exports = router
