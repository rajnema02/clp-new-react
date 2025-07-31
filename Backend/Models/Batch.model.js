const mongoose = require('mongoose')

const BatchSchema = new mongoose.Schema({

    batch_name: {
        type: String,
        trim: true,
        require: true
    },
    course_name: {
        type: String
    },
    course_type: {
        type: String
    },
    course_code: {
        type: String
    },
    
    disclaimer: {
        type: String,
    },
 
    days: {
        type: Array
    },
    startDate: {
        type: String
    },

    endDate: {
        type: String
    },

    startTime: {
        type: String
    },

    endTime: {
        type: String
    },

    is_exam:{
        type: Boolean
    },
    isAuditExam:{
        type: Boolean
    },
    total_no_of_questions: {
        type: Number
    },
    percent_of_course_questions: {
        type: Number
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date
    },

    is_inactive: {
        type: Boolean,
        default: false
    },

})

const Batch = mongoose.model('batch', BatchSchema)

module.exports = Batch