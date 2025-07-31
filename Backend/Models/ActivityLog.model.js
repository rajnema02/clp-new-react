const mongoose = require('mongoose')

const ActivityLogSchema = new mongoose.Schema({
    
    user_id: {
        type: mongoose.Types.ObjectId
    },
    user_name: {
        type: String
    },
    log_time: {
        type: Date,
        default: Date.now()
    },
    enrollment_no: {
        type: Number
    },
    exam_id: {
        type: mongoose.Types.ObjectId
    },
    exam_name: {
        type: String
    },
    question_id: {
        type: mongoose.Types.ObjectId
    },
    section: {
        type: String
    },
    status: {
        type: String
    },
    answered: {
        type: Boolean
    },
    answer: {
        type: String
    }
})

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
module.exports = ActivityLog