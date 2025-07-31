const mongoose = require('mongoose');

const CourseModuleSchema = mongoose.Schema({

    course_type: {
        type: String
    },
    course_name: {
        type: String,
        trim: true
    },
    module_name: {
        type: String,
        trim: true
    },

    module_code: {
        type: String,
        trim: true
    },
    module_duration: {
        type: String,
        trim: true
    },
    module_fee: {
        type: Number,
        trim: true
    },
    module_examination_fee: {
        type: Number,
        trim: true
    },
    is_inactive: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date
    }
});



const Counter = module.exports = mongoose.model('CourseModule', CourseModuleSchema);