const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
    exam_name: {
        type: String
    },
    exam_code: {
        type: String
    },
    course_type: {
        type: String
    },
    course_name: {
        type: String
    },
    exam_date: {
        type: Date
    },
    exam_time: {
        type: String
    },
    endTime: {
        type: Date
    },
    exam_duration: {
        type: Number
    },
    parent_exam: {
        type: mongoose.Types.ObjectId
    },
    batch_id: {
        type: Array,
        default: []
    },
    failed_student_ids: {
        type: Array,
        default: []
    },
    exam_duration: {
        type: String
    },
    exam_attempt: {
        type: Number
    },
    is_inactive: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date
    },
    questions: {
        type: mongoose.Types.ObjectId
    }
});

const Exam = mongoose.model('Exam', ExamSchema);
module.exports = Exam;