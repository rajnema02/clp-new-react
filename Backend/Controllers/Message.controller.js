const Model = require("../Models/Message.model");
const User = require("../Models/Auth.model");
const createError = require("http-errors");
const mongoose = require("mongoose");

module.exports = {
  create: async (req, res, next) => {
        try {
            const data = req.body;

            // Require file
            if (!req.file) {
                return res.status(400).json({ error: "Message file is required" });
            }

            // Check duplicate message
            const dataExists = await Model.findOne({
                message_description: data.message_description,
                is_inactive: false,
            });

            if (dataExists) {
                throw createError.Conflict(`Data already exists`);
            } else {
                data.created_at = Date.now();
                data.is_inactive = false;
                data.created_by = req.user._id;
                data.created_on = Date.now();

                // Save uploaded file name
                data.message_file = req.file.filename;

                const newData = new Model(data);
                const result = await newData.save();

                res.status(201).json({
                    message: "Message created successfully",
                    data: result
                });
                return;
            }
        } catch (error) {
            next(error);
        }
    },
  get: async (req, res, next) => {
    try {
      const batchId = req.params.id;
      const messages = await Model.find({
        batch_id: mongoose.Types.ObjectId(batchId),
        disable: false,
      });
      if (messages) {
        res.json(messages);
      } else {
        res.json({ message: "No messages found for this batch" });
      }
    } catch (error) {
      next(error);
    }
  },
  list: async (req, res, next) => {
    try {
      const { batch_id, student_id, alert_message, limit, page, order_by,
        order_in, } = req.query;
      const _page = page ? parseInt(page) : 1;
      const _limit = limit ? parseInt(limit) : 20;
      const _skip = (_page - 1) * _limit;
      let sorting = {};
      if (order_by) {
        sorting[order_by] = order_in == "desc" ? -1 : 1;
      } else {
        sorting["_id"] = -1;
      }
      query = {};
      if (batch_id) {
        query.batch_id = batch_id;
      }
      if (student_id) {
        query.student_id = student_id;
      }
      if (alert_message) {
        query.alert_message = alert_message;
      }
      query.disable = false;



      const messages = await Model.aggregate([
        {
          $lookup: {
            from: "batches",
            localField: "batch_id",
            foreignField: "_id",
            as: "batchObject",
          },
        },
        {
          $unwind: {
            path: "$batchObject",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            message_description: 1,
            updated_at: 1,
            "batchObject.batch_name": 1,
            created_on: 1,
            disable: 1,
          },
        },
        // {
        //   $sort: sorting,
        // },
        // {
        //   $skip: _skip,
        // },
        // {
        //   $limit: _limit,
        // },
      ]);

      const resultCount = await Model.countDocuments(query);

      if (messages) {
        res.json({
          data: messages,
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
      } else {
        res.json({ message: "No messages found !" });
      }
    } catch (error) {
      next(error);
    }
  },
  getStudentMessagesByAdmin: async (req, res, next) => {
    try {
      const { batch_id, limit, page, order_by,
        order_in, } = req.query;
      const _page = page ? parseInt(page) : 1;
      const _limit = limit ? parseInt(limit) : 20;
      const _skip = (_page - 1) * _limit;
      let sorting = {};
      if (order_by) {
        sorting[order_by] = order_in == "desc" ? -1 : 1;
      } else {
        sorting["_id"] = -1;
      }
      query = {};
      if (batch_id) {
        query.batch_id = mongoose.Types.ObjectId(batch_id);
      }

      // const students = await User.find({ batch: { $in: [batch_id] } });
      // console.log("Students>>>>>", students.length);
      query.disable = false;
      // if (student_id) {
      //   query.student_id = mongoose.Types.ObjectId(student_id);
      // }
      // console.log("StudentBatchIIDD>>", batch_id);
      console.log(query);

      const stuMessages = await Model.aggregate([
        {
          $match: query
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
      // console.log(stuMessages);
      if (stuMessages) {
        const resultCount = await Model.countDocuments(query);
        console.log(resultCount);
        res.json({
          success: true,
          data: stuMessages,
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
        // res.json({ status: 200, success: true, studentMessages: stuMessages });
      } else {
        res.json({ status: 404, success: false, message: "No messages" });
        return;
      }
    } catch (error) {
      next(error);
    }
  },
  getCommonMessages: async (req, res, next) => {
    try {
      const { batch_id, limit, page, alert_message, order_by, is_inactive, disable,
        order_in, } = req.query;
      const _page = page ? parseInt(page) : 1;
      const _limit = limit ? parseInt(limit) : 5;
      const _skip = (_page - 1) * _limit;
      let sorting = {};
      if (order_by) {
        sorting[order_by] = order_in == "desc" ? -1 : 1;
      } else {
        sorting["_id"] = -1;
      }
      query = {};
      if (batch_id) {
        query.batch_id = mongoose.Types.ObjectId(batch_id);
      }
      query.created_by= { $exists: true };
      // const students = await User.find({ batch: { $in: [batch_id] } });
      // console.log("Students>>>>>", students.length);
      query.disable = (disable && disable == 'true') ? true : false
      query.is_inactive = (is_inactive && is_inactive == 'true') ? true : false
      if (alert_message) {

        // query.alert_message = { $exists: true };
        query.alert_message = (alert_message && alert_message == 'true') ? true : false;
      }
      console.log(query);

      let commonMessages = await Model.aggregate([
        {
          $match: query
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
      // console.log(stuMessages);
      if (commonMessages) {
        const resultCount = await Model.countDocuments(query);
        console.log("commonMessages Count", commonMessages.length);
        res.json({
          success: true,
          data: commonMessages,
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
        // res.json({ status: 200, success: true, studentMessages: stuMessages });
      } else {
        res.json({ status: 404, success: false, message: "No messages" });
        return;
      }
    } catch (error) {
      next(error);
    }
  },
  getStudentMessages: async (req, res, next) => {
    try {
      const { batch_id, student_id, limit, page, order_by,
        order_in, } = req.query;
      const _page = page ? parseInt(page) : 1;
      const _limit = limit ? parseInt(limit) : 20;
      const _skip = (_page - 1) * _limit;
      let sorting = {};
      if (order_by) {
        sorting[order_by] = order_in == "desc" ? -1 : 1;
      } else {
        sorting["_id"] = -1;
      }
      query = {};
      if (batch_id) {
        query.batch_id = mongoose.Types.ObjectId(batch_id);
      }

      // const students = await User.find({ batch: { $in: [batch_id] } });
      // console.log("Students>>>>>", students.length);
      query.disable = false;
      if (student_id) {
        query.student_id = mongoose.Types.ObjectId(student_id);
      }
      // console.log("StudentBatchIIDD>>", batch_id);
      // console.log(query);

      const stuMessages = await Model.aggregate([
        {
          $match: query
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
      // console.log(stuMessages);
      if (stuMessages) {
        const resultCount = await Model.countDocuments(query);
        console.log(resultCount);
        res.json({
          success: true,
          data: stuMessages,
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
        // res.json({ status: 200, success: true, studentMessages: stuMessages });
      } else {
        res.json({ status: 404, success: false, message: "No messages" });
        return;
      }
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;

      const data = req.body;
      data.updated_at = Date.now();
      const result = await Model.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: data }
      );
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },
  disableMessage: async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const result = await Model.findByIdAndUpdate(
      id,
      {
        $set: {
          disable: true,
          updated_at: Date.now()
        }
      },
      { new: true } // return updated document
    );

    if (!result) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
};
  