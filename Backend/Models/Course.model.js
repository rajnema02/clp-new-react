const mongoose = require('mongoose');

const CourseSchema = mongoose.Schema({
    
    course_name: {
        type: String,
        trim : true
    },

    course_code: {
        type: String,
        trim : true
    },
    course_type: {
        type: String
    },
    course_duration: {
        type: String,
        trim : true
    },
    description: {
        type: String,
        trim : true
    },

    course_content: {
        type: String,
        trim : true
    },
    course_eligibilty:{
        type:String,
        trim: true
    },
    fees: {
        type: Number,
        trim : true
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



const Counter = module.exports = mongoose.model('Course', CourseSchema);