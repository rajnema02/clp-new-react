const Model = require('../Models/Course.model');
const createError = require('http-errors');
const mongoose = require('mongoose');
const ModelName = 'Course';
// const { upload } = require('./../Helpers/helper_functions');
const {upload} = require('../Helpers/Upload')

module.exports = {
createCourse: async (req, res) => {
  try {
    const { 
      course_name, 
      course_code, 
      course_type, 
      course_duration, 
      description, 
      fees, 
      course_eligibilty 
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Course file is required" });
    }

    const newCourse = new Model({
      course_name,
      course_code,
      course_type,
      course_duration,
      description,
      course_eligibilty,
      fees,
      course_content: req.file.filename, // Store uploaded file name
    });

    await newCourse.save();
    res.status(201).json({ message: "Course created successfully", course: newCourse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
},


    get: async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                throw createError.BadRequest('Invalid ID');
            }
            const result = await Model.findById(id);
            if (!result) throw createError.NotFound(`No ${ModelName} Found`);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    getByTitle: async (req, res, next) => {
        try {
            const { title } = req.params;
            if (!title) throw createError.BadRequest('Invalid title');
            const result = await Model.findOne({ course_name: title, is_inactive: false });
            if (!result) throw createError.NotFound(`No ${ModelName} Found`);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    getBySlug: async (req, res, next) => {
        try {
            const { slug } = req.params;
            if (!slug) throw createError.BadRequest('Invalid slug');
            const result = await Model.findOne({ slug, is_inactive: false });
            if (!result) throw createError.NotFound(`No ${ModelName} Found`);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    list: async (req, res, next) => {
        try {
            const { course_type, course_name, is_inactive } = req.query;
            const query = {};
            if (course_type) query.course_type = new RegExp(course_type, 'i');
            if (course_name) query.course_name = new RegExp(course_name, 'i');
            if (is_inactive) query.is_inactive = is_inactive === 'true';

            const result = await Model.find(query);
            const resultCount = await Model.countDocuments(query);

            res.json({ data: result, total: resultCount });
        } catch (error) {
            next(error);
        }
    },

    count: async (req, res, next) => {
        try {
            const { course_name, is_inactive } = req.query;
            const query = {};
            if (course_name) query.course_name = new RegExp(course_name, 'i');
            if (is_inactive) query.is_inactive = is_inactive === 'true';
            const result = await Model.countDocuments(query);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            upload(req, res, async (err) => {
                if (err) return res.status(501).json({ error: err });
                const { id } = req.params;
                if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                    throw createError.BadRequest('Invalid ID');
                }
                const data = req.body;
                data.updated_at = Date.now();
                const result = await Model.updateOne({ _id: id }, { $set: data });
                res.json(result);
            });
        } catch (error) {
            next(error);
        }
    },

    updateByTitle: async (req, res, next) => {
        try {
            const { title } = req.params;
            if (!title) throw createError.BadRequest('Invalid title');
            const data = req.body;
            data.updated_at = Date.now();
            const result = await Model.updateOne({ course_name: title, is_inactive: false }, { $set: data });
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

   deleteCourse: async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCourse = await Model.findByIdAndDelete(id); // FIXED

    if (!deletedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
},

    restore: async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                throw createError.BadRequest('Invalid ID');
            }
            const course = await Model.findById(id);
            if (!course) throw createError.NotFound(`${ModelName} Not Found`);

            const exists = await Model.findOne({ course_name: course.course_name, is_inactive: false });
            if (exists) throw createError.Conflict(`${ModelName} already exists`);

            const result = await Model.updateOne({ _id: id }, { $set: { is_inactive: false, restored_at: Date.now() } });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
};
