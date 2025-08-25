const Model = require("../Models/Question.model");
const createError = require("http-errors");
const mongoose = require("mongoose");
const XLSX = require("xlsx");

module.exports = {
  create: async (req, res, next) => {
    try {
      const data = req.body;
      const dataExists = await Model.findOne({
        question: data.question,
        is_inactive: false,
      });
      if (dataExists) {
        throw createError.Conflict("Question already exists!");
      }
      data.created_at = new Date();
      data.is_inactive = false;
      const newData = new Model(data);
      const result = await newData.save();
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  uploadQuestions: async (req, res, next) => {
    try {
      // Old code commented out
    } catch (error) {
      next(error);
    }
  },

   getByCourse: async (req, res, next) => {
    try {
      const { course_type, course_name, exam_id, user_id } = req.query;

      if (!course_type || !course_name) {
        throw createError.BadRequest("Course type and course name are required");
      }

      const query = {
        course_type,
        course_name,
        is_inactive: false,
      };

      if (exam_id) query.exam_id = exam_id;
      if (user_id) query.user_id = user_id;

      const result = await Model.find(query).sort({ created_at: -1 });

      if (!result || result.length === 0) {
        throw createError.NotFound("No questions found for this course");
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  get: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) throw createError.BadRequest("Invalid Parameters");

      const result = await Model.findOne({ _id: new mongoose.Types.ObjectId(id) });
      if (!result) throw createError.NotFound("Not Found");

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  list: async (req, res, next) => {
    try {
      const { is_inactive, page, limit, order_by, order_in } = req.query;
      const _page = page ? parseInt(page) : 1;
      const _limit = limit ? parseInt(limit) : 20;
      const _skip = (_page - 1) * _limit;

      let sorting = {};
      if (order_by) {
        sorting[order_by] = order_in === "desc" ? -1 : 1;
      } else {
        sorting["_id"] = -1;
      }

      const query = { is_inactive: is_inactive === "true" };

      const result = await Model.aggregate([
        { $match: query },
        { $sort: sorting },
        { $skip: _skip },
        { $limit: _limit },
      ]);

      const resultCount = await Model.countDocuments(query);

      res.json({
        data: result,
        meta: {
          current_page: _page,
          from: _skip + 1,
          last_page: Math.ceil(resultCount / _limit),
          per_page: _limit,
          to: Math.min(_skip + _limit, resultCount),
          total: resultCount,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      if (!id || !data) throw createError.BadRequest("Invalid Parameters");

      if (data.marks != null) data.marks = Number(data.marks);
      if (data.number_of_options != null) data.number_of_options = Number(data.number_of_options);

      data.updated_at = new Date();

      const result = await Model.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: data }
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) throw createError.BadRequest("Invalid Parameters");

      const result = await Model.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: { is_inactive: true, deleted_at: new Date() } }
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
