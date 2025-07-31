const mongoose = require("mongoose");

const ExamReportSchema = new mongoose.Schema({
  Student_id: {
    type: mongoose.Types.ObjectId,
  },
  Student_name: {
    type: String,
  },
  StudentMarks: {
    type: Number,
  },
  CorrectAnswers: {
    type: Number,
  },
  IncorrectAnswers: {
    type: Number,
  },
  Answered: {
    type: Number,
  },
  TotalSeen: {
    type: Number,
  },
  TotalMarks: {
    type: Number,
  },
  Result: {
    type: String,
  },
  Exam_id: {
    type: mongoose.Types.ObjectId,
  },
  Batch_id: {
    type: mongoose.Types.ObjectId,
  },
  Absent: {
    type: Boolean,
  },
  grade: {
    type: String,
  },
  certificatePath: {
    type: String,
  },
  created_on: {
    type: Date,
  },
});

const ExamReport = mongoose.model("examReport", ExamReportSchema);

module.exports = ExamReport;
