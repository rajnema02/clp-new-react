const router = require('express').Router();
const Controller = require('../Controllers/Auth.controller');
const { verifyAccessToken } = require('../Helpers/jwt_helper');

router.post('/authlogin', Controller.adminLogin);

router.post('/authsignup', Controller.adminSignup);

// router.post('/userlogin', Controller.userLogin)

router.post('/reset-password', verifyAccessToken, Controller.updatePassword);

router.post('/forget-password', Controller.forgetPassword);

router.get('/profile', verifyAccessToken, Controller.profile);

router.get('/profile/:id', verifyAccessToken, Controller.profile);


router.get('/profile/:id', verifyAccessToken, Controller.getProfileById);

router.post('/getOtpVerification', Controller.getOtpVerification);

router.post('/sendotp', Controller.sendotp);

// ✅ NEW: Verify token endpoint
router.get('/verify-token', verifyAccessToken, (req, res) => {
  res.status(200).json({
    valid: true,
    user: req.user
  });
});

module.exports = router;
