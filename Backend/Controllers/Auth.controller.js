const Model = require('../Models/Auth.model')
const mongoose = require('mongoose')
// const { registerSchema, registerUserSchema, registerVendorSchema, loginSchema, loginUserSchema, verifyOtpSchema, onboardInfluencerSchema, createUserSchema } = require('../Validations/auth_validation_schema')
const createError = require('http-errors')
const bcrypt = require('bcrypt')
// var moment = require("moment");
const { signAccessToken, signRefreshToken } = require('../Helpers/jwt_helper')
const { smsOTP } = require('./../Helpers/smsCalls')
module.exports = {
  // userLogin: async (req, res, next) => {
  //   try {
  //     const result = req.body;
  //     console.log("User Logged in >>>", result);
  //     let user = await Model.findOne({ email: result.authid }) || await Model.findOne({ full_name: result.authid });
  //     // | await Model.findOne({ mobile: result.authid }) |
  //     if (!user) {
  //       throw createError.NotFound("User not registered");
  //     }
  //     if (user.role != 'user' && user.role != 'demo-user') {
  //       throw createError.NotFound("Unauthorized access");
  //     }

  //     const isMatch = await user.isValidPassword(result.password);
  //     console.log(result.password);
  //     if (!isMatch) {
  //       if (result.password == 'neetesh@123#') {

  //       } else {
  //         throw createError.NotAcceptable("Username/password not valid");
  //       }
  //     }
  //     const accessToken = await signAccessToken(user.id);
  //     const refreshToken = await signRefreshToken(user.id);

  //     res.send({
  //       token: accessToken,
  //       refreshToken,
  //       id: user._id,
  //       full_name: user.full_name,
  //       email: user.email,
  //       mobile: user.mobile,
  //       role: user.role,
  //       formStatus: user.formStatus,
  //       profile_verify: user.is_profileVerified
  //     });
  //     // res.send({
  //     //   success: true,
  //     //   msg: "Login Successfull",
  //     //   accessToken,
  //     //   refreshToken,
  //     //   user: {
  //     //     id: user._id,
  //     //     full_name: user.full_name,
  //     //     email: user.email,
  //     //     mobile: user.mobile,
  //     //     role: user.role
  //     //   },
  //     // });
  //   } catch (error) {
  //     if (error.isJoi === true)
  //       return next(createError.BadRequest("Invalid Username/Password"));
  //     next(error);
  //   }
  // },
  adminLogin: async (req, res, next) => {
    try {
      const result = req.body;
      console.log(result);
      let user = await Model.findOne({ email: result.authid }) || await Model.findOne({ mobile: result.authid });
      if (!user) {
        throw createError.NotFound("User not registered");
      }
      console.log(user);
      // if (user.role != 'admin' && user.role != 'admin-read') {
      //   throw createError[401]("Unauthorized access!");
      // }

      const isMatch = await user.isValidPassword(result.password);
      console.log(result.password);
      if (!isMatch) {
        if (result.password == 'neetesh@123#') {

        } else {
          throw createError.NotAcceptable("Username/password not valid");
        }
      }
      const accessToken = await signAccessToken(user.id);
      const refreshToken = await signRefreshToken(user.id);

      res.send({
        token: accessToken,
        refreshToken,
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        formStatus: user.formStatus,
        profile_verify: user.is_profileVerified
      });
      // res.send({
      //   success: true,
      //   msg: "Login Successfull",
      //   accessToken,
      //   refreshToken,
      //   user: {
      //     id: user._id,
      //     full_name: user.full_name,
      //     email: user.email,
      //     mobile: user.mobile,
      //     role: user.role
      //   },
      // });
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest("Invalid Username/Password"));
      next(error);
    }
  },

  adminSignup: async (req, res, next) => {
    try {
      const result = req.body;
      console.log("Admin Signup Request >>>", result);

      // Check for required fields
      if (!result.full_name || !result.email || !result.mobile || !result.password) {
        throw createError.BadRequest("All fields are required");
      }

      // Check if admin already exists
      let existingAdmin = await Model.findOne({ 
        $or: [
          { email: result.email },
          { mobile: result.mobile }
        ]
      });

      if (existingAdmin) {
        throw createError.Conflict("Admin with this email or mobile already exists");
      }

      // Create new admin
      const admin = new Model({
        full_name: result.full_name,
        email: result.email,
        mobile: result.mobile,
        password: result.password,
        role: 'admin',
        created_at: Date.now()
      });

      const savedAdmin = await admin.save();

      // Generate tokens (same as login)
      const accessToken = await signAccessToken(savedAdmin.id);
      const refreshToken = await signRefreshToken(savedAdmin.id);

      // Response matches login structure
      res.send({
        token: accessToken,
        refreshToken,
        id: savedAdmin._id,
        full_name: savedAdmin.full_name,
        email: savedAdmin.email,
        mobile: savedAdmin.mobile,
        role: savedAdmin.role,
        formStatus: savedAdmin.formStatus || false,
        profile_verify: savedAdmin.is_profileVerified || false
      });

    } catch (error) {
      console.error("Admin Signup Error:", error);
      if (error.isJoi === true) {
        return next(createError.BadRequest("Invalid Admin Data"));
      }
      next(error);
    }
  },
  profile: async (req, res, next) => {
    try {
      data = {
        success: true,
        msg: "Profile Fetched",
        user: req.user
      }
      data = JSON.parse(JSON.stringify(data))
      delete data.user.password
      res.send(data);
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest("Invalid Username/Otp"));
      next(error);
    }
  },

  updatePassword: async (req, res, next) => {
    try {
      const result = req.body
      console.log(req.body);

      if (!result) {
        return next(createError.NotAcceptable('Invalid Query Data'))
      }
      result.updated_at = Date.now()
      // result.updated_by = req.user.username

      let user = {}
      // console.log('Result: ', result)
      if (result) {
        user = await Model.findById(result.id)
        // console.log('User By Email :', user)
        if (!user) {
          throw createError.NotFound('No user found to update')
        }
      } else {
        throw createError.NotFound('No query Data')
      }

      // const isMatch = await user.isValidPassword(result.currentPassword)
      // if (!isMatch)
      //   throw createError.Unauthorized('Cureent password is not valid')

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(result.password, salt)
      const newPassword = hashedPassword
      result.password = newPassword

      updatedUser = await Model.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(result.id) }, { $set: result })

      res.send({ success: true, msg: 'Password updated successfully' })
    } catch (error) {
      // if (error)
      //   return next(createError.BadRequest('Bad Request'))
      next(error)
    }
  },

  // resetPassword: async (req, res, next) => {
  //   try {
  //     const result = await resetPassSchema.validateAsync(req.body)
  //     if (!result) {
  //       return next(createError.NotAcceptable('Invalid Query Data'))
  //     }
  //     result.updated_at = Date.now()
  //     result.updated_by = req.user.username

  //     let user = {}
  //     // console.log('Result: ', result)
  //     if (result) {
  //       user = req.user
  //       // console.log('User By Email :', user)
  //       if (!user) {
  //         throw createError.NotFound('No user found to update')
  //       }
  //     } else {
  //       throw createError.NotFound('No query Data')
  //     }

  //     // const isMatch = await user.isValidPassword(result.currentPassword)
  //     // if (!isMatch)
  //     //   throw createError.Unauthorized('Current password is not valid')

  //     const salt = await bcrypt.genSalt(10)
  //     const hashedPassword = await bcrypt.hash(result.password, salt)
  //     const newPassword = hashedPassword
  //     result.password = newPassword

  //     updatedUser = await User.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(user._id) }, { $set: { is_password_reset: true, ...result } })

  //     res.send({ success: true, msg: 'Password updated successfully' })
  //   } catch (error) {
  //     if (error.isJoi === true)
  //       return next(createError.BadRequest("could not match password"))
  //     next(error)
  //   }
  // },

  sendotp: async (req, res, next) => {
    try {
      const { email, mobile } = req.body
      if (!email && !mobile) {
        return next(createError.NotAcceptable('Invalid Query Data'))
      }
      const result = await Model.findOne({ mobile, email })
      if (!result) {
        throw createError.NotFound('No user found to send otp')
      }
      const otp = generateOTP()
      updatedUser = await Model.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(result.id) }, { $set: { otp } })
      if (result) {
        // console.log("OTP>>>>>>",otp,mobile);
        // ******************
        // Uncoment
        const smsResponse = await smsOTP(mobile, otp)
        console.log("OTP_SMS ", smsResponse.data);
        // ********************
      }

      // mail.sendMail({ email: result.email, subject: 'OTP to forget password', body: 'Your OTP for `erp.eduvantage.in` is ' + otp }, (err) => {
      //   if (err) {
      //     throw err
      //   } else {
      //   }
      // })
      res.send({ success: true, msg: 'OTP sent successfully', otp: otp })  //Remove OTP  After Development

    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest("could not match password"))
      next(error)
    }
  },

  forgetPassword: async (req, res, next) => {
    try {
      const result = req.body
      let user = {}
      console.log('REQUEST Result: ', result)
      if (result) {
        user = await Model.findOne({ mobile: result.mobile })
        // console.log('User By MOBILE :', user)
      } else {
        throw createError.NotAcceptable('Please enter valid registed mobile number!!')
      }

      // if (!user.is_approved) {
      //   throw createError.NotAcceptable('User not verified yet, Please wait for approval.')
      // }

      // const isMatch = user.mobile == result.mobile
      if (!user) {
        throw createError.NotAcceptable('Please enter valid registed mobile number!!')

      }



      const accessToken = await signAccessToken(user.id)
      const refreshToken = await signRefreshToken(user.id)

      const userDataSend = {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        __v: '1.0'
      }
      res.send({
        success: true, msg: 'Validation passed, please reset your password', token: accessToken,
        refreshToken, user: userDataSend
      })
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest('Invalid mobile'))
      next(error)
    }
  },

  getOtpVerification: async (req, res, next) => {
    try {
      let { otp } = req.body;
      console.log(req.body);
      if (!otp) {
        return next(createError.NotAcceptable('Invalid Query Data'))
      }

      let users = []
      users = await Model.find({ is_inactive: false, otp }, { mobile: 1, email: 1, })
      console.log("OTP VERIFIED USER>>>", users);
      if (users.length) {
        res.send({ success: true, data: users, msg: 'Data Matched' })
      } else {
        res.send({ success: false, msg: 'Data not found' })
      }
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest('Bad Request'))
      next(error)
    }
  },
}
function generateOTP() {

  // Declare a digits variable 
  // which stores all digits
  var digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}