const router = require('express').Router()
const Controller = require('../Controllers/ActivityLog.controller')
const { verifyAccessToken } = require('../Helpers/jwt_helper')

router.post('/',verifyAccessToken, Controller.create);

module.exports = router;