const Model = require("../Models/Auth.model");
const preUserModel = require("../Models/preUser.model");
const BatchModel = require("../Models/Batch.model");
const createError = require("http-errors");
const mongoose = require("mongoose");
const ModelName = "User";
const {
  uploadImage,
  uploadVendorData,
} = require("./../Helpers/helper_functions");
const {
  smsReg,
  smsOTP,
  smsFormFilled,
  smsProfileVerfied,
  smsTeamsInstruction,
  smsOnlineClassInstruction,
  smsReject,
  smsOnlineClass
} = require("./../Helpers/smsCalls");
const preUser = require("../Models/preUser.model");
const { json } = require("express");
module.exports = {

  //////////////////  pre register user  ////////////////////

  reg: async (req, res, next) => {
    try {
      uploadImage(req, res, async (err) => {
        if (err) {
          return res.status(501).json({ error: err });
        }
        const data = req.body;
        console.log(data);
        try {
          const dataExists = await Model.findOne({
            $or: [{ email: data.email }, { mobile: data.mobile }],
            is_inactive: false,
          }).lean();
          if (dataExists) {
            throw createError.Conflict(
              `${ModelName} already exists with email/mobile`
            );
          }
          // const smsResponse = await smsReg(data.mobile);
          // console.log("REG_SMS ", smsResponse.data);

          const otp = generateOTP()
          if (data.mobile) {
            console.log("OTP_SMS ", otp);
            // return

            const smsResponse = await smsOTP(data.mobile, otp)
            console.log("OTP_SMS ", smsResponse.data);
            // ********************
          }
          // return
          data.created_at = Date.now();
          data.mobileOtp = otp
          const newData = new preUserModel(data);
          const result = await newData.save();
          // if (data.mobile) {
          //   const smsResponse = await smsReg(data.mobile);
          //   console.log("REG_SMS ", smsResponse.data);
          // }
          res.json(newData);

          return;
        } catch (error) {
          next(error);
          return;
        }
      });
    } catch (error) {
      next(error);
    }
  },
  ////////////////////// register user /////////////////////////////////
  create: async (req, res, next) => {
    try {
      uploadImage(req, res, async (err) => {
        if (err) {
          return res.status(501).json({ error: err });
        }
        const data = req.body;
        // console.log('???????????????', data);
        // return
        try {
          const user = await preUser.findOne({ _id: mongoose.Types.ObjectId(data.userId) })
          // console.log('>>>>>>>>>>', user);
          // return
          let newUserData = {}
          if (user) {
            if (data.otp == user.mobileOtp) {
              // console.log('verified successfully');
              newUserData.full_name = user.full_name,
                newUserData.email = user.email,
                newUserData.mobile = user.mobile,
                newUserData.role = user.role,
                newUserData.password = data.password,
                newUserData.is_profileVerified = user.is_profileVerified,
                newUserData.is_profileRejected = user.is_profileRejected,
                newUserData.formStatus = user.formStatus,
                newUserData.disabled = user.disabled,
                newUserData.is_inactive = user.is_inactive,
                newUserData.disabled = user.disabled,
                newUserData.is_spam = user.is_spam,
                newUserData.created_at = user.created_at
              // newUserData.__v = user.__v
              // return
            } else {
              res.json({ success: false, res: 'Wrong OTP' })
              // console.log('wrong otp');
              return
            }
          }
          // const dataExists = await Model.findOne({
          //   $or: [{ email: data.email }, { mobile: data.mobile }],
          //   is_inactive: false,
          // }).lean();
          // if (dataExists) {
          //   throw createError.Conflict(
          //     `${ModelName} already exists with email/mobile`
          //   );
          // }

          // data.created_at = Date.now();
          // console.log('==========', newUserData);
          // return
          const newData = new Model(newUserData);
          const result = await newData.save();
          // if (data.mobile) {
          //   const smsResponse = await smsReg(data.mobile);
          //   console.log("REG_SMS ", smsResponse.data);
          // }
          res.json({ success: true, res: newData });

          return;
        } catch (error) {
          next(error);
          return;
        }
      });
    } catch (error) {
      next(error);
    }
  },
  get: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Model.findOne({ _id: mongoose.Types.ObjectId(id) });
      if (!result) {
        throw createError.NotFound(`No ${ModelName} Found`);
      }
      delete result._doc.password;
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },
  list: async (req, res, next) => {
    try {
      const {
        full_name,
        email,
        is_profileVerified,
        is_profileRejected,
        is_spam,
        formStatus,
        transaction_id,
        transaction_at,
        mobile,
        created_at,
        course_code,
        role,
        district,
        batch,
        topUser,
        disabled,
        is_inactive,
        page,
        limit,
        order_by,
        order_in,
      } = req.query;
      console.log("$$$$$$$###@@@", req.query.role);
      const _page = page ? parseInt(page) : 1;
      const _limit = limit ? parseInt(limit) : 20;
      const _skip = (_page - 1) * _limit;
      let sorting = {};
      if (order_by) {
        sorting[order_by] = order_in == "desc" ? -1 : 1;
      } else {
        sorting["_id"] = -1;
      }
      const query = {};
      if (full_name) {
        query.full_name = new RegExp(full_name, "i");
      }
      if (course_code) {
        query.course_code = new RegExp(course_code, "i");
      }
      if (email) {
        query.email = new RegExp(email, "i");
      }
      if (district) {
        query.district = new RegExp(district, "i");
      }
      if (mobile) {
        query.mobile = new RegExp(mobile, "i");
      }
      if (transaction_id) {
        query.transaction_id = new RegExp(transaction_id, "i");
      }
      if (transaction_at) {
        console.log(transaction_at);
        // query.transaction_at = "2023-04-08T11:47:43.961Z"
        const start_date = new Date(transaction_at);
        let end_date = new Date(transaction_at);
        end_date.setHours(23);
        end_date.setMinutes(59);
        end_date.setSeconds(59);
        query.transaction_at = { $gte: start_date, $lte: end_date };
      }
      if (created_at) {
        console.log(created_at);
        // query.created_at = "2023-04-08T11:47:43.961Z"
        const start_date = new Date(created_at);
        let end_date = new Date(created_at);
        end_date.setHours(23);
        end_date.setMinutes(59);
        end_date.setSeconds(59);
        query.created_at = { $gte: start_date, $lte: end_date };
      }
      if (role) {
        query.role = new RegExp(role, "i");
      }
      if (batch) {
        query.batch = mongoose.Types.ObjectId(batch);
      }
      if (is_profileVerified != undefined) {
        query.is_profileVerified = is_profileVerified == "true" ? true : false;
      }
      if (is_profileRejected != undefined) {
        query.is_profileRejected = is_profileRejected == "true" ? true : false;
      }
      if (is_spam != undefined) {
        query.is_spam = is_spam == "true" ? true : false;
      }
      if (formStatus != undefined) {
        query.formStatus = formStatus == "true" ? true : false;
      }
      // if (req.role.name != process.env.SUPER_ADMIN_INITIALS) {
      //     query.topUser = req.user._id
      // } else
      if (topUser) {
        query.topUser = mongoose.Types.ObjectId(topUser);
      }
      query.disabled = disabled && disabled == "true" ? true : false;
      query.is_inactive = is_inactive && is_inactive == "true" ? true : false;
      console.log("#####>>>>>>>", query);
      let result = await Model.aggregate([
        {
          $match: query,
        },
        {
          $project: {
            // _id: 0,
            // full_name: 1,
            // email: 1,
            // mobile: 1,
            // role: 1,
            password: 0,
            // disabled: 1,
            // is_inactive: 1,
            // username: 1
          },
        },
        {
          $sort: sorting,
        },
        {
          $skip: _skip,
        },
        {
          $limit: _limit,
        },

      ]);
      const resultCount = await Model.countDocuments(query);
      // .sort(_sort).skip(_skip).limit(_limit)
      res.json({
        data: result,
        meta: {
          current_page: _page,
          from: _skip + 1,
          last_page: Math.ceil(resultCount / _limit, 10),
          per_page: _limit,
          to: _skip + _limit,
          total: resultCount,
        },
      });
      return;
    } catch (error) {
      next(error);
    }
  },
  batchAllotmentList: async (req, res, next) => {
    try {
      const {
        full_name,
        email,
        is_profileVerified,
        formStatus,
        transaction_id,
        transaction_at,
        mobile,
        created_at,
        cmp_code,
        role,
        batch,
        topUser,
        disabled,
        is_inactive,
        page,
        limit,
        order_by,
        order_in,
      } = req.query;
      const _page = page ? parseInt(page) : 1;
      const _limit = limit ? parseInt(limit) : 20;
      const _skip = (_page - 1) * _limit;
      let sorting = {};
      if (order_by) {
        sorting[order_by] = order_in == "desc" ? -1 : 1;
      } else {
        sorting["_id"] = -1;
      }
      const query = {};
      if (full_name) {
        query.full_name = new RegExp(full_name, "i");
      }
      if (cmp_code) {
        query.cmp_code = cmp_code;
      }
      if (email) {
        query.email = new RegExp(email, "i");
      }
      if (mobile) {
        query.mobile = new RegExp(mobile, "i");
      }
      if (transaction_id) {
        query.transaction_id = new RegExp(transaction_id, "i");
      }
      if (transaction_at) {
        console.log(transaction_at);
        // query.transaction_at = "2023-04-08T11:47:43.961Z"
        const start_date = new Date(transaction_at);
        let end_date = new Date(transaction_at);
        end_date.setHours(11);
        end_date.setMinutes(59);
        end_date.setSeconds(59);
        query.transaction_at = { $gte: start_date, $lte: end_date };
      }
      if (created_at) {
        console.log(created_at);
        // query.created_at = "2023-04-08T11:47:43.961Z"
        const start_date = new Date(created_at);
        let end_date = new Date(created_at);
        end_date.setHours(11);
        end_date.setMinutes(59);
        end_date.setSeconds(59);
        query.created_at = { $gte: start_date, $lte: end_date };
      }
      if (role) {
        query.role = role;
      }

      if (is_profileVerified == 'true') {
        query.is_profileVerified = true;
      } else if (is_profileVerified == 'false') {
        query.is_profileVerified = false;
      }
      if (formStatus != undefined) {
        query.formStatus = formStatus == "true" ? true : false;
      }
      // if (req.role.name != process.env.SUPER_ADMIN_INITIALS) {
      //     query.topUser = req.user._id
      // } else
      if (topUser) {
        query.topUser = mongoose.Types.ObjectId(topUser);
      }
      query.disabled = disabled && disabled == "true" ? true : false;
      query.is_inactive = is_inactive && is_inactive == "true" ? true : false;
      console.log(query);
      let result = await Model.aggregate([
        {
          $match: { batch: { $exists: false }, ...query },
        },
        {
          $project: {
            // _id: 0,
            // full_name: 1,
            // email: 1,
            // mobile: 1,
            // role: 1,
            password: 0,
            // disabled: 1,
            // is_inactive: 1,
            // username: 1
          },
        },
        {
          $sort: sorting,
        },
        {
          $skip: _skip,
        },
        {
          $limit: _limit,
        }

      ]);
      const resultCount = await Model.countDocuments(query);
      // .sort(_sort).skip(_skip).limit(_limit)
      res.json({
        data: result,
        meta: {
          current_page: _page,
          from: _skip + 1,
          last_page: Math.ceil(resultCount / _limit, 10),
          per_page: _limit,
          to: _skip + _limit,
          total: resultCount,
        },
      });
      return;
    } catch (error) {
      next(error);
    }
  },

  count: async (req, res, next) => {
    try {
      const { full_name, email, mobile, role, topUser, disabled, is_inactive } =
        req.query;
      const query = {};
      if (full_name) {
        query.full_name = new RegExp(full_name, "i");
      }
      if (email) {
        query.email = new RegExp(email, "i");
      }
      if (mobile) {
        query.mobile = new RegExp(mobile, "i");
      }
      if (role) {
        query.role = mongoose.Types.ObjectId(role);
      }
      if (topUser) {
        query.topUser = mongoose.Types.ObjectId(topUser);
      }
      query.disabled = disabled && disabled == "true" ? true : false;
      query.is_inactive = is_inactive && is_inactive == "true" ? true : false;
      const result = await Model.countDocuments(query);
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;

      const data = req.body;
      console.log("updateupdateupdateupdateupdateupdateupdateupdate!!!!!!", data);
      if (!id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      if (!data) {
        throw createError.BadRequest("Invalid Parameters");
      }
      data.is_profileRejected = false;
      data.updated_at = Date.now();
      // if (data.transaction_id) {
      //   data.transaction_at = Date.now();
      // }
      const result = await Model.findByIdAndUpdate(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: data }
      );
      console.log("UUUSSEER RESULT", result);
      if (result.mobile && data.is_profileVerified) {
        try {
          const smsProfileVerfy = await smsProfileVerfied(result.mobile);
          console.log("smsProfileVerfy>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", smsProfileVerfy.data);
        } catch (error) {
          console.log(error)
        }
        try {
          const smsOnlineClass = await smsOnlineClassInstruction(result.mobile);

        } catch (error) {

        }
        try {
          const smsOnlineInstruction = await smsTeamsInstruction(result.mobile);

        } catch (error) {

        }
        // console.log("smsProfileVerfied,smsFormAccept ", smsProfileVerfy.data);
      }
      if (result.mobile && data.formStatus) {
        console.log(data.formStatus);
        console.log("FORM SMS CALLED");
        const smsFromFilled = await smsFormFilled(result.mobile);

        console.log("smsReject", smsFromFilled.data);
      }
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },
  updateReject: async (req, res, next) => {
    try {
      const { id } = req.params;

      const data = req.body;
      console.log(data);
      if (!id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      if (!data) {
        throw createError.BadRequest("Invalid Parameters");
      }
      data.is_profileRejected = true
      data.updated_at = Date.now();
      if (data.transaction_id) {
        data.transaction_at = Date.now();
      }
      const result = await Model.findByIdAndUpdate(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: data }
      );
      if (result.mobile) {
        console.log(data.formStatus);
        console.log("REJECT SMS CALLED");
        const smsProfileReject = await smsReject(result.mobile);

        console.log("smsReject", smsProfileReject.data);
      }
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },
  updateBatch: async (req, res, next) => {
    try {
      const { id } = req.params;
      try {
        if (!id) {
          throw createError.BadRequest("id Invalid Parameters");
        }
        const data = {
          batch: mongoose.Types.ObjectId(id),
        };
        console.log("DDDAAATATA", data);
        if (!data) {
          throw createError.BadRequest("data Invalid Parameters");
        }
        const ids = req.body.batch;
        console.log(req.body.batch);
        if (!ids) {
          throw createError.BadRequest("ids Invalid Parameters");
        }
        if (!ids.length) {
          throw createError.BadRequest("ids Invalid Parameters");
        }
        const batchData = await BatchModel.findOne({ _id: mongoose.Types.ObjectId(id) })
        console.log(batchData);

        for (const stdId of ids) {
          const result = await Model.findOne({ _id: mongoose.Types.ObjectId(stdId) }, { mobile: 1 })
          // try {
          //   const smsBatch = await smsOnlineClass(result.mobile, batchData.startDate, batchData.endDate);

          //   // console.log("smsBatch", smsBatch.data);

          // } catch (error) {
          //   console.log(error);
          // }

        }
        const matchQueries = {
          _id: {
            $in: ids.map((o) => mongoose.Types.ObjectId(o)),
          },
        };
        const updateQueries = {
          $set: data,
        };
        console.log(matchQueries, updateQueries);
        const result = await Model.updateMany(matchQueries, updateQueries);
        res.json(result);
        return;
      } catch (error) {
        // next(error)
        if (error.isJoi === true) error.status = 422;
        return res.status(error.status).send({
          error: {
            status: error.status || 500,
            message: error.message,
          },
        });
      }
    } catch (error) {
      next(error);
    }
  },
  removeBatch: async (req, res, next) => {
    try {
      const { student_id } = req.params;
      const data = req.body.data;

      const result = await Model.updateOne(
        { _id: student_id },
        { batch: "   " }
      );
      // const student = await Model.findById({_id: student_id});
      // student.batch = "";
      // student.save();
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const deleted_at = Date.now();
      const result = await Model.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { is_inactive: true, deleted_at } }
      );
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },
  restore: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const dataToBeDeleted = await Model.findOne(
        { _id: mongoose.Types.ObjectId(id) },
        { email: 1, mobile: 1 }
      );
      if (!dataToBeDeleted) {
        throw createError.NotFound(`${ModelName} Not Found`);
      }
      const dataWithEmailExists = await Model.findOne({
        email: dataToBeDeleted.email,
        is_inactive: false,
      });
      if (dataWithEmailExists) {
        throw createError.Conflict(
          `${ModelName} with this email already exists`
        );
      }
      const dataWithMobileExists = await Model.findOne({
        mobile: dataToBeDeleted.mobile,
        is_inactive: false,
      });
      if (dataWithMobileExists) {
        throw createError.Conflict(
          `${ModelName} with this mobile already exists`
        );
      }
      const restored_at = Date.now();
      const result = await Model.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { is_inactive: false, restored_at } }
      );
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  }
};

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