const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
    batch_name: {
        type: String,
        trim: true,
        required: true // ✅ was `require`
    },
    course_name: String,
    course_type: String,
    course_code: String,
    disclaimer: String,
    days: Array,
    startDate: String,
    endDate: String,
    startTime: String,
    endTime: String,
    is_exam: Boolean,
    isAuditExam: Boolean,
    total_no_of_questions: Number,
    percent_of_course_questions: Number,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: Date,
    is_inactive: {
        type: Boolean,
        default: false
    },
});

module.exports = mongoose.model('Batch', BatchSchema);
