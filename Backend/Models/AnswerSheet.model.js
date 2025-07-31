const mongoose = require("mongoose");

const AnswerSheetSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
  },
  user_name: {
    type: String,
  },

  enrollment_no: {
    type: Number,
  },
  exam_id: {
    type: mongoose.Types.ObjectId,
  },
  batch_id: {
    type: mongoose.Types.ObjectId,
  },
  exam_name: {
    type: String,
  },
  question_id: {
    type: mongoose.Types.ObjectId,
  },
  seen: {
    type: Boolean,
  },
  question: {
    type: String,
  },
  option_1: {
    type: String
  },
  option_2: {
    type: String
  },
  option_3: {
    type: String
  },
  option_4: {
    type: String
  },
  marks: {
    type: String
  },
  userAnswer: {
    type: String,
  },
  status: {
    type: String,
  },

  created_at: {
    type: Date,
  },
  updated_at: {
    type: Date
  },
  ip_address: {
    type: String
  }
});

const AnswerSheet = mongoose.model("AnswerSheet", AnswerSheetSchema);
module.exports = AnswerSheet;
