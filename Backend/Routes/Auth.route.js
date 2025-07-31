const router = require('express').Router()
const Controller = require('../Controllers/Auth.controller')
const { verifyAccessToken } = require('../Helpers/jwt_helper')

router.post('/authlogin', Controller.adminLogin)

router.post('/userlogin', Controller.userLogin)

router.post('/reset-password',verifyAccessToken, Controller.updatePassword)

router.post('/forget-password', Controller.forgetPassword)

router.get('/profile', verifyAccessToken, Controller.profile)

router.post('/getOtpVerification', Controller.getOtpVerification)

router.post('/sendotp', Controller.sendotp)

module.exports = router