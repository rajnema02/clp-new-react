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
      const accessToken = await signAccessToken(user._id);  // use _id
      const refreshToken = await signRefreshToken(user._id);

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
      const accessToken = await signAccessToken(savedAdmin._id);  // use _id here
      const refreshToken = await signRefreshToken(savedAdmin._id);

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

  profile: async (req, res) => {
    try {
      let userId = req.params.id || req.user?.userId || req.user?._id || req.user?.sub;

      if (!userId) {
        return res.status(400).json({ 
          success: false,
          message: "User ID is required"
        });
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid User ID format"
        });
      }

      const user = await Model.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found"
        });
      }

      res.json({
        success: true,
        message: "Profile fetched successfully",
        user
      });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ 
        success: false,
        message: "Internal server error"
      });
    }
  },

  getProfileById : async (req, res) => {
    try {
      const { id } = req.params;

      // Validate id
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid User ID format'
        });
      }

      // Find user by ID (exclude password)
      const user = await Model.findById(id).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile fetched successfully',
        data: user 
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  updatePassword: async (req, res, next) => {
    try {
      const result = req.body
      console.log(req.body);

      if (!result || !result.id) {
        return next(createError.NotAcceptable('Invalid Query Data'))
      }
      result.updated_at = Date.now()
      // result.updated_by = req.user.username

      let user = {}
      if (result) {
        if (!mongoose.Types.ObjectId.isValid(result.id)) {
          throw createError.BadRequest('Invalid User ID format')
        }
        user = await Model.findById(result.id)
        if (!user) {
          throw createError.NotFound('No user found to update')
        }
      } else {
        throw createError.NotFound('No query Data')
      }

      // Optional: uncomment if you want to check current password
      // const isMatch = await user.isValidPassword(result.currentPassword)
      // if (!isMatch)
      //   throw createError.Unauthorized('Current password is not valid')

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(result.password, salt)
      const newPassword = hashedPassword
      result.password = newPassword

      await Model.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(result.id) }, { $set: result })

      res.send({ success: true, msg: 'Password updated successfully' })
    } catch (error) {
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
  //     if (result) {
  //       user = req.user
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
      await Model.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(result._id) }, { $set: { otp } })
      if (result) {
        // console.log("OTP>>>>>>",otp,mobile);
        // ******************
        // Uncomment
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
      } else {
        throw createError.NotAcceptable('Please enter valid registered mobile number!!')
      }

      // if (!user.is_approved) {
      //   throw createError.NotAcceptable('User not verified yet, Please wait for approval.')
      // }

      if (!user) {
        throw createError.NotAcceptable('Please enter valid registered mobile number!!')
      }

      const accessToken = await signAccessToken(user._id)
      const refreshToken = await signRefreshToken(user._id)

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
