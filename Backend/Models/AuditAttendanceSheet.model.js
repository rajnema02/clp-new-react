const mongoose = require("mongoose");

const AuditAttendanceSheetSchema = new mongoose.Schema({
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
  // question_id: {
  //   type: mongoose.Types.ObjectId,
  // },
  seen: {
    type: Boolean,
  },
  question: {
    type: String,
  },
  reportStatus: {
    type: String,
    default: ''
  },
  reportPath: {
    type: String,
    default: ''
  },
  // option_3: {
  //   type: String
  // },
  // option_4: {
  //   type: String
  // },
  marks: {
    type: String
  },
  userAnswer: {
    type: String,
  },
  status: {
    type: String,
  },
  attendance: {
    type: String,
    default: 'absent'
  },

  created_at: {
    type: Date,
    default: Date.now()
  },
  updated_at: {
    type: Date
  },
  ip_address: {
    type: String
  }
},
  { timestamps: true }
);

const AuditAttendanceSheet = mongoose.model("AuditAttendanceSheet", AuditAttendanceSheetSchema);
module.exports = AuditAttendanceSheet;
