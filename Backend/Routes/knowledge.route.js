const router = require('express').Router()
const Controller = require('../Controllers/knowledge.controller')
const { verifyAccessToken } = require('../Helpers/jwt_helper')

router.post('/',  Controller.create)

module.exports = router;