const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    question:{
        type: String,
        // required: true
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
    option_5: {
        type: String
    },
    option_6: {
        type: String
    },
    option_7: {
        type: String
    },
    // regional_option_1: {
    //     type: String
    // },
    // regional_option_2: {
    //     type: String
    // },
    // regional_option_3: {
    //     type: String
    // },
    // regional_option_4: {
    //     type: String
    // },
    // regional_option_5: {
    //     type: String
    // },
    // regional_option_6: {
    //     type: String
    // },
    // regional_option_7: {
    //     type: String
    // },
    correct_option: {
        type: String,
        // required: true
    },
    correct_answer: {
        type: String,
        // required: true
    },
    // regional_correct_answer: {
    //     type: String,
    //    // required: true
    // },
    number_of_options: {
        type: Number,
        // required: true
    },
    difficulty_level: {
        type: String
    },
    course_name: {
        type: String
    },
    marks: {
        type: Number,
        required: true
    },
    course_type: {
        type: String,
        // required: true
    },
    regional_language: {
        type: String
    },
    is_inactive: {
        type: Boolean,
        default: false,

    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    },
    deleted_at: {
        type: Date
    },
    created_by: {
        type: mongoose.Types.ObjectId
    },
    updated_by: {
        type: mongoose.Types.ObjectId
    }

});

const Question = mongoose.model('questions', QuestionSchema);
module.exports= Question;