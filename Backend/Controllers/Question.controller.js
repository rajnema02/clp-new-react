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
      data.created_at = Date.now();
      data.is_inactive = false;
      const newData = new Model(data);
      const result = await newData.save();
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },
  uploadQuestions: async (req, res, next) => {
    try {



      //-------------------Old Program ------------------------
      // const workbook = XLSX.utils.book_new();
      // const worksheet = XLSX.utils.json_to_sheet([]);
      // XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      //   console.log(req.body);
      // const upload = new Model({ data: req.body.data });
      // console.log('this is upload',upload);
      // upload.save((error, upload) => {
      //   if (error) {
      //     console.log("Error saving upload to database:", error);
      //     return res
      //       .status(500)
      //       .send({ message: "Error saving upload to database" });
      //   }
      //   // console.log(upload.data);
      //   const data = upload.data.map((row) => ({ ...row }));
      //   XLSX.utils.sheet_add_json(worksheet, data, {
      //     origin: "A1",
      //     header: [],
      //   });

      //   const csv = parse(data);
      //   const buffer = XLSX.write(workbook, {
      //     bookType: "xlsx",
      //     type: "buffer",
      //   });

      //   res.set("Content-Disposition", "attachment; filename=result.xlsx");
      //   res.send(buffer);
      // });
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
        throw createError.NotFound(`Not Found`);
      }
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },
  list: async (req, res, next) => {
    try {
      // const result = await Model.find();
      // if (!result) {
      //   throw createError.NotFound("Not found!");
      // }
      // res.json(result);
      // return;
      const {
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
      query.is_inactive = is_inactive && is_inactive == "true" ? true : false;
      console.log(query);
      let result = await Model.aggregate([
        {
          $match: query,
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
  update: async (req, res, next) => {
    const id = req.params.id;

    const data = req.body;
    if (!id) {
      throw createError.BadRequest("Invalid Parameters");
    }
    if (!data) {
      throw createError.BadRequest("Invalid Parameters");
    }
    data.updated_at = Date.now();
    const result = await Model.updateOne(
      { _id: mongoose.Types.ObjectId(id) },
      { $set: data }
    );
    res.json(result);
    return;
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      console.log(id);
      if (!id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const deleted_at = Date.now();
      const result = await Model.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { is_inactive: true } }
      );
      console.log(result);
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },
};
