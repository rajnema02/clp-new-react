const Model = require("../Models/Batch.model");
const StudentModel = require("../Models/Auth.model");
const createError = require("http-errors");
const mongoose = require("mongoose");
const ModelName = "Batch";
const { upload } = require("./../Helpers/helper_functions");

module.exports = {
  create: async (req, res, next) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return res.status(501).json({ error: err });
        }
        const data = req.body;
        console.log(data);
        const dataExists = await Model.findOne({
          batch_name: data.batch_name,
          is_inactive: false,
        });
        if (dataExists) {
          throw createError.Conflict(`${ModelName} already exists`);
        }
        data.created_at = Date.now();
        data.is_inactive = false;

        const newData = new Model(data);
        const result = await newData.save();
        res.json(newData);
      });
    } catch (error) {
      next(error);
    }
  },

  get: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError.BadRequest("Invalid batch ID");
      }
      const batch = await Model.findById(new mongoose.Types.ObjectId(id));
      if (!batch) {
        throw createError.NotFound("Batch not found");
      }
      res.json(batch);
    } catch (error) {
      next(error);
    }
  },

  getBatchesName: async (req, res, next) => {
    try {
      console.log("getBatchesName called");
      const batchIdArray = req.body;
      const batchNameArray = [];

      for (let id of batchIdArray) {
        const batch = await Model.findOne({ _id: mongoose.Types.ObjectId(id) });
        batchNameArray.push(batch.batch_name);
      }

      res.json(batchNameArray);
    } catch (error) {
      next(error);
    }
  },

  getByTitle: async (req, res, next) => {
    try {
      const { title } = req.params;
      if (!title) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Model.findOne({ title, is_inactive: false });
      if (!result) {
        throw createError.NotFound(`No ${ModelName} Found`);
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getBySlug: async (req, res, next) => {
    try {
      const { slug } = req.params;
      if (!slug) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Model.findOne({ slug, is_inactive: false });
      if (!result) {
        throw createError.NotFound(`No ${ModelName} Found`);
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // FIXED: Using req.query instead of req.body for GET requests
  list: async (req, res) => {
    try {
      const { 
        course_name, 
        course_code, 
        course_type, 
        course_duration, 
        description, 
        course_content, 
        course_fees, 
        created_by 
      } = req.query; // ✅ Changed from req.body to req.query

      // Build filter dynamically
      const filter = {};
      if (course_name) filter.course_name = course_name;
      if (course_code) filter.course_code = course_code;
      if (course_type) filter.course_type = course_type;
      if (course_duration) filter.course_duration = course_duration;
      if (description) filter.description = description;
      if (course_content) filter.course_content = course_content;
      if (course_fees) filter.course_fees = course_fees;
      if (created_by) filter.created_by = new mongoose.Types.ObjectId(created_by);

      const results = await Model.find(filter);
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  count: async (req, res, next) => {
    try {
      const { title, disabled, is_inactive, page, limit, sort } = req.query;
      const _page = page ? parseInt(page) : 1;
      const _limit = limit ? parseInt(limit) : 20;
      const _skip = (_page - 1) * _limit;
      const _sort = sort ? sort : "+title";
      const query = {};
      if (title) {
        query.title = new RegExp(title, "i");
      }
      query.disabled = disabled && disabled == "true" ? true : false;
      query.is_inactive = is_inactive && is_inactive == "true" ? true : false;
      const result = await Model.countDocuments(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res) => {
    try {
      const batchId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(batchId)) {
        return res.status(400).json({ error: "Invalid batch ID" });
      }

      const updatedData = { ...req.body };
      const updatedBatch = await Model.findByIdAndUpdate(batchId, updatedData, {
        new: true,
        runValidators: true,
      });

      if (!updatedBatch) {
        return res.status(404).json({ error: "Batch not found" });
      }

      res.status(200).json({ message: "Batch updated successfully", data: updatedBatch });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateByTitle: async (req, res, next) => {
    try {
      const { title } = req.params;
      const data = req.body;
      if (!title) {
        throw createError.BadRequest("Invalid Parameters");
      }
      data.updated_at = Date.now();
      const result = await Model.updateOne(
        { title, is_inactive: false },
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
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError.BadRequest("Invalid batch ID");
      }

      // First, remove batch from students
      await StudentModel.updateMany(
        { batch: new mongoose.Types.ObjectId(id) },
        { $unset: { batch: "" } }
      );

      // Then, permanently delete batch
      const result = await Model.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

      if (result.deletedCount === 0) {
        throw createError.NotFound("Batch not found or already deleted");
      }

      res.json({ message: "Batch deleted permanently" });
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
        { name: 1 }
      );
      if (!dataToBeDeleted) {
        throw createError.NotFound(`${ModelName} Not Found`);
      }
      const dataExists = await Model.findOne({
        name: dataToBeDeleted.name,
        is_inactive: false,
      });
      if (dataExists) {
        throw createError.Conflict(`${ModelName} already exists`);
      }
      const restored_at = Date.now();
      const result = await Model.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { is_inactive: false, restored_at } }
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
